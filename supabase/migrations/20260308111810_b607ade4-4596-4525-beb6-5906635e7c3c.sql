
-- Add 'client' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- Booking sessions table
CREATE TABLE public.booking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  topic TEXT,
  company_name TEXT,
  meet_link TEXT,
  mentor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_sessions ENABLE ROW LEVEL SECURITY;

-- Clients can create and view their sessions
CREATE POLICY "Clients can create sessions" ON public.booking_sessions
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can view own sessions" ON public.booking_sessions
  FOR SELECT USING (auth.uid() = client_id);

-- Mentors can view and update sessions assigned to them
CREATE POLICY "Mentors can view their sessions" ON public.booking_sessions
  FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update their sessions" ON public.booking_sessions
  FOR UPDATE USING (auth.uid() = mentor_id);

-- Client-company selection table
CREATE TABLE public.client_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  target_role TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage their companies" ON public.client_companies
  FOR ALL USING (auth.uid() = client_id);

-- Mentor availability (meet link stored on profile)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meet_link TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Update trigger for booking_sessions
CREATE TRIGGER update_booking_sessions_updated_at
  BEFORE UPDATE ON public.booking_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
