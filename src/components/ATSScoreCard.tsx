import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Target, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionAnalysis {
  score: number;
  feedback: string;
}

interface ATSResult {
  atsScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordMatch: number;
  formatScore: number;
  experienceRelevance: number;
  missingKeywords: string[];
  sectionAnalysis: {
    contact: SectionAnalysis;
    experience: SectionAnalysis;
    skills: SectionAnalysis;
    education: SectionAnalysis;
  };
}

interface ATSScoreCardProps {
  result: ATSResult;
  onClose: () => void;
}

const ScoreRing = ({ score, size = 120, strokeWidth = 8, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "hsl(var(--primary))" : score >= 60 ? "hsl(var(--accent))" : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="glow-emerald">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-display font-extrabold" fontSize={size * 0.28}>
          {score}
        </text>
      </svg>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
    </div>
  );
};

const MiniBar = ({ score, label, icon: Icon }: { score: number; label: string; icon: any }) => {
  const color = score >= 80 ? "bg-primary" : score >= 60 ? "bg-accent" : "bg-destructive";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="text-xs font-bold text-foreground">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
};

const ATSScoreCard = ({ result, onClose }: ATSScoreCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-6 space-y-5 border border-border/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <FileCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <h3 className="font-display font-bold text-foreground">ATS Compatibility Score</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-muted-foreground">
          Dismiss
        </Button>
      </div>

      {/* Score + Summary */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ScoreRing score={result.atsScore} />
        <div className="flex-1 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MiniBar score={result.keywordMatch} label="Keywords" icon={Target} />
            <MiniBar score={result.formatScore} label="Format" icon={BookOpen} />
            <MiniBar score={result.experienceRelevance} label="Relevance" icon={TrendingUp} />
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
          </h4>
          {result.strengths.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="text-xs text-foreground/80 pl-5 relative before:content-['✓'] before:absolute before:left-0 before:text-primary">
              {s}
            </motion.div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-accent flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Improvements
          </h4>
          {result.improvements.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }}
              className="text-xs text-foreground/80 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-accent">
              {s}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Missing Keywords */}
      {result.missingKeywords?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Missing Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords.map((kw, i) => (
              <span key={i} className="px-2.5 py-1 text-[11px] rounded-full border border-destructive/30 text-destructive bg-destructive/5">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Section Analysis */}
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "Hide" : "Show"} Section-by-Section Analysis
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }} className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {Object.entries(result.sectionAnalysis || {}).map(([key, val]) => (
                <div key={key} className="glass-card rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground capitalize">{key}</span>
                    <span className={`text-xs font-bold ${val.score >= 80 ? "text-primary" : val.score >= 60 ? "text-accent" : "text-destructive"}`}>
                      {val.score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{val.feedback}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ATSScoreCard;
