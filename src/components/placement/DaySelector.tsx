import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Circle, BookOpen, Code, Users, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SavedTask {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  category: string;
  is_completed: boolean;
}

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

const CATEGORY_BG: Record<string, string> = {
  study: "bg-primary/10",
  practice: "bg-accent/10",
  mock: "bg-chart-3/10",
  review: "bg-chart-4/10",
};

interface DaySelectorProps {
  totalDays: number;
  selectedDay: number;
  setSelectedDay: (d: number) => void;
  savedTasks: SavedTask[];
  onToggleTask: (taskId: string, completed: boolean) => void;
}

const DaySelector = ({ totalDays, selectedDay, setSelectedDay, savedTasks, onToggleTask }: DaySelectorProps) => {
  const todayTasks = savedTasks.filter((t) => t.day_number === selectedDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="gradient-card rounded-2xl p-5 md:p-6 border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Daily Tasks
        </h3>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <Button variant="ghost" size="sm" disabled={selectedDay <= 1} onClick={() => setSelectedDay(selectedDay - 1)} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground min-w-[70px] text-center">Day {selectedDay}</span>
          <Button variant="ghost" size="sm" disabled={selectedDay >= totalDays} onClick={() => setSelectedDay(selectedDay + 1)} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day grid */}
      <div className="flex flex-wrap gap-1.5 mb-5 max-h-24 overflow-y-auto scrollbar-thin p-1">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
          const dayTasks = savedTasks.filter((t) => t.day_number === d);
          const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.is_completed);
          const someDone = dayTasks.some((t) => t.is_completed);
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`w-8 h-8 text-[11px] rounded-lg font-semibold transition-all duration-150 ${
                d === selectedDay
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.5)] scale-110"
                  : allDone
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : someDone
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Tasks */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {todayTasks.length > 0 ? todayTasks.map((task, i) => {
            const Icon = CATEGORY_ICONS[task.category] || BookOpen;
            const colorClass = CATEGORY_COLORS[task.category] || "text-primary";
            const bgClass = CATEGORY_BG[task.category] || "bg-primary/10";
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  task.is_completed
                    ? "bg-primary/5 border-primary/20 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.1)]"
                    : "bg-card border-border hover:border-primary/30 hover:shadow-[0_2px_15px_-5px_hsl(0_0%_0%/0.3)]"
                }`}
              >
                <button onClick={() => onToggleTask(task.id, task.is_completed)} className="mt-0.5 shrink-0">
                  {task.is_completed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${colorClass} ${bgClass}`}>
                      <Icon className="h-3 w-3" />
                      {task.category}
                    </span>
                  </div>
                  <p className={`font-medium text-sm leading-snug ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{task.description}</p>
                  )}
                </div>
              </motion.div>
            );
          }) : (
            <div className="text-center py-10">
              <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tasks for Day {selectedDay}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default DaySelector;
