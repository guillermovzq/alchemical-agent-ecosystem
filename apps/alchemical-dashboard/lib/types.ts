export type AgentStatus = "Running" | "Paused" | "Error";

export type AgentRow = {
  name: string;
  role: string;
  model: string;
  description: string;
  service: string;
  enabled: boolean;
  status: AgentStatus;
  latencyMs: number | null;
  containerState: string;
  containerStatus: string;
};

export type DashboardPayload = {
  items: AgentRow[];
  stats: {
    active: number;
    total: number;
    tasksToday: number | null;
    tokensProcessed: number | null;
    uptimeAvg: number;
  };
};
