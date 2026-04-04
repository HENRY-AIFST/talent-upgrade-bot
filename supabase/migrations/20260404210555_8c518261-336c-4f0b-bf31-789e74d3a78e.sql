
-- Allow admin to view all sessions
CREATE POLICY "Admin can view all sessions"
ON public.booking_sessions
FOR SELECT
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'rahul140706@gmail.com'
);
