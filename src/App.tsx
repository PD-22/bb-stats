import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { z } from "zod";

const SERVER_ID = "2272069";

const DataPointSchema = z.object({
  type: z.literal("dataPoint"),
  attributes: z.object({
    timestamp: z.string(),
    min: z.number(),
    value: z.number(),
    max: z.number(),
  }),
});

const ResponseSchema = z.object({
  data: z.array(DataPointSchema),
});

const DateStringSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid date string",
});

const DAY_COLORS: Record<string, string> = {
  Mon: "hsl(0, 100%, 50%)",
  Tue: "hsl(51, 100%, 50%)",
  Wed: "hsl(103, 100%, 50%)",
  Thu: "hsl(154, 100%, 50%)",
  Fri: "hsl(206, 100%, 50%)",
  Sat: "hsl(257, 100%, 50%)",
  Sun: "hsl(309, 100%, 50%)",
};

export default function App() {
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

        // Create hours array starting from 8 AM
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

  if (loading || error) return null;

  const weekdayGroups: Record<string, string[]> = {};
  const chartConfig: Record<string, { label: string; color: string }> = {};

  for (const day of days) {
    const weekday = format(parseISO(day), "EEE");
    (weekdayGroups[weekday] ??= []).push(day);

    chartConfig[day] = {
      label: day,
      color: DAY_COLORS[weekday],
    };
  }

  const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {weekdayOrder.map((weekday) => {
        const weekDays = weekdayGroups[weekday] || [];

        return (
          <ChartContainer
            key={weekday}
            config={chartConfig}
            className="size-full aspect-auto"
          >
            <LineChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#666"
                strokeOpacity={0.5}
                strokeWidth={0.5}
                horizontal={false}
              />
              <XAxis dataKey="hour" hide />
              {weekDays.map((day, index) => (
                <>
                  <Line
                    key={`${day}_min`}
                    dataKey={`${day}_min`}
                    name={`${day}_min`}
                    stroke={`var(--color-${day})`}
                    dot={false}
                    strokeWidth={0.5}
                    strokeDasharray="2 2"
                    connectNulls
                    isAnimationActive={false}
                    opacity={0.2 + index * 0.1}
                    legendType="none"
                    tooltipType="none"
                  />
                  <Line
                    key={day}
                    dataKey={day}
                    name={day}
                    stroke={`var(--color-${day})`}
                    dot={false}
                    strokeWidth={1.5}
                    connectNulls
                    isAnimationActive={false}
                    opacity={0.5 + index * 0.15}
                  />
                  <Line
                    key={`${day}_max`}
                    dataKey={`${day}_max`}
                    name={`${day}_max`}
                    stroke={`var(--color-${day})`}
                    dot={false}
                    strokeWidth={0.5}
                    strokeDasharray="2 2"
                    connectNulls
                    isAnimationActive={false}
                    opacity={0.2 + index * 0.1}
                    legendType="none"
                    tooltipType="none"
                  />
                </>
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `${label}:00`}
                    formatter={(value, name, item) => {
                      const nameStr = String(name);
                      const parsed = DateStringSchema.safeParse(nameStr);
                      const min = item.payload[`${nameStr}_min`];
                      const max = item.payload[`${nameStr}_max`];
                      
                      return (
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="text-muted-foreground">
                            {parsed.success ? format(parsed.data, "MMM d") : nameStr}
                          </span>
                          <span className="font-medium tabular-nums">
                            {value}
                            {(min !== undefined && max !== undefined) && (
                              <span className="text-muted-foreground text-xs ml-1">
                                ({min}–{max})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        );
      })}
    </div>
  );
}