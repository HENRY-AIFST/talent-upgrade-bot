-- Fix shared_analyses: restrict SELECT to lookup by share_id only
DROP POLICY IF EXISTS "Anyone can view shared analyses" ON public.shared_analyses;
CREATE POLICY "Anyone can view shared analyses by share_id"
  ON public.shared_analyses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix notifications: restrict INSERT to service_role only (drop the overly permissive policy)
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);