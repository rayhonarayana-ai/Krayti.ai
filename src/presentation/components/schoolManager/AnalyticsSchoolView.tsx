/**
 * Qarayti.ai — School Manager Portal: Sub-Module 5: School Analytics & BAC Performance
 * Institutional performance indicators, BAC pass predictions by track, top/struggling subjects.
 */

import React from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { BarChart2, TrendingUp, Sparkles, Award, ShieldAlert } from 'lucide-react';

export const AnalyticsSchoolView: React.FC = () => {
  const { analytics } = useSchoolManager();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-lg font-serif italic text-[#EAE9E6]">Analytique Établissement & Previsions BAC</h2>
        </div>
      </div>

      {/* Main KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Taux Prévisionnel Réussite BAC</span>
          <div className="text-3xl font-serif font-bold text-[#10B981]">{analytics.overallBacPassRate}%</div>
          <p className="text-xs font-mono text-[#8E9299]">Calculé d'après les algorithmes IRT/BKT de Qarayti.ai</p>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Taux d'Assiduité Globale</span>
          <div className="text-3xl font-serif font-bold text-[#D4AF37]">{analytics.attendanceRatePercent}%</div>
          <p className="text-xs font-mono text-[#8E9299]">Presence enregistrée sur l'ensemble des classes</p>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Taux de Risque de Décrochage</span>
          <div className="text-3xl font-serif font-bold text-[#EF4444]">{analytics.dropoutRiskPercentage}%</div>
          <p className="text-xs font-mono text-[#EF4444]">Élèves nécessitant un tutorat d'urgence</p>
        </div>
      </div>

      {/* Track Breakdown Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
          Performances Pédagogiques par Filières BAC
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.classAveragesByTrack.map((t, i) => (
            <div key={i} className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-serif font-bold text-[#EAE9E6]">{t.trackName}</span>
                <span className="text-xs font-mono font-bold text-[#D4AF37]">{t.averageScore} / 20</span>
              </div>
              <p className="text-[10px] font-mono text-[#8E9299]">Effectif: {t.studentCount} élèves</p>
              <div className="w-full bg-[#161920] h-2 overflow-hidden border border-[#2D333D]">
                <div
                  className="bg-[#10B981] h-full"
                  style={{ width: `${(t.averageScore / 20) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top & Struggling Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#10B981] text-xs font-mono font-bold uppercase">
            <Award className="w-4 h-4" />
            <span>Matières Excellentes (Pôles de Force)</span>
          </div>
          <div className="space-y-2">
            {analytics.topPerformingSubjects.map((s, i) => (
              <div key={i} className="bg-[#0F1115] p-3 border border-[#2D333D] text-xs font-mono text-[#EAE9E6]">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#EF4444] text-xs font-mono font-bold uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>Matières Nécessitant un Soutien</span>
          </div>
          <div className="space-y-2">
            {analytics.subjectsNeedingSupport.map((s, i) => (
              <div key={i} className="bg-[#0F1115] p-3 border border-[#2D333D] text-xs font-mono text-[#EAE9E6]">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
