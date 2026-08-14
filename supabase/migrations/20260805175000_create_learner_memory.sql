-- Qarayti.ai — Learner Memory Schema Migration
-- Creates learner_memory table with Row Level Security (RLS) policies

CREATE TABLE IF NOT EXISTS public.learner_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_mastery_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  favorite_language text NOT NULL DEFAULT 'ar',
  past_exam_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  saved_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learner_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own memory" ON public.learner_memory
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users insert own memory" ON public.learner_memory
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users update own memory" ON public.learner_memory
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_learner_memory_updated ON public.learner_memory;
CREATE TRIGGER trg_learner_memory_updated
  BEFORE UPDATE ON public.learner_memory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
