/**
 * Qarayti.ai — Student Portal Single Responsibility Use Cases
 * Clean Architecture Use Cases for Student Experience
 */

import { IStudentPortalRepository } from '../repositories/studentPortal.repository';
import { ExamType, HighSchoolTrack } from '../types/education.types';
import { StudentGoalSetting } from '../types/studentPortal.types';

export class GetStudentDashboardUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async execute(studentId: string) {
    const summary = await this.repository.getDashboardSummary(studentId);
    const recommendations = await this.repository.getRecommendations(studentId);
    const notifications = await this.repository.getNotifications(studentId);
    return { summary, recommendations, notifications };
  }
}

export class GetLessonsAndDetailsUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getLessons(studentId: string, subjectId?: string) {
    return this.repository.getLessons(studentId, subjectId);
  }

  public async getLessonById(lessonId: string) {
    return this.repository.getLessonById(lessonId);
  }

  public async completeLesson(studentId: string, lessonId: string) {
    return this.repository.completeLesson(studentId, lessonId);
  }
}

export class ProcessPracticeExerciseUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getExercises(subjectId?: string, topic?: string) {
    return this.repository.getExercises(subjectId, topic);
  }

  public async submitAnswer(exerciseId: string, answer: string) {
    return this.repository.submitExerciseAnswer(exerciseId, answer);
  }

  public async generateAiExercise(subjectName: string, topic: string, difficulty: string) {
    return this.repository.generateAiExercise(subjectName, topic, difficulty);
  }
}

export class ManageStudentHomeworkUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getHomework(studentId: string) {
    return this.repository.getHomeworkList(studentId);
  }

  public async submitHomework(homeworkId: string, text: string) {
    return this.repository.submitHomework(homeworkId, text);
  }
}

export class ExamPrepAndAiAnalyzerUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getExamPrepItems(examType?: ExamType) {
    return this.repository.getExamPrepItems(examType);
  }

  public async analyzeExamWithAi(examId: string, answers: Record<string, string>) {
    return this.repository.analyzeExamWithAi(examId, answers);
  }
}

export class KnowledgeGraphAndSkillTreeUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getSkillTree(subjectId?: string) {
    return this.repository.getSkillTree(subjectId);
  }

  public async getWeaknessDiagnostics(studentId: string) {
    return this.repository.getWeaknessDiagnostics(studentId);
  }

  public async getRecommendations(studentId: string) {
    return this.repository.getRecommendations(studentId);
  }
}

export class SpacedRepetitionFlashcardsUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getFlashcards(studentId: string) {
    return this.repository.getFlashcards(studentId);
  }

  public async reviewFlashcard(cardId: string, rating: 1 | 2 | 3 | 4 | 5) {
    return this.repository.reviewFlashcard(cardId, rating);
  }
}

export class GamificationAndLeaderboardUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getAchievements(studentId: string) {
    return this.repository.getAchievements(studentId);
  }

  public async getLeaderboard(track?: HighSchoolTrack) {
    return this.repository.getLeaderboard(track);
  }

  public async updateGoals(studentId: string, goals: Partial<StudentGoalSetting>) {
    return this.repository.updateGoalSettings(studentId, goals);
  }
}

export class StudentAnalyticsAndRecordsUseCase {
  constructor(private repository: IStudentPortalRepository) {}

  public async getProfile(studentId: string) {
    return this.repository.getStudentProfile(studentId);
  }

  public async getAttendance(studentId: string) {
    return this.repository.getAttendanceRecords(studentId);
  }

  public async getGrades(studentId: string) {
    return this.repository.getGradeRecords(studentId);
  }

  public async getAnalytics(studentId: string) {
    return this.repository.getLearningAnalytics(studentId);
  }
}
