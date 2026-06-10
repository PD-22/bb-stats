import { ChartTooltipContent } from "@/components/ui/chart";
import { DateStringSchema } from "@/lib/const";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ComponentProps } from "react";
import { z } from "zod";

export default function PlayerTooltip({
  className,
  ...props
}: ComponentProps<typeof ChartTooltipContent>) {
  return (
    <ChartTooltipContent
      {...props}
      className={cn("min-w-24", className)}
      labelClassName="text-center"
      labelFormatter={(label) => `${label}:00`}
      formatter={(value, nameRaw, item) => {
        const name = DateStringSchema.parse(String(nameRaw));
        const min = z.number().parse(item.payload[`${name}_min`]);
        const max = z.number().parse(item.payload[`${name}_max`]);

        return (
          <div className="flex w-full items-center justify-between gap-4">
            <span className="text-muted-foreground">{format(name, "M/d")}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{value}</span>
              <span className="text-muted-foreground text-xs">
                ({min}–{max})
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
