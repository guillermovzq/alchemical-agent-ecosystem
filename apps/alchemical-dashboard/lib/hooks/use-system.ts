import { useQuery } from "@tanstack/react-query";

interface CoreService {
  name: string;
  state: string;
  status: string;
  health: "healthy" | "down" | "unknown";
}

interface SystemStatus {
  services: CoreService[];
  version?: string;
  uptime?: number;
}

const SYSTEM_KEY = "system-status";

export function useSystem(pollInterval = 12000) {
  return useQuery({
    queryKey: [SYSTEM_KEY],
    queryFn: async (): Promise<SystemStatus> => {
      const res = await fetch("/api/system", { cache: "no-store" });
      if (!res.ok) {
        return { services: [] };
      }
      return res.json();
    },
    refetchInterval: pollInterval,
    staleTime: 5000,
    initialData: { services: [] },
  });
}
