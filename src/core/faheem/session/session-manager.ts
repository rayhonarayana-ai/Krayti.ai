/**
 * Qarayti.ai — Session Manager
 * Lifecycle management for Faheem AI Engine conversation sessions
 */

import { FaheemSession, FaheemRoleContext, FaheemContext } from '../../../domain/types/faheem.types';
import { EducationLanguage } from '../../../domain/types/education.types';
import { AIContextBuilder } from '../context/ai-context-builder';
import { logger } from '../../logging/logger';

export class FaheemSessionManager {
  private sessions = new Map<string, FaheemSession>();

  public createSession(
    userId: string,
    role: FaheemRoleContext,
    language: EducationLanguage = EducationLanguage.ARABIC,
    customContext?: Record<string, unknown>,
    explicitSessionId?: string
  ): FaheemSession {
    const sessionId = explicitSessionId || `fsess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const contextBuilder = new AIContextBuilder(role, language);
    if (role === 'student') contextBuilder.withStudent();
    if (role === 'parent') contextBuilder.withParent();
    if (role === 'teacher') contextBuilder.withTeacher();
    contextBuilder.withSchool().withCurriculum().withAdaptiveState();

    const compiledContext: FaheemContext = contextBuilder.build();
    if (customContext) {
      compiledContext.customMetadata = customContext;
    }

    const session: FaheemSession = {
      id: sessionId,
      userId,
      role,
      schoolId: compiledContext.school?.schoolId || 'sch-001',
      language,
      context: compiledContext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      status: 'ACTIVE',
    };

    this.sessions.set(sessionId, session);
    logger.info('FaheemSessionManager', `Created session [${sessionId}] for user [${userId}] with role [${role}]`);
    return session;
  }

  public getSession(sessionId: string): FaheemSession | undefined {
    return this.sessions.get(sessionId);
  }

  public updateSession(session: FaheemSession): void {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.id, session);
  }

  public getActiveSessionsCount(): number {
    return this.sessions.size;
  }
}
