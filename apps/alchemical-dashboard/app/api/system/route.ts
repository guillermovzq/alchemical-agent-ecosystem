import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CORE_SERVICES } from "../../../lib/agents";

const execFileAsync = promisify(execFile);

export async function GET() {
  try {
    const { stdout } = await execFileAsync("docker", ["compose", "ps", "--format", "json"], { cwd: process.cwd() + "/../.." });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const parsed = lines.map((l) => JSON.parse(l)) as Array<{ Service: string; State: string; Status: string }>;
    const map = new Map(parsed.map((p) => [p.Service, p]));

    const services = CORE_SERVICES.map((name) => {
      const row = map.get(name);
      const state = row?.State?.toLowerCase() ?? "unknown";
      const health = state.includes("running") ? "healthy" : state === "unknown" ? "unknown" : "down";
      return { name, state: row?.State ?? "unknown", status: row?.Status ?? "unknown", health };
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ services: CORE_SERVICES.map((name) => ({ name, state: "unknown", status: "unknown", health: "unknown" })), error: error?.message ?? "system unavailable" });
  }
}
