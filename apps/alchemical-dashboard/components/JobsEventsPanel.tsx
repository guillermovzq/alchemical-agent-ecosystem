"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Zap,
  RefreshCw,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface Job {
  id: string;
  agent_id: string;
  status: "pending" | "running" | "done" | "failed";
  created_at: string;
  finished_at?: string;
  result?: string;
}

interface Event {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: "info" | "warning" | "error";
}

export function JobsEventsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<"jobs" | "events">("jobs");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [jobsRes, eventsRes] = await Promise.all([
        fetch("/api/gateway/jobs", { cache: "no-store" }),
        fetch("/api/gateway/events", { cache: "no-store" }),
      ]);

      const jobsData = await jobsRes.json();
      const eventsData = await eventsRes.json();

      setJobs(jobsData.items || []);
      setEvents(eventsData.items || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getJobStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-emerald" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-rose" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-amber animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventSeverityColor = (severity: Event["severity"]) => {
    switch (severity) {
      case "error":
        return "text-rose bg-rose/10 border-rose/20";
      case "warning":
        return "text-amber bg-amber/10 border-amber/20";
      default:
        return "text-turq bg-turq/10 border-turq/20";
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gold/10">
        <button
          onClick={() => setActiveTab("jobs")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === "jobs"
              ? "text-gold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="w-4 h-4" />
          Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === "events"
              ? "text-gold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="w-4 h-4" />
          Eventos ({events.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {activeTab === "jobs" ? (
          <div className="space-y-2">
            {jobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay jobs activos</p>
            ) : (
              jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-white/5 border border-gold/5 hover:border-gold/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getJobStatusIcon(job.status)}
                      <div>
                        <p className="text-sm font-medium text-foreground">{job.agent_id}</p>
                        <p className="text-xs text-muted-foreground">{job.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-medium",
                        job.status === "done"
                          ? "bg-emerald/10 text-emerald"
                          : job.status === "failed"
                          ? "bg-rose/10 text-rose"
                          : job.status === "running"
                          ? "bg-amber/10 text-amber"
                          : "bg-white/10 text-muted-foreground"
                      )}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(job.created_at).toLocaleTimeString()}
                    </span>
                    {job.finished_at && (
                      <span>Done: {new Date(job.finished_at).toLocaleTimeString()}</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay eventos</p>
            ) : (
              events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-3 rounded-lg border",
                    getEventSeverityColor(event.severity)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{event.type}</p>
                      <p className="text-xs opacity-80 mt-0.5">{event.message}</p>
                    </div>
                    <span className="text-[10px] opacity-60">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
