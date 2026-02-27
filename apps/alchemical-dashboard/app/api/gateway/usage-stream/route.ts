import { NextResponse } from "next/server";

const gatewayHeaders = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = { "x-alchemy-role": "viewer" };
  if (token) h["x-alchemy-token"] = token;
  return h;
};

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let last = "";
      let closed = false;
      const send = (txt: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(txt));
        } catch {
          closed = true;
        }
      };
      const empty = { summary: { tokens_in: 0, tokens_out: 0, total_tokens: 0, cost_usd: 0 }, items: [] };
      const loop = async () => {
        if (closed) return;
        try {
          const r = await fetch("http://localhost/gateway/usage/summary?limit=80", {
            cache: "no-store",
            headers: gatewayHeaders(),
          });
          const j = await r.json();
          const safe =
            r.ok && j && typeof j === "object" && j.summary && Array.isArray(j.items)
              ? j
              : empty;
          const payload = JSON.stringify(safe);
          if (payload !== last) {
            send(`data: ${payload}\n\n`);
            last = payload;
          } else {
            send(`: keepalive\n\n`);
          }
        } catch {
          send(`data: ${JSON.stringify(empty)}\n\n`);
        }
      };
      await loop();
      const id = setInterval(loop, 2000);
      // @ts-ignore
      this._id = id;
      // @ts-ignore
      this._closed = () => {
        closed = true;
        clearInterval(id);
      };
    },
    cancel() {
      // @ts-ignore
      if (this._closed) this._closed();
      // @ts-ignore
      else if (this._id) clearInterval(this._id);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
