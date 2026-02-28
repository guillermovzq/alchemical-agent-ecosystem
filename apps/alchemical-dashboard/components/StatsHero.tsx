"use client";

import { motion } from "framer-motion";
import { Activity, Users, Cpu, Clock, TrendingUp, Zap } from "lucide-react";
import { cn, formatNumber } from "../lib/utils";
import type { DashboardPayload } from "../lib/types";

interface StatsHeroProps {
  stats?: DashboardPayload["stats"];
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, subValue, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card-hover p-5 rounded-xl group"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-gold/10 transition-colors">
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        {subValue && (
          <div className="flex items-center gap-1 text-xs text-emerald">
            <TrendingUp className="w-3 h-3" />
            <span>{subValue}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export function StatsHero({ stats }: StatsHeroProps) {
  const defaultStats = {
    active: 0,
    total: 0,
    tasksToday: null,
    tokensProcessed: null,
    uptimeAvg: 0,
  };

  const s = stats || defaultStats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        icon={Activity}
        label="Agentes Activos"
        value={s.active}
        subValue={`${Math.round((s.active / (s.total || 1)) * 100)}%`}
        color="text-emerald"
        delay={0}
      />
      <StatCard
        icon={Users}
        label="Total Agentes"
        value={s.total}
        color="text-turq"
        delay={0.1}
      />
      <StatCard
        icon={Cpu}
        label="Tareas Hoy"
        value={s.tasksToday ?? "-"}
        color="text-purple"
        delay={0.2}
      />
      <StatCard
        icon={Zap}
        label="Tokens Procesados"
        value={s.tokensProcessed ? formatNumber(s.tokensProcessed) : "-"}
        color="text-amber"
        delay={0.3}
      />
      <StatCard
        icon={Clock}
        label="Uptime Promedio"
        value={`${s.uptimeAvg.toFixed(1)}%`}
        color="text-rose"
        delay={0.4}
      />
    </div>
  );
}
