import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, RotateCcw, CalendarDays, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import PlanForm from "@/components/placement/PlanForm";
import ExistingPlans from "@/components/placement/ExistingPlans";
import PlanProgress from "@/components/placement/PlanProgress";
import PhaseCards from "@/components/placement/PhaseCards";
import DaySelector from "@/components/placement/DaySelector";
import CalendarView from "@/components/placement/CalendarView";
import PlanExport from "@/components/placement/PlanExport";

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
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [planStartDate, setPlanStartDate] = useState<Date>(new Date());

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

      if (user) {
        const { data: savedPlan, error: saveErr } = await supabase
          .from("placement_plans")
          .insert({ user_id: user.id, company_name: companyName, target_role: targetRole, total_days: totalDays, plan: data as any })
          .select()
          .single();

        if (saveErr) throw saveErr;
        setSavedPlanId(savedPlan.id);

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

      toast({ title: "Plan Generated! 🎉", description: `Your ${totalDays}-day plan for ${companyName} is ready.` });
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
    setPlanStartDate(new Date(p.created_at));
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {plan && (
          <PlanExport plan={plan} companyName={companyName} targetRole={targetRole} totalDays={totalDays} />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shadow-[var(--shadow-glow)]">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Placement Planner</h2>
          <p className="text-sm text-muted-foreground">AI-powered company-specific preparation roadmap</p>
        </div>
      </motion.div>

      {!plan ? (
        <div className="space-y-6">
          <ExistingPlans plans={existingPlans} onLoadPlan={handleLoadPlan} />
          <PlanForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            totalDays={totalDays}
            setTotalDays={setTotalDays}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <PlanProgress
            companyName={companyName}
            targetRole={targetRole}
            summary={plan.summary}
            completedCount={completedCount}
            totalCount={savedTasks.length}
            progressPercent={progressPercent}
          />
          <PhaseCards phases={plan.phases} />
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-lg"
            >
              <LayoutGrid className="h-4 w-4 mr-1" /> Grid
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-lg"
            >
              <CalendarDays className="h-4 w-4 mr-1" /> Calendar
            </Button>
          </div>
          {viewMode === "grid" ? (
            <DaySelector
              totalDays={totalDays}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              savedTasks={savedTasks}
              onToggleTask={toggleTask}
            />
          ) : (
            <CalendarView
              totalDays={totalDays}
              startDate={planStartDate}
              savedTasks={savedTasks}
              onToggleTask={toggleTask}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
          )}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlacementPlanner;
