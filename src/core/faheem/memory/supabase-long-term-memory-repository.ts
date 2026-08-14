/**
 * Qarayti.ai — Supabase Long-Term Memory Repository Implementation
 * Handles persistent learner memory via Supabase PostgreSQL / REST API
 */

import { supabase } from '../../../infrastructure/supabase/client';
import { logger } from '../../logging/logger';
import { ILongTermMemoryRepository, UserLearnerMemory } from './long-term-memory-interface';

export class SupabaseLongTermMemoryRepository implements ILongTermMemoryRepository {
  public async getLearnerMemory(userId: string): Promise<UserLearnerMemory> {
    const { data, error } = await supabase
      .from('learner_memory')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load learner memory for user ${userId}: ${error.message}`);
    }

    if (data) {
      return {
        userId: data.user_id,
        conceptMasteryScores: data.concept_mastery_scores || {},
        favoriteLanguage: data.favorite_language || 'ar',
        pastExamScores: data.past_exam_scores || [],
        savedNotes: data.saved_notes || [],
      };
    }

    // If record does not exist, insert initial empty learner memory record
    const initialMemory: UserLearnerMemory = {
      userId,
      conceptMasteryScores: {},
      favoriteLanguage: 'ar',
      pastExamScores: [],
      savedNotes: [],
    };

    const { error: insertError } = await supabase
      .from('learner_memory')
      .insert({
        user_id: userId,
        concept_mastery_scores: initialMemory.conceptMasteryScores,
        favorite_language: initialMemory.favoriteLanguage,
        past_exam_scores: initialMemory.pastExamScores,
        saved_notes: initialMemory.savedNotes,
      });

    if (insertError) {
      throw new Error(`Failed to load learner memory for user ${userId}: ${insertError.message}`);
    }

    return initialMemory;
  }

  public async updateConceptMastery(userId: string, conceptCode: string, score: number): Promise<void> {
    const memory = await this.getLearnerMemory(userId);
    const clampedScore = Math.max(0, Math.min(1, score));
    const updatedScores = {
      ...memory.conceptMasteryScores,
      [conceptCode]: clampedScore,
    };

    const { error } = await supabase
      .from('learner_memory')
      .upsert({
        user_id: userId,
        concept_mastery_scores: updatedScores,
        favorite_language: memory.favoriteLanguage,
        past_exam_scores: memory.pastExamScores,
        saved_notes: memory.savedNotes,
      }, { onConflict: 'user_id' });

    if (error) {
      throw new Error(`Failed to update concept mastery for user ${userId}: ${error.message}`);
    } else {
      logger.info('SupabaseLongTermMemoryRepository', `Successfully updated concept [${conceptCode}] score to ${clampedScore} for user [${userId}]`);
    }
  }

  public async saveNote(userId: string, note: string): Promise<void> {
    const memory = await this.getLearnerMemory(userId);
    const updatedNotes = [...memory.savedNotes, note];

    const { error } = await supabase
      .from('learner_memory')
      .upsert({
        user_id: userId,
        concept_mastery_scores: memory.conceptMasteryScores,
        favorite_language: memory.favoriteLanguage,
        past_exam_scores: memory.pastExamScores,
        saved_notes: updatedNotes,
      }, { onConflict: 'user_id' });

    if (error) {
      throw new Error(`Failed to save note for user ${userId}: ${error.message}`);
    } else {
      logger.info('SupabaseLongTermMemoryRepository', `Saved learner note to Supabase for user [${userId}]`);
    }
  }
}
