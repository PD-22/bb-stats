import { clamp } from "lodash";
import { Line } from "recharts";

const OPACITIES = [0.25, 0.5, 0.75, 1];

export default function DayLines({
  day,
  index,
}: {
  day: string;
  index: number;
}) {
  const colorVar = `var(--color-${day})`;
  const i = clamp(index, 0, OPACITIES.length - 1);
  const opacity = OPACITIES[i];

  return (
    <Line
      key={day}
      dataKey={day}
      name={day}
      stroke={colorVar}
      strokeOpacity={opacity}
      dot={false}
      strokeWidth={1.5}
      isAnimationActive={false}
      connectNulls
    />
  );
}
