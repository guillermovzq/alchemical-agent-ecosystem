"use client";

import { useEffect, useMemo, useState } from "react";

type UsageItem = {
  id: number;
  source: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  total_tokens: number;
  cost_usd: number;
  ts: string;
};

type UsagePayload = {
  summary?: { tokens_in?: number; tokens_out?: number; total_tokens?: number; cost_usd?: number };
  items?: UsageItem[];
};

const EMPTY_SUMMARY = { tokens_in: 0, tokens_out: 0, total_tokens: 0, cost_usd: 0 };

export function UsagePanel() {
  const [data, setData] = useState<UsagePayload>({ summary: EMPTY_SUMMARY, items: [] });

  useEffect(() => {
    const es = new EventSource("/api/gateway/usage-stream");
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setData(payload);
      } catch {
        // ignore
      }
    };
    return () => es.close();
  }, []);

  const summary = data.summary ?? EMPTY_SUMMARY;
  const items = data.items ?? [];

  const inPct = useMemo(() => {
    const t = Math.max(1, Number(summary.total_tokens || 0));
    return Math.round((Number(summary.tokens_in || 0) / t) * 100);
  }, [summary]);
  const outPct = 100 - inPct;

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Usage & Cost</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <Stat label="Tokens in" value={Intl.NumberFormat("es-ES").format(Number(summary.tokens_in || 0))} />
        <Stat label="Tokens out" value={Intl.NumberFormat("es-ES").format(Number(summary.tokens_out || 0))} />
        <Stat label="Cost USD" value={`$${Number(summary.cost_usd || 0).toFixed(4)}`} />
      </div>
      <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
        <div style={{ width: `${inPct}%`, height: "100%", background: "#22d3ee", float: "left" }} />
        <div style={{ width: `${outPct}%`, height: "100%", background: "#a78bfa", float: "left" }} />
      </div>
      <div style={{ marginTop: 8, maxHeight: 180, overflow: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "#020617", padding: 8, fontSize: 12 }}>
        {items.slice(0, 10).map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,.08)", padding: "3px 0" }}>
            <span style={{ color: "#cbd5e1" }}>{i.source}</span>
            <span style={{ color: "#67e8f9" }}>{i.total_tokens} tk · ${Number(i.cost_usd || 0).toFixed(4)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <div style={{ color: "#94a3b8", fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
