
-- Assign admin role to the admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'rahul140706@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Replace hardcoded email policy with role-based check
DROP POLICY IF EXISTS "Admin can view all sessions" ON public.booking_sessions;
CREATE POLICY "Admin can view all sessions"
ON public.booking_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
