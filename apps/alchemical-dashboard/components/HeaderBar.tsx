"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Search,
  Cpu,
  MemoryStick,
  Activity,
  Zap,
  Keyboard,
  Fullscreen,
} from "lucide-react";
import { cn, formatNumber } from "../lib/utils";
import { useMetrics } from "../lib/hooks";
import { useAppStore } from "../lib/stores";

interface MetricBarProps {
  value: number;
  max?: number;
  color: string;
  size?: "sm" | "md";
}

function MetricBar({ value, max = 100, color, size = "md" }: MetricBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-white/5",
        size === "sm" ? "h-1 w-16" : "h-1.5 w-20"
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("h-full rounded-full", color)}
        style={{
          boxShadow: `0 0 10px ${color.replace("bg-", "").replace("-500", "")}`,
        }}
      />
    </div>
  );
}

export function HeaderBar() {
  const { data: metrics } = useMetrics();
  const { addNotification } = useAppStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel border-b border-gold/10 px-6 py-4"
    >
      <div className="flex items-center justify-between gap-8">
        {/* Title Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <h1 className="font-cinzel text-xl font-bold text-gold liquid-gold">
              Alchemical Control
            </h1>
            <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0" />
          </div>
          <span className="text-xs text-muted-foreground">
            KiloCode AI + Redis + ChromaDB
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
            <input
              type="text"
              placeholder="Invoca agentes, tareas, logs..."
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-xl text-sm",
                "bg-white/5 border border-gold/10",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20",
                "transition-all duration-200"
              )}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] rounded border border-gold/20 bg-gold/5 text-muted-foreground hidden md:block">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Metrics */}
        <div className="hidden lg:flex items-center gap-6">
          {/* CPU */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-turq/10">
              <Cpu className="w-3.5 h-3.5 text-turq" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">CPU</span>
                <span className="text-xs font-mono text-turq">{metrics.cpu}%</span>
              </div>
              <MetricBar value={metrics.cpu} color="bg-turq" size="sm" />
            </div>
          </div>

          {/* RAM */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple/10">
              <MemoryStick className="w-3.5 h-3.5 text-purple" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">RAM</span>
                <span className="text-xs font-mono text-purple">{metrics.ram}%</span>
              </div>
              <MetricBar value={metrics.ram} color="bg-purple" size="sm" />
            </div>
          </div>

          {/* GPU */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald/10">
              <Activity className="w-3.5 h-3.5 text-emerald" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">GPU</span>
                <span className="text-xs font-mono text-emerald">{metrics.gpu}%</span>
              </div>
              <MetricBar value={metrics.gpu} color="bg-emerald" size="sm" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              addNotification({
                type: "info",
                title: "Modo Focus activado",
                message: "Presiona ESC para salir",
              })
            }
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-gold transition-colors"
          >
            <Fullscreen className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              addNotification({
                type: "info",
                title: "Atajos de teclado",
                message: "1-6: Navegación | Cmd+K: Buscar | ESC: Cerrar",
              })
            }
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-gold transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              addNotification({
                type: "success",
                title: "Sistema actualizado",
                message: "Todos los agentes están respondiendo correctamente",
              })
            }
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-gold transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-gold" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
