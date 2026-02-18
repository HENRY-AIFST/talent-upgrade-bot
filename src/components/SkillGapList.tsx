import { SkillGap } from "@/types/analysis";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface SkillGapListProps {
  gaps: SkillGap[];
}

const importanceConfig = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", label: "Critical" },
  high: { icon: AlertCircle, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", label: "High" },
  medium: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Medium" },
};

const SkillGapList = ({ gaps }: SkillGapListProps) => {
  return (
    <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4">Skill Gap Analysis</h3>
      <div className="space-y-3">
        {gaps.map((gap, i) => {
          const config = importanceConfig[gap.importance];
          const Icon = config.icon;
          const progress = Math.round((gap.currentLevel / gap.requiredLevel) * 100);
          return (
            <div key={i} className={`p-4 rounded-lg border ${config.border} ${config.bg} transition-all hover:scale-[1.01]`} style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${config.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{gap.skill}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>{config.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{gap.reason}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{gap.currentLevel}/{gap.requiredLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillGapList;
