import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AnalysisResult } from "@/types/analysis";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressTrackerProps {
  onBack: () => void;
}

interface AnalysisRecord {
  id: string;
  target_role: string;
  readiness_score: number;
  result: AnalysisResult;
  created_at: string;
}

const ProgressTracker = ({ onBack }: ProgressTrackerProps) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("saved_analyses")
        .select("*")
        .order("created_at", { ascending: true });
      setAnalyses((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roles = [...new Set(analyses.map((a) => a.target_role))];
  const activeRole = selectedRole || roles[0] || "";
  const roleAnalyses = analyses.filter((a) => a.target_role === activeRole);

  // Readiness score over time
  const scoreData = roleAnalyses.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: a.readiness_score,
  }));

  // Skill level comparison: first vs latest
  const first = roleAnalyses[0]?.result;
  const latest = roleAnalyses[roleAnalyses.length - 1]?.result;

  const skillComparison = latest?.targetSkills?.slice(0, 8).map((skill) => {
    const firstSkill = first?.targetSkills?.find((s) => s.name === skill.name);
    return {
      skill: skill.name.length > 12 ? skill.name.slice(0, 12) + "…" : skill.name,
      first: firstSkill?.currentLevel || 0,
      latest: skill.currentLevel,
      required: skill.level,
    };
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Progress Tracker
        </h2>
      </div>

      {analyses.length === 0 ? (
        <div className="gradient-card rounded-xl p-12 border border-border shadow-card text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-2">No analyses yet</h3>
          <p className="text-sm text-muted-foreground">Run multiple analyses for the same role to track your progress over time.</p>
        </div>
      ) : (
        <>
          {/* Role Filter */}
          {roles.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                    activeRole === role
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          {/* Score Over Time */}
          {scoreData.length > 1 ? (
            <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-4">Readiness Score Over Time</h3>
              <div className="h-[280px]">
                <ResponsiveContainer>
                  <LineChart data={scoreData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Readiness %"
                      stroke="hsl(174, 72%, 50%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(174, 72%, 50%)", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="gradient-card rounded-xl p-6 border border-border shadow-card text-center">
              <p className="text-sm text-muted-foreground">
                Run the analysis for <span className="text-primary font-medium">{activeRole}</span> again to see your progress over time.
              </p>
            </div>
          )}

          {/* First vs Latest Skill Comparison */}
          {roleAnalyses.length >= 2 && skillComparison.length > 0 && (
            <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-1">Skill Improvement</h3>
              <p className="text-xs text-muted-foreground mb-4">First analysis vs latest analysis</p>
              <div className="space-y-3">
                {skillComparison.map((s) => (
                  <div key={s.skill} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">{s.skill}</span>
                      <span className="text-muted-foreground">
                        {s.first} → {s.latest} / {s.required}
                      </span>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-muted-foreground/30 rounded-full"
                        style={{ width: `${(s.first / s.required) * 100}%` }}
                      />
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          width: `${(s.latest / s.required) * 100}%`,
                          background: s.latest > s.first ? "hsl(174, 72%, 50%)" : "hsl(36, 95%, 60%)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="gradient-card rounded-xl p-4 border border-border shadow-card text-center">
              <p className="text-2xl font-bold text-primary">{analyses.length}</p>
              <p className="text-xs text-muted-foreground">Total Analyses</p>
            </div>
            <div className="gradient-card rounded-xl p-4 border border-border shadow-card text-center">
              <p className="text-2xl font-bold text-primary">{roles.length}</p>
              <p className="text-xs text-muted-foreground">Roles Explored</p>
            </div>
            <div className="gradient-card rounded-xl p-4 border border-border shadow-card text-center">
              <p className="text-2xl font-bold text-primary">
                {latest?.readinessScore || 0}%
              </p>
              <p className="text-xs text-muted-foreground">Latest Score</p>
            </div>
            <div className="gradient-card rounded-xl p-4 border border-border shadow-card text-center">
              <p className="text-2xl font-bold text-accent">
                {roleAnalyses.length >= 2
                  ? `${(latest?.readinessScore || 0) - (first?.readinessScore || 0) > 0 ? "+" : ""}${(latest?.readinessScore || 0) - (first?.readinessScore || 0)}`
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Score Change</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressTracker;
