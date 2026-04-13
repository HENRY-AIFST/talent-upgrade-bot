import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult } from "@/types/analysis";
import ReadinessScore from "@/components/ReadinessScore";
import SkillBarChart from "@/components/SkillBarChart";
import SkillGapList from "@/components/SkillGapList";
import LearningRoadmap from "@/components/LearningRoadmap";
import TimelineView from "@/components/TimelineView";
import YouTubePlaylistSection from "@/components/YouTubePlaylistSection";
import { Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SharedAnalysis = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShared = async () => {
      if (!shareId) return;
      const { data, error: err } = await supabase
        .rpc("get_shared_analysis", { _share_id: shareId })
        .single();

      if (err || !data) {
        setError("This shared analysis was not found or has been removed.");
      } else {
        setResult(data.result as unknown as AnalysisResult);
        setTargetRole(data.target_role);
      }
      setLoading(false);
    };
    fetchShared();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/")} variant="outline">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">SkillBridge</h1>
              <p className="text-xs text-muted-foreground">Shared Analysis</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>Try It Yourself</Button>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Analysis for <span className="text-gradient">{targetRole}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 gradient-card rounded-xl p-6 border border-border shadow-card">
            <h3 className="font-display font-semibold text-foreground mb-3">Profile Summary</h3>
            <p className="text-secondary-foreground leading-relaxed">{result.profileSummary}</p>
          </div>
          <ReadinessScore score={result.readinessScore} />
        </div>

        <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Skills Comparison</h3>
          <SkillBarChart targetSkills={result.targetSkills} />
        </div>

        <SkillGapList gaps={result.skillGaps} />

        {result.youtubePlaylist && result.youtubePlaylist.length > 0 && (
          <YouTubePlaylistSection playlists={result.youtubePlaylist} />
        )}

        <LearningRoadmap phases={result.learningRoadmap} />
        <TimelineView timeline={result.timeline} certifications={result.certifications} />
      </main>
    </div>
  );
};

export default SharedAnalysis;
