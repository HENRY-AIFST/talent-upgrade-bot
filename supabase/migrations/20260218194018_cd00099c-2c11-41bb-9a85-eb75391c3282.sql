
-- Create shared_analyses table for public shareable links
CREATE TABLE public.shared_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  user_id uuid NOT NULL,
  target_role text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_analyses ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared analyses (they're public by design)
CREATE POLICY "Anyone can view shared analyses"
ON public.shared_analyses FOR SELECT
USING (true);

-- Only authenticated users can create shares
CREATE POLICY "Users can create own shares"
ON public.shared_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares"
ON public.shared_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast lookup by share_id
CREATE INDEX idx_shared_analyses_share_id ON public.shared_analyses(share_id);
