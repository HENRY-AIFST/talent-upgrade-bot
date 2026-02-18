import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Linkedin, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LinkedInImportProps {
  onSkillsImported: (skills: string[], profileText: string) => void;
}

const LinkedInImport = ({ onSkillsImported }: LinkedInImportProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isValidLinkedInUrl = (u: string) =>
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?/.test(u.trim());

  const handleImport = async () => {
    if (!isValidLinkedInUrl(url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid LinkedIn profile URL.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-linkedin", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const skills: string[] = data.skills || [];
      const profileText: string = data.profileText || "";

      if (skills.length === 0 && !profileText) {
        throw new Error("Could not extract skills. LinkedIn profiles are often private. Try pasting your resume text instead.");
      }

      onSkillsImported(skills, profileText);
      toast({ title: "Skills imported!", description: `Extracted ${skills.length} skills from your profile.` });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message || "Could not import from LinkedIn.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex gap-2">
        <Input
          placeholder="https://linkedin.com/in/your-profile"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button
          onClick={handleImport}
          disabled={isLoading || !url.trim()}
          className="gradient-primary text-primary-foreground shrink-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Linkedin className="h-4 w-4 mr-1.5" />}
          {isLoading ? "Importing..." : "Import"}
        </Button>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
        <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          LinkedIn profiles must be public for skill extraction. If import fails, try pasting your resume or profile text directly.
        </p>
      </div>
    </div>
  );
};

export default LinkedInImport;
