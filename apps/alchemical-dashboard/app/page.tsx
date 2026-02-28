"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { HeaderBar } from "../components/HeaderBar";
import { ChatWorkbench } from "../components/ChatWorkbench";
import { AgentNodeStudio } from "../components/AgentNodeStudio";
import { AgentsTable } from "../components/AgentsTable";
import { StatsHero } from "../components/StatsHero";
import { JobsEventsPanel } from "../components/JobsEventsPanel";
import { LogsMonitor } from "../components/LogsMonitor";
import { AdminOpsPanel } from "../components/AdminOpsPanel";
import { SettingsPanel } from "../components/SettingsPanel";
import { useAppStore } from "../lib/stores";
import { useAgents } from "../lib/hooks";
import { cn } from "../lib/utils";

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  chat: {
    title: "Chat del Caldero",
    subtitle: "Interacción en tiempo real con agentes alquímicos",
  },
  nodes: {
    title: "Agent Node Studio",
    subtitle: "Orquestación visual de flujos multi-agente",
  },
  agents: {
    title: "Runtime de Agentes",
    subtitle: "Monitorización y control de agentes activos",
  },
  ops: {
    title: "Operaciones",
    subtitle: "Jobs, eventos y métricas del sistema",
  },
  logs: {
    title: "Logs & Telemetría",
    subtitle: "Streaming SSE de logs en tiempo real",
  },
  admin: {
    title: "Administración",
    subtitle: "Configuración del sistema y operaciones",
  },
};

export default function DashboardPage() {
  const { activeView } = useAppStore();
  const { data: agentsData } = useAgents();

  const currentView = viewTitles[activeView] || viewTitles.chat;

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar />

        {/* View Header */}
        <div className="px-6 py-4 border-b border-gold/5">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-foreground">
              {currentView.title}
            </h2>
            <p className="text-sm text-muted-foreground">{currentView.subtitle}</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className="h-full p-6 overflow-auto custom-scrollbar"
            >
              {activeView === "chat" && <ChatWorkbench />}

              {activeView === "nodes" && <AgentNodeStudio />}

              {activeView === "agents" && (
                <div className="space-y-6">
                  <StatsHero stats={agentsData?.stats} />
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                      <AgentsTable agents={agentsData?.items || []} />
                    </div>
                    <div>
                      <JobsEventsPanel />
                    </div>
                  </div>
                </div>
              )}

              {activeView === "ops" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <JobsEventsPanel />
                  <div className="space-y-6">
                    <AdminOpsPanel />
                  </div>
                </div>
              )}

              {activeView === "logs" && <LogsMonitor />}

              {activeView === "admin" && (
                <div className="max-w-4xl mx-auto">
                  <SettingsPanel />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
