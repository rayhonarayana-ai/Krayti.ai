/**
 * Qarayti.ai — Domain Service: Knowledge Intelligence Service
 * Domain service exposing dependency graphs, impact analysis, content quality audit,
 * and version rollbacks following Clean Architecture & DDD principles.
 */

import {
  knowledgeIntelligenceEngine,
  ImpactAnalysisResult,
  ContentQualityReport,
  DependencyNode,
} from '../../core/cms/knowledge-intelligence';
import { KnowledgeObject } from '../../core/cms/cms-engine';
import { logger } from '../../core/logging/logger';

export class KnowledgeIntelligenceDomainService {
  private static instance: KnowledgeIntelligenceDomainService;

  private constructor() {
    logger.info('KnowledgeIntelligenceDomainService', 'Domain Service initialized.');
  }

  public static getInstance(): KnowledgeIntelligenceDomainService {
    if (!KnowledgeIntelligenceDomainService.instance) {
      KnowledgeIntelligenceDomainService.instance = new KnowledgeIntelligenceDomainService();
    }
    return KnowledgeIntelligenceDomainService.instance;
  }

  public analyzeImpact(koId: string): ImpactAnalysisResult {
    return knowledgeIntelligenceEngine.analyzeImpact(koId);
  }

  public validateQuality(ko: Partial<KnowledgeObject>): ContentQualityReport {
    return knowledgeIntelligenceEngine.validateQuality(ko);
  }

  public getDependencyGraph(): DependencyNode[] {
    return knowledgeIntelligenceEngine.getDependencyGraph();
  }

  public async rollbackKoVersion(koId: string, targetVersion: string): Promise<boolean> {
    return knowledgeIntelligenceEngine.rollbackKoVersion(koId, targetVersion);
  }
}

export const knowledgeIntelligenceDomainService = KnowledgeIntelligenceDomainService.getInstance();
