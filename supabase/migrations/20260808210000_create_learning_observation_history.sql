-- Qarayti.ai — Sprint 2.6: Learning Observation History Schema Migration
-- Append-Only Observation History table with RLS Policies & Indexes

CREATE TABLE IF NOT EXISTS public.learning_observation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id text NOT NULL DEFAULT 'default',
  concept_id text NOT NULL,
  observation_type text NOT NULL,
  evidence_source text NOT NULL,
  source_event_id text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  previous_mastery numeric(4, 3) NULL,
  current_mastery numeric(4, 3) NOT NULL,
  delta numeric(4, 3) NULL,
  confidence numeric(4, 3) NOT NULL DEFAULT 1.000,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- Enable Row Level Security
ALTER TABLE public.learning_observation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can select their own observation history
CREATE POLICY "users read own observation history" ON public.learning_observation_history
  FOR SELECT TO authenticated USING (student_id = auth.uid());

-- RLS Policy: Users can insert their own observation history
CREATE POLICY "users insert own observation history" ON public.learning_observation_history
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- Enforce Append-Only Semantics: NO UPDATE or DELETE policies exist for authenticated users.

-- Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_obs_hist_student_concept ON public.learning_observation_history (student_id, concept_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_obs_hist_student_occurred ON public.learning_observation_history (student_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_obs_hist_idempotency ON public.learning_observation_history (idempotency_key);
