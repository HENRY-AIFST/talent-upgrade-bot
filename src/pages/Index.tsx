import { useState } from "react";
import SkillInputForm from "@/components/SkillInputForm";
import AnalysisResults from "@/components/AnalysisResults";
import { AnalysisResult } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Compass } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (data: { skills: string[]; targetRole: string; resumeText: string }) => {
    setIsLoading(true);
    try {
      const { data: analysisData, error } = await supabase.functions.invoke("analyze-skills", {
        body: data,
      });

      if (error) throw error;
      if (analysisData?.error) throw new Error(analysisData.error);

      setResult(analysisData as AnalysisResult);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">SkillBridge</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Career Gap Analyzer</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-4xl mx-auto px-4 py-10">
        {!result ? (
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

            {/* Form Card */}
            <div className="gradient-card rounded-2xl p-6 md:p-8 border border-border shadow-card">
              <SkillInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <AnalysisResults result={result} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  );
};

export default Index;
