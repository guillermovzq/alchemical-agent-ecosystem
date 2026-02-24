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
      const id = setInterval(loop, 1500);
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
