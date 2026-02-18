interface ReadinessScoreProps {
  score: number;
}

const ReadinessScore = ({ score }: ReadinessScoreProps) => {
  const circumference = 2 * Math.PI * 58;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "text-primary" : score >= 40 ? "text-accent" : "text-destructive";
  const strokeColor = score >= 70 ? "hsl(174, 72%, 50%)" : score >= 40 ? "hsl(36, 95%, 60%)" : "hsl(0, 72%, 55%)";

  return (
    <div className="gradient-card rounded-xl p-6 border border-border shadow-card flex flex-col items-center justify-center">
      <p className="text-sm text-muted-foreground mb-3 font-medium">Career Readiness</p>
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="58" stroke="hsl(220, 14%, 18%)" strokeWidth="8" fill="none" />
          <circle
            cx="64" cy="64" r="58"
            stroke={strokeColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-display font-bold ${color}`}>{score}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {score >= 70 ? "Strong match" : score >= 40 ? "Getting there" : "Needs development"}
      </p>
    </div>
  );
};

export default ReadinessScore;
