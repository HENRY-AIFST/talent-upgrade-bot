import { Certification } from "@/types/analysis";
import { Calendar, Award } from "lucide-react";
import { motion } from "motion/react";

interface TimelineViewProps {
  timeline: { threeMonths: string; sixMonths: string; oneYear: string };
  certifications: Certification[];
}

const TimelineView = ({ timeline, certifications }: TimelineViewProps) => {
  const periods = [
    { label: "3 Months", text: timeline.threeMonths },
    { label: "6 Months", text: timeline.sixMonths },
    { label: "1 Year", text: timeline.oneYear },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timeline */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Growth Timeline
        </h3>
        <div className="space-y-4">
          {periods.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex gap-4"
            >
              <div className="text-sm font-extrabold text-primary whitespace-nowrap w-20">{p.label}</div>
              <div className="flex-1">
                <div className="h-0.5 bg-primary/20 mb-2 mt-2" />
                <p className="text-sm text-muted-foreground font-light">{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" />
          Recommended Certifications
        </h3>
        <div className="space-y-3">
          {certifications.map((cert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${cert.relevance === "high" ? "bg-accent glow-emerald" : "bg-primary"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cert.name}</p>
                <p className="text-xs text-muted-foreground font-light">{cert.provider}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  cert.relevance === "high" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                }`}
              >
                {cert.relevance}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
