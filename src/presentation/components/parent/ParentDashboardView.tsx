/**
 * Qarayti.ai — Parent Portal: Sub-Module 1: Parent Dashboard
 * Comprehensive overview: Child profile, Today's progress, Weekly/Monthly summaries,
 * AI Alerts, Attendance status, Homework status, Upcoming exams & School announcements.
 */

import React from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import { parentPortalService } from '../../../domain/services/parentPortal.service';
import {
  LayoutDashboard,
  BrainCircuit,
  Clock,
  BookOpen,
  AlertTriangle,
  Bell,
  Calendar,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const ParentDashboardView: React.FC = () => {
  const {
    activeChild,
    attendance,
    homework,
    notifications,
    grades,
    weeklyReports,
    aiRecommendations,
  } = useParentPortal();

  // Child specific data filters
  const childAttendance = attendance.filter((a) => a.childId === activeChild.id);
  const childHomework = homework.filter((h) => h.childId === activeChild.id);
  const childNotifications = notifications.filter((n) => n.childId === activeChild.id && !n.read);
  const childGrades = grades.filter((g) => g.childId === activeChild.id);
  const latestWeeklyReport = weeklyReports.find((w) => w.childId === activeChild.id);
  const childAiRecs = aiRecommendations.filter((r) => r.childId === activeChild.id);

  const attendanceStats = parentPortalService.analyzeAttendance(childAttendance);
  const bacRisk = parentPortalService.predictBaccalaureateRisk(
    activeChild.overallGpa,
    activeChild.attendanceRate,
    activeChild.pendingHomeworkCount
  );

  return (
    <div className="space-y-6">
      {/* Active Child Hero Summary Bar */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={activeChild.avatarUrl}
            alt={activeChild.fullName}
            className="w-16 h-16 rounded-full border-2 border-[#D4AF37] object-cover shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-serif italic text-[#EAE9E6] font-bold">
                {activeChild.fullName}
              </h2>
              <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 border border-[#D4AF37]/30">
                Code Massar: {activeChild.massarCode}
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E9299]">
              {activeChild.gradeLevel} • <span className="text-[#D4AF37]">{activeChild.track}</span>
            </p>
            <p className="text-xs font-serif text-[#8E9299] italic">{activeChild.schoolName}</p>
          </div>
        </div>

        {/* Core KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="bg-[#0F1115] p-3 border border-[#2D333D] text-center">
            <span className="text-[10px] font-mono uppercase text-[#8E9299]">Moyenne Générale</span>
            <p className="text-xl font-serif font-bold text-[#D4AF37]">{activeChild.overallGpa} / 20</p>
            <span className="text-[10px] font-mono text-emerald-400">Rang: {activeChild.classRank}e/{activeChild.totalClassSize}</span>
          </div>

          <div className="bg-[#0F1115] p-3 border border-[#2D333D] text-center">
            <span className="text-[10px] font-mono uppercase text-[#8E9299]">Taux Présence</span>
            <p className="text-xl font-serif font-bold text-emerald-400">{activeChild.attendanceRate}%</p>
            <span className="text-[10px] font-mono text-[#8E9299]">{attendanceStats.absenceCount} Absence(s)</span>
          </div>

          <div className="bg-[#0F1115] p-3 border border-[#2D333D] text-center">
            <span className="text-[10px] font-mono uppercase text-[#8E9299]">Devoirs en Attente</span>
            <p className="text-xl font-serif font-bold text-amber-400">{activeChild.pendingHomeworkCount}</p>
            <span className="text-[10px] font-mono text-[#8E9299]">À rendre cette semaine</span>
          </div>

          <div className="bg-[#0F1115] p-3 border border-[#2D333D] text-center">
            <span className="text-[10px] font-mono uppercase text-[#8E9299]">Frais de Scolarité</span>
            <p className={`text-xl font-serif font-bold ${activeChild.unpaidBalanceMad > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeChild.unpaidBalanceMad} MAD
            </p>
            <span className="text-[10px] font-mono text-[#8E9299]">
              {activeChild.unpaidBalanceMad > 0 ? 'Facture en attente' : 'Réglement à jour'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Risk Prediction & National Exam Readiness Alert */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif italic font-bold text-[#EAE9E6] flex items-center space-x-2">
                <span>Diagnostic Prédictif IA — Baccalauréat National (Qarayti.ai Engine)</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 border uppercase ${
                bacRisk.riskLevel === 'LOW'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : bacRisk.riskLevel === 'MEDIUM'
                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                  : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
              }`}>
                Niveau Risque: {bacRisk.riskLevel} ({bacRisk.score}/100)
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E9299]">
              {bacRisk.predictionLabel}
            </p>
            {latestWeeklyReport && (
              <p className="text-xs font-serif italic text-[#D4AF37] pt-1">
                " {latestWeeklyReport.aiWeeklyInsight} "
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Overview, Homework & AI Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Homework & Recent Grades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Homework Status */}
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D333D] pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-serif italic text-[#EAE9E6] font-bold">
                  Travail à la Maison & Devoirs Programmés ({childHomework.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8E9299]">Suivi quotidien</span>
            </div>

            <div className="space-y-3">
              {childHomework.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-[#0F1115] border border-[#2D333D] p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30">
                        {hw.subject}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#EAE9E6]">{hw.title}</span>
                    </div>
                    <p className="text-xs font-serif text-[#8E9299]">{hw.description}</p>
                    <div className="flex items-center space-x-4 text-[11px] font-mono text-[#8E9299] pt-1">
                      <span>Prof: {hw.teacherName}</span>
                      <span>•</span>
                      <span>Échéance: <strong className="text-[#EAE9E6]">{hw.dueDate}</strong></span>
                      <span>•</span>
                      <span>Durée: {hw.estimatedMinutes} min</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2.5 py-1 border whitespace-nowrap ${
                    hw.status === 'COMPLETED'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                  }`}>
                    {hw.status === 'COMPLETED' ? 'Terminé' : 'En Attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Continuous Assessments & Exam Scores */}
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D333D] pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-serif italic text-[#EAE9E6] font-bold">
                  Dernières Notes & Contrôles Continus (Barème Marocain /20)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8E9299]">Saisie officielle Massar</span>
            </div>

            <div className="space-y-3">
              {childGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="bg-[#0F1115] border border-[#2D333D] p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#EAE9E6]">{grade.subject}</span>
                      <span className="text-[10px] font-mono text-[#8E9299] bg-[#161920] px-2 py-0.5 border border-[#2D333D]">
                        Coeff. {grade.coefficient}
                      </span>
                    </div>
                    <p className="text-xs font-serif text-[#8E9299]">{grade.examTitle}</p>
                    <p className="text-[11px] font-serif italic text-[#8E9299]">"{grade.teacherFeedback}"</p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-2xl font-serif font-bold text-[#D4AF37] block">
                      {grade.score} <span className="text-xs font-mono text-[#8E9299]">/ 20</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#8E9299] block">
                      Moy. Classe: {grade.classAvg}/20
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): AI Alerts & School Announcements */}
        <div className="space-y-6">
          {/* AI Guidance Recommendations */}
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-3">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-serif italic text-[#EAE9E6] font-bold">
                Recommandations Parentales IA
              </h3>
            </div>

            <div className="space-y-3">
              {childAiRecs.map((rec) => (
                <div key={rec.id} className="bg-[#0F1115] border border-[#2D333D] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">{rec.subject}</span>
                    <span className="text-[9px] font-mono uppercase bg-rose-950/40 text-rose-400 border border-rose-500/30 px-1.5 py-0.5">
                      {rec.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-serif italic text-[#EAE9E6] font-bold">{rec.title}</h4>
                  <p className="text-[11px] font-serif text-[#8E9299] leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* School & Teacher Alerts */}
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-3">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-serif italic text-[#EAE9E6] font-bold">
                Alertes Immédiates & Notifications ({childNotifications.length})
              </h3>
            </div>

            <div className="space-y-3">
              {childNotifications.length === 0 ? (
                <p className="text-xs font-mono text-[#8E9299] italic">Aucune alerte urgente en attente.</p>
              ) : (
                childNotifications.map((notif) => (
                  <div key={notif.id} className="bg-[#0F1115] border border-[#2D333D] p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#EAE9E6]">{notif.title}</span>
                      <span className="text-[10px] font-mono text-[#8E9299]">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs font-serif text-[#8E9299]">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
