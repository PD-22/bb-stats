import { Line } from "recharts";

export default function DayLines({
  day,
  index,
}: {
  day: string;
  index: number;
}) {
  const colorVar = `var(--color-${day})`;
  const minMaxOpacity = 0.2 + index * 0.1;
  const valueOpacity = 0.5 + index * 0.15;

  return (
    <>
      <Line
        key={`${day}_min`}
        dataKey={`${day}_min`}
        name={`${day}_min`}
        stroke={colorVar}
        dot={false}
        strokeWidth={0.5}
        strokeDasharray="2 2"
        connectNulls
        isAnimationActive={false}
        opacity={minMaxOpacity}
        legendType="none"
        tooltipType="none"
      />
      <Line
        key={day}
        dataKey={day}
        name={day}
        stroke={colorVar}
        dot={false}
        strokeWidth={1.5}
        connectNulls
        isAnimationActive={false}
        opacity={valueOpacity}
      />
      <Line
        key={`${day}_max`}
        dataKey={`${day}_max`}
        name={`${day}_max`}
        stroke={colorVar}
        dot={false}
        strokeWidth={0.5}
        strokeDasharray="2 2"
        connectNulls
        isAnimationActive={false}
        opacity={minMaxOpacity}
        legendType="none"
        tooltipType="none"
      />
    </>
  );
}
