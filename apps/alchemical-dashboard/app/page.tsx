"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { StatsHero } from "../components/StatsHero";
import { AgentCard } from "../components/AgentCard";
import { AgentsTable } from "../components/AgentsTable";
import type { DashboardPayload } from "../lib/types";
import type { DashboardConfig } from "../lib/config";

const CreateAgentWizard = dynamic(() => import("../components/CreateAgentWizard").then((m) => m.CreateAgentWizard), { ssr: false });
const ChatWorkbench = dynamic(() => import("../components/ChatWorkbench").then((m) => m.ChatWorkbench), { ssr: false });
const AgentNodeStudio = dynamic(() => import("../components/AgentNodeStudio").then((m) => m.AgentNodeStudio), { ssr: false });
const CanvasLab = dynamic(() => import("../components/CanvasLab").then((m) => m.CanvasLab), { ssr: false });
const JobsEventsPanel = dynamic(() => import("../components/JobsEventsPanel").then((m) => m.JobsEventsPanel), { ssr: false });
const AdminOpsPanel = dynamic(() => import("../components/AdminOpsPanel").then((m) => m.AdminOpsPanel), { ssr: false });
const UsagePanel = dynamic(() => import("../components/UsagePanel").then((m) => m.UsagePanel), { ssr: false });
const SettingsPanel = dynamic(() => import("../components/SettingsPanel").then((m) => m.SettingsPanel), { ssr: false });
const LogsMonitor = dynamic(() => import("../components/LogsMonitor").then((m) => m.LogsMonitor), { ssr: false });

const defaultCfg: DashboardConfig = {
  agentPollMs: 5000,
  logsPollMs: 5000,
  logsLines: 50,
  defaultLogService: "velktharion",
};

function Accordion({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button className="card" onClick={onToggle} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", marginBottom: 10 }}>
      <strong>{title}</strong>
      <span style={{ color: "#67e8f9" }}>{open ? "−" : "+"}</span>
    </button>
  );
}

const tabBtn = (active: boolean): CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 12,
  borderColor: active ? "rgba(34,211,238,.6)" : "rgba(255,255,255,.14)",
  color: active ? "#67e8f9" : "#cbd5e1",
  background: active ? "rgba(34,211,238,.1)" : "rgba(255,255,255,.04)",
});

export default function Page() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [cfg, setCfg] = useState<DashboardConfig>(defaultCfg);
  const [tab, setTab] = useState<"ops" | "chat" | "admin">("chat");
  const [open, setOpen] = useState<Record<string, boolean>>({
    wizard: false,
    canvas: false,
    logs: true,
  });

  const onCfg = useCallback((c: DashboardConfig) => setCfg(c), []);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = await res.json();
      if (!stop) setData(json);
    };
    load();
    const id = setInterval(load, cfg.agentPollMs);
    return () => { stop = true; clearInterval(id); };
  }, [cfg.agentPollMs]);

  useEffect(() => {
    const h = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as "ops" | "chat" | "admin";
      if (detail) setTab(detail);
    };
    window.addEventListener("alchemical:set-tab", h as EventListener);
    return () => window.removeEventListener("alchemical:set-tab", h as EventListener);
  }, []);

  if (!data) return <div className="glass-card" style={{ padding: 20 }}>Cargando estado real de agentes...</div>;

  return (
    <div className="dashboard-grid">
      <section id="section-dashboard">
        <StatsHero stats={data.stats} />
      </section>

      <section className="widgets" id="section-widgets">
        {data.items.slice(0, 4).map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </section>

      <section className="two-col">
        <div className="glass-card" id="section-agentes"><AgentsTable agents={data.items} /></div>
        <div className="stack">
          <section className="glass-card" style={{ padding: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="card" style={tabBtn(tab === "ops")} onClick={() => setTab("ops")}>Operaciones</button>
              <button className="card" style={tabBtn(tab === "chat")} onClick={() => setTab("chat")}>Chat & Realtime</button>
              <button className="card" style={tabBtn(tab === "admin")} onClick={() => setTab("admin")}>Admin & Config</button>
            </div>
          </section>

          {tab === "ops" && (
            <>
              <section id="section-jobs"><JobsEventsPanel /></section>
              <section id="section-usage"><UsagePanel /></section>
              <section id="section-canvas" className="glass-card" style={{ padding: 12 }}>
                <Accordion title="Canvas Lab" open={open.canvas} onToggle={() => setOpen((s) => ({ ...s, canvas: !s.canvas }))} />
                {open.canvas && <CanvasLab />}
              </section>
              <section id="section-logs" className="glass-card" style={{ padding: 12 }}>
                <Accordion title="Logs Monitor" open={open.logs} onToggle={() => setOpen((s) => ({ ...s, logs: !s.logs }))} />
                {open.logs && <LogsMonitor defaultService={cfg.defaultLogService} linesCount={cfg.logsLines} />}
              </section>
            </>
          )}

          {tab === "chat" && (
            <>
              <section id="section-node-studio"><AgentNodeStudio /></section>
              <section id="section-chat"><ChatWorkbench /></section>
              <section id="section-crear-agente" className="glass-card" style={{ padding: 12 }}>
                <Accordion title="Crear agente" open={open.wizard} onToggle={() => setOpen((s) => ({ ...s, wizard: !s.wizard }))} />
                {open.wizard && <CreateAgentWizard />}
              </section>
            </>
          )}

          {tab === "admin" && (
            <>
              <section id="section-admin"><AdminOpsPanel /></section>
              <section id="section-settings"><SettingsPanel onChange={onCfg} /></section>
            </>
          )}

          <section id="section-ayuda" className="glass-card" style={{ padding: 14 }}>
            <h3 style={{ marginTop: 0 }}>Ayuda rápida</h3>
            <p style={{ color: "#94a3b8", marginBottom: 0 }}>
              Usa pestañas para reducir carga visual y acordeones para abrir solo lo que necesitas.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
