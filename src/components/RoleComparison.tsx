import { AnalysisResult } from "@/types/analysis";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CompareAnalysis {
  id: string;
  target_role: string;
  readiness_score: number;
  result: AnalysisResult;
}

interface RoleComparisonProps {
  analyses: CompareAnalysis[];
  onBack: () => void;
}

const COLORS = ["hsl(174, 72%, 50%)", "hsl(36, 95%, 60%)", "hsl(262, 60%, 60%)"];

const RoleComparison = ({ analyses, onBack }: RoleComparisonProps) => {
  // Build radar data: union of all skills across analyses
  const allSkills = new Set<string>();
  analyses.forEach((a) => a.result.targetSkills?.forEach((s) => allSkills.add(s.name)));

  const radarData = Array.from(allSkills).slice(0, 10).map((skill) => {
    const entry: any = { skill: skill.length > 12 ? skill.slice(0, 12) + "…" : skill };
    analyses.forEach((a, i) => {
      const found = a.result.targetSkills?.find((s) => s.name === skill);
      entry[`current_${i}`] = found?.currentLevel ?? 0;
      entry[`required_${i}`] = found?.level ?? 0;
    });
    return entry;
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h2 className="font-display text-2xl font-bold text-foreground">Role Comparison</h2>

      {/* Readiness Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analyses.map((a, i) => (
          <div key={a.id} className="gradient-card rounded-xl p-5 border border-border shadow-card text-center" style={{ borderTopColor: COLORS[i], borderTopWidth: 3 }}>
            <p className="text-sm text-muted-foreground mb-1">Readiness</p>
            <p className="text-3xl font-display font-bold" style={{ color: COLORS[i] }}>{a.readiness_score}%</p>
            <p className="text-sm font-medium text-foreground mt-2">{a.target_role}</p>
          </div>
        ))}
      </div>

      {/* Combined Radar */}
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Skills Overlap</h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(220, 14%, 18%)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10 }} />
              {analyses.map((a, i) => (
                <Radar
                  key={a.id}
                  name={`${a.target_role} (current)`}
                  dataKey={`current_${i}`}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ color: "hsl(215, 12%, 55%)", fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Gaps Comparison */}
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Gap Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((a, i) => (
            <div key={a.id} className="space-y-2">
              <h4 className="text-sm font-semibold" style={{ color: COLORS[i] }}>{a.target_role}</h4>
              {a.result.skillGaps?.slice(0, 5).map((gap, j) => (
                <div key={j} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${gap.importance === "critical" ? "bg-destructive" : gap.importance === "high" ? "bg-accent" : "bg-primary"}`} />
                  <span className="text-secondary-foreground">{gap.skill}</span>
                  <span className="text-muted-foreground ml-auto">{gap.currentLevel}/{gap.requiredLevel}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleComparison;
