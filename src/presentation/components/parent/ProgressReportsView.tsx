/**
 * Qarayti.ai — Parent Portal: Sub-Module 3: Progress Reports
 * Visualizes Subject Mastery, Adaptive Learning Progress, Knowledge Graph Summary,
 * Weakness Detection, and AI Recommendations.
 */

import React from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import {
  TrendingUp,
  Brain,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const ProgressReportsView: React.FC = () => {
  const { activeChild, progressReports, aiRecommendations } = useParentPortal();

  const childReports = progressReports.filter((p) => p.childId === activeChild.id);
  const childRecs = aiRecommendations.filter((r) => r.childId === activeChild.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Bilan de Progression & Graphique de Connaissances IA
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Analyse détaillée des compétences maîtrisées, détection des lacunes cognitives et recommandations adaptatives.
          </p>
        </div>
        <div className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 self-start md:self-auto">
          Moyenne Générale: {activeChild.overallGpa} / 20
        </div>
      </div>

      {/* Progress Cards per Subject */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {childReports.map((report) => (
          <div key={report.id} className="bg-[#161920] border border-[#2D333D] p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-[#2D333D] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">
                  Coefficient {report.coefficient} • {report.term}
                </span>
                <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">{report.subject}</h3>
                <p className="text-xs font-mono text-[#8E9299]">Enseignant: {report.teacherName}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-serif font-bold text-[#D4AF37] block">
                  {report.averageGrade} <span className="text-xs text-[#8E9299]">/ 20</span>
                </span>
                <span className="text-[10px] font-mono text-[#8E9299]">
                  Moyenne Classe: {report.classAverage}
                </span>
              </div>
            </div>

            {/* Teacher Appraisal */}
            <div className="bg-[#0F1115] p-3.5 border border-[#2D333D]">
              <span className="text-[10px] font-mono text-[#8E9299] uppercase block mb-1">
                Appréciation Pédagogique
              </span>
              <p className="text-xs font-serif italic text-[#EAE9E6]">"{report.appraisal}"</p>
            </div>

            {/* Competency Mastery List */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#D4AF37] uppercase block font-bold">
                Nœuds de Compétences (Graphe de Connaissances)
              </span>

              <div className="space-y-1.5">
                {report.competencies.map((comp, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0F1115] border border-[#2D333D] p-2.5 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-[#EAE9E6]">{comp.name}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase border ${
                        comp.level === 'MAISTERED'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                          : comp.level === 'IN_PROGRESS'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                          : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {comp.level === 'MAISTERED' ? 'Maîtrisé' : comp.level === 'IN_PROGRESS' ? 'En Cours' : 'À Renforcer'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations & Weakness Detector */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-3">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-base font-serif italic text-[#EAE9E6] font-bold">
            Plan d'Action IA & Détection des Points Vulnerables
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childRecs.map((rec) => (
            <div key={rec.id} className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#D4AF37]">{rec.subject}</span>
                <span className="text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-500/30 px-2 py-0.5">
                  Impact: {rec.impactArea}
                </span>
              </div>
              <h4 className="text-sm font-serif italic text-[#EAE9E6] font-bold">{rec.title}</h4>
              <p className="text-xs font-serif text-[#8E9299]">{rec.description}</p>

              <div className="border-t border-[#2D333D] pt-2 space-y-1">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase block">
                  Étapes Recommandées pour les Parents:
                </span>
                <ul className="list-disc list-inside text-xs font-serif text-[#8E9299] space-y-1">
                  {rec.actionSteps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
