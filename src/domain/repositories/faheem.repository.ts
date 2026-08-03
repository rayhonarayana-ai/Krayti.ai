/**
 * Qarayti.ai — Faheem AI Repository (Clean Architecture)
 * Repository Interface and Concrete Implementation for Faheem AI Engine
 */

import {
  ProcessFaheemQueryDTO,
  FaheemQueryResponseDTO,
  FaheemSession,
  FaheemMetrics,
  FaheemRoleContext,
} from '../types/faheem.types';
import { EducationLanguage } from '../types/education.types';
import { FaheemOrchestrator } from '../../core/faheem/orchestrator/faheem-orchestrator';

export interface IFaheemRepository {
  processQuery(dto: ProcessFaheemQueryDTO): Promise<FaheemQueryResponseDTO>;
  createSession(userId: string, role: FaheemRoleContext, language?: EducationLanguage): Promise<FaheemSession>;
  getSession(sessionId: string): Promise<FaheemSession | undefined>;
  getMetrics(): Promise<FaheemMetrics>;
}

export class FaheemRepositoryImpl implements IFaheemRepository {
  private orchestrator: FaheemOrchestrator;

  constructor(orchestrator: FaheemOrchestrator) {
    this.orchestrator = orchestrator;
  }

  public async processQuery(dto: ProcessFaheemQueryDTO): Promise<FaheemQueryResponseDTO> {
    return this.orchestrator.processQuery(dto);
  }

  public async createSession(
    userId: string,
    role: FaheemRoleContext,
    language: EducationLanguage = EducationLanguage.ARABIC
  ): Promise<FaheemSession> {
    const response = await this.orchestrator.processQuery({
      userId,
      query: 'مرحباً، أنا جاهز للبدء مع منصة فهيم.',
      role,
      language,
    });
    const session = this.orchestrator.getSession(response.sessionId);
    if (!session) {
      throw new Error(`Failed to initialize session: ${response.sessionId}`);
    }
    return session;
  }

  public async getSession(sessionId: string): Promise<FaheemSession | undefined> {
    return this.orchestrator.getSession(sessionId);
  }

  public async getMetrics(): Promise<FaheemMetrics> {
    return this.orchestrator.getMetrics();
  }
}
