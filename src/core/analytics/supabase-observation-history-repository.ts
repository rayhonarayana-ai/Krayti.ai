/**
 * Qarayti.ai — Supabase Learning Observation History Repository
 * Sprint 2.6: Append-Only Observation History Persistence Implementation
 */

import { supabase } from '../../infrastructure/supabase/client';
import { logger } from '../logging/logger';
import { ILearningObservationRepository, LearningEvidenceObservation } from './observation-history-interface';

export class SupabaseLearningObservationRepository implements ILearningObservationRepository {
  public async recordObservation(
    observation: LearningEvidenceObservation
  ): Promise<{ success: boolean; id?: string; duplicate?: boolean }> {
    // Check idempotency first to avoid duplicate errors
    const existing = await this.getObservationByIdempotencyKey(observation.idempotencyKey);
    if (existing) {
      logger.info('SupabaseLearningObservationRepository', `Duplicate observation skipped for key: ${observation.idempotencyKey}`);
      return { success: true, id: existing.id, duplicate: true };
    }

    const dbRecord = {
      student_id: observation.studentId,
      tenant_id: observation.tenantId || 'default',
      concept_id: observation.conceptId,
      observation_type: observation.observationType,
      evidence_source: observation.evidenceSource,
      source_event_id: observation.sourceEventId,
      idempotency_key: observation.idempotencyKey,
      previous_mastery: observation.previousMastery,
      current_mastery: observation.currentMastery,
      delta: observation.delta,
      confidence: observation.confidence ?? 1.0,
      metadata: observation.metadata || {},
      occurred_at: observation.occurredAt,
    };

    const { data, error } = await supabase
      .from('learning_observation_history')
      .insert(dbRecord)
      .select('id')
      .single();

    if (error) {
      // Check for unique key violation (PostgreSQL 23505)
      if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('idempotency_key')) {
        logger.info('SupabaseLearningObservationRepository', `Idempotency constraint handled for key: ${observation.idempotencyKey}`);
        return { success: true, duplicate: true };
      }
      logger.error('SupabaseLearningObservationRepository', `Failed to record observation: ${error.message}`);
      throw new Error(`Failed to record observation: ${error.message}`);
    }

    logger.info('SupabaseLearningObservationRepository', `Recorded new observation [${data?.id}] for student [${observation.studentId}]`);
    return { success: true, id: data?.id, duplicate: false };
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
