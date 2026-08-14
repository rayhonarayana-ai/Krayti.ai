# Phase 02 — API Specification

## Supabase PostgREST API Endpoints

### 1. Read Learner Memory
* **Endpoint**: `GET /rest/v1/learner_memory`
* **Query Parameters**: `select=*&user_id=eq.{userId}`
* **Headers**:
  - `apikey`: `{VITE_SUPABASE_ANON_KEY}`
  - `Authorization`: `Bearer {JWT_ACCESS_TOKEN}`
* **Success Response (200 OK)**:
```json
[
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "user_id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "concept_mastery_scores": {
      "MATH-TEST": 0.7
    },
    "favorite_language": "ar",
    "past_exam_scores": [],
    "saved_notes": [],
    "created_at": "2026-08-06T19:40:00.000Z",
    "updated_at": "2026-08-06T19:40:00.000Z"
  }
]
```

### 2. Upsert Learner Memory Record
* **Endpoint**: `POST /rest/v1/learner_memory?on_conflict=user_id`
* **Headers**:
  - `apikey`: `{VITE_SUPABASE_ANON_KEY}`
  - `Authorization`: `Bearer {JWT_ACCESS_TOKEN}`
  - `Content-Type`: `application/json`
  - `Prefer`: `resolution=merge-duplicates, return=representation`
* **Request Payload**:
```json
{
  "user_id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
  "concept_mastery_scores": {
    "MATH-TEST": 0.7
  },
  "favorite_language": "ar",
  "past_exam_scores": [],
  "saved_notes": []
}
```
* **Error Response (401 Unauthorized / RLS Violation)**:
```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy for table \"learner_memory\""
}
```

## Repository Methods

### `SupabaseLongTermMemoryRepository`

#### `readMemory(userId: string): Promise<LearnerMemoryRecord | null>`
- **Request**: Query `public.learner_memory` for matching `user_id`.
- **Returns**: `LearnerMemoryRecord` domain object or `null` if no record exists.

#### `updateConceptMastery(userId: string, conceptId: string, score: number): Promise<void>`
- **Request**: Merges `{ [conceptId]: score }` into existing `concept_mastery_scores` map and executes `upsert`.

#### `saveNote(userId: string, noteContent: string): Promise<void>`
- **Request**: Appends `{ id, content, date }` to `saved_notes` JSON array and executes `upsert`.

#### `updateFavoriteLanguage(userId: string, language: string): Promise<void>`
- **Request**: Sets `favorite_language` and executes `upsert`.

#### `addPastExamScore(userId: string, examId: string, score: number): Promise<void>`
- **Request**: Appends `{ examId, score, date }` to `past_exam_scores` JSON array and executes `upsert`.
