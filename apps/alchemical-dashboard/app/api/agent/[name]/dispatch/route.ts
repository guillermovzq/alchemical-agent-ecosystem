import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "../../../../../lib/agents";

export async function POST(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const body = await req.json().catch(() => ({}));
  const agent = AGENTS.find((a) => a.name === name);
  if (!agent) return NextResponse.json({ error: "Unknown agent" }, { status: 404 });

  const action = body.action || agent.action;
  const payload = body.payload || { ping: true, source: "dashboard" };
  const route = action === "/" ? "" : `/${action}`;

  const res = await fetch(`http://localhost/${agent.name}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  }).catch(() => null);

  if (!res) return NextResponse.json({ ok: false, error: "dispatch failed" }, { status: 502 });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: res.ok, status: res.status, data });
}
