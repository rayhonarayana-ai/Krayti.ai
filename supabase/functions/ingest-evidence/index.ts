/**
 * Qarayti.ai — Gate 06B.2B.2: Trusted Exercise Verification Edge Function
 *
 * This function is the ONLY authorized path for persisting learning observations.
 * Browser clients cannot directly INSERT into learning_observation_history.
 *
 * TRUST BOUNDARY (exercise path):
 *   Browser submits raw interaction facts → Edge validates JWT → verifies school membership
 *   → resolves canonical exercise → derives curriculum identity → grades server-side
 *   → constructs authoritative observation → service_role INSERT
 *
 * TRUST BOUNDARY (non-exercise path):
 *   Existing Gate 06B.2A.1 behavior for LESSON_FINISHED, ADAPTIVE_GAP_REMEDIATED, etc.
 *
 * SECURITY INVARIANTS:
 *   1. User identity is derived from verified JWT — NOT from request payload
 *   2. School membership is verified against trusted DB state — NOT from request payload
 *   3. Idempotency key is derived server-side from verified identity — NOT from client
 *   4. service_role key is NEVER exposed to the browser
 *   5. No payload.studentId or payload.schoolId is trusted as authority
 *   6. For exercises: conceptId, KO, competency, subject, isCorrect all derived server-side
 *   7. Client isCorrect is NEVER accepted — grading is server-side only
 *   8. Unresolved exercises (ko_id IS NULL) fail closed for authoritative evidence
 *   9. Non-deterministic grading modes fail closed
 *  10. NO_COMPETENCY_MAPPING is never generated for verified exercise interactions
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// EXERCISE VERIFICATION CONTRACT (Gate 06B.2B.2)
// Browser sends ONLY raw interaction facts.
// Everything else is derived server-side.
// ============================================================
interface ExerciseEvidenceRequest {
  exerciseCode: string;    // canonical exercise code (public identifier)
  answer: string;          // student's answer (raw text)
  submissionId: string;    // for idempotency (business key)
  schoolId?: string;       // optional claimed school
}

// ============================================================
// NON-EXERCISE CONTRACT (Gate 06B.2A.1 — existing behavior)
// For LESSON_FINISHED, ADAPTIVE_GAP_REMEDIATED, ADAPTIVE_SKILL_MASTERED
// ============================================================
interface LegacyEvidenceRequest {
  businessKey: string;
  conceptId: string;
  observationType: string;
  evidenceSource: string;
  sourceEventId: string;
  previousMastery: number | null;
  currentMastery: number;
  delta: number | null;
  confidence: number;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

function jsonError(message: string, status: number, headers: Record<string, string> = corsHeaders): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...headers, "Content-Type": "application/json" } }
  );
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  try {
    // ============================================================
    // 1. Extract and validate JWT
    // ============================================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonError("Unauthorized", 401);
    }

    const jwt = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return jsonError("Unauthorized", 401);
    }

    const verifiedUserId = user.id;

    // ============================================================
    // 2. Parse request body and determine path
    // ============================================================
    const body = await req.json();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ============================================================
    // 3. Verify school membership (shared by both paths)
    // ============================================================
    const claimedSchoolId = body.schoolId || body.metadata?.schoolId as string | undefined;

    let verifiedSchoolId: string | null = null;

    if (claimedSchoolId) {
      const { data: membership } = await supabaseAdmin
        .from("school_memberships")
        .select("school_id")
        .eq("user_id", verifiedUserId)
        .eq("school_id", claimedSchoolId)
        .eq("role", "STUDENT")
        .maybeSingle();

      if (!membership) {
        return jsonError("Forbidden", 403);
      }

      verifiedSchoolId = membership.school_id;
    } else {
      const { data: memberships } = await supabaseAdmin
        .from("school_memberships")
        .select("school_id")
        .eq("user_id", verifiedUserId)
        .eq("role", "STUDENT");

      if (!memberships || memberships.length === 0) {
        return jsonError("Forbidden", 403);
      }

      if (memberships.length > 1) {
        return jsonError("Forbidden", 403);
      }

      verifiedSchoolId = memberships[0].school_id;
    }

    // ============================================================
    // 4. ROUTE: Exercise Verification Path (Gate 06B.2B.2)
    // ============================================================
    if (body.exerciseCode && typeof body.exerciseCode === "string") {
      return await handleExerciseVerification({
        supabaseAdmin,
        verifiedUserId,
        verifiedSchoolId,
        exerciseCode: body.exerciseCode,
        answer: typeof body.answer === "string" ? body.answer : "",
        submissionId: typeof body.submissionId === "string" ? body.submissionId : "",
      });
    }

    // ============================================================
    // 5. ROUTE: Legacy Non-Exercise Path (Gate 06B.2A.1)
    // ============================================================
    return await handleLegacyEvidence({
      supabaseAdmin,
      verifiedUserId,
      verifiedSchoolId,
      body,
    });

  } catch (err) {
    console.error(`[INGEST_EVIDENCE] Internal error: ${err.message}`);
    return jsonError("Evidence persistence failed", 500);
  }
});

// ============================================================
// EXERCISE VERIFICATION PATH (Gate 06B.2B.2)
// ============================================================
async function handleExerciseVerification(params: {
  supabaseAdmin: ReturnType<typeof createClient>;
  verifiedUserId: string;
  verifiedSchoolId: string | null;
  exerciseCode: string;
  answer: string;
  submissionId: string;
}): Promise<Response> {
  const { supabaseAdmin, verifiedUserId, verifiedSchoolId, exerciseCode, answer, submissionId } = params;

  // ----------------------------------------------------------
  // 4a. Resolve canonical exercise from registry
  // ----------------------------------------------------------
  const { data: exercise, error: exerciseError } = await supabaseAdmin
    .from("curriculum_exercises")
    .select("id, code, subject_id, ko_id, exercise_type, prompt, grading_type, is_active")
    .eq("code", exerciseCode)
    .maybeSingle();

  if (exerciseError || !exercise) {
    console.error(`[INGEST_EVIDENCE] Exercise not found: ${exerciseCode}`);
    return jsonError("Exercise not found in canonical registry", 422);
  }

  if (!exercise.is_active) {
    return jsonError("Exercise is not active", 422);
  }

  // ----------------------------------------------------------
  // 4b. Fail closed: unresolved exercise (no KO mapping)
  // ----------------------------------------------------------
  if (!exercise.ko_id) {
    console.error(`[INGEST_EVIDENCE] Exercise has no KO mapping: ${exerciseCode}`);
    return jsonError("Exercise not yet mapped to curriculum — authoritative evidence unavailable", 422);
  }

  // ----------------------------------------------------------
  // 4c. Resolve KO → Subject
  // ----------------------------------------------------------
  const { data: ko, error: koError } = await supabaseAdmin
    .from("curriculum_knowledge_objects")
    .select("id, code, title, subject_id, curriculum_subjects!inner(code, title)")
    .eq("id", exercise.ko_id)
    .maybeSingle();

  if (koError || !ko) {
    console.error(`[INGEST_EVIDENCE] KO not found for exercise: ${exerciseCode}`);
    return jsonError("Curriculum derivation failed", 500);
  }

  // ----------------------------------------------------------
  // 4d. Resolve KO → Competencies
  // ----------------------------------------------------------
  const { data: koCompetencies } = await supabaseAdmin
    .from("curriculum_ko_competencies")
    .select("curriculum_competencies!inner(code, title)")
    .eq("ko_id", exercise.ko_id);

  const competencyList = (koCompetencies || []).map(
    (kc: any) => ({ code: kc.curriculum_competencies.code, title: kc.curriculum_competencies.title })
  );

  // ----------------------------------------------------------
  // 4e. Resolve grading authority
  // ----------------------------------------------------------
  const { data: grading, error: gradingError } = await supabaseAdmin
    .from("curriculum_exercise_grading")
    .select("exercise_id, correct_answer, rubric_criteria")
    .eq("exercise_id", exercise.id)
    .maybeSingle();

  if (gradingError || !grading) {
    console.error(`[INGEST_EVIDENCE] Grading authority missing for exercise: ${exerciseCode}`);
    return jsonError("Grading authority missing — evidence cannot be verified", 500);
  }

  // ----------------------------------------------------------
  // 4f. Fail closed: non-deterministic grading modes
  // ----------------------------------------------------------
  if (exercise.grading_type === "RUBRIC" || exercise.grading_type === "OPEN_ENDED") {
    console.error(`[INGEST_EVIDENCE] Non-deterministic grading mode: ${exercise.grading_type} for ${exerciseCode}`);
    return jsonError("Exercise requires non-deterministic grading — authoritative evidence unavailable", 422);
  }

  if (!grading.correct_answer && grading.correct_answer !== "") {
    console.error(`[INGEST_EVIDENCE] No correct answer in grading authority: ${exerciseCode}`);
    return jsonError("Grading authority incomplete — evidence cannot be verified", 422);
  }

  // ----------------------------------------------------------
  // 4g. Server-side grading (EXACT_ANSWER only)
  // ----------------------------------------------------------
  const normalizedAnswer = answer.trim().toLowerCase();
  const normalizedCorrect = grading.correct_answer.trim().toLowerCase();
  const isCorrect = normalizedAnswer === normalizedCorrect;

  // ----------------------------------------------------------
  // 4h. CURRICULUM_DATA_QUALITY_WARNING for q-math-002
  // ----------------------------------------------------------
  const dataQualityWarning = exerciseCode === "q-math-002"
    ? "CURRICULUM_DATA_QUALITY_WARNING: Exercise content (complex numbers) does not match mapped KO (dichotomy). Semantic correctness unverified."
    : undefined;

  // ----------------------------------------------------------
  // 4i. Construct authoritative observation
  // Gate 06B.2B.2.1: currentMastery = 0 (neutral sentinel)
  // A single exercise outcome is NOT concept mastery.
  // interactionResult records the factual verified outcome.
  // ----------------------------------------------------------
  const conceptId = ko.code;
  const subjectCode = (ko as any).curriculum_subjects?.code || "UNKNOWN";
  const exerciseBusinessId = submissionId || `exercise-${exerciseCode}-${Date.now()}`;
  const authoritativeKey = `${verifiedUserId}_${verifiedSchoolId}_EXERCISE_COMPLETION_${exerciseBusinessId}`;

  const metadata: Record<string, unknown> = {
    exerciseCode: exercise.code,
    exerciseType: exercise.exercise_type,
    gradingType: exercise.grading_type,
    subjectCode,
    koCode: ko.code,
    koTitle: ko.title,
    competencyCodes: competencyList.map((c) => c.code),
    // Gate 06B.2B.2.1: verified interaction outcome (NOT mastery)
    // Stored in metadata to avoid schema migration on historical table
    interactionResult: isCorrect ? "CORRECT" : "INCORRECT",
    serverGraded: true,
    evidenceSource: "TRUSTED_SERVER",
  };

  if (dataQualityWarning) {
    metadata.dataQualityWarning = dataQualityWarning;
  }

  const dbRecord = {
    student_id: verifiedUserId,
    school_id: verifiedSchoolId,
    tenant_id: "default",
    concept_id: conceptId,
    observation_type: "EXERCISE_COMPLETION",
    evidence_source: "TRUSTED_SERVER",
    source_event_id: `exercise-verify-${exerciseCode}-${Date.now()}`,
    idempotency_key: authoritativeKey,
    previous_mastery: null,
    current_mastery: 0,
    delta: null,
    // Gate 06B.2B.2.1: confidence = grading determinism (1.0 for exact match),
    // NOT learner mastery confidence. These are different concepts.
    confidence: 1.0,
    metadata,
    occurred_at: new Date().toISOString(),
  };

  // ----------------------------------------------------------
  // 4j. Insert via service_role (RLS bypassed)
  // ----------------------------------------------------------
  const { data, error: insertError } = await supabaseAdmin
    .from("learning_observation_history")
    .insert(dbRecord)
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existing } = await supabaseAdmin
        .from("learning_observation_history")
        .select("id")
        .eq("idempotency_key", authoritativeKey)
        .eq("student_id", verifiedUserId)
        .eq("school_id", verifiedSchoolId)
        .maybeSingle();

      return new Response(
        JSON.stringify({ success: true, id: existing?.id, duplicate: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.error(`[INGEST_EVIDENCE] Insert failed: ${insertError.message}`);
    return jsonError("Evidence persistence failed", 500);
  }

  return new Response(
    JSON.stringify({
      success: true,
      id: data?.id,
      duplicate: false,
      verified: {
        exerciseCode: exercise.code,
        subjectCode,
        koCode: ko.code,
        competencies: competencyList.map((c) => c.code),
        interactionResult: isCorrect ? "CORRECT" : "INCORRECT",
        gradedBy: "TRUSTED_SERVER",
      },
      ...(dataQualityWarning ? { dataQualityWarning } : {}),
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ============================================================
// LEGACY NON-EXERCISE PATH (Gate 06B.2A.1 — unchanged)
// ============================================================
async function handleLegacyEvidence(params: {
  supabaseAdmin: ReturnType<typeof createClient>;
  verifiedUserId: string;
  verifiedSchoolId: string | null;
  body: Record<string, unknown>;
}): Promise<Response> {
  const { supabaseAdmin, verifiedUserId, verifiedSchoolId, body } = params;

  const businessKey = body.businessKey as string;
  const conceptId = body.conceptId as string;
  const observationType = body.observationType as string;
  const evidenceSource = body.evidenceSource as string;
  const sourceEventId = body.sourceEventId as string;
  const previousMastery = body.previousMastery as number | null;
  const currentMastery = body.currentMastery as number;
  const delta = body.delta as number | null;
  const confidence = (body.confidence as number) ?? 1.0;
  const metadata = (body.metadata as Record<string, unknown>) || {};
  const occurredAt = body.occurredAt as string;

  if (!businessKey || !conceptId || !observationType || !occurredAt) {
    return jsonError("Bad request", 400);
  }

  const authoritativeKey = `${verifiedUserId}_${verifiedSchoolId}_${observationType}_${businessKey}`;

  const dbRecord = {
    student_id: verifiedUserId,
    school_id: verifiedSchoolId,
    tenant_id: "default",
    concept_id: conceptId,
    observation_type: observationType,
    evidence_source: evidenceSource,
    source_event_id: sourceEventId,
    idempotency_key: authoritativeKey,
    previous_mastery: previousMastery,
    current_mastery: currentMastery,
    delta,
    confidence,
    metadata,
    occurred_at: occurredAt,
  };

  const { data, error: insertError } = await supabaseAdmin
    .from("learning_observation_history")
    .insert(dbRecord)
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existing } = await supabaseAdmin
        .from("learning_observation_history")
        .select("id")
        .eq("idempotency_key", authoritativeKey)
        .eq("student_id", verifiedUserId)
        .eq("school_id", verifiedSchoolId)
        .maybeSingle();

      return new Response(
        JSON.stringify({ success: true, id: existing?.id, duplicate: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.error(`[INGEST_EVIDENCE] Insert failed: ${insertError.message}`);
    return jsonError("Evidence persistence failed", 500);
  }

  return new Response(
    JSON.stringify({ success: true, id: data?.id, duplicate: false }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
