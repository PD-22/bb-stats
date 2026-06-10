import DayLines from "@/components/day-lines";
import PlayerTooltip from "@/components/player-tooltip";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { getDayColor, parseToWeekday } from "@/lib/const";
import usePlayerData from "@/lib/usePlayerData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { map } from "lodash";
import fromPairs from "lodash/fromPairs";
import groupBy from "lodash/groupBy";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CartesianGrid, LineChart, ReferenceLine, XAxis } from "recharts";

export default function App() {
  const { chartData, days, loading, error } = usePlayerData();

  const chartConfig = fromPairs(
    days.map((day) => [
      day,
      {
        label: day,
        color: getDayColor(parseToWeekday(day)),
      },
    ]),
  );

  const todayWeekday = parseToWeekday(format(new Date(), "yyyy-MM-dd"));

  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const id = setInterval(
      () => setCurrentHour(new Date().getHours()),
      1000 * 60 * 60,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden items-center justify-center">
      {error ? (
        <AlertCircle className="size-8 text-destructive" />
      ) : loading ? (
        <Spinner className="size-8 text-muted-foreground" />
      ) : (
        map(groupBy(days, parseToWeekday), (weekDays, weekday) => {
          const isToday = weekday === todayWeekday;
          return (
            <ChartContainer
              key={weekday}
              config={chartConfig}
              className={cn("size-full aspect-auto", isToday && "bg-muted/30")}
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
                {map(weekDays, (day, index) => (
                  <DayLines key={day} day={day} index={index} />
                ))}
                <ReferenceLine
                  x={String(currentHour).padStart(2, "0")}
                  stroke="white"
                  strokeWidth={1}
                />
                <ChartTooltip
                  content={<PlayerTooltip />}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          );
        })
      )}
    </div>
  );
}
