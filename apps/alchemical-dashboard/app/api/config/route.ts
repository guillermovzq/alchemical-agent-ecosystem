import { NextRequest, NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DEFAULT_CONFIG, type DashboardConfig } from "../../../lib/config";
import { AGENTS, CORE_SERVICES } from "../../../lib/agents";

const root = join(process.cwd(), "../..");
const runtimeDir = join(root, ".runtime");
const configPath = join(runtimeDir, "dashboard.config.json");

/** Services that are valid values for `defaultLogService`. */
const KNOWN_LOG_SERVICES = new Set<string>([
  ...AGENTS.map((a) => a.name),
  ...CORE_SERVICES,
]);

function sanitize(input: Partial<DashboardConfig>): DashboardConfig {
  const rawService = String(input.defaultLogService ?? DEFAULT_CONFIG.defaultLogService);
  const defaultLogService = KNOWN_LOG_SERVICES.has(rawService)
    ? rawService
    : DEFAULT_CONFIG.defaultLogService;

  return {
    agentPollMs: Math.max(1000, Math.min(60000, Number(input.agentPollMs ?? DEFAULT_CONFIG.agentPollMs))),
    logsPollMs: Math.max(1000, Math.min(60000, Number(input.logsPollMs ?? DEFAULT_CONFIG.logsPollMs))),
    logsLines: Math.max(10, Math.min(200, Number(input.logsLines ?? DEFAULT_CONFIG.logsLines))),
    defaultLogService,
    // kiloApiConfigured is server-side only — always derive from env, never from client input
    kiloApiConfigured: Boolean(process.env.KILO_API_KEY),
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const data = await readFile(configPath, "utf8");
    const parsed = JSON.parse(data) as Partial<DashboardConfig>;
    return NextResponse.json({ config: sanitize(parsed) });
  } catch {
    return NextResponse.json({ config: sanitize({}) });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  // --- Auth check ---
  const secret = process.env.DASHBOARD_SECRET;
  if (secret) {
    const authHeader = req.headers.get("Authorization") ?? "";
    const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Partial<DashboardConfig>;
    const config = sanitize(body);
    await mkdir(runtimeDir, { recursive: true });
    await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
    return NextResponse.json({ ok: true, config });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
