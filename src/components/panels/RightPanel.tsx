"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, Settings, Database, Activity } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import AgentInspector from "./AgentInspector";

/* ═══════════════════════════════════════════════════════════════
   TABS DEL PANEL DERECHO
═══════════════════════════════════════════════════════════════ */

const TABS = [
  { id: "inspector" as const, label: "Inspector", icon: Eye },
  { id: "config" as const, label: "Config", icon: Settings },
  { id: "memory" as const, label: "Memoria", icon: Database },
  { id: "telemetry" as const, label: "Telemetría", icon: Activity },
];

/* ═══════════════════════════════════════════════════════════════
   VISTA DE CONFIGURACIÓN (placeholder)
═══════════════════════════════════════════════════════════════ */

function ConfigView() {
  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-8">
        <div className="text-3xl mb-3">⚙️</div>
        <p className="text-xs font-cinzel text-[#FFD700]/40 mb-1">Configuración del Círculo</p>
        <p className="text-[10px] text-[#444]">Selecciona un Círculo para configurarlo</p>
      </div>

      {/* Opciones de configuración */}
      <div className="space-y-2">
        {[
          { label: "Temperatura LLM", value: "0.7", type: "slider" },
          { label: "Max Tokens", value: "4096", type: "input" },
          { label: "Timeout (s)", value: "120", type: "input" },
          { label: "Reintentos", value: "3", type: "input" },
        ].map((config) => (
          <div key={config.label} className="flex items-center justify-between p-2.5 rounded-lg border border-[#1A1A1A]"
            style={{ background: "rgba(17,17,17,0.6)" }}>
            <span className="text-[10px] text-[#666]">{config.label}</span>
            <span className="text-[10px] font-mono text-[#FFD700]/60">{config.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VISTA DE MEMORIA (placeholder)
═══════════════════════════════════════════════════════════════ */

function MemoryView() {
  const memoryLayers = [
    { name: "Redis (Corto Plazo)", icon: "⚡", usage: 34, color: "#FF4D00", items: 127 },
    { name: "ChromaDB (Vectorial)", icon: "🔮", usage: 67, color: "#8B5CF6", items: 2341 },
    { name: "Resúmenes (Largo Plazo)", icon: "📜", usage: 23, color: "#FFD700", items: 89 },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Database size={12} className="text-[#FFD700]/50" />
        <span className="text-[10px] font-cinzel text-[#FFD700]/60 uppercase tracking-wider">
          Nexo de Memoria
        </span>
      </div>

      {memoryLayers.map((layer) => (
        <motion.div
          key={layer.name}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border"
          style={{
            background: `${layer.color}06`,
            borderColor: `${layer.color}20`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{layer.icon}</span>
            <div className="flex-1">
              <div className="text-[10px] font-medium" style={{ color: layer.color }}>
                {layer.name}
              </div>
              <div className="text-[9px] text-[#444]">{layer.items.toLocaleString()} entradas</div>
            </div>
            <span className="text-[10px] font-mono" style={{ color: layer.color }}>
              {layer.usage}%
            </span>
          </div>
          <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${layer.usage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ background: layer.color }}
            />
          </div>
        </motion.div>
      ))}

      <div className="p-3 rounded-lg border border-[#1A1A1A] text-center"
        style={{ background: "rgba(17,17,17,0.6)" }}>
        <p className="text-[10px] text-[#555]">Total: 2,557 entradas en memoria</p>
        <p className="text-[9px] text-[#333] mt-0.5">Última sincronización: hace 5 min</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VISTA DE TELEMETRÍA (placeholder)
═══════════════════════════════════════════════════════════════ */

function TelemetryView() {
  const metrics = [
    { label: "Latencia P50", value: "234ms", trend: "↓", good: true },
    { label: "Latencia P99", value: "1.2s", trend: "↑", good: false },
    { label: "Tokens/min", value: "12,450", trend: "↑", good: true },
    { label: "Errores/hora", value: "2", trend: "↓", good: true },
    { label: "Tareas activas", value: "0", trend: "→", good: true },
    { label: "Uptime", value: "99.8%", trend: "→", good: true },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={12} className="text-[#FFD700]/50" />
        <span className="text-[10px] font-cinzel text-[#FFD700]/60 uppercase tracking-wider">
          Telemetría en Vivo
        </span>
        <div className="flex-1" />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-2.5 rounded-lg border border-[#1A1A1A]"
            style={{ background: "rgba(17,17,17,0.6)" }}
          >
            <div className="text-[9px] text-[#444] mb-1">{metric.label}</div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-mono font-bold text-[#888]">{metric.value}</span>
              <span
                className="text-[10px]"
                style={{ color: metric.good ? "#10B981" : "#DC2626" }}
              >
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini gráfico simulado */}
      <div
        className="p-3 rounded-lg border border-[#1A1A1A]"
        style={{ background: "rgba(17,17,17,0.6)" }}
      >
        <div className="text-[9px] text-[#444] mb-2">Actividad (últimas 24h)</div>
        <div className="flex items-end gap-0.5 h-12">
          {[20, 45, 30, 80, 60, 40, 90, 70, 50, 65, 35, 55, 75, 45, 60, 80, 40, 70, 55, 85, 65, 45, 70, 50].map(
            (h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  background: `rgba(255,215,0,${0.1 + (h / 100) * 0.4})`,
                  height: `${h}%`,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL DERECHO PRINCIPAL
═══════════════════════════════════════════════════════════════ */

export default function RightPanel() {
  const { rightPanelTab, setRightPanelTab } = useDashboardStore();

  const views = {
    inspector: <AgentInspector />,
    config: <ConfigView />,
    memory: <MemoryView />,
    telemetry: <TelemetryView />,
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-l border-[#FFD700]/8">
      {/* Tabs */}
      <div
        className="flex border-b border-[#FFD700]/10 flex-shrink-0"
        style={{ background: "rgba(13,13,13,0.98)" }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = rightPanelTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setRightPanelTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1 transition-all relative"
              style={{
                color: isActive ? "#FFD700" : "#444",
              }}
              whileHover={{ color: isActive ? "#FFD700" : "#666" }}
            >
              <Icon size={12} />
              <span className="text-[9px] font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={rightPanelTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="h-full overflow-y-auto"
          >
            {views[rightPanelTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
