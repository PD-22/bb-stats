import React, { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
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

function fmtDay(ts: string) {
  return new Date(ts).toISOString().slice(0, 10);
}

function fmtHour(ts: string) {
  return new Date(ts).toISOString().slice(11, 13);
}

const DAY_COLORS = Array.from({ length: 7 }, (_, i) => {
  const hue = (i * 360) / 7;
  const rgb = hslToRgb(hue, 100, 50);
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
});

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
}

export default function App() {
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);
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

        const grouped: Record<string, Record<string, number>> = {};
        for (const d of parsed.data) {
          const day = fmtDay(d.attributes.timestamp);
          const hour = fmtHour(d.attributes.timestamp);
          (grouped[day] ??= {})[hour] = d.attributes.value;
        }

        const sortedDays = Object.keys(grouped).sort().slice(1, 29);
        setDays(sortedDays);

        const rows = Array.from({ length: 24 }, (_, hour) => {
          const hh = String(hour).padStart(2, "0");
          const row: Record<string, unknown> = { hour: hh };
          for (const day of sortedDays) {
            row[day] = grouped[day]?.[hh] ?? null;
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

  // Warning: The width(-1) and height(-1) of chart should be greater than 0
  // Note: "overflow-hidden" used to avoid HTML element overflow bug
  return (
    <div
      className="bg-background grid h-screen w-screen scheme-dark overflow-hidden"
      style={{
        gridTemplateColumns: "auto repeat(7, 1fr)",
        gridTemplateRows: "auto repeat(4, 1fr)",
      }}
    >
      <div />
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div
          key={d}
          className="flex items-end justify-center text-xs text-muted-foreground"
        >
          {d}
        </div>
      ))}
      {Array.from({ length: 4 }, (_, row) => (
        <React.Fragment key={row}>
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            W{row + 1}
          </div>
          {days.slice(row * 7, row * 7 + 7).map((day) => (
            <ResponsiveContainer className="size-full" key={day}>
              <LineChart
                data={chartData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <Line
                  dataKey={day}
                  stroke={DAY_COLORS[new Date(day).getUTCDay()]}
                  dot={false}
                  strokeWidth={1.5}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
