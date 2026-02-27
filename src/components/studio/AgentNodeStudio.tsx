"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Play,
  Square,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Plus,
  Layers,
  Cpu,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { NODE_TYPES, type AlchemicalNodeData } from "./CustomNode";
import { useDashboardStore } from "@/lib/store/dashboard";

/* ═══════════════════════════════════════════════════════════════
   NODOS INICIALES DE EJEMPLO
═══════════════════════════════════════════════════════════════ */

const INITIAL_NODES: Node[] = [
  {
    id: "input-1",
    type: "circleInput",
    position: { x: 60, y: 200 },
    data: {},
  },
  {
    id: "velktharion-1",
    type: "alchemical",
    position: { x: 260, y: 120 },
    data: {
      agentId: "velktharion",
      label: "Velktharion",
      role: "prima-materia",
      status: "idle",
      codename: "El Arquitecto",
      avatar: "⚗️",
      color: "#FFD700",
      glow: "rgba(255, 215, 0, 0.4)",
      model: "llama3.2:latest",
      successRate: 94.2,
      tasksCompleted: 847,
    },
  },
  {
    id: "synapsara-1",
    type: "alchemical",
    position: { x: 260, y: 320 },
    data: {
      agentId: "synapsara",
      label: "Synapsara",
      role: "weaver",
      status: "idle",
      codename: "La Tejedora",
      avatar: "🕸️",
      color: "#8B5CF6",
      glow: "rgba(139, 92, 246, 0.4)",
      model: "mistral:latest",
      successRate: 97.8,
      tasksCompleted: 1203,
    },
  },
  {
    id: "lumivex-1",
    type: "alchemical",
    position: { x: 520, y: 200 },
    data: {
      agentId: "lumivex",
      label: "Lumivex",
      role: "refiner",
      status: "idle",
      codename: "El Refinador",
      avatar: "✨",
      color: "#10B981",
      glow: "rgba(16, 185, 129, 0.4)",
      model: "gemma2:latest",
      successRate: 96.3,
      tasksCompleted: 1876,
    },
  },
  {
    id: "output-1",
    type: "circleOutput",
    position: { x: 780, y: 200 },
    data: {},
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: "e-input-velk",
    source: "input-1",
    target: "velktharion-1",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,215,0,0.6)" },
    style: { stroke: "rgba(255,215,0,0.4)", strokeWidth: 2 },
  },
  {
    id: "e-input-syn",
    source: "input-1",
    target: "synapsara-1",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(139,92,246,0.6)" },
    style: { stroke: "rgba(139,92,246,0.4)", strokeWidth: 2 },
  },
  {
    id: "e-velk-lumi",
    source: "velktharion-1",
    target: "lumivex-1",
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,215,0,0.4)" },
    style: { stroke: "rgba(255,215,0,0.3)", strokeWidth: 1.5 },
  },
  {
    id: "e-syn-lumi",
    source: "synapsara-1",
    target: "lumivex-1",
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(139,92,246,0.4)" },
    style: { stroke: "rgba(139,92,246,0.3)", strokeWidth: 1.5 },
  },
  {
    id: "e-lumi-output",
    source: "lumivex-1",
    target: "output-1",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(16,185,129,0.6)" },
    style: { stroke: "rgba(16,185,129,0.4)", strokeWidth: 2 },
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAGIC WAND BAR
═══════════════════════════════════════════════════════════════ */

function MagicWandBar({ onAction }: { onAction: (action: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const spells = [
    { id: "power", icon: "⚡", label: "Hazlo más poderoso", desc: "Añade agentes de soporte" },
    { id: "agent", icon: "🧙", label: "Añade agente temporal", desc: "Invoca un especialista" },
    { id: "code", icon: "💻", label: "Transmuta a código", desc: "Genera implementación" },
    { id: "export", icon: "📜", label: "Exporta Grimorio", desc: "JSON + Markdown + PDF" },
    { id: "optimize", icon: "🔮", label: "Optimiza el Círculo", desc: "IA sugiere mejoras" },
  ];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg btn-forge text-sm font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Wand2 size={14} className="text-[#FFD700]" />
        <span className="text-[#FFD700] font-cinzel text-xs">Varita Mágica</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className="text-[#FFD700]/60" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-64 rounded-xl border border-[#FFD700]/20 overflow-hidden z-50"
            style={{ background: "rgba(17,17,17,0.98)", boxShadow: "0 8px 32px rgba(0,0,0,0.8)" }}
          >
            <div className="p-2 border-b border-[#FFD700]/10">
              <p className="text-[10px] text-[#FFD700]/50 font-cinzel px-2 py-1">HECHIZOS DISPONIBLES</p>
            </div>
            {spells.map((spell) => (
              <motion.button
                key={spell.id}
                onClick={() => { onAction(spell.id); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#FFD700]/5 transition-colors text-left"
                whileHover={{ x: 2 }}
              >
                <span className="text-base">{spell.icon}</span>
                <div>
                  <div className="text-xs text-[#FFD700]/90 font-medium">{spell.label}</div>
                  <div className="text-[10px] text-[#666]">{spell.desc}</div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BARRA DE HERRAMIENTAS DEL STUDIO
═══════════════════════════════════════════════════════════════ */

function StudioToolbar({
  isRunning,
  onRun,
  onStop,
  onReset,
  onFocusMode,
  isFocusMode,
  onWandAction,
}: {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onFocusMode: () => void;
  isFocusMode: boolean;
  onWandAction: (action: string) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#FFD700]/10 bg-[#0D0D0D]">
      {/* Izquierda: Nombre del círculo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#FFD700]/60" />
          <span className="text-xs font-cinzel text-[#FFD700]/80 font-semibold">
            Agent Node Studio
          </span>
        </div>
        <div className="w-px h-4 bg-[#2A2A2A]" />
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] text-[#666]">Círculo de Investigación</span>
        </div>
      </div>

      {/* Centro: Controles de ejecución */}
      <div className="flex items-center gap-2">
        <MagicWandBar onAction={onWandAction} />

        <div className="w-px h-6 bg-[#2A2A2A]" />

        {!isRunning ? (
          <motion.button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))",
              border: "1px solid rgba(16,185,129,0.4)",
              color: "#10B981",
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(16,185,129,0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Play size={12} />
            <span>Invocar Círculo</span>
          </motion.button>
        ) : (
          <motion.button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(220,38,38,0.1))",
              border: "1px solid rgba(220,38,38,0.4)",
              color: "#DC2626",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={{ boxShadow: ["0 0 10px rgba(220,38,38,0.2)", "0 0 20px rgba(220,38,38,0.4)", "0 0 10px rgba(220,38,38,0.2)"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Square size={12} />
            <span>Detener</span>
          </motion.button>
        )}

        <motion.button
          onClick={onReset}
          className="p-1.5 rounded-lg text-[#666] hover:text-[#FFD700]/60 hover:bg-[#FFD700]/5 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Reiniciar canvas"
        >
          <RotateCcw size={14} />
        </motion.button>
      </div>

      {/* Derecha: Opciones de vista */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[10px] text-[#555]">
          <Cpu size={10} />
          <span>4 nodos · 5 conexiones</span>
        </div>
        <div className="w-px h-4 bg-[#2A2A2A]" />
        <motion.button
          onClick={onFocusMode}
          className="p-1.5 rounded-lg text-[#666] hover:text-[#FFD700]/60 hover:bg-[#FFD700]/5 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isFocusMode ? "Salir del modo Focus" : "Modo Focus"}
        >
          {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL DE TRANSMUTACIÓN (overlay durante ejecución)
═══════════════════════════════════════════════════════════════ */

function TransmutationOverlay({ phase }: { phase: string }) {
  const phaseConfig = {
    nigredo: { color: "#1A1A1A", label: "Nigredo", desc: "Descomposición inicial...", icon: "🌑" },
    albedo: { color: "#E5E7EB", label: "Albedo", desc: "Purificación en proceso...", icon: "🌕" },
    citrinitas: { color: "#FFD700", label: "Citrinitas", desc: "Iluminación emergente...", icon: "☀️" },
    rubedo: { color: "#FF4D00", label: "Rubedo", desc: "Transmutación completa.", icon: "🔴" },
  };

  const config = phaseConfig[phase as keyof typeof phaseConfig] || phaseConfig.nigredo;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-8 rounded-2xl border"
        style={{
          background: "rgba(17,17,17,0.95)",
          borderColor: `${config.color}40`,
          boxShadow: `0 0 40px ${config.color}20`,
        }}
      >
        <motion.div
          className="text-5xl mb-4"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          {config.icon}
        </motion.div>
        <div className="font-cinzel text-lg font-bold mb-1" style={{ color: config.color }}>
          {config.label}
        </div>
        <div className="text-sm text-[#888]">{config.desc}</div>
        <div className="mt-4 flex gap-1 justify-center">
          {["nigredo", "albedo", "citrinitas", "rubedo"].map((p) => (
            <motion.div
              key={p}
              className="w-2 h-2 rounded-full"
              style={{
                background: p === phase ? config.color : "#2A2A2A",
              }}
              animate={p === phase ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AGENT NODE STUDIO PRINCIPAL
═══════════════════════════════════════════════════════════════ */

export default function AgentNodeStudio() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [isRunning, setIsRunning] = useState(false);
  const [transmutationPhase, setTransmutationPhase] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
    focusMode,
    toggleFocusMode,
    addConsoleEntry,
    selectNode,
    selectAgent,
    setRightPanelTab,
  } = useDashboardStore();

  /* ── Conexión de nodos ── */
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${params.source}-${params.target}`,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,215,0,0.6)" },
        style: { stroke: "rgba(255,215,0,0.4)", strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      addConsoleEntry({
        level: "info",
        message: `→ Conexión forjada: ${params.source} ⟶ ${params.target}`,
      });
    },
    [setEdges, addConsoleEntry]
  );

  /* ── Selección de nodo ── */
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
      const data = node.data as unknown as AlchemicalNodeData;
      if (data?.agentId) {
        selectAgent(data.agentId);
        setRightPanelTab("inspector");
      }
    },
    [selectNode, selectAgent, setRightPanelTab]
  );

  /* ── Ejecutar Círculo ── */
  const handleRun = useCallback(async () => {
    setIsRunning(true);
    const phases: Array<"nigredo" | "albedo" | "citrinitas" | "rubedo"> = [
      "nigredo", "albedo", "citrinitas", "rubedo"
    ];

    addConsoleEntry({ level: "transmutation", message: "⚗️ Iniciando transmutación del Círculo..." });

    // Activar nodos secuencialmente
    for (const phase of phases) {
      setTransmutationPhase(phase);
      addConsoleEntry({
        level: "transmutation",
        message: `◈ Fase ${phase.toUpperCase()}: ${
          phase === "nigredo" ? "Descomponiendo el problema..." :
          phase === "albedo" ? "Purificando el conocimiento..." :
          phase === "citrinitas" ? "Iluminando la solución..." :
          "Transmutación completada. Rubedo alcanzado."
        }`,
        phase,
      });

      // Actualizar estado de nodos
      setNodes((nds) =>
        nds.map((n) => {
          if (n.type === "alchemical") {
            return {
              ...n,
              data: {
                ...n.data,
                status: phase === "rubedo" ? "idle" : "transmuting",
              },
            };
          }
          return n;
        })
      );

      await new Promise((r) => setTimeout(r, 1500));
    }

    setIsRunning(false);
    setTransmutationPhase(null);
    addConsoleEntry({ level: "success", message: "✓ Círculo completado. Resultado disponible en el panel derecho." });
  }, [addConsoleEntry, setNodes]);

  /* ── Detener ── */
  const handleStop = useCallback(() => {
    setIsRunning(false);
    setTransmutationPhase(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" },
      }))
    );
    addConsoleEntry({ level: "warning", message: "⚠ Transmutación interrumpida por el operador." });
  }, [setNodes, addConsoleEntry]);

  /* ── Reiniciar ── */
  const handleReset = useCallback(() => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    addConsoleEntry({ level: "info", message: "↺ Canvas reiniciado al estado inicial." });
  }, [setNodes, setEdges, addConsoleEntry]);

  /* ── Acción de Varita Mágica ── */
  const handleWandAction = useCallback((action: string) => {
    const messages: Record<string, string> = {
      power: "🔮 Analizando el Círculo para sugerir mejoras de poder...",
      agent: "🧙 Invocando agente temporal especializado...",
      code: "💻 Transmutando el Círculo a código Python/LangGraph...",
      export: "📜 Preparando exportación del Grimorio...",
      optimize: "⚡ Optimizando flujo de transmutación con IA...",
    };
    addConsoleEntry({ level: "transmutation", message: messages[action] || "Hechizo desconocido." });
  }, [addConsoleEntry]);

  /* ── Minimap personalizado ── */
  const minimapNodeColor = useCallback((node: Node) => {
    const data = node.data as unknown as AlchemicalNodeData;
    return data?.color || "#2A2A2A";
  }, []);

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* Toolbar */}
      <StudioToolbar
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onReset={handleReset}
        onFocusMode={toggleFocusMode}
        isFocusMode={focusMode}
        onWandAction={handleWandAction}
      />

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: "rgba(255,215,0,0.3)", strokeWidth: 1.5 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="rgba(255,215,0,0.06)"
          />
          <Controls
            showInteractive={false}
            className="!bottom-4 !left-4"
          />
          <MiniMap
            nodeColor={minimapNodeColor}
            maskColor="rgba(0,0,0,0.7)"
            className="!bottom-4 !right-4 !w-36 !h-24"
            style={{
              background: "rgba(10,10,10,0.9)",
              border: "1px solid rgba(255,215,0,0.15)",
              borderRadius: "8px",
            }}
          />

          {/* Panel de estado del Círculo */}
          <Panel position="top-right" className="m-3">
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#FFD700]/15"
              style={{ background: "rgba(17,17,17,0.9)" }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Sparkles size={12} className="text-[#FFD700]/60" />
              <span className="text-[10px] text-[#666] font-mono">
                {isRunning ? "Transmutando..." : "En reposo"}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-[#FFD700] animate-pulse" : "bg-[#2A2A2A]"}`}
              />
            </motion.div>
          </Panel>

          {/* Hint para nuevos usuarios */}
          {nodes.length <= 5 && !isRunning && (
            <Panel position="bottom-center" className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#FFD700]/10 text-[10px] text-[#555]"
                style={{ background: "rgba(17,17,17,0.8)" }}
              >
                <Plus size={10} className="text-[#FFD700]/40" />
                <span>Arrastra agentes desde el Grimorio · Conecta nodos para forjar el flujo</span>
              </motion.div>
            </Panel>
          )}
        </ReactFlow>

        {/* Overlay de transmutación */}
        <AnimatePresence>
          {transmutationPhase && (
            <TransmutationOverlay phase={transmutationPhase} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
