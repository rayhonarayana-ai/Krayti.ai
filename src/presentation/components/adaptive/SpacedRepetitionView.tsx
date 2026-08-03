/**
 * Qarayti.ai — Sub-Module 8: Spaced Repetition (SM-2 & FSRS Engine Inspector)
 * Visualizes the Ebbinghaus memory retention curve R(t) = exp(-t/S), ease factor matrix,
 * and review schedule queues.
 */

import React from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { Clock, TrendingDown, Layers, Calendar, RotateCcw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const SpacedRepetitionView: React.FC = () => {
  const { cards, analytics } = useAdaptiveEngine();

  const dueCards = cards.filter((c) => c.retentionProbability < 0.65);
  const scheduledCards = cards.filter((c) => c.retentionProbability >= 0.65);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Moteur de Répétition Espacée (SM-2 / FSRS)</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Modélisation dynamique de la courbe d'oubli d'Ebbinghaus R(t) et calcul des facteurs de facilité.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ebbinghaus Decay Curve Chart */}
        <div className="lg:col-span-2 bg-[#161920] border border-[#2D333D] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D333D] pb-3">
            <div>
              <span className="text-xs font-mono text-[#D4AF37] uppercase">Modèle Mathématique</span>
              <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
                Courbe d'Érosion Mémoire R(t) = e^(-t / S)
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 border border-emerald-500/40 px-3 py-1 bg-emerald-950/20">
              Rétention Moyenne: {analytics.retentionRate}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.retentionDecayCurve}>
                <defs>
                  <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D333D" />
                <XAxis dataKey="daysAgo" stroke="#8E9299" tickFormatter={(v) => `J-${v}`} />
                <YAxis stroke="#8E9299" domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1115', borderColor: '#2D333D', color: '#EAE9E6' }}
                />
                <Area
                  type="monotone"
                  dataKey="retentionRate"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#retentionGrad)"
                  name="Rétention Réelle (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card Queue & Ease Matrix */}
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
          <div className="border-b border-[#2D333D] pb-3">
            <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
              File d'Attente SM-2
            </div>
            <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold mt-1">
              Cartes dues pour Révision
            </h3>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {cards.map((card) => {
              const isDue = card.retentionProbability < 0.65;
              return (
                <div
                  key={card.id}
                  className={`p-3 border text-xs font-mono space-y-1 ${
                    isDue
                      ? 'bg-rose-950/20 border-rose-500/50 text-rose-300'
                      : 'bg-[#0F1115] border-[#2D333D] text-[#8E9299]'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-[#EAE9E6] truncate max-w-[180px]">{card.prompt}</span>
                    <span className={isDue ? 'text-rose-400' : 'text-emerald-400'}>
                      {(card.retentionProbability * 100).toFixed(0)}% Rét.
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8E9299]">
                    <span>Ease Factor: {card.easeFactor}</span>
                    <span>Intervalle: {card.intervalDays} jours</span>
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
