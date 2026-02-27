import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function pct(s: string | undefined) {
  if (!s) return 0;
  return Number(String(s).replace("%", "")) || 0;
}

async function detectGpuUsage(): Promise<number> {
  try {
    const { stdout } = await execFileAsync("nvidia-smi", ["--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"]);
    const vals = stdout
      .trim()
      .split("\n")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const { stdout } = await execFileAsync("docker", ["stats", "--no-stream", "--format", "{{json .}}"], { cwd: process.cwd() + "/../.." });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const rows = lines.map((l) => JSON.parse(l)) as Array<{ CPUPerc?: string; MemPerc?: string }>;
    const cpu = rows.length ? rows.reduce((a, b) => a + pct(b.CPUPerc), 0) / rows.length : 0;
    const ram = rows.length ? rows.reduce((a, b) => a + pct(b.MemPerc), 0) / rows.length : 0;
    const gpu = await detectGpuUsage();
    return NextResponse.json({ cpu: Math.round(cpu), ram: Math.round(ram), gpu });
  } catch {
    const gpu = await detectGpuUsage();
    return NextResponse.json({ cpu: 0, ram: 0, gpu });
  }
}
