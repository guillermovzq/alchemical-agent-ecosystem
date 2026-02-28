import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AgentRow } from "../types";

export interface AgentStats {
  active: number;
  total: number;
  tasksToday: number | null;
  tokensProcessed: number | null;
  uptimeAvg: number;
}

export interface AgentsState {
  // Data
  agents: AgentRow[];
  stats: AgentStats;
  selectedAgent: string | null;
  
  // Filters
  searchQuery: string;
  statusFilter: string | null;
  
  // UI
  isCreating: boolean;
  editingAgent: AgentRow | null;
  
  // Actions
  setAgents: (agents: AgentRow[]) => void;
  setStats: (stats: AgentStats) => void;
  selectAgent: (name: string | null) => void;
  updateAgent: (name: string, updates: Partial<AgentRow>) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string | null) => void;
  setIsCreating: (creating: boolean) => void;
  setEditingAgent: (agent: AgentRow | null) => void;
}

export const useAgentsStore = create<AgentsState>()(
  immer((set) => ({
    // Initial state
    agents: [],
    stats: {
      active: 0,
      total: 0,
      tasksToday: null,
      tokensProcessed: null,
      uptimeAvg: 0,
    },
    selectedAgent: null,
    searchQuery: "",
    statusFilter: null,
    isCreating: false,
    editingAgent: null,

    // Actions
    setAgents: (agents) =>
      set((state) => {
        state.agents = agents;
      }),

    setStats: (stats) =>
      set((state) => {
        state.stats = stats;
      }),

    selectAgent: (name) =>
      set((state) => {
        state.selectedAgent = name;
      }),

    updateAgent: (name, updates) =>
      set((state) => {
        const agent = state.agents.find((a) => a.name === name);
        if (agent) {
          Object.assign(agent, updates);
        }
      }),

    setSearchQuery: (query) =>
      set((state) => {
        state.searchQuery = query;
      }),

    setStatusFilter: (status) =>
      set((state) => {
        state.statusFilter = status;
      }),

    setIsCreating: (creating) =>
      set((state) => {
        state.isCreating = creating;
      }),

    setEditingAgent: (agent) =>
      set((state) => {
        state.editingAgent = agent;
      }),
  }))
);
