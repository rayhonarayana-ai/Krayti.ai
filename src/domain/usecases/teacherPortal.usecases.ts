/**
 * Qarayti.ai — Teacher Portal Use Cases
 * Clean Architecture Use Cases handling teacher operations.
 */

import { ITeacherPortalRepository } from '../repositories/teacherPortal.repository';
import {
  TeacherClass,
  ClassStudentRosterItem,
  TeacherAssignment,
  TeacherGradeRecord,
  SessionAttendanceItem,
  BankQuestion,
  LessonPlanUnit,
  TeacherMessageThread,
  ClassPerformanceReport,
} from '../types/teacherPortal.types';

export class GetTeacherClassesUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(teacherId: string): Promise<TeacherClass[]> {
    return this.repo.getClasses(teacherId);
  }
}

export class GetStudentRosterUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(classId: string): Promise<ClassStudentRosterItem[]> {
    return this.repo.getRoster(classId);
  }
}

export class GetTeacherAssignmentsUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(classId?: string): Promise<TeacherAssignment[]> {
    return this.repo.getAssignments(classId);
  }
}

export class CreateTeacherAssignmentUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(data: Omit<TeacherAssignment, 'id' | 'totalSubmissions' | 'gradedCount'>): Promise<TeacherAssignment> {
    return this.repo.createAssignment(data);
  }
}

export class GetTeacherGradesUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(classId?: string): Promise<TeacherGradeRecord[]> {
    return this.repo.getGrades(classId);
  }
}

export class RecordStudentGradeUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(data: Omit<TeacherGradeRecord, 'id'>): Promise<TeacherGradeRecord> {
    return this.repo.recordGrade(data);
  }
}

export class GetTeacherAttendanceUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(classId?: string): Promise<SessionAttendanceItem[]> {
    return this.repo.getAttendance(classId);
  }
}

export class UpdateAttendanceStatusUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(id: string, status: 'PRESENT' | 'ABSENT' | 'LATE', notes?: string): Promise<SessionAttendanceItem> {
    return this.repo.updateAttendance(id, status, notes);
  }
}

export class GetQuestionBankUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(subject?: string): Promise<BankQuestion[]> {
    return this.repo.getQuestionBank(subject);
  }
}

export class AddQuestionToBankUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(data: Omit<BankQuestion, 'id'>): Promise<BankQuestion> {
    return this.repo.addQuestion(data);
  }
}

export class GetLessonPlansUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(classId?: string): Promise<LessonPlanUnit[]> {
    return this.repo.getLessonPlans(classId);
  }
}

export class GetTeacherThreadsUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(): Promise<TeacherMessageThread[]> {
    return this.repo.getThreads();
  }
}

export class SendTeacherMessageUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(threadId: string, text: string): Promise<TeacherMessageThread> {
    return this.repo.sendMessage(threadId, text);
  }
}

export class GetClassPerformanceReportUseCase {
  constructor(private repo: ITeacherPortalRepository) {}
  async execute(classId: string): Promise<ClassPerformanceReport> {
    return this.repo.getPerformanceReport(classId);
  }
}
