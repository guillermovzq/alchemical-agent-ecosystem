import { NextRequest, NextResponse } from "next/server";

const gatewayHeaders = () => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = { "content-type": "application/json" };
  if (token) h["x-alchemy-token"] = token;
  return h;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch("http://localhost/gateway/chat/actions/plan", {
      method: "POST",
      headers: gatewayHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
