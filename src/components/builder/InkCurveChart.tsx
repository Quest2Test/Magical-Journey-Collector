import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as ChartTooltip } from "recharts";
import { inkHexColors } from "@/components/ui/card-display";

interface Props {
  costCurve: any[];
  activeInks: string[];
}

export default function InkCurveChart({ costCurve, activeInks }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={costCurve} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="cost" tick={{ fontSize: 11 }} />
        <ChartTooltip formatter={(val: number, name: string) => [`${val} cards`, name]} contentStyle={{ fontSize: 12 }} />
        {activeInks.map(ink => (
          <Bar
            key={ink}
            dataKey={ink}
            stackId="curve"
            fill={inkHexColors[ink as keyof typeof inkHexColors] ?? "#888"}
            radius={activeInks.indexOf(ink) === activeInks.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
