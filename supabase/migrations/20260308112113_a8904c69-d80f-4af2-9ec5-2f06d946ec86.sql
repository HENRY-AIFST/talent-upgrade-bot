
-- Allow all authenticated users to see mentor roles (so clients can browse mentors)
CREATE POLICY "Anyone can view mentor roles" ON public.user_roles
  FOR SELECT USING (role = 'mentor');

-- Allow all authenticated users to view mentor profiles
CREATE POLICY "Anyone can view mentor profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur WHERE ur.user_id = profiles.user_id AND ur.role = 'mentor'
    )
  );
