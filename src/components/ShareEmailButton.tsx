import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, Send } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShareEmailButtonProps {
  result: AnalysisResult;
}

const ShareEmailButton = ({ result }: ShareEmailButtonProps) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!email.trim()) return;
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("share-report", {
        body: { email: email.trim(), result },
      });
      if (error) throw error;
      toast({ title: "Report sent!", description: `Analysis shared with ${email}` });
      setEmail("");
      setOpen(false);
    } catch (err: any) {
      console.error("Share error:", err);
      toast({ title: "Send failed", description: err.message || "Could not send email.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
          <Mail className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share Analysis Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Enter an email address to share this analysis report.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="bg-secondary border-border"
            />
            <Button onClick={handleSend} disabled={!email.trim() || isSending}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareEmailButton;
