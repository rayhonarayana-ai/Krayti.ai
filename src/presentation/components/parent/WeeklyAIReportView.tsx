/**
 * Qarayti.ai — Parent Portal: Sub-Module 9: Weekly AI Report
 * Automated synthesis report: Strengths, Weaknesses, Risk Prediction, Study & Parent Recommendations.
 */

import React, { useState } from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import { parentPortalService } from '../../../domain/services/parentPortal.service';
import {
  FileText,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Award,
} from 'lucide-react';

export const WeeklyAIReportView: React.FC = () => {
  const { activeChild, weeklyReports, progressReports, attendance, homework } = useParentPortal();
  const [isGenerating, setIsGenerating] = useState(false);

  const childReport = weeklyReports.find((w) => w.childId === activeChild.id);
  const childProgress = progressReports.filter((p) => p.childId === activeChild.id);
  const childAttendance = attendance.filter((a) => a.childId === activeChild.id);
  const childHomework = homework.filter((h) => h.childId === activeChild.id);

  const bacRisk = parentPortalService.predictBaccalaureateRisk(
    activeChild.overallGpa,
    activeChild.attendanceRate,
    activeChild.pendingHomeworkCount
  );

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Rapport Synthétique Hebdomadaire IA (Parent Digest)
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Génération automatique hebdomadaire: points forts, lacunes à surveiller, risque académique et conseils d'accompagnement.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold text-xs font-mono uppercase hover:bg-amber-400 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Analyse IA en cours...' : 'Régénérer Synthèse IA'}</span>
        </button>
      </div>

      {/* Main Weekly Report Card */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2D333D] pb-4 gap-2">
          <div>
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider block">
              {childReport?.weekLabel || 'Semaine N°22 (27 Jan - 02 Fév 2026)'}
            </span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
              Dossier Académique de {activeChild.fullName}
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-[#0F1115] border border-[#2D333D] p-2 text-center">
              <span className="text-[9px] text-[#8E9299] uppercase block">Score d'Engagement IA</span>
              <span className="text-lg font-serif font-bold text-[#D4AF37]">
                {childReport?.focusScore || 92} / 100
              </span>
            </div>
          </div>
        </div>

        {/* AI Insight Summary Box */}
        <div className="bg-[#0F1115] p-4 border border-[#2D333D] space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">
              Avis Pédagogique du Moteur IA Qarayti.ai:
            </span>
          </div>
          <p className="text-xs font-serif italic text-[#EAE9E6] leading-relaxed">
            "{childReport?.aiWeeklyInsight}"
          </p>
        </div>

        {/* 4 Pillars Grid: Strengths, Weaknesses, Risk Prediction, Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Strengths (Points Forts) */}
          <div className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">
                1. Points Forts & Réussites Académiques
              </h4>
            </div>
            <ul className="space-y-2 text-xs font-serif text-[#EAE9E6]">
              <li className="flex items-start space-x-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Excellente assimilation des Nombres Complexes en Mathématiques (Note: 19/20 - Top 2 de la classe).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Régularité parfaite sur la soumission des TP de Physique-Chimie dans les délais impartis.</span>
              </li>
            </ul>
          </div>

          {/* 2. Weaknesses & Vulnerabilities (Points de Vigilance) */}
          <div className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">
                2. Lacunes & Zones de Progrès Identifiées
              </h4>
            </div>
            <ul className="space-y-2 text-xs font-serif text-[#EAE9E6]">
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Besoin de structurer la partie dialectique en Philosophie pour franchir le palier des 16/20.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>1 absence signalée ce lundi au cours de Physique (Justificatif à valider).</span>
              </li>
            </ul>
          </div>

          {/* 3. Baccalaureate Risk Prediction */}
          <div className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-2">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="text-xs font-mono font-bold text-[#D4AF37] uppercase">
                3. Modèle Prédictif Bac National (2ème BAC Sc. Math)
              </h4>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <p className="text-[#EAE9E6] font-bold">{bacRisk.predictionLabel}</p>
              <p className="text-[#8E9299]">
                Score global d'évaluation nationale: <strong className="text-[#D4AF37]">{bacRisk.score} / 100</strong>
              </p>
            </div>
          </div>

          {/* 4. Parent Recommendations */}
          <div className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="text-xs font-mono font-bold text-[#D4AF37] uppercase">
                4. Recommandations d'Accompagnement Parent
              </h4>
            </div>
            <ul className="space-y-2 text-xs font-serif text-[#EAE9E6]">
              <li className="flex items-start space-x-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Encourager 45 minutes de révision guidée le vendredi soir sur le module d'Analyse Asymptotique.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Vérifier la bonne préparation du Bac Blanc de Philosophie prévu en mi-mars.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
