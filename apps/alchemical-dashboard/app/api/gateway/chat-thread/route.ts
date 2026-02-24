import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") || "120";
  try {
    const res = await fetch(`http://localhost/gateway/chat/thread?limit=${limit}`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch("http://localhost/gateway/chat/thread", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
