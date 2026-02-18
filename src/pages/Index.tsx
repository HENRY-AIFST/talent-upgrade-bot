import { useState, useCallback } from "react";
import SkillInputForm from "@/components/SkillInputForm";
import AnalysisResults from "@/components/AnalysisResults";
import AnalysisHistory from "@/components/AnalysisHistory";
import RoleComparison from "@/components/RoleComparison";
import ProgressTracker from "@/components/ProgressTracker";
import PlacementPlanner from "@/components/PlacementPlanner";
import SkillRecommendations from "@/components/SkillRecommendations";
import { AnalysisResult } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Compass, LogOut, User, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

type View = "input" | "results" | "compare" | "progress" | "placement";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [view, setView] = useState<View>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formRole, setFormRole] = useState("");
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [historyKey, setHistoryKey] = useState(0);

  const handleAnalyze = async (data: { skills: string[]; targetRole: string; resumeText: string }) => {
    setIsLoading(true);
    try {
      const { data: analysisData, error } = await supabase.functions.invoke("analyze-skills", {
        body: data,
      });

      if (error) throw error;
      if (analysisData?.error) throw new Error(analysisData.error);

      const analysisResult = analysisData as AnalysisResult;
      setResult(analysisResult);
      setView("results");

      // Save to DB if logged in
      if (user) {
        const { error: saveError } = await supabase.from("saved_analyses").insert({
          user_id: user.id,
          target_role: data.targetRole,
          input_skills: data.skills,
          resume_text: data.resumeText || null,
          readiness_score: analysisResult.readinessScore,
          result: analysisResult as any,
        });
        if (saveError) console.error("Failed to save:", saveError);
        else setHistoryKey((k) => k + 1);
      }
    } catch (e: any) {
      console.error("Analysis failed:", e);
      toast({
        title: "Analysis Failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalysis = useCallback((r: AnalysisResult) => {
    setResult(r);
    setView("results");
  }, []);

  const handleCompare = useCallback((analyses: any[]) => {
    setCompareData(analyses);
    setView("compare");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView("input"); setResult(null); }}>
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">SkillBridge</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Career Gap Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("placement")}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  Placement
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("progress")}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Progress
                </Button>
              </>
            )}
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="text-foreground border-border">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {view === "placement" ? (
          <PlacementPlanner onBack={() => setView("input")} />
        ) : view === "progress" ? (
          <ProgressTracker onBack={() => setView("input")} />
        ) : view === "compare" ? (
          <RoleComparison analyses={compareData} onBack={() => setView("input")} />
        ) : view === "results" && result ? (
          <AnalysisResults result={result} onReset={() => { setView("input"); setResult(null); }} />
        ) : (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-3">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Bridge Your <span className="text-gradient">Skill Gap</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Enter your skills or paste your resume, choose your dream role, and get an AI-powered roadmap to get there.
              </p>
            </div>

            {/* History (logged in users) */}
            {user && (
              <AnalysisHistory key={historyKey} onViewAnalysis={handleViewAnalysis} onCompare={handleCompare} />
            )}

            {/* Form Card */}
            <div className="gradient-card rounded-2xl p-6 md:p-8 border border-border shadow-card">
              <SkillInputForm onAnalyze={handleAnalyze} isLoading={isLoading} onFormChange={(skills, role) => { setFormSkills(skills); setFormRole(role); }} />
            </div>

            {/* Skill Recommendations */}
            <SkillRecommendations targetRole={formRole} currentSkills={formSkills} />

            {!user && (
              <p className="text-center text-sm text-muted-foreground">
                <button onClick={() => navigate("/auth")} className="text-primary hover:underline">Sign in</button>
                {" "}to save analyses and track your progress over time.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
