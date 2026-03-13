import { motion } from "framer-motion";
import { Target } from "lucide-react";

interface Phase {
  name: string;
  days: string;
  focus: string;
}

interface PhaseCardsProps {
  phases: Phase[];
}

const PhaseCards = ({ phases }: PhaseCardsProps) => {
  if (!phases?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {phases.map((phase, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className="gradient-card rounded-xl p-4 border border-border shadow-card hover:border-primary/20 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs text-primary font-semibold">{phase.days}</p>
          </div>
          <p className="font-display font-bold text-foreground text-sm">{phase.name}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{phase.focus}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default PhaseCards;
