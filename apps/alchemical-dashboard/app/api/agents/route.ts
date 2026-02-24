import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const gatewayHeaders = () => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  return h;
};

async function composePs() {
  try {
    const { stdout } = await execFileAsync("docker", ["compose", "ps", "--format", "json"], { cwd: process.cwd() + "/../.." });
    const lines = stdout.trim().split("\n").filter(Boolean);
    return lines.map((l) => JSON.parse(l)) as Array<{ Service: string; State: string; Status: string }>;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [agentsRes, ps] = await Promise.all([
      fetch("http://localhost/gateway/agents", { cache: "no-store", headers: gatewayHeaders() }),
      composePs(),
    ]);

    const agentsJson = await agentsRes.json();
    const list = (agentsJson?.items ?? []) as Array<{
      name: string;
      role?: string;
      model?: string;
      tools?: string[];
      skills?: string[];
      enabled?: boolean;
      target_service?: string;
    }>;

    const byService = new Map(ps.map((s) => [s.Service, s]));

    const items = await Promise.all(
      list.map(async (a) => {
        const service = a.target_service || a.name;
        const svc = byService.get(service);
        const healthUrl = `http://localhost/${service}/health`;
        let health: "Running" | "Error" | "Paused" = "Paused";
        let latencyMs: number | null = null;

        const started = Date.now();
        try {
          const r = await fetch(healthUrl, { cache: "no-store" });
          latencyMs = Date.now() - started;
          health = r.ok ? "Running" : "Error";
        } catch {
          health = svc?.State?.toLowerCase().includes("running") ? "Error" : "Paused";
        }

        return {
          name: a.name,
          role: a.role || "logical-agent",
          model: a.model || "local-default",
          description: `skills:${(a.skills || []).length} · tools:${(a.tools || []).length}`,
          service,
          enabled: Boolean(a.enabled),
          status: health,
          latencyMs,
          containerState: svc?.State ?? "unknown",
          containerStatus: svc?.Status ?? "unknown",
        };
      })
    );

    const active = items.filter((i) => i.status === "Running").length;
    const stats = {
      active,
      total: items.length,
      tasksToday: null,
      tokensProcessed: null,
      uptimeAvg: Number(((active / Math.max(items.length, 1)) * 100).toFixed(1)),
    };

    return NextResponse.json({ items, stats });
  } catch (e: any) {
    return NextResponse.json({ items: [], stats: { active: 0, total: 0, tasksToday: null, tokensProcessed: null, uptimeAvg: 0 }, error: e?.message || "agents unavailable" }, { status: 502 });
  }
}
