/**
 * Qarayti.ai — Sub-Module 5: Recommendation Engine Component
 * Multi-factor algorithmic activity prioritizer providing next-best action,
 * expected mastery gain, estimated time, and structural justification.
 */

import React from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { Compass, Clock, Zap, ArrowRight, CheckCircle2, Award } from 'lucide-react';

export const RecommendationEngineView: React.FC = () => {
  const { recommendations } = useAdaptiveEngine();

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Prerequisite Deficit':
        return { bg: 'bg-rose-950/40', border: 'border-rose-500', text: 'text-rose-400' };
      case 'Weakness Remediation':
        return { bg: 'bg-amber-950/40', border: 'border-amber-500', text: 'text-amber-400' };
      case 'Overdue Revision':
        return { bg: 'bg-sky-950/40', border: 'border-sky-500', text: 'text-sky-400' };
      case 'BAC High Weight':
        return { bg: 'bg-emerald-950/40', border: 'border-emerald-500', text: 'text-emerald-400' };
      default:
        return { bg: 'bg-purple-950/40', border: 'border-purple-500', text: 'text-purple-400' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Moteur de Recommandations Intelligentes</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Priorisation algorithmique (Next Best Action) selon la valeur ajoutée sur la note finale du Baccalauréat.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="bg-[#161920] border border-[#2D333D] p-12 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Aucune Recommandation Urgente</h3>
            <p className="text-xs font-mono text-[#8E9299] max-w-md mx-auto">
              Toutes les compétences sont à jour ou en attente d'évaluation initiale. Commencez vos leçons pour générer un parcours personnalisé.
            </p>
          </div>
        ) : (
          recommendations.map((rec, index) => {
          const badgeStyle = getBadgeStyle(rec.reasonBadge);

          return (
            <div
              key={rec.id}
              className={`bg-[#161920] border border-[#2D333D] hover:border-[#D4AF37]/60 p-6 transition-all ${
                index === 0 ? 'ring-1 ring-[#D4AF37] bg-[#161920]/90 shadow-lg' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 border border-[#D4AF37]/30">
                      #0{index + 1} PRIORITÉ {rec.priorityScore}/100
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 border ${badgeStyle.border} ${badgeStyle.text} ${badgeStyle.bg}`}>
                      {rec.reasonBadge}
                    </span>
                    <span className="text-xs font-mono text-[#8E9299]">{rec.subjectName}</span>
                  </div>

                  <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
                    {rec.title}
                  </h3>

                  <p className="text-xs font-sans text-[#8E9299] leading-relaxed max-w-2xl">
                    <strong className="text-[#EAE9E6] font-mono">Justification Moteur: </strong>{rec.reason}
                  </p>
                </div>

                {/* Expected Gain & Time */}
                <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-[#2D333D] pt-4 md:pt-0 md:pl-6 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-[#8E9299]">Durée Estimée</span>
                    <div className="text-lg font-mono text-[#EAE9E6] font-bold flex items-center justify-center space-x-1 mt-1">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      <span>{rec.estimatedTimeMinutes} min</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-mono text-[#8E9299]">Gain Maîtrise</span>
                    <div className="text-lg font-mono text-emerald-400 font-bold mt-1">
                      +{(rec.expectedMasteryGain * 100).toFixed(0)}%
                    </div>
                  </div>

                  <button className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#b8952c] text-[#0F1115] px-4 py-2.5 text-xs font-mono font-bold transition-all">
                    <span>Démarrer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
