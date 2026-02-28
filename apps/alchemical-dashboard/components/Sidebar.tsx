"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  MessageSquare,
  Network,
  Bot,
  BarChart3,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAppStore, type View } from "../lib/stores";
import { useSystem } from "../lib/hooks";

interface NavItem {
  id: View;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
}

const navItems: NavItem[] = [
  { id: "chat", label: "Chat del Caldero", icon: MessageSquare, shortcut: "1" },
  { id: "nodes", label: "Node Studio", icon: Network, shortcut: "2" },
  { id: "agents", label: "Runtime Agentes", icon: Bot, shortcut: "3" },
  { id: "ops", label: "Operaciones", icon: BarChart3, shortcut: "4" },
  { id: "logs", label: "Logs & SSE", icon: ScrollText, shortcut: "5" },
  { id: "admin", label: "Administración", icon: Settings, shortcut: "6" },
];

export function Sidebar() {
  const { activeView, setView, sidebarCollapsed, toggleSidebar } = useAppStore();
  const { data: systemData } = useSystem();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "glass-panel flex flex-col h-screen sticky top-0 z-40",
        "border-r border-gold/10"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold/10">
        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {!sidebarCollapsed && (
            <>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30">
                  <FlaskConical className="w-5 h-5 text-gold" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald rounded-full border-2 border-void animate-pulse" />
              </div>
              <div>
                <h1 className="font-cinzel font-bold text-gold text-sm tracking-wider">
                  ALCHEMICAL
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Ecosystem 2026
                </p>
              </div>
            </>
          )}
        </motion.div>

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item, index) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                "group relative overflow-hidden",
                isActive
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-gold to-gold/50 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-sm font-medium text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Keyboard shortcut */}
              {!sidebarCollapsed && item.shortcut && (
                <motion.kbd
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "hidden lg:flex items-center justify-center w-5 h-5 text-[10px] rounded",
                    "border border-gold/20 bg-gold/5 text-muted-foreground font-mono",
                    isActive && "border-gold/40 text-gold"
                  )}
                >
                  {item.shortcut}
                </motion.kbd>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-gold/10">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Estado Core
                </span>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-gold animate-pulse" />
                  <span className="text-xs text-gold">Online</span>
                </div>
              </div>

              <div className="space-y-2">
                {systemData.services.slice(0, 4).map((service) => (
                  <div key={service.name} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{service.name}</span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                        service.health === "healthy"
                          ? "bg-emerald/10 text-emerald"
                          : service.health === "down"
                          ? "bg-rose/10 text-rose"
                          : "bg-amber/10 text-amber"
                      )}
                    >
                      {service.health}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  systemData.services.every((s) => s.health === "healthy")
                    ? "bg-emerald animate-pulse"
                    : "bg-amber"
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
