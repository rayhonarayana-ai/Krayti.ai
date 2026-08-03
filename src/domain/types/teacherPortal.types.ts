/**
 * Qarayti.ai — Teacher Portal Domain Types
 * Data structures for Moroccan Baccalaureate Teacher Portal.
 */

export interface TeacherClass {
  id: string;
  className: string; // e.g. "2ème BAC Sc. Math A"
  gradeLevel: string; // e.g. "2ème BAC"
  track: string; // e.g. "Sciences Mathématiques A"
  subject: string; // e.g. "Mathématiques"
  coefficient: number; // e.g. 9
  studentCount: number;
  classAverage: number; // out of 20
  scheduleSlot: string; // e.g. "Lun 08:30-10:30, Mer 14:30-16:30"
  roomNumber: string; // e.g. "Salle 12"
  academicYear: string;
}

export interface ClassStudentRosterItem {
  id: string;
  classId: string;
  fullName: string;
  massarCode: string;
  avatarUrl: string;
  currentAverage: number;
  attendanceRate: number;
  irtTheta: number; // -3.0 to +3.0
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastActive: string;
}

export interface TeacherAssignment {
  id: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string;
  totalSubmissions: number;
  gradedCount: number;
  totalStudents: number;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  maxScore: number;
  attachmentName?: string;
}

export interface TeacherGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  massarCode: string;
  classId: string;
  subject: string;
  examTitle: string;
  examType: 'Devoir Surveillé N°1' | 'Devoir Surveillé N°2' | 'Contrôle Continu' | 'Examen Blanc' | 'TP';
  score: number; // 0 to 20
  coefficient: number;
  examDate: string;
  feedback: string;
}

export interface SessionAttendanceItem {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  massarCode: string;
  date: string;
  timeSlot: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  justified: boolean;
  notes?: string;
}

export interface BankQuestion {
  id: string;
  subject: string;
  chapter: string;
  title: string;
  statementFr: string;
  statementAr?: string;
  bloomLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
  difficultyBeta: number; // -3.0 to +3.0 IRT Beta
  discriminationAlpha: number; // 0.5 to 2.5 IRT Alpha
  estimatedMinutes: number;
  solutionKey: string;
  bacYearReference?: string; // e.g. "BAC National 2023 - Rattrapage"
}

export interface LessonPlanUnit {
  id: string;
  classId: string;
  className: string;
  subject: string;
  chapterTitle: string;
  unitNumber: number;
  totalSessions: number;
  completedSessions: number;
  menObjectives: string[];
  prerequisites: string[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED';
  keyCompetencies: string[];
}

export interface GeneratedAILessonPlan {
  id: string;
  topic: string;
  subject: string;
  gradeLevel: string;
  durationMinutes: number;
  introductionPhase: string;
  coreConcepts: string[];
  workedExamples: string[];
  boardSummary: string;
  differentiatedGuidance: {
    strugglingStudents: string;
    advancedStudents: string;
  };
  assessmentQuestions: string[];
  homeworkAssigned: string;
}

export interface TeacherMessageThread {
  id: string;
  recipientType: 'PARENT' | 'STUDENT';
  recipientName: string;
  recipientRoleOrChild: string; // e.g. "Parent de Amine El Amrani"
  subjectName: string;
  avatarUrl: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: boolean;
  messages: Array<{
    id: string;
    sender: 'TEACHER' | 'RECIPIENT';
    text: string;
    timestamp: string;
  }>;
}

export interface ClassPerformanceReport {
  classId: string;
  className: string;
  averageGrade: number;
  passRatePercentage: number;
  highestGrade: number;
  lowestGrade: number;
  weakestTopics: string[];
  strongestTopics: string[];
  aiPedagogicalSummary: string;
}
