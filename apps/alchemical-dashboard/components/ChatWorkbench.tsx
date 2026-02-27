"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Capabilities = {
  skills: string[];
  tools: string[];
  connectors: string[];
  agents: string[];
};

type ChatMsg = { sender: string; text: string; ts?: string; kind?: string };

/** Attachment with name and base64-encoded content. */
type Attachment = { name: string; sizeKb: number; content: string };

export function ChatWorkbench() {
  const [caps, setCaps] = useState<Capabilities>({ skills: [], tools: [], connectors: [], agents: [] });
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const [conn, setConn] = useState<"connected" | "disconnected" | "connecting">("connecting");
  const [msg, setMsg] = useState("");

  const [chatText, setChatText] = useState("");
  const [chatAgent, setChatAgent] = useState("alquimista-mayor");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [repo, setRepo] = useState(process.env.NEXT_PUBLIC_REPO ?? "");
  const [thinking, setThinking] = useState("balanced");
  const [autoEdit, setAutoEdit] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [roundAgents, setRoundAgents] = useState<string>("alquimista-mayor,redactor-narrador,investigador-analista");
  const [rounds, setRounds] = useState(1);

  const [goal, setGoal] = useState("Resolver tarea compleja en equipo y devolver plan con pasos ejecutables.");

  const esRef = useRef<EventSource | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMsg = (text: string) => {
    setMsg(text);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMsg(""), 5000);
  };

  useEffect(() => {
    fetch("/api/gateway/capabilities", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: Capabilities) => {
        const next: Capabilities = {
          skills: j.skills ?? [],
          tools: j.tools ?? [],
          connectors: j.connectors ?? [],
          agents: j.agents ?? [],
        };
        setCaps(next);
        if (next.agents?.length) setChatAgent(next.agents[0]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [thread]);

  useEffect(() => {
    return () => {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    };
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
        const payload = JSON.parse(ev.data as string) as { items?: ChatMsg[] };
        setThread(payload.items ?? []);
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

  useEffect(() => {
    connectStream();
    return () => disconnectStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postChat = async () => {
    if (!chatText.trim()) return;
    await fetch("/api/gateway/chat-thread", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sender: "operator", text: chatText, kind: "human" }),
    });
    setChatText("");
  };

  const askAgent = async () => {
    if (!chatText.trim()) return;
    showMsg(`Enviando a ${chatAgent}...`);
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
        // Send attachment metadata + content (base64) to the gateway
        attachments: attachments.map((a) => ({ name: a.name, content: a.content })),
      }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    showMsg(res.ok ? `Respuesta recibida de ${chatAgent}` : `Error: ${j?.error ?? "chat ask failed"}`);
    if (res.ok) {
      setChatText("");
      setAttachments([]);
    }
  };

  const runRoundtable = async () => {
    const agents = roundAgents.split(",").map((x) => x.trim()).filter(Boolean);
    if (!agents.length) return;
    showMsg("Ejecutando roundtable...");
    const res = await fetch("/api/gateway/chat-roundtable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: chatText || goal, agents, rounds, thinking, action: "query" }),
    });
    const j = (await res.json().catch(() => ({}))) as { items?: unknown[]; error?: string };
    showMsg(res.ok ? `Roundtable completado (${j?.items?.length ?? 0})` : `Error: ${j?.error ?? "roundtable failed"}`);
  };

  const createPlan = async () => {
    showMsg("Generando plan...");
    const res = await fetch("/api/gateway/chat-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goal, use_skills: [], use_tools: [], create_subagents: [], channels: [] }),
    });
    showMsg(res.ok ? "Plan generado (revisar hilo)" : "Error generando plan");
  };

  const onAttach = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      if (attachments.length >= 8) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = (ev.target?.result as string | undefined) ?? "";
        setAttachments((prev) =>
          prev.length < 8
            ? [...prev, { name: file.name, sizeKb: Math.ceil(file.size / 1024), content }]
            : prev
        );
      };
      // Read as data URL (base64) so binary files are safely transmitted
      reader.readAsDataURL(file);
    });
  };

  const connColor = useMemo(() => (conn === "connected" ? "#34d399" : conn === "connecting" ? "#fbbf24" : "#fb7185"), [conn]);

  return (
    <section className="glass-card cauldron-chat" style={{ padding: 12, height: "calc(100vh - 260px)", minHeight: 520, display: "grid", gridTemplateRows: "auto 1fr auto auto", gap: 10 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>Chat de Agentes</h3>
          <small style={{ color: "#94a3b8" }}>Interacción real con agentes lógicos del gateway</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: connColor, fontSize: 12 }}>{conn}</span>
          <button className="card" style={{ padding: "6px 8px" }} onClick={connectStream}>Connect</button>
          <button className="card" style={{ padding: "6px 8px" }} onClick={disconnectStream}>Disconnect</button>
        </div>
      </header>

      <div ref={listRef} style={{ overflow: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.09)", background: "rgba(2,6,23,.75)", padding: 10 }}>
        {thread.length === 0 && <div style={{ color: "#64748b" }}>Sin mensajes todavía.</div>}
        {thread.map((m, i) => {
          const fromAgent = m.kind === "agent" || m.kind === "dispatch";
          return (
            <div key={`${i}-${m.ts ?? "x"}`} style={{ padding: "7px 8px", marginBottom: 8, borderRadius: 10, background: fromAgent ? "rgba(34,211,238,.08)" : "rgba(124,58,237,.09)", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <strong style={{ color: fromAgent ? "#67e8f9" : "#c4b5fd" }}>{m.sender}</strong>
                <span style={{ color: "#94a3b8" }}>{m.ts ?? ""}</span>
              </div>
              <div style={{ marginTop: 3, color: "#e2e8f0", whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr auto auto", gap: 8 }}>
        <select value={chatAgent} onChange={(e) => setChatAgent(e.target.value)} style={field}>
          {(caps.agents.length ? caps.agents : ["alquimista-mayor"]).map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              askAgent();
            }
          }}
          placeholder="Escribe instrucción para el agente..."
          style={field}
        />
        <button className="card" style={{ padding: "8px 10px" }} onClick={postChat}>Solo hilo</button>
        <button className="cta" style={{ padding: "8px 12px" }} onClick={askAgent}>Enviar</button>
      </div>

      <details open={showAdvanced} onToggle={(e) => setShowAdvanced((e.currentTarget as HTMLDetailsElement).open)}>
        <summary style={{ cursor: "pointer", color: "#94a3b8" }}>Opciones avanzadas</summary>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 150px 180px 1fr auto auto", gap: 8 }}>
          <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="repo owner/name" style={field} />
          <select value={thinking} onChange={(e) => setThinking(e.target.value)} style={field}>
            <option value="low">thinking low</option>
            <option value="balanced">thinking balanced</option>
            <option value="deep">thinking deep</option>
          </select>
          <label className="card" style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={autoEdit} onChange={(e) => setAutoEdit(e.target.checked)} /> auto-edit
          </label>
          <input value={roundAgents} onChange={(e) => setRoundAgents(e.target.value)} placeholder="agentes roundtable (coma)" style={field} />
          <input type="number" min={1} max={5} value={rounds} onChange={(e) => setRounds(Number(e.target.value) || 1)} style={{ ...field, width: 60 }} />
          <button className="card" style={{ padding: "8px 10px" }} onClick={runRoundtable}>Roundtable</button>
        </div>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8 }}>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="objetivo para plan" style={field} />
          <input type="file" multiple onChange={(e) => onAttach(e.target.files)} style={field} />
          <button className="card" style={{ padding: "8px 10px" }} onClick={createPlan}>Generar plan</button>
        </div>
        {attachments.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {attachments.map((a, i) => (
              <span key={`${a.name}-${i}`} className="card" style={{ fontSize: 11, padding: "3px 7px" }}>
                {a.name} ({a.sizeKb}KB)
              </span>
            ))}
          </div>
        )}
      </details>

      {msg && <small style={{ color: "#67e8f9" }}>{msg}</small>}
    </section>
  );
}

const field: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.26)",
  color: "#f8fafc",
  padding: "8px 10px",
};
