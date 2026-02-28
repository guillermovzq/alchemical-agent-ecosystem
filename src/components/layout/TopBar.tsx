"use client";

import { motion } from "framer-motion";
import {
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Maximize2,
  Minimize2,
  Settings,
  HelpCircle,
  Wifi,
  WifiOff,
  Cpu,
  Flame,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";

/* ═══════════════════════════════════════════════════════════════
   INDICADOR DE ESTADO DEL SISTEMA
═══════════════════════════════════════════════════════════════ */

function SystemStatus() {
  const services = [
    { name: "FastAPI", status: true, color: "#10B981" },
    { name: "Redis", status: true, color: "#FF4D00" },
    { name: "ChromaDB", status: true, color: "#8B5CF6" },
    { name: "LangGraph", status: true, color: "#FFD700" },
  ];

  return (
    <div className="flex items-center gap-3">
      {services.map((service, i) => (
        <div key={service.name} className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: service.status ? service.color : "#DC2626" }}
            animate={service.status ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
          <span className="text-[9px] text-[#444]">{service.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOP BAR PRINCIPAL
═══════════════════════════════════════════════════════════════ */

export default function TopBar() {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    focusMode,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleFocusMode,
  } = useDashboardStore();

  return (
    <div
      className="flex items-center justify-between px-4 h-11 border-b border-[#FFD700]/10 flex-shrink-0 z-10"
      style={{
        background: "rgba(10,10,10,0.98)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Izquierda: Logo + Nombre */}
      <div className="flex items-center gap-3">
        {/* Toggle sidebar izquierda */}
        <motion.button
          onClick={toggleLeftSidebar}
          className="p-1.5 rounded-lg text-[#444] hover:text-[#FFD700]/60 hover:bg-[#FFD700]/5 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={leftSidebarOpen ? "Ocultar Grimorio" : "Mostrar Grimorio"}
        >
          {leftSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </motion.button>

        {/* Logo alquímico */}
        <div className="flex items-center gap-2">
          <motion.div
            className="relative w-7 h-7 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute inset-0 rounded-full border border-[#FFD700]/20"
              style={{ background: "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)" }}
            />
            <span className="text-sm relative z-10">⚗️</span>
          </motion.div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-cinzel font-bold text-[#FFD700] leading-none">
                Alchemical
              </span>
              <span className="text-xs font-cinzel text-[#FFD700]/50 leading-none">
                Agent Ecosystem
              </span>
            </div>
            <div className="text-[8px] text-[#444] leading-none mt-0.5">
              Where Intelligence is Forged, Not Fetched.
            </div>
          </div>
        </div>

        <div className="w-px h-5 bg-[#1A1A1A]" />

        {/* Estado del sistema */}
        <SystemStatus />
      </div>

      {/* Centro: Breadcrumb / Contexto actual */}
      <div className="flex items-center gap-2 text-[10px] text-[#444]">
        <Flame size={10} className="text-[#FF4D00]/40" />
        <span>Dashboard</span>
        <span className="text-[#2A2A2A]">/</span>
        <span className="text-[#FFD700]/40">Agent Node Studio</span>
      </div>

      {/* Derecha: Controles */}
      <div className="flex items-center gap-1">
        {/* Modo Focus */}
        <motion.button
          onClick={toggleFocusMode}
          className={`p-1.5 rounded-lg transition-all ${
            focusMode
              ? "text-[#FFD700]/60 bg-[#FFD700]/8 border border-[#FFD700]/20"
              : "text-[#444] hover:text-[#FFD700]/60 hover:bg-[#FFD700]/5"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={focusMode ? "Salir del Modo Focus" : "Modo Focus"}
        >
          {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </motion.button>

        <motion.button
          className="p-1.5 rounded-lg text-[#444] hover:text-[#666] hover:bg-[#1A1A1A] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Configuración"
        >
          <Settings size={14} />
        </motion.button>

        <motion.button
          className="p-1.5 rounded-lg text-[#444] hover:text-[#666] hover:bg-[#1A1A1A] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Ayuda"
        >
          <HelpCircle size={14} />
        </motion.button>

        <div className="w-px h-5 bg-[#1A1A1A] mx-1" />

        {/* Toggle sidebar derecha */}
        <motion.button
          onClick={toggleRightSidebar}
          className="p-1.5 rounded-lg text-[#444] hover:text-[#FFD700]/60 hover:bg-[#FFD700]/5 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={rightSidebarOpen ? "Ocultar Panel" : "Mostrar Panel"}
        >
          {rightSidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
        </motion.button>

        {/* Avatar / Usuario */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center ml-1 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,77,0,0.1))",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
          title="Alquimista"
        >
          <span className="text-xs">🧙</span>
        </div>
      </div>
    </div>
  );
}
