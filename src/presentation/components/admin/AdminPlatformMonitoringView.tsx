/**
 * Qarayti.ai — Super Admin Platform Monitoring View (Telemetry & Engine)
 */

import React from 'react';
import {
  Server,
  Cpu,
  Database,
  HardDrive,
  Activity,
  Zap,
  Layers,
  CheckCircle2,
  RefreshCcw,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminPlatformMonitoringView: React.FC = () => {
  const { platformMetrics, refreshAll } = useAdminPlatform();

  if (!platformMetrics) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Moteur de Monitoring Télémetrique Qarayti Core</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Supervision des conteneurs Cloud Run, connexions PostgreSQL / Redis, et files d'attente asynchrones.
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshAll()}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Rafraîchir Télémetrie</span>
        </button>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU & Memory Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Charge Processeur & Mémoire</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold">Healthy</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>CPU (Cloud Run vCPU 4.0)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{platformMetrics.cpuUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${platformMetrics.cpuUsagePercent}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Mémoire (RAM 8.0 GB)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{platformMetrics.memoryUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${platformMetrics.memoryUsagePercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Database & Cache Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Base de Données & Cache Redis</span>
            </h3>
            <span className="text-xs text-blue-600 font-bold">Optimal</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Connexions DB Actives:</span>
              <span className="font-black text-slate-900 dark:text-white">
                {platformMetrics.databaseConnectionsActive} / {platformMetrics.databaseConnectionsMax}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Taux de Succès Cache (Hit Ratio):</span>
              <span className="font-black text-teal-600 dark:text-teal-400">
                {platformMetrics.cacheHitRatioPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Queue & Storage Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>File d'Attente & Stockage</span>
            </h3>
            <span className="text-xs text-purple-600 font-bold">Synchronisé</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Jobs Traités Aujourd'hui:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                {platformMetrics.queueProcessedJobs.toLocaleString('fr-FR')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Jobs en Attente (Queue):</span>
              <span className="font-black text-amber-500">
                {platformMetrics.queuePendingJobs} jobs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
