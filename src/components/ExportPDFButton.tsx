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
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const topMargin = 18;
      const bottomMargin = 16;
      let y = topMargin;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - bottomMargin) {
          doc.addPage();
          y = topMargin;
        }
      };

      const writeWrappedText = (text: string, fontSize = 10, lineHeight = 5) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text || "-", contentWidth);
        lines.forEach((line: string) => {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        });
      };

      const drawHeader = () => {
        doc.setFillColor(18, 62, 95);
        doc.rect(0, 0, pageWidth, 30, "F");
        doc.setFillColor(33, 150, 243);
        doc.rect(0, 30, pageWidth, 1.4, "F");

        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("SkillBridge Analysis Report", margin, 15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 22);
        doc.setTextColor(0);
      };

      const drawSectionTitle = (title: string) => {
        ensureSpace(10);
        doc.setFillColor(236, 244, 252);
        doc.roundedRect(margin, y - 4, contentWidth, 8, 1.5, 1.5, "F");
        doc.setDrawColor(33, 150, 243);
        doc.setLineWidth(0.6);
        doc.line(margin, y + 4, margin + contentWidth, y + 4);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(title, margin + 2, y + 1.8);
        y += 10;
      };

      const writeMeta = (label: string, value: string, fontSize = 10, lineHeight = 5) => {
        const merged = `${label}: ${value}`;
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(merged, contentWidth);
        lines.forEach((line: string) => {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        });
      };

      drawHeader();
      y = 40;

      // Readiness score highlight
      ensureSpace(14);
      doc.setFillColor(230, 247, 236);
      doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, "F");
      doc.setTextColor(0, 102, 51);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`Readiness Score: ${result.readinessScore}%`, margin + 2, y + 1.5);
      doc.setTextColor(0);
      y += 12;

      // Profile Summary
      drawSectionTitle("Profile Summary");
      writeWrappedText(result.profileSummary, 10, 5);
      y += 4;

      // Skill Gaps
      drawSectionTitle("Skill Gaps");

      result.skillGaps.forEach((gap) => {
        ensureSpace(24);
        doc.setFontSize(11.5);
        doc.setFont("helvetica", "bold");
        doc.text(`${gap.skill} (${gap.importance})`, margin, y);
        y += 5.5;
        writeMeta("Current vs Required", `${gap.currentLevel}/10 -> ${gap.requiredLevel}/10`, 9.5, 4.5);
        writeWrappedText(gap.reason, 9.5, 4.3);
        y += 3;
      });

      // Learning Roadmap
      drawSectionTitle("Learning Roadmap");

      result.learningRoadmap.forEach((phase) => {
        ensureSpace(26);
        doc.setFontSize(11.5);
        doc.setFont("helvetica", "bold");
        doc.text(`${phase.phase}: ${phase.title}`, margin, y);
        y += 6;
        writeMeta("Skills", phase.skills.join(", "), 9.5, 4.5);
        if (phase.projects.length) {
          writeMeta("Projects", phase.projects.join(", "), 9.5, 4.5);
        }
        y += 3;
      });

      // Timeline
      drawSectionTitle("Timeline");

      const timelineEntries: Array<{ label: string; value: string }> = [
        { label: "3 Months", value: result.timeline.threeMonths },
        { label: "6 Months", value: result.timeline.sixMonths },
        { label: "1 Year", value: result.timeline.oneYear },
      ];
      timelineEntries.forEach(({ label, value }) => {
        ensureSpace(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin, y);
        y += 5;
        writeWrappedText(value, 9.8, 4.8);
        y += 2;
      });

      // Certifications
      if (result.certifications.length) {
        drawSectionTitle("Recommended Certifications");
        result.certifications.forEach((cert) => {
          writeWrappedText(`- ${cert.name} - ${cert.provider} (${cert.relevance} relevance)`, 10, 5);
          y += 1;
        });
      }

      // Footer page numbers
      const totalPages = doc.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(120);
        doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
        doc.setTextColor(0);
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
