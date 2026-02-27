"use client";

import { useEffect, useState } from "react";

export function LogsMonitor({ defaultService = "velktharion", linesCount = 50 }: { defaultService?: string; linesCount?: number }) {
  const [service, setService] = useState(defaultService);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => setService(defaultService), [defaultService]);

  useEffect(() => {
    const es = new EventSource(`/api/logs/stream?service=${encodeURIComponent(service)}&lines=${linesCount}`);
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setLines(payload.logs ?? []);
      } catch {
        // ignore
      }
    };
    return () => es.close();
  }, [service, linesCount]);

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginTop: 0 }}>Logs & Monitoreo (SSE)</h3>
        <input value={service} onChange={(e) => setService(e.target.value)} style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.2)", color: "#f8fafc", padding: "6px 8px" }} />
      </div>
      <div style={{ borderRadius: 12, padding: 12, background: "#020617", border: "1px solid rgba(255,255,255,.1)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, maxHeight: 230, overflow: "auto" }}>
        {lines.length === 0 && <div style={{ color: "#64748b" }}>Sin logs o servicio no disponible.</div>}
        {lines.map((l, i) => <div key={`${i}-${l.slice(0, 12)}`} style={{ padding: "2px 0", color: l.includes("error") ? "#fb7185" : l.includes("warn") ? "#fbbf24" : "#67e8f9" }}>{l}</div>)}
      </div>
    </section>
  );
}
