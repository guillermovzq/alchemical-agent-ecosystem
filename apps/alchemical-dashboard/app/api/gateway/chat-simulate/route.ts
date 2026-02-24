import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { goal } = await req.json().catch(() => ({ goal: "sync-status" }));
  try {
    const res = await fetch(`http://localhost/gateway/chat/simulate?goal=${encodeURIComponent(goal || "sync-status")}`, {
      method: "POST",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
