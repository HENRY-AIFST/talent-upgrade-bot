
-- Add one_word_description to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS one_word_description text;

-- Add denial_reason to booking_sessions
ALTER TABLE public.booking_sessions ADD COLUMN IF NOT EXISTS denial_reason text;
