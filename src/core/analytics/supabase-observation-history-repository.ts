/**
 * Qarayti.ai — Supabase Learning Observation History Repository
 * Sprint 2.6: Append-Only Observation History Persistence Implementation
 *
 * Gate 06B.2A: Evidence persistence crosses trusted server boundary.
 * recordObservation() calls Edge Function (service_role INSERT).
 * Read operations use authenticated browser client (SELECT allowed).
 *
 * Gate 06B.2B.2: submitExerciseEvidence() sends raw interaction facts to Edge Function.
 * Edge Function resolves canonical exercise, derives curriculum, grades server-side.
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

/**
 * Gate 06B.2B.2: Raw exercise interaction contract.
 * Browser sends ONLY these fields. Everything else derived server-side.
 */
export interface ExerciseSubmissionRequest {
  exerciseCode: string;
  answer: string;
  submissionId: string;
  schoolId?: string;
}

/**
 * Gate 06B.2B.2.1: Server-verified exercise evidence result.
 */
export interface ExerciseVerificationResult {
  verified: {
    exerciseCode: string;
    subjectCode: string;
    koCode: string;
    competencies: string[];
    interactionResult: 'CORRECT' | 'INCORRECT';
    gradedBy: string;
  };
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

  /**
   * Gate 06B.2B.2: Submit raw exercise interaction to trusted Edge Function.
   * Edge Function resolves canonical exercise, derives curriculum, grades server-side.
   * Browser does NOT send conceptId, isCorrect, mastery, or any educational claims.
   */
  public async submitExerciseEvidence(
    submission: ExerciseSubmissionRequest
  ): Promise<{ success: boolean; id?: string; duplicate?: boolean; verified?: ExerciseVerificationResult['verified'] }> {
    const edgeFunctionUrl = getEdgeFunctionUrl();

    if (!edgeFunctionUrl) {
      logger.warn('SupabaseLearningObservationRepository', 'Edge Function URL not configured — exercise evidence not persisted');
      return { success: false };
    }

    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;

    if (!jwt) {
      logger.warn('SupabaseLearningObservationRepository', 'No active session — exercise evidence not persisted');
      return { success: false };
    }

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          exerciseCode: submission.exerciseCode,
          answer: submission.answer,
          submissionId: submission.submissionId,
          schoolId: submission.schoolId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
        logger.error('SupabaseLearningObservationRepository', `Edge Function exercise verification error (${response.status}): ${errorBody.error}`);
        return { success: false };
      }

      const result = await response.json();
      logger.info('SupabaseLearningObservationRepository', `Exercise evidence verified [${result.id}] via Edge Function: ${submission.exerciseCode}`);
      return { success: true, id: result.id, duplicate: result.duplicate, verified: result.verified };

    } catch (err: any) {
      logger.error('SupabaseLearningObservationRepository', `Edge Function exercise call failed: ${err.message}`);
      return { success: false };
    }
  }

  /**
   * Gate 06C.4.1: School-scoped institutional canonical read.
   * Paginates until exhaustion. Returns ALL observations for a student within a school.
   * schoolId is MANDATORY — institutional canonical state is scoped by (studentId, schoolId).
   * Observations with school_id IS NULL are excluded from institutional reads.
   * No default limit. No silent truncation.
   */
  public async getObservationsForStudent(
    studentId: string,
    schoolId: string
  ): Promise<LearningEvidenceObservation[]> {
    if (!schoolId) {
      throw new Error('schoolId is required for institutional canonical reads — fail closed');
    }

    const PAGE_SIZE = 1000;
    let allRows: Record<string, any>[] = [];
    let offset = 0;

    while (true) {
      const { data, error } = await supabase
        .from('learning_observation_history')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .order('occurred_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        logger.error('SupabaseLearningObservationRepository', `Failed to fetch student observations: ${error.message}`);
        throw new Error(`Failed to fetch student observations: ${error.message}`);
      }

      const rows = data || [];
      allRows = allRows.concat(rows);

      if (rows.length < PAGE_SIZE) {
        break;
      }
      offset += PAGE_SIZE;
    }

    return allRows.map(this.mapDbToModel);
  }

  /**
   * Gate 06C.4.1: School-scoped institutional canonical read.
   * Paginates until exhaustion. Returns ALL observations for a student+concept within a school.
   * schoolId is MANDATORY — concept state is scoped by (studentId, schoolId, conceptId).
   * Observations with school_id IS NULL are excluded from institutional reads.
   * No default limit. No silent truncation.
   */
  public async getObservationsForConcept(
    studentId: string,
    schoolId: string,
    conceptId: string
  ): Promise<LearningEvidenceObservation[]> {
    if (!schoolId) {
      throw new Error('schoolId is required for institutional canonical reads — fail closed');
    }

    const PAGE_SIZE = 1000;
    let allRows: Record<string, any>[] = [];
    let offset = 0;

    while (true) {
      const { data, error } = await supabase
        .from('learning_observation_history')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .eq('concept_id', conceptId)
        .order('occurred_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        logger.error('SupabaseLearningObservationRepository', `Failed to fetch concept observations: ${error.message}`);
        throw new Error(`Failed to fetch concept observations: ${error.message}`);
      }

      const rows = data || [];
      allRows = allRows.concat(rows);

      if (rows.length < PAGE_SIZE) {
        break;
      }
      offset += PAGE_SIZE;
    }

    return allRows.map(this.mapDbToModel);
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
    const metadata = row.metadata || {};
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
      interactionResult: metadata.interactionResult || null,
      metadata,
      occurredAt: row.occurred_at,
      recordedAt: row.recorded_at,
    };
  }
}

export const observationHistoryRepo = new SupabaseLearningObservationRepository();
