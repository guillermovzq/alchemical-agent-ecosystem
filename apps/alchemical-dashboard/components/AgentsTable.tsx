"use client";

import { useMemo, useState } from "react";
import type { AgentRow } from "../lib/types";

async function control(service: string, command: "start" | "stop" | "restart") {
  const r = await fetch("/api/control", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ service, command }),
  });
  return r.json();
}

async function dispatch(name: string) {
  const r = await fetch(`/api/agent/${name}/dispatch`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ payload: { source: "dashboard", ts: Date.now() } }),
  });
  return r.json();
}

export function AgentsTable({ agents }: { agents: AgentRow[] }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<AgentRow | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string>("");

  const rows = useMemo(() => agents.filter((a) => `${a.name} ${a.model} ${a.description}`.toLowerCase().includes(q.toLowerCase())), [q, agents]);

  return (
    <section style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h3 style={{ marginTop: 0 }}>Agentes</h3>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar..." style={{ ...input, maxWidth: 220 }} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ color: "#9ca3af", textAlign: "left" }}><th>Agente</th><th>Servicio</th><th>Estado</th><th>Modelo</th><th>Descripción</th><th>Acciones</th></tr></thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.name} onClick={() => setSelected(a)} style={{ borderTop: "1px solid rgba(255,255,255,.08)", cursor: "pointer" }}>
              <td>{a.name}</td><td>{a.service}</td><td>{a.status}</td><td>{a.model}</td><td>{a.description}</td>
              <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={(e) => { e.stopPropagation(); control(a.service, "start").then(() => setActionFeedback(`${a.name}: start ok`)); }}>Start</button>
                <button onClick={(e) => { e.stopPropagation(); control(a.service, "stop").then(() => setActionFeedback(`${a.name}: stop ok`)); }}>Stop</button>
                <button onClick={(e) => { e.stopPropagation(); control(a.service, "restart").then(() => setActionFeedback(`${a.name}: restart ok`)); }}>Restart</button>
                <button onClick={(e) => { e.stopPropagation(); dispatch(a.name).then((x) => setActionFeedback(`${a.name}: dispatch ${x.status ?? "ok"}`)); }}>Ping</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {actionFeedback && <div style={{ marginTop: 8, fontSize: 12, color: "#67e8f9" }}>{actionFeedback}</div>}

      {selected && (
        <aside className="glass-card" style={{ marginTop: 10, padding: 12 }}>
          <strong>Detalle: {selected.name}</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <pre style={panel}>requests/min: realtime pending\nlatency: {String(selected.latencyMs ?? "-")}ms\nstate: {selected.containerState}\nstatus: {selected.containerStatus}</pre>
            <pre style={panel}>name: {selected.name}\nservice: {selected.service}\nmodel: {selected.model}\nrole: {selected.role}</pre>
          </div>
        </aside>
      )}
    </section>
  );
}

const input: React.CSSProperties = { borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", background: "rgba(0,0,0,.24)", color: "#f8fafc", padding: "8px 10px" };
const panel: React.CSSProperties = { margin: 0, borderRadius: 12, padding: 12, background: "#020617", border: "1px solid rgba(255,255,255,.1)", fontSize: 12 };
