
-- Placement plans table
CREATE TABLE public.placement_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  target_role TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 30,
  plan JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.placement_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON public.placement_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plans" ON public.placement_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.placement_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.placement_plans FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_placement_plans_updated_at
BEFORE UPDATE ON public.placement_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Daily tasks table
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.placement_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'study',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.daily_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.daily_tasks FOR DELETE USING (auth.uid() = user_id);

-- Index for efficient querying
CREATE INDEX idx_daily_tasks_plan_day ON public.daily_tasks(plan_id, day_number);
