import { NextRequest, NextResponse } from "next/server";

const gatewayHeaders = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = { "x-alchemy-role": "viewer" };
  if (token) h["x-alchemy-token"] = token;
  return h;
};

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") || "80";
  try {
    const res = await fetch(`http://localhost/gateway/usage/summary?limit=${encodeURIComponent(limit)}`, {
      cache: "no-store",
      headers: gatewayHeaders(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ summary: { tokens_in: 0, tokens_out: 0, total_tokens: 0, cost_usd: 0 }, items: [], error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
