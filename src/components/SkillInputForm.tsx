import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, FileText, Target, Sparkles, Loader2, Upload, CheckCircle, Linkedin, ArrowRight, Shield, BarChart3, Bot, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LinkedInImport from "./LinkedInImport";
import ATSScoreCard from "./ATSScoreCard";
import ATSHistory from "./ATSHistory";
import AutocompleteInput from "./AutocompleteInput";
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_ROLES = [
  "Google Senior Product Manager",
  "Netflix Full Stack Developer",
  "Amazon Data Scientist",
  "Google ML Engineer",
  "Meta Frontend Developer",
  "Microsoft Cloud Architect",
];

const SUGGESTED_SKILLS = [
  { name: "Python", icon: "🐍", category: "Languages" },
  { name: "JavaScript", icon: "⚡", category: "Languages" },
  { name: "TypeScript", icon: "📘", category: "Languages" },
  { name: "Java", icon: "☕", category: "Languages" },
  { name: "React", icon: "⚛️", category: "Frameworks" },
  { name: "Node.js", icon: "🟢", category: "Frameworks" },
  { name: "Next.js", icon: "▲", category: "Frameworks" },
  { name: "Django", icon: "🎸", category: "Frameworks" },
  { name: "SQL", icon: "🗃️", category: "Data" },
  { name: "MongoDB", icon: "🍃", category: "Data" },
  { name: "AWS", icon: "☁️", category: "Cloud" },
  { name: "Docker", icon: "🐳", category: "DevOps" },
  { name: "Git", icon: "📂", category: "Tools" },
  { name: "Figma", icon: "🎨", category: "Design" },
  { name: "Agile", icon: "💬", category: "Methodology" },
  { name: "Machine Learning", icon: "🧠", category: "AI/ML" },
  { name: "TensorFlow", icon: "🔬", category: "AI/ML" },
  { name: "Kubernetes", icon: "⚙️", category: "DevOps" },
  { name: "GraphQL", icon: "◈", category: "API" },
  { name: "Redis", icon: "🔴", category: "Data" },
];

const getEmoji = (skill: string) => {
  const lower = skill.toLowerCase();
  const found = SUGGESTED_SKILLS.find(s => lower.includes(s.name.toLowerCase()));
  if (found) return found.icon;
  return "🔹";
};

interface SkillInputFormProps {
  onAnalyze: (data: { skills: string[]; targetRole: string; resumeText: string }) => void;
  isLoading: boolean;
  onFormChange?: (skills: string[], targetRole: string) => void;
}

