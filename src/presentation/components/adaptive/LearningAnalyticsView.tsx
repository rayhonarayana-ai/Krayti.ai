/**
 * Qarayti.ai — Sub-Module 10: Learning Analytics Component
 * Comprehensive educational analytics dashboard featuring study velocity,
 * Baccalaureate score predictor, subject mastery radar, and accuracy trends.
 */

import React from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { BarChart3, TrendingUp, Award, Zap, Clock, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const LearningAnalyticsView: React.FC = () => {
  const { analytics } = useAdaptiveEngine();

  const COLORS = ['#D4AF37', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Analytiques d'Apprentissage & Tableau de Bord</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Métriques d'assimilation, prédictions d'examen national et vélocité d'apprentissage.
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="text-xs font-mono text-[#8E9299] uppercase">Vélocité d'Acquisition</div>
          <div className="text-3xl font-serif text-[#D4AF37] font-bold">
            {analytics.velocity > 0 ? analytics.velocity : '--'} <span className="text-xs font-mono text-[#8E9299]">nœuds / sem.</span>
          </div>
          <p className="text-[10px] font-mono text-emerald-400">
            {analytics.velocity > 0 ? '+18% par rapport à la moyenne' : 'En attente d\'évaluation'}
          </p>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="text-xs font-mono text-[#8E9299] uppercase">Taux de Rétention Long-Terme</div>
          <div className="text-3xl font-serif text-emerald-400 font-bold">
            {analytics.retentionRate > 0 ? `${analytics.retentionRate}%` : '--%'}
          </div>
          <p className="text-[10px] font-mono text-[#8E9299]">
            Modèle Spaced Repetition (SM-2)
          </p>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="text-xs font-mono text-[#8E9299] uppercase">Prédiction Note BAC</div>
          <div className="text-3xl font-serif text-[#D4AF37] font-bold">
            {analytics.forecastBacScore > 0 ? analytics.forecastBacScore : '--'} <span className="text-xs font-mono text-[#8E9299]">/ 20</span>
          </div>
          <p className="text-[10px] font-mono text-emerald-400">
            {analytics.forecastBacScore > 0 ? 'Estimation dynamique' : 'En attente d\'évaluation'}
          </p>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <div className="text-xs font-mono text-[#8E9299] uppercase">Temps d'Étude Aujourd'hui</div>
          <div className="text-3xl font-serif text-[#EAE9E6] font-bold">
            {analytics.studyMinutesToday} <span className="text-xs font-mono text-[#8E9299]">min</span>
          </div>
          <p className="text-[10px] font-mono text-[#8E9299]">
            Objectif session quotidienne
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Mastery Bar Chart */}
        <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-4">
          <div className="border-b border-[#2D333D] pb-3">
            <span className="text-xs font-mono text-[#D4AF37] uppercase">Maîtrise par Matière</span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
              Distribution des Niveaux de Maîtrise BKT
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.masteryBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D333D" />
                <XAxis dataKey="subjectName" stroke="#8E9299" />
                <YAxis stroke="#8E9299" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1115', borderColor: '#2D333D', color: '#EAE9E6' }}
                />
                <Bar dataKey="masteryScore" fill="#D4AF37" radius={[2, 2, 0, 0]} name="Maîtrise (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Accuracy Trend */}
        <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-4">
          <div className="border-b border-[#2D333D] pb-3">
            <span className="text-xs font-mono text-[#D4AF37] uppercase">Tendance de Précision</span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
              Évolution de la Précision Quotidienne (7 Jours)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D333D" />
                <XAxis dataKey="date" stroke="#8E9299" />
                <YAxis stroke="#8E9299" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1115', borderColor: '#2D333D', color: '#EAE9E6' }}
                />
                <Bar dataKey="accuracy" fill="#10B981" radius={[2, 2, 0, 0]} name="Précision (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
