"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  AlertCircle,
  Bot,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { AgentRow } from "../lib/types";
import { useAgentsStore } from "../lib/stores";

interface AgentsTableProps {
  agents: AgentRow[];
}

const statusConfig = {
  Running: {
    icon: Play,
    color: "text-emerald",
    bg: "bg-emerald/10",
    border: "border-emerald/20",
    label: "Activo",
  },
  Paused: {
    icon: Pause,
    color: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/20",
    label: "Pausado",
  },
  Error: {
    icon: AlertCircle,
    color: "text-rose",
    bg: "bg-rose/10",
    border: "border-rose/20",
    label: "Error",
  },
};

export function AgentsTable({ agents }: AgentsTableProps) {
  const { searchQuery, setSearchQuery, statusFilter, setStatusFilter, selectAgent } =
    useAgentsStore();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      !searchQuery ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold/10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-turq/10">
            <Bot className="w-4 h-4 text-turq" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Agentes Registrados</h3>
            <p className="text-xs text-muted-foreground">{filteredAgents.length} agentes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar agentes..."
              className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-gold/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 w-48"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30 appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="Running">Activos</option>
              <option value="Paused">Pausados</option>
              <option value="Error">Con Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Agente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Latencia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contenedor
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No se encontraron agentes
                </td>
              </tr>
            ) : (
              filteredAgents.map((agent, index) => {
                const status = statusConfig[agent.status] || statusConfig.Error;
                const StatusIcon = status.icon;

                return (
                  <motion.tr
                    key={agent.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredRow(agent.name)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={cn(
                      "border-b border-gold/5 transition-colors cursor-pointer",
                      hoveredRow === agent.name ? "bg-gold/5" : ""
                    )}
                    onClick={() => selectAgent(agent.name)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-gold">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.service}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{agent.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-muted-foreground">
                        {agent.model}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
                          status.bg,
                          status.border,
                          status.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{status.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span
                          className={cn(
                            agent.latencyMs && agent.latencyMs < 100
                              ? "text-emerald"
                              : agent.latencyMs && agent.latencyMs < 500
                              ? "text-amber"
                              : "text-rose"
                          )}
                        >
                          {agent.latencyMs ? `${agent.latencyMs}ms` : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            agent.containerState === "running"
                              ? "bg-emerald animate-pulse"
                              : "bg-rose"
                          )}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {agent.containerState}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
