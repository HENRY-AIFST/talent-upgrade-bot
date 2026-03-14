import { motion } from "motion/react";

interface ReadinessScoreProps {
  score: number;
}

const ReadinessScore = ({ score }: ReadinessScoreProps) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? "hsl(var(--primary))"
      : score >= 40
      ? "hsl(var(--accent))"
      : "hsl(var(--destructive))";

  const textColor =
    score >= 70 ? "text-primary" : score >= 40 ? "text-accent" : "text-destructive";

  const label =
    score >= 70 ? "Strong match" : score >= 40 ? "Getting there" : "High-ROI growth ahead";

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <div className="relative w-36 h-36 glow-emerald">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth="7"
            fill="none"
            opacity={0.4}
          />
          {/* Animated ring */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-display font-extrabold ${textColor}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 font-medium">{label}</p>
    </div>
  );
};

export default ReadinessScore;
