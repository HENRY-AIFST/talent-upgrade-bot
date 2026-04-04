import { useState, useCallback, useEffect } from "react";
import SkillInputForm from "@/components/SkillInputForm";
import AnalysisResults from "@/components/AnalysisResults";
import AnalysisHistory from "@/components/AnalysisHistory";
import RoleComparison from "@/components/RoleComparison";
import SkillRecommendations from "@/components/SkillRecommendations";
import { AnalysisResult } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import Particles from "@/components/Particles";
import RotatingText from "@/components/RotatingText";
import AppLayout from "@/components/AppLayout";

type View = "input" | "results" | "compare";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#2dd4bf", "#14b8a6", "#0d9488"]}
          particleCount={80}
          particleSpread={10}
          speed={0.03}
          particleBaseSize={60}
          moveParticlesOnHover
          alphaParticles
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.28)_0%,rgba(99,102,241,0)_70%)] blur-2xl" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(16,244,212,0.2)_0%,rgba(16,244,212,0)_72%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2)_0%,rgba(139,92,246,0)_70%)] blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40 [background-image:radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
      <AppLayout
        initialLoadAnimation={true}
        rightActions={
          <>
            {user && <NotificationBell />}
            {user && (
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </>
        }
      />

      {/* Main */}
      <main className="container max-w-7xl mx-auto px-4 pt-10 pb-12 relative z-10">
        {view === "compare" ? (
          <RoleComparison analyses={compareData} onBack={() => setView("input")} />
        ) : view === "results" && result ? (
          <AnalysisResults result={result} onReset={() => { setView("input"); setResult(null); }} />
        ) : (
          <div className="space-y-10">
            {/* Hero */}
            <div className="text-center space-y-4 pt-2">
              <h2 className="font-display text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[0.95]">
                SkillBridge
                <span className="block mt-1 bg-gradient-to-r from-primary via-[#60a5fa] to-[#8b5cf6] bg-clip-text text-transparent">
                  Your Career
                </span>
              </h2>
              <div className="flex items-center justify-center gap-2 text-primary/90">
                <Sparkles className="h-4 w-4" />
                <RotatingText
                  texts={['AI Career Roadmaps', 'Smart Skill Gap Insights', 'Faster Job Readiness', 'Personalized Growth Paths']}
                  mainClassName="px-3 bg-primary/12 border border-primary/25 text-primary overflow-hidden py-1 rounded-lg text-sm"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
                Enter your skills or paste your resume, choose your dream role, and get an AI-powered roadmap to get there.
              </p>
            </div>

            {/* History (logged in users) */}
            {user && (
              <AnalysisHistory key={historyKey} onViewAnalysis={handleViewAnalysis} onCompare={handleCompare} />
            )}

            {/* Form Card */}
            <div className="relative overflow-hidden rounded-[2rem] p-5 md:p-8 border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,42,0.82)_0%,rgba(8,14,30,0.86)_100%)] backdrop-blur-xl shadow-[0_30px_80px_-28px_rgba(0,0,0,0.75)]">
              <div className="pointer-events-none absolute -left-24 top-10 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-[#8b5cf6]/15 blur-3xl" />
              <div className="relative">
                <SkillInputForm onAnalyze={handleAnalyze} isLoading={isLoading} onFormChange={(skills, role) => { setFormSkills(skills); setFormRole(role); }} />
              </div>
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
