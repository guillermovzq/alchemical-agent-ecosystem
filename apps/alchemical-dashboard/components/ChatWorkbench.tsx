"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const [chatAgent, setChatAgent] = useState("velktharion");
  const [repo, setRepo] = useState("smouj/alchemical-agent-ecosystem");
  const [thinking, setThinking] = useState("balanced");
  const [autoEdit, setAutoEdit] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [roundAgents, setRoundAgents] = useState<string>("velktharion,synapsara,ignivox");
  const [rounds, setRounds] = useState(1);
  const [thread, setThread] = useState<Array<{ sender: string; text: string; ts?: string; kind?: string }>>([]);
  const [conn, setConn] = useState<"connected"|"disconnected"|"connecting">("connecting");
  const [magicPulse, setMagicPulse] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch("/api/gateway/capabilities", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const next = {
          skills: j.skills ?? [],
          tools: j.tools ?? [],
          connectors: j.connectors ?? [],
          agents: j.agents ?? [],
        };
        setCaps(next);
        if (next.agents?.length) setChatAgent(next.agents[0]);
      });
  }, []);

  const connectStream = () => {
    if (esRef.current) esRef.current.close();
    setConn("connecting");
    const es = new EventSource("/api/gateway/chat-stream");
    esRef.current = es;
    es.onopen = () => setConn("connected");
    es.onerror = () => setConn("disconnected");
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const items = payload.items ?? [];
        setThread((prev) => {
          const prevLast = prev[prev.length - 1];
          const nextLast = items[items.length - 1];
          if (nextLast && (!prevLast || nextLast.ts !== prevLast.ts) && (nextLast.kind === "agent" || nextLast.kind === "dispatch")) {
            setMagicPulse((v) => v + 1);
          }
          return items;
        });
      } catch {
        // ignore invalid frame
      }
    };
  };

  const disconnectStream = () => {
    if (esRef.current) esRef.current.close();
    esRef.current = null;
    setConn("disconnected");
  };

  const reconnectStream = () => {
    disconnectStream();
    connectStream();
  };

  useEffect(() => {
    connectStream();
    return () => disconnectStream();
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

  const postChat = async () => {
    setMagicPulse((v) => v + 1);
    await fetch("/api/gateway/chat-thread", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sender: "operator", text: chatText, kind: "human" }),
    });
    setChatText("");
  };

  const askAgent = async () => {
    if (!chatText.trim()) return;
    setMagicPulse((v) => v + 1);
    setMsg(`Enviando a ${chatAgent}...`);
    const res = await fetch("/api/gateway/chat-ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agent: chatAgent,
        text: chatText,
        action: "query",
        repo,
        thinking,
        auto_edit: autoEdit,
        attachments,
      }),
    });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Respuesta recibida de ${chatAgent}` : `Error: ${j?.error || "chat ask failed"}`);
    if (res.ok) setChatText("");
  };

  const runRoundtable = async () => {
    const agents = roundAgents.split(",").map((x) => x.trim()).filter(Boolean);
    if (!agents.length) return;
    setMsg("Ejecutando roundtable entre agentes...");
    const res = await fetch("/api/gateway/chat-roundtable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: chatText || goal, agents, rounds, thinking, action: "query" }),
    });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Roundtable completado (${j?.items?.length || 0} respuestas)` : `Error roundtable: ${j?.error || "failed"}`);
  };

  const onAttach = (files: FileList | null) => {
    if (!files || !files.length) return;
    const rows = Array.from(files).map((f) => `${f.name} (${Math.ceil(f.size / 1024)}KB)`);
    setAttachments((prev) => [...prev, ...rows].slice(0, 8));
  };

  return (
    <section className={`glass-card cauldron-chat ${magicPulse % 2 ? "spell-cast" : ""}`} style={{ padding: 14, position: "relative", overflow: "hidden" }}>
      <div className="magic-particles" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <h3 style={{ marginTop: 0 }}>Gateway Chat Workbench (SSE)</h3>
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <h4 style={{ margin: "0 0 6px" }}>Chat compartido (agentes + operador)</h4>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <small style={{ color: conn === "connected" ? "#34d399" : conn === "connecting" ? "#fbbf24" : "#fb7185" }}>{conn}</small>
          <button className="card" style={{ padding: "6px 8px" }} onClick={connectStream}>Connect</button>
          <button className="card" style={{ padding: "6px 8px" }} onClick={reconnectStream}>Reconnect</button>
          <button className="card" style={{ padding: "6px 8px" }} onClick={disconnectStream}>Disconnect</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 160px 120px", gap: 8 }}>
        <select value={chatAgent} onChange={(e) => setChatAgent(e.target.value)} style={field}>
          {(caps.agents.length ? caps.agents : ["velktharion"]).map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Escribe al ecosistema..." style={field} />
        <select value={thinking} onChange={(e) => setThinking(e.target.value)} style={field}>
          <option value="low">thinking: low</option>
          <option value="balanced">thinking: balanced</option>
          <option value="deep">thinking: deep</option>
        </select>
        <label className="card" style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={autoEdit} onChange={(e) => setAutoEdit(e.target.checked)} /> auto-edit
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 1fr auto auto auto", gap: 8, marginTop: 8 }}>
        <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="repo (owner/name)" style={field} />
        <input type="file" multiple onChange={(e) => onAttach(e.target.files)} style={field} />
        <input value={roundAgents} onChange={(e) => setRoundAgents(e.target.value)} placeholder="agents para roundtable (coma)" style={field} />
        <input type="number" min={1} max={5} value={rounds} onChange={(e) => setRounds(Number(e.target.value) || 1)} style={{ ...field, width: 70 }} />
        <button className="card" style={{ padding: "8px 10px" }} onClick={postChat}>Solo hilo</button>
        <button className="cta" style={{ padding: "8px 10px" }} onClick={askAgent}>Enviar a agente</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button className="card" style={{ padding: "8px 10px" }} onClick={runRoundtable}>Roundtable agentes</button>
        {attachments.map((a, i) => <span key={`${a}-${i}`} className="card" style={{ padding: "4px 8px", fontSize: 12 }}>{a}</span>)}
      </div>
      <div style={{ marginTop: 8, maxHeight: 220, overflow: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "#020617", padding: 10 }}>
        {thread.length === 0 && <div style={{ color: "#64748b" }}>Sin mensajes todavía.</div>}
        {thread.map((m, i) => (
          <div key={`${i}-${m.ts || "x"}`} style={{ padding: "4px 0", borderBottom: "1px dashed rgba(255,255,255,.06)" }}>
            <strong style={{ color: m.kind === "agent" || m.kind === "dispatch" ? "#22d3ee" : "#fbbf24" }}>{m.sender}</strong>
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
