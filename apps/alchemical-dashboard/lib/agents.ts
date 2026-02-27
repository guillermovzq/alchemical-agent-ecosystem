export interface AgentDefinition {
  name: string;
  port: number;
  action: string;
  model: string;
  description: string;
}

/**
 * KiloCode model identifiers available for agent assignment.
 * - haiku: fast/lightweight tasks (navigation, routing, search, mail, scheduling, audio, voice)
 * - sonnet: balanced complex reasoning (orchestration, transform pipelines, flow diagnostics)
 * - opus: highest capability tasks
 * - minimax: free tier option
 * - kilo/auto: automatic model selection
 */
export const KILO_MODELS = [
  "anthropic/claude-haiku-4.5",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-opus-4.6",
  "minimax/minimax-m2.5:free",
  "kilo/auto",
] as const;

export type KiloModelId = (typeof KILO_MODELS)[number];

export const AGENTS: AgentDefinition[] = [
  { name: "velktharion",      port: 7401, action: "navigate",   model: "anthropic/claude-haiku-4.5",  description: "Browser/navigation specialist" },
  { name: "synapsara",        port: 7402, action: "query",      model: "anthropic/claude-haiku-4.5",  description: "Knowledge routing" },
  { name: "kryonexus",        port: 7403, action: "search",     model: "anthropic/claude-haiku-4.5",  description: "Retrieval and search" },
  { name: "noctumbra-mail",   port: 7404, action: "send",       model: "anthropic/claude-haiku-4.5",  description: "Mail automation" },
  { name: "temporaeth",       port: 7405, action: "plan",       model: "anthropic/claude-haiku-4.5",  description: "Scheduling and planning" },
  { name: "vaeloryn-conclave",port: 7406, action: "deliberate", model: "anthropic/claude-sonnet-4.5", description: "Consensus orchestration" },
  { name: "ignivox",          port: 7407, action: "transform",  model: "anthropic/claude-sonnet-4.5", description: "Transform pipelines" },
  { name: "auralith",         port: 7408, action: "live",       model: "anthropic/claude-haiku-4.5",  description: "Audio live analysis" },
  { name: "resonvyr",         port: 7409, action: "voice",      model: "anthropic/claude-haiku-4.5",  description: "Voice tasks" },
  { name: "fluxenrath",       port: 7410, action: "/",          model: "anthropic/claude-sonnet-4.5", description: "Flow diagnostics" },
];

export const CORE_SERVICES = ["kilo-api", "redis", "chromadb", "caddy", "alchemical-gateway"] as const;

export type CoreService = (typeof CORE_SERVICES)[number];
