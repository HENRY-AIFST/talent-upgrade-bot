
-- 1. Remove booking_sessions from realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.booking_sessions;
EXCEPTION WHEN undefined_object THEN
  NULL;
END$$;

-- 2. Restrict mentor roles to authenticated users only
DROP POLICY IF EXISTS "Anyone can view mentor roles" ON public.user_roles;
CREATE POLICY "Authenticated can view mentor roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role = 'mentor'::app_role);

-- 3. Add admin enum value
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END$$;

-- 4. Secure shared_analyses
DROP POLICY IF EXISTS "Anyone can view shared analyses by share_id" ON public.shared_analyses;

CREATE POLICY "Owners can view own shared analyses"
ON public.shared_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_shared_analysis(_share_id text)
RETURNS SETOF public.shared_analyses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.shared_analyses WHERE share_id = _share_id LIMIT 1;
$$;
