/**
 * Qarayti.ai — Parent Portal Repository Interface
 * Clean Architecture Repository definition for Moroccan School OS Parent Portal.
 */

import {
  ParentChild,
  ProgressReport,
  AttendanceRecord,
  GradeRecord,
  HomeworkItem,
  ParentNotification,
  PaymentInvoice,
  TeacherThread,
  WeeklyReportDigest,
  AIRecommendation,
} from '../types/parentPortal.types';

export interface IParentPortalRepository {
  getChildren(): Promise<ParentChild[]>;
  getChildById(childId: string): Promise<ParentChild | null>;
  getProgressReports(childId: string): Promise<ProgressReport[]>;
  getAttendanceRecords(childId: string): Promise<AttendanceRecord[]>;
  getGradeRecords(childId: string): Promise<GradeRecord[]>;
  getHomeworkItems(childId: string): Promise<HomeworkItem[]>;
  getNotifications(childId: string): Promise<ParentNotification[]>;
  getPayments(childId: string): Promise<PaymentInvoice[]>;
  getTeacherThreads(childId: string): Promise<TeacherThread[]>;
  getWeeklyReport(childId: string): Promise<WeeklyReportDigest | null>;
  getAIRecommendations(childId: string): Promise<AIRecommendation[]>;

  // Mutations
  justifyAbsence(attendanceId: string, reason: string): Promise<boolean>;
  toggleHomeworkStatus(homeworkId: string): Promise<HomeworkItem>;
  markNotificationAsRead(notificationId: string): Promise<boolean>;
  sendMessageToTeacher(threadId: string, messageText: string, attachmentName?: string): Promise<TeacherThread>;
  payInvoice(invoiceId: string, paymentMethod: string): Promise<PaymentInvoice>;
  generateAIWeeklyReport(childId: string): Promise<WeeklyReportDigest>;
}
