/**
 * Qarayti.ai — Gate 06B.2A.1: Hardened Trusted Learning Evidence Ingestion Edge Function
 *
 * This function is the ONLY authorized path for persisting learning observations.
 * Browser clients cannot directly INSERT into learning_observation_history.
 *
 * SECURITY INVARIANTS:
 *   1. User identity is derived from verified JWT — NOT from request payload
 *   2. School membership is verified against trusted DB state — NOT from request payload
 *   3. Idempotency key is derived server-side from verified identity — NOT from client
 *   4. service_role key is NEVER exposed to the browser
 *   5. No payload.studentId or payload.schoolId is trusted as authority
 *   6. Duplicate lookup scoped to verified student+school — no cross-user disclosure
 *   7. Raw DB errors never returned to browser
 *
 * TRUST BOUNDARY:
 *   Browser → [JWT validated here] → verified user_id → school membership verified
 *   → authoritative idempotency key derived → service_role INSERT
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvidenceIngestRequest {
  // Business identity component — used for replay protection
  // The Edge Function derives the full authoritative idempotency key
  // using verified user + school identity + this business key.
  businessKey: string;
  // Observation fields — these are the CLAIMS the browser is making
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
  // NOTE: studentId, schoolId, and idempotencyKey are NOT accepted from the request body.
  // They are derived from verified JWT and school membership check.
}

function jsonError(message: string, status: number, headers: Record<string, string> = corsHeaders): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...headers, "Content-Type": "application/json" } }
  );
}

serve(async (req: Request) => {
  // ============================================================
  // METHOD BOUNDARY: POST and OPTIONS only
  // ============================================================
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
    // 2. Parse request body
    // ============================================================
    const body: EvidenceIngestRequest = await req.json();

    if (!body.businessKey || !body.conceptId || !body.observationType || !body.occurredAt) {
      return jsonError("Bad request", 400);
    }

    // ============================================================
    // 3. Verify school membership against trusted DB state
    // ============================================================
    const claimedSchoolId = body.metadata?.schoolId as string | undefined;

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    // 4. Derive authoritative idempotency key (server-side only)
    // ============================================================
    // Client provides only the business identity component.
    // The Edge Function derives the full key using verified identity.
    // This ensures the key is ALWAYS bound to the verified student+school.
    const authoritativeKey = `${verifiedUserId}_${verifiedSchoolId}_${body.observationType}_${body.businessKey}`;

    // ============================================================
    // 5. Insert observation using service_role (RLS bypassed)
    // ============================================================
    const dbRecord = {
      student_id: verifiedUserId,
      school_id: verifiedSchoolId,
      tenant_id: "default",
      concept_id: body.conceptId,
      observation_type: body.observationType,
      evidence_source: body.evidenceSource,
      source_event_id: body.sourceEventId,
      idempotency_key: authoritativeKey,
      previous_mastery: body.previousMastery,
      current_mastery: body.currentMastery,
      delta: body.delta,
      confidence: body.confidence ?? 1.0,
      metadata: body.metadata || {},
      occurred_at: body.occurredAt,
    };

    const { data, error: insertError } = await supabaseAdmin
      .from("learning_observation_history")
      .insert(dbRecord)
      .select("id")
      .single();

    if (insertError) {
      // Handle idempotency key violation (PostgreSQL 23505)
      if (insertError.code === "23505") {
        // Duplicate — scoped to verified student+school
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

      // Log server-side, return generic error
      console.error(`[INGEST_EVIDENCE] Insert failed: ${insertError.message}`);
      return jsonError("Evidence persistence failed", 500);
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id, duplicate: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(`[INGEST_EVIDENCE] Internal error: ${err.message}`);
    return jsonError("Evidence persistence failed", 500);
  }
});
