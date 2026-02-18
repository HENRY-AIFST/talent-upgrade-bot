import { Certification } from "@/types/analysis";
import { Calendar, Award } from "lucide-react";

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
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Growth Timeline
        </h3>
        <div className="space-y-4">
          {periods.map((p, i) => (
            <div key={i} className="flex gap-4">
              <div className="text-sm font-semibold text-primary whitespace-nowrap w-20">{p.label}</div>
              <div className="flex-1">
                <div className="h-0.5 bg-primary/20 mb-2 mt-2" />
                <p className="text-sm text-secondary-foreground">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" />
          Recommended Certifications
        </h3>
        <div className="space-y-3">
          {certifications.map((cert, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <div className={`w-2 h-2 rounded-full ${cert.relevance === "high" ? "bg-accent" : "bg-primary"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cert.name}</p>
                <p className="text-xs text-muted-foreground">{cert.provider}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cert.relevance === "high" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                {cert.relevance}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
