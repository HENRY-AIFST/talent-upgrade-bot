import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { TargetSkill } from "@/types/analysis";

interface SkillBarChartProps {
  targetSkills: TargetSkill[];
}

const SkillBarChart = ({ targetSkills }: SkillBarChartProps) => {
  const data = targetSkills.slice(0, 10).map((s) => ({
    skill: s.name.length > 15 ? s.name.slice(0, 15) + "…" : s.name,
    current: s.currentLevel,
    required: s.level,
    gap: Math.max(0, s.level - s.currentLevel),
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="skill"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="current" name="Your Level" fill="hsl(174, 72%, 50%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="required" name="Required Level" fill="hsl(36, 95%, 60%)" radius={[4, 4, 0, 0]} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillBarChart;
