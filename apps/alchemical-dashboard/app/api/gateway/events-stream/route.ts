import { NextResponse } from "next/server";

const gatewayHeaders = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = {};
  if (token) h["x-alchemy-token"] = token;
  return h;
};

export async function GET() {
  const encoder = new TextEncoder();

  // intervalId captured in closure — avoids the broken `this._id` anti-pattern
  // that caused intervals to never be cleared on client disconnect.
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      let last = "";

      const send = (txt: string) => {
        try {
          controller.enqueue(encoder.encode(txt));
        } catch {
          // Controller already closed (client disconnected)
        }
      };

      const loop = async () => {
        try {
          const r = await fetch("http://localhost/gateway/events?limit=120", {
            cache: "no-store",
            headers: gatewayHeaders(),
          });
          const j = await r.json();
          const payload = JSON.stringify(j);
          if (payload !== last) {
            send(`data: ${payload}\n\n`);
            last = payload;
          } else {
            send(`: keepalive\n\n`);
          }
        } catch {
          send(`data: ${JSON.stringify({ items: [], error: "gateway unavailable" })}\n\n`);
        }
      };

      await loop();
      intervalId = setInterval(loop, 2000);
    },

    cancel() {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
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
