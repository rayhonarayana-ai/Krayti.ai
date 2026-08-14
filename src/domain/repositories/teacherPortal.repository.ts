/**
 * Qarayti.ai — Teacher Portal Domain Repository
 * Implementation using local memory and domain datasets for Moroccan Teachers.
 */

import {
  TeacherClass,
  ClassStudentRosterItem,
  TeacherAssignment,
  TeacherGradeRecord,
  SessionAttendanceItem,
  BankQuestion,
  LessonPlanUnit,
  GeneratedAILessonPlan,
  TeacherMessageThread,
  ClassPerformanceReport,
} from '../types/teacherPortal.types';

import {
  INITIAL_TEACHER_CLASSES,
  INITIAL_STUDENT_ROSTER,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_TEACHER_GRADES,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_QUESTION_BANK,
  INITIAL_LESSON_PLANS,
  INITIAL_TEACHER_THREADS,
  INITIAL_CLASS_PERFORMANCE_REPORT,
} from '../data/teacherPortalData';

export interface ITeacherPortalRepository {
  getClasses(teacherId: string): Promise<TeacherClass[]>;
  getRoster(classId: string): Promise<ClassStudentRosterItem[]>;
  getAssignments(classId?: string): Promise<TeacherAssignment[]>;
  createAssignment(assignment: Omit<TeacherAssignment, 'id' | 'totalSubmissions' | 'gradedCount'>): Promise<TeacherAssignment>;
  getGrades(classId?: string): Promise<TeacherGradeRecord[]>;
  recordGrade(grade: Omit<TeacherGradeRecord, 'id'>): Promise<TeacherGradeRecord>;
  getAttendance(classId?: string): Promise<SessionAttendanceItem[]>;
  updateAttendance(id: string, status: 'PRESENT' | 'ABSENT' | 'LATE', notes?: string): Promise<SessionAttendanceItem>;
  getQuestionBank(subject?: string): Promise<BankQuestion[]>;
  addQuestion(question: Omit<BankQuestion, 'id'>): Promise<BankQuestion>;
  getLessonPlans(classId?: string): Promise<LessonPlanUnit[]>;
  addLessonPlanUnit(unit: Omit<LessonPlanUnit, 'id' | 'completedSessions' | 'status'>): Promise<LessonPlanUnit>;
  getThreads(): Promise<TeacherMessageThread[]>;
  sendMessage(threadId: string, text: string): Promise<TeacherMessageThread>;
  getPerformanceReport(classId: string): Promise<ClassPerformanceReport>;
}

export class TeacherPortalRepository implements ITeacherPortalRepository {
  private classes: TeacherClass[] = [...INITIAL_TEACHER_CLASSES];
  private roster: ClassStudentRosterItem[] = [...INITIAL_STUDENT_ROSTER];
  private assignments: TeacherAssignment[] = [...INITIAL_TEACHER_ASSIGNMENTS];
  private grades: TeacherGradeRecord[] = [...INITIAL_TEACHER_GRADES];
  private attendance: SessionAttendanceItem[] = [...INITIAL_TEACHER_ATTENDANCE];
  private questionBank: BankQuestion[] = [...INITIAL_QUESTION_BANK];
  private lessonPlans: LessonPlanUnit[] = [...INITIAL_LESSON_PLANS];
  private threads: TeacherMessageThread[] = [...INITIAL_TEACHER_THREADS];
  private performanceReport: ClassPerformanceReport = { ...INITIAL_CLASS_PERFORMANCE_REPORT };

  async getClasses(_teacherId: string): Promise<TeacherClass[]> {
    return this.classes;
  }

  async getRoster(classId: string): Promise<ClassStudentRosterItem[]> {
    return this.roster.filter((r) => r.classId === classId);
  }

  async getAssignments(classId?: string): Promise<TeacherAssignment[]> {
    if (classId) return this.assignments.filter((a) => a.classId === classId);
    return this.assignments;
  }

  async createAssignment(data: Omit<TeacherAssignment, 'id' | 'totalSubmissions' | 'gradedCount'>): Promise<TeacherAssignment> {
    const created: TeacherAssignment = {
      ...data,
      id: `asg-${Date.now()}`,
      totalSubmissions: 0,
      gradedCount: 0,
    };
    this.assignments.unshift(created);
    return created;
  }

  async getGrades(classId?: string): Promise<TeacherGradeRecord[]> {
    if (classId) return this.grades.filter((g) => g.classId === classId);
    return this.grades;
  }

  async recordGrade(data: Omit<TeacherGradeRecord, 'id'>): Promise<TeacherGradeRecord> {
    const created: TeacherGradeRecord = {
      ...data,
      id: `grd-t-${Date.now()}`,
    };
    this.grades.unshift(created);
    return created;
  }

  async getAttendance(classId?: string): Promise<SessionAttendanceItem[]> {
    if (classId) return this.attendance.filter((a) => a.classId === classId);
    return this.attendance;
  }

  async updateAttendance(id: string, status: 'PRESENT' | 'ABSENT' | 'LATE', notes?: string): Promise<SessionAttendanceItem> {
    const item = this.attendance.find((a) => a.id === id);
    if (!item) throw new Error('Attendance record not found');
    item.status = status;
    if (notes !== undefined) item.notes = notes;
    return item;
  }

  async getQuestionBank(subject?: string): Promise<BankQuestion[]> {
    if (subject) return this.questionBank.filter((q) => q.subject === subject);
    return this.questionBank;
  }

  async addQuestion(data: Omit<BankQuestion, 'id'>): Promise<BankQuestion> {
    const created: BankQuestion = {
      ...data,
      id: `qbank-${Date.now()}`,
    };
    this.questionBank.unshift(created);
    return created;
  }

  async getLessonPlans(classId?: string): Promise<LessonPlanUnit[]> {
    if (classId) return this.lessonPlans.filter((l) => l.classId === classId);
    return this.lessonPlans;
  }

  async addLessonPlanUnit(data: Omit<LessonPlanUnit, 'id' | 'completedSessions' | 'status'>): Promise<LessonPlanUnit> {
    const created: LessonPlanUnit = {
      ...data,
      id: `lp-${Date.now()}`,
      completedSessions: 0,
      status: 'PLANNED',
    };
    this.lessonPlans.push(created);
    return created;
  }

  async getThreads(): Promise<TeacherMessageThread[]> {
    return this.threads;
  }

  async sendMessage(threadId: string, text: string): Promise<TeacherMessageThread> {
    const thread = this.threads.find((t) => t.id === threadId);
    if (!thread) throw new Error('Thread not found');
    const msg = {
      id: `msg-t-${Date.now()}`,
      sender: 'TEACHER' as const,
      text,
      timestamp: 'À l\'instant',
    };
    thread.lastMessage = text;
    thread.lastTimestamp = 'À l\'instant';
    thread.messages.push(msg);
    return thread;
  }

  async getPerformanceReport(classId: string): Promise<ClassPerformanceReport> {
    return {
      ...this.performanceReport,
      classId,
    };
  }
}
