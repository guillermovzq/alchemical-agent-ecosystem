"use client";

import { useEffect, useState } from "react";

type Job = {
  id: number;
  kind: string;
  status: string;
  attempts: number;
  error?: string | null;
  updated_at: string;
};

type EventRow = {
  id: number;
  level: string;
  source: string;
  message: string;
  ts: string;
};

export function JobsEventsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      const r = await fetch("/api/gateway/jobs", { cache: "no-store" });
      const j = await r.json();
      setJobs((j.items ?? []).slice(0, 8));
    };
    loadJobs();
    const id = setInterval(loadJobs, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/gateway/events-stream");
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setEvents((payload.items ?? []).slice(0, 10));
      } catch {
        // ignore malformed
      }
    };
    return () => es.close();
  }, []);

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Jobs & Events</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <strong style={{ fontSize: 13 }}>Queue jobs</strong>
          <div style={box}>
            {jobs.length === 0 && <div style={muted}>Sin jobs recientes.</div>}
            {jobs.map((j) => (
              <div key={j.id} style={row}>
                <span>#{j.id} {j.kind}</span>
                <span style={{ color: colorFor(j.status) }}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <strong style={{ fontSize: 13 }}>Events stream</strong>
          <div style={box}>
            {events.length === 0 && <div style={muted}>Sin eventos recientes.</div>}
            {events.map((e) => (
              <div key={e.id} style={row}>
                <span style={{ color: colorFor(e.level) }}>[{e.level}]</span>
                <span style={{ color: "#cbd5e1" }}>{e.source}: {e.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const box: React.CSSProperties = {
  marginTop: 6,
  maxHeight: 220,
  overflow: "auto",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "#020617",
  padding: 10,
  fontSize: 12,
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "space-between",
  borderBottom: "1px dashed rgba(255,255,255,.08)",
  padding: "4px 0",
};

const muted: React.CSSProperties = { color: "#64748b" };

function colorFor(level: string) {
  const l = level.toLowerCase();
  if (l.includes("error") || l.includes("failed")) return "#fb7185";
  if (l.includes("warn") || l.includes("retry")) return "#fbbf24";
  if (l.includes("done") || l.includes("ok") || l.includes("info")) return "#34d399";
  return "#67e8f9";
}
