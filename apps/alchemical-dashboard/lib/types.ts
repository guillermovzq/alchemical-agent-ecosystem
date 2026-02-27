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

export type View =
  | "dashboard"
  | "agents"
  | "studio"
  | "chat"
  | "jobs"
  | "events"
  | "logs"
  | "connectors"
  | "skills"
  | "settings"
  | "admin";

export interface ApiKey {
  id: string;
  label: string;
  role: string;
  created_at: string;
  last_used?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  target_service: string;
  skills: string[];
  tools: string[];
  status?: string;
  latency_ms?: number;
}

export interface Job {
  id: string;
  agent_id: string;
  status: "pending" | "running" | "done" | "failed";
  created_at: string;
  finished_at?: string;
  result?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent_id?: string;
  created_at: string;
}

export interface KiloModel {
  id: string;
  name: string;
  provider: string;
  free: boolean;
  context_length?: number;
}
