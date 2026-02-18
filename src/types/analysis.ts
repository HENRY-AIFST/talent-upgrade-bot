export interface SkillItem {
  name: string;
  level: number;
}

export interface TargetSkill {
  name: string;
  level: number;
  currentLevel: number;
}

export interface SkillGap {
  skill: string;
  importance: "critical" | "high" | "medium";
  reason: string;
  currentLevel: number;
  requiredLevel: number;
}

export interface Resource {
  name: string;
  type: "course" | "tool" | "certification" | "youtube";
  url: string;
}

export interface YouTubePlaylist {
  title: string;
  url: string;
  skill: string;
  description: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  skills: string[];
  resources: Resource[];
  projects: string[];
}

export interface Certification {
  name: string;
  provider: string;
  relevance: "high" | "medium";
}

export interface AnalysisResult {
  profileSummary: string;
  readinessScore: number;
  currentSkills: SkillItem[];
  targetSkills: TargetSkill[];
  skillGaps: SkillGap[];
  learningRoadmap: RoadmapPhase[];
  certifications: Certification[];
  youtubePlaylist?: YouTubePlaylist[];
  timeline: {
    threeMonths: string;
    sixMonths: string;
    oneYear: string;
  };
}
