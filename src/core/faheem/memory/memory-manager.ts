/**
 * Qarayti.ai — Memory Manager (Short-Term + Long-Term Orchestrator)
 */

import { ShortTermMemory } from './short-term-memory';
import { ILongTermMemoryRepository, longTermMemoryRepo, UserLearnerMemory } from './long-term-memory-interface';
import { FaheemMessage } from '../../../domain/types/faheem.types';
import { logger } from '../../logging/logger';

export class FaheemMemoryManager {
  private shortTerm: ShortTermMemory;
  private longTerm: ILongTermMemoryRepository;

  constructor(longTermRepo: ILongTermMemoryRepository = longTermMemoryRepo, maxTurns = 20) {
    this.shortTerm = new ShortTermMemory(maxTurns);
    this.longTerm = longTermRepo;
  }

  public recordTurn(message: FaheemMessage): void {
    this.shortTerm.addMessage(message);
  }

  public getShortTermHistory(): FaheemMessage[] {
    return this.shortTerm.getMessages();
  }

  public async getLearnerLongTermMemory(userId: string): Promise<UserLearnerMemory> {
    return this.longTerm.getLearnerMemory(userId);
  }

  public async updateConceptMastery(userId: string, conceptCode: string, score: number): Promise<void> {
    await this.longTerm.updateConceptMastery(userId, conceptCode, score);
  }

  public clearShortTerm(): void {
    this.shortTerm.clear();
    logger.debug('FaheemMemoryManager', 'Short term memory cleared.');
  }
}
