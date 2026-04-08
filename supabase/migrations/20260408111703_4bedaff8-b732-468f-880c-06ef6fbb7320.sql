CREATE TABLE public.mentor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_recurring boolean NOT NULL DEFAULT true,
  specific_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can manage own availability"
  ON public.mentor_availability FOR ALL
  TO public
  USING (auth.uid() = mentor_id);

CREATE POLICY "Authenticated users can view availability"
  ON public.mentor_availability FOR SELECT
  TO authenticated
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_sessions;