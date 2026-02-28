"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Trash2,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Circle,
  Pause,
  Play,
} from "lucide-react";
import { useDashboardStore, type ConsoleEntry } from "@/lib/store/dashboard";

/* ═══════════════════════════════════════════════════════════════
   CONFIGURACIÓN DE NIVELES
═══════════════════════════════════════════════════════════════ */

const LEVEL_CONFIG = {
  info: {
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.3)",
    prefix: "INFO",
    icon: "ℹ",
  },
  success: {
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
    prefix: "OK  ",
    icon: "✓",
  },
  warning: {
    color: "#FFD700",
    bg: "rgba(255,215,0,0.06)",
    border: "rgba(255,215,0,0.3)",
    prefix: "WARN",
    icon: "⚠",
  },
  error: {
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.3)",
    prefix: "ERR ",
    icon: "✗",
  },
  transmutation: {
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.3)",
    prefix: "ALCH",
    icon: "⚗",
  },
};

type LogLevel = keyof typeof LEVEL_CONFIG;

/* ═══════════════════════════════════════════════════════════════
   ENTRADA DE CONSOLA
═══════════════════════════════════════════════════════════════ */

function ConsoleEntryRow({ entry, index }: { entry: ConsoleEntry; index: number }) {
  const config = LEVEL_CONFIG[entry.level];
  const time = entry.timestamp.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
      className="flex items-start gap-2 px-3 py-1 hover:bg-white/[0.02] transition-colors group border-l-2"
      style={{ borderLeftColor: "transparent" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderLeftColor = config.border;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
      }}
    >
      {/* Timestamp */}
      <span className="text-[10px] text-[#333] font-mono flex-shrink-0 mt-0.5 w-16">
        {time}
      </span>

      {/* Level badge */}
      <span
        className="text-[9px] font-mono font-bold flex-shrink-0 mt-0.5 w-8"
        style={{ color: config.color }}
      >
        {config.prefix}
      </span>

      {/* Mensaje */}
      <span
        className="text-[11px] font-mono leading-relaxed flex-1"
        style={{ color: entry.level === "transmutation" ? config.color : "#AAA" }}
      >
        {entry.message}
      </span>

      {/* Agent tag si existe */}
      {entry.agent && (
        <span
          className="text-[9px] px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: "rgba(255,215,0,0.08)", color: "rgba(255,215,0,0.5)" }}
        >
          {entry.agent}
        </span>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILTRO DE NIVELES
═══════════════════════════════════════════════════════════════ */

function LevelFilter({
  activeFilters,
  onToggle,
}: {
  activeFilters: Set<LogLevel>;
  onToggle: (level: LogLevel) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {(Object.entries(LEVEL_CONFIG) as [LogLevel, typeof LEVEL_CONFIG[LogLevel]][]).map(([level, config]) => (
        <motion.button
          key={level}
          onClick={() => onToggle(level)}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono transition-all"
          style={{
            background: activeFilters.has(level) ? config.bg : "transparent",
            border: `1px solid ${activeFilters.has(level) ? config.border : "rgba(42,42,42,0.8)"}`,
            color: activeFilters.has(level) ? config.color : "#444",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{config.icon}</span>
          <span>{config.prefix.trim()}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONSOLA PRINCIPAL
═══════════════════════════════════════════════════════════════ */

export default function TransmutationConsole() {
  const { consoleEntries, clearConsole, consoleOpen, toggleConsole, consoleHeight, setConsoleHeight } = useDashboardStore();

  const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(
    new Set(["info", "success", "warning", "error", "transmutation"])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleEntries, autoScroll]);

  /* ── Filtrado ── */
  const filteredEntries = consoleEntries.filter((entry) => {
    if (!activeFilters.has(entry.level)) return false;
    if (searchQuery && !entry.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  /* ── Toggle filtro ── */
  const toggleFilter = useCallback((level: LogLevel) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 1) next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  /* ── Resize ── */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = consoleHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizeStartY.current - e.clientY;
      const newHeight = Math.max(80, Math.min(500, resizeStartHeight.current + delta));
      setConsoleHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [consoleHeight, setConsoleHeight]);

  /* ── Exportar logs ── */
  const handleExport = useCallback(() => {
    const content = filteredEntries
      .map((e) => `[${e.timestamp.toISOString()}] [${e.level.toUpperCase()}] ${e.message}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alchemical-console-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredEntries]);

  /* ── Contadores por nivel ── */
  const counts = consoleEntries.reduce((acc, e) => {
    acc[e.level] = (acc[e.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className="flex flex-col border-t border-[#FFD700]/10"
      style={{
        height: consoleOpen ? consoleHeight : 36,
        background: "rgba(8,8,8,0.98)",
        transition: isResizing ? "none" : "height 0.2s ease",
      }}
    >
      {/* Handle de resize */}
      {consoleOpen && (
        <div
          className="h-1 cursor-ns-resize hover:bg-[#FFD700]/20 transition-colors flex-shrink-0"
          onMouseDown={handleResizeStart}
          style={{ background: isResizing ? "rgba(255,215,0,0.3)" : "transparent" }}
        />
      )}

      {/* Header de la consola */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b border-[#1A1A1A] flex-shrink-0 cursor-pointer"
        onClick={toggleConsole}
        style={{ minHeight: 36 }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[#FFD700]/60" />
          <span className="text-[10px] font-cinzel text-[#FFD700]/70 font-semibold">
            Consola de Transmutación
          </span>

          {/* Contadores */}
          <div className="flex items-center gap-1.5 ml-2">
            {counts.error > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#DC2626]/15 text-[#DC2626]">
                {counts.error} err
              </span>
            )}
            {counts.warning > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700]/70">
                {counts.warning} warn
              </span>
            )}
            <span className="text-[9px] text-[#444]">
              {filteredEntries.length}/{consoleEntries.length} líneas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Búsqueda */}
          <AnimatePresence>
            {showSearch && (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 160, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en logs..."
                className="text-[10px] px-2 py-1 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] placeholder-[#444] outline-none"
                autoFocus
              />
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1 rounded transition-colors ${showSearch ? "text-[#FFD700]/60" : "text-[#444] hover:text-[#666]"}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Buscar"
          >
            <Search size={11} />
          </motion.button>

          <motion.button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded transition-colors ${autoScroll ? "text-[#10B981]/60" : "text-[#444] hover:text-[#666]"}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={autoScroll ? "Pausar auto-scroll" : "Reanudar auto-scroll"}
          >
            {autoScroll ? <Pause size={11} /> : <Play size={11} />}
          </motion.button>

          <motion.button
            onClick={handleExport}
            className="p-1 rounded text-[#444] hover:text-[#666] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Exportar logs"
          >
            <Download size={11} />
          </motion.button>

          <motion.button
            onClick={clearConsole}
            className="p-1 rounded text-[#444] hover:text-[#DC2626]/60 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Limpiar consola"
          >
            <Trash2 size={11} />
          </motion.button>

          <div className="w-px h-4 bg-[#2A2A2A] mx-1" />

          {consoleOpen && (
            <div className="flex items-center gap-1 mr-1">
              <Filter size={10} className="text-[#444]" />
              <LevelFilter activeFilters={activeFilters} onToggle={toggleFilter} />
            </div>
          )}

          <motion.button
            className="p-1 rounded text-[#444] hover:text-[#666] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {consoleOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </motion.button>
        </div>
      </div>

      {/* Área de logs */}
      {consoleOpen && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-1"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          {filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#333] text-[10px]">
              {searchQuery ? "Sin resultados para la búsqueda" : "La consola está vacía"}
            </div>
          ) : (
            filteredEntries.map((entry, i) => (
              <ConsoleEntryRow key={entry.id} entry={entry} index={i} />
            ))
          )}

          {/* Cursor parpadeante */}
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="text-[10px] text-[#333] font-mono w-16">
              {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span className="text-[10px] text-[#333] font-mono w-8">    </span>
            <motion.span
              className="text-[#FFD700]/30 text-[11px] font-mono"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              █
            </motion.span>
          </div>
        </div>
      )}

      {/* Indicador de actividad en tiempo real */}
      {!consoleOpen && consoleEntries.length > 0 && (
        <div className="absolute right-32 top-1.5 flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[9px] text-[#444]">
            {consoleEntries[consoleEntries.length - 1]?.message.slice(0, 40)}...
          </span>
        </div>
      )}
    </div>
  );
}
