import type { AgentRow } from "../lib/types";

export function AgentCard({ agent }: { agent: AgentRow }) {
  const stateColor = agent.status === "Running" ? "#34d399" : agent.status === "Paused" ? "#fbbf24" : "#fb7185";
  return (
    <article className="glass-card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{agent.name}</strong>
        <span style={{ color: stateColor, fontSize: 12 }}>{agent.status}</span>
      </div>
      <p style={{ color: "#a1a1aa", fontSize: 13 }}>{agent.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>{agent.service}</span>
        <span>{agent.model}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
        latency: {agent.latencyMs ? `${agent.latencyMs}ms` : "-"} · {agent.containerState}
      </div>
    </article>
  );
}
