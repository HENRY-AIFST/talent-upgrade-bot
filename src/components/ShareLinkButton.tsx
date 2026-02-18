import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult } from "@/types/analysis";

interface ShareLinkButtonProps {
  result: AnalysisResult;
  targetRole?: string;
}

const ShareLinkButton = ({ result, targetRole }: ShareLinkButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleShare = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to create shareable links.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shared_analyses")
        .insert({
          user_id: user.id,
          target_role: targetRole || "Unknown Role",
          result: result as any,
        })
        .select("share_id")
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/${data.share_id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Shareable link has been copied to your clipboard." });
      setTimeout(() => setCopied(false), 3000);
    } catch (err: any) {
      toast({ title: "Failed to create link", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} disabled={isLoading} className="border-border text-foreground">
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : copied ? (
        <Check className="h-4 w-4 mr-1.5 text-primary" />
      ) : (
        <Link2 className="h-4 w-4 mr-1.5" />
      )}
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
};

export default ShareLinkButton;
