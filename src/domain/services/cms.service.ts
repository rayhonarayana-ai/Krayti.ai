/**
 * Qarayti.ai — Domain Service: Content Management System (CMS) Service
 * Implements Clean Architecture & DDD interfaces for managing the Moroccan National Curriculum,
 * Knowledge Objects (KOs), Competencies, and Version Control.
 */

import {
  cmsEngine,
  SubjectCurriculum,
  KnowledgeObject,
  Competency,
} from '../../core/cms/cms-engine';
import { logger } from '../../core/logging/logger';

export class CMSDomainService {
  private static instance: CMSDomainService;

  private constructor() {
    logger.info('CMSDomainService', 'Domain Service initialized.');
  }

  public static getInstance(): CMSDomainService {
    if (!CMSDomainService.instance) {
      CMSDomainService.instance = new CMSDomainService();
    }
    return CMSDomainService.instance;
  }

  public getCurricula(): SubjectCurriculum[] {
    return cmsEngine.getCurricula();
  }

  public getCompetencies(): Competency[] {
    return cmsEngine.getCompetencies();
  }

  public async publishKnowledgeObject(
    lessonId: string,
    koData: Omit<KnowledgeObject, 'id' | 'updatedAt' | 'indexedForFaheemAI' | 'indexedForAssessment' | 'indexedForAdaptive'>
  ): Promise<KnowledgeObject> {
    return cmsEngine.publishKnowledgeObject(lessonId, koData);
  }

  public getStats() {
    return cmsEngine.getCMSStats();
  }
}

export const cmsDomainService = CMSDomainService.getInstance();
