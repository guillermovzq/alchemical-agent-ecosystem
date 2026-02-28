import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAgentsStore } from "../stores";
import type { AgentRow, DashboardPayload } from "../types";

const AGENTS_KEY = "agents";
const AGENT_STATS_KEY = "agent-stats";

export function useAgents(pollInterval = 10000) {
  const { setAgents, setStats } = useAgentsStore();

  return useQuery({
    queryKey: [AGENTS_KEY],
    queryFn: async (): Promise<DashboardPayload> => {
      const res = await fetch("/api/agents", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch agents");
      }
      const data = await res.json();
      setAgents(data.items ?? []);
      setStats(data.stats ?? { active: 0, total: 0, tasksToday: null, tokensProcessed: null, uptimeAvg: 0 });
      return data;
    },
    refetchInterval: pollInterval,
    staleTime: 5000,
  });
}

export function useAgent(name: string) {
  return useQuery({
    queryKey: [AGENTS_KEY, name],
    queryFn: async (): Promise<AgentRow | null> => {
      const res = await fetch(`/api/agent/${name}`, { cache: "no-store" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!name,
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agent: AgentRow): Promise<void> => {
      const res = await fetch("/api/gateway/agents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...agent,
          enabled: Boolean(agent.enabled),
        }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.detail ?? error.error ?? "Failed to update agent");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
    },
  });
}

export function useDispatchAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, payload }: { name: string; payload: unknown }): Promise<void> => {
      const res = await fetch(`/api/agent/${name}/dispatch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to dispatch to agent");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
    },
  });
}
