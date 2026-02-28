"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Node, Edge } from "@xyflow/react";

/* ═══════════════════════════════════════════════════════════════
   TIPOS ALQUÍMICOS
═══════════════════════════════════════════════════════════════ */

export type AgentRole = "prima-materia" | "catalyst" | "refiner" | "scribe" | "oracle" | "sentinel" | "weaver";

export type AgentStatus = "idle" | "active" | "transmuting" | "error" | "dormant";

export type TransmutationPhase = "nigredo" | "albedo" | "citrinitas" | "rubedo";

export interface AlchemicalAgent {
  id: string;
  name: string;
  codename: string;
  role: AgentRole;
  status: AgentStatus;
  description: string;
  skills: string[];
  memoryUsage: number;
  tasksCompleted: number;
  successRate: number;
  model: string;
  avatar: string;
  color: string;
  glow: string;
}

export interface AlchemicalCircle {
  id: string;
  name: string;
  description: string;
  agents: string[];
  phase: TransmutationPhase;
  status: "idle" | "active" | "completed" | "error";
  createdAt: Date;
  lastRun?: Date;
  nodes: Node[];
  edges: Edge[];
}

export interface ConsoleEntry {
  id: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error" | "transmutation";
  message: string;
  agent?: string;
  phase?: TransmutationPhase;
  metadata?: Record<string, unknown>;
}

export interface DashboardState {
  /* ── Layout ── */
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  consoleOpen: boolean;
  focusMode: boolean;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  consoleHeight: number;

  /* ── Selección ── */
  selectedCircleId: string | null;
  selectedAgentId: string | null;
  selectedNodeId: string | null;
  rightPanelTab: "inspector" | "config" | "memory" | "telemetry";

  /* ── Datos ── */
  agents: AlchemicalAgent[];
  circles: AlchemicalCircle[];
  consoleEntries: ConsoleEntry[];

  /* ── Estado de Forja ── */
  isForgeModalOpen: boolean;
  isTransmuting: boolean;
  transmutationPhase: TransmutationPhase;

  /* ── Acciones de Layout ── */
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleConsole: () => void;
  toggleFocusMode: () => void;
  setLeftSidebarWidth: (w: number) => void;
  setRightSidebarWidth: (w: number) => void;
  setConsoleHeight: (h: number) => void;

  /* ── Acciones de Selección ── */
  selectCircle: (id: string | null) => void;
  selectAgent: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  setRightPanelTab: (tab: DashboardState["rightPanelTab"]) => void;

  /* ── Acciones de Datos ── */
  addConsoleEntry: (entry: Omit<ConsoleEntry, "id" | "timestamp">) => void;
  clearConsole: () => void;
  addCircle: (circle: AlchemicalCircle) => void;
  updateCircle: (id: string, updates: Partial<AlchemicalCircle>) => void;
  deleteCircle: (id: string) => void;
  updateAgent: (id: string, updates: Partial<AlchemicalAgent>) => void;

