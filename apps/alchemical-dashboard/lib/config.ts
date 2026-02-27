export interface DashboardConfig {
  agentPollMs: number;
  logsPollMs: number;
  logsLines: number;
  defaultLogService: string;
  /**
   * True when KILO_API_KEY is present in the server environment.
   * This value is resolved server-side only (api/config GET derives it from process.env).
   * The client-side DEFAULT_CONFIG intentionally leaves it `undefined` because
   * KILO_API_KEY is a private env var — it is never exposed to the browser bundle.
   */
  kiloApiConfigured?: boolean;
}

export const DEFAULT_CONFIG: DashboardConfig = {
  /** Single source of truth: matches page.tsx defaultCfg.agentPollMs */
  agentPollMs: 10000,
  logsPollMs: 5000,
  logsLines: 50,
  defaultLogService: "velktharion",
  // NOTE: Do NOT read process.env.KILO_API_KEY here — this module is bundled
  // for the browser and private env vars are not available client-side.
  // The server-side /api/config route injects the correct value.
  kiloApiConfigured: undefined,
};
