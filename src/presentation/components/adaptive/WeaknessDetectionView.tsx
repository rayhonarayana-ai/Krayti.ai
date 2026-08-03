/**
 * Qarayti.ai — Sub-Module 4: Weakness Detection Component
 * Automated bottleneck diagnostics, root-cause prerequisite graph traversal,
 * error pattern classifier, and 1-click remediation action generator.
 */

import React from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { ShieldAlert, AlertTriangle, ArrowRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

export const WeaknessDetectionView: React.FC = () => {
  const { diagnostics, nodes, masteryMap } = useAdaptiveEngine();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-rose-950/40', border: 'border-rose-500', text: 'text-rose-400', label: 'CRITIQUE' };
      case 'moderate':
        return { bg: 'bg-amber-950/40', border: 'border-amber-500', text: 'text-amber-400', label: 'MODÉRÉ' };
      default:
        return { bg: 'bg-sky-950/40', border: 'border-sky-500', text: 'text-sky-400', label: 'MINEUR' };
    }
  };

  const getGapTypeLabel = (gapType: string) => {
    switch (gapType) {
      case 'prerequisite_deficit':
        return 'Déficit de Prérequis Bloquant';
      case 'conceptual_misunderstanding':
        return 'Incompréhension Conceptuelle Théorique';
      case 'procedural_error':
        return 'Erreur de Procédure & Calcul';
      case 'retention_decay':
        return 'Érosion Mémoire à Long Terme (Oubli)';
      default:
        return gapType;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Détection & Diagnostics des Lacunes</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Analyse d'impact sur le Baccalauréat, identification des goulots d'étranglement et plan de remédiation.
          </p>
        </div>
      </div>

      {diagnostics.length === 0 ? (
        <div className="bg-[#161920] border border-[#2D333D] p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-serif italic text-[#EAE9E6]">Aucune Lacune Majeure Détectée !</h3>
          <p className="text-xs font-mono text-[#8E9299] max-w-md mx-auto">
            Votre niveau de maîtrise BKT est excellent sur l'ensemble des modules du programme Baccalauréat.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {diagnostics.map((diag) => {
            const sev = getSeverityBadge(diag.severity);
            const targetNode = nodes.find((n) => n.id === diag.nodeId);
            const record = masteryMap.get(diag.nodeId);
            const score = record ? record.masteryScore : 0.25;

            return (
              <div
                key={diag.id}
                className={`bg-[#161920] border-l-4 ${sev.border} border-t border-r border-b border-[#2D333D] p-6 space-y-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 border ${sev.border} ${sev.text} ${sev.bg}`}>
                        {sev.label}
                      </span>
                      <span className="text-xs font-mono text-[#D4AF37] uppercase">
                        {getGapTypeLabel(diag.gapType)}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold mt-1">
                      {diag.nodeTitle}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-[10px] font-mono text-[#8E9299]">Score Maîtrise BKT</span>
                      <div className="text-lg font-serif text-rose-400 font-bold">
                        {(score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="border-l border-[#2D333D] pl-4">
                      <span className="text-[10px] font-mono text-[#8E9299]">Impact Examen BAC</span>
                      <div className="text-lg font-serif text-[#D4AF37] font-bold">
                        -{diag.impactScore} pts
                      </div>
                    </div>
                  </div>
                </div>

                {/* Root Cause Prerequisite Chain */}
                <div className="bg-[#0F1115] border border-[#2D333D] p-4 text-xs font-mono space-y-2">
                  <div className="text-[#8E9299] uppercase tracking-wider text-[10px]">
                    Nœuds Prérequis Responsables de la Frustration
                  </div>
                  {diag.rootCauseNodeIds.length === 0 ? (
                    <div className="text-[#EAE9E6]">
                      Aucun prérequis bloquant antérieur. Frustration directe au niveau du concept principal.
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {diag.rootCauseNodeIds.map((rId) => {
                        const rNode = nodes.find((n) => n.id === rId);
                        return (
                          <div
                            key={rId}
                            className="bg-rose-950/30 border border-rose-500/50 text-rose-300 px-3 py-1 flex items-center space-x-2"
                          >
                            <span>{rId}</span>
                            <span>•</span>
                            <span className="font-serif italic">{rNode?.titleFr || rId}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Remediation Action Plan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-xs font-sans text-[#EAE9E6] flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong className="text-[#D4AF37] font-mono">Recommandation: </strong>{diag.remediationRecommendation}</span>
                  </div>

                  <button className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#b8952c] text-[#0F1115] px-4 py-2 text-xs font-mono font-bold transition-all shrink-0">
                    <span>Lancer Remédiation 1-Click</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
