"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Key,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface SystemAction {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  danger?: boolean;
}

const systemActions: SystemAction[] = [
  {
    id: "restart-gateway",
    label: "Reiniciar Gateway",
    icon: Server,
    description: "Reinicia el servicio principal del gateway",
  },
  {
    id: "flush-cache",
    label: "Limpiar Cache",
    icon: Database,
    description: "Limpia la caché de Redis",
  },
  {
    id: "sync-agents",
    label: "Sincronizar Agentes",
    icon: RefreshCw,
    description: "Sincroniza el estado de todos los agentes",
  },
  {
    id: "regenerate-keys",
    label: "Regenerar API Keys",
    icon: Key,
    description: "Genera nuevas claves de API",
    danger: true,
  },
];

export function AdminOpsPanel() {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAction = async (actionId: string) => {
    setIsProcessing(actionId);

    try {
      const res = await fetch("/api/control", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: actionId }),
      });

      if (res.ok) {
        toast.success(`Acción ${actionId} completada`);
      } else {
        throw new Error("Error en la acción");
      }
    } catch (error) {
      toast.error(`Error ejecutando ${actionId}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber/10">
          <Shield className="w-5 h-5 text-amber" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Operaciones del Sistema</h3>
          <p className="text-xs text-muted-foreground">Acciones administrativas</p>
        </div>
      </div>

      <div className="space-y-3">
        {systemActions.map((action) => {
          const Icon = action.icon;
          const isLoading = isProcessing === action.id;

          return (
            <motion.div
              key={action.id}
              whileHover={{ x: 2 }}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer",
                action.danger
                  ? "border-rose/20 hover:border-rose/40 bg-rose/5"
                  : "border-gold/10 hover:border-gold/30 bg-white/5"
              )}
              onClick={() => !isLoading && handleAction(action.id)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    action.danger ? "bg-rose/10" : "bg-gold/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      action.danger ? "text-rose" : "text-gold",
                      isLoading && "animate-spin"
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{action.label}</h4>
                    {action.danger && (
                      <AlertTriangle className="w-4 h-4 text-rose" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Indicators */}
      <div className="mt-6 pt-6 border-t border-gold/10">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Estado de Servicios
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {["Gateway", "Redis", "ChromaDB", "PostgreSQL"].map((service) => (
            <div
              key={service}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
              <span className="text-xs text-foreground">{service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
