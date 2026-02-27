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
  const [activeView, setActiveView] = useState<View>("chat");

  // Keep activeView in sync with page navigation events
  useEffect(() => {
    const h = (ev: Event) => {
      const next = (ev as CustomEvent<View>).detail;
      if (next) setActiveView(next);
    };
    window.addEventListener("alchemical:set-view", h as EventListener);
    return () => window.removeEventListener("alchemical:set-view", h as EventListener);
  }, []);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch("/api/system", { cache: "no-store" });
        const j = await r.json();
        if (!stop) setServices(j.services ?? []);
      } catch {
        // Silently fail — sidebar status is non-critical
      }
    };
    load();
    const id = setInterval(load, 12000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const goView = (view: View) => {
    setActiveView(view);
    window.dispatchEvent(new CustomEvent("alchemical:set-view", { detail: view }));
  };

  return (
    <aside className="glass-card gradient-frame" style={{ margin: 12, padding: 14, position: "sticky", top: 12, height: "calc(100vh - 24px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <FlaskConical size={22} color="#22d3ee" />
          <strong style={{ fontFamily: "ui-sans-serif, system-ui", fontSize: 18 }}>Alchemical Gateway</strong>
        </div>
        {/* Logo with graceful fallback — onerror hides the image if SVG is missing */}
        <img
          src="/alchemical-logo.svg"
          alt="Alchemical logo"
          style={{ width: "100%", height: 30, objectFit: "contain", filter: "drop-shadow(0 2px 14px rgba(34,211,238,.25))" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      <nav style={{ display: "grid", gap: 8 }}>
        {items.map(({ label, Icon, view }) => {
          const isActive = activeView === view;
          return (
            <button
              key={label}
              className="card"
              onClick={() => goView(view)}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "10px 12px",
                color: isActive ? "#67e8f9" : "#e5e7eb",
                background: isActive ? "rgba(34,211,238,.10)" : "rgba(255,255,255,.03)",
                borderRadius: 12,
                borderColor: isActive ? "rgba(34,211,238,.35)" : undefined,
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              <Icon size={16} /> {label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 16, display: "grid", gap: 8 }}>
        {services.length === 0 && <small style={{ color: "#94a3b8" }}>Cargando estado core...</small>}
        {services.map((s) => <Status key={s.name} label={s.name} state={s.health} />)}
      </div>
    </aside>
  );
}

function Status({ label, state }: { label: string; state: "healthy" | "down" | "unknown" }) {
  const color = state === "healthy" ? "#34d399" : state === "down" ? "#fb7185" : "#fbbf24";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span>{label}</span>
      <span style={{ color }}>{state}</span>
    </div>
  );
}
