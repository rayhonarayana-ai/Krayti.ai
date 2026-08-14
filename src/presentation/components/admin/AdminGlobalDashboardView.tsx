/**
 * Qarayti.ai — Super Admin Global Dashboard View
 */

import React from 'react';
import {
  Activity,
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  Brain,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  HardDrive,
  Server,
  Zap,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminGlobalDashboardView: React.FC = () => {
  const { health, schools, aiMonitoring, platformMetrics } = useAdminPlatform();

  if (!health) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">État Global de la Plateforme Qarayti.ai</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {health.overallStatus} (Uptime {health.uptimePercentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervision en temps réel des établissements, utilisateurs, infrastructure Cloud et moteurs d'Intelligence Artificielle Faheem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            Charge Système: <span className="font-bold text-emerald-400">{health.systemLoadAverage * 100}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            API Latency: <span className="font-bold text-emerald-400">{platformMetrics?.apiHealthLatencyMs || 18}ms</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Schools */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Établissements Actifs</span>
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {health.activeSchoolsCount} <span className="text-xs text-slate-400 font-normal">écoles</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+3 ce mois-ci</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Élèves Inscrits</span>
            <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {health.activeStudentsCount.toLocaleString('fr-FR')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            DAU: <strong className="text-slate-900 dark:text-slate-200">{health.dailyActiveUsersCount.toLocaleString('fr-FR')}</strong>
          </div>
        </div>

        {/* Active Teachers & Parents */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Corps Enseignant & Parents</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {health.activeTeachersCount} <span className="text-xs font-normal text-slate-400">Profs</span> / {health.activeParentsCount} <span className="text-xs font-normal text-slate-400">Parents</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Taux d'engagement 94%
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revenu Mensuel (MRR)</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {health.monthlyRecurringRevenueMAD.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">DH</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>ARR Growth +{health.arrGrowthRatePercent}%</span>
          </div>
        </div>
      </div>

      {/* Second Row: AI Usage vs Infrastructure Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Usage (Faheem AI) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Utilisation AI Faheem (Aujourd'hui)
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Operational
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Requêtes</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {aiMonitoring?.totalRequestsToday.toLocaleString('fr-FR')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Temps Réponse Myd</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {aiMonitoring?.avgResponseTimeMs} ms
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Taux d'Erreur</div>
              <div className="text-lg font-black text-teal-600 dark:text-teal-400">
                {aiMonitoring?.errorRatePercent}%
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-semibold">
              <span>Répartition des Modèles Gemini</span>
              <span>100% Modèles In-House / Proxy API</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '78%' }} title="Gemini Flash (78%)" />
              <div className="bg-blue-500 h-full" style={{ width: '20%' }} title="Gemini Pro (20%)" />
              <div className="bg-amber-500 h-full" style={{ width: '2%' }} title="Faheem RAG Queries (2%)" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Gemini Flash: 78%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Gemini Pro: 20%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Faheem RAG: 2%</span>
            </div>
          </div>
        </div>

        {/* Infrastructure & Storage Health */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ressources Serveur & Stockage
              </h3>
            </div>
            <span className="text-xs text-slate-500">Cluster Cloud Run (Europe-West2)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>CPU Usage</span>
                <span>{platformMetrics?.cpuUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${platformMetrics?.cpuUsagePercent}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Mémoire RAM</span>
                <span>{platformMetrics?.memoryUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${platformMetrics?.memoryUsagePercent}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Cache Hit Ratio</span>
                <span>{platformMetrics?.cacheHitRatioPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${platformMetrics?.cacheHitRatioPercent}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Stockage S3/Cloud</span>
                <span>{platformMetrics?.storageBucketUsageGb} GB</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
            <span>🚀 Connexions WebSocket Actives: {platformMetrics?.activeWebsockets} sessions</span>
            <span>File d'attente: {platformMetrics?.queuePendingJobs} jobs</span>
          </div>
        </div>
      </div>

      {/* Top Managed Schools Quick Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Aperçu des Établissements Partenaires Principaux</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">{schools.length} Établissements enregistrés</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 text-right">Code & Établissement</th>
                <th className="p-3 text-right">Ville</th>
                <th className="p-3 text-right">Formule</th>
                <th className="p-3 text-right">Effectif Élèves</th>
                <th className="p-3 text-right">Professeurs</th>
                <th className="p-3 text-right">Statut</th>
                <th className="p-3 text-right">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {schools.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {sch.name}
                    <span className="block text-[10px] text-slate-500 font-mono font-normal">{sch.code}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{sch.city}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {sch.tier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-200">
                    {sch.currentStudentCount} / {sch.studentCapacity}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{sch.teacherCount} profs</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sch.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : sch.status === 'PENDING_ONBOARDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </td>
                  <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                    {sch.healthScorePercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
