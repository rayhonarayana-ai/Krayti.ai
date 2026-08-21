/**
 * Qarayti.ai — Student Portal Domain Service
 * Unified Service Layer orchestrating Student Portal Use Cases
 */

import {
  GetStudentDashboardUseCase,
  GetLessonsAndDetailsUseCase,
  ProcessPracticeExerciseUseCase,
  ManageStudentHomeworkUseCase,
  ExamPrepAndAiAnalyzerUseCase,
  KnowledgeGraphAndSkillTreeUseCase,
  SpacedRepetitionFlashcardsUseCase,
  GamificationAndLeaderboardUseCase,
  StudentAnalyticsAndRecordsUseCase,
} from '../usecases/studentPortal.usecases';
import { ExamType, HighSchoolTrack } from '../types/education.types';
import { StudentGoalSetting } from '../types/studentPortal.types';
import { qaraytiEventBus, QaraytiEventType } from '../../core/integration/event-bus';
import { learningEvidenceEngine } from '../../core/analytics/learning-evidence-engine';
import { authService } from '../../core/auth/auth.service';

export class StudentPortalService {
  constructor(
    private getDashboardUseCase: GetStudentDashboardUseCase,
    private getLessonsUseCase: GetLessonsAndDetailsUseCase,
    private practiceExerciseUseCase: ProcessPracticeExerciseUseCase,
    private homeworkUseCase: ManageStudentHomeworkUseCase,
    private examPrepUseCase: ExamPrepAndAiAnalyzerUseCase,
    private knowledgeGraphUseCase: KnowledgeGraphAndSkillTreeUseCase,
    private flashcardUseCase: SpacedRepetitionFlashcardsUseCase,
    private gamificationUseCase: GamificationAndLeaderboardUseCase,
    private analyticsUseCase: StudentAnalyticsAndRecordsUseCase
  ) {}

  public async getDashboard(studentId: string) {
    return this.getDashboardUseCase.execute(studentId);
  }

  public async getLessons(studentId: string, subjectId?: string) {
    return this.getLessonsUseCase.getLessons(studentId, subjectId);
  }

  public async getLessonById(lessonId: string) {
    return this.getLessonsUseCase.getLessonById(lessonId);
  }

  public async completeLesson(studentId: string, lessonId: string, completionId?: string) {
    const res = await this.getLessonsUseCase.completeLesson(studentId, lessonId);
    const activeCompletionId = completionId || `comp_${studentId}_${lessonId}`;
    qaraytiEventBus.publish(QaraytiEventType.STUDENT_LESSON_FINISHED, studentId, 'STUDENT', {
      lessonId,
      completionId: activeCompletionId,
      studentId,
    });
    return res;
  }

  public async getExercises(subjectId?: string, topic?: string) {
    return this.practiceExerciseUseCase.getExercises(subjectId, topic);
  }

  public async submitExerciseAnswer(exerciseId: string, answer: string, studentId?: string, submissionId?: string) {
    const res = await this.practiceExerciseUseCase.submitAnswer(exerciseId, answer);
    const activeStudentId = studentId || authService.getCurrentUser()?.id;
    if (!activeStudentId) {
      throw new Error('Authentication required: no authenticated student identity available');
    }
    const activeSubmissionId = submissionId || `sub_${activeStudentId}_${exerciseId}_${answer}`;
    if (res.status === 'GRADED') {
      qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, activeStudentId, 'STUDENT', {
        exerciseId,
        answer,
        isCorrect: res.isCorrect,
        studentId: activeStudentId,
        submissionId: activeSubmissionId,
      });
    }
    return res;
  }

  public async generateAiExercise(subjectName: string, topic: string, difficulty: string) {
    return this.practiceExerciseUseCase.generateAiExercise(subjectName, topic, difficulty);
  }

  public async getHomework(studentId: string) {
    return this.homeworkUseCase.getHomework(studentId);
  }

  public async submitHomework(homeworkId: string, text: string, studentId?: string) {
    const res = await this.homeworkUseCase.submitHomework(homeworkId, text);
    const activeStudentId = studentId || authService.getCurrentUser()?.id;
    if (!activeStudentId) {
      throw new Error('Authentication required: no authenticated student identity available');
    }
    qaraytiEventBus.publish(QaraytiEventType.STUDENT_HOMEWORK_SUBMITTED, activeStudentId, 'STUDENT', {
      homeworkId,
      studentName: authService.getCurrentUser()?.fullName || 'Qarayti Student',
      subjectName: 'Mathématiques - BAC 2',
      text,
      studentId: activeStudentId,
    });
    return res;
  }

  public async getExamPrepItems(examType?: ExamType) {
    return this.examPrepUseCase.getExamPrepItems(examType);
  }

  public async analyzeExamWithAi(examId: string, answers: Record<string, string>) {
    return this.examPrepUseCase.analyzeExamWithAi(examId, answers);
  }

  public async getSkillTree(subjectId?: string) {
    return this.knowledgeGraphUseCase.getSkillTree(subjectId);
  }

  public async getWeaknessDiagnostics(studentId: string) {
    return this.knowledgeGraphUseCase.getWeaknessDiagnostics(studentId);
  }

  public async getRecommendations(studentId: string) {
    return this.knowledgeGraphUseCase.getRecommendations(studentId);
  }

  public async getFlashcards(studentId: string) {
    return this.flashcardUseCase.getFlashcards(studentId);
  }

  public async reviewFlashcard(cardId: string, rating: 1 | 2 | 3 | 4 | 5) {
    return this.flashcardUseCase.reviewFlashcard(cardId, rating);
  }

  public async getAchievements(studentId: string) {
    return this.gamificationUseCase.getAchievements(studentId);
  }

  public async getLeaderboard(track?: HighSchoolTrack) {
    return this.gamificationUseCase.getLeaderboard(track);
  }

  public async updateGoals(studentId: string, goals: Partial<StudentGoalSetting>) {
    return this.gamificationUseCase.updateGoals(studentId, goals);
  }

  public async getProfile(studentId: string) {
    return this.analyticsUseCase.getProfile(studentId);
  }

  public async getAttendance(studentId: string) {
    return this.analyticsUseCase.getAttendance(studentId);
  }

  public async getGrades(studentId: string) {
    return this.analyticsUseCase.getGrades(studentId);
  }

  public async getAnalytics(studentId: string) {
    return this.analyticsUseCase.getAnalytics(studentId);
  }

  public async getLearningEvidence(studentId: string) {
    return learningEvidenceEngine.getStudentEvidence(studentId);
  }
}
