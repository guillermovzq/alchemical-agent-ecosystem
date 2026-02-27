import { NextRequest, NextResponse } from "next/server";

// NOTE: x-alchemy-role is intentionally NOT sent — the gateway derives the role
// from the x-alchemy-token or x-api-key credential only.
const headersFor = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const apiKey = process.env.ALCHEMICAL_OPERATOR_API_KEY || process.env.ALCHEMICAL_ADMIN_API_KEY || "";
  const h: Record<string, string> = { "content-type": "application/json" };
  if (token) h["x-alchemy-token"] = token;
  if (apiKey) h["x-api-key"] = apiKey;
  return h;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch("http://localhost/gateway/connectors/send", {
      method: "POST",
      headers: headersFor(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
