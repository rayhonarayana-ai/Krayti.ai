/**
 * Qarayti.ai — Sub-Module 9: Difficulty Prediction (2PL Item Response Theory Engine)
 * Item Response Theory (IRT) model predicting success probability P(θ)
 * and item difficulty parameters for Baccalaureate exams.
 */

import React, { useState } from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { IRTEngine } from '../../../core/adaptive/irtEngine';
import { Target, Cpu, Sliders, Zap, CheckCircle, BarChart } from 'lucide-react';

export const DifficultyPredictionView: React.FC = () => {
  const { activeStudent, irtDatabase, nodes } = useAdaptiveEngine();
  const [customTheta, setCustomTheta] = useState<number>(activeStudent.abilityTheta);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Prédiction de Difficulté IRT (Item Response Theory)</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Modèle logistique 2PL calculant la probabilité de réussite P(θ) selon l'aptitude latente de l'étudiant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ability Theta Interactive Slider */}
        <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-6">
          <div className="border-b border-[#2D333D] pb-3">
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
              Paramètre d'Aptitude Latente (θ)
            </span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold mt-1">
              Capacité Étudiant: θ = {customTheta > 0 ? `+${customTheta.toFixed(2)}` : customTheta.toFixed(2)} SD
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono text-[#8E9299]">
              <span>Faible (-3.0)</span>
              <span>Moyen (0.0)</span>
              <span>Élite (+3.0)</span>
            </div>
            <input
              type="range"
              min="-3.0"
              max="3.0"
              step="0.1"
              value={customTheta}
              onChange={(e) => setCustomTheta(parseFloat(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>

          <div className="bg-[#0F1115] border border-[#2D333D] p-4 text-xs font-mono space-y-2">
            <div className="flex justify-between text-[#8E9299]">
              <span>Formule Logistique IRT (2PL):</span>
            </div>
            <div className="text-center font-serif italic text-[#D4AF37] text-sm py-1 bg-[#161920] border border-[#2D333D]">
              P(θ) = 1 / [1 + e^(-α(θ - β))]
            </div>
            <p className="text-[10px] text-[#8E9299] leading-relaxed pt-1">
              Où α = Discrimination de la question, β = Difficulté intrinsèque.
            </p>
          </div>
        </div>

        {/* Question Predictions List */}
        <div className="lg:col-span-2 bg-[#161920] border border-[#2D333D] p-6 space-y-4">
          <div className="border-b border-[#2D333D] pb-3">
            <span className="text-xs font-mono text-[#D4AF37] uppercase">Prédictions par Épreuve</span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
              Probabilités de Réussite Prédites sur le Baccalauréat
            </h3>
          </div>

          <div className="space-y-3">
            {irtDatabase.map((item) => {
              const node = nodes.find((n) => n.id === item.nodeId);
              const pred = IRTEngine.predictDifficulty(customTheta, item);

              let badgeColor = 'text-emerald-400 border-emerald-500 bg-emerald-950/30';
              if (pred.predictedProbability < 0.40) {
                badgeColor = 'text-rose-400 border-rose-500 bg-rose-950/30';
              } else if (pred.predictedProbability < 0.70) {
                badgeColor = 'text-amber-400 border-amber-500 bg-amber-950/30';
              }

              return (
                <div key={item.nodeId} className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-[#8E9299]">{item.questionId} • {node?.subjectName}</div>
                      <div className="text-sm font-serif italic text-[#EAE9E6] font-bold">{node?.titleFr}</div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`text-xs font-mono px-3 py-1 border font-bold ${badgeColor}`}>
                        {pred.difficultyRating} ({(pred.predictedProbability * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-[#161920] h-2 overflow-hidden border border-[#2D333D]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pred.predictedProbability >= 0.7
                          ? 'bg-emerald-400'
                          : pred.predictedProbability < 0.4
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.round(pred.predictedProbability * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-[#8E9299]">
                    <span>Difficulté β: {item.difficultyBeta}</span>
                    <span>Discrimination α: {item.discriminationAlpha}</span>
                    <span>Temps Recommandé: {pred.recommendedTimeSeconds}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
