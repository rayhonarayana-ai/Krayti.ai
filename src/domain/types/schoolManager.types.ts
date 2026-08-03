/**
 * Qarayti.ai — School Manager Portal Domain Types
 * Comprehensive data structures for Moroccan School Operating System (School OS).
 */

export interface SchoolTeacher {
  id: string;
  fullName: string;
  massarId: string;
  subject: string;
  track: string;
  assignedClasses: string[];
  qualification: string; // e.g. "Agrégé en Mathématiques"
  email: string;
  phone: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
  monthlySalary: number; // MAD
  yearsOfService: number;
}

export interface SchoolStudent {
  id: string;
  fullName: string;
  massarCode: string;
  gradeLevel: string; // e.g. "2ème BAC"
  track: string; // e.g. "Sciences Mathématiques A"
  className: string; // e.g. "2ème BAC Sc. Math A"
  guardianName: string;
  guardianPhone: string;
  academicAverage: number; // /20
  tuitionStatus: 'PAID' | 'PARTIAL' | 'OVERDUE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED';
}

export interface SchoolGuardian {
  id: string;
  fullName: string;
  cinNumber: string; // Carte d'Identité Nationale
  phone: string;
  email: string;
  address: string;
  wardCount: number;
  wards: Array<{
    studentId: string;
    studentName: string;
    className: string;
  }>;
  portalStatus: 'REGISTERED' | 'PENDING' | 'INACTIVE';
}

export interface SchoolFinanceSummary {
  totalRevenueMAD: number;
  pendingTuitionMAD: number;
  payrollMAD: number;
  operationalExpensesMAD: number;
  collectionRatePercent: number;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  category: 'TUITION' | 'PAYROLL' | 'EQUIPMENT' | 'UTILITIES' | 'EVENT';
  amountMAD: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  recipientOrPayer: string;
  status: 'COMPLETED' | 'PENDING';
}

export interface ClassTrackAverage {
  trackName: string;
  averageScore: number;
  studentCount: number;
}

export interface SchoolAnalyticsData {
  overallBacPassRate: number;
  classAveragesByTrack: ClassTrackAverage[];
  attendanceRatePercent: number;
  dropoutRiskPercentage: number;
  topPerformingSubjects: string[];
  subjectsNeedingSupport: string[];
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  timeSlot: string; // e.g. "08:30 - 10:30"
  className: string;
  subject: string;
  teacherName: string;
  roomNumber: string;
}

export interface SchoolExam {
  id: string;
  title: string;
  examType: 'National BAC Session Ordinaire' | 'Regional BAC' | 'Bac Blanc' | 'Devoir Surveillé Unifié';
  targetGrade: string;
  date: string;
  durationMinutes: number;
  totalRegisteredStudents: number;
  leadSupervisor: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';
}

export interface HREmployeeRecord {
  id: string;
  fullName: string;
  role: 'DIRECTEUR' | 'CENSEUR' | 'SURVEILLANT_GENERAL' | 'ENSEIGNANT' | 'COMPTABLE' | 'SECRETARIAT';
  contractType: 'CDI' | 'CDD' | 'VACATAIRE';
  hiringDate: string;
  cnssNumber: string;
  department: string;
  status: 'ACTIVE' | 'LEAVE';
  monthlyBaseMAD: number;
}

export interface SchoolDocument {
  id: string;
  title: string;
  category: 'OFFICIAL_CIRCULAR_MEN' | 'CERTIFICATE_BAC' | 'TRANSCRIPT_MASSAR' | 'EXAM_PAPER' | 'ADMINISTRATIVE';
  fileFormat: 'PDF' | 'DOCX' | 'XLSX';
  dateUploaded: string;
  uploadedBy: string;
  sizeKb: number;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
  publishDate: string;
  author: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  isPinned: boolean;
}

export interface UserRolePermission {
  id: string;
  roleName: string;
  roleTitle: string; // e.g. "Surveillant Général"
  description: string;
  modulesAccess: Record<string, 'READ' | 'WRITE' | 'ADMIN' | 'NONE'>;
  userCount: number;
}
