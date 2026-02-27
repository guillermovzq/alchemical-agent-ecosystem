import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

// Repository root — two levels up from apps/alchemical-dashboard (Next.js process.cwd())
const REPO_ROOT = path.resolve(process.cwd(), "../..");

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get("service") || "velktharion";
  const lines = Math.max(1, Math.min(200, Number(req.nextUrl.searchParams.get("lines") || "50")));

  try {
    const { stdout } = await execFileAsync(
      "docker",
      ["compose", "logs", "--tail", String(lines), service],
      { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 },
    );
    return NextResponse.json({ service, logs: stdout.split("\n").slice(-lines) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "logs unavailable";
    return NextResponse.json({ service, logs: [], error: message }, { status: 500 });
  }
}
