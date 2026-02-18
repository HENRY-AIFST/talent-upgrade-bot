import { RoadmapPhase } from "@/types/analysis";
import { BookOpen, Wrench, Award, Lightbulb, Youtube, ExternalLink } from "lucide-react";

interface LearningRoadmapProps {
  phases: RoadmapPhase[];
}

const resourceIcons: Record<string, typeof BookOpen> = { course: BookOpen, tool: Wrench, certification: Award, youtube: Youtube };

const LearningRoadmap = ({ phases }: LearningRoadmapProps) => {
  return (
    <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-6">Learning Roadmap</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
        <div className="space-y-8">
          {phases.map((phase, i) => (
            <div key={i} className="relative pl-12" style={{ animationDelay: `${i * 150}ms` }}>
              {/* Dot */}
              <div className="absolute left-2.5 top-1 w-4 h-4 rounded-full gradient-primary border-2 border-background shadow-glow" />
              <div>
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{phase.phase}</p>
                <h4 className="font-display font-semibold text-foreground text-lg mb-3">{phase.title}</h4>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {phase.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20">{skill}</span>
                  ))}
                </div>

                {/* Resources */}
                <div className="space-y-2 mb-3">
                  {phase.resources.map((res, j) => {
                    const Icon = resourceIcons[res.type] || BookOpen;
                    return (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Icon className={`h-3.5 w-3.5 ${res.type === "youtube" ? "text-destructive" : "text-muted-foreground"}`} />
                        {res.url ? (
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-secondary-foreground hover:text-primary hover:underline flex items-center gap-1">
                            {res.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-secondary-foreground">{res.name}</span>
                        )}
                        <span className="text-xs text-muted-foreground capitalize">({res.type})</span>
                      </div>
                    );
                  })}
                </div>

                {/* Projects */}
                {phase.projects.length > 0 && (
                  <div className="space-y-1.5">
                    {phase.projects.map((proj, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Lightbulb className="h-3.5 w-3.5 text-accent" />
                        <span className="text-secondary-foreground">{proj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningRoadmap;
