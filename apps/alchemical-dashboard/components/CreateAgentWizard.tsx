"use client";

import { useMemo, useState } from "react";

const steps = ["Plantilla", "Configuración", "Capacidades", "Review"];
const templates = ["Routing Cognitivo", "Audio/Intent", "Guardrails", "Workflow Orchestrator"];
const caps = ["Memory", "Tools", "Vision", "RAG", "Guardrails", "Web Search"];

export function CreateAgentWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Agente especializado");
  const [model, setModel] = useState("anthropic/claude-haiku-4.5");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>(["Memory", "Tools"]);
  const [msg, setMsg] = useState("");
  const yaml = useMemo(() => `name: ${name || "nuevo-agente"}\nmodel: ${model}\ndescription: ${description || "Agente especializado"}\ncapabilities:\n${selected.map((s) => `  - ${s}`).join("\n")}`,[name, model, description, selected]);

  const transmute = async () => {
    const agentName = (name || "nuevo-agente").trim().toLowerCase().replace(/\s+/g, "-");
    if (!agentName) { setMsg("❌ El nombre del agente es obligatorio"); return; }
    setMsg(`Transmutando ${agentName}...`);
    try {
      const res = await fetch("/api/gateway/agents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          role: role || "Agente especializado",
          model,
          tools: selected.filter((c) => ["Tools", "Web Search", "Browser"].includes(c)).map((c) => c.toLowerCase().replace(/\s+/g, "-")),
          skills: selected.filter((c) => !["Tools", "Web Search", "Browser"].includes(c)).map((c) => c.toLowerCase().replace(/\s+/g, "-")),
          enabled: true,
        }),
      });
      const j = await res.json();
      setMsg(res.ok ? `✅ ${agentName} transmutado correctamente` : `❌ ${j?.detail ?? j?.error ?? "Error al transmutar"}`);
      if (res.ok) { setStep(0); setName(""); setDescription(""); setSelected(["Memory", "Tools"]); }
    } catch (e: unknown) {
      setMsg(`❌ ${e instanceof Error ? e.message : "Error de red"}`);
    }
  };

  return (
    <section className="glass-card" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Crear Nuevo Agente</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className="card" style={{ padding: "6px 10px", fontSize: 12, borderColor: i === step ? "#22d3ee" : undefined, color: i === step ? "#67e8f9" : "#cbd5e1" }}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{templates.map((t) => <button key={t} className="card" style={{ padding: 10, textAlign: "left" }}>{t}</button>)}</div>}

      {step === 1 && (
        <div style={{ display: "grid", gap: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del agente (slug, ej: mi-agente)" style={field} />
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Rol / Descripción del rol" style={field} />
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modelo base (ej: anthropic/claude-haiku-4.5)" style={field} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" rows={3} style={field} />
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {caps.map((c) => {
            const active = selected.includes(c);
            return <button key={c} onClick={() => setSelected(active ? selected.filter((x) => x !== c) : [...selected, c])} className="card" style={{ padding: "8px 10px", color: active ? "#22d3ee" : "#cbd5e1" }}>{c}</button>;
          })}
        </div>
      )}

      {step === 3 && (
        <pre style={{ margin: 0, borderRadius: 12, padding: 12, background: "#020617", border: "1px solid rgba(255,255,255,.1)", fontSize: 12, color: "#67e8f9", whiteSpace: "pre-wrap" }}>{yaml}</pre>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button className="card" onClick={() => setStep(Math.max(0, step - 1))} style={{ padding: "10px 14px" }}>Atrás</button>
        <div style={{ display: "flex", gap: 8 }}>
          {step < 3 && <button className="card" onClick={() => setStep(step + 1)} style={{ padding: "10px 14px" }}>Siguiente</button>}
          <button className="cta" onClick={transmute}>Transmutar Agente</button>
        </div>
      </div>
      {msg && <div style={{ marginTop: 8, fontSize: 12, color: msg.startsWith("❌") ? "#fb7185" : "#34d399" }}>{msg}</div>}
    </section>
  );
}

const field: React.CSSProperties = {
  width: "100%", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(3,7,18,.45)", color: "#f8fafc", padding: "10px 12px"
};
