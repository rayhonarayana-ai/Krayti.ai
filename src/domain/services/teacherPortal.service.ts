/**
 * Qarayti.ai — Teacher Portal Domain Service
 * Unified domain entry point for Teacher Portal operations.
 */

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
} from '../usecases/teacherPortal.usecases';

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
import { qaraytiEventBus, QaraytiEventType } from '../../core/integration/event-bus';
import { learningEvidenceEngine } from '../../core/analytics/learning-evidence-engine';

export class TeacherPortalService {
  constructor(
    private getClassesUseCase: GetTeacherClassesUseCase,
    private getRosterUseCase: GetStudentRosterUseCase,
    private getAssignmentsUseCase: GetTeacherAssignmentsUseCase,
    private createAssignmentUseCase: CreateTeacherAssignmentUseCase,
    private getGradesUseCase: GetTeacherGradesUseCase,
    private recordGradeUseCase: RecordStudentGradeUseCase,
    private getAttendanceUseCase: GetTeacherAttendanceUseCase,
    private updateAttendanceUseCase: UpdateAttendanceStatusUseCase,
    private getQuestionBankUseCase: GetQuestionBankUseCase,
    private addQuestionUseCase: AddQuestionToBankUseCase,
    private getLessonPlansUseCase: GetLessonPlansUseCase,
    private getThreadsUseCase: GetTeacherThreadsUseCase,
    private sendMessageUseCase: SendTeacherMessageUseCase,
    private getPerformanceReportUseCase: GetClassPerformanceReportUseCase
  ) {}

  async getClasses(teacherId: string = 'teacher-1'): Promise<TeacherClass[]> {
    return this.getClassesUseCase.execute(teacherId);
  }

  async getRoster(classId: string): Promise<ClassStudentRosterItem[]> {
    return this.getRosterUseCase.execute(classId);
  }

  async getAssignments(classId?: string): Promise<TeacherAssignment[]> {
    return this.getAssignmentsUseCase.execute(classId);
  }

  async createAssignment(data: Omit<TeacherAssignment, 'id' | 'totalSubmissions' | 'gradedCount'>): Promise<TeacherAssignment> {
    const res = await this.createAssignmentUseCase.execute(data);
    qaraytiEventBus.publish(QaraytiEventType.TEACHER_ASSIGNMENT_CREATED, 'teacher-1', 'TEACHER', {
      assignmentId: res.id,
      title: res.title,
      subjectName: res.subject,
    });
    return res;
  }

  async getGrades(classId?: string): Promise<TeacherGradeRecord[]> {
    return this.getGradesUseCase.execute(classId);
  }

  async recordGrade(data: Omit<TeacherGradeRecord, 'id'>): Promise<TeacherGradeRecord> {
    const res = await this.recordGradeUseCase.execute(data);
    qaraytiEventBus.publish(QaraytiEventType.TEACHER_GRADE_RECORDED, 'teacher-1', 'TEACHER', {
      studentId: res.studentId,
      studentName: res.studentName,
      gradeValue: res.score,
      maxGrade: 20,
      subjectName: res.subject,
    });
    return res;
  }

  async getAttendance(classId?: string): Promise<SessionAttendanceItem[]> {
    return this.getAttendanceUseCase.execute(classId);
  }

  async updateAttendance(id: string, status: 'PRESENT' | 'ABSENT' | 'LATE', notes?: string): Promise<SessionAttendanceItem> {
    const res = await this.updateAttendanceUseCase.execute(id, status, notes);
    qaraytiEventBus.publish(QaraytiEventType.TEACHER_ATTENDANCE_MARKED, 'teacher-1', 'TEACHER', {
      attendanceId: id,
      studentName: res.studentName,
      status: res.status,
      sessionTime: res.timeSlot,
    });
    return res;
  }

  async getQuestionBank(subject?: string): Promise<BankQuestion[]> {
    return this.getQuestionBankUseCase.execute(subject);
  }

  async addQuestion(data: Omit<BankQuestion, 'id'>): Promise<BankQuestion> {
    return this.addQuestionUseCase.execute(data);
  }

  async getLessonPlans(classId?: string): Promise<LessonPlanUnit[]> {
    return this.getLessonPlansUseCase.execute(classId);
  }

  async getThreads(): Promise<TeacherMessageThread[]> {
    return this.getThreadsUseCase.execute();
  }

  async sendMessage(threadId: string, text: string): Promise<TeacherMessageThread> {
    return this.sendMessageUseCase.execute(threadId, text);
  }

  async getPerformanceReport(classId: string): Promise<ClassPerformanceReport> {
    return this.getPerformanceReportUseCase.execute(classId);
  }

  async getTeacherInsights(classId: string) {
    return learningEvidenceEngine.getTeacherInsights(classId);
  }
}
