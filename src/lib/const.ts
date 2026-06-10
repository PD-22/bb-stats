import { format, parseISO } from "date-fns";
import { z } from "zod";

export const SERVER_ID = "2272069";

export const DataPointSchema = z.object({
  type: z.literal("dataPoint"),
  attributes: z.object({
    timestamp: z.string(),
    min: z.number(),
    value: z.number(),
    max: z.number(),
  }),
});

export const ResponseSchema = z.object({
  data: z.array(DataPointSchema),
});

export const DateStringSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)));

export const WEEKDAY_ORDER = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
export type Weekday = (typeof WEEKDAY_ORDER)[number];

const WEEKDAY_INDICES: Record<Weekday, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function getDayColor(weekday: Weekday): string {
  const hue = Math.round((WEEKDAY_INDICES[weekday] * 360) / 7);
  return `hsl(${hue}, 100%, 50%)`;
}

export const weekdaySchema = z.enum([
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
]);

export const parseToWeekday = (dateString: string) =>
  weekdaySchema.parse(format(parseISO(dateString), "EEE"));
