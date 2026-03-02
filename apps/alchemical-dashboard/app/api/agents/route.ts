import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const CACHE_TTL_MS = 3000;

/**
 * Fallback gateway URL. Override via GATEWAY_URL env var.
 * In Docker Compose, use the service name to communicate between containers.
 * The gateway exposes port 7411 directly.
 */
const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://alchemical-gateway:7411";

let cache: { ts: number; payload: unknown } | null = null;

const gatewayHeaders = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN ?? "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  return h;
};

/**
 * Runs `docker compose ps` to get container state for each service.
 * NOTE: Requires Docker socket access (`/var/run/docker.sock` mounted or host Docker).
 * Falls back to an empty array if Docker is unavailable — health checks via HTTP are
 * still performed and used as the primary status signal.
 */
async function composePs(): Promise<Array<{ Service: string; State: string; Status: string }>> {
  try {
    const cwd = path.resolve(process.cwd(), "..", "..");
    const { stdout } = await execFileAsync("docker", ["compose", "ps", "--format", "json"], { cwd });
    const lines = stdout.trim().split("\n").filter(Boolean);
    return lines.map((l) => JSON.parse(l) as { Service: string; State: string; Status: string });
  } catch {
    return [];
  }
}

async function checkHealth(url: string, timeoutMs = 1500): Promise<{ ok: boolean; latencyMs: number | null }> {
  const started = Date.now();
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { cache: "no-store", signal: controller.signal });
    return { ok: r.ok, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: null };
  } finally {
    clearTimeout(id);
  }
}

export async function GET(): Promise<NextResponse> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(cache.payload);
  }

  try {
    // Fetch agents from gateway - use /api/v1/agents endpoint
    const agentsRes = await fetch(`${GATEWAY_URL}/api/v1/agents`, { 
      cache: "no-store", 
      headers: gatewayHeaders() 
    });
    
    // Try to get container status, but don't fail if Docker is unavailable
    let ps: Array<{ Service: string; State: string; Status: string }> = [];
    try {
      ps = await composePs();
    } catch {
      // Docker not available inside container - that's ok
      ps = [];
    }

    const agentsJson = (await agentsRes.json()) as {
      items?: Array<{
        name: string;
        role?: string;
        model?: string;
        tools?: string[];
        skills?: string[];
        enabled?: boolean;
        target_service?: string;
      }>;
    };
    const list = agentsJson?.items ?? [];

    const byService = new Map(ps.map((s) => [s.Service, s]));

    const uniqueServices = Array.from(new Set(list.map((a) => a.target_service ?? a.name)));
    const healthByService = new Map<string, { ok: boolean; latencyMs: number | null }>();
    await Promise.all(
      uniqueServices.map(async (service) => {
        const health = await checkHealth(`http://localhost/${service}/health`);
        healthByService.set(service, health);
      })
    );

    const items = list.map((a) => {
      const service = a.target_service ?? a.name;
      const svc = byService.get(service);
      const healthCheck = healthByService.get(service) ?? { ok: false, latencyMs: null };
      let health: "Running" | "Error" | "Paused" = "Paused";
      if (healthCheck.ok) health = "Running";
      else health = svc?.State?.toLowerCase().includes("running") ? "Error" : "Paused";

      return {
        name: a.name,
        role: a.role ?? "logical-agent",
        model: a.model ?? "local-default",
        description: `skills:${(a.skills ?? []).length} · tools:${(a.tools ?? []).length}`,
        service,
        enabled: Boolean(a.enabled),
        status: health,
        latencyMs: healthCheck.latencyMs,
        containerState: svc?.State ?? "unknown",
        containerStatus: svc?.Status ?? "unknown",
      };
    });

    const active = items.filter((i) => i.status === "Running").length;
    const stats = {
      active,
      total: items.length,
      tasksToday: null,
      tokensProcessed: null,
      uptimeAvg: Number(((active / Math.max(items.length, 1)) * 100).toFixed(1)),
    };

    const payload = { items, stats };
    cache = { ts: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        items: [],
        stats: { active: 0, total: 0, tasksToday: null, tokensProcessed: null, uptimeAvg: 0 },
        error: message,
      },
      { status: 502 }
    );
  }
}
