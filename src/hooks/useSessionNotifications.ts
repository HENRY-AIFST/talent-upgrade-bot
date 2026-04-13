import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook that polls booking_sessions for status changes
 * and shows toast notifications when a session is approved or denied.
 */
export const useSessionNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const lastCheckRef = useRef<string>(new Date().toISOString());

  const checkUpdates = useCallback(async () => {
    if (!user) return;
    const since = lastCheckRef.current;
    lastCheckRef.current = new Date().toISOString();

    const { data } = await supabase
      .from("booking_sessions")
      .select("status, requested_date, meet_link, denial_reason")
      .eq("client_id", user.id)
      .gt("updated_at", since)
      .in("status", ["approved", "denied"]);

    if (!data) return;
    for (const s of data) {
      if (s.status === "approved") {
        toast({
          title: "🎉 Session Approved!",
          description: `Your session on ${s.requested_date} has been approved. ${s.meet_link ? "A meet link is ready!" : ""}`,
        });
      } else if (s.status === "denied") {
        toast({
          title: "Session Denied",
          description: s.denial_reason
            ? `Reason: ${s.denial_reason}`
            : "Your session request was denied by the mentor.",
          variant: "destructive",
        });
      }
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkUpdates, 15000);
    return () => clearInterval(interval);
  }, [user, checkUpdates]);
};

/**
 * Hook for mentors to get notified of new session requests via polling.
 */
export const useMentorSessionNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const lastCheckRef = useRef<string>(new Date().toISOString());

  const checkNewRequests = useCallback(async () => {
    if (!user) return;
    const since = lastCheckRef.current;
    lastCheckRef.current = new Date().toISOString();

    const { data } = await supabase
      .from("booking_sessions")
      .select("requested_date, requested_time, topic")
      .eq("mentor_id", user.id)
      .eq("status", "pending")
      .gt("created_at", since);

    if (!data) return;
    for (const s of data) {
      toast({
        title: "📅 New Session Request!",
        description: `New request for ${s.requested_date} at ${s.requested_time}${s.topic ? ` — ${s.topic}` : ""}`,
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkNewRequests, 15000);
    return () => clearInterval(interval);
  }, [user, checkNewRequests]);
};
