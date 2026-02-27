export type Agent = {
  name: string;
  port: number;
  status: "Running" | "Paused" | "Error";
  model: string;
  description: string;
};

export const agents: Agent[] = [
  { name: "Synapsara", port: 7401, status: "Running", model: "llama3.2", description: "Routing cognitivo" },
  { name: "Auralith", port: 7402, status: "Running", model: "mistral", description: "Audio + intent" },
  { name: "Temporaeth", port: 7403, status: "Paused", model: "qwen2.5", description: "Planificador temporal" },
  { name: "Fluxenrath", port: 7404, status: "Error", model: "deepseek-r1", description: "Análisis flujo" },
  { name: "Resonvyr", port: 7405, status: "Running", model: "llama3.1", description: "Resonancia semántica" }
];
