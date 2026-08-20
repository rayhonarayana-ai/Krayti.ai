/**
 * Qarayti.ai — Supabase Learning Observation History Repository
 * Sprint 2.6: Append-Only Observation History Persistence Implementation
 *
 * Gate 06B.2A: Evidence persistence crosses trusted server boundary.
 * recordObservation() calls Edge Function (service_role INSERT).
 * Read operations use authenticated browser client (SELECT allowed).
 */

import { supabase } from '../../infrastructure/supabase/client';
import { logger } from '../logging/logger';
import { ILearningObservationRepository, LearningEvidenceObservation } from './observation-history-interface';

const metaEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || {};

function getEdgeFunctionUrl(): string {
  const supabaseUrl = (
    metaEnv.VITE_SUPABASE_URL ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    ''
  ).trim();

  if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
    return '';
  }

  const baseUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;
  return `${baseUrl}/functions/v1/ingest-evidence`;
}

export class SupabaseLearningObservationRepository implements ILearningObservationRepository {
  public async recordObservation(
    observation: LearningEvidenceObservation
  ): Promise<{ success: boolean; id?: string; duplicate?: boolean }> {
    const edgeFunctionUrl = getEdgeFunctionUrl();

    if (!edgeFunctionUrl) {
      logger.warn('SupabaseLearningObservationRepository', 'Edge Function URL not configured — evidence not persisted');
      return { success: false };
    }

    // Get the current session JWT for authorization
    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;

    if (!jwt) {
      logger.warn('SupabaseLearningObservationRepository', 'No active session — evidence not persisted');
      return { success: false };
    }

    // Call trusted Edge Function for evidence persistence
    // The Edge Function validates JWT, verifies school membership, and inserts via service_role
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          businessKey: observation.idempotencyKey,
          conceptId: observation.conceptId,
          observationType: observation.observationType,
          evidenceSource: observation.evidenceSource,
          sourceEventId: observation.sourceEventId,
          previousMastery: observation.previousMastery,
          currentMastery: observation.currentMastery,
          delta: observation.delta,
          confidence: observation.confidence,
          metadata: observation.metadata || {},
          occurredAt: observation.occurredAt,
          // NOTE: studentId, schoolId, and idempotencyKey are NOT sent — derived by Edge Function from JWT + membership
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
        logger.error('SupabaseLearningObservationRepository', `Edge Function error (${response.status}): ${errorBody.error}`);
        return { success: false };
      }

      const result = await response.json();
      logger.info('SupabaseLearningObservationRepository', `Recorded observation [${result.id}] for student via Edge Function`);
      return { success: true, id: result.id, duplicate: result.duplicate };

    } catch (err: any) {
      logger.error('SupabaseLearningObservationRepository', `Edge Function call failed: ${err.message}`);
      return { success: false };
    }
  }

  public async getObservationsForStudent(
    studentId: string,
    limit: number = 50
  ): Promise<LearningEvidenceObservation[]> {
    const { data, error } = await supabase
      .from('learning_observation_history')
      .select('*')
      .eq('student_id', studentId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('SupabaseLearningObservationRepository', `Failed to fetch student observations: ${error.message}`);
      throw new Error(`Failed to fetch student observations: ${error.message}`);
    }

    return (data || []).map(this.mapDbToModel);
  }

  public async getObservationsForConcept(
    studentId: string,
    conceptId: string,
    limit: number = 20
  ): Promise<LearningEvidenceObservation[]> {
    const { data, error } = await supabase
      .from('learning_observation_history')
      .select('*')
      .eq('student_id', studentId)
      .eq('concept_id', conceptId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('SupabaseLearningObservationRepository', `Failed to fetch concept observations: ${error.message}`);
      throw new Error(`Failed to fetch concept observations: ${error.message}`);
    }

    return (data || []).map(this.mapDbToModel);
  }

  public async getObservationByIdempotencyKey(
    idempotencyKey: string
  ): Promise<LearningEvidenceObservation | null> {
    const { data, error } = await supabase
      .from('learning_observation_history')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (error) {
      logger.error('SupabaseLearningObservationRepository', `Failed to fetch observation by idempotency key: ${error.message}`);
      return null;
    }

    return data ? this.mapDbToModel(data) : null;
  }

  private mapDbToModel(row: Record<string, any>): LearningEvidenceObservation {
    return {
      id: row.id,
      studentId: row.student_id,
      tenantId: row.tenant_id,
      schoolId: row.school_id || null,
      conceptId: row.concept_id,
      observationType: row.observation_type,
      evidenceSource: row.evidence_source,
      sourceEventId: row.source_event_id,
      idempotencyKey: row.idempotency_key,
      previousMastery: row.previous_mastery !== null ? Number(row.previous_mastery) : null,
      currentMastery: Number(row.current_mastery),
      delta: row.delta !== null ? Number(row.delta) : null,
      confidence: Number(row.confidence),
      metadata: row.metadata || {},
      occurredAt: row.occurred_at,
      recordedAt: row.recorded_at,
    };
  }
}

export const observationHistoryRepo = new SupabaseLearningObservationRepository();
