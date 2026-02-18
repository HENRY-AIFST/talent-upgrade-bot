import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, ChevronDown, ChevronUp, Lightbulb, Code, Users, Layout, Brain } from "lucide-react";

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  skill: string;
  hint: string;
  companySpecific: boolean;
}

interface InterviewPrepProps {
  companyName?: string;
  targetRole: string;
  skillGaps: { skill: string; currentLevel: number; requiredLevel: number }[];
}

const CATEGORY_ICONS: Record<string, any> = {
  technical: Brain,
  behavioral: Users,
  "system-design": Layout,
  coding: Code,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-accent/15 text-accent border-accent/30",
  hard: "bg-destructive/15 text-destructive border-destructive/30",
};

const InterviewPrep = ({ companyName, targetRole, skillGaps }: InterviewPrepProps) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-interview-questions", {
        body: { companyName: companyName || "General", targetRole, skillGaps },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setQuestions(data.questions || []);
    } catch (e: any) {
      toast({ title: "Failed to generate questions", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["all", ...new Set(questions.map((q) => q.category))];
  const filtered = filterCategory === "all" ? questions : questions.filter((q) => q.category === filterCategory);

  if (questions.length === 0) {
    return (
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Interview Preparation</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get {companyName ? `${companyName}-specific` : "role-specific"} interview questions based on your skill gaps.
        </p>
        <Button onClick={handleGenerate} disabled={isLoading} className="gradient-primary text-primary-foreground">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Generate Interview Questions
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-xl p-6 border border-border shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Interview Prep {companyName && `· ${companyName}`}
          </h3>
        </div>
        <Badge variant="outline" className="text-muted-foreground border-border">
          {questions.length} questions
        </Badge>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
              filterCategory === cat
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {filtered.map((q, i) => {
          const Icon = CATEGORY_ICONS[q.category] || Brain;
          const isExpanded = expandedQ === i;
          return (
            <div
              key={i}
              className="border border-border rounded-lg bg-card overflow-hidden transition-colors hover:border-primary/30"
            >
              <button
                onClick={() => setExpandedQ(isExpanded ? null : i)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`text-[10px] ${DIFFICULTY_COLORS[q.difficulty] || ""}`}>
                      {q.difficulty}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground capitalize">{q.category}</span>
                    <span className="text-[10px] text-muted-foreground">· {q.skill}</span>
                    {q.companySpecific && (
                      <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30">
                        Company-specific
                      </Badge>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-primary/5">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Hint</p>
                      <p className="text-xs text-secondary-foreground">{q.hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button variant="outline" onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
        Regenerate Questions
      </Button>
    </div>
  );
};

export default InterviewPrep;
