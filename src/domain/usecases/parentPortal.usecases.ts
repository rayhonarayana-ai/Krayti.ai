/**
 * Qarayti.ai — Parent Portal Application Use Cases
 * Clean Architecture Use Case Orchestrators for all 10 Parent Portal sub-modules.
 */

import { IParentPortalRepository } from '../repositories/parentPortal.repository';
import { ParentPortalService } from '../services/parentPortal.service';
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

export class ParentPortalUseCases {
  constructor(
    private repository: IParentPortalRepository,
    private service: ParentPortalService
  ) {}

  // 1. Parent Dashboard Use Case
  public async getDashboardOverview(childId: string) {
    const [child, attendance, homework, notifications, reports, weeklyReport] = await Promise.all([
      this.repository.getChildById(childId),
      this.repository.getAttendanceRecords(childId),
      this.repository.getHomeworkItems(childId),
      this.repository.getNotifications(childId),
      this.repository.getProgressReports(childId),
      this.repository.getWeeklyReport(childId),
    ]);

    const attendanceStats = this.service.analyzeAttendance(attendance);
    const bacRisk = child
      ? this.service.predictBaccalaureateRisk(child.overallGpa, child.attendanceRate, child.pendingHomeworkCount)
      : null;

    return {
      child,
      attendanceStats,
      pendingHomework: homework.filter((h) => h.status === 'PENDING'),
      unreadNotifications: notifications.filter((n) => !n.read),
      progressReports: reports,
      weeklyReport,
      bacRisk,
    };
  }

  // 2. Children Management Use Case
  public async getChildrenList(): Promise<ParentChild[]> {
    return await this.repository.getChildren();
  }

  // 3. Progress Reports Use Case
  public async getProgressReports(childId: string): Promise<ProgressReport[]> {
    return await this.repository.getProgressReports(childId);
  }

  // 4. Attendance Analytics Use Case
  public async getAttendanceAnalytics(childId: string) {
    const records = await this.repository.getAttendanceRecords(childId);
    const stats = this.service.analyzeAttendance(records);
    return { records, stats };
  }

  // 5. Grades & Trend Analytics Use Case
  public async getGradesTrend(childId: string) {
    const grades = await this.repository.getGradeRecords(childId);
    const calculatedGpa = this.service.calculateMoroccanGpa(grades);
    return { grades, calculatedGpa };
  }

  // 6. Homework Management Use Case
  public async getHomeworkList(childId: string) {
    const items = await this.repository.getHomeworkItems(childId);
    const evaluatedItems = items.map((item) => ({
      ...item,
      aiEvaluation: this.service.evaluateHomeworkCompletion(item),
    }));
    return evaluatedItems;
  }

  // 7. Notifications Use Case
  public async getNotifications(childId: string): Promise<ParentNotification[]> {
    return await this.repository.getNotifications(childId);
  }

  // 8. Teacher Messaging Use Case
  public async getTeacherMessaging(childId: string): Promise<TeacherThread[]> {
    return await this.repository.getTeacherThreads(childId);
  }

  // 9. Weekly AI Report Use Case
  public async getWeeklyAIReport(childId: string): Promise<WeeklyReportDigest> {
    const existing = await this.repository.getWeeklyReport(childId);
    if (existing) return existing;

    return await this.repository.generateAIWeeklyReport(childId);
  }

  // 10. Payments Use Case
  public async getPayments(childId: string): Promise<PaymentInvoice[]> {
    return await this.repository.getPayments(childId);
  }

  public async processPayment(invoiceId: string, paymentMethod: string): Promise<PaymentInvoice> {
    return await this.repository.payInvoice(invoiceId, paymentMethod);
  }
}
