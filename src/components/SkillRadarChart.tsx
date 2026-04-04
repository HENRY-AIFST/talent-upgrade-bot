import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { TargetSkill } from "@/types/analysis";

interface SkillRadarChartProps {
  targetSkills: TargetSkill[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-card">
      <p className="text-sm font-display font-semibold text-foreground mb-1">{payload[0]?.payload?.skill}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}/10</span>
        </div>
      ))}
    </div>
  );
};

const SkillRadarChart = ({ targetSkills }: SkillRadarChartProps) => {
  const data = targetSkills.slice(0, 8).map((s) => ({
    skill: s.name.length > 14 ? s.name.slice(0, 14) + "…" : s.name,
    current: s.currentLevel,
    required: s.level,
  }));

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2dd4bf]/35 bg-[#2dd4bf]/10 px-2.5 py-1 text-[#8ff8ea]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2dd4bf]" />
          Your Level
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f4b84a]/35 bg-[#f4b84a]/10 px-2.5 py-1 text-[#ffd48a]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f4b84a]" />
          Required Level
        </span>
      </div>
      <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data} cx="50%" cy="52%" outerRadius="68%">
          <defs>
            <linearGradient id="radarCurrentGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(174, 72%, 55%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(174, 72%, 38%)" stopOpacity={0.15} />
            </linearGradient>
            <linearGradient id="radarRequiredGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(36, 95%, 65%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(36, 95%, 45%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            domain={[0, 10]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
            axisLine={false}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Your Level"
            dataKey="current"
            stroke="hsl(174, 72%, 50%)"
            fill="url(#radarCurrentGrad)"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "hsl(174, 72%, 50%)", strokeWidth: 0 }}
          />
          <Radar
            name="Required Level"
            dataKey="required"
            stroke="hsl(36, 95%, 60%)"
            fill="url(#radarRequiredGrad)"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: "hsl(36, 95%, 60%)", strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillRadarChart;
