-- Mentor profile/tag rename request workflow
CREATE TABLE IF NOT EXISTS public.mentor_profile_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_display_name TEXT NOT NULL,
  requested_tag TEXT NOT NULL,
  requested_title TEXT,
  requested_company TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_profile_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can create own profile change requests"
ON public.mentor_profile_change_requests
FOR INSERT
WITH CHECK (
  auth.uid() = mentor_id
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'mentor'
  )
);

CREATE POLICY "Mentors can view own profile change requests"
ON public.mentor_profile_change_requests
FOR SELECT
USING (auth.uid() = mentor_id);

CREATE TRIGGER update_mentor_profile_change_requests_updated_at
BEFORE UPDATE ON public.mentor_profile_change_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
