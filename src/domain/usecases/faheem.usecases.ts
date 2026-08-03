/**
 * Qarayti.ai — Faheem AI Domain Use Cases
 * Single Responsibility Use Cases for processing queries, session management, and metrics
 */

import { IFaheemRepository } from '../repositories/faheem.repository';
import {
  ProcessFaheemQueryDTO,
  FaheemQueryResponseDTO,
  FaheemSession,
  FaheemMetrics,
  FaheemRoleContext,
} from '../types/faheem.types';
import { EducationLanguage } from '../types/education.types';

export class ProcessFaheemQueryUseCase {
  constructor(private faheemRepository: IFaheemRepository) {}

  public async execute(dto: ProcessFaheemQueryDTO): Promise<FaheemQueryResponseDTO> {
    return this.faheemRepository.processQuery(dto);
  }
}

export class StartFaheemSessionUseCase {
  constructor(private faheemRepository: IFaheemRepository) {}

  public async execute(
    userId: string,
    role: FaheemRoleContext,
    language: EducationLanguage = EducationLanguage.ARABIC
  ): Promise<FaheemSession> {
    return this.faheemRepository.createSession(userId, role, language);
  }
}

export class GetFaheemMetricsUseCase {
  constructor(private faheemRepository: IFaheemRepository) {}

  public async execute(): Promise<FaheemMetrics> {
    return this.faheemRepository.getMetrics();
  }
}
