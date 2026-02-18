import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AnalysisResult } from "@/types/analysis";
import { History, Trash2, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SavedAnalysis {
  id: string;
  target_role: string;
  input_skills: string[];
  readiness_score: number;
  result: AnalysisResult;
  created_at: string;
}

interface AnalysisHistoryProps {
  onViewAnalysis: (result: AnalysisResult) => void;
  onCompare: (analyses: SavedAnalysis[]) => void;
}

const AnalysisHistory = ({ onViewAnalysis, onCompare }: AnalysisHistoryProps) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalyses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("saved_analyses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setAnalyses((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from("saved_analyses").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      selected.delete(id);
      setSelected(new Set(selected));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else if (next.size < 3) next.add(id);
    setSelected(next);
  };

  if (loading) return null;
  if (analyses.length === 0) return null;

  return (
    <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Past Analyses
        </h3>
        {selected.size >= 2 && (
          <Button
            size="sm"
            onClick={() => onCompare(analyses.filter((a) => selected.has(a.id)))}
            className="gradient-primary text-primary-foreground text-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            Compare ({selected.size})
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {analyses.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
              selected.has(a.id)
                ? "border-primary bg-primary/5"
                : "border-border bg-secondary hover:border-primary/30"
            }`}
            onClick={() => toggleSelect(a.id)}
          >
            <input
              type="checkbox"
              checked={selected.has(a.id)}
              onChange={() => toggleSelect(a.id)}
              className="accent-primary"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{a.target_role}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(a.created_at).toLocaleDateString()} · {a.input_skills?.slice(0, 3).join(", ")}
                {(a.input_skills?.length || 0) > 3 && "..."}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary">{a.readiness_score}%</div>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onViewAnalysis(a.result); }}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); deleteAnalysis(a.id); }}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {selected.size < 2 && analyses.length >= 2 && (
        <p className="text-xs text-muted-foreground mt-3">Select 2-3 analyses to compare roles side by side</p>
      )}
    </div>
  );
};

export default AnalysisHistory;
