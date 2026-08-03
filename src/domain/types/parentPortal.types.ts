/**
 * Qarayti.ai — Parent Portal Domain Types
 * Comprehensive data contracts for Moroccan School OS Parent Portal.
 */

export interface ParentChild {
  id: string;
  fullName: string;
  firstName: string;
  massarCode: string; // Moroccan Massar Code e.g. "G134092812"
  schoolName: string;
  gradeLevel: string; // e.g. "2ème Année Baccalauréat"
  track: string; // e.g. "Sciences Mathématiques A"
  avatarUrl: string;
  overallGpa: number; // out of 20
  classRank: number;
  totalClassSize: number;
  attendanceRate: number; // percentage e.g. 96.5
  pendingHomeworkCount: number;
  unpaidBalanceMad: number; // Moroccan Dirhams
  unreadNotifications: number;
}

export interface ProgressReport {
  id: string;
  childId: string;
  term: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3';
  schoolYear: string;
  subject: string;
  coefficient: number;
  teacherName: string;
  averageGrade: number; // out of 20
  classAverage: number; // out of 20
  minGrade: number;
  maxGrade: number;
  appraisal: string;
  competencies: Array<{
    name: string;
    level: 'MAISTERED' | 'IN_PROGRESS' | 'NEEDS_WORK';
  }>;
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "08:30 - 10:30"
  subject: string;
  type: 'ABSENCE' | 'LATE' | 'PRESENT';
  justified: boolean;
  justificationReason?: string;
  teacherName: string;
}

export interface GradeRecord {
  id: string;
  childId: string;
  subject: string;
  examTitle: string;
  examType: 'Devoir Surveillé N°1' | 'Devoir Surveillé N°2' | 'Contrôle Continu' | 'Examen Blanc' | 'TP';
  score: number; // out of 20
  maxScore: number; // usually 20
  coefficient: number;
  date: string;
  classAvg: number;
  classMax: number;
  teacherFeedback: string;
}

export interface HomeworkItem {
  id: string;
  childId: string;
  subject: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'LATE';
  estimatedMinutes: number;
  teacherName: string;
  attachmentName?: string;
}

export interface ParentNotification {
  id: string;
  childId: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'ATTENDANCE' | 'GRADE' | 'PAYMENT' | 'ANNOUNCEMENT' | 'HOMEWORK' | 'TEACHER';
  read: boolean;
  severity: 'INFO' | 'WARNING' | 'ALERT';
}

export interface PaymentInvoice {
  id: string;
  childId: string;
  invoiceNumber: string;
  title: string;
  billingPeriod: string;
  amountMad: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'PARENT' | 'TEACHER';
  text: string;
  timestamp: string;
}

export interface TeacherThread {
  id: string;
  childId: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  teacherAvatar: string;
  officeHours: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface WeeklyReportDigest {
  id: string;
  childId: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  attendanceSummary: {
    presentHours: number;
    absentHours: number;
    lateCount: number;
  };
  homeworkSummary: {
    assigned: number;
    completedOnTime: number;
    lateOrMissing: number;
  };
  academicHighlights: Array<{
    subject: string;
    gradeOrNote: string;
    type: 'SUCCESS' | 'ATTENTION';
  }>;
  focusScore: number; // 0 to 100
  aiWeeklyInsight: string;
}

export interface AIRecommendation {
  id: string;
  childId: string;
  subject: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  impactArea: string; // e.g. "Préparation Bac - Nombres Complexes"
  actionSteps: string[];
  rationale: string;
}
