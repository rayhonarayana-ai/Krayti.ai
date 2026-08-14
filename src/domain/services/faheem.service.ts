/**
 * Qarayti.ai — Faheem Domain Service
 * Encapsulates Use Case execution and provides unified entry point for presentation layer
 */

import {
  ProcessFaheemQueryUseCase,
  StartFaheemSessionUseCase,
  GetFaheemMetricsUseCase,
} from '../usecases/faheem.usecases';
import {
  ProcessFaheemQueryDTO,
  FaheemQueryResponseDTO,
  FaheemSession,
  FaheemMetrics,
  FaheemRoleContext,
} from '../types/faheem.types';
import { EducationLanguage } from '../types/education.types';
import { learningEvidenceEngine } from '../../core/analytics/learning-evidence-engine';

export class FaheemService {
  constructor(
    private processQueryUseCase: ProcessFaheemQueryUseCase,
    private startSessionUseCase: StartFaheemSessionUseCase,
    private getMetricsUseCase: GetFaheemMetricsUseCase
  ) {}

  public async query(dto: ProcessFaheemQueryDTO): Promise<FaheemQueryResponseDTO> {
    return this.processQueryUseCase.execute(dto);
  }

  public async processQuery(dto: ProcessFaheemQueryDTO): Promise<FaheemQueryResponseDTO> {
    return this.query(dto);
  }

  public async startSession(
    userId: string,
    role: FaheemRoleContext,
    language: EducationLanguage = EducationLanguage.ARABIC
  ): Promise<FaheemSession> {
    return this.startSessionUseCase.execute(userId, role, language);
  }

  public async getEngineMetrics(): Promise<FaheemMetrics> {
    return this.getMetricsUseCase.execute();
  }

  public async getStudentEvidenceContext(studentId: string) {
    return learningEvidenceEngine.getStudentEvidence(studentId);
  }
}
