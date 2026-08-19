/**
 * Qarayti.ai — Sub-Module 3: Mastery Tracking Component
 * Deep Bayesian Knowledge Tracing (BKT) inspector showing prior knowledge probabilities,
 * confidence interval bounds, stability scores, and Bloom's Taxonomy breakdown.
 */

import React, { useState } from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { KnowledgeNode, BloomLevel } from '../../../domain/types/adaptive.types';
import { Activity, ShieldCheck, HelpCircle, CheckCircle, XCircle, Info, BarChart2 } from 'lucide-react';

export const MasteryTrackingView: React.FC = () => {
  const { nodes, masteryMap, submitNodeQuizAnswer } = useAdaptiveEngine();
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode>(nodes[0]);
  const [simulatedTime, setSimulatedTime] = useState<number>(45);

  const currentRecord = masteryMap.get(selectedNode.id);
  const isObserved = currentRecord && currentRecord.evidenceState === 'OBSERVED' && currentRecord.masteryScore !== null;
  const pKnown = isObserved ? currentRecord.masteryScore : null;
  const confidence = currentRecord ? currentRecord.confidenceInterval : [0, 0];
  const bkt = currentRecord ? currentRecord.bkt : { pKnown: 0, pTransit: 0.15, pSlip: 0.1, pGuess: 0.2 };

  const bloomLevels: BloomLevel[] = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Suivi de Maîtrise BKT & Taxonomie de Bloom</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Modèle probabiliste Bayesian Knowledge Tracing (BKT) et distribution multidimensionnelle de Bloom.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Node Selection List */}
        <div className="bg-[#161920] border border-[#2D333D] p-4 space-y-2">
          <div className="text-xs font-mono text-[#8E9299] uppercase tracking-wider mb-2">Sélectionner un Nœud</div>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {nodes.map((node) => {
              const rec = masteryMap.get(node.id);
              const nodeObserved = rec && rec.evidenceState === 'OBSERVED' && rec.masteryScore !== null;
              const isSelected = selectedNode.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#0F1115] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                      : 'bg-[#161920] border-[#2D333D] hover:border-[#8E9299]'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono text-[#8E9299]">{node.code}</div>
                    <div className="text-xs font-serif italic text-[#EAE9E6] font-bold">{node.titleFr}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-[#D4AF37] font-bold">
                      {nodeObserved ? `${((rec?.masteryScore || 0) * 100).toFixed(0)}%` : '--%'}
                    </div>
                    <div className="text-[9px] font-mono text-[#8E9299]">
                      {rec?.attemptsCount || 0} ess.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed BKT Inspector */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main BKT Score Card */}
          <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2D333D] pb-4 gap-2">
              <div>
                <span className="text-xs font-mono text-[#D4AF37] uppercase">{selectedNode.subjectName}</span>
                <h3 className="text-2xl font-serif italic text-[#EAE9E6] font-bold">{selectedNode.titleFr}</h3>
                <p className="text-sm font-sans text-[#8E9299] dir-rtl text-right font-medium">{selectedNode.titleAr}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-[#8E9299]">Probabilité P(L_t)</span>
                <div className="text-3xl font-serif font-bold text-[#D4AF37]">
                  {pKnown !== null ? `${(pKnown * 100).toFixed(1)}%` : 'Non évalué'}
                </div>
                <div className="text-[10px] font-mono text-emerald-400">
                  {isObserved ? `IC: [${(confidence[0] * 100).toFixed(0)}% — ${(confidence[1] * 100).toFixed(0)}%]` : 'En attente d\'observation'}
                </div>
              </div>
            </div>

            {/* BKT Parameter Grid */}
            <div>
              <div className="text-xs font-mono text-[#8E9299] uppercase tracking-wider mb-3">
                Paramètres Probabilistes BKT en Temps Réel
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0F1115] border border-[#2D333D] p-3 text-xs font-mono">
                  <span className="text-[#8E9299]">P(Known):</span>
                  <div className="text-lg text-[#EAE9E6] font-bold mt-1">{bkt.pKnown}</div>
                  <span className="text-[9px] text-[#8E9299]">Connaissance a priori</span>
                </div>
                <div className="bg-[#0F1115] border border-[#2D333D] p-3 text-xs font-mono">
                  <span className="text-[#8E9299]">P(Transit):</span>
                  <div className="text-lg text-emerald-400 font-bold mt-1">{bkt.pTransit}</div>
                  <span className="text-[9px] text-[#8E9299]">Taux d'apprentissage</span>
                </div>
                <div className="bg-[#0F1115] border border-[#2D333D] p-3 text-xs font-mono">
                  <span className="text-[#8E9299]">P(Slip):</span>
                  <div className="text-lg text-rose-400 font-bold mt-1">{bkt.pSlip}</div>
                  <span className="text-[9px] text-[#8E9299]">Erreur inattention</span>
                </div>
                <div className="bg-[#0F1115] border border-[#2D333D] p-3 text-xs font-mono">
                  <span className="text-[#8E9299]">P(Guess):</span>
                  <div className="text-lg text-amber-400 font-bold mt-1">{bkt.pGuess}</div>
                  <span className="text-[9px] text-[#8E9299]">Chance de réussite</span>
                </div>
              </div>
            </div>

            {/* Bloom's Taxonomy Breakdown */}
            <div>
              <div className="text-xs font-mono text-[#8E9299] uppercase tracking-wider mb-3">
                Niveaux Cognitifs (Taxonomie de Bloom)
              </div>
              <div className="space-y-2">
                {bloomLevels.map((lvl) => {
                  const score = currentRecord?.bloomsDistribution[lvl] || 0.3;
                  return (
                    <div key={lvl} className="flex items-center space-x-3 text-xs font-mono">
                      <span className="w-28 text-[#8E9299]">{lvl}</span>
                      <div className="flex-1 bg-[#0F1115] border border-[#2D333D] h-3 overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full transition-all duration-300"
                          style={{ width: `${Math.round(score * 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[#EAE9E6] font-bold">
                        {(score * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Simulation Sandbox */}
            <div className="border-t border-[#2D333D] pt-4">
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
                Simuler une Réponse Interactive (Mise à Jour BKT Directe)
              </span>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button
                  onClick={() => submitNodeQuizAnswer(selectedNode.id, 'q-sim', true, simulatedTime)}
                  className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500 text-emerald-400 hover:bg-emerald-900/60 px-4 py-2 text-xs font-mono transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Réponse Correcte (C = 1)</span>
                </button>

                <button
                  onClick={() => submitNodeQuizAnswer(selectedNode.id, 'q-sim', false, simulatedTime)}
                  className="flex items-center space-x-2 bg-rose-950/40 border border-rose-500 text-rose-400 hover:bg-rose-900/60 px-4 py-2 text-xs font-mono transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Réponse Incorrecte (C = 0)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
