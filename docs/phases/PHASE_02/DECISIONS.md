# Phase 02 — Architecture & Design Decisions

## Record 001: Selection of Supabase (PostgreSQL) for Long-Term Learner Memory
* **Context**: Qarayti.ai requires durable cloud persistence for learner memory profiles, concept mastery scores, notes, and exam history across sessions.
* **Decision**: Adopt Supabase PostgreSQL with PostgREST client SDK as the primary relational persistence store.
* **Alternatives Considered**:
  - `localStorage` only (Rejected due to volatile nature and lack of cross-device syncing).
  - Firestore (Deferred in favor of relational SQL capabilities with PostgreSQL JSONB).
* **Reason**: Supabase provides immediate PostgreSQL capabilities, built-in Auth integration, and declarative Row Level Security (RLS).
* **Consequences**: User data must adhere to PostgreSQL schema design and RLS authorization policies.

## Record 002: JSONB Columns for Semi-Structured Memory Collections
* **Context**: Concept mastery maps and exam histories can vary in size and keys dynamically as new learning modules are introduced.
* **Decision**: Use `jsonb` column types for `concept_mastery_scores`, `past_exam_scores`, and `saved_notes` in `public.learner_memory`.
* **Alternatives Considered**:
  - Separate child relational tables (`learner_concept_scores`, `learner_notes`).
* **Reason**: Reduces query complexity for fetching a student's full long-term memory payload into a single record query while retaining queryable JSONB indexing capabilities in PostgreSQL.
* **Consequences**: Merging updates requires atomic JSONB merge logic in the repository layer.

## Record 003: Enforcement of Row Level Security (RLS)
* **Context**: Educational platform data privacy requires strict isolation between student records.
* **Decision**: Enable RLS on `public.learner_memory` with policies enforcing `user_id = auth.uid()`.
* **Alternatives Considered**:
  - Application-level filtering in API service.
* **Reason**: Application-level filtering is vulnerable to client tampering or API misconfigurations. RLS guarantees database-enforced security.
* **Consequences**: Unauthenticated queries or queries mismatched with JWT tokens are rejected with HTTP 401 / PostgreSQL error `42501`.
