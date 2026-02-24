"use client";

import { useEffect, useMemo, useState } from "react";

type Capabilities = {
  skills: string[];
  tools: string[];
  connectors: string[];
  agents: string[];
};

export function ChatWorkbench() {
  const [caps, setCaps] = useState<Capabilities>({ skills: [], tools: [], connectors: [], agents: [] });
  const [goal, setGoal] = useState("Crear flujo multiagente para resolver tareas y publicar resumen.");
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [subagents, setSubagents] = useState<string>("researcher, reviewer");
  const [plan, setPlan] = useState<any>(null);
  const [agentName, setAgentName] = useState("alchemist-bot");
  const [agentRole, setAgentRole] = useState("Coordinador de automatización");
  const [connector, setConnector] = useState("telegram");
  const [tokenRef, setTokenRef] = useState("telegram_bot_token_ref");
  const [msg, setMsg] = useState("");
  const [chatText, setChatText] = useState("Actualizar estado y coordinar agentes");
  const [thread, setThread] = useState<Array<{sender:string;text:string;ts?:string;kind?:string}>>([]);

  useEffect(() => {
    fetch("/api/gateway/capabilities", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setCaps({
        skills: j.skills ?? [],
        tools: j.tools ?? [],
        connectors: j.connectors ?? [],
        agents: j.agents ?? [],
      }));
  }, []);

  const subagentList = useMemo(() => subagents.split(",").map((x) => x.trim()).filter(Boolean), [subagents]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const createPlan = async () => {
    setMsg("Generando plan...");
    const res = await fetch("/api/gateway/chat-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goal, use_skills: skills, use_tools: tools, create_subagents: subagentList, channels }),
    });
    const data = await res.json();
    setPlan(data.plan ?? data);
    setMsg(res.ok ? "Plan listo" : "Error al generar plan");
  };

  const createAgent = async () => {
    setMsg("Creando agente...");
    const res = await fetch("/api/gateway/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: agentName, role: agentRole, model: "local-default", tools, skills, enabled: true }),
    });
    setMsg(res.ok ? "Agente registrado" : "Error registrando agente");
  };

  const saveConnector = async () => {
    setMsg("Guardando conector...");
    const res = await fetch("/api/gateway/connectors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel: connector, enabled: true, token_ref: tokenRef }),
    });
    setMsg(res.ok ? "Conector guardado" : "Error guardando conector");
  };



  const loadThread = async () => {
    const r = await fetch("/api/gateway/chat-thread?limit=120", { cache: "no-store" });
    const j = await r.json();
    setThread(j.items ?? []);
  };

  useEffect(() => {
    loadThread();
    const id = setInterval(loadThread, 3000);
    return () => clearInterval(id);
  }, []);

  const postChat = async () => {
    await fetch("/api/gateway/chat-thread", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sender: "operator", text: chatText, kind: "human" }),
    });
    setChatText("");
    loadThread();
  };

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Gateway Chat Workbench</h3>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>Define objetivo, activa skills/tools, crea subagentes y conecta canales desde una sola vista.</p>

      <label style={lbl}>Objetivo</label>
      <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} style={field} />

      <div style={grid2}>
        <div>
          <label style={lbl}>Skills</label>
          <div style={chips}>{caps.skills.map((s) => <button key={s} onClick={() => toggle(skills, setSkills, s)} className="card" style={chip(skills.includes(s))}>{s}</button>)}</div>
        </div>
        <div>
          <label style={lbl}>Tools</label>
          <div style={chips}>{caps.tools.map((t) => <button key={t} onClick={() => toggle(tools, setTools, t)} className="card" style={chip(tools.includes(t))}>{t}</button>)}</div>
        </div>
      </div>

      <label style={lbl}>Subagentes (coma separado)</label>
      <input value={subagents} onChange={(e) => setSubagents(e.target.value)} style={field} />

      <label style={lbl}>Canales</label>
      <div style={chips}>{caps.connectors.map((c) => <button key={c} onClick={() => toggle(channels, setChannels, c)} className="card" style={chip(channels.includes(c))}>{c}</button>)}</div>

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button className="cta" onClick={createPlan}>Generar plan</button>
      </div>

      {plan && <pre style={pre}>{JSON.stringify(plan, null, 2)}</pre>}

      <hr style={{ borderColor: "rgba(255,255,255,.08)", margin: "14px 0" }} />

      <h4 style={{ margin: "6px 0" }}>Crear agente/subagente</h4>
      <div style={grid2}>
        <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Nombre" style={field} />
        <input value={agentRole} onChange={(e) => setAgentRole(e.target.value)} placeholder="Rol" style={field} />
      </div>
      <button className="card" style={{ padding: "8px 10px", marginTop: 8 }} onClick={createAgent}>Registrar agente</button>

      <h4 style={{ margin: "12px 0 6px" }}>Conector</h4>
      <div style={grid2}>
        <select value={connector} onChange={(e) => setConnector(e.target.value)} style={field}>{caps.connectors.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <input value={tokenRef} onChange={(e) => setTokenRef(e.target.value)} placeholder="token_ref (referencia segura)" style={field} />
      </div>
      <button className="card" style={{ padding: "8px 10px", marginTop: 8 }} onClick={saveConnector}>Guardar conector</button>

      <h4 style={{ margin: "14px 0 6px" }}>Chat compartido (agentes + operador)</h4>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Escribe al ecosistema..." style={field} />
        <button className="card" style={{ padding: "8px 10px" }} onClick={postChat}>Enviar</button>
      </div>
      <div style={{ marginTop: 8, maxHeight: 220, overflow: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "#020617", padding: 10 }}>
        {thread.length === 0 && <div style={{ color: "#64748b" }}>Sin mensajes todavía.</div>}
        {thread.map((m, i) => (
          <div key={`${i}-${m.ts || "x"}`} style={{ padding: "4px 0", borderBottom: "1px dashed rgba(255,255,255,.06)" }}>
            <strong style={{ color: m.kind === "agent" ? "#22d3ee" : "#fbbf24" }}>{m.sender}</strong>
            <span style={{ color: "#94a3b8", fontSize: 11 }}> {m.ts || ""}</span>
            <div style={{ color: "#e2e8f0" }}>{m.text}</div>
          </div>
        ))}
      </div>

      {msg && <div style={{ marginTop: 10, color: "#67e8f9", fontSize: 13 }}>{msg}</div>}
    </section>
  );
}

const lbl: React.CSSProperties = { display: "block", marginTop: 10, fontSize: 12, color: "#94a3b8" };
const field: React.CSSProperties = { width: "100%", marginTop: 4, borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.2)", color: "#f8fafc", padding: "8px 10px" };
const chips: React.CSSProperties = { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };
const pre: React.CSSProperties = { marginTop: 10, maxHeight: 220, overflow: "auto", borderRadius: 12, padding: 10, background: "#020617", border: "1px solid rgba(255,255,255,.1)", fontSize: 12, color: "#67e8f9" };
const chip = (active: boolean): React.CSSProperties => ({ padding: "6px 8px", borderRadius: 10, color: active ? "#22d3ee" : "#cbd5e1" });
