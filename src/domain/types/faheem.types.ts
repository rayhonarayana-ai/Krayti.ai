/**
 * Qarayti.ai — Faheem AI Engine Domain Types
 * Strict, production-grade domain definitions for the AI engine
 */

import { EducationLevel, HighSchoolTrack, EducationLanguage, ExamType } from './education.types';

export type FaheemRoleContext = 'student' | 'parent' | 'teacher' | 'school_admin' | 'curriculum';

export type FaheemMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type FaheemSafetyLevel = 'SAFE' | 'EDUCATIONAL_WARNING' | 'CHEATING_FLAG' | 'UNSAFE';

export type FaheemModelAlias = 'gemini-3.6-flash' | 'gemini-3.1-pro-preview';

export interface FaheemStudentProfile {
  studentId: string;
  fullName: string;
  gradeLevel: EducationLevel;
  track?: HighSchoolTrack;
  massarId?: string;
  preferredLanguage: EducationLanguage;
  overallAverageScore: number; // 0-20 scale
  weakSubjectCodes: string[];
  strongSubjectCodes: string[];
  schoolId: string;
  schoolName: string;
  isPrivateSchool: boolean;
}

export interface FaheemParentProfile {
  parentId: string;
  fullName: string;
  childrenIds: string[];
  preferredLanguage: EducationLanguage;
  notificationPreferences: {
    absences: boolean;
    grades: boolean;
    examAlerts: boolean;
  };
}

export interface FaheemTeacherProfile {
  teacherId: string;
  fullName: string;
  subjectsTaught: string[];
  classesTaught: string[];
  schoolId: string;
  preferredLanguage: EducationLanguage;
}

export interface FaheemSchoolProfile {
  schoolId: string;
  schoolName: string;
  region: string; // AREF e.g. "Rabat-Salé-Kénitra"
  isPrivate: boolean;
  city: string;
  studentCount: number;
}

export interface FaheemCurriculumUnit {
  code: string;
  subjectCode: string;
  titleAr: string;
  titleFr: string;
  level: EducationLevel;
  track?: HighSchoolTrack;
  competencies: string[];
  examWeighting: ExamType;
}

export interface FaheemAdaptiveState {
  evidenceState?: 'NO_EVIDENCE' | 'INSUFFICIENT_EVIDENCE' | 'OBSERVED';
  sampleSize?: number;
  currentMasteryLevel: number | null; // 0.0 to 1.0 (IRT score), null if NO_EVIDENCE
  bktProbability: number | null;      // 0.0 to 1.0 (BKT pMastery), null if NO_EVIDENCE
  recommendedDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'OLYMPIAD';
  spacedRepetitionDueCount: number;
  weakTopics: string[];
}

export interface FaheemContext {
  role: FaheemRoleContext;
  language: EducationLanguage;
  student?: FaheemStudentProfile;
  parent?: FaheemParentProfile;
  teacher?: FaheemTeacherProfile;
  school?: FaheemSchoolProfile;
  curriculum?: FaheemCurriculumUnit[];
  adaptive?: FaheemAdaptiveState;
  customMetadata?: Record<string, unknown>;
  systemInstruction?: string;
}

export interface FaheemToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface FaheemToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
  success: boolean;
  error?: string;
}

export interface FaheemMessage {
  id: string;
  sessionId: string;
  role: FaheemMessageRole;
  content: string;
  language: EducationLanguage;
  timestamp: string;
  tokensUsed?: {
    inputTokens: number;
    outputTokens: number;
  };
  toolCalls?: FaheemToolCall[];
  toolResults?: FaheemToolResult[];
  metadata?: Record<string, unknown>;
}

export interface FaheemSession {
  id: string;
  userId: string;
  role: FaheemRoleContext;
  schoolId: string;
  language: EducationLanguage;
  context: FaheemContext;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';
}

export interface FaheemSafetyResult {
  isSafe: boolean;
  level: FaheemSafetyLevel;
  reason?: string;
  sanitizedContent: string;
  moderationFlags: {
    piiDetected: boolean;
    cheatingAttempt: boolean;
    inappropriateContent: boolean;
    offTopic: boolean;
  };
}

export interface ProcessFaheemQueryDTO {
  sessionId?: string;
  userId: string;
  query: string;
  role: FaheemRoleContext;
  language?: EducationLanguage;
  studentId?: string;
  schoolId?: string;
  customContext?: Record<string, unknown>;
  enableTools?: boolean;
}

export interface FaheemQueryResponseDTO {
  messageId: string;
  sessionId: string;
  content: string;
  language: EducationLanguage;
  toolExecutions: Array<{
    toolName: string;
    result: unknown;
    durationMs: number;
    success: boolean;
  }>;
  tokensUsed: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  safety: FaheemSafetyResult;
  latencyMs: number;
  suggestedFollowUps: string[];
}

export interface FaheemMetrics {
  totalQueries: number;
  avgLatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  costEstimateMAD: number;
  safetyFlagsCount: number;
  cacheHitRate: number;
  activeSessionsCount: number;
}

export interface FaheemCostReport {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUSD: number;
  totalCostMAD: number; // USD * 10.1 MAD conversion rate
  queryCount: number;
}

export interface FaheemFeatureFlags {
  enableDarijaResponse: boolean;
  enableToolCalling: boolean;
  enableLongTermMemory: boolean;
  enableAdaptiveContext: boolean;
  enableCheatingDetection: boolean;
  enablePromptOptimization: boolean;
  enableStreaming: boolean;
}
