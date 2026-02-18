import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { TargetSkill } from "@/types/analysis";

interface SkillRadarChartProps {
  targetSkills: TargetSkill[];
}

const SkillRadarChart = ({ targetSkills }: SkillRadarChartProps) => {
  const data = targetSkills.slice(0, 8).map((s) => ({
    skill: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
    current: s.currentLevel,
    required: s.level,
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(220, 14%, 18%)" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} />
          <Radar name="Current Level" dataKey="current" stroke="hsl(174, 72%, 50%)" fill="hsl(174, 72%, 50%)" fillOpacity={0.2} strokeWidth={2} />
          <Radar name="Required Level" dataKey="required" stroke="hsl(36, 95%, 60%)" fill="hsl(36, 95%, 60%)" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
          <Legend wrapperStyle={{ color: "hsl(215, 12%, 55%)", fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
