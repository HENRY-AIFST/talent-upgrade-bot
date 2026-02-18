import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { useToast } from "@/hooks/use-toast";

interface ExportPDFButtonProps {
  result: AnalysisResult;
}

const ExportPDFButton = ({ result }: ExportPDFButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const checkPage = (needed: number) => {
        if (y + needed > 270) {
          doc.addPage();
          y = 20;
        }
      };

      // Title
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SkillBridge Analysis Report", margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y);
      doc.setTextColor(0);
      y += 12;

      // Readiness Score
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Readiness Score: ${result.readinessScore}%`, margin, y);
      y += 10;

      // Profile Summary
      checkPage(30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Profile Summary", margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(result.profileSummary, contentWidth);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 8;

      // Skill Gaps
      checkPage(20);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Skill Gaps", margin, y);
      y += 8;

      result.skillGaps.forEach((gap) => {
        checkPage(20);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${gap.skill} (${gap.importance})`, margin, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Current: ${gap.currentLevel}/10 → Required: ${gap.requiredLevel}/10`, margin, y);
        y += 4;
        const reasonLines = doc.splitTextToSize(gap.reason, contentWidth);
        doc.text(reasonLines, margin, y);
        y += reasonLines.length * 4 + 5;
      });

      // Learning Roadmap
      checkPage(20);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Learning Roadmap", margin, y);
      y += 8;

      result.learningRoadmap.forEach((phase) => {
        checkPage(25);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${phase.phase}: ${phase.title}`, margin, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Skills: ${phase.skills.join(", ")}`, margin, y);
        y += 5;
        if (phase.projects.length) {
          doc.text(`Projects: ${phase.projects.join(", ")}`, margin, y);
          y += 5;
        }
        y += 3;
      });

      // Timeline
      checkPage(25);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Timeline", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const timelineEntries = [
        ["3 Months", result.timeline.threeMonths],
        ["6 Months", result.timeline.sixMonths],
        ["1 Year", result.timeline.oneYear],
      ];
      timelineEntries.forEach(([label, text]) => {
        checkPage(15);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 4;
      });

      // Certifications
      if (result.certifications.length) {
        checkPage(20);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Recommended Certifications", margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        result.certifications.forEach((cert) => {
          checkPage(8);
          doc.text(`• ${cert.name} — ${cert.provider} (${cert.relevance} relevance)`, margin, y);
          y += 6;
        });
      }

      doc.save("skillbridge-analysis.pdf");
      toast({ title: "PDF exported!", description: "Your report has been downloaded." });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Export failed", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={exportPDF} disabled={isExporting} className="border-border text-muted-foreground hover:text-foreground">
      {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Export PDF
    </Button>
  );
};

export default ExportPDFButton;
