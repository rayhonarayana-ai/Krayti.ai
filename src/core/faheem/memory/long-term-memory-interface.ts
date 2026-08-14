/**
 * Qarayti.ai — Long-Term Memory Interface & Implementation
 * Stores cross-session learner profiles, conceptual mastery logs, and past exam attempts
 */

import { logger } from '../../logging/logger';
import { SupabaseLongTermMemoryRepository } from './supabase-long-term-memory-repository';

export interface UserLearnerMemory {
  userId: string;
  conceptMasteryScores: Record<string, number>; // e.g. "MATH-COMPLEX": 0.85
  favoriteLanguage: string;
  pastExamScores: Array<{ examName: string; score: number; date: string }>;
  savedNotes: string[];
}

export interface ILongTermMemoryRepository {
  getLearnerMemory(userId: string): Promise<UserLearnerMemory>;
  updateConceptMastery(userId: string, conceptCode: string, score: number): Promise<void>;
  saveNote(userId: string, note: string): Promise<void>;
}

/**
 * @deprecated - kept for local dev fallback
 */
export class LongTermMemoryRepositoryImpl implements ILongTermMemoryRepository {
  private memoryStore = new Map<string, UserLearnerMemory>();

  public async getLearnerMemory(userId: string): Promise<UserLearnerMemory> {
    if (!this.memoryStore.has(userId)) {
      this.memoryStore.set(userId, {
        userId,
        conceptMasteryScores: {
          'MATH-COMPLEX': 0.88,
          'MATH-ANALYSIS': 0.72,
          'PHYS-WAVES': 0.65,
        },
        favoriteLanguage: 'ar',
        pastExamScores: [
          { examName: 'الامتحان الجهوي 1BAC - اللغة الفرنسية', score: 16.5, date: '2025-06-15' },
          { examName: 'المراقبة المستمرة 1 - الرياضيات', score: 18.0, date: '2025-11-20' },
        ],
        savedNotes: [
          'قاعدة الأعداد العقدية: z = a + ib',
          'معادلة الموجة الميكانيكية المتناقلة: v = d / delta_t',
        ],
      });
    }

    return this.memoryStore.get(userId)!;
  }

  public async updateConceptMastery(userId: string, conceptCode: string, score: number): Promise<void> {
    const memory = await this.getLearnerMemory(userId);
    memory.conceptMasteryScores[conceptCode] = Math.max(0, Math.min(1, score));
    logger.info('LongTermMemory', `Updated concept [${conceptCode}] score for user [${userId}] to ${score}`);
  }

  public async saveNote(userId: string, note: string): Promise<void> {
    const memory = await this.getLearnerMemory(userId);
    memory.savedNotes.push(note);
    logger.info('LongTermMemory', `Saved learner note for user [${userId}]`);
  }
}

export const longTermMemoryRepo = new SupabaseLongTermMemoryRepository();
