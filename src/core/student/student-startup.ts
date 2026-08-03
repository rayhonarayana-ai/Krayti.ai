/**
 * Qarayti.ai — Student Portal DI Registration
 * Boots and registers Student Portal Subsystems in DI Container
 */

import { container, ServiceLifetime } from '../di/container';
import {
  IStudentPortalRepository,
  StudentPortalRepositoryImpl,
} from '../../domain/repositories/studentPortal.repository';
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
} from '../../domain/usecases/studentPortal.usecases';
import { StudentPortalService } from '../../domain/services/studentPortal.service';
import { logger } from '../logging/logger';

export function registerStudentPortalSubsystems(): void {
  logger.info('StudentPortalStartup', 'Registering Student Portal Subsystems in DI Container...');

  // 1. Repository
  container.register<IStudentPortalRepository>(
    'StudentPortalRepository',
    () => new StudentPortalRepositoryImpl(),
    ServiceLifetime.SINGLETON
  );

  // 2. Use Cases
  container.register(
    'GetStudentDashboardUseCase',
    (c) => new GetStudentDashboardUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'GetLessonsAndDetailsUseCase',
    (c) => new GetLessonsAndDetailsUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'ProcessPracticeExerciseUseCase',
    (c) => new ProcessPracticeExerciseUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'ManageStudentHomeworkUseCase',
    (c) => new ManageStudentHomeworkUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'ExamPrepAndAiAnalyzerUseCase',
    (c) => new ExamPrepAndAiAnalyzerUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'KnowledgeGraphAndSkillTreeUseCase',
    (c) => new KnowledgeGraphAndSkillTreeUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'SpacedRepetitionFlashcardsUseCase',
    (c) => new SpacedRepetitionFlashcardsUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'GamificationAndLeaderboardUseCase',
    (c) => new GamificationAndLeaderboardUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'StudentAnalyticsAndRecordsUseCase',
    (c) => new StudentAnalyticsAndRecordsUseCase(c.resolve<IStudentPortalRepository>('StudentPortalRepository')),
    ServiceLifetime.SINGLETON
  );

  // 3. Service Layer
  container.register(
    'StudentPortalService',
    (c) =>
      new StudentPortalService(
        c.resolve<GetStudentDashboardUseCase>('GetStudentDashboardUseCase'),
        c.resolve<GetLessonsAndDetailsUseCase>('GetLessonsAndDetailsUseCase'),
        c.resolve<ProcessPracticeExerciseUseCase>('ProcessPracticeExerciseUseCase'),
        c.resolve<ManageStudentHomeworkUseCase>('ManageStudentHomeworkUseCase'),
        c.resolve<ExamPrepAndAiAnalyzerUseCase>('ExamPrepAndAiAnalyzerUseCase'),
        c.resolve<KnowledgeGraphAndSkillTreeUseCase>('KnowledgeGraphAndSkillTreeUseCase'),
        c.resolve<SpacedRepetitionFlashcardsUseCase>('SpacedRepetitionFlashcardsUseCase'),
        c.resolve<GamificationAndLeaderboardUseCase>('GamificationAndLeaderboardUseCase'),
        c.resolve<StudentAnalyticsAndRecordsUseCase>('StudentAnalyticsAndRecordsUseCase')
      ),
    ServiceLifetime.SINGLETON
  );

  logger.info('StudentPortalStartup', 'Student Portal Subsystems registered successfully.');
}
