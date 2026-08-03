/**
 * Qarayti.ai — Conversation Manager
 * Manages conversation turn history, message serialization, and short-term memory sync
 */

import { FaheemMessage, FaheemMessageRole } from '../../../domain/types/faheem.types';
import { EducationLanguage } from '../../../domain/types/education.types';
import { FaheemMemoryManager } from '../memory/memory-manager';
import { logger } from '../../logging/logger';

export class FaheemConversationManager {
  private memoryManager: FaheemMemoryManager;
  private messageStore = new Map<string, FaheemMessage[]>();

  constructor(memoryManager: FaheemMemoryManager) {
    this.memoryManager = memoryManager;
  }

  public appendMessage(
    sessionId: string,
    role: FaheemMessageRole,
    content: string,
    language: EducationLanguage
  ): FaheemMessage {
    const msg: FaheemMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      role,
      content,
      language,
      timestamp: new Date().toISOString(),
    };

    const history = this.messageStore.get(sessionId) || [];
    history.push(msg);
    this.messageStore.set(sessionId, history);

    this.memoryManager.recordTurn(msg);
    logger.debug('FaheemConversationManager', `Appended turn [${role}] to session [${sessionId}]`);
    return msg;
  }

  public getHistory(sessionId: string): FaheemMessage[] {
    return this.messageStore.get(sessionId) || [];
  }
}