  /* ── Acciones de Forja ── */
  openForgeModal: () => void;
  closeForgeModal: () => void;
  startTransmutation: () => void;
  setTransmutationPhase: (phase: TransmutationPhase) => void;
  endTransmutation: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   AGENTES PREDEFINIDOS DEL ECOSISTEMA
═══════════════════════════════════════════════════════════════ */

const INITIAL_AGENTS: AlchemicalAgent[] = [
  {
    id: "velktharion",
    name: "Velktharion",
    codename: "El Arquitecto",
    role: "prima-materia",
    status: "idle",
    description: "Agente maestro de planificación y descomposición de tareas complejas. Transforma el caos en estructura.",
    skills: ["Planificación estratégica", "Descomposición de tareas", "Análisis de dependencias", "LangGraph orchestration"],
    memoryUsage: 42,
    tasksCompleted: 847,
    successRate: 94.2,
    model: "llama3.2:latest",
    avatar: "⚗️",
    color: "#FFD700",
    glow: "rgba(255, 215, 0, 0.4)",
  },
  {
    id: "synapsara",
    name: "Synapsara",
    codename: "La Tejedora",
    role: "weaver",
    status: "idle",
    description: "Especialista en síntesis de información y conexión de conocimientos dispersos. Teje el tapiz del saber.",
    skills: ["Síntesis de información", "RAG avanzado", "ChromaDB queries", "Semantic search"],
    memoryUsage: 67,
    tasksCompleted: 1203,
    successRate: 97.8,
    model: "mistral:latest",
    avatar: "🕸️",
    color: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.4)",
  },
  {
    id: "kryonexus",
    name: "Kryonexus",
    codename: "El Guardián",
    role: "sentinel",
    status: "idle",
    description: "Agente de seguridad y validación. Protege la integridad del ecosistema y verifica resultados.",
    skills: ["Validación de outputs", "Detección de anomalías", "Fact-checking", "Security scanning"],
    memoryUsage: 28,
    tasksCompleted: 562,
    successRate: 99.1,
    model: "phi3:latest",
    avatar: "🛡️",
    color: "#60A5FA",
    glow: "rgba(96, 165, 250, 0.4)",
  },
  {
    id: "pyraxis",
    name: "Pyraxis",
    codename: "El Catalizador",
    role: "catalyst",
    status: "idle",
    description: "Agente de ejecución rápida y transformación de datos. Acelera los procesos de transmutación.",
    skills: ["Code execution", "Data transformation", "API integration", "Rapid prototyping"],
    memoryUsage: 55,
    tasksCompleted: 2341,
    successRate: 91.5,
    model: "codellama:latest",
    avatar: "🔥",
    color: "#FF4D00",
    glow: "rgba(255, 77, 0, 0.4)",
  },
  {
    id: "lumivex",
    name: "Lumivex",
    codename: "El Refinador",
    role: "refiner",
    status: "idle",
    description: "Especialista en pulir y perfeccionar outputs. Transforma el plomo en oro puro.",
    skills: ["Text refinement", "Quality assurance", "Style adaptation", "Output optimization"],
    memoryUsage: 33,
    tasksCompleted: 1876,
    successRate: 96.3,
    model: "gemma2:latest",
    avatar: "✨",
    color: "#10B981",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "archivex",
    name: "Archivex",
    codename: "El Escriba",
    role: "scribe",
    status: "idle",
    description: "Guardián de la memoria y el conocimiento. Documenta, indexa y recupera el saber acumulado.",
    skills: ["Documentation", "Memory indexing", "Redis management", "Knowledge graphs"],
    memoryUsage: 78,
    tasksCompleted: 3102,
    successRate: 98.7,
    model: "llama3.2:latest",
    avatar: "📜",
    color: "#F59E0B",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "oraclyx",
    name: "Oraclyx",
    codename: "El Oráculo",
    role: "oracle",
    status: "idle",
    description: "Agente de predicción y análisis profundo. Ve patrones donde otros ven caos.",
    skills: ["Pattern recognition", "Predictive analysis", "Deep reasoning", "Multi-step inference"],
    memoryUsage: 61,
    tasksCompleted: 445,
    successRate: 88.9,
    model: "deepseek-r1:latest",
    avatar: "🔮",
    color: "#A78BFA",
    glow: "rgba(167, 139, 250, 0.4)",
  },
];

/* ═══════════════════════════════════════════════════════════════
   CÍRCULOS DE EJEMPLO
═══════════════════════════════════════════════════════════════ */

const INITIAL_CIRCLES: AlchemicalCircle[] = [
  {
    id: "circle-research",
    name: "Círculo de Investigación",
    description: "Equipo especializado en análisis profundo y síntesis de conocimiento",
    agents: ["velktharion", "synapsara", "oraclyx"],
    phase: "rubedo",
    status: "idle",
    createdAt: new Date("2024-01-15"),
    lastRun: new Date("2024-01-20"),
    nodes: [],
    edges: [],
  },
  {
    id: "circle-code",
    name: "Círculo de Forja de Código",
    description: "Equipo de desarrollo y revisión de código de alta calidad",
    agents: ["pyraxis", "lumivex", "kryonexus"],
    phase: "albedo",
    status: "idle",
    createdAt: new Date("2024-01-18"),
    nodes: [],
    edges: [],
  },
];

/* ═══════════════════════════════════════════════════════════════
   STORE PRINCIPAL
═══════════════════════════════════════════════════════════════ */

