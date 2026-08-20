/**
 * Qarayti.ai — Gate 06B.2A: Trusted Learning Evidence Ingestion Edge Function
 *
 * This function is the ONLY authorized path for persisting learning observations.
 * Browser clients cannot directly INSERT into learning_observation_history.
 *
 * SECURITY INVARIANTS:
 *   1. User identity is derived from verified JWT — NOT from request payload
 *   2. School membership is verified against trusted DB state — NOT from request payload
 *   3. service_role key is NEVER exposed to the browser
 *   4. No payload.studentId or payload.schoolId is trusted as authority
 *
 * TRUST BOUNDARY:
 *   Browser → [JWT validated here] → verified user_id → school membership verified → service_role INSERT
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvidenceIngestRequest {
  // Observation fields — these are the CLAIMS the browser is making
  conceptId: string;
  observationType: string;
  evidenceSource: string;
  sourceEventId: string;
  idempotencyKey: string;
  previousMastery: number | null;
  currentMastery: number;
  delta: number | null;
  confidence: number;
  metadata: Record<string, unknown>;
  occurredAt: string;
  // NOTE: studentId and schoolId are NOT accepted from the request body.
  // They are derived from verified JWT and school membership check.
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ============================================================
    // 1. Extract and validate JWT
    // ============================================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");

    // Create a Supabase client with the JWT to verify the user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // Verify JWT and extract user identity
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired JWT" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verifiedUserId = user.id;

    // ============================================================
    // 2. Parse request body
    // ============================================================
    const body: EvidenceIngestRequest = await req.json();

    // Validate required fields
    if (!body.conceptId || !body.observationType || !body.idempotencyKey || !body.occurredAt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: conceptId, observationType, idempotencyKey, occurredAt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================================
    // 3. Verify school membership against trusted DB state
    // ============================================================
    // The browser may claim a schoolId in metadata, but we must verify
    // the user actually has a STUDENT membership for that school.
    //
    // For this gate, we accept schoolId from metadata.schoolId (if provided)
    // and verify it against school_memberships. If not provided, we look up
    // the user's single STUDENT membership.
    //
    // FUTURE: This is where Gate 06B.2B+ validations will be inserted.

    const claimedSchoolId = body.metadata?.schoolId as string | undefined;

    // Use service_role client for DB queries (bypasses RLS)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let verifiedSchoolId: string | null = null;

    if (claimedSchoolId) {
      // Verify the claimed school membership exists
      const { data: membership, error: membershipError } = await supabaseAdmin
        .from("school_memberships")
        .select("school_id")
        .eq("user_id", verifiedUserId)
        .eq("school_id", claimedSchoolId)
        .eq("role", "STUDENT")
        .maybeSingle();

      if (membershipError || !membership) {
        return new Response(
          JSON.stringify({ error: "School membership verification failed" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      verifiedSchoolId = membership.school_id;
    } else {
      // No schoolId claimed — look up the user's single STUDENT membership
      const { data: memberships, error: listError } = await supabaseAdmin
        .from("school_memberships")
        .select("school_id")
        .eq("user_id", verifiedUserId)
        .eq("role", "STUDENT");

      if (listError) {
        return new Response(
          JSON.stringify({ error: "Failed to query school memberships" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!memberships || memberships.length === 0) {
        // No school membership — evidence blocked (fail-closed)
        return new Response(
          JSON.stringify({ error: "No STUDENT school membership found" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (memberships.length > 1) {
        // Multiple school memberships — cannot determine which school without explicit claim
        return new Response(
          JSON.stringify({ error: "Multiple school memberships — schoolId must be specified in metadata" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      verifiedSchoolId = memberships[0].school_id;
    }

    // ============================================================
    // 4. Insert observation using service_role (RLS bypassed)
    // ============================================================
    // studentId is ALWAYS derived from verified JWT — never from payload
    // schoolId is ALWAYS derived from verified school membership — never from payload

    const dbRecord = {
      student_id: verifiedUserId,                    // FROM VERIFIED JWT
      school_id: verifiedSchoolId,                   // FROM VERIFIED MEMBERSHIP
      tenant_id: "default",                          // Default tenant
      concept_id: body.conceptId,
      observation_type: body.observationType,
      evidence_source: body.evidenceSource,
      source_event_id: body.sourceEventId,
      idempotency_key: body.idempotencyKey,
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
      if (insertError.code === "23505" || insertError.message.includes("unique constraint")) {
        // Duplicate — fetch existing observation
        const { data: existing } = await supabaseAdmin
          .from("learning_observation_history")
          .select("id")
          .eq("idempotency_key", body.idempotencyKey)
          .maybeSingle();

        return new Response(
          JSON.stringify({ success: true, id: existing?.id, duplicate: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Insert failed: ${insertError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id, duplicate: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Internal error: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
