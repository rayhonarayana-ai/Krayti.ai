# Phase 02 — Database Specification

## Tables

### `public.learner_memory`

| Column | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | No | `gen_random_uuid()` | `PRIMARY KEY` | Unique record identifier |
| `user_id` | `uuid` | No | None | `UNIQUE`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Associated Supabase Auth user ID |
| `concept_mastery_scores` | `jsonb` | No | `'{}'::jsonb` | None | Map of concept IDs to mastery scores (0.0 to 1.0) |
| `favorite_language` | `text` | No | `'ar'` | None | Preferred UI/learning language |
| `past_exam_scores` | `jsonb` | No | `'[]'::jsonb` | None | Array of exam history objects |
| `saved_notes` | `jsonb` | No | `'[]'::jsonb` | None | Array of user-saved notes |
| `created_at` | `timestamptz` | No | `now()` | None | Record creation timestamp |
| `updated_at` | `timestamptz` | No | `now()` | None | Record last modification timestamp |

## Indexes & Unique Constraints
- `learner_memory_user_id_key`: `UNIQUE INDEX ON public.learner_memory(user_id)`

## Row Level Security (RLS) Policies

Row Level Security is enabled on `public.learner_memory`.

1. **`users read own memory`**
   - Operation: `SELECT`
   - Target Role: `authenticated`
   - Policy Expression: `(user_id = auth.uid())`

2. **`users insert own memory`**
   - Operation: `INSERT`
   - Target Role: `authenticated`
   - Policy Expression (WITH CHECK): `(user_id = auth.uid())`

3. **`users update own memory`**
   - Operation: `UPDATE`
   - Target Role: `authenticated`
   - Policy Expression (USING & WITH CHECK): `(user_id = auth.uid())`

## Triggers & Functions

### Function: `public.set_updated_at()`
```sql
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### Trigger: `trg_learner_memory_updated`
```sql
CREATE TRIGGER trg_learner_memory_updated
  BEFORE UPDATE ON public.learner_memory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

## Migrations

### Migration `20260805175000_create_learner_memory.sql`
- **Execution Order**: 1
- **File**: `supabase/migrations/20260805175000_create_learner_memory.sql`
- **Applied Status**: Applied on target Supabase project (`https://aeubxjknpmsrsopcatyd.supabase.co`)

## Rollback Strategy
```sql
DROP TRIGGER IF EXISTS trg_learner_memory_updated ON public.learner_memory;
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP TABLE IF EXISTS public.learner_memory;
```

## Current Schema Snapshot
```sql
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
```
