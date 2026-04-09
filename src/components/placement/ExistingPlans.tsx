import { motion } from "framer-motion";
import { Building2, ChevronRight } from "lucide-react";

interface ExistingPlansProps {
  plans: any[];
  onLoadPlan: (plan: any) => void;
}

const formatDuration = (days: number) => {
  if (days === 15 || days === 45) {
    return `${days} days`;
  }
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"}`;
};

const ExistingPlans = ({ plans, onLoadPlan }: ExistingPlansProps) => {
  if (plans.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="gradient-card rounded-2xl p-5 md:p-6 border border-border shadow-card"
    >
      <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        Your Plans
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plans.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onLoadPlan(p)}
            className="group text-left p-4 rounded-xl border border-border hover:border-primary/40 transition-all duration-200 bg-card hover:bg-primary/5 hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{p.company_name}</p>
                  <p className="text-xs text-muted-foreground">{p.target_role} · {formatDuration(p.total_days)}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ExistingPlans;
