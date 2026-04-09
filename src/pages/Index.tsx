import { useState, useCallback, useEffect } from "react";
import SkillInputForm from "@/components/SkillInputForm";
import AnalysisResults from "@/components/AnalysisResults";
import AnalysisHistory from "@/components/AnalysisHistory";
import RoleComparison from "@/components/RoleComparison";
import SkillRecommendations from "@/components/SkillRecommendations";
import { AnalysisResult } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Archive, ArrowRight, Brain, Compass, LogOut, Plus, Radar, Satellite, Search, ShieldCheck, Star, Sparkles, Wallet, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import Particles from "@/components/Particles";
import RotatingText from "@/components/RotatingText";
import AppLayout from "@/components/AppLayout";

type View = "input" | "results" | "compare";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [view, setView] = useState<View>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formRole, setFormRole] = useState("");
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [historyKey, setHistoryKey] = useState(0);
  const [isLightMode, setIsLightMode] = useState(() => document.documentElement.classList.contains("light"));
  const [isPhone, setIsPhone] = useState(() => window.matchMedia("(max-width: 640px)").matches);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsLightMode(root.classList.contains("light"));
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const handler = (event: MediaQueryListEvent) => setIsPhone(event.matches);
    setIsPhone(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const showLightEliteMobile = false;
  const showDarkStarMapMobile = false;
  const showMobileModeShell = false;

  const handleAnalyze = async (data: { skills: string[]; targetRole: string; resumeText: string }) => {
    setIsLoading(true);
    try {
      const { data: analysisData, error } = await supabase.functions.invoke("analyze-skills", {
        body: data,
      });

      if (error) throw error;
      if (analysisData?.error) throw new Error(analysisData.error);

      const analysisResult = analysisData as AnalysisResult;
      setResult(analysisResult);
      setView("results");

      // Save to DB if logged in
      if (user) {
        const { error: saveError } = await supabase.from("saved_analyses").insert({
          user_id: user.id,
          target_role: data.targetRole,
          input_skills: data.skills,
          resume_text: data.resumeText || null,
          readiness_score: analysisResult.readinessScore,
          result: analysisResult as any,
        });
        if (saveError) console.error("Failed to save:", saveError);
        else setHistoryKey((k) => k + 1);
      }
    } catch (e: any) {
      console.error("Analysis failed:", e);
      toast({
        title: "Analysis Failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalysis = useCallback((r: AnalysisResult) => {
    setResult(r);
    setView("results");
  }, []);

  const handleCompare = useCallback((analyses: any[]) => {
    setCompareData(analyses);
    setView("compare");
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {!isLightMode && !isPhone && (
        <>
          <div className="absolute inset-0 z-0">
            <Particles
              particleColors={["#2dd4bf", "#14b8a6", "#0d9488"]}
              particleCount={80}
              particleSpread={10}
              speed={0.03}
              particleBaseSize={60}
              moveParticlesOnHover
              alphaParticles
              disableRotation={false}
              pixelRatio={1}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.28)_0%,rgba(99,102,241,0)_70%)] blur-2xl" />
            <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(16,244,212,0.2)_0%,rgba(16,244,212,0)_72%)] blur-3xl" />
            <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2)_0%,rgba(139,92,246,0)_70%)] blur-3xl" />
          </div>
          <div className="pointer-events-none absolute inset-0 z-0 opacity-40 [background-image:radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
        </>
      )}

      {isLightMode && !isPhone && (
        <>
          <div className="light-blob shape-1" />
          <div className="light-blob shape-2" />
          <div className="light-blob shape-3" />
        </>
      )}

      <AppLayout
        initialLoadAnimation={true}
        rightActions={
          <>
            {user && <NotificationBell />}
            {user && (
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </>
        }
      />

      {/* Main */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-10 sm:pb-12 relative z-10">
        {view === "compare" ? (
          <RoleComparison analyses={compareData} onBack={() => setView("input")} />
        ) : view === "results" && result ? (
          <AnalysisResults result={result} onReset={() => { setView("input"); setResult(null); }} />
        ) : (
          <div className={isLightMode ? "light-landing-shell space-y-6 sm:space-y-10" : "space-y-6 sm:space-y-10"}>
            {showDarkStarMapMobile ? (
              <>
                <div className="dark-stars-layer fixed inset-0 pointer-events-none z-0">
                  <div className="dark-star-particle w-[1px] h-[1px] top-[10%] left-[20%]" />
                  <div className="dark-star-particle w-[2px] h-[2px] top-[40%] left-[80%] opacity-60" />
                  <div className="dark-star-particle w-[1px] h-[1px] top-[70%] left-[30%]" />
                  <div className="dark-star-particle w-[2px] h-[2px] top-[15%] left-[65%] opacity-40" />
                  <div className="dark-star-particle w-[1px] h-[1px] top-[85%] left-[10%]" />
                  <div className="dark-star-particle w-[1px] h-[1px] top-[50%] left-[50%]" />
                </div>

                <header className="mb-14 text-center relative z-10">
                  <div className="inline-block mb-4">
                    <div className="relative w-20 h-20 flex items-center justify-center mx-auto">
                      <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-pulse" />
                      <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
                      <Compass className="h-10 w-10 text-cyan-400 dark-ui-glow" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-[0.2em] uppercase dark-hologram-text mb-2 text-slate-100">
                    Star<span className="text-cyan-400">Map</span>
                  </h1>
                  <p className="text-slate-400 text-sm font-light tracking-[0.15em] uppercase">
                    Celestial Career Navigator
                  </p>
                </header>

                <div className="dark-viewport-glass w-full rounded-3xl overflow-hidden relative mb-10">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-3xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-3xl" />
                  <div className="p-8 space-y-12">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] tracking-[0.3em] text-cyan-400/80 uppercase font-semibold">System Status: Active</span>
                      <span className="text-[10px] tracking-[0.3em] text-cyan-400/80 uppercase font-semibold">Sector: 7G</span>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-[11px] font-bold tracking-[0.25em] text-white/50 uppercase">
                        Your Galactic Trajectory
                      </h2>
                      <div className="relative">
                        <input className="w-full bg-black/20 border-0 border-b border-white/10 py-4 px-0 text-xl text-white placeholder:text-white/20 focus:ring-0 focus:border-cyan-400 transition-all" placeholder="Assign Destination..." type="text" />
                        <Radar className="absolute right-0 top-4 h-5 w-5 text-cyan-400/50" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h2 className="text-[11px] font-bold tracking-[0.25em] text-white/50 uppercase">
                        Current Payload Flux
                      </h2>
                      <div className="relative">
                        <input className="w-full bg-black/20 border-0 border-b border-white/10 py-4 px-0 text-xl text-white placeholder:text-white/20 focus:ring-0 focus:border-purple-400 transition-all" placeholder="Log Core Competency..." type="text" />
                        <button className="absolute right-0 top-3 p-2 text-purple-400/70 hover:text-purple-400">
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="dark-skill-pill px-4 py-2 rounded-lg flex items-center gap-3">
                          <span className="text-xs font-medium text-cyan-200 tracking-wider">Quantum Logic</span>
                          <X className="h-3.5 w-3.5 text-white/40 hover:text-white cursor-pointer" />
                        </div>
                        <div className="dark-skill-pill px-4 py-2 rounded-lg flex items-center gap-3">
                          <span className="text-xs font-medium text-purple-200 tracking-wider">Deep Space Ops</span>
                          <X className="h-3.5 w-3.5 text-white/40 hover:text-white cursor-pointer" />
                        </div>
                        <div className="dark-skill-pill px-4 py-2 rounded-lg flex items-center gap-3">
                          <span className="text-xs font-medium text-emerald-200 tracking-wider">Signal Arch</span>
                          <X className="h-3.5 w-3.5 text-white/40 hover:text-white cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button className="w-full py-5 bg-cyan-500/10 border border-cyan-400/40 rounded-xl font-bold text-sm tracking-[0.3em] text-cyan-400 uppercase hover:bg-cyan-400/20 active:scale-[0.98] transition-all relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        Initiate Warp Scan
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="dark-viewport-glass p-5 rounded-2xl border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Satellite className="h-4 w-4 text-cyan-400" />
                      <p className="text-[9px] text-slate-400 tracking-widest uppercase">Signal Strength</p>
                    </div>
                    <p className="text-2xl font-light text-white tracking-tight">Alpha <span className="text-cyan-400 font-bold">9.2</span></p>
                  </div>
                  <div className="dark-viewport-glass p-5 rounded-2xl border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="h-4 w-4 text-purple-400" />
                      <p className="text-[9px] text-slate-400 tracking-widest uppercase">Resource Delta</p>
                    </div>
                    <p className="text-2xl font-light text-white tracking-tight">+$124<span className="text-purple-400 font-bold">K</span></p>
                  </div>
                </div>

                <footer className="mt-auto pt-20 w-full">
                  <div className="flex items-center justify-between px-2 mb-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                      <span className="text-[8px] text-cyan-400 tracking-[0.2em] uppercase">Origin</span>
                    </div>
                    <div className="flex-1 h-[1px] mx-4 bg-gradient-to-r from-cyan-400/50 to-white/5" />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="text-[8px] text-white/30 tracking-[0.2em] uppercase">Transit</span>
                    </div>
                    <div className="flex-1 h-[1px] mx-4 bg-gradient-to-r from-white/5 to-white/5" />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="text-[8px] text-white/30 tracking-[0.2em] uppercase">Zenith</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-white/20 tracking-[0.4em] uppercase">Astro-Engine Linkage v8.0</p>
                  </div>
                </footer>

                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-20">
                  <div className="dark-scanner-line absolute top-1/4 opacity-20" />
                  <div className="dark-scanner-line absolute top-3/4 opacity-10" />
                  <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#02040a] to-transparent" />
                </div>
              </>
            ) : showLightEliteMobile ? (
              <>
                <div className="elite-grain-overlay" />

                <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-2xl shadow-[0px_10px_30px_rgba(14,165,233,0.04)]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-600" />
                    <span className="text-xl font-extrabold tracking-tighter text-sky-600">SkillBridge</span>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-200">
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl9EOC3XjMdhRlbI75lnalDe2m9UrC0zNbJsPR4NiAwS75_7z0mNXL0Zxp9AWFpuXBiARTE5P37srLfbSZKgN47PqXXA4UAvpxRU2FyOlj27MEvWRtptVzEVck1wENLDwyfnqPWcQ4g3Royast-X7KPsfRAh8_qLcENKIuHJFSPV3le1Fs_0nkibY-_11JMUM7JeezQ_tM-cTJFuzj-hdA01nMST__-u98dsWE2UGuJ6AWEzeGWwXSR6x8I_yMaQ5nzbAsflFpkJ1l"
                    />
                  </div>
                </header>

                <section className="mb-12">
                  <p className="text-sm font-bold tracking-widest uppercase text-sky-700/70 mb-2">Your Career</p>
                  <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 leading-[1.1] mb-4">
                    SkillBridge <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-sky-500">Elite</span>
                  </h1>
                  <p className="text-slate-600 leading-relaxed max-w-[90%]">
                    Identify the specific gaps between your current expertise and your dream role with AI precision.
                  </p>
                </section>

                <div className="elite-glass-panel p-8 rounded-[2.5rem] shadow-[0px_20px_40px_rgba(0,101,145,0.06)] border border-slate-200/50 mb-8">
                  <div className="mb-10">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Target Role</label>
                    <div className="relative group">
                      <input className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition-all" placeholder="e.g. Senior Product Designer" type="text" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-sky-700" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button className="bg-emerald-100/60 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-200/80">UX ARCHITECT</button>
                      <button className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[11px] font-bold border border-slate-200">LEAD DEV</button>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="flex gap-6 mb-6 px-1">
                      <button className="text-sky-700 font-bold text-sm border-b-2 border-sky-700 pb-1">Add Skills</button>
                      <button className="text-slate-400 font-semibold text-sm">Upload Resume</button>
                    </div>
                    <div className="relative">
                      <textarea className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition-all resize-none" placeholder="Type your core skills..." rows={3} />
                    </div>
                  </div>

                  <div className="mb-12">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Current Inventory</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "Figma",
                        "Strategy",
                        "React",
                      ].map((skill) => (
                        <div key={skill} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-xs font-semibold text-slate-900">{skill}</span>
                          <X className="h-3.5 w-3.5 text-rose-400" />
                        </div>
                      ))}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-sky-700 to-sky-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0px_10px_20px_rgba(0,101,145,0.2)] active:scale-[0.98] transition-transform">
                    <span>Analyze Skill Gap</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex justify-between items-center px-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-sky-700 shadow-[0_0_8px_rgba(0,101,145,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-sky-700">Select Role</span>
                  </div>
                  <div className="h-[1px] w-8 bg-slate-300 -mt-4" />
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Add Skills</span>
                  </div>
                  <div className="h-[1px] w-8 bg-slate-300 -mt-4" />
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Roadmap</span>
                  </div>
                </div>

                <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-white/75 backdrop-blur-2xl shadow-[0px_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[2rem]">
                  <div className="flex flex-col items-center justify-center bg-sky-100/60 text-sky-700 rounded-2xl px-5 py-2">
                    <Compass className="h-5 w-5" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase mt-1">Explorer</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-slate-400 px-5 py-2">
                    <ArrowRight className="h-5 w-5" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase mt-1">Path</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-slate-400 px-5 py-2">
                    <Brain className="h-5 w-5" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase mt-1">Mentor</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-slate-400 px-5 py-2">
                    <Archive className="h-5 w-5" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase mt-1">Vault</span>
                  </div>
                </nav>
              </>
            ) : isLightMode ? (
              <>
                <div className="text-center space-y-3 sm:space-y-5 pt-1 sm:pt-2">
                  <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-800 tracking-tight leading-[0.95]">
                    SkillBridge
                    <span className="block mt-1 light-gradient-text">
                      Your Career
                    </span>
                  </h2>
                  {!isPhone && (
                    <div className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-cyan-700 shadow-sm">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">AI Career Roadmaps</span>
                      <Star className="h-4 w-4 text-orange-400" />
                    </div>
                  )}
                  <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-medium">
                    Enter your skills or paste your resume, choose your dream role, and get an AI-powered roadmap to get there.
                  </p>
                </div>

                {user && (
                  <AnalysisHistory key={historyKey} onViewAnalysis={handleViewAnalysis} onCompare={handleCompare} />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 w-full max-w-7xl mx-auto p-0 sm:p-2 md:p-4">
                  <div className="lg:col-span-8 relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border border-white/60 bg-white/75 p-4 sm:p-5 md:p-8 backdrop-blur-md shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]">
                    {!isPhone && <div className="pointer-events-none absolute -left-20 top-8 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />}
                    {!isPhone && <div className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />}

                    <div className="relative space-y-4">
                      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                        <Search className="h-4 w-4" />
                        Target Role + Skills Analyzer
                      </div>
                      <SkillInputForm onAnalyze={handleAnalyze} isLoading={isLoading} onFormChange={(skills, role) => { setFormSkills(skills); setFormRole(role); }} />
                    </div>
                  </div>

                  {!isPhone && <div className="lg:col-span-4 flex flex-col space-y-6">
                    <div className="rounded-[1.6rem] border border-slate-100 bg-white/80 p-8 shadow-[0_20px_60px_-28px_rgba(79,70,229,0.35)] backdrop-blur-md">
                      <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">Ready to Analyze?</h3>
                      <p className="text-slate-500 font-medium mb-6">
                        We compare your current skills against market benchmarks for your target role.
                      </p>
                      <div className="w-full rounded-2xl light-cta-gradient px-5 py-4 text-white font-extrabold flex items-center justify-between">
                        <span>Analyze Gap</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <ShieldCheck className="h-4 w-4 text-cyan-600" />
                        AI Analysis: 100% Private
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-slate-100 bg-white/80 p-7 backdrop-blur-md shadow-sm">
                      <h4 className="text-sm font-black text-slate-700 mb-4 uppercase tracking-[0.2em]">Pro Tips</h4>
                      <ul className="space-y-3 text-sm font-medium text-slate-600">
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-500">→</span>
                          <span>Adding more than 10 skills increases accuracy.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-500">→</span>
                          <span>Specific job titles like Staff Frontend Engineer work best.</span>
                        </li>
                      </ul>
                    </div>
                  </div>}
                </div>

                {!isPhone && <SkillRecommendations targetRole={formRole} currentSkills={formSkills} />}

                {!user && (
                  <p className="text-center text-sm text-slate-600 font-medium">
                    <button onClick={() => navigate("/auth")} className="text-cyan-700 font-semibold hover:underline">Sign in</button>
                    {" "}to save analyses and track your progress over time.
                  </p>
                )}

                {!isPhone && <nav className="mt-8 flex items-center justify-center space-x-4 md:space-x-12 text-[11px] md:text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  <div className="flex items-center space-x-4 text-indigo-600">
                    <span className="w-10 h-10 flex items-center justify-center rounded-2xl light-cta-gradient text-white shadow-lg">1</span>
                    <span>Select Role</span>
                  </div>
                  <div className="w-10 md:w-20 h-1 rounded-full bg-slate-200" />
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 shadow-sm">2</span>
                    <span>Add Skills</span>
                  </div>
                  <div className="w-10 md:w-20 h-1 rounded-full bg-slate-200" />
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 shadow-sm">3</span>
                    <span>View Roadmap</span>
                  </div>
                </nav>}
              </>
            ) : (
              <>
            {/* Hero */}
            <div className="text-center space-y-3 sm:space-y-4 pt-1 sm:pt-2">
              <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[0.95]">
                SkillBridge
                <span className="block mt-1 bg-gradient-to-r from-primary via-[#60a5fa] to-[#8b5cf6] bg-clip-text text-transparent">
                  Your Career
                </span>
              </h2>
              {!isPhone && (
                <div className="flex items-center justify-center gap-2 text-primary/90">
                  <Sparkles className="h-4 w-4" />
                  <RotatingText
                    texts={['AI Career Roadmaps', 'Smart Skill Gap Insights', 'Faster Job Readiness', 'Personalized Growth Paths']}
                    mainClassName="px-3 bg-primary/12 border border-primary/25 text-primary overflow-hidden py-1 rounded-lg text-sm"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </div>
              )}
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
                Enter your skills or paste your resume, choose your dream role, and get an AI-powered roadmap to get there.
              </p>
            </div>

            {/* History (logged in users) */}
            {user && (
              <AnalysisHistory key={historyKey} onViewAnalysis={handleViewAnalysis} onCompare={handleCompare} />
            )}

            {/* Form Card */}
            <div className="relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] p-4 sm:p-5 md:p-8 border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,42,0.82)_0%,rgba(8,14,30,0.86)_100%)] backdrop-blur-xl shadow-[0_30px_80px_-28px_rgba(0,0,0,0.75)]">
              {!isPhone && <div className="pointer-events-none absolute -left-24 top-10 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />}
              {!isPhone && <div className="pointer-events-none absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-[#8b5cf6]/15 blur-3xl" />}
              <div className="relative">
                <SkillInputForm onAnalyze={handleAnalyze} isLoading={isLoading} onFormChange={(skills, role) => { setFormSkills(skills); setFormRole(role); }} />
              </div>
            </div>

            {/* Skill Recommendations */}
            {!isPhone && <SkillRecommendations targetRole={formRole} currentSkills={formSkills} />}

            {!user && (
              <p className="text-center text-sm text-muted-foreground">
                <button onClick={() => navigate("/auth")} className="text-primary hover:underline">Sign in</button>
                {" "}to save analyses and track your progress over time.
              </p>
            )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
