"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ScrollText,
  Pause,
  Play,
  Download,
  Trash2,
  Search,
  Terminal,
  Wifi,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
}

export function LogsMonitor() {
  const [logs, setLogs] = useState<string[]>([]);
  const [service, setService] = useState("velktharion");
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("disconnected");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  // Connect to SSE
  useEffect(() => {
    if (isPaused) return;

    const es = new EventSource(
      `/api/logs/stream?service=${encodeURIComponent(service)}&lines=100`
    );
    esRef.current = es;

    es.onopen = () => setConnectionStatus("connected");
    es.onerror = () => setConnectionStatus("disconnected");

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch {
        // ignore
      }
    };

    return () => {
      es.close();
    };
  }, [service, isPaused]);

  // Auto-scroll
  useEffect(() => {
    if (!isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isPaused]);

  const filteredLogs = logs.filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLogLevel = (log: string): { level: string; color: string } => {
    const lower = log.toLowerCase();
    if (lower.includes("error") || lower.includes("exception")) {
      return { level: "ERROR", color: "text-rose" };
    }
    if (lower.includes("warn")) {
      return { level: "WARN", color: "text-amber" };
    }
    if (lower.includes("info")) {
      return { level: "INFO", color: "text-turq" };
    }
    if (lower.includes("debug")) {
      return { level: "DEBUG", color: "text-purple" };
    }
    return { level: "LOG", color: "text-muted-foreground" };
  };

  const downloadLogs = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${service}-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs descargados");
  };

  const clearLogs = () => {
    setLogs([]);
    toast.info("Logs limpiados");
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Toolbar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-turq/10">
              <Terminal className="w-5 h-5 text-turq" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Logs en Tiempo Real</h3>
              <div className="flex items-center gap-2">
                <Wifi className={cn(
                  "w-3 h-3",
                  connectionStatus === "connected" ? "text-emerald" : "text-rose"
                )} />
                <span className={cn(
                  "text-xs",
                  connectionStatus === "connected" ? "text-emerald" : "text-rose"
                )}>
                  {connectionStatus === "connected" ? "Conectado" : "Desconectado"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Service Selector */}
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30"
            >
              <option value="velktharion">velktharion</option>
              <option value="gateway">gateway</option>
              <option value="redis">redis</option>
              <option value="chromadb">chromadb</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar logs..."
                className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-gold/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 w-48"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isPaused
                    ? "bg-amber/10 text-amber hover:bg-amber/20"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={downloadLogs}
                className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={clearLogs}
                className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-rose hover:bg-rose/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Display */}
      <div className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 custom-scrollbar bg-black/30">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <ScrollText className="w-12 h-12 mb-4 opacity-30" />
              <p>No hay logs para mostrar</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const { level, color } = getLogLevel(log);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 py-0.5 hover:bg-white/5 px-2 rounded"
                >
                  <span className={cn("w-12 flex-shrink-0 font-bold", color)}>
                    {level}
                  </span>
                  <span className="text-muted-foreground break-all">{log}</span>
                </motion.div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Stats Footer */}
        <div className="px-4 py-2 border-t border-gold/10 flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredLogs.length} líneas</span>
          <span>
            {filteredLogs.filter((l) => getLogLevel(l).level === "ERROR").length} errores
          </span>
        </div>
      </div>
    </div>
  );
}
