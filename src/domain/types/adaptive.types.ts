/**
 * Qarayti.ai — Adaptive Learning Engine Domain Types
 * Strict typing for Knowledge Graphs, Mastery Tracing (BKT), Item Response Theory (IRT),
 * Spaced Repetition (SM-2/FSRS), Weakness Diagnostics, and Analytics.
 */

import { EducationLevel, HighSchoolTrack } from './education.types';

export type BloomLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'mastered' | 'weak';

export interface KnowledgeNode {
  id: string;
  code: string;
  titleAr: string;
  titleFr: string;
  subjectId: string;
  subjectName: string;
  level: EducationLevel;
  track?: HighSchoolTrack;
  prerequisiteIds: string[];
  complexity: number; // 1 - 5
  bloomLevel: BloomLevel;
  estimatedMinutes: number;
  nationalExamWeight: number; // Coefficient/Percentage weight in Moroccan BAC
  description: string;
}

export interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: 'prerequisite' | 'builds_on' | 'corequisite' | 'application';
  strength: number; // 0.1 to 1.0
}

export interface BKTState {
  pKnown: number;   // Prior probability student knows concept P(L_t)
  pTransit: number; // Probability of learning transition P(T)
  pSlip: number;    // Probability of mistake given known P(S)
  pGuess: number;   // Probability of correct answer given unknown P(G)
}

export interface MasteryRecord {
  nodeId: string;
  masteryScore: number; // 0.0 to 1.0 (derived from BKT)
  confidenceInterval: [number, number]; // [lower, upper]
  stabilityDays: number; // Memory stability in days
  bkt: BKTState;
  attemptsCount: number;
  correctCount: number;
  lastAttemptDate: string; // ISO date
  bloomsDistribution: Record<BloomLevel, number>; // 0 to 1 score per bloom level
}

export interface SkillTreeNode {
  id: string;
  nodeId: string;
  title: string;
  titleAr: string;
  category: string; // e.g., 'Analysis', 'Algebra', 'Electricity', 'Mechanics'
  tier: number; // 1 to 5
  status: NodeStatus;
  iconName: string;
  xpReward: number;
  prerequisiteSkillIds: string[];
}

export interface WeaknessDiagnostic {
  id: string;
  nodeId: string;
  nodeTitle: string;
  subjectId: string;
  severity: 'critical' | 'moderate' | 'minor';
  gapType: 'prerequisite_deficit' | 'conceptual_misunderstanding' | 'procedural_error' | 'retention_decay';
  impactScore: number; // 1-100 impact on BAC exam readiness
  rootCauseNodeIds: string[];
  remediationRecommendation: string;
  detectedAt: string;
}

export interface Recommendation {
  id: string;
  nodeId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  reason: string;
  reasonBadge: 'Prerequisite Deficit' | 'Overdue Revision' | 'BAC High Weight' | 'Mastery Push' | 'Weakness Remediation';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  priorityScore: number; // 0 to 100
  expectedMasteryGain: number; // e.g. +0.15
  estimatedTimeMinutes: number;
  exerciseType: 'flashcards' | 'quiz' | 'problem_solving' | 'concept_review';
}

export interface DailyPlanItem {
  id: string;
  recommendationId?: string;
  nodeId: string;
  taskTitle: string;
  subjectName: string;
  durationMinutes: number;
  completed: boolean;
  priorityScore: number;
  exerciseType: 'flashcards' | 'quiz' | 'problem_solving' | 'concept_review';
  scheduledTime: string; // e.g. "09:00 AM"
}

export interface SpacedRepetitionCard {
  id: string;
  nodeId: string;
  subjectId: string;
  prompt: string;
  promptAr?: string;
  answer: string;
  answerAr?: string;
  hint?: string;
  intervalDays: number;
  easeFactor: number; // Standard SM-2 starting at 2.5
  repetitionCount: number;
  lastReviewDate: string;
  nextReviewDate: string;
  retentionProbability: number; // Current calculated memory retention (Ebbinghaus curve)
}

export interface IRTItemParameters {
  nodeId: string;
  questionId: string;
  difficultyBeta: number; // -3.0 to +3.0
  discriminationAlpha: number; // 0.5 to 2.5
  pseudoguessingGamma: number; // 0.0 to 0.25
}

export interface DifficultyPrediction {
  nodeId: string;
  questionId?: string;
  studentTheta: number; // -3.0 to +3.0 (ability estimate)
  itemDifficultyBeta: number;
  itemDiscriminationAlpha: number;
  predictedProbability: number; // P(Correct) between 0 and 1
  confidenceLevel: number; // 0 to 1
  recommendedTimeSeconds: number;
  difficultyRating: 'Very Easy' | 'Easy' | 'Moderate' | 'Challenging' | 'Hard' | 'Extreme';
}

export interface LearningAnalytics {
  velocity: number; // Mastery nodes per week
  retentionRate: number; // Percentage 0-100
  overallMastery: number; // Percentage 0-100
  studyMinutesToday: number;
  weakNodesCount: number;
  masteredNodesCount: number;
  totalNodesCount: number;
  forecastBacScore: number; // 0 to 20 scale in Moroccan Baccalaureate
  masteryBySubject: Array<{
    subjectId: string;
    subjectName: string;
    masteryScore: number;
    nodeCount: number;
  }>;
  retentionDecayCurve: Array<{
    daysAgo: number;
    retentionRate: number;
    predictedRetention: number;
  }>;
  accuracyTrend: Array<{
    date: string;
    accuracy: number;
    attempts: number;
  }>;
}

export interface StudentProfile {
  id: string;
  name: string;
  level: EducationLevel;
  track: HighSchoolTrack;
  abilityTheta: number; // Current overall IRT ability
  xp: number;
  streakDays: number;
  targetBacScore: number; // Out of 20
}
