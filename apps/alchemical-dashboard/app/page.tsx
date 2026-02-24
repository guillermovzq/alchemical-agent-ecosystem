import { StatsHero } from "../components/StatsHero";
import { AgentCard } from "../components/AgentCard";
import { CreateAgentWizard } from "../components/CreateAgentWizard";
import { AgentsTable } from "../components/AgentsTable";
import { LogsMonitor } from "../components/LogsMonitor";
import { agents } from "../lib/mock-data";

export default function Page() {
  return (
    <div className="dashboard-grid">
      <StatsHero />
      <section className="widgets">
        {agents.slice(0, 4).map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </section>
      <section className="two-col">
        <div className="glass-card"><AgentsTable /></div>
        <div className="stack">
          <CreateAgentWizard />
          <LogsMonitor />
        </div>
      </section>
    </div>
  );
}
