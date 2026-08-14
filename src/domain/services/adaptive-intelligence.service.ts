/**
 * Qarayti.ai — Domain Service: Adaptive Intelligence Service
 * Clean Architecture & DDD Domain Service exposing Student Learning Profiles,
 * Competency Masteries, Forgetting Curve Decay, Spaced Repetition Planners,
 * and Golden Path Real-time Execution.
 */

import {
  adaptiveLearningIntelligenceEngine,
  StudentLearningProfile,
  CompetencyMastery,
  NextBestLessonRecommendation,
  DailyRevisionPlan,
  GoldenPathAdaptiveResult,
} from '../../core/adaptive/adaptive-learning-intelligence';
import { logger } from '../../core/logging/logger';

export class AdaptiveIntelligenceDomainService {
  private static instance: AdaptiveIntelligenceDomainService;

  private constructor() {
    logger.info('AdaptiveIntelligenceDomainService', 'Domain Service initialized.');
  }

  public static getInstance(): AdaptiveIntelligenceDomainService {
    if (!AdaptiveIntelligenceDomainService.instance) {
      AdaptiveIntelligenceDomainService.instance = new AdaptiveIntelligenceDomainService();
    }
    return AdaptiveIntelligenceDomainService.instance;
  }

  public getStudentProfile(studentId?: string): StudentLearningProfile {
    return adaptiveLearningIntelligenceEngine.getStudentProfile(studentId);
  }

  public getStudentMasteries(studentId?: string): CompetencyMastery[] {
    return adaptiveLearningIntelligenceEngine.getStudentMasteries(studentId);
  }

  public getNextBestLesson(studentId?: string): NextBestLessonRecommendation {
    return adaptiveLearningIntelligenceEngine.getNextBestLesson(studentId);
  }

  public generate7DayRevisionPlan(studentId?: string): DailyRevisionPlan[] {
    return adaptiveLearningIntelligenceEngine.generate7DayRevisionPlan(studentId);
  }

  public async processGoldenPathAnswer(
    studentId: string,
    koId: string,
    isCorrect: boolean,
    responseTimeSeconds: number,
    selfReportConfidence: number
  ): Promise<GoldenPathAdaptiveResult> {
    return adaptiveLearningIntelligenceEngine.processGoldenPathAnswer(
      studentId,
      koId,
      isCorrect,
      responseTimeSeconds,
      selfReportConfidence
    );
  }
}

export const adaptiveIntelligenceDomainService = AdaptiveIntelligenceDomainService.getInstance();
