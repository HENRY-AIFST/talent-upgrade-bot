import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Clock, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ATSRecord {
  id: string;
  target_role: string | null;
  file_name: string | null;
  ats_score: number;
  keyword_match: number;
  format_score: number;
  experience_relevance: number;
  summary: string | null;
  created_at: string;
}

const ATSHistory = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ATSRecord[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("ats_scores")
        .select("id, target_role, file_name, ats_score, keyword_match, format_score, experience_relevance, summary, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setRecords(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from("ats_scores").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  if (!user || loading || records.length === 0) return null;

  const getTrend = (i: number) => {
    if (i >= records.length - 1) return null;
    const diff = records[i].ats_score - records[i + 1].ats_score;
    if (diff > 0) return { icon: TrendingUp, color: "text-primary", label: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: "text-destructive", label: `${diff}` };
    return { icon: Minus, color: "text-muted-foreground", label: "0" };
  };

  const scoreColor = (s: number) => s >= 80 ? "text-primary" : s >= 60 ? "text-accent" : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 space-y-3"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">ATS Score History</span>
          <span className="text-xs text-muted-foreground">({records.length})</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            {records.map((r, i) => {
              const trend = getTrend(i);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 group"
                >
                  <span className={`text-lg font-extrabold ${scoreColor(r.ats_score)} min-w-[3ch] text-right`}>
                    {r.ats_score}
                  </span>
                  {trend && (
                    <span className={`flex items-center gap-0.5 text-[11px] font-medium ${trend.color}`}>
                      <trend.icon className="h-3 w-3" /> {trend.label}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {r.target_role || "General"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.file_name || "Pasted text"} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-3 text-[10px] text-muted-foreground">
                    <span>KW: {r.keyword_match}%</span>
                    <span>Fmt: {r.format_score}%</span>
                    <span>Rel: {r.experience_relevance}%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ATSHistory;
