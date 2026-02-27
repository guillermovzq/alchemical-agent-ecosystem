import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { AGENTS, CORE_SERVICES } from "../../../lib/agents";

const execFileAsync = promisify(execFile);

/** Allowed agent service names (from compose). */
const allowedAgents = new Set(AGENTS.map((a) => a.name));

/** Allowed core infrastructure services. */
const allowedCore = new Set<string>(CORE_SERVICES);

/** Union of all services that may be controlled via this endpoint. */
const ALLOWED_SERVICES = new Set([...allowedAgents, ...allowedCore]);

// ---------------------------------------------------------------------------
// In-memory rate limiter: max 10 control operations per minute per process
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
let rlWindowStart = Date.now();
let rlCount = 0;

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - rlWindowStart > RATE_LIMIT_WINDOW_MS) {
    rlWindowStart = now;
    rlCount = 0;
  }
  if (rlCount >= RATE_LIMIT_MAX) return false;
  rlCount++;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // --- Internal auth check ---
  const secret = process.env.DASHBOARD_SECRET;
  if (secret) {
    const authHeader = req.headers.get("Authorization") ?? "";
    const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // --- Rate limit ---
  if (!checkRateLimit()) {
    return NextResponse.json({ error: "Rate limit exceeded (10 ops/min)" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { service?: unknown; command?: unknown };
  const { service, command } = body;

  if (typeof service !== "string" || !ALLOWED_SERVICES.has(service)) {
    return NextResponse.json({ error: "Service not allowed" }, { status: 400 });
  }
  if (!["start", "stop", "restart"].includes(String(command))) {
    return NextResponse.json({ error: "Invalid command" }, { status: 400 });
  }

  try {
    const cwd = path.resolve(process.cwd(), "..", "..");
    const args = ["compose", String(command), service];
    const { stdout, stderr } = await execFileAsync("docker", args, { cwd });
    return NextResponse.json({ ok: true, stdout, stderr });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
