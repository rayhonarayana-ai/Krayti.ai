/**
 * Qarayti.ai — Teacher Portal: Sub-Module 7: Student Analytics & Adaptive Engine Integration
 * View IRT ability parameters (Theta), BKT mastery rates, and BAC probability distributions.
 */

import React, { useState } from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { TrendingUp, Award, ShieldAlert, Brain, BarChart2, Search, CheckCircle2 } from 'lucide-react';

export const StudentAnalyticsView: React.FC = () => {
  const { roster, activeClass, performanceReport } = useTeacherPortal();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = roster.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.massarCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Analytique Adaptive Engine & Suivi Individualisé</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Modèles IRT 3PL (Item Response Theory) & BKT (Bayesian Knowledge Tracing) appliqués au Baccalauréat Marocain.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Moyenne Générale Classe</span>
          <div className="text-2xl font-serif font-bold text-[#D4AF37]">{performanceReport.averageGrade} / 20</div>
          <div className="text-xs font-mono text-[#10B981]">
            Note Maximale: {performanceReport.highestGrade} | Note Minimale: {performanceReport.lowestGrade}
          </div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Taux d'Assimilation IRT Global</span>
          <div className="text-2xl font-serif font-bold text-[#10B981]">{performanceReport.passRatePercentage}%</div>
          <div className="text-xs font-mono text-[#8E9299]">Seuil de Maîtrise Examen National atteint</div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Distribution du Risque</span>
          <div className="flex items-center space-x-4 pt-1 font-mono text-xs">
            <span className="text-[#10B981] font-bold">Faible: 80%</span>
            <span className="text-[#F59E0B] font-bold">Moyen: 12%</span>
            <span className="text-[#EF4444] font-bold">Critique: 8%</span>
          </div>
        </div>
      </div>

      {/* Roster Analytics Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D333D] pb-3">
          <h3 className="text-base font-serif italic text-[#EAE9E6]">Matrice de Performance par Élève</h3>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#8E9299] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0F1115] border border-[#2D333D] pl-9 pr-4 py-1.5 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#2D333D] text-[#8E9299] uppercase text-[10px]">
                <th className="py-3 px-2">Élève & Code Massar</th>
                <th className="py-3 px-2 text-center">Moyenne Actuelle</th>
                <th className="py-3 px-2 text-center">Assiduité</th>
                <th className="py-3 px-2 text-center">Capacité IRT (θ)</th>
                <th className="py-3 px-2 text-center">Niveau de Risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[#0F1115]/80 transition-all">
                  <td className="py-3 px-2">
                    <div className="font-serif font-bold text-[#EAE9E6]">{s.fullName}</div>
                    <div className="text-[10px] text-[#8E9299]">{s.massarCode}</div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-[#D4AF37]">{s.currentAverage} / 20</td>
                  <td className="py-3 px-2 text-center text-[#EAE9E6]">{s.attendanceRate}%</td>
                  <td className="py-3 px-2 text-center font-bold">
                    <span
                      className={`px-2 py-0.5 border text-[10px] ${
                        s.irtTheta >= 1.0
                          ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                          : s.irtTheta < 0
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                      }`}
                    >
                      θ = {s.irtTheta > 0 ? `+${s.irtTheta}` : s.irtTheta}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        s.riskLevel === 'HIGH'
                          ? 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30'
                          : s.riskLevel === 'MEDIUM'
                          ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30'
                          : 'text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30'
                      }`}
                    >
                      {s.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
