/**
 * Qarayti.ai — School Manager Portal: Sub-Module 1: Executive Dashboard
 * High-level school KPIs, Massar synchronization state, BAC pass forecast, financial overview.
 */

import React from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import {
  Building2,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  Sparkles,
} from 'lucide-react';

export const SchoolDashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { teachers, students, financeSummary, analytics, exams, announcements } = useSchoolManager();

  const activeTeachers = teachers.filter((t) => t.status === 'ACTIVE').length;
  const activeStudents = students.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#D4AF37]">
            <Building2 className="w-4 h-4" />
            <span>Système d'Exploitation d'Établissement Privé (School OS)</span>
            <span className="text-[#8E9299]">• Synchronisé Massar (MEN)</span>
          </div>
          <h1 className="text-xl font-serif italic text-[#EAE9E6]">
            Lycée Excellence Privé Casablanca — Tableau de Bord Direction
          </h1>
          <p className="text-xs font-mono text-[#8E9299]">
            Supervision stratégique pédagogique, administrative, financière et analytique du système Qarayti.ai.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#0F1115] border border-[#2D333D] p-3 text-right">
            <span className="text-[10px] font-mono text-[#8E9299] uppercase block">Taux de Prédiction BAC</span>
            <span className="text-lg font-serif font-bold text-[#10B981]">{analytics.overallBacPassRate}%</span>
          </div>
          <div className="bg-[#0F1115] border border-[#2D333D] p-3 text-right">
            <span className="text-[10px] font-mono text-[#8E9299] uppercase block">Recouvrement Frais</span>
            <span className="text-lg font-serif font-bold text-[#D4AF37]">{financeSummary.collectionRatePercent}%</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="flex justify-between items-center text-[#8E9299]">
            <span className="text-[10px] font-mono uppercase">Effectif Élèves</span>
            <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#EAE9E6]">{activeStudents}</div>
          <div className="text-[10px] font-mono text-[#10B981]">100% enregistrés Massar</div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="flex justify-between items-center text-[#8E9299]">
            <span className="text-[10px] font-mono uppercase">Corps Enseignant</span>
            <Users className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#EAE9E6]">{activeTeachers}</div>
          <div className="text-[10px] font-mono text-[#8E9299]">Agrégés & Docteurs</div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="flex justify-between items-center text-[#8E9299]">
            <span className="text-[10px] font-mono uppercase">Revenus Mensuels</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#D4AF37]">
            {(financeSummary.totalRevenueMAD / 1000).toFixed(0)}k MAD
          </div>
          <div className="text-[10px] font-mono text-[#EF4444]">
            Reste à recouvrer: {(financeSummary.pendingTuitionMAD / 1000).toFixed(0)}k MAD
          </div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="flex justify-between items-center text-[#8E9299]">
            <span className="text-[10px] font-mono uppercase">Risque de Décrochage</span>
            <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#EF4444]">{analytics.dropoutRiskPercentage}%</div>
          <div className="text-[10px] font-mono text-[#8E9299]">Identifiés par Faheem AI</div>
        </div>
      </div>

      {/* Main Grid: Track Performances & Quick Management Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Performances */}
        <div className="lg:col-span-2 bg-[#161920] border border-[#2D333D] p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#2D333D] pb-3">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Moyennes Générales par Filière BAC</h3>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-mono text-[#D4AF37] hover:underline"
            >
              Voir Rapport Détaillé
            </button>
          </div>

          <div className="space-y-3">
            {analytics.classAveragesByTrack.map((track, i) => (
              <div key={i} className="bg-[#0F1115] border border-[#2D333D] p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-serif font-bold text-[#EAE9E6]">{track.trackName}</div>
                  <div className="text-[10px] font-mono text-[#8E9299]">{track.studentCount} élèves inscrits</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-serif font-bold text-[#D4AF37]">{track.averageScore} / 20</div>
                  <div className="text-[10px] font-mono text-[#10B981]">Conforme Seuil National</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0F1115] border border-[#D4AF37]/30 p-4 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-[#EAE9E6] leading-relaxed">
              <strong className="text-[#D4AF37] block mb-1">Recommandation Direction Faheem AI:</strong>
              Renforcer les séances de soutien en <strong>Physique-Chimie</strong> pour la filière PC afin de combler l'écart de 1.4 point avec la filière Sciences Mathématiques avant le Bac Blanc.
            </div>
          </div>
        </div>

        {/* Right Sidebar: Upcoming Exams & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
              Prochains Examens Officiels
            </h3>
            <div className="space-y-3">
              {exams.slice(0, 3).map((ex) => (
                <div key={ex.id} className="bg-[#0F1115] p-3 border border-[#2D333D] space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#D4AF37]">
                    <span>{ex.examType}</span>
                    <span>{ex.date}</span>
                  </div>
                  <div className="text-xs font-serif font-bold text-[#EAE9E6]">{ex.title}</div>
                  <div className="text-[10px] font-mono text-[#8E9299]">Superviseur: {ex.leadSupervisor}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-3">
            <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-2">
              Accès Rapide Modules OS
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button onClick={() => onNavigate('teachers')} className="p-2 bg-[#0F1115] border border-[#2D333D] hover:border-[#D4AF37] text-left text-[#EAE9E6]">
                Profs ({teachers.length})
              </button>
              <button onClick={() => onNavigate('finance')} className="p-2 bg-[#0F1115] border border-[#2D333D] hover:border-[#D4AF37] text-left text-[#EAE9E6]">
                Finance & Paie
              </button>
              <button onClick={() => onNavigate('timetable')} className="p-2 bg-[#0F1115] border border-[#2D333D] hover:border-[#D4AF37] text-left text-[#EAE9E6]">
                Emplois du temps
              </button>
              <button onClick={() => onNavigate('documents')} className="p-2 bg-[#0F1115] border border-[#2D333D] hover:border-[#D4AF37] text-left text-[#EAE9E6]">
                Documents MEN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
