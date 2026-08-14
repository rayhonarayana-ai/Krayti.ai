/**
 * Qarayti.ai — Super Admin AI Monitoring View (Faheem AI Infrastructure)
 */

import React from 'react';
import {
  Brain,
  Zap,
  Clock,
  Coins,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Cpu,
  RefreshCcw,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminAIMonitoringView: React.FC = () => {
  const { aiMonitoring, refreshAll } = useAdminPlatform();

  if (!aiMonitoring) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/50 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Brain className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Moteur d'Intelligence Artificielle Faheem AI</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Supervision des clusters LLM (Gemini 1.5 Flash, Gemini 1.5 Pro, Vector RAG Morocco MEN Syllabus).
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshAll()}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Actualiser Métriques AI</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Requêtes Aujourd'hui</span>
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {aiMonitoring.totalRequestsToday.toLocaleString('fr-FR')}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {aiMonitoring.activeAiSessions} sessions simultanées
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Temps de Réponse Myd</span>
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {aiMonitoring.avgResponseTimeMs} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Latence optimale (&lt; 300ms)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Tokens Consommés</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {(aiMonitoring.totalTokensUsedToday / 1000000).toFixed(1)}M <span className="text-xs font-normal text-slate-400">Tokens</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Coût estimé: <strong className="text-slate-900 dark:text-slate-200">{aiMonitoring.costTodayMAD} DH</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Taux d'Erreur LLM</span>
            <AlertTriangle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {aiMonitoring.errorRatePercent}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Sous le seuil SLA (1.0%)
          </div>
        </div>
      </div>

      {/* Model Breakdown & Recent Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Volume par Modèle IA</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">Faheem AI Gateway</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Gemini 1.5 Flash (Default Tutor)</span>
                <span className="text-[11px] text-slate-500">Explications, Exercices & Correction Express</span>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {aiMonitoring.modelBreakdown.geminiFlashRequests.toLocaleString('fr-FR')} req
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Gemini 1.5 Pro (Advanced Reasoning)</span>
                <span className="text-[11px] text-slate-500">Résolution Problèmes Complexe Math 2ème BAC</span>
              </div>
              <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                {aiMonitoring.modelBreakdown.geminiProRequests.toLocaleString('fr-FR')} req
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Faheem MEN Vector RAG Engine</span>
                <span className="text-[11px] text-slate-500">Recherche Vectorielle Barèmes & Directives Officielles</span>
              </div>
              <span className="font-black text-amber-500 text-sm">
                {aiMonitoring.modelBreakdown.faheemRagQueries.toLocaleString('fr-FR')} queries
              </span>
            </div>
          </div>
        </div>

        {/* Recent Errors Log */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Dernières Exceptions AI</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">{aiMonitoring.recentAiErrors.length} enregistrées</span>
          </div>

          <div className="space-y-3">
            {aiMonitoring.recentAiErrors.map((err) => (
              <div key={err.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-600 dark:text-rose-400">{err.errorType}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{err.timestamp}</span>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 italic font-mono truncate">
                  "{err.promptSnippet}"
                </div>
                <div className="text-[10px] text-slate-400">Rôle: {err.userRole}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
