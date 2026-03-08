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
import { LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import Particles from "@/components/Particles";
import RotatingText from "@/components/RotatingText";
import PillNav from "@/components/PillNav";
import logoImg from "@/assets/logo.png";

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
      {/* PillNav Header */}
      <div className="relative z-10">
        <PillNav
          logo={logoImg}
          logoAlt="SkillBridge"
          items={[
            { label: 'Home', href: '/' },
            ...(user ? [
              { label: 'My Hub', href: '/client' },
              { label: 'Mentor', href: '/mentor' },
              { label: 'Placement', href: '/placement' },
              { label: 'Progress', href: '/progress' },
            ] : []),
            ...(!user ? [{ label: 'Sign In', href: '/auth' }] : []),
          ]}
          activeHref={undefined}
          ease="power2.easeOut"
          baseColor="hsl(var(--card))"
          pillColor="hsl(var(--primary))"
          hoveredPillTextColor="hsl(var(--foreground))"
          pillTextColor="hsl(var(--primary-foreground))"
          initialLoadAnimation={true}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user && (
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-4 pt-12 pb-8 relative z-10">
        {view === "compare" ? (
          <RoleComparison analyses={compareData} onBack={() => setView("input")} />
        ) : view === "results" && result ? (
          <AnalysisResults result={result} onReset={() => { setView("input"); setResult(null); }} />
        ) : (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-3">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground flex flex-wrap items-center justify-center gap-x-3">
                Bridge Your
                <RotatingText
                  texts={['Skill Gap', 'Career Path', 'Future Role', 'Dream Job']}
                  mainClassName="px-3 bg-primary text-primary-foreground overflow-hidden py-1 rounded-lg"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
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
