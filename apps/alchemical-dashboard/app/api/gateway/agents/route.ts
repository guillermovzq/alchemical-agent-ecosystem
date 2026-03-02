import { NextRequest, NextResponse } from "next/server";

/**
 * Gateway URL - uses Docker service name for inter-container communication
 */
const GATEWAY_URL = process.env.GATEWAY_URL || "http://alchemical-gateway:7411";

const gatewayHeaders = (withJson = false) => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  if (withJson) h["content-type"] = "application/json";
  return h;
};

export async function GET() {
  try {
    // Use /api/v1/agents endpoint as defined in agents_router.py
    const res = await fetch(`${GATEWAY_URL}/api/v1/agents`, { 
      cache: "no-store", 
      headers: gatewayHeaders() 
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error("Gateway GET error:", e?.message);
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    // Use /api/v1/agents endpoint as defined in agents_router.py
    const res = await fetch(`${GATEWAY_URL}/api/v1/agents`, {
      method: "POST",
      headers: gatewayHeaders(true),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error("Gateway POST error:", e?.message);
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
