
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('mentor', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Mentor students linking table
CREATE TABLE public.mentor_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, student_id)
);
ALTER TABLE public.mentor_students ENABLE ROW LEVEL SECURITY;

-- Mentors can view their students
CREATE POLICY "Mentors can view their students" ON public.mentor_students
  FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can add students" ON public.mentor_students
  FOR INSERT WITH CHECK (auth.uid() = mentor_id AND public.has_role(auth.uid(), 'mentor'));

CREATE POLICY "Mentors can remove students" ON public.mentor_students
  FOR DELETE USING (auth.uid() = mentor_id AND public.has_role(auth.uid(), 'mentor'));

-- Students can see their mentor relationship
CREATE POLICY "Students can view their mentor" ON public.mentor_students
  FOR SELECT USING (auth.uid() = student_id);

-- Mentor tasks table for assigning tasks to students
CREATE TABLE public.mentor_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'study',
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can manage their tasks" ON public.mentor_tasks
  FOR ALL USING (auth.uid() = mentor_id);

CREATE POLICY "Students can view their tasks" ON public.mentor_tasks
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their tasks" ON public.mentor_tasks
  FOR UPDATE USING (auth.uid() = student_id);

-- Allow mentors to view their students' profiles
CREATE POLICY "Mentors can view student profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mentor_students ms
      WHERE ms.mentor_id = auth.uid() AND ms.student_id = profiles.user_id
    )
  );

-- Allow mentors to view their students' analyses
CREATE POLICY "Mentors can view student analyses" ON public.saved_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mentor_students ms
      WHERE ms.mentor_id = auth.uid() AND ms.student_id = saved_analyses.user_id
    )
  );
