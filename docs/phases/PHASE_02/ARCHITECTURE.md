# Phase 02 — Architecture Documentation

## Architecture Decisions
1. **Decoupled Data Infrastructure**: Wrap Supabase client calls within repository classes implementing domain interfaces to shield UI and Domain logic from database SDK specifics.
2. **Postgres JSONB for Dynamic Mastery Maps**: Store concept mastery scores (`concept_mastery_scores`), past exam scores (`past_exam_scores`), and saved notes (`saved_notes`) as JSONB columns to allow flexible schema evolution without frequent DDL migrations.
3. **Database-Enforced User Isolation**: Enforce data security at the database level using PostgreSQL Row Level Security (RLS) linked to `auth.uid()`, preventing cross-user data leaks regardless of client-side queries.

## Layers Involved

```
+-------------------------------------------------------+
|                 Presentation Layer                    |
|             (React UI Components / Pages)             |
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|                    Domain Layer                       |
|  - ILongTermMemoryRepository (Interface)              |
|  - LearnerMemory / ConceptMastery (Models)            |
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|                Infrastructure Layer                   |
|  - SupabaseLongTermMemoryRepository (Implementation)  |
|  - SupabaseClient (SDK Client Instance)               |
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|               External Service Layer                  |
|          Supabase Cloud (PostgreSQL + RLS)            |
+-------------------------------------------------------+
```

## Modules
1. **Infrastructure Module** (`src/infrastructure/supabase/client.ts`): Parses environment configuration, validates URL formats, and instantiates the `@supabase/supabase-js` client.
2. **Memory Repository Module** (`src/core/faheem/memory/supabase-long-term-memory-repository.ts`): Handles CRUD operations against `public.learner_memory`.
3. **Memory Interface Module** (`src/core/faheem/memory/long-term-memory-interface.ts`): Defines the `ILongTermMemoryRepository` contract and data structures.
4. **Config & Startup Sequence** (`src/core/config/env.config.ts`, `src/core/startup/startup.sequence.ts`): Validates environment health and Supabase configuration status during application startup.

## Data Flow & Sequence Diagram

```
[User Action in UI]
       |
       v
[Learner Memory Service]
       |
       v
[ILongTermMemoryRepository Interface]
       |
       v
[SupabaseLongTermMemoryRepository]
       |
       | 1. Check auth session
       | 2. Execute upsert / select
       v
[Supabase Client SDK]
       |
       | HTTPS / REST (PostgREST)
       v
[Supabase PostgreSQL Database]
       |
       | Evaluates RLS Policy (user_id = auth.uid())
       v
[Returns Data / Error Payload]
```

## Dependency Graph
- `src/presentation/*` -> depends on `src/core/faheem/memory/long-term-memory-interface.ts`
- `src/core/faheem/memory/supabase-long-term-memory-repository.ts` -> implements `ILongTermMemoryRepository`
- `src/core/faheem/memory/supabase-long-term-memory-repository.ts` -> imports `supabase` from `src/infrastructure/supabase/client.ts`
- `src/infrastructure/supabase/client.ts` -> imports `createClient` from `@supabase/supabase-js`

## Interfaces

```typescript
export interface LearnerMemoryRecord {
  id?: string;
  userId: string;
  conceptMasteryScores: Record<string, number>;
  favoriteLanguage: string;
  pastExamScores: Array<{ examId: string; score: number; date: string }>;
  savedNotes: Array<{ id: string; content: string; date: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILongTermMemoryRepository {
  readMemory(userId: string): Promise<LearnerMemoryRecord | null>;
  updateConceptMastery(userId: string, conceptId: string, score: number): Promise<void>;
  saveNote(userId: string, noteContent: string): Promise<void>;
  updateFavoriteLanguage(userId: string, language: string): Promise<void>;
  addPastExamScore(userId: string, examId: string, score: number): Promise<void>;
}
```

## Repository Pattern & DI Usage
- Repository pattern isolates data mapping logic from business domain services.
- Concrete class `SupabaseLongTermMemoryRepository` encapsulates PostgREST calls and error handling.
- `DiContainer` (`src/core/di/di-container.ts`) manages singleton registration and resolution across the lifecycle.
