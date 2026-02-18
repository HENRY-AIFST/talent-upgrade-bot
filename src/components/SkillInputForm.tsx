import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, FileText, Target, Sparkles, Loader2 } from "lucide-react";

const POPULAR_ROLES = [
  "Full Stack Developer",
  "Data Scientist",
  "ML Engineer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Product Manager",
  "UX Designer",
  "Cloud Architect",
  "Mobile Developer",
];

interface SkillInputFormProps {
  onAnalyze: (data: { skills: string[]; targetRole: string; resumeText: string }) => void;
  isLoading: boolean;
}

const SkillInputForm = ({ onAnalyze, isLoading }: SkillInputFormProps) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState<"skills" | "resume">("skills");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const canSubmit = targetRole && (skills.length > 0 || resumeText.trim());

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Target Role */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Target className="h-4 w-4 text-primary" />
          Target Role
        </label>
        <Input
          placeholder="e.g., Senior Data Scientist"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
        />
        <div className="flex flex-wrap gap-2">
          {POPULAR_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setTargetRole(role)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                targetRole === role
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg">
        <button
          onClick={() => setActiveTab("skills")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === "skills"
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Add Skills
        </button>
        <button
          onClick={() => setActiveTab("resume")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === "resume"
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Paste Resume
        </button>
      </div>

      {/* Skills Input */}
      {activeTab === "skills" && (
        <div className="space-y-3 animate-fade-in-up">
          <div className="flex gap-2">
            <Input
              placeholder="Type a skill and press Enter..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button onClick={addSkill} size="icon" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resume Input */}
      {activeTab === "resume" && (
        <div className="animate-fade-in-up">
          <Textarea
            placeholder="Paste your resume text, LinkedIn summary, or describe your experience here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>
      )}

      {/* Analyze Button */}
      <Button
        onClick={() => onAnalyze({ skills, targetRole, resumeText })}
        disabled={!canSubmit || isLoading}
        className="w-full gradient-primary text-primary-foreground font-display font-semibold text-base py-6 hover:opacity-90 transition-opacity disabled:opacity-40 animate-pulse-glow"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Analyzing Your Skills...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Analyze Skill Gap
          </>
        )}
      </Button>
    </div>
  );
};

export default SkillInputForm;
