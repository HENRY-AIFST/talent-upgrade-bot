import { AnalysisResult } from "@/types/analysis";
import ReadinessScore from "./ReadinessScore";
import SkillBarChart from "./SkillBarChart";
import SkillRadarChart from "./SkillRadarChart";
import SkillGapList from "./SkillGapList";
import LearningRoadmap from "./LearningRoadmap";
import TimelineView from "./TimelineView";
import ExportPDFButton from "./ExportPDFButton";
import ShareEmailButton from "./ShareEmailButton";
import ShareLinkButton from "./ShareLinkButton";
import YouTubePlaylistSection from "./YouTubePlaylistSection";
import InterviewPrep from "./InterviewPrep";
import { ArrowLeft, CheckCircle2, Sparkles, TrendingUp, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "motion/react";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
});

const AnalysisResults = ({ result, onReset }: AnalysisResultsProps) => {
  const [chartType, setChartType] = useState<"radar" | "bar">("bar");

  const matchedSkills = result.targetSkills
    .filter((s) => s.currentLevel >= s.level * 0.75)
    .slice(0, 4);

  const gap = 100 - result.readinessScore;
  const roleLabel = result.profileSummary.split(" ").slice(0, 6).join(" ");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <motion.div {...stagger(0)} className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <div className="flex items-center gap-2">
          <ExportPDFButton result={result} />
          <ShareLinkButton result={result} />
          <ShareEmailButton result={result} />
        </div>
      </motion.div>

      {/* ═══ BENTO GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── North Star Card (spans 2) ── */}
        <motion.div {...stagger(1)} className="md:col-span-2 glass-card rounded-2xl p-8 glow-ring">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ReadinessScore score={result.readinessScore} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-widest">Role Match Score</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                You're highly aligned for this role.
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed">
                Your foundational skills are solid. Let's bridge the final{" "}
                <span className="text-primary font-semibold">{gap}%</span> together — these are your
                <span className="text-primary font-semibold"> high-ROI growth areas</span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Immediate Wins Card ── */}
        <motion.div {...stagger(2)} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Your Strengths</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4 font-light">
            Skills you already own that match beautifully.
          </p>
          <div className="space-y-3">
            {matchedSkills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3 group"
              >
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center glow-emerald">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {skill.name}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {skill.currentLevel}/{skill.level}
                </span>
              </motion.div>
            ))}
            {matchedSkills.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Building from a strong base — every expert started here.</p>
            )}
          </div>
        </motion.div>

        {/* ── Profile Summary ── */}
        <motion.div {...stagger(3)} className="md:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Profile Summary
          </h3>
          <p className="text-muted-foreground leading-relaxed font-light">{result.profileSummary}</p>
        </motion.div>

        {/* ── Skills Chart ── */}
        <motion.div {...stagger(3)} className="md:col-span-1 glass-card rounded-2xl p-5 md:p-6 min-h-[470px]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-display font-semibold text-foreground text-sm">Skills Comparison</h3>
            <div className="flex gap-1 p-1 bg-secondary/60 rounded-lg border border-border/60">
              <button
                onClick={() => setChartType("bar")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  chartType === "bar" ? "bg-card text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType("radar")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  chartType === "radar" ? "bg-card text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Radar
              </button>
            </div>
          </div>
          {chartType === "bar" ? (
            <SkillBarChart targetSkills={result.targetSkills} />
          ) : (
            <SkillRadarChart targetSkills={result.targetSkills} />
          )}
        </motion.div>

        {/* ── High-ROI Growth Areas (Skill Gaps) — full width ── */}
        <motion.div {...stagger(4)} className="md:col-span-3">
          <SkillGapList gaps={result.skillGaps} />
        </motion.div>

        {/* ── YouTube Playlists ── */}
        {result.youtubePlaylist && result.youtubePlaylist.length > 0 && (
          <motion.div {...stagger(5)} className="md:col-span-3">
            <YouTubePlaylistSection playlists={result.youtubePlaylist} />
          </motion.div>
        )}

        {/* ── Interview Prep ── */}
        <motion.div {...stagger(5)} className="md:col-span-3">
          <InterviewPrep
            targetRole={result.profileSummary.includes("Data Scientist") ? "Data Scientist" : "Software Engineer"}
            skillGaps={result.skillGaps?.map((g) => ({ skill: g.skill, currentLevel: g.currentLevel, requiredLevel: g.requiredLevel })) || []}
          />
        </motion.div>

        {/* ── Growth Trajectory (Learning Roadmap) — full width ── */}
        <motion.div {...stagger(6)} className="md:col-span-3">
          <LearningRoadmap phases={result.learningRoadmap} />
        </motion.div>

        {/* ── Timeline & Certs ── */}
        <motion.div {...stagger(7)} className="md:col-span-3">
          <TimelineView timeline={result.timeline} certifications={result.certifications} />
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisResults;
