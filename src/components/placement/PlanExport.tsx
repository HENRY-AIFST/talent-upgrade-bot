import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface PlacementPlan {
  summary: string;
  phases: { name: string; days: string; focus: string }[];
  dailyTasks: { day: number; title: string; description: string; category: string; estimatedHours: number }[];
}

interface PlanExportProps {
  plan: PlacementPlan;
  companyName: string;
  targetRole: string;
  totalDays: number;
}

const formatDuration = (days: number) => {
  if (days === 15 || days === 45) {
    return `${days} days`;
  }
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"}`;
};

const PlanExport = ({ plan, companyName, targetRole, totalDays }: PlanExportProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const exportPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`${companyName} - ${targetRole}`, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${formatDuration(totalDays)} Placement Plan`, margin, y);
    y += 8;
    doc.text(plan.summary, margin, y, { maxWidth: 170 });
    y += 15;

    // Phases
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Phases", margin, y);
    y += 8;

    plan.phases?.forEach((phase) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${phase.days}: ${phase.name}`, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(phase.focus, margin + 5, y, { maxWidth: 165 });
      y += 8;
    });

    y += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Daily Tasks", margin, y);
    y += 8;

    plan.dailyTasks?.forEach((task) => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${task.day}: ${task.title}`, margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.text(task.description || "", margin + 5, y, { maxWidth: 165 });
      y += 8;
    });

    doc.save(`${companyName}-${targetRole}-plan.pdf`);
    toast({ title: "PDF exported!", description: "Your plan has been downloaded." });
  };

  const copyPlanText = () => {
    const text = [
      `${companyName} - ${targetRole} (${formatDuration(totalDays)} Plan)`,
      plan.summary,
      "",
      "PHASES:",
      ...(plan.phases?.map(p => `${p.days}: ${p.name} - ${p.focus}`) || []),
      "",
      "DAILY TASKS:",
      ...(plan.dailyTasks?.map(t => `Day ${t.day}: ${t.title} - ${t.description}`) || []),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Plan copied to clipboard." });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportPDF} className="rounded-lg">
        <Download className="h-4 w-4 mr-1.5" />
        Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={copyPlanText} className="rounded-lg">
        {copied ? <Check className="h-4 w-4 mr-1.5 text-primary" /> : <Copy className="h-4 w-4 mr-1.5" />}
        {copied ? "Copied" : "Copy Plan"}
      </Button>
    </div>
  );
};

export default PlanExport;
