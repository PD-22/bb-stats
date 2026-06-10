import { BATTLEMETRICS_BASE_URL, CacheSchema, SERVER_ID } from "@/lib/const";
import { processPlayerData } from "@/lib/processPlayerData";
import { useQuery } from "@tanstack/react-query";

const SERVER_URL = `${BATTLEMETRICS_BASE_URL}/servers/${SERVER_ID}/player-count-history`;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

export default function usePlayerData() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["player-data"],
    queryFn: fetchPlayerData,
    select: (data) => CacheSchema.parse(data),
    staleTime: HOUR_MS,
    gcTime: DAY_MS,
  });

  return {
    chartData: data?.chartData ?? [],
    days: data?.days ?? [],
    loading: isLoading,
    error: isError,
  };
}

async function fetchPlayerData() {
  const params = new URLSearchParams({
    start: new Date(Date.now() - THIRTY_DAYS_MS).toISOString(),
    stop: new Date().toISOString(),
    resolution: "60",
  });
  const r = await fetch(`${SERVER_URL}?${params}`);
  return processPlayerData(await r.json());
}
