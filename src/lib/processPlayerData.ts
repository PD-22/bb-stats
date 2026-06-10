import { ResponseSchema } from "@/lib/const";
import { format, parseISO } from "date-fns";

type ChartRow = Record<string, number | string>;

export type PlayerData = {
  chartData: ChartRow[];
  days: string[];
};

export function processPlayerData(json: unknown): PlayerData {
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

  const hours = Array.from({ length: 24 }, (_, i) =>
    String((i + 8) % 24).padStart(2, "0"),
  );

  const chartData = hours.map((hh) => {
    const row: ChartRow = { hour: hh };
    for (const day of sortedDays) {
      const dp = grouped[day]?.[hh];
      if (dp) {
        row[day] = dp.value;
        row[`${day}_min`] = dp.min;
        row[`${day}_max`] = dp.max;
      }
    }
    return row;
  });

  return { chartData, days: sortedDays };
}