export const useDashboardStore = create<DashboardState>()(
  subscribeWithSelector((set) => ({
    /* ── Layout inicial ── */
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    consoleOpen: true,
    focusMode: false,
    leftSidebarWidth: 280,
    rightSidebarWidth: 320,
    consoleHeight: 200,

    /* ── Selección inicial ── */
    selectedCircleId: null,
    selectedAgentId: null,
    selectedNodeId: null,
    rightPanelTab: "inspector",

    /* ── Datos iniciales ── */
    agents: INITIAL_AGENTS,
    circles: INITIAL_CIRCLES,
    consoleEntries: [
      {
        id: "boot-1",
        timestamp: new Date(),
        level: "transmutation",
        message: "⚗️ Alchemical Agent Ecosystem iniciado. Bienvenido al Grimorio.",
        phase: "nigredo",
      },
      {
        id: "boot-2",
        timestamp: new Date(),
        level: "success",
        message: "✓ 7 agentes alquímicos detectados y listos para transmutación.",
      },
      {
        id: "boot-3",
        timestamp: new Date(),
        level: "info",
        message: "→ Redis conectado | ChromaDB online | LangGraph v0.2 activo",
      },
      {
        id: "boot-4",
        timestamp: new Date(),
        level: "info",
        message: "→ FastAPI backend: http://localhost:8000 | OpenTelemetry: activo",
      },
    ],

    /* ── Estado de Forja ── */
    isForgeModalOpen: false,
    isTransmuting: false,
    transmutationPhase: "nigredo",

    /* ── Acciones de Layout ── */
    toggleLeftSidebar: () => set((s: DashboardState) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
    toggleRightSidebar: () => set((s: DashboardState) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
    toggleConsole: () => set((s: DashboardState) => ({ consoleOpen: !s.consoleOpen })),
    toggleFocusMode: () => set((s: DashboardState) => ({ focusMode: !s.focusMode })),
    setLeftSidebarWidth: (w: number) => set({ leftSidebarWidth: w }),
    setRightSidebarWidth: (w: number) => set({ rightSidebarWidth: w }),
    setConsoleHeight: (h: number) => set({ consoleHeight: h }),

    /* ── Acciones de Selección ── */
    selectCircle: (id: string | null) => set({ selectedCircleId: id }),
    selectAgent: (id: string | null) => set({ selectedAgentId: id }),
    selectNode: (id: string | null) => set({ selectedNodeId: id }),
    setRightPanelTab: (tab: DashboardState["rightPanelTab"]) => set({ rightPanelTab: tab }),

    /* ── Acciones de Datos ── */
    addConsoleEntry: (entry: Omit<ConsoleEntry, "id" | "timestamp">) =>
      set((s: DashboardState) => ({
        consoleEntries: [
          ...s.consoleEntries,
          { ...entry, id: `entry-${Date.now()}-${Math.random()}`, timestamp: new Date() },
        ].slice(-500),
      })),

    clearConsole: () => set({ consoleEntries: [] }),

    addCircle: (circle: AlchemicalCircle) =>
      set((s: DashboardState) => ({ circles: [...s.circles, circle] })),

    updateCircle: (id: string, updates: Partial<AlchemicalCircle>) =>
      set((s: DashboardState) => ({
        circles: s.circles.map((c: AlchemicalCircle) => (c.id === id ? { ...c, ...updates } : c)),
      })),

    deleteCircle: (id: string) =>
      set((s: DashboardState) => ({
        circles: s.circles.filter((c: AlchemicalCircle) => c.id !== id),
        selectedCircleId: s.selectedCircleId === id ? null : s.selectedCircleId,
      })),

    updateAgent: (id: string, updates: Partial<AlchemicalAgent>) =>
      set((s: DashboardState) => ({
        agents: s.agents.map((a: AlchemicalAgent) => (a.id === id ? { ...a, ...updates } : a)),
      })),

    /* ── Acciones de Forja ── */
    openForgeModal: () => set({ isForgeModalOpen: true }),
    closeForgeModal: () => set({ isForgeModalOpen: false }),
    startTransmutation: () => set({ isTransmuting: true, transmutationPhase: "nigredo" }),
    setTransmutationPhase: (phase: TransmutationPhase) => set({ transmutationPhase: phase }),
    endTransmutation: () => set({ isTransmuting: false }),
  }))
);
