import { useQuery } from "@tanstack/react-query";

interface SystemMetrics {
  cpu: number;
  ram: number;
  gpu: number;
}

const METRICS_KEY = "system-metrics";

export function useMetrics(pollInterval = 7000) {
  return useQuery({
    queryKey: [METRICS_KEY],
    queryFn: async (): Promise<SystemMetrics> => {
      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (!res.ok) {
        return { cpu: 0, ram: 0, gpu: 0 };
      }
      return res.json();
    },
    refetchInterval: pollInterval,
    staleTime: 3000,
    initialData: { cpu: 0, ram: 0, gpu: 0 },
  });
}
