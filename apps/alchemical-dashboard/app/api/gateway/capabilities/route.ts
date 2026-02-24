import { NextResponse } from "next/server";

const gatewayHeaders = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  return h;
};

export async function GET() {
  try {
    const res = await fetch("http://localhost/gateway/capabilities", { cache: "no-store", headers: gatewayHeaders() });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
