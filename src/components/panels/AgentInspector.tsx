"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Cpu,
  Activity,
  CheckCircle2,
  Clock,
  Database,
  Zap,
  TrendingUp,
  MemoryStick,
  ChevronRight,
  Play,
  Settings,
} from "lucide-react";
import { useDashboardStore, type AlchemicalAgent } from "@/lib/store/dashboard";

/* ═══════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  suffix = "",
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  suffix?: string;
}) {
  return (
    <div
      className="p-3 rounded-lg border"
      style={{
        background: `${color}08`,
        borderColor: `${color}20`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={10} style={{ color }} />
        <span className="text-[9px] text-[#555] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-bold font-mono" style={{ color }}>
        {value}
        {suffix && <span className="text-xs ml-0.5 opacity-60">{suffix}</span>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILL BADGE
═══════════════════════════════════════════════════════════════ */

function SkillBadge({ skill, color }: { skill: string; color: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}25`,
        color: `${color}CC`,
      }}
    >
      {skill}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY BAR
═══════════════════════════════════════════════════════════════ */

function MemoryBar({ usage, color }: { usage: number; color: string }) {
  const getMemoryStatus = (u: number) => {
    if (u < 40) return { label: "Óptimo", color: "#10B981" };
    if (u < 70) return { label: "Normal", color: "#FFD700" };
    return { label: "Alto", color: "#FF4D00" };
  };

  const status = getMemoryStatus(usage);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MemoryStick size={10} className="text-[#555]" />
          <span className="text-[10px] text-[#666]">Uso de Memoria</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono" style={{ color: status.color }}>
            {usage}%
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{ background: `${status.color}15`, color: status.color }}
          >
            {status.label}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${usage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${color}, ${status.color})`,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ESTADO VACÍO
═══════════════════════════════════════════════════════════════ */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full py-12 px-4 text-center"
    >
      <motion.div
        className="text-4xl mb-4"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        🔮
      </motion.div>
      <p className="text-sm font-cinzel text-[#FFD700]/40 mb-2">Sin Agente Seleccionado</p>
      <p className="text-[11px] text-[#444] leading-relaxed">
        Haz clic en un nodo del canvas para inspeccionar el agente alquímico
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INSPECTOR PRINCIPAL
═══════════════════════════════════════════════════════════════ */

function AgentDetail({ agent }: { agent: AlchemicalAgent }) {
  const { addConsoleEntry, updateAgent } = useDashboardStore();

  const handleActivate = () => {
    updateAgent(agent.id, { status: "active" });
    addConsoleEntry({
      level: "success",
      message: `✓ ${agent.name} (${agent.codename}) activado manualmente.`,
    });
  };

  const statusColors: Record<string, string> = {
    idle: "#555",
    active: "#10B981",
    transmuting: "#FFD700",
    error: "#DC2626",
    dormant: "#6B7280",
  };

  const statusLabels: Record<string, string> = {
    idle: "En reposo",
    active: "Activo",
    transmuting: "Transmutando",
    error: "Error",
    dormant: "Dormido",
  };

  return (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 p-4"
    >
      {/* Header del agente */}
      <div
        className="p-4 rounded-xl border"
        style={{
          background: `${agent.color}08`,
          borderColor: `${agent.color}20`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: `${agent.color}15`,
              border: `1px solid ${agent.color}30`,
              boxShadow: `0 0 20px ${agent.glow}`,
            }}
          >
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-cinzel font-bold text-sm" style={{ color: agent.color }}>
                {agent.name}
              </h3>
              <motion.div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: statusColors[agent.status] }}
                animate={
                  agent.status === "active" || agent.status === "transmuting"
                    ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <p className="text-[11px] text-[#888] mb-1">{agent.codename}</p>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{
                background: `${statusColors[agent.status]}15`,
                color: statusColors[agent.status],
                border: `1px solid ${statusColors[agent.status]}30`,
              }}
            >
              {statusLabels[agent.status]}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#777] mt-3 leading-relaxed">{agent.description}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Tasa de Éxito"
          value={agent.successRate}
          icon={TrendingUp}
          color={agent.color}
          suffix="%"
        />
        <StatCard
          label="Tareas"
          value={agent.tasksCompleted.toLocaleString()}
          icon={CheckCircle2}
          color="#10B981"
        />
        <StatCard
          label="Modelo LLM"
          value={agent.model.split(":")[0]}
          icon={Cpu}
          color="#60A5FA"
        />
        <StatCard
          label="Rol"
          value={agent.role.replace("-", " ")}
          icon={Brain}
          color="#8B5CF6"
        />
      </div>

      {/* Memoria */}
      <div
        className="p-3 rounded-lg border border-[#2A2A2A]"
        style={{ background: "rgba(17,17,17,0.6)" }}
      >
        <MemoryBar usage={agent.memoryUsage} color={agent.color} />
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={10} style={{ color: agent.color }} />
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Habilidades</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agent.skills.map((skill) => (
            <SkillBadge key={skill} skill={skill} color={agent.color} />
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-2 pt-2 border-t border-[#1A1A1A]">
        <motion.button
          onClick={handleActivate}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: `${agent.color}10`,
            border: `1px solid ${agent.color}25`,
            color: agent.color,
          }}
          whileHover={{ scale: 1.01, boxShadow: `0 0 15px ${agent.glow}` }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Play size={12} />
            <span>Activar Agente</span>
          </div>
          <ChevronRight size={12} className="opacity-50" />
        </motion.button>

        <motion.button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-[#666] border border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#888]"
          style={{ background: "rgba(17,17,17,0.6)" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Settings size={12} />
            <span>Configurar Agente</span>
          </div>
          <ChevronRight size={12} className="opacity-50" />
        </motion.button>

        <motion.button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-[#666] border border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#888]"
          style={{ background: "rgba(17,17,17,0.6)" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Database size={12} />
            <span>Ver Memoria</span>
          </div>
          <ChevronRight size={12} className="opacity-50" />
        </motion.button>

        <motion.button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-[#666] border border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#888]"
          style={{ background: "rgba(17,17,17,0.6)" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <Activity size={12} />
            <span>Telemetría</span>
          </div>
          <ChevronRight size={12} className="opacity-50" />
        </motion.button>
      </div>

      {/* Última actividad */}
      <div className="flex items-center gap-2 text-[10px] text-[#444]">
        <Clock size={10} />
        <span>Última actividad: hace 2 horas</span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE EXPORTADO
═══════════════════════════════════════════════════════════════ */

export default function AgentInspector() {
  const { selectedAgentId, agents } = useDashboardStore();

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) || null,
    [agents, selectedAgentId]
  );

  return (
    <div className="h-full overflow-y-auto">
      <AnimatePresence mode="wait">
        {selectedAgent ? (
          <AgentDetail key={selectedAgent.id} agent={selectedAgent} />
        ) : (
          <EmptyState key="empty" />
        )}
      </AnimatePresence>
    </div>
  );
}
