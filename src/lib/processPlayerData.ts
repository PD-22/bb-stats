import { ResponseSchema } from "@/lib/const";
import { padHour } from "@/lib/utils";
import { format, parseISO } from "date-fns";

type ChartRow = Record<string, number | string>;

export type PlayerData = {
  chartData: ChartRow[];
  days: string[];
};

export function processPlayerData(json: unknown): PlayerData {
  const parsed = ResponseSchema.parse(json);

  const grouped: Record<string, Record<string, { value: number }>> = {};
  for (const d of parsed.data) {
    const day = format(parseISO(d.attributes.timestamp), "yyyy-MM-dd");
    const hour = format(parseISO(d.attributes.timestamp), "HH");
    (grouped[day] ??= {})[hour] = {
      value: d.attributes.value,
    };
  }

  const sortedDays = Object.keys(grouped).sort().slice(1, 29);

  const hours = Array.from({ length: 24 }, (_, i) => padHour(i));

  const chartData = hours.map((hh) => {
    const row: ChartRow = { hour: hh };
    for (const day of sortedDays) {
      const dp = grouped[day]?.[hh];
      if (dp) row[day] = dp.value;
    }
    return row;
  });

  return { chartData, days: sortedDays };
}