import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type View =
  | "chat"
  | "nodes"
  | "agents"
  | "ops"
  | "admin"
  | "logs"
  | "skills"
  | "telemetry";

export interface AppState {
  // Navigation
  activeView: View;
  sidebarCollapsed: boolean;
  
  // UI States
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  
  // Actions
  setView: (view: View) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  timestamp: number;
  duration?: number;
}

export const useAppStore = create<AppState>()(
  immer(
    persist(
      (set) => ({
        // Initial state
        activeView: "chat",
        sidebarCollapsed: false,
        isLoading: false,
        error: null,
        notifications: [],

        // Actions
        setView: (view) =>
          set((state) => {
            state.activeView = view;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        addNotification: (notification) =>
          set((state) => {
            const id = Math.random().toString(36).substring(2, 9);
            state.notifications.unshift({
              ...notification,
              id,
              timestamp: Date.now(),
            });
            // Keep only last 50 notifications
            if (state.notifications.length > 50) {
              state.notifications = state.notifications.slice(0, 50);
            }
          }),

        dismissNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter((n) => n.id !== id);
          }),

        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),
      }),
      {
        name: "alchemical-app-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          activeView: state.activeView,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
);
