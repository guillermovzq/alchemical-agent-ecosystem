"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
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

// This view type matches the sidebar navigation items exactly.
// The lib/types.ts View is broader (includes dashboard/studio/jobs/etc. for future use).
type View = "chat" | "nodes" | "agents" | "ops" | "admin" | "logs";

const defaultCfg: DashboardConfig = {
  agentPollMs: 10000,
  logsPollMs: 5000,
  logsLines: 50,
  defaultLogService: "velktharion",
};

const needsAgentData = new Set<View>(["agents", "nodes", "ops"]);

export default function Page() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [cfg, setCfg] = useState<DashboardConfig>(defaultCfg);
  const [view, setView] = useState<View>("chat");

  const onCfg = useCallback((c: DashboardConfig) => setCfg(c), []);

  useEffect(() => {
    const h = (ev: Event) => {
      const next = (ev as CustomEvent<View>).detail;
      if (next) setView(next);
    };
    window.addEventListener("alchemical:set-view", h as EventListener);
    return () => window.removeEventListener("alchemical:set-view", h as EventListener);
  }, []);

  useEffect(() => {
    if (!needsAgentData.has(view)) return;
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch("/api/agents", { cache: "no-store" });
        const json = await res.json();
        if (!stop) setData(json);
      } catch {
        if (!stop) setData({ items: [], stats: { active: 0, total: 0, tasksToday: null, tokensProcessed: null, uptimeAvg: 0 } });
      }
    };
    load();
    const id = setInterval(load, cfg.agentPollMs);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [cfg.agentPollMs, view]);

  const quickCards = useMemo(() => data?.items?.slice(0, 4) || [], [data]);

  const title = ({
    chat: "💬 Chat del Caldero",
    nodes: "🧩 Agent Node Studio",
    agents: "🤖 Runtime de Agentes",
    ops: "📊 Operaciones",
    logs: "📜 Logs",
    admin: "🛠️ Administración",
  } as const)[view];

  return (
    <div className="dashboard-grid" style={{ height: "100%", minHeight: 0 }}>
      <section className="glass-card" style={{ padding: 12, flex: 1, minHeight: 0, overflow: "auto" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 2, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(8px)" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <small style={{ color: "#94a3b8" }}>Vista única activa (sin paneles duplicados) para reducir lag y ruido visual.</small>
        </div>
        {view === "chat" && <ChatWorkbench />}

        {view === "nodes" && <AgentNodeStudio />}

        {view === "agents" && (
          <>
            {!data ? <div>Cargando agentes reales...</div> : (
              <>
                <StatsHero stats={data.stats} />
                <section className="widgets" style={{ marginTop: 10 }}>
                  {quickCards.map((agent) => <AgentCard key={agent.name} agent={agent} />)}
                </section>
                <div className="glass-card" style={{ marginTop: 10 }}><AgentsTable agents={data.items} /></div>
              </>
            )}
          </>
        )}

        {view === "ops" && (
          <div className="stack">
            <JobsEventsPanel />
            <UsagePanel />
            <CanvasLab />
          </div>
        )}

        {view === "logs" && <LogsMonitor defaultService={cfg.defaultLogService} linesCount={cfg.logsLines} />}

        {view === "admin" && (
          <div className="stack">
            <AdminOpsPanel />
            <SettingsPanel onChange={onCfg} />
            <CreateAgentWizard />
          </div>
        )}
      </section>
    </div>
  );
}
