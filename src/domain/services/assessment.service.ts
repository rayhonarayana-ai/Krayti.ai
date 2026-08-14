/**
 * Qarayti.ai — Domain Service: Assessment & Evaluation Engine
 * Modular Clean Architecture Domain Service covering Question Bank, Exam Generation,
 * Auto-Grading (QCM + OCR), Gap Diagnostic & Remediation Planning.
 */

import {
  assessmentEngine,
  QuestionItem,
  GeneratedExam,
  ExamSpecificationGrid,
  ExamSubmission,
  EvaluationResult,
  DifficultyLevel,
} from '../../core/assessment/assessment-engine';
import { qaraytiEventBus, QaraytiEventType } from '../../core/integration/event-bus';
import { logger } from '../../core/logging/logger';

export interface CreateQuestionInput {
  subjectId: string;
  subjectName: string;
  topic: string;
  track: string;
  type: QuestionItem['type'];
  prompt: string;
  options?: string[];
  correctAnswer: string;
  difficulty: DifficultyLevel;
  bloomTaxonomy: QuestionItem['bloomTaxonomy'];
  authorTeacher: string;
}

export class AssessmentDomainService {
  private static instance: AssessmentDomainService;

  private constructor() {
    logger.info('AssessmentDomainService', 'Domain Service initialized.');
  }

  public static getInstance(): AssessmentDomainService {
    if (!AssessmentDomainService.instance) {
      AssessmentDomainService.instance = new AssessmentDomainService();
    }
    return AssessmentDomainService.instance;
  }

  // 1. Question Bank Operations
  public searchQuestionBank(subject?: string, track?: string, difficulty?: DifficultyLevel): QuestionItem[] {
    return assessmentEngine.searchQuestionBank(subject, track, difficulty);
  }

  public getQuestionBank(): QuestionItem[] {
    return assessmentEngine.getQuestionBank();
  }

  // 2. Specification Grid & Exam Generation
  public generateExam(grid: ExamSpecificationGrid): GeneratedExam {
    return assessmentEngine.generateExamFromGrid(grid);
  }

  public getGeneratedExams(): GeneratedExam[] {
    return assessmentEngine.getGeneratedExams();
  }

  // 3. E2E Assessment Flow: Submission, Grading, Gap Analysis & Remediation Broadcast
  public async submitAndGradeExam(submission: ExamSubmission): Promise<EvaluationResult> {
    const evaluation = await assessmentEngine.evaluateSubmission(submission);

    // E2E Propagation: Notify Parent Portal via Event Bus
    await qaraytiEventBus.publish(
      QaraytiEventType.TEACHER_GRADE_RECORDED,
      submission.studentId,
      'TEACHER',
      {
        examId: submission.examId,
        studentName: submission.studentName,
        scorePercentage: evaluation.percentageScore,
        diagnosedGaps: evaluation.diagnosedGaps,
        remediationPlan: evaluation.remediationPlan,
      }
    );

    logger.info(
      'AssessmentDomainService',
      `E2E Flow complete for ${submission.studentName}. Grade recorded and parent notification dispatched.`
    );

    return evaluation;
  }

  public getEvaluationHistory(): EvaluationResult[] {
    return assessmentEngine.getEvaluationRecords();
  }

  public getStats() {
    return assessmentEngine.getQuestionBankStats();
  }
}

export const assessmentDomainService = AssessmentDomainService.getInstance();
