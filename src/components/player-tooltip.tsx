import { ChartTooltipContent } from "@/components/ui/chart";
import { DateStringSchema } from "@/lib/const";
import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";
import { keys } from "lodash";
import { ComponentProps } from "react";
import { z } from "zod";

const relativeWeek = (name: string) => {
  const d = differenceInDays(new Date(), new Date(name));
  if (d === 0) return "Today";
  if (d === 1) return "Yest.";
  if (d < 7) return `${d}d`;
  if (d < 30) return `${Math.floor(d / 7)}w`;
  return format(new Date(name), "M/d");
};

export default function PlayerTooltip({
  className,
  ...props
}: ComponentProps<typeof ChartTooltipContent>) {
  return (
    <ChartTooltipContent
      {...props}
      hideIndicator
      className={cn("min-w-24", className)}
      labelClassName="text-center"
      labelFormatter={(label, payload) => {
        const dateKey = keys(payload?.[0]?.payload).find(
          (k) => DateStringSchema.safeParse(k).success,
        );
        const weekday = dateKey ? format(new Date(dateKey), "EEE") : "";
        return (
          <span>
            <span className="text-muted-foreground">{weekday}</span> {label}:00
          </span>
        );
      }}
      formatter={(value, nameRaw, item) => {
        const name = DateStringSchema.parse(String(nameRaw));
        const min = z.number().parse(item.payload[`${name}_min`]);
        const max = z.number().parse(item.payload[`${name}_max`]);

        return (
          <div className="grid grid-cols-[3ch_3ch_1fr] gap-x-1 font-mono text-xs">
            <span className="text-muted-foreground">{relativeWeek(name)}</span>
            <span className="tabular-nums text-center">{value}</span>
            <span className="text-muted-foreground tabular-nums text-left">
              ({min}–{max})
            </span>
          </div>
        );
      }}
    />
  );
}
