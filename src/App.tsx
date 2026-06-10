import DayLines from "@/components/day-lines";
import PlayerTooltip from "@/components/player-tooltip";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { getDayColor, parseToWeekday } from "@/lib/const";
import usePlayerData from "@/lib/usePlayerData";
import { map } from "lodash";
import fromPairs from "lodash/fromPairs";
import groupBy from "lodash/groupBy";
import { AlertCircle } from "lucide-react";
import { CartesianGrid, LineChart, XAxis } from "recharts";

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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden items-center justify-center">
      {error ? (
        <AlertCircle className="size-8 text-destructive" />
      ) : loading ? (
        <Spinner className="size-8 text-muted-foreground" />
      ) : (
        map(groupBy(days, parseToWeekday), (weekDays, weekday) => (
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
              {map(weekDays, (day, index) => (
                <DayLines key={day} day={day} index={index} />
              ))}
              <ChartTooltip
                content={<PlayerTooltip />}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        ))
      )}
    </div>
  );
}
