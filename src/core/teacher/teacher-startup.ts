/**
 * Qarayti.ai — Teacher Portal DI Registration
 * Boots and registers Teacher Portal Subsystems in DI Container
 */

import { container, ServiceLifetime } from '../di/container';
import {
  ITeacherPortalRepository,
  TeacherPortalRepository,
} from '../../domain/repositories/teacherPortal.repository';
import {
  GetTeacherClassesUseCase,
  GetStudentRosterUseCase,
  GetTeacherAssignmentsUseCase,
  CreateTeacherAssignmentUseCase,
  GetTeacherGradesUseCase,
  RecordStudentGradeUseCase,
  GetTeacherAttendanceUseCase,
  UpdateAttendanceStatusUseCase,
  GetQuestionBankUseCase,
  AddQuestionToBankUseCase,
  GetLessonPlansUseCase,
  GetTeacherThreadsUseCase,
  SendTeacherMessageUseCase,
  GetClassPerformanceReportUseCase,
} from '../../domain/usecases/teacherPortal.usecases';
import { TeacherPortalService } from '../../domain/services/teacherPortal.service';
import { logger } from '../logging/logger';

export function registerTeacherPortalSubsystems(): void {
  logger.info('TeacherPortalStartup', 'Registering Teacher Portal Subsystems in DI Container...');

  // 1. Repository
  container.register<ITeacherPortalRepository>(
    'TeacherPortalRepository',
    () => new TeacherPortalRepository(),
    ServiceLifetime.SINGLETON
  );

  // 2. Use Cases
  container.register('GetTeacherClassesUseCase', (c) => new GetTeacherClassesUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetStudentRosterUseCase', (c) => new GetStudentRosterUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetTeacherAssignmentsUseCase', (c) => new GetTeacherAssignmentsUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('CreateTeacherAssignmentUseCase', (c) => new CreateTeacherAssignmentUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetTeacherGradesUseCase', (c) => new GetTeacherGradesUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('RecordStudentGradeUseCase', (c) => new RecordStudentGradeUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetTeacherAttendanceUseCase', (c) => new GetTeacherAttendanceUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('UpdateAttendanceStatusUseCase', (c) => new UpdateAttendanceStatusUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetQuestionBankUseCase', (c) => new GetQuestionBankUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('AddQuestionToBankUseCase', (c) => new AddQuestionToBankUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetLessonPlansUseCase', (c) => new GetLessonPlansUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetTeacherThreadsUseCase', (c) => new GetTeacherThreadsUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('SendTeacherMessageUseCase', (c) => new SendTeacherMessageUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);
  container.register('GetClassPerformanceReportUseCase', (c) => new GetClassPerformanceReportUseCase(c.resolve<ITeacherPortalRepository>('TeacherPortalRepository')), ServiceLifetime.SINGLETON);

  // 3. Service Layer
  container.register(
    'TeacherPortalService',
    (c) =>
      new TeacherPortalService(
        c.resolve('GetTeacherClassesUseCase'),
        c.resolve('GetStudentRosterUseCase'),
        c.resolve('GetTeacherAssignmentsUseCase'),
        c.resolve('CreateTeacherAssignmentUseCase'),
        c.resolve('GetTeacherGradesUseCase'),
        c.resolve('RecordStudentGradeUseCase'),
        c.resolve('GetTeacherAttendanceUseCase'),
        c.resolve('UpdateAttendanceStatusUseCase'),
        c.resolve('GetQuestionBankUseCase'),
        c.resolve('AddQuestionToBankUseCase'),
        c.resolve('GetLessonPlansUseCase'),
        c.resolve('GetTeacherThreadsUseCase'),
        c.resolve('SendTeacherMessageUseCase'),
        c.resolve('GetClassPerformanceReportUseCase')
      ),
    ServiceLifetime.SINGLETON
  );

  logger.info('TeacherPortalStartup', 'Teacher Portal Subsystems registered successfully.');
}
