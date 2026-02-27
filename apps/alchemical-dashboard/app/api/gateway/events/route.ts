import { NextRequest, NextResponse } from "next/server";

const gatewayHeaders = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  return h;
};

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") || "100";
  try {
    const res = await fetch(`http://localhost/gateway/events?limit=${encodeURIComponent(limit)}`, {
      cache: "no-store",
      headers: gatewayHeaders(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable", items: [] }, { status: 502 });
  }
}
