/**
 * Qarayti.ai — Short-Term Memory Manager
 * Manages active conversation turns, sliding window buffers, and token budgets
 */

import { FaheemMessage } from '../../../domain/types/faheem.types';
import { logger } from '../../logging/logger';

export class ShortTermMemory {
  private messages: FaheemMessage[] = [];
  private maxTurns: number;

  constructor(maxTurns = 20) {
    this.maxTurns = maxTurns;
  }

  public addMessage(msg: FaheemMessage): void {
    this.messages.push(msg);
    if (this.messages.length > this.maxTurns) {
      const removed = this.messages.shift();
      logger.debug('ShortTermMemory', `Pruned oldest turn message ID: ${removed?.id}`);
    }
  }

  public getMessages(): FaheemMessage[] {
    return [...this.messages];
  }

  public getRecentHistory(limit = 10): FaheemMessage[] {
    return this.messages.slice(-limit);
  }

  public clear(): void {
    this.messages = [];
  }

  public getTurnCount(): number {
    return this.messages.length;
  }
}
