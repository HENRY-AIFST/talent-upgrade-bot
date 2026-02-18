import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2, DollarSign, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SkillRecommendation {
  skill: string;
  demand: "very high" | "high" | "growing";
  salaryImpact: string;
  reason: string;
}

interface SkillRecommendationsProps {
  targetRole: string;
  currentSkills: string[];
  onAddSkill?: (skill: string) => void;
}

const SkillRecommendations = ({ targetRole, currentSkills, onAddSkill }: SkillRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    if (!targetRole) {
      toast({ title: "Select a role first", description: "Enter a target role to get skill recommendations.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-skills", {
        body: { targetRole, currentSkills },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      toast({ title: "Failed to get recommendations", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const demandColor = (demand: string) => {
    if (demand === "very high") return "text-red-500";
    if (demand === "high") return "text-orange-500";
    return "text-yellow-500";
  };

  if (recommendations.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={fetchRecommendations}
        disabled={isLoading || !targetRole}
        className="border-border text-foreground"
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-1.5" />}
        {isLoading ? "Loading..." : "Get Trending Skills"}
      </Button>
    );
  }

  return (
    <div className="gradient-card rounded-xl p-6 border border-border shadow-card space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Skills for {targetRole}
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchRecommendations} disabled={isLoading} className="text-xs text-muted-foreground">
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec) => (
          <div
            key={rec.skill}
            className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors cursor-pointer group"
            onClick={() => onAddSkill?.(rec.skill)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground text-sm">{rec.skill}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium flex items-center gap-1 ${demandColor(rec.demand)}`}>
                  <Flame className="h-3 w-3" />
                  {rec.demand}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary mb-1">
              <DollarSign className="h-3 w-3" />
              {rec.salaryImpact}
            </div>
            <p className="text-xs text-muted-foreground">{rec.reason}</p>
            <p className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">Click to add this skill</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillRecommendations;
