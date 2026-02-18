import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, Circle, Loader2, Trophy, Clock, BookOpen, Code, Users, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DailyTask {
  day: number;
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
}

interface PlacementPlan {
  summary: string;
  phases: { name: string; days: string; focus: string }[];
  dailyTasks: DailyTask[];
}

interface SavedTask {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  category: string;
  is_completed: boolean;
}

const POPULAR_COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Uber", "Stripe", "Airbnb", "Tesla"];

const CATEGORY_ICONS: Record<string, any> = {
  study: BookOpen,
  practice: Code,
  mock: Users,
  review: RotateCcw,
};

const CATEGORY_COLORS: Record<string, string> = {
  study: "text-primary",
  practice: "text-accent",
  mock: "text-chart-3",
  review: "text-chart-4",
};

interface PlacementPlannerProps {
  onBack: () => void;
}

const PlacementPlanner = ({ onBack }: PlacementPlannerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [totalDays, setTotalDays] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<PlacementPlan | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [savedTasks, setSavedTasks] = useState<SavedTask[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [existingPlans, setExistingPlans] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadExistingPlans();
  }, [user]);

  const loadExistingPlans = async () => {
    const { data } = await supabase
      .from("placement_plans")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setExistingPlans(data);
  };

  const loadSavedTasks = async (planId: string) => {
    const { data } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("plan_id", planId)
      .order("day_number", { ascending: true });
    if (data) setSavedTasks(data as SavedTask[]);
  };

  const handleGenerate = async () => {
    if (!companyName.trim() || !targetRole.trim()) {
      toast({ title: "Missing info", description: "Enter company name and target role.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-placement-plan", {
        body: { companyName, targetRole, totalDays },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPlan(data as PlacementPlan);

      // Save plan to DB
      if (user) {
        const { data: savedPlan, error: saveErr } = await supabase
          .from("placement_plans")
          .insert({ user_id: user.id, company_name: companyName, target_role: targetRole, total_days: totalDays, plan: data as any })
          .select()
          .single();

        if (saveErr) throw saveErr;
        setSavedPlanId(savedPlan.id);

        // Save daily tasks
        const tasks = (data as PlacementPlan).dailyTasks.map((t) => ({
          plan_id: savedPlan.id,
          user_id: user.id,
          day_number: t.day,
          title: t.title,
          description: t.description,
          category: t.category,
        }));

        const { error: taskErr } = await supabase.from("daily_tasks").insert(tasks);
        if (taskErr) console.error("Task save error:", taskErr);
        else await loadSavedTasks(savedPlan.id);

        loadExistingPlans();
      }
    } catch (e: any) {
      toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPlan = async (p: any) => {
    setPlan(p.plan as PlacementPlan);
    setSavedPlanId(p.id);
    setCompanyName(p.company_name);
    setTargetRole(p.target_role);
    setTotalDays(p.total_days);
    await loadSavedTasks(p.id);
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("daily_tasks")
      .update({ is_completed: !completed, completed_at: !completed ? new Date().toISOString() : null })
      .eq("id", taskId);
    if (!error) {
      setSavedTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: !completed } : t))
      );
    }
  };

  const completedCount = savedTasks.filter((t) => t.is_completed).length;
  const progressPercent = savedTasks.length > 0 ? Math.round((completedCount / savedTasks.length) * 100) : 0;
  const todayTasks = savedTasks.filter((t) => t.day_number === selectedDay);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Placement Planner</h2>
          <p className="text-sm text-muted-foreground">Company-specific preparation roadmap</p>
        </div>
      </div>

      {!plan ? (
        <div className="space-y-6">
          {/* Existing plans */}
          {existingPlans.length > 0 && (
            <div className="gradient-card rounded-xl p-5 border border-border shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-3">Your Plans</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {existingPlans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleLoadPlan(p)}
                    className="text-left p-3 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card"
                  >
                    <p className="font-medium text-foreground text-sm">{p.company_name}</p>
                    <p className="text-xs text-muted-foreground">{p.target_role} · {p.total_days} days</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* New plan form */}
          <div className="gradient-card rounded-xl p-6 border border-border shadow-card space-y-5">
            <h3 className="font-display font-semibold text-foreground">Create New Plan</h3>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Target Company</label>
              <Input
                placeholder="Type company name..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-secondary border-border"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {POPULAR_COMPANIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCompanyName(c)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      companyName === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Target Role</label>
              <Input
                placeholder="e.g. Software Engineer, Data Scientist..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Preparation Duration</label>
              <div className="flex gap-2">
                {[15, 30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setTotalDays(d)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      totalDays === d
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gradient-primary text-primary-foreground font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Generate Placement Plan
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress overview */}
          <div className="gradient-card rounded-xl p-5 border border-border shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">{companyName} · {targetRole}</h3>
                <p className="text-sm text-muted-foreground">{plan.summary}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-bold text-primary">{progressPercent}%</p>
                <p className="text-xs text-muted-foreground">{completedCount}/{savedTasks.length} tasks</p>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Phases */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plan.phases?.map((phase, i) => (
              <div key={i} className="gradient-card rounded-lg p-4 border border-border shadow-card">
                <p className="text-xs text-primary font-medium mb-1">{phase.days}</p>
                <p className="font-display font-semibold text-foreground text-sm">{phase.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{phase.focus}</p>
              </div>
            ))}
          </div>

          {/* Day selector */}
          <div className="gradient-card rounded-xl p-5 border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Daily Tasks
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={selectedDay <= 1} onClick={() => setSelectedDay((d) => d - 1)}>
                  ←
                </Button>
                <span className="text-sm font-medium text-foreground min-w-[80px] text-center">Day {selectedDay}</span>
                <Button variant="ghost" size="sm" disabled={selectedDay >= totalDays} onClick={() => setSelectedDay((d) => d + 1)}>
                  →
                </Button>
              </div>
            </div>

            {/* Day grid - quick jump */}
            <div className="flex flex-wrap gap-1 mb-4 max-h-20 overflow-y-auto">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                const dayTasks = savedTasks.filter((t) => t.day_number === d);
                const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.is_completed);
                const someDone = dayTasks.some((t) => t.is_completed);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`w-7 h-7 text-[10px] rounded-md font-medium transition-colors ${
                      d === selectedDay
                        ? "bg-primary text-primary-foreground"
                        : allDone
                        ? "bg-primary/20 text-primary"
                        : someDone
                        ? "bg-accent/20 text-accent"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Tasks for selected day */}
            <div className="space-y-3">
              {todayTasks.length > 0 ? todayTasks.map((task) => {
                const Icon = CATEGORY_ICONS[task.category] || BookOpen;
                const colorClass = CATEGORY_COLORS[task.category] || "text-primary";
                return (
                  <div
                    key={task.id}
                    className={`flex gap-3 p-4 rounded-lg border transition-colors ${
                      task.is_completed
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <button onClick={() => toggleTask(task.id, task.is_completed)} className="mt-0.5 shrink-0">
                      {task.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
                        <span className={`text-[10px] uppercase font-semibold tracking-wider ${colorClass}`}>{task.category}</span>
                      </div>
                      <p className={`font-medium text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground text-center py-6">No tasks for Day {selectedDay}</p>
              )}
            </div>
          </div>

          <Button variant="outline" onClick={() => { setPlan(null); setSavedPlanId(null); setSavedTasks([]); }} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlacementPlanner;
