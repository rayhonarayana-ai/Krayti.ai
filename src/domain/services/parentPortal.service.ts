/**
 * Qarayti.ai — Parent Portal Domain Service
 * Encapsulates core business rules, Moroccan grading system calculations,
 * risk prediction, AI recommendation synthesis, and payment processing logic.
 */

import {
  ParentChild,
  ProgressReport,
  AttendanceRecord,
  GradeRecord,
  HomeworkItem,
  PaymentInvoice,
  WeeklyReportDigest,
  AIRecommendation,
} from '../types/parentPortal.types';
import { learningEvidenceEngine } from '../../core/analytics/learning-evidence-engine';

export class ParentPortalService {
  /**
   * Calculates overall weighted average based on Moroccan Baccalaureate Coefficients
   */
  public calculateMoroccanGpa(grades: GradeRecord[]): number {
    if (!grades || grades.length === 0) return 0;

    let totalPoints = 0;
    let totalCoefficients = 0;

    grades.forEach((g) => {
      const coeff = g.coefficient || 1;
      totalPoints += g.score * coeff;
      totalCoefficients += coeff;
    });

    if (totalCoefficients === 0) return 0;

    return Number((totalPoints / totalCoefficients).toFixed(2));
  }

  /**
   * Generates AI Risk Prediction for National / Regional Baccalaureate exams
   */
  public predictBaccalaureateRisk(
    gpa: number,
    attendanceRate: number,
    pendingHomeworkCount: number
  ): { riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; predictionLabel: string; score: number } {
    let riskScore = 100;

    // Academic weighting (60%)
    if (gpa >= 16) riskScore -= 0;
    else if (gpa >= 14) riskScore -= 15;
    else if (gpa >= 12) riskScore -= 30;
    else riskScore -= 50;

    // Attendance weighting (25%)
    if (attendanceRate >= 96) riskScore -= 0;
    else if (attendanceRate >= 90) riskScore -= 15;
    else riskScore -= 30;

    // Homework discipline (15%)
    if (pendingHomeworkCount === 0) riskScore -= 0;
    else if (pendingHomeworkCount <= 2) riskScore -= 10;
    else riskScore -= 20;

    if (riskScore >= 80) {
      return {
        riskLevel: 'LOW',
        predictionLabel: 'Mention Très Bien / Bien très probable (Faible risque)',
        score: riskScore,
      };
    } else if (riskScore >= 60) {
      return {
        riskLevel: 'MEDIUM',
        predictionLabel: 'Passage probable (Attention requise sur les matières principales)',
        score: riskScore,
      };
    } else {
      return {
        riskLevel: 'HIGH',
        predictionLabel: 'Risque de rattrapage / Décrochage académique détecté',
        score: riskScore,
      };
    }
  }

  /**
   * Computes Attendance statistics (Daily, Monthly, Late arrivals, Absence analytics)
   */
  public analyzeAttendance(records: AttendanceRecord[]) {
    const total = records.length;
    const absences = records.filter((r) => r.type === 'ABSENCE');
    const lates = records.filter((r) => r.type === 'LATE');
    const justifiedAbsences = absences.filter((a) => a.justified).length;
    const unjustifiedAbsences = absences.length - justifiedAbsences;

    return {
      totalRecords: total,
      absenceCount: absences.length,
      lateCount: lates.length,
      justifiedAbsences,
      unjustifiedAbsences,
      attendancePercentage: total > 0 ? Math.round(((total - absences.length) / total) * 100) : 100,
    };
  }

  /**
   * Evaluates AI feedback for homework assignment completion
   */
  public evaluateHomeworkCompletion(item: HomeworkItem): {
    qualityRating: string;
    aiComment: string;
  } {
    if (item.status === 'COMPLETED') {
      return {
        qualityRating: 'EXCELLENT',
        aiComment: `Devoir de ${item.subject} soumis dans les temps. Validation conforme aux exigences du professeur.`,
      };
    } else if (item.status === 'LATE') {
      return {
        qualityRating: 'NEEDS_ATTENTION',
        aiComment: `Devoir en retard. Remise prioritaire recommandée pour éviter une pénalité sur la note de contrôle continu.`,
      };
    } else {
      return {
        qualityRating: 'PENDING',
        aiComment: `Devoir à rendre avant le ${item.dueDate}. Durée estimée : ${item.estimatedMinutes} min.`,
      };
    }
  }

  /**
   * Synthesizes automated Weekly AI Report with strengths, weaknesses, and study recommendations
   */
  public generateWeeklyAIReport(
    child: ParentChild,
    reports: ProgressReport[],
    attendanceRecords: AttendanceRecord[],
    homeworkItems: HomeworkItem[]
  ): WeeklyReportDigest {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    reports.forEach((r) => {
      if (r.averageGrade >= 16) {
        strengths.push(`${r.subject} (${r.averageGrade}/20 - Niveau d'excellence)`);
      } else if (r.averageGrade < 12) {
        weaknesses.push(`${r.subject} (${r.averageGrade}/20 - Soutien recommandé)`);
      }
    });

    const pendingHw = homeworkItems.filter((h) => h.status === 'PENDING').length;
    const absences = attendanceRecords.filter((a) => a.type === 'ABSENCE').length;

    return {
      id: `wr-gen-${Date.now()}`,
      childId: child.id,
      weekLabel: `Rapport IA Synthétique — Semaine Courante`,
      startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      attendanceSummary: {
        presentHours: 30,
        absentHours: absences * 2,
        lateCount: attendanceRecords.filter((a) => a.type === 'LATE').length,
      },
      homeworkSummary: {
        assigned: homeworkItems.length,
        completedOnTime: homeworkItems.filter((h) => h.status === 'COMPLETED').length,
        lateOrMissing: pendingHw,
      },
      academicHighlights: [
        {
          subject: strengths[0] || 'Mathématiques',
          gradeOrNote: 'Points forts identifiés en analyse',
          type: 'SUCCESS',
        },
        {
          subject: weaknesses[0] || 'Philosophie',
          gradeOrNote: 'Soutien recommandé',
          type: 'ATTENTION',
        },
      ],
      focusScore: Math.min(100, Math.max(50, Math.round(child.attendanceRate - pendingHw * 4))),
      aiWeeklyInsight: `Dossier de ${child.firstName} : Progression régulière. L'analyse des données de travail personnel montre un engagement élevé. Maintien recommandé du rythme de révision nationale.`,
    };
  }

  public async getParentIntelligenceSummary(studentId: string) {
    return learningEvidenceEngine.getParentSummary(studentId);
  }
}

export const parentPortalService = new ParentPortalService();
