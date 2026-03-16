
CREATE TABLE public.ats_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_role TEXT,
  file_name TEXT,
  ats_score INTEGER NOT NULL DEFAULT 0,
  keyword_match INTEGER NOT NULL DEFAULT 0,
  format_score INTEGER NOT NULL DEFAULT 0,
  experience_relevance INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  missing_keywords TEXT[] DEFAULT '{}',
  section_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ats_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ats scores" ON public.ats_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ats scores" ON public.ats_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ats scores" ON public.ats_scores FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_ats_scores_user_id ON public.ats_scores(user_id);
CREATE INDEX idx_ats_scores_created_at ON public.ats_scores(created_at DESC);
