import { ResponseSchema, SERVER_ID } from "@/lib/const";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

export default function usePlayerData() {
  const [chartData, setChartData] = useState<Record<string, number | string>[]>(
    [],
  );
  const [days, setDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stop = new Date().toISOString();
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const url = `https://api.battlemetrics.com/servers/${SERVER_ID}/player-count-history?start=${start}&stop=${stop}&resolution=60`;

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const parsed = ResponseSchema.parse(json);

        const grouped: Record<
          string,
          Record<string, { value: number; min: number; max: number }>
        > = {};
        for (const d of parsed.data) {
          const day = format(parseISO(d.attributes.timestamp), "yyyy-MM-dd");
          const hour = format(parseISO(d.attributes.timestamp), "HH");
          (grouped[day] ??= {})[hour] = {
            value: d.attributes.value,
            min: d.attributes.min,
            max: d.attributes.max,
          };
        }

        const sortedDays = Object.keys(grouped).sort().slice(1, 29);
        setDays(sortedDays);

        // Hours starting from 8 AM
        const hours = Array.from({ length: 24 }, (_, i) => {
          const hour = (i + 8) % 24;
          return String(hour).padStart(2, "0");
        });

        const rows = hours.map((hh) => {
          const row: Record<string, number | string> = { hour: hh };
          for (const day of sortedDays) {
            const dataPoint = grouped[day]?.[hh];
            if (dataPoint) {
              row[day] = dataPoint.value;
              row[`${day}_min`] = dataPoint.min;
              row[`${day}_max`] = dataPoint.max;
            }
          }
          return row;
        });

        setChartData(rows);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setError("Failed to load player count data");
      })
      .finally(() => setLoading(false));
  }, []);

  return { chartData, days, loading, error };
}
