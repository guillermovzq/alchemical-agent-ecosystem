"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Agent = {
  name: string;
  role: string;
  model: string;
  tools: string[];
  skills: string[];
  enabled: boolean;
  parent?: string | null;
  target_service?: string | null;
};

type Capabilities = { skills: string[]; tools: string[] };
type Pos = Record<string, { x: number; y: number }>;

const NODE_W = 170;
const NODE_H = 68;

export function AgentNodeStudio() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [caps, setCaps] = useState<Capabilities>({ skills: [], tools: [] });
  const [selected, setSelected] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [pos, setPos] = useState<Pos>({});
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const [aRes, cRes] = await Promise.all([
        fetch("/api/gateway/agents", { cache: "no-store" }),
        fetch("/api/gateway/capabilities", { cache: "no-store" }),
      ]);
      const a = await aRes.json();
      const c = await cRes.json();
      const items: Agent[] = a.items ?? [];
      setAgents(items);
      setCaps({ skills: c.skills ?? [], tools: c.tools ?? [] });
      setSelected(items[0]?.name || "");

      setPos((prev) => {
        const next = { ...prev };
        items.forEach((ag, i) => {
          if (!next[ag.name]) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            next[ag.name] = { x: 18 + col * 190, y: 22 + row * 112 };
          }
        });
        return next;
      });
    };
    load();
  }, []);

  const selectedAgent = useMemo(() => agents.find((a) => a.name === selected), [agents, selected]);

  const mutateAgent = (fn: (a: Agent) => Agent) => {
    setAgents((prev) => prev.map((a) => (a.name === selected ? fn(a) : a)));
  };

  const toggleTag = (kind: "skills" | "tools", tag: string) => {
    mutateAgent((a) => {
      const list = new Set(a[kind]);
      if (list.has(tag)) list.delete(tag);
      else list.add(tag);
      return { ...a, [kind]: Array.from(list).sort() };
    });
  };

  const saveAgent = async () => {
    if (!selectedAgent) return;
    setMsg(`Guardando ${selectedAgent.name}...`);
    const res = await fetch("/api/gateway/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(selectedAgent),
    });
    setMsg(res.ok ? `✅ ${selectedAgent.name} actualizado` : `❌ error actualizando ${selectedAgent.name}`);
  };

  const onPointerDown = (id: string, ev: React.PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return;
    const p = pos[id] || { x: 0, y: 0 };
    const x = ev.clientX - board.left;
    const y = ev.clientY - board.top;
    dragRef.current = { id, dx: x - p.x, dy: y - p.y };
    (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId);
  };

  const onPointerMove = (ev: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return;

    const { id, dx, dy } = dragRef.current;
    const x = ev.clientX - board.left - dx;
    const y = ev.clientY - board.top - dy;

    setPos((prev) => ({
      ...prev,
      [id]: {
        x: Math.max(8, Math.min(board.width - NODE_W - 8, x)),
        y: Math.max(8, Math.min(board.height - NODE_H - 8, y)),
      },
    }));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <section className="glass-card" style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Agent Node Studio</h3>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>Organigrama interactivo: arrastra nodos y vincula skills/tools como etiquetas.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 10 }}>
        <div
          ref={boardRef}
          className="card"
          style={{ position: "relative", height: 430, overflow: "hidden", background: "radial-gradient(circle at 20% 15%, rgba(34,211,238,.09), transparent 38%), radial-gradient(circle at 85% 80%, rgba(124,58,237,.11), transparent 42%), #0a101a" }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {agents.map((a) => {
              if (!a.parent || !pos[a.name] || !pos[a.parent]) return null;
              const from = pos[a.parent];
              const to = pos[a.name];
              return (
                <path
                  key={`${a.parent}-${a.name}`}
                  d={`M ${from.x + NODE_W * 0.6} ${from.y + NODE_H * 0.5} C ${from.x + NODE_W + 40} ${from.y + NODE_H * 0.5}, ${to.x - 40} ${to.y + NODE_H * 0.5}, ${to.x + 14} ${to.y + NODE_H * 0.5}`}
                  stroke="rgba(103,232,249,.45)"
                  strokeWidth="1.6"
                  fill="none"
                  strokeDasharray="4 6"
                />
              );
            })}
          </svg>

          {agents.map((a) => (
            <div
              key={a.name}
              onPointerDown={(ev) => onPointerDown(a.name, ev)}
              onClick={() => setSelected(a.name)}
              className="card"
              style={{
                position: "absolute",
                left: pos[a.name]?.x ?? 18,
                top: pos[a.name]?.y ?? 16,
                width: NODE_W,
                minHeight: NODE_H,
                padding: 9,
                cursor: "grab",
                borderColor: selected === a.name ? "rgba(34,211,238,.7)" : "rgba(255,255,255,.16)",
                boxShadow: selected === a.name ? "0 0 0 1px rgba(34,211,238,.3), 0 10px 22px rgba(0,0,0,.35)" : undefined,
              }}
            >
              <strong style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</strong>
              <small style={{ color: "#94a3b8" }}>{a.target_service || "no-target"}</small>
              <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                {a.skills.slice(0, 2).map((s) => <span key={s} className="card" style={{ padding: "2px 6px", fontSize: 10 }}>{s}</span>)}
                {a.tools.slice(0, 1).map((t) => <span key={t} className="card" style={{ padding: "2px 6px", fontSize: 10, color: "#86efac" }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 10, maxHeight: 430, overflow: "auto" }}>
          {!selectedAgent ? <div style={{ color: "#94a3b8" }}>Selecciona un nodo.</div> : (
            <>
              <h4 style={{ margin: "0 0 8px" }}>{selectedAgent.name}</h4>
              <small style={{ color: "#94a3b8" }}>{selectedAgent.role}</small>

              <label style={lbl}>Skills</label>
              <div style={chips}>
                {caps.skills.map((s) => (
                  <button key={s} className="card" style={chip(selectedAgent.skills.includes(s))} onClick={() => toggleTag("skills", s)}>{s}</button>
                ))}
              </div>

              <label style={lbl}>Tools</label>
              <div style={chips}>
                {caps.tools.map((t) => (
                  <button key={t} className="card" style={chip(selectedAgent.tools.includes(t))} onClick={() => toggleTag("tools", t)}>{t}</button>
                ))}
              </div>

              <button className="cta" style={{ marginTop: 10 }} onClick={saveAgent}>Guardar agente</button>
              {msg && <div style={{ marginTop: 8, color: "#67e8f9", fontSize: 12 }}>{msg}</div>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const lbl: React.CSSProperties = { display: "block", marginTop: 10, fontSize: 12, color: "#94a3b8" };
const chips: React.CSSProperties = { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, maxHeight: 140, overflow: "auto" };
const chip = (active: boolean): React.CSSProperties => ({
  padding: "5px 8px",
  borderRadius: 10,
  color: active ? "#67e8f9" : "#cbd5e1",
  borderColor: active ? "rgba(34,211,238,.5)" : "rgba(255,255,255,.14)",
});
