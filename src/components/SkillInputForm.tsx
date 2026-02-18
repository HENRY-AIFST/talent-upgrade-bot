import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, FileText, Target, Sparkles, Loader2, Upload, CheckCircle, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LinkedInImport from "./LinkedInImport";

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
  const [activeTab, setActiveTab] = useState<"skills" | "resume" | "upload" | "linkedin">("skills");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Unsupported file", description: "Please upload a PDF, TXT, DOC, DOCX, or image file.", variant: "destructive" });
      return;
    }

    setIsParsing(true);
    setUploadedFileName(file.name);

    try {
      // For plain text files, read directly
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        toast({ title: "Resume loaded", description: "Text extracted successfully." });
        setIsParsing(false);
        return;
      }

      // For PDF/DOC/images, send to AI for parsing
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: {
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.text) {
        setResumeText(data.text);
        toast({ title: "Resume parsed!", description: `Extracted content from ${file.name}` });
      } else {
        throw new Error("No text extracted from resume");
      }
    } catch (err: any) {
      console.error("Resume parse error:", err);
      toast({
        title: "Parse failed",
        description: err.message || "Could not extract text from the resume. Try pasting the text manually.",
        variant: "destructive",
      });
      setUploadedFileName("");
    } finally {
      setIsParsing(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          onClick={() => setActiveTab("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === "upload"
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload Resume
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
          Paste Text
        </button>
        <button
          onClick={() => setActiveTab("linkedin")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === "linkedin"
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
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

      {/* Upload Resume */}
      {activeTab === "upload" && (
        <div
          className="animate-fade-in-up space-y-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />

          {isParsing ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-secondary/50">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm font-medium text-foreground">Parsing your resume with AI...</p>
              <p className="text-xs text-muted-foreground mt-1">{uploadedFileName}</p>
            </div>
          ) : resumeText && uploadedFileName ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 border border-primary/30 bg-primary/5 rounded-xl">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{uploadedFileName}</p>
                  <p className="text-xs text-muted-foreground">Resume parsed successfully</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setResumeText("");
                    setUploadedFileName("");
                  }}
                  className="text-muted-foreground hover:text-destructive text-xs"
                >
                  Remove
                </Button>
              </div>
              <div className="bg-secondary rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {resumeText.slice(0, 500)}{resumeText.length > 500 ? "..." : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs border-border text-muted-foreground"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Different File
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                isDragging ? "bg-primary/20" : "bg-primary/10 group-hover:bg-primary/20"
              }`}>
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? "Drop your resume here" : "Drag & drop your resume here, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT, or image — max 10MB</p>
            </button>
          )}
        </div>
      )}

      {/* Paste Resume Text */}
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

      {/* LinkedIn Import */}
      {activeTab === "linkedin" && (
        <LinkedInImport
          onSkillsImported={(importedSkills, profileText) => {
            setSkills((prev) => [...new Set([...prev, ...importedSkills])]);
            if (profileText) setResumeText(profileText);
            setActiveTab("skills");
          }}
        />
      )}

      {/* Analyze Button */}
      <Button
        onClick={() => onAnalyze({ skills, targetRole, resumeText })}
        disabled={!canSubmit || isLoading || isParsing}
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
