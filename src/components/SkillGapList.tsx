import { SkillGap } from "@/types/analysis";
import { Rocket, AlertCircle, Info } from "lucide-react";
import { motion } from "motion/react";

interface SkillGapListProps {
  gaps: SkillGap[];
}

const importanceConfig = {
  critical: {
    icon: Rocket,
    gradient: "from-primary to-primary/60",
    bg: "bg-primary/5",
    border: "border-primary/20",
    label: "High-ROI",
    labelBg: "bg-primary/15 text-primary",
  },
  high: {
    icon: AlertCircle,
    gradient: "from-accent to-accent/60",
    bg: "bg-accent/5",
    border: "border-accent/20",
    label: "Growth Area",
    labelBg: "bg-accent/15 text-accent",
  },
  medium: {
    icon: Info,
    gradient: "gradient-violet",
    bg: "bg-secondary/40",
    border: "border-border/50",
    label: "Nice-to-Have",
    labelBg: "bg-secondary text-muted-foreground",
  },
};

const SkillGapList = ({ gaps }: SkillGapListProps) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Rocket className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">High-ROI Growth Areas</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5 font-light">
        These aren't weaknesses — they're your fastest path to leveling up.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {gaps.map((gap, i) => {
          const config = importanceConfig[gap.importance];
          const Icon = config.icon;
          const progress = Math.round((gap.currentLevel / gap.requiredLevel) * 100);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`p-4 rounded-xl border ${config.border} ${config.bg} glass-card hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{gap.skill}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${config.labelBg}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 font-light line-clamp-2">{gap.reason}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      {gap.currentLevel}/{gap.requiredLevel}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillGapList;
