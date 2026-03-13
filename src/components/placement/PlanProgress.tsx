import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";

interface PlanProgressProps {
  companyName: string;
  targetRole: string;
  summary: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

const PlanProgress = ({ companyName, targetRole, summary, completedCount, totalCount, progressPercent }: PlanProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-card rounded-2xl p-6 border border-border shadow-card"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-display font-bold text-foreground text-lg">{companyName}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{targetRole}</p>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{summary}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="relative">
            <motion.p
              key={progressPercent}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-display font-bold text-primary"
            >
              {progressPercent}%
            </motion.p>
            {progressPercent === 100 && <Trophy className="h-5 w-5 text-accent absolute -top-2 -right-2" />}
          </div>
          <p className="text-xs text-muted-foreground">{completedCount}/{totalCount} tasks</p>
        </div>
      </div>
      <Progress value={progressPercent} className="h-2.5 rounded-full" />
    </motion.div>
  );
};

export default PlanProgress;
