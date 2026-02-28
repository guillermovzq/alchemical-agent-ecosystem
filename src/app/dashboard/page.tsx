"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useDashboardStore } from "@/lib/store/dashboard";
import TopBar from "@/components/layout/TopBar";
import GrimoireSidebar from "@/components/sidebar/GrimoireSidebar";
import RightPanel from "@/components/panels/RightPanel";
import TransmutationConsole from "@/components/console/TransmutationConsole";
import CircleBuilder from "@/components/studio/CircleBuilder";

/* ── Carga dinámica del Studio (evita SSR con React Flow) ── */
const AgentNodeStudio = dynamic(
  () => import("@/components/studio/AgentNodeStudio"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-5xl"
            animate={{
              rotate: [0, 360],
              filter: [
                "drop-shadow(0 0 5px rgba(255,215,0,0.3))",
                "drop-shadow(0 0 20px rgba(255,215,0,0.8))",
                "drop-shadow(0 0 5px rgba(255,215,0,0.3))",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ⚗️
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-cinzel text-[#FFD700]/60 mb-1">
              Invocando el Studio...
            </p>
            <p className="text-[10px] text-[#444]">
              Preparando el crisol alquímico
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#FFD700]/40"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    ),
  }
);

/* ═══════════════════════════════════════════════════════════════
   PANTALLA DE BIENVENIDA (primera vez)
═══════════════════════════════════════════════════════════════ */

function WelcomeOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(5,5,5,0.95)", backdropFilter: "blur(20px)" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
        className="max-w-lg w-full mx-4 text-center"
      >
        {/* Símbolo alquímico animado */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Círculos orbitales */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border"
              style={{
                borderColor: `rgba(255,215,0,${0.1 + i * 0.05})`,
                margin: `${i * 8}px`,
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
          {/* Símbolo central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-5xl"
              animate={{
                scale: [1, 1.1, 1],
                filter: [
                  "drop-shadow(0 0 10px rgba(255,215,0,0.4))",
                  "drop-shadow(0 0 30px rgba(255,215,0,0.9))",
                  "drop-shadow(0 0 10px rgba(255,215,0,0.4))",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚗️
            </motion.span>
          </div>
        </div>

        {/* Título */}
        <motion.h1
          className="font-cinzel text-3xl font-black mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FF4D00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Alchemical Agent Ecosystem
        </motion.h1>

        <motion.p
          className="text-sm text-[#888] mb-2 font-cinzel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Where Intelligence is Forged, Not Fetched.
        </motion.p>

        <motion.p
          className="text-[11px] text-[#555] mb-8 leading-relaxed max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Tu grimorio vivo de inteligencia artificial. Orquesta agentes, forja círculos
          alquímicos y transmuta el conocimiento con soberanía total.
          <span className="text-[#FFD700]/40"> Zero APIs de pago. 100% local.</span>
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: "🔮", label: "7 Agentes", desc: "Especializados" },
            { icon: "⚡", label: "100% Local", desc: "Zero APIs" },
            { icon: "🕸️", label: "LangGraph", desc: "Orquestación" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="p-3 rounded-xl border border-[#FFD700]/10"
              style={{ background: "rgba(255,215,0,0.03)" }}
            >
              <div className="text-xl mb-1">{feature.icon}</div>
              <div className="text-xs font-bold text-[#FFD700]/70">{feature.label}</div>
              <div className="text-[9px] text-[#444]">{feature.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onDismiss}
          className="px-8 py-3 rounded-xl font-cinzel font-bold text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,77,0,0.15))",
            border: "1px solid rgba(255,215,0,0.4)",
            color: "#FFD700",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 0 30px rgba(255,215,0,0.3)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          ✦ Abrir el Grimorio ✦
        </motion.button>

        <motion.p
          className="text-[9px] text-[#333] mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Esto no es una herramienta... esto es un grimorio vivo.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT PRINCIPAL DEL DASHBOARD
═══════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    focusMode,
    leftSidebarWidth,
    rightSidebarWidth,
  } = useDashboardStore();

  // Mostrar bienvenida solo la primera vez
  const showWelcome = typeof window !== "undefined"
    ? !localStorage.getItem("alch-welcomed")
    : false;

  const handleDismissWelcome = () => {
    localStorage.setItem("alch-welcomed", "true");
    // Forzar re-render
    window.location.reload();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B: Toggle left sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        useDashboardStore.getState().toggleLeftSidebar();
      }
      // Ctrl/Cmd + J: Toggle console
      if ((e.ctrlKey || e.metaKey) && e.key === "j") {
        e.preventDefault();
        useDashboardStore.getState().toggleConsole();
      }
      // F11: Focus mode
      if (e.key === "F11") {
        e.preventDefault();
        useDashboardStore.getState().toggleFocusMode();
      }
      // Escape: Close modals
      if (e.key === "Escape") {
        useDashboardStore.getState().closeForgeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0A] ${focusMode ? "focus-mode" : ""}`}
    >
      {/* Pantalla de bienvenida */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeOverlay onDismiss={handleDismissWelcome} />
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ y: -44 }}
            animate={{ y: 0 }}
            exit={{ y: -44 }}
            transition={{ duration: 0.2 }}
            className="top-bar flex-shrink-0"
          >
            <TopBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar izquierda (Grimorio) */}
        <AnimatePresence>
          {leftSidebarOpen && !focusMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftSidebarWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="sidebar-left flex-shrink-0 overflow-hidden"
              style={{ width: leftSidebarWidth }}
            >
              <GrimoireSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Centro: Studio + Console */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Agent Node Studio */}
          <div className="flex-1 overflow-hidden">
            <AgentNodeStudio />
          </div>

          {/* Console de Transmutación */}
          <div className="console-panel flex-shrink-0">
            <TransmutationConsole />
          </div>
        </div>

        {/* Sidebar derecha (Panel contextual) */}
        <AnimatePresence>
          {rightSidebarOpen && !focusMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightSidebarWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="sidebar-right flex-shrink-0 overflow-hidden"
              style={{ width: rightSidebarWidth }}
            >
              <RightPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Forja de Círculos */}
      <CircleBuilder />

      {/* Partículas de fondo (decorativas) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 2 === 0 ? "rgba(255,215,0,0.15)" : "rgba(255,77,0,0.1)",
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
