"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { Activity, Brain, Cpu, Shield, Sparkles, Zap, BookOpen, Eye } from "lucide-react";
import { useDashboardStore, type AgentRole, type AgentStatus } from "@/lib/store/dashboard";

/* ═══════════════════════════════════════════════════════════════
   TIPOS DE NODO
═══════════════════════════════════════════════════════════════ */

export interface AlchemicalNodeData extends Record<string, unknown> {
  agentId: string;
  label: string;
  role: AgentRole;
  status: AgentStatus;
  codename: string;
  avatar: string;
  color: string;
  glow: string;
  model: string;
  successRate: number;
  tasksCompleted: number;
  isSelected?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   CONFIGURACIÓN POR ROL
═══════════════════════════════════════════════════════════════ */

const ROLE_CONFIG: Record<AgentRole, {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  label: string;
  borderStyle: string;
  bgStyle: string;
  pulseColor: string;
}> = {
  "prima-materia": {
    icon: Brain,
    label: "Prima Materia",
    borderStyle: "border-[#FFD700]/40 hover:border-[#FFD700]/80",
    bgStyle: "from-[#FFD700]/8 to-transparent",
    pulseColor: "#FFD700",
  },
  catalyst: {
    icon: Zap,
    label: "Catalizador",
    borderStyle: "border-[#FF4D00]/40 hover:border-[#FF4D00]/80",
    bgStyle: "from-[#FF4D00]/8 to-transparent",
    pulseColor: "#FF4D00",
  },
  refiner: {
    icon: Sparkles,
    label: "Refinador",
    borderStyle: "border-[#10B981]/40 hover:border-[#10B981]/80",
    bgStyle: "from-[#10B981]/8 to-transparent",
    pulseColor: "#10B981",
  },
  scribe: {
    icon: BookOpen,
    label: "Escriba",
    borderStyle: "border-[#F59E0B]/40 hover:border-[#F59E0B]/80",
    bgStyle: "from-[#F59E0B]/8 to-transparent",
    pulseColor: "#F59E0B",
  },
  oracle: {
    icon: Eye,
    label: "Oráculo",
    borderStyle: "border-[#A78BFA]/40 hover:border-[#A78BFA]/80",
    bgStyle: "from-[#A78BFA]/8 to-transparent",
    pulseColor: "#A78BFA",
  },
  sentinel: {
    icon: Shield,
    label: "Centinela",
    borderStyle: "border-[#60A5FA]/40 hover:border-[#60A5FA]/80",
    bgStyle: "from-[#60A5FA]/8 to-transparent",
    pulseColor: "#60A5FA",
  },
  weaver: {
    icon: Activity,
    label: "Tejedor",
    borderStyle: "border-[#8B5CF6]/40 hover:border-[#8B5CF6]/80",
    bgStyle: "from-[#8B5CF6]/8 to-transparent",
    pulseColor: "#8B5CF6",
  },
};

const STATUS_CONFIG: Record<AgentStatus, {
  dot: string;
  label: string;
  animate: boolean;
}> = {
  idle: { dot: "bg-[#2A2A2A] border border-[#444]", label: "En reposo", animate: false },
  active: { dot: "bg-[#10B981]", label: "Activo", animate: true },
  transmuting: { dot: "bg-[#FFD700]", label: "Transmutando", animate: true },
  error: { dot: "bg-[#DC2626]", label: "Error", animate: false },
  dormant: { dot: "bg-[#6B7280]", label: "Dormido", animate: false },
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE NODO ALQUÍMICO
═══════════════════════════════════════════════════════════════ */

export const AlchemicalNode = memo(function AlchemicalNode({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as unknown as AlchemicalNodeData;
  const { selectAgent, setRightPanelTab } = useDashboardStore();

  const roleConfig = ROLE_CONFIG[nodeData.role] || ROLE_CONFIG["prima-materia"];
  const statusConfig = STATUS_CONFIG[nodeData.status] || STATUS_CONFIG.idle;
  const RoleIcon = roleConfig.icon;

  const handleClick = useCallback(() => {
    selectAgent(nodeData.agentId);
    setRightPanelTab("inspector");
  }, [nodeData.agentId, selectAgent, setRightPanelTab]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={handleClick}
      className={`
        relative w-[200px] rounded-xl border transition-all duration-300 cursor-pointer
        bg-gradient-to-b ${roleConfig.bgStyle} bg-[#111111]
        ${roleConfig.borderStyle}
        ${selected ? "ring-2 ring-offset-0 ring-offset-transparent" : ""}
      `}
      style={{
        boxShadow: selected
          ? `0 0 0 2px ${nodeData.color}, 0 0 30px ${nodeData.glow}, 0 4px 20px rgba(0,0,0,0.8)`
          : `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.05)`,
        backgroundColor: "#111111",
      }}
    >
      {/* Handles de conexión */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !rounded-full !transition-all !duration-200"
        style={{
          background: `${nodeData.color}33`,
          borderColor: `${nodeData.color}99`,
          left: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !rounded-full !transition-all !duration-200"
        style={{
          background: `${nodeData.color}33`,
          borderColor: `${nodeData.color}99`,
          right: -6,
        }}
      />

      {/* Glow de fondo cuando activo */}
      {(nodeData.status === "active" || nodeData.status === "transmuting") && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(ellipse at center, ${nodeData.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Header del nodo */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        {/* Avatar / Emoji */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{
            background: `${nodeData.color}15`,
            border: `1px solid ${nodeData.color}30`,
          }}
        >
          {nodeData.avatar}
        </div>

        {/* Nombre y codename */}
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-bold truncate font-cinzel"
            style={{ color: nodeData.color }}
          >
            {nodeData.label}
          </div>
          <div className="text-[10px] text-[#666] truncate">{nodeData.codename}</div>
        </div>

        {/* Indicador de estado */}
        <div className="flex-shrink-0">
          <motion.div
            className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
            animate={statusConfig.animate ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Separador */}
      <div
        className="mx-3 h-px"
        style={{ background: `linear-gradient(90deg, ${nodeData.color}30, transparent)` }}
      />

      {/* Cuerpo del nodo */}
      <div className="px-3 py-2 space-y-2">
        {/* Rol */}
        <div className="flex items-center gap-1.5">
          <RoleIcon size={10} style={{ color: nodeData.color }} />
          <span className="text-[10px] text-[#888]">{roleConfig.label}</span>
        </div>

        {/* Modelo */}
        <div className="flex items-center gap-1.5">
          <Cpu size={10} className="text-[#555]" />
          <span className="text-[10px] text-[#666] font-mono truncate">{nodeData.model}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-center">
            <div className="text-[10px] font-bold" style={{ color: nodeData.color }}>
              {nodeData.successRate}%
            </div>
            <div className="text-[9px] text-[#555]">Éxito</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-[#888]">
              {nodeData.tasksCompleted.toLocaleString()}
            </div>
            <div className="text-[9px] text-[#555]">Tareas</div>
          </div>
          <div className="text-center">
            <div
              className="text-[10px] font-bold"
              style={{ color: nodeData.status === "active" ? "#10B981" : "#555" }}
            >
              {statusConfig.label}
            </div>
            <div className="text-[9px] text-[#555]">Estado</div>
          </div>
        </div>
      </div>

      {/* Barra de progreso de transmutación */}
      {nodeData.status === "transmuting" && (
        <div className="px-3 pb-3">
          <div className="h-0.5 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${nodeData.color}, #FF4D00)` }}
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* Partículas de energía cuando activo */}
      {nodeData.status === "active" && (
        <div className="absolute -top-1 -right-1 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ background: nodeData.color }}
              animate={{
                x: [0, (i - 1) * 8, 0],
                y: [0, -12 - i * 4, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   NODO DE INICIO (Entrada del Círculo)
═══════════════════════════════════════════════════════════════ */

export const CircleInputNode = memo(function CircleInputNode({ selected }: NodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative w-[140px] h-[60px] rounded-full flex items-center justify-center
        border transition-all duration-300
        ${selected ? "border-[#FFD700]/80" : "border-[#FFD700]/30"}
      `}
      style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,77,0,0.05) 100%)",
        boxShadow: selected
          ? "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.1)"
          : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "rgba(255,215,0,0.3)",
          borderColor: "rgba(255,215,0,0.6)",
          right: -6,
        }}
      />
      <div className="text-center">
        <div className="text-lg">⚗️</div>
        <div className="text-[10px] font-cinzel text-[#FFD700]/80 font-bold">INICIO</div>
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   NODO DE SALIDA (Resultado del Círculo)
═══════════════════════════════════════════════════════════════ */

export const CircleOutputNode = memo(function CircleOutputNode({ selected }: NodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative w-[140px] h-[60px] rounded-full flex items-center justify-center
        border transition-all duration-300
        ${selected ? "border-[#10B981]/80" : "border-[#10B981]/30"}
      `}
      style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.03) 100%)",
        boxShadow: selected
          ? "0 0 20px rgba(16,185,129,0.4)"
          : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "rgba(16,185,129,0.3)",
          borderColor: "rgba(16,185,129,0.6)",
          left: -6,
        }}
      />
      <div className="text-center">
        <div className="text-lg">✨</div>
        <div className="text-[10px] font-cinzel text-[#10B981]/80 font-bold">RUBEDO</div>
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   REGISTRO DE TIPOS DE NODO
═══════════════════════════════════════════════════════════════ */

export const NODE_TYPES = {
  alchemical: AlchemicalNode,
  circleInput: CircleInputNode,
  circleOutput: CircleOutputNode,
};