const SkillInputForm = ({ onAnalyze, isLoading, onFormChange }: SkillInputFormProps) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState<"skills" | "resume" | "upload" | "linkedin">("skills");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [isAtsLoading, setIsAtsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    onFormChange?.(skills, targetRole);
  }, [skills, targetRole, onFormChange]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const runATSCheck = async (text: string, fileName?: string) => {
    setIsAtsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ats-score", {
        body: { resumeText: text, targetRole: targetRole || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAtsResult(data);

      // Save to DB if logged in
      if (user) {
        await supabase.from("ats_scores").insert({
          user_id: user.id,
          target_role: targetRole || null,
          file_name: fileName || uploadedFileName || null,
          ats_score: data.atsScore,
          keyword_match: data.keywordMatch,
          format_score: data.formatScore,
          experience_relevance: data.experienceRelevance,
          summary: data.summary,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          missing_keywords: data.missingKeywords || [],
          section_analysis: data.sectionAnalysis || {},
        });
      }
    } catch (err: any) {
      console.error("ATS check failed:", err);
      toast({ title: "ATS Check Failed", description: err.message || "Could not analyze resume.", variant: "destructive" });
    } finally {
      setIsAtsLoading(false);
    }
  };

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    const allowedTypes = ["application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Unsupported file", description: "Please upload a PDF, TXT, DOC, DOCX, or image file.", variant: "destructive" });
      return;
    }

    setIsParsing(true);
    setUploadedFileName(file.name);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        toast({ title: "Resume loaded", description: "Text extracted successfully." });
        setIsParsing(false);
        // Auto-run ATS check
        runATSCheck(text);
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));

      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: { fileBase64: base64, fileName: file.name, mimeType: file.type },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.text) {
        setResumeText(data.text);
        toast({ title: "Resume parsed!", description: `Extracted content from ${file.name}` });
        // Auto-run ATS check
        runATSCheck(data.text);
      } else {
        throw new Error("No text extracted from resume");
      }
    } catch (err: any) {
      console.error("Resume parse error:", err);
      toast({ title: "Parse failed", description: err.message || "Could not extract text. Try pasting manually.", variant: "destructive" });
      setUploadedFileName("");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const canSubmit = targetRole && (skills.length > 0 || resumeText.trim());
  const currentStep = !targetRole ? 1 : (skills.length === 0 && !resumeText.trim()) ? 2 : 3;

  const tabs = [
    { key: "skills" as const, label: "Add Skills", icon: Sparkles },
    { key: "upload" as const, label: "Upload Resume", icon: Upload },
    { key: "resume" as const, label: "Paste Text", icon: FileText },
    { key: "linkedin" as const, label: "LinkedIn", icon: Linkedin },
  ];

  return (
    <div className="space-y-6">
      {/* Trust Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl px-4 py-2.5 flex items-center justify-center gap-3 text-xs text-muted-foreground"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Powered by Leading AI & Real-World Career Data</span>
        <span className="text-primary font-bold">G</span>
        <span className="text-destructive font-bold">N</span>
        <span className="text-accent font-bold">A</span>
      </motion.div>

      {/* Main Content: Form + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Form Section */}
        <div className="flex-1 space-y-5">
          {/* Target Role */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Target className="h-4 w-4 text-primary" />
              Target Role Selector
            </label>
            <Input
              placeholder="e.g., Senior Software Engineer at [Insert top company example]"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary h-11"
            />
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map((role) => (
                <motion.button
                  key={role}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTargetRole(role)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                    targetRole === role
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {role}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-1 p-1 bg-secondary rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab.key
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Skills Input */}
          <AnimatePresence mode="wait">
            {activeTab === "skills" && (
              <motion.div key="skills" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Type or select skills below</label>
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
                </div>

                {/* Suggested Skills Grid with 3D-style icons */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Quick Add — tap to select multiple</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SUGGESTED_SKILLS.map((s, i) => {
                      const isSelected = skills.includes(s.name);
                      return (
                        <motion.button
                          key={s.name}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.02 }}
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (isSelected) {
                              removeSkill(s.name);
                            } else {
                              setSkills(prev => [...prev, s.name]);
                            }
                          }}
                          className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/15 text-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)] ring-1 ring-primary/30"
                              : "border-border bg-secondary/60 text-foreground hover:border-primary/40 hover:bg-secondary"
                          }`}
                        >
                          <span className="text-xl leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{s.icon}</span>
                          <span className="text-xs font-medium truncate">{s.name}</span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                            >
                              <CheckCircle className="h-3 w-3 text-primary-foreground" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Skills */}
                {skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{skills.length} skill{skills.length !== 1 ? "s" : ""} selected</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <motion.div key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm">
                            {getEmoji(skill)} {skill}
                            <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-4" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
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
                      <Button variant="ghost" size="sm" onClick={() => { setResumeText(""); setUploadedFileName(""); setAtsResult(null); }} className="text-muted-foreground hover:text-destructive text-xs">
                        Remove
                      </Button>
                    </div>

                    {/* ATS Score Loading */}
                    {isAtsLoading && (
                      <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Analyzing ATS Compatibility...</p>
                          <p className="text-xs text-muted-foreground">Checking keywords, format & relevance</p>
                        </div>
                      </div>
                    )}

                    {/* ATS Score Result */}
                    <AnimatePresence>
                      {atsResult && !isAtsLoading && (
                        <ATSScoreCard result={atsResult} onClose={() => setAtsResult(null)} />
                      )}
                    </AnimatePresence>

                    <div className="bg-secondary rounded-lg p-4 max-h-40 overflow-y-auto">
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {resumeText.slice(0, 400)}{resumeText.length > 400 ? "..." : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs border-border text-muted-foreground">
                        <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Different
                      </Button>
                      {!atsResult && !isAtsLoading && (
                        <Button variant="outline" size="sm" onClick={() => runATSCheck(resumeText)} className="text-xs border-primary text-primary">
                          <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Check ATS Score
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
                      isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/5"
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
                    <p className="text-[11px] text-primary mt-2 font-medium">✨ Instant ATS Score included</p>
                  </button>
                )}
              </motion.div>
            )}

            {activeTab === "resume" && (
              <motion.div key="resume" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                <Textarea
                  placeholder="Paste your resume text, LinkedIn summary, or describe your experience here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[180px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
                />
                {resumeText.trim() && !atsResult && !isAtsLoading && (
                  <Button variant="outline" size="sm" onClick={() => runATSCheck(resumeText)} className="text-xs border-primary text-primary">
                    <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Check ATS Score
                  </Button>
                )}
                {isAtsLoading && (
                  <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <p className="text-sm font-medium text-foreground">Analyzing ATS Compatibility...</p>
                  </div>
                )}
                <AnimatePresence>
                  {atsResult && !isAtsLoading && (
                    <ATSScoreCard result={atsResult} onClose={() => setAtsResult(null)} />
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === "linkedin" && (
              <motion.div key="linkedin" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <LinkedInImport
                  onSkillsImported={(importedSkills, profileText) => {
                    setSkills((prev) => [...new Set([...prev, ...importedSkills])]);
                    if (profileText) setResumeText(profileText);
                    setActiveTab("skills");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 space-y-4">
          {/* AI Assistant Tip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">AI Assistant</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {!targetRole
                ? "Try selecting roles from companies you admire!"
                : skills.length === 0 && !resumeText.trim()
                ? "Now add your skills or upload your resume for a personalized analysis."
                : "Looking great! Hit 'Analyze Skill Gap' for your personalized roadmap."}
            </p>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-xl p-4 space-y-3"
          >
            <p className="text-[11px] font-medium text-muted-foreground">
              <span className="text-foreground font-bold">Trusted Coach</span>, Sarah, 3 Career Changes Guided
            </p>
            <p className="text-xs text-foreground/80 italic leading-relaxed">
              "Finally, a clear path forward. This helped me find my direction."
            </p>
            <div className="glass-card rounded-lg p-2.5 text-[10px] text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Proven Pathways (Millions of Data Points), personalized, Confidential & Secure</span>
            </div>
          </motion.div>

          {/* ATS History */}
          <ATSHistory />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs font-medium">
        {[
          { n: 1, label: "Select Role" },
          { n: 2, label: "Add Skills" },
          { n: 3, label: "View Roadmap" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 ${currentStep >= step.n ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                currentStep >= step.n ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {step.n}
              </span>
              {step.label}
            </span>
            {i < 2 && (
              <ArrowRight className={`h-3.5 w-3.5 ${currentStep > step.n ? "text-primary" : "text-muted-foreground/30"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Analyze Button */}
      <Button
        onClick={() => onAnalyze({ skills, targetRole, resumeText })}
        disabled={!canSubmit || isLoading || isParsing}
        className="w-full gradient-primary text-primary-foreground font-display font-semibold text-base py-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 animate-pulse-glow"
      >
        {isLoading ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Analyzing Your Skills...</>
        ) : (
          <><Sparkles className="h-5 w-5 mr-2" /> Analyze Skill Gap</>
        )}
      </Button>

      {/* Privacy Note */}
      <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
        <Shield className="h-3 w-3" /> Your data is 100% private and protected.
      </p>
    </div>
  );
};

export default SkillInputForm;
