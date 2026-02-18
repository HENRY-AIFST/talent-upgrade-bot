import { AnalysisResult } from "@/types/analysis";
import ReadinessScore from "./ReadinessScore";
import SkillRadarChart from "./SkillRadarChart";
import SkillBarChart from "./SkillBarChart";
import SkillGapList from "./SkillGapList";
import LearningRoadmap from "./LearningRoadmap";
import TimelineView from "./TimelineView";
import ExportPDFButton from "./ExportPDFButton";
import ShareEmailButton from "./ShareEmailButton";
import ShareLinkButton from "./ShareLinkButton";
import YouTubePlaylistSection from "./YouTubePlaylistSection";
import InterviewPrep from "./InterviewPrep";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisResults = ({ result, onReset }: AnalysisResultsProps) => {
  const [chartType, setChartType] = useState<"radar" | "bar">("bar");

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <div className="flex items-center gap-2">
          <ExportPDFButton result={result} />
          <ShareLinkButton result={result} />
          <ShareEmailButton result={result} />
        </div>
      </div>

      {/* Profile Summary & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-card rounded-xl p-6 border border-border shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-3">Profile Summary</h3>
          <p className="text-secondary-foreground leading-relaxed">{result.profileSummary}</p>
        </div>
        <ReadinessScore score={result.readinessScore} />
      </div>

      {/* Skills Chart with toggle */}
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Skills Comparison</h3>
          <div className="flex gap-1 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                chartType === "bar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType("radar")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                chartType === "radar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
      </div>

      {/* Skill Gaps */}
      <SkillGapList gaps={result.skillGaps} />

      {/* YouTube Playlists */}
      {result.youtubePlaylist && result.youtubePlaylist.length > 0 && (
        <YouTubePlaylistSection playlists={result.youtubePlaylist} />
      )}

      {/* Interview Prep */}
      <InterviewPrep
        targetRole={result.profileSummary.includes("Data Scientist") ? "Data Scientist" : "Software Engineer"}
        skillGaps={result.skillGaps?.map((g) => ({ skill: g.skill, currentLevel: g.currentLevel, requiredLevel: g.requiredLevel })) || []}
      />

      {/* Learning Roadmap */}
      <LearningRoadmap phases={result.learningRoadmap} />

      {/* Timeline */}
      <TimelineView timeline={result.timeline} certifications={result.certifications} />
    </div>
  );
};

export default AnalysisResults;
