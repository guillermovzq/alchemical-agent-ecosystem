"use client";

import { useCallback, useEffect, useState } from "react";
import { StatsHero } from "../components/StatsHero";
import { AgentCard } from "../components/AgentCard";
import { CreateAgentWizard } from "../components/CreateAgentWizard";
import { AgentsTable } from "../components/AgentsTable";
import { LogsMonitor } from "../components/LogsMonitor";
import { SettingsPanel } from "../components/SettingsPanel";
import { ChatWorkbench } from "../components/ChatWorkbench";
import { CanvasLab } from "../components/CanvasLab";
import { JobsEventsPanel } from "../components/JobsEventsPanel";
import type { DashboardPayload } from "../lib/types";
import type { DashboardConfig } from "../lib/config";

const defaultCfg: DashboardConfig = {
  agentPollMs: 5000,
  logsPollMs: 5000,
  logsLines: 50,
  defaultLogService: "velktharion",
};

export default function Page() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [cfg, setCfg] = useState<DashboardConfig>(defaultCfg);

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

  if (!data) return <div className="glass-card" style={{ padding: 20 }}>Cargando estado real de agentes...</div>;

  return (
    <div className="dashboard-grid">
      <StatsHero stats={data.stats} />
      <section className="widgets">
        {data.items.slice(0, 4).map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </section>
      <section className="two-col">
        <div className="glass-card"><AgentsTable agents={data.items} /></div>
        <div className="stack">
          <CreateAgentWizard />
          <ChatWorkbench />
          <CanvasLab />
          <JobsEventsPanel />
          <SettingsPanel onChange={onCfg} />
          <LogsMonitor defaultService={cfg.defaultLogService} linesCount={cfg.logsLines} />
        </div>
      </section>
    </div>
  );
}
