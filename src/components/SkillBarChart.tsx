import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from "recharts";
import { TargetSkill } from "@/types/analysis";

interface SkillBarChartProps {
  targetSkills: TargetSkill[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-card">
      <p className="text-sm font-display font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}/10</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-1.5 pt-1.5 border-t border-border text-xs">
          <span className="text-muted-foreground">Gap: </span>
          <span className="font-semibold" style={{ color: "hsl(0, 72%, 55%)" }}>
            {Math.max(0, payload[1].value - payload[0].value)} levels
          </span>
        </div>
      )}
    </div>
  );
};

const SkillBarChart = ({ targetSkills }: SkillBarChartProps) => {
  const data = targetSkills.slice(0, 10).map((s) => ({
    skill: s.name.length > 18 ? s.name.slice(0, 18) + "…" : s.name,
    current: s.currentLevel,
    required: s.level,
    gap: Math.max(0, s.level - s.currentLevel),
  }));

  return (
    <div className="w-full h-[380px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 24, left: 4, bottom: 65 }} barGap={2} barCategoryGap="20%">
          <defs>
            <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(174, 72%, 55%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(174, 72%, 38%)" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="requiredGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(36, 95%, 65%)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(36, 95%, 45%)" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="skill"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
            angle={-40}
            textAnchor="end"
            interval={0}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <ReferenceLine y={5} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" strokeOpacity={0.3} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="current" name="Your Level" fill="url(#currentGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Bar dataKey="required" name="Required Level" fill="url(#requiredGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillBarChart;
