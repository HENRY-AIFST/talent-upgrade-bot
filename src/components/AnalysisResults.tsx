import { AnalysisResult } from "@/types/analysis";
import ReadinessScore from "./ReadinessScore";
import SkillRadarChart from "./SkillRadarChart";
import SkillGapList from "./SkillGapList";
import LearningRoadmap from "./LearningRoadmap";
import TimelineView from "./TimelineView";
import ExportPDFButton from "./ExportPDFButton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisResults = ({ result, onReset }: AnalysisResultsProps) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <ExportPDFButton result={result} />
      </div>

      {/* Profile Summary & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-card rounded-xl p-6 border border-border shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-3">Profile Summary</h3>
          <p className="text-secondary-foreground leading-relaxed">{result.profileSummary}</p>
        </div>
        <ReadinessScore score={result.readinessScore} />
      </div>

      {/* Skill Radar Chart */}
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Skills Comparison</h3>
        <SkillRadarChart targetSkills={result.targetSkills} />
      </div>

      {/* Skill Gaps */}
      <SkillGapList gaps={result.skillGaps} />

      {/* Learning Roadmap */}
      <LearningRoadmap phases={result.learningRoadmap} />

      {/* Timeline */}
      <TimelineView timeline={result.timeline} certifications={result.certifications} />
    </div>
  );
};

export default AnalysisResults;
