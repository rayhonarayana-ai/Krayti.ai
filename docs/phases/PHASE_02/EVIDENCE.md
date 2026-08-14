# Phase 02 — Raw Forensic Evidence

## Evidence 1: Environment Variable Validation
```
[SUPABASE_CONFIG_CHECK_NODE] {
  url: 'https://aeubxjknpmsrsopcatyd.supabase.co/',
  key: 'sb_publish...'
}
[SUPABASE_CONFIG_CHECK] {
  urlIsPlaceholder: false,
  urlLength: 41,
  keyIsPlaceholder: false
}
```

## Evidence 2: Database Table Schema Verification Query
```json
--- TESTING SELECT ---
Status: 200
Error: null
Data: []
```

## Evidence 3: Supabase Auth Sign-Up and Sign-In Failure Log
```
--- ATTEMPTING SIGN IN ---
Sign in error: Invalid login credentials
--- ATTEMPTING SIGN UP ---
Sign up error: null
Sign up data user ID: 15572552-7d31-4084-8850-6dc042dcbe4c
Sign up session present: false
Sign up user created, trying sign in...
Retry sign in error: AuthApiError: Email not confirmed
    at handleError (/app/applet/node_modules/@supabase/auth-js/dist/main/lib/fetch.js:84:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async _handleRequest (/app/applet/node_modules/@supabase/auth-js/dist/main/lib/fetch.js:129:9)
    at async _request (/app/applet/node_modules/@supabase/auth-js/dist/main/lib/fetch.js:109:18)
    at async SupabaseAuthClient.signInWithPassword (/app/applet/node_modules/@supabase/auth-js/dist/main/GoTrueClient.js:920:23)
    {
      __isAuthError: true,
      status: 400,
      code: 'email_not_confirmed'
    }
No session acquired.
```

## Evidence 4: Supabase Anonymous Auth Attempt Log
```
--- TESTING ANONYMOUS SIGN IN ---
Anon sign in error: AuthApiError: Anonymous sign-ins are disabled
    at handleError (/app/applet/node_modules/@supabase/auth-js/dist/main/lib/fetch.js:84:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async _handleRequest (/app/applet/node_modules/@supabase/auth-js/dist/main/lib/fetch.js:129:9)
    at async _request (/app/applet/node_modules/@supabase/auth-js/dist/main/lib/fetch.js:109:18)
    at async SupabaseAuthClient.signInAnonymously (/app/applet/node_modules/@supabase/auth-js/dist/main/GoTrueClient.js:514:25)
    {
      __isAuthError: true,
      status: 422,
      code: 'anonymous_provider_disabled'
    }
Anon sign in session present: false
```

## Evidence 5: Unauthenticated Write RLS Rejection Payload
```
=== PHASE 1: AUTHENTICATION ===
Current authenticated user ID: None (Unauthenticated)
User email: None
Authentication state: ANONYMOUS / UNAUTHENTICATED
Access token present: No

=== PHASE 2 & 3: FIRST WRITE ATTEMPT & RAW EVIDENCE ===
HTTP Method: POST / PATCH (Supabase REST Upsert)
Request URL: https://aeubxjknpmsrsopcatyd.supabase.co/rest/v1/learner_memory?on_conflict=user_id
Request Body: {"user_id":"00000000-0000-0000-0000-000000000000","concept_mastery_scores":{"MATH-TEST":0.7},"favorite_language":"ar","past_exam_scores":[],"saved_notes":[]}
HTTP Status: 401
Response Body: null
Console Output / Error: {"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \"learner_memory\""}

=== PHASE 4: DATABASE VERIFICATION ===
Returned rows from SELECT * FROM public.learner_memory LIMIT 5:
[]

=== PHASE 5: WRITE FAILED ===
Exact Database Error: {"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \"learner_memory\""}
```

## Evidence 6: Database Migration File SQL Content
```sql
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
```
