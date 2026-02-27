import { NextRequest, NextResponse } from "next/server";

// NOTE: x-alchemy-role is intentionally NOT sent — the gateway derives the role
// exclusively from a validated x-api-key (DB lookup) or from the x-alchemy-token
// master credential.  Sending a role header would be silently ignored.
const headersFor = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const apiKey = process.env.ALCHEMICAL_ADMIN_API_KEY || "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  if (apiKey) h["x-api-key"] = apiKey;
  return h;
};

export async function GET() {
  try {
    const res = await fetch("http://localhost/gateway/auth/keys", { cache: "no-store", headers: headersFor() });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable", items: [] }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = encodeURIComponent(body.name || "dashboard-key");
  const role = encodeURIComponent(body.role || "operator");
  try {
    const res = await fetch(`http://localhost/gateway/auth/keys?name=${name}&role=${role}`, {
      method: "POST",
      headers: headersFor(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
