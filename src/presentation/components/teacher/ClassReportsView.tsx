/**
 * Qarayti.ai — Teacher Portal: Sub-Module 9: Reports & Council Insights
 * Comprehensive class reports, grade distributions, and AI Conseil de Classe summary.
 */

import React from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { FileText, Sparkles, Award, CheckCircle2, Download, Printer } from 'lucide-react';

export const ClassReportsView: React.FC = () => {
  const { performanceReport, activeClass } = useTeacherPortal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Rapports de Classe & Bilan Pédagogique</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Génération automatique du rapport pour le Conseil de Classe et la Direction Provinciale (MEN).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="bg-[#2D333D] text-[#EAE9E6] px-3 py-1.5 text-xs font-mono hover:bg-[#3d4452] transition-all flex items-center space-x-1">
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
          <button className="bg-[#D4AF37] text-[#0F1115] font-bold px-3 py-1.5 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-6">
        <div className="border-b border-[#2D333D] pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-serif italic font-bold text-[#EAE9E6]">{activeClass.className}</h3>
            <p className="text-xs font-mono text-[#D4AF37] mt-0.5">{activeClass.track} — Coefficient {activeClass.coefficient}</p>
          </div>
          <span className="text-xs font-mono text-[#8E9299]">Semestre 1 — 2025/2026</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
            <span className="text-[10px] font-mono text-[#8E9299] uppercase">Moyenne Classe</span>
            <div className="text-xl font-serif text-[#D4AF37] font-bold mt-1">{performanceReport.averageGrade} / 20</div>
          </div>
          <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
            <span className="text-[10px] font-mono text-[#8E9299] uppercase">Taux de Réussite</span>
            <div className="text-xl font-serif text-[#10B981] font-bold mt-1">{performanceReport.passRatePercentage}%</div>
          </div>
          <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
            <span className="text-[10px] font-mono text-[#8E9299] uppercase">Meilleure Note</span>
            <div className="text-xl font-serif text-[#10B981] font-bold mt-1">{performanceReport.highestGrade} / 20</div>
          </div>
          <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
            <span className="text-[10px] font-mono text-[#8E9299] uppercase">Note Minimale</span>
            <div className="text-xl font-serif text-[#EF4444] font-bold mt-1">{performanceReport.lowestGrade} / 20</div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-[#0F1115] p-5 border border-[#D4AF37]/30 space-y-2">
          <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-mono font-bold uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Avis du Conseil de Classe Généré par Faheem AI</span>
          </div>
          <p className="text-xs font-mono text-[#EAE9E6] leading-relaxed">
            {performanceReport.aiPedagogicalSummary}
          </p>
        </div>
      </div>
    </div>
  );
};
