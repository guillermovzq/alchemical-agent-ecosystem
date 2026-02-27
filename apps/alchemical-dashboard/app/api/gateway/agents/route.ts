import { NextRequest, NextResponse } from "next/server";

const gatewayHeaders = (withJson = false) => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  if (withJson) h["content-type"] = "application/json";
  return h;
};

export async function GET() {
  try {
    const res = await fetch("http://localhost/gateway/agents", { cache: "no-store", headers: gatewayHeaders() });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch("http://localhost/gateway/agents", {
      method: "POST",
      headers: gatewayHeaders(true),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
