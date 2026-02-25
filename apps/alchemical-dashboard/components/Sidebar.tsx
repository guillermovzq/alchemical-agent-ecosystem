"use client";

import { useEffect, useState } from "react";
import { FlaskConical, LayoutDashboard, Bot, WandSparkles, Settings2, Logs, CircleHelp, type LucideIcon } from "lucide-react";

type View = "chat" | "nodes" | "agents" | "ops" | "admin" | "logs";

const items: Array<{ label: string; Icon: LucideIcon; view: View }> = [
  { label: "Chat", Icon: WandSparkles, view: "chat" },
  { label: "Nodos agentes", Icon: Bot, view: "nodes" },
  { label: "Agentes", Icon: LayoutDashboard, view: "agents" },
  { label: "Operaciones", Icon: CircleHelp, view: "ops" },
  { label: "Logs", Icon: Logs, view: "logs" },
  { label: "Admin", Icon: Settings2, view: "admin" },
];

type CoreService = { name: string; state: string; status: string; health: "healthy" | "down" | "unknown" };

export function Sidebar() {
  const [services, setServices] = useState<CoreService[]>([]);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const r = await fetch("/api/system", { cache: "no-store" });
      const j = await r.json();
      if (!stop) setServices(j.services ?? []);
    };
    load();
    const id = setInterval(load, 12000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const goView = (view: View) => {
    window.dispatchEvent(new CustomEvent("alchemical:set-view", { detail: view }));
  };

  return (
    <aside className="glass-card gradient-frame" style={{ margin: 12, padding: 14, position: "sticky", top: 12, height: "calc(100vh - 24px)" }}>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <FlaskConical size={22} color="#22d3ee" />
          <strong style={{ fontFamily: "ui-sans-serif, system-ui", fontSize: 18 }}>Alchemical Gateway</strong>
        </div>
        <img src="/alchemical-logo.svg" alt="Alchemical logo" style={{ width: "100%", height: 30, objectFit: "contain", filter: "drop-shadow(0 2px 14px rgba(34,211,238,.25))" }} />
      </div>

      <nav style={{ display: "grid", gap: 8 }}>
        {items.map(({ label, Icon, view }) => (
          <button
            key={label}
            className="card"
            onClick={() => goView(view)}
            style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", color: "#e5e7eb", background: "rgba(255,255,255,.03)", borderRadius: 12 }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {services.length === 0 && <small style={{ color: "#94a3b8" }}>Cargando estado core...</small>}
        {services.map((s) => <Status key={s.name} label={s.name} state={s.health} />)}
      </div>
    </aside>
  );
}

function Status({ label, state }: { label: string; state: "healthy" | "down" | "unknown" }) {
  const color = state === "healthy" ? "#34d399" : state === "down" ? "#fb7185" : "#fbbf24";
  return <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{label}</span><span style={{ color }}>{state}</span></div>;
}
