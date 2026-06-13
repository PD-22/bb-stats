import DayLines from "@/components/day-lines";
import PlayerTooltip from "@/components/player-tooltip";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { getDayColor, parseToWeekday, WEEKDAY_ORDER } from "@/lib/const";
import usePlayerData from "@/lib/usePlayerData";
import { cn, padHour } from "@/lib/utils";
import { format } from "date-fns";
import { fromPairs } from "lodash";
import groupBy from "lodash/groupBy";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, ReferenceLine, XAxis } from "recharts";

const HOURS = Array.from({ length: 24 }, (_, i) => padHour(i));
const getCurrentHour = () => padHour(new Date().getHours());

function msUntilNextHour() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}

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

  const [currentHour, setCurrentHour] = useState(getCurrentHour);

  useEffect(() => {
    const timeout = setTimeout(
      () => setCurrentHour(getCurrentHour()),
      msUntilNextHour(),
    );
    return () => clearTimeout(timeout);
  }, [currentHour]);

  const groupedDays = groupBy(days, parseToWeekday);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden items-center justify-center">
      {error ? (
        <AlertCircle className="size-8 text-destructive" />
      ) : loading ? (
        <Spinner className="size-8 text-muted-foreground" />
      ) : (
        WEEKDAY_ORDER.map((weekday) => {
          const weekDays = groupedDays[weekday];
          if (!weekDays) return null;

          const isToday = weekday === todayWeekday;
          return (
            <ChartContainer
              key={weekday}
              config={chartConfig}
              className={cn(
                "size-full aspect-auto",
                isToday ? "bg-muted/50" : "opacity-80",
              )}
            >
              <LineChart
                data={chartData}
                margin={{ top: 0, right: 32, bottom: 0, left: 32 }}
              >
                <XAxis dataKey="hour" hide />
                {HOURS.map((hour) => (
                  <ReferenceLine
                    key={hour}
                    x={hour}
                    strokeDasharray="3 3"
                    stroke="#666"
                    strokeOpacity={isToday ? 1 : 0.33}
                    strokeWidth={0.5}
                  />
                ))}
                {weekDays.map((day, index) => (
                  <DayLines key={day} day={day} index={index} />
                ))}
                <ReferenceLine
                  x={currentHour}
                  stroke="white"
                  strokeWidth={isToday ? 2 : 1}
                  strokeOpacity={isToday ? 1 : 0.5}
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
