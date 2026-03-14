import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen, Code, Users, RotateCcw } from "lucide-react";
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarViewProps {
  totalDays: number;
  startDate: Date;
  savedTasks: SavedTask[];
  onToggleTask: (taskId: string, completed: boolean) => void;
  selectedDay: number;
  setSelectedDay: (d: number) => void;
}

const CalendarView = ({ totalDays, startDate, savedTasks, onToggleTask, selectedDay, setSelectedDay }: CalendarViewProps) => {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(startDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Map each day_number to a real date
  const dayToDate = useMemo(() => {
    const map: Record<number, Date> = {};
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i - 1);
      map[i] = d;
    }
    return map;
  }, [totalDays, startDate]);

  // Build calendar grid for current month
  const calendarGrid = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.year, viewMonth.month, 1);
    const lastOfMonth = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startDow = firstOfMonth.getDay();
    const daysInMonth = lastOfMonth.getDate();

    const cells: { date: Date | null; dayNumber: number | null }[] = [];

    // Leading blanks
    for (let i = 0; i < startDow; i++) cells.push({ date: null, dayNumber: null });

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewMonth.year, viewMonth.month, d);
      // Find matching day_number
      let dayNum: number | null = null;
      for (let i = 1; i <= totalDays; i++) {
        const mapped = dayToDate[i];
        if (mapped && mapped.getFullYear() === date.getFullYear() && mapped.getMonth() === date.getMonth() && mapped.getDate() === date.getDate()) {
          dayNum = i;
          break;
        }
      }
      cells.push({ date, dayNumber: dayNum });
    }

    return cells;
  }, [viewMonth, totalDays, dayToDate]);

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setViewMonth((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
  };
  const nextMonth = () => {
    setViewMonth((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
  };

  const todayTasks = savedTasks.filter((t) => t.day_number === selectedDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="gradient-card rounded-2xl p-5 md:p-6 border border-border shadow-card"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-display font-semibold text-foreground text-lg">{monthLabel}</h3>
        <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1 mb-5">
        {calendarGrid.map((cell, idx) => {
          if (!cell.date) return <div key={idx} />;

          const dayNum = cell.dayNumber;
          const dateNum = cell.date.getDate();
          const hasPlan = dayNum !== null;
          const dayTasks = hasPlan ? savedTasks.filter((t) => t.day_number === dayNum) : [];
          const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.is_completed);
          const someDone = dayTasks.some((t) => t.is_completed);
          const isSelected = dayNum === selectedDay;

          return (
            <button
              key={idx}
              onClick={() => dayNum && setSelectedDay(dayNum)}
              disabled={!hasPlan}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all duration-150 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.5)] scale-105 z-10"
                  : allDone
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : someDone
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : hasPlan
                  ? "bg-secondary text-foreground hover:bg-muted cursor-pointer"
                  : "text-muted-foreground/30 cursor-default"
              }`}
            >
              <span>{dateNum}</span>
              {hasPlan && dayTasks.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayTasks.length <= 3 ? dayTasks.map((t, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${t.is_completed ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  )) : (
                    <>
                      <span className={`w-1 h-1 rounded-full ${allDone ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      <span className="text-[8px] leading-none">{dayTasks.length}</span>
                    </>
                  )}
                </div>
              )}
              {hasPlan && !isSelected && (
                <span className="absolute -top-1 -right-1 text-[8px] text-muted-foreground/50 font-bold">
                  D{dayNum}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <div className="text-sm font-semibold text-foreground mb-2">
            Day {selectedDay} — {dayToDate[selectedDay]?.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
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
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border hover:border-primary/30"
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
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No tasks for Day {selectedDay}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarView;
