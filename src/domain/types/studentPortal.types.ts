/**
 * Qarayti.ai — Student Portal Domain Types
 * Clean Architecture Domain Definitions for Student Experience
 */

import { EducationLevel, HighSchoolTrack, EducationLanguage, ExamType } from './education.types';
import {
  DailyPlanItem,
  SpacedRepetitionCard,
  WeaknessDiagnostic,
  Recommendation,
  SkillTreeNode,
  LearningAnalytics,
} from './adaptive.types';

export interface StudentDashboardSummary {
  studentId: string;
  name: string;
  avatarUrl?: string;
  level?: EducationLevel;
  track?: HighSchoolTrack;
  massarId?: string;
  schoolName?: string;
  schoolId?: string;
  regionalCity?: string;
  xp: number;
  coins: number;
  levelRank: number;
  levelTitle: string;
  streakDays: number;
  bacTargetScore: number;
  currentEstimatedBacScore: number;
  todayStudyMinutes: number;
  todayGoalMinutes: number;
  completedTasksToday: number;
  totalTasksToday: number;
  upcomingExamsCount: number;
  pendingHomeworkCount: number;
  masteryPercentage: number;
}

export interface StudentLesson {
  id: string;
  subjectId: string;
  subjectName: string;
  unitTitleAr: string;
  unitTitleFr: string;
  lessonTitleAr: string;
  lessonTitleFr: string;
  complexity: number; // 1-5
  durationMinutes: number;
  videoUrl?: string;
  summaryPdfUrl?: string;
  contentMarkdown: string;
  keyFormulae: string[];
  bacWeightPercentage: number;
  isCompleted: boolean;
  masteryScore: number; // 0-1
}

export type ExerciseSource =
  | 'CANONICAL'
  | 'PROTOTYPE_UNMAPPED'
  | 'AI_GENERATED'
  | 'UNKNOWN';

/**
 * Gate 06D.4 CORRECTION: Explicit pre-submission eligibility.
 * Derives from exercise metadata — NOT from HTTP codes or runtime errors.
 * Separates curriculum-provenance conditions from operational submission failures.
 */
export type ExerciseSubmissionEligibility =
  | { status: 'ELIGIBLE' }
  | { status: 'PROTOTYPE_UNMAPPED' }
  | { status: 'CANONICAL_MISMATCH' }
  | { status: 'UNSUPPORTED_GRADING_MODE'; mode?: string };

export function getExerciseSubmissionEligibility(
  exercise: StudentExercise | null,
): ExerciseSubmissionEligibility {
  if (!exercise) return { status: 'PROTOTYPE_UNMAPPED' };
  if (exercise.exerciseSource !== 'CANONICAL') return { status: 'PROTOTYPE_UNMAPPED' };
  if (!exercise.exerciseCode) return { status: 'PROTOTYPE_UNMAPPED' };
  if (exercise.curriculumMismatch) return { status: 'CANONICAL_MISMATCH' };
  if (exercise.unsupportedGrading) {
    return { status: 'UNSUPPORTED_GRADING_MODE', mode: exercise.gradingMode };
  }
  return { status: 'ELIGIBLE' };
}

export interface StudentExercise {
  id: string;
  exerciseCode?: string;
  exerciseSource?: ExerciseSource;
  subjectId: string;
  topicAr: string;
  topicFr: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'OLYMPIAD';
  questionText: string;
  hints: string[];
  options?: string[]; // for MCQ
  // Gate 06B.2B.2.1: correctAnswer removed — answer authority in curriculum_exercise_grading (server-only)
  solutionSteps?: string[]; // optional: only for AI-generated exercises (NOT grading authority)
  maxPoints: number;
  isAiGenerated?: boolean;
  curriculumMismatch?: boolean;
  unsupportedGrading?: boolean;
  gradingMode?: string;
}

/**
 * Gate 06D.2 + 06D.4: Explicit exercise verification state.
 * An ungraded answer is NOT an incorrect answer.
 * PENDING_VERIFICATION must not carry any grading authority.
 * GRADED must carry only genuine server-verified fields.
 * ERROR carries a user-safe error message when verification fails.
 *
 * Gate 06D.4: scoreObtained, masteryGain, xpEarned removed — the Edge Function
 * does not authoritatively provide them. Absence is not zero.
 */
export type ExerciseSubmissionResult =
  | {
      status: 'PENDING_VERIFICATION';
      exerciseId: string;
      studentAnswer: string;
      feedbackAr: string;
    }
  | {
      status: 'GRADED';
      exerciseId: string;
      exerciseCode: string;
      studentAnswer: string;
      isCorrect: boolean;
      feedbackAr: string;
      subjectCode: string;
      koCode: string;
      competencies: string[];
      observationId?: string;
      duplicate?: boolean;
      dataQualityWarning?: string;
    }
  | {
      status: 'ERROR';
      exerciseId: string;
      studentAnswer: string;
      feedbackAr: string;
      errorCode?: string;
    };

export interface HomeworkAssignment {
  id: string;
  title: string;
  subjectName: string;
  teacherName: string;
  dueDate: string;
  assignedDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  grade?: number; // /20
  maxGrade: number; // 20
  feedback?: string;
  attachmentUrl?: string;
  submissionText?: string;
}

export interface ExamPreparationItem {
  id: string;
  title: string;
  examType: ExamType; // REGIONAL_EXAM or NATIONAL_EXAM
  year: number;
  session: 'ORDINAIRE' | 'RATTRAPAGE';
  track: HighSchoolTrack;
  subjectName: string;
  durationMinutes: number;
  totalPoints: number;
  pdfUrl?: string;
  correctionPdfUrl?: string;
  interactiveQuestionsCount: number;
  completionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  bestScore?: number;
}

export interface ExamAiAnalysisResult {
  examId: string;
  examTitle: string;
  overallScore: number; // /20
  timeSpentMinutes: number;
  strengthTopics: string[];
  weaknessTopics: string[];
  recommendations: string[];
  detailedRubric: Array<{
    questionNumber: string;
    topic: string;
    pointsEarned: number;
    maxPoints: number;
    mistakeType?: string;
    adviceAr: string;
  }>;
}

export interface StudentAchievement {
  id: string;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  iconName: string;
  badgeCategory: 'STREAK' | 'MASTERY' | 'EXAM_HERO' | 'DEDICATION' | 'COMMUNITY';
  unlockedAt?: string;
  isUnlocked: boolean;
  xpReward: number;
  progressPercentage: number;
}

export interface LeaderboardUser {
  rank: number;
  studentId: string;
  name: string;
  avatarUrl: string;
  track: HighSchoolTrack;
  xp: number;
  streakDays: number;
  bacTarget: number;
  isCurrentUser?: boolean;
}

export interface StudentAttendanceRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  subjectName: string;
  notes?: string;
}

export interface StudentGradeRecord {
  id: string;
  subjectName: string;
  coefficient: number;
  grade: number; // /20
  classAverage: number;
  maxGrade: number;
  minGrade: number;
  examType: string;
  date: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'EXAM' | 'AI_RECOMMENDATION' | 'ACHIEVEMENT' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface StudentGoalSetting {
  dailyStudyMinutesGoal: number;
  weeklyExercisesGoal: number;
  targetBacScoreGoal: number;
  preferredLanguage: EducationLanguage;
  notificationsEnabled: boolean;
}
