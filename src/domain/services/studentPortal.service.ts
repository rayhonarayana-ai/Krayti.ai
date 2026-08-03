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

  public async completeLesson(studentId: string, lessonId: string) {
    return this.getLessonsUseCase.completeLesson(studentId, lessonId);
  }

  public async getExercises(subjectId?: string, topic?: string) {
    return this.practiceExerciseUseCase.getExercises(subjectId, topic);
  }

  public async submitExerciseAnswer(exerciseId: string, answer: string) {
    return this.practiceExerciseUseCase.submitAnswer(exerciseId, answer);
  }

  public async generateAiExercise(subjectName: string, topic: string, difficulty: string) {
    return this.practiceExerciseUseCase.generateAiExercise(subjectName, topic, difficulty);
  }

  public async getHomework(studentId: string) {
    return this.homeworkUseCase.getHomework(studentId);
  }

  public async submitHomework(homeworkId: string, text: string) {
    return this.homeworkUseCase.submitHomework(homeworkId, text);
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
}
