# Phase 02 — Known Limitations & Technical Debt

## Current Limitations
1. **Unauthenticated Access Restrictions**: Anonymous or unauthenticated sessions cannot persist records to `public.learner_memory` due to database Row Level Security (`user_id = auth.uid()`). Authenticated user login via Supabase Auth is required prior to memory persistence operations.
2. **Schema Cache Propagation**: PostgREST schema cache update delay may occasionally occur immediately after executing new DDL statements until cache refresh completes.

## Deferred Work
1. **Repository Injection Decoupling**: Direct concrete instantiation of `SupabaseLongTermMemoryRepository` inside `src/core/faheem/memory/long-term-memory-interface.ts` should be replaced with `DiContainer` resolution to adhere strictly to Dependency Inversion guidelines.
2. **Offline Local State Mirroring**: Local IndexedDB / LocalStorage fallback synchronization during offline network conditions deferred to subsequent phases.

## Technical Debt
- Single file interface instantiation pattern in `long-term-memory-interface.ts` (`export const longTermMemoryRepo = new SupabaseLongTermMemoryRepository();`).

## External Dependencies
- Supabase Cloud Service Availability (`https://aeubxjknpmsrsopcatyd.supabase.co`)
- Supabase Auth Service JWT token verification
