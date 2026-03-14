import { RoadmapPhase } from "@/types/analysis";
import { BookOpen, Wrench, Award, Lightbulb, Youtube, ExternalLink, Rocket } from "lucide-react";
import { motion } from "motion/react";

interface LearningRoadmapProps {
  phases: RoadmapPhase[];
}

const resourceIcons: Record<string, typeof BookOpen> = {
  course: BookOpen,
  tool: Wrench,
  certification: Award,
  youtube: Youtube,
};

const LearningRoadmap = ({ phases }: LearningRoadmapProps) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Rocket className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Growth Trajectory</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-6 font-light">
        Your personalised roadmap — each step gets you closer to your dream role.
      </p>

      {/* Horizontal scrollable pill steps */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {phases.map((phase, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="shrink-0 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
          >
            Step {i + 1}: {phase.title}
          </motion.div>
        ))}
      </div>

      {/* Detailed phases */}
      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border/50" />
        <div className="space-y-8">
          {phases.map((phase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
              className="relative pl-12"
            >
              <div className="absolute left-2.5 top-1 w-4 h-4 rounded-full bg-primary border-2 border-background glow-emerald" />
              <div>
                <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-1">
                  {phase.phase}
                </p>
                <h4 className="font-display font-semibold text-foreground text-lg mb-3">{phase.title}</h4>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {phase.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-[11px] bg-primary/10 text-primary rounded-full border border-primary/20 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 mb-3">
                  {phase.resources.map((res, j) => {
                    const Icon = resourceIcons[res.type] || BookOpen;
                    return (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            res.type === "youtube" ? "text-destructive" : "text-muted-foreground"
                          }`}
                        />
                        {res.url ? (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                          >
                            {res.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{res.name}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground capitalize">({res.type})</span>
                      </div>
                    );
                  })}
                </div>

                {phase.projects.length > 0 && (
                  <div className="space-y-1.5">
                    {phase.projects.map((proj, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Lightbulb className="h-3.5 w-3.5 text-accent" />
                        <span className="text-muted-foreground font-light">{proj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningRoadmap;
