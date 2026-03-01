"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Circle,
  Layers,
  Cpu,
  Zap,
  Star,
  Clock,
  Trash2,
  Play,
  MoreHorizontal,
  FlaskConical,
} from "lucide-react";
import { useDashboardStore, type AlchemicalAgent, type AlchemicalCircle } from "@/lib/store/dashboard";

/* ═══════════════════════════════════════════════════════════════
   SECCIÓN COLAPSABLE
═══════════════════════════════════════════════════════════════ */

function SidebarSection({
  title,
  icon: Icon,
  count,
  children,
  defaultOpen = true,
  action,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FFD700]/3 transition-colors group"
      >
        <Icon size={11} className="text-[#FFD700]/40 flex-shrink-0" />
        <span className="text-[10px] font-cinzel text-[#FFD700]/50 uppercase tracking-wider flex-1 text-left">
          {title}
        </span>
        {count !== undefined && (
          <span className="text-[9px] text-[#444] bg-[#1A1A1A] px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight size={10} className="text-[#333] group-hover:text-[#555]" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ITEM DE CÍRCULO
═══════════════════════════════════════════════════════════════ */

const PHASE_COLORS = {
  nigredo: "#1A1A1A",
  albedo: "#E5E7EB",
  citrinitas: "#FFD700",
  rubedo: "#FF4D00",
};

const PHASE_LABELS = {
  nigredo: "Nigredo",
  albedo: "Albedo",
  citrinitas: "Citrinitas",
  rubedo: "Rubedo",
};

function CircleItem({ circle }: { circle: AlchemicalCircle }) {
  const { selectedCircleId, selectCircle, deleteCircle, addConsoleEntry } = useDashboardStore();
  const isSelected = selectedCircleId === circle.id;
  const phaseColor = PHASE_COLORS[circle.phase];

  const handleSelect = () => {
    selectCircle(circle.id);
    addConsoleEntry({
      level: "info",
      message: `→ Círculo seleccionado: "${circle.name}"`,
    });
  };

  return (
    <motion.div
      className={`
        group flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all
        ${isSelected ? "bg-[#FFD700]/8 border border-[#FFD700]/20" : "hover:bg-[#FFD700]/3 border border-transparent"}
      `}
      onClick={handleSelect}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Indicador de fase */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: phaseColor,
          boxShadow: isSelected ? `0 0 6px ${phaseColor}` : "none",
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-xs truncate ${isSelected ? "text-[#FFD700]/90" : "text-[#888]"}`}>
          {circle.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] text-[#444]">{circle.agents.length} agentes</span>
          <span className="text-[9px]" style={{ color: `${phaseColor}80` }}>
            {PHASE_LABELS[circle.phase]}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            addConsoleEntry({ level: "transmutation", message: `⚗️ Invocando círculo "${circle.name}"...` });
          }}
          className="p-1 rounded hover:bg-[#10B981]/10 text-[#444] hover:text-[#10B981] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Invocar"
        >
          <Play size={9} />
        </motion.button>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            deleteCircle(circle.id);
          }}
          className="p-1 rounded hover:bg-[#DC2626]/10 text-[#444] hover:text-[#DC2626] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Eliminar"
        >
          <Trash2 size={9} />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ITEM DE AGENTE
═══════════════════════════════════════════════════════════════ */

function AgentItem({ agent }: { agent: AlchemicalAgent }) {
  const { selectedAgentId, selectAgent, setRightPanelTab } = useDashboardStore();
  const isSelected = selectedAgentId === agent.id;

  const statusDot = {
    idle: "bg-[#2A2A2A] border border-[#3A3A3A]",
    active: "bg-[#10B981]",
    transmuting: "bg-[#FFD700]",
    error: "bg-[#DC2626]",
    dormant: "bg-[#6B7280]",
  };

  const handleSelect = () => {
    selectAgent(agent.id);
    setRightPanelTab("inspector");
  };

  return (
    <div
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("agentId", agent.id);
        e.dataTransfer.setData("agentData", JSON.stringify(agent));
      }}
    >
    <motion.div
      className={`
        group flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all
        ${isSelected ? "bg-[#FFD700]/8 border border-[#FFD700]/20" : "hover:bg-[#FFD700]/3 border border-transparent"}
      `}
      onClick={handleSelect}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
        style={{
          background: `${agent.color}15`,
          border: `1px solid ${agent.color}${isSelected ? "40" : "20"}`,
        }}
      >
        {agent.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-xs truncate ${isSelected ? "text-[#FFD700]/90" : "text-[#888]"}`}>
          {agent.name}
        </div>
        <div className="text-[9px] text-[#444] truncate">{agent.codename}</div>
      </div>

      {/* Status dot */}
      <motion.div
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[agent.status]}`}
        animate={
          agent.status === "active" || agent.status === "transmuting"
            ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILLS MARKETPLACE (simplificado)
═══════════════════════════════════════════════════════════════ */

const SKILLS = [
  { id: "web-search", name: "Web Search", icon: "🌐", category: "Herramientas", installed: true },
  { id: "code-exec", name: "Code Executor", icon: "⚙️", category: "Ejecución", installed: true },
  { id: "pdf-reader", name: "PDF Reader", icon: "📄", category: "Documentos", installed: false },
  { id: "image-gen", name: "Image Gen", icon: "🎨", category: "Creación", installed: false },
  { id: "sql-query", name: "SQL Query", icon: "🗄️", category: "Datos", installed: true },
];

function SkillItem({ skill }: { skill: typeof SKILLS[0] }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 mx-1 rounded-lg hover:bg-[#FFD700]/3 transition-colors group">
      <span className="text-sm">{skill.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-[#777] truncate">{skill.name}</div>
        <div className="text-[9px] text-[#444]">{skill.category}</div>
      </div>
      <div
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${skill.installed ? "bg-[#10B981]" : "bg-[#2A2A2A] border border-[#3A3A3A]"}`}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR PRINCIPAL
═══════════════════════════════════════════════════════════════ */

export default function GrimoireSidebar() {
  const { agents, circles, openForgeModal } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter(
    (a) =>
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.codename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCircles = circles.filter(
    (c) =>
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-r border-[#FFD700]/8">
      {/* Header del Grimorio */}
      <div
        className="px-4 py-3 border-b border-[#FFD700]/10"
        style={{ background: "linear-gradient(90deg, rgba(255,215,0,0.04) 0%, transparent 100%)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <BookOpen size={14} className="text-[#FFD700]/60" />
          </motion.div>
          <span className="text-xs font-cinzel text-[#FFD700]/70 font-bold">Grimorio</span>
          <div className="flex-1" />
          <motion.button
            onClick={openForgeModal}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] btn-forge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={10} />
            <span>Forjar</span>
          </motion.button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en el Grimorio..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[10px] text-[#888] placeholder-[#333] outline-none transition-all"
            style={{
              background: "rgba(17,17,17,0.8)",
              border: "1px solid rgba(255,215,0,0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255,215,0,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,215,0,0.08)";
            }}
          />
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Círculos Alquímicos */}
        <SidebarSection
          title="Círculos"
          icon={Layers}
          count={filteredCircles.length}
          action={
            <motion.button
              onClick={openForgeModal}
              className="p-0.5 rounded text-[#444] hover:text-[#FFD700]/60 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={10} />
            </motion.button>
          }
        >
          {filteredCircles.length === 0 ? (
            <div className="px-3 py-3 text-center">
              <p className="text-[10px] text-[#333]">Sin círculos forjados</p>
              <motion.button
                onClick={openForgeModal}
                className="mt-2 text-[10px] text-[#FFD700]/40 hover:text-[#FFD700]/70 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                + Forjar primer Círculo
              </motion.button>
            </div>
          ) : (
            <div className="space-y-0.5 pb-2">
              {filteredCircles.map((circle) => (
                <CircleItem key={circle.id} circle={circle} />
              ))}
            </div>
          )}
        </SidebarSection>

        <div className="mx-3 my-1 h-px bg-[#1A1A1A]" />

        {/* Registro de Agentes */}
        <SidebarSection
          title="Agentes"
          icon={Cpu}
          count={filteredAgents.length}
        >
          <div className="space-y-0.5 pb-2">
            {filteredAgents.map((agent) => (
              <AgentItem key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="px-3 py-1">
            <p className="text-[9px] text-[#333] text-center">
              Arrastra agentes al canvas para añadirlos
            </p>
          </div>
        </SidebarSection>

        <div className="mx-3 my-1 h-px bg-[#1A1A1A]" />

        {/* Skills Marketplace */}
        <SidebarSection
          title="Skills"
          icon={Zap}
          count={SKILLS.filter((s) => s.installed).length}
          defaultOpen={false}
        >
          <div className="space-y-0.5 pb-2">
            {SKILLS.map((skill) => (
              <SkillItem key={skill.id} skill={skill} />
            ))}
          </div>
        </SidebarSection>

        <div className="mx-3 my-1 h-px bg-[#1A1A1A]" />

        {/* Alquimista de Habilidades */}
        <div className="px-3 py-2">
          <Link href="/alchemist">
            <motion.div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#10B981]/20 hover:bg-[#10B981]/5 group"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FlaskConical size={13} className="text-[#10B981]/50 group-hover:text-[#10B981]/80 transition-colors flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[#10B981]/60 group-hover:text-[#10B981]/90 font-medium transition-colors">
                  Alquimista de Habilidades
                </div>
                <div className="text-[9px] text-[#333] group-hover:text-[#444] transition-colors">
                  Forja Skills con drag &amp; drop
                </div>
              </div>
              <ChevronRight size={10} className="text-[#333] group-hover:text-[#10B981]/50 transition-colors" />
            </motion.div>
          </Link>
        </div>

        <div className="mx-3 my-1 h-px bg-[#1A1A1A]" />

        {/* Recientes */}
        <SidebarSection
          title="Recientes"
          icon={Clock}
          defaultOpen={false}
        >
          <div className="px-3 py-2 space-y-1">
            {[
              "Análisis de mercado Q4",
              "Refactoring módulo auth",
              "Síntesis paper IA 2024",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 py-1 cursor-pointer hover:text-[#888] transition-colors"
              >
                <Star size={9} className="text-[#333] flex-shrink-0" />
                <span className="text-[10px] text-[#555] truncate">{item}</span>
              </div>
            ))}
          </div>
        </SidebarSection>
      </div>

      {/* Footer del Grimorio */}
      <div className="px-3 py-2 border-t border-[#1A1A1A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[9px] text-[#444]">Sistema activo</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-[#333]">
            <Cpu size={9} />
            <span>7 agentes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
