import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook that listens for real-time changes to booking_sessions
 * and shows toast notifications when a session is approved or denied.
 * Should be used in the client dashboard or any page where users want live updates.
 */
export const useSessionNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("session-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booking_sessions",
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;

          // Only notify if status actually changed
          if (newRecord.status === oldRecord.status) return;

          if (newRecord.status === "approved") {
            toast({
              title: "🎉 Session Approved!",
              description: `Your session on ${newRecord.requested_date} has been approved. ${newRecord.meet_link ? "A meet link is ready!" : ""}`,
            });
          } else if (newRecord.status === "denied") {
            toast({
              title: "Session Denied",
              description: newRecord.denial_reason
                ? `Reason: ${newRecord.denial_reason}`
                : "Your session request was denied by the mentor.",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
};

/**
 * Hook for mentors to get notified of new session requests in real-time.
 */
export const useMentorSessionNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("mentor-session-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_sessions",
          filter: `mentor_id=eq.${user.id}`,
        },
        (payload) => {
          const newSession = payload.new as any;
          toast({
            title: "📅 New Session Request!",
            description: `New request for ${newSession.requested_date} at ${newSession.requested_time}${newSession.topic ? ` — ${newSession.topic}` : ""}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
};
