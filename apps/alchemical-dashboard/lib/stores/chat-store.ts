import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent_id?: string;
  timestamp: number;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

export interface Attachment {
  name: string;
  sizeKb: number;
  content: string;
  type: string;
}

export interface ChatState {
  // Messages
  messages: ChatMessage[];
  thread: ChatMessage[];
  
  // Input
  inputText: string;
  selectedAgent: string;
  attachments: Attachment[];
  
  // Options
  thinkingMode: "low" | "balanced" | "deep";
  autoEdit: boolean;
  repo: string;
  
  // Roundtable
  roundtableAgents: string[];
  roundtableRounds: number;
  
  // Connection
  connectionStatus: "connected" | "disconnected" | "connecting";
  
  // UI
  showAdvanced: boolean;
  isStreaming: boolean;
  
  // Actions
  setInputText: (text: string) => void;
  setSelectedAgent: (agent: string) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  setThinkingMode: (mode: "low" | "balanced" | "deep") => void;
  setAutoEdit: (enabled: boolean) => void;
  setRepo: (repo: string) => void;
  setRoundtableAgents: (agents: string[]) => void;
  setRoundtableRounds: (rounds: number) => void;
  setConnectionStatus: (status: "connected" | "disconnected" | "connecting") => void;
  toggleAdvanced: () => void;
  setIsStreaming: (streaming: boolean) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setThread: (messages: ChatMessage[]) => void;
  clearThread: () => void;
}

export const useChatStore = create<ChatState>()(
  immer(
    persist(
      (set) => ({
        // Initial state
        messages: [],
        thread: [],
        inputText: "",
        selectedAgent: "alquimista-mayor",
        attachments: [],
        thinkingMode: "balanced",
        autoEdit: false,
        repo: "",
        roundtableAgents: ["alquimista-mayor", "redactor-narrador", "investigador-analista"],
        roundtableRounds: 1,
        connectionStatus: "disconnected",
        showAdvanced: false,
        isStreaming: false,

        // Actions
        setInputText: (text) =>
          set((state) => {
            state.inputText = text;
          }),

        setSelectedAgent: (agent) =>
          set((state) => {
            state.selectedAgent = agent;
          }),

        addAttachment: (attachment) =>
          set((state) => {
            if (state.attachments.length < 8) {
              state.attachments.push(attachment);
            }
          }),

        removeAttachment: (index) =>
          set((state) => {
            state.attachments.splice(index, 1);
          }),

        clearAttachments: () =>
          set((state) => {
            state.attachments = [];
          }),

        setThinkingMode: (mode) =>
          set((state) => {
            state.thinkingMode = mode;
          }),

        setAutoEdit: (enabled) =>
          set((state) => {
            state.autoEdit = enabled;
          }),

        setRepo: (repo) =>
          set((state) => {
            state.repo = repo;
          }),

        setRoundtableAgents: (agents) =>
          set((state) => {
            state.roundtableAgents = agents;
          }),

        setRoundtableRounds: (rounds) =>
          set((state) => {
            state.roundtableRounds = rounds;
          }),

        setConnectionStatus: (status) =>
          set((state) => {
            state.connectionStatus = status;
          }),

        toggleAdvanced: () =>
          set((state) => {
            state.showAdvanced = !state.showAdvanced;
          }),

        setIsStreaming: (streaming) =>
          set((state) => {
            state.isStreaming = streaming;
          }),

        addMessage: (message) =>
          set((state) => {
            state.messages.push({
              ...message,
              id: Math.random().toString(36).substring(2, 9),
              timestamp: Date.now(),
            });
          }),

        setThread: (messages) =>
          set((state) => {
            state.thread = messages;
          }),

        clearThread: () =>
          set((state) => {
            state.thread = [];
          }),
      }),
      {
        name: "alchemical-chat-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          selectedAgent: state.selectedAgent,
          thinkingMode: state.thinkingMode,
          autoEdit: state.autoEdit,
          repo: state.repo,
          roundtableAgents: state.roundtableAgents,
          roundtableRounds: state.roundtableRounds,
        }),
      }
    )
  )
);
