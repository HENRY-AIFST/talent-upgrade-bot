import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, CalendarDays, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const POPULAR_COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Uber", "Stripe", "Airbnb", "Tesla"];

interface PlanFormProps {
  companyName: string;
  setCompanyName: (v: string) => void;
  targetRole: string;
  setTargetRole: (v: string) => void;
  totalDays: number;
  setTotalDays: (v: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const PlanForm = ({ companyName, setCompanyName, targetRole, setTargetRole, totalDays, setTotalDays, isGenerating, onGenerate }: PlanFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-card rounded-2xl p-6 md:p-8 border border-border shadow-card space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">Create Your Plan</h3>
          <p className="text-xs text-muted-foreground">AI-powered company-specific preparation</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Target Company</label>
        <Input
          placeholder="Type company name..."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="bg-secondary border-border h-11 text-base"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {POPULAR_COMPANIES.map((c, i) => (
            <motion.button
              key={c}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setCompanyName(c)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                companyName === c
                  ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-secondary"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Target Role</label>
        <Input
          placeholder="e.g. Software Engineer, Data Scientist..."
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="bg-secondary border-border h-11 text-base"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Preparation Duration</label>
        <div className="flex gap-2">
          {[15, 30, 45, 60, 90, 180, 270, 450].map((d) => (
            <button
              key={d}
              onClick={() => setTotalDays(d)}
              className={`flex-1 py-2.5 text-sm rounded-xl border transition-all duration-200 ${
                totalDays === d
                  ? "border-primary bg-primary/15 text-primary font-semibold shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating || !companyName.trim() || !targetRole.trim()}
        className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base rounded-xl shadow-[var(--shadow-glow)] hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.3)] transition-shadow"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating Your Plan...
          </>
        ) : (
          <>
            <CalendarDays className="h-5 w-5 mr-2" />
            Generate Placement Plan
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default PlanForm;
