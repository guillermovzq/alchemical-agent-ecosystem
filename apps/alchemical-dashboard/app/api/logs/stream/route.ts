import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function tailLogs(service: string, lines: number) {
  try {
    const { stdout } = await execFileAsync("docker", ["compose", "logs", "--tail", String(lines), service], {
      cwd: process.cwd() + "/../..",
      maxBuffer: 1024 * 1024,
    });
    return stdout.split("\n").slice(-lines);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get("service") || "velktharion";
  const lines = Math.max(10, Math.min(200, Number(req.nextUrl.searchParams.get("lines") || "50")));
  const encoder = new TextEncoder();

  // intervalId captured in closure — avoids the broken `this._id` anti-pattern
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let last = "";

      const send = (txt: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(txt));
        } catch {
          closed = true;
        }
      };

      const loop = async () => {
        if (closed) return;
        const logs = await tailLogs(service, lines);
        const payload = JSON.stringify({ service, logs });
        if (payload !== last) {
          send(`data: ${payload}\n\n`);
          last = payload;
        } else {
          send(`: keepalive\n\n`);
        }
      };

      await loop();
      intervalId = setInterval(loop, 1500);
    },

    cancel() {
      closed = true;
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
