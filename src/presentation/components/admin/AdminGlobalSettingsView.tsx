/**
 * Qarayti.ai — Super Admin Global Settings View
 */

import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Zap,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Save,
  Globe,
  Radio,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminGlobalSettingsView: React.FC = () => {
  const { config, updateGlobalConfig } = useAdminPlatform();

  const [maintenanceMode, setMaintenanceMode] = useState(config?.maintenanceMode ?? false);
  const [allowPublicRegistrations, setAllowPublicRegistrations] = useState(config?.allowPublicRegistrations ?? true);
  const [faheemAiRateLimitPerMin, setFaheemAiRateLimitPerMin] = useState(config?.faheemAiRateLimitPerMin ?? 60);
  const [maxConcurrentSessionsPerUser, setMaxConcurrentSessionsPerUser] = useState(config?.maxConcurrentSessionsPerUser ?? 3);
  const [requireMfaForAdmins, setRequireMfaForAdmins] = useState(config?.requireMfaForAdmins ?? true);
  const [autoBackupIntervalHours, setAutoBackupIntervalHours] = useState(config?.autoBackupIntervalHours ?? 6);
  const [debugTelemetryLogs, setDebugTelemetryLogs] = useState(config?.debugTelemetryLogs ?? false);
  const [announcementBannerMessage, setAnnouncementBannerMessage] = useState(config?.announcementBannerMessage ?? '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGlobalConfig({
      maintenanceMode,
      allowPublicRegistrations,
      faheemAiRateLimitPerMin,
      maxConcurrentSessionsPerUser,
      requireMfaForAdmins,
      autoBackupIntervalHours,
      debugTelemetryLogs,
      announcementBannerMessage,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Paramètres Généraux de la Plateforme Qarayti Core</h2>
          <p className="text-xs text-slate-300">
            Configuration globale des modes de maintenance, limites de débit AI, sécurité MFA et bannières système.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Paramètres globaux sauvegardés avec succès dans la configuration centrale!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Maintenance Mode & Public Access */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Mode d'Accès et Disponibilité Publique</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Mode Maintenance Système</span>
                <span className="text-[11px] text-slate-500">Bloque temporairement l'accès aux étudiants et profs</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Inscriptions Publiques Ouvertes</span>
                <span className="text-[11px] text-slate-500">Autorise les nouveaux comptes libres</span>
              </div>
              <input
                type="checkbox"
                checked={allowPublicRegistrations}
                onChange={(e) => setAllowPublicRegistrations(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* AI & Rate Limits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Quotas & Rate Limiting AI Faheem</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Limite de Requêtes AI / Minute / Utilisateur: <span className="text-emerald-600 font-extrabold">{faheemAiRateLimitPerMin} req/min</span>
              </label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={faheemAiRateLimitPerMin}
                onChange={(e) => setFaheemAiRateLimitPerMin(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Sessions Simultannées Max par Compte: <span className="text-emerald-600 font-extrabold">{maxConcurrentSessionsPerUser} sessions</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={maxConcurrentSessionsPerUser}
                onChange={(e) => setMaxConcurrentSessionsPerUser(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Global Announcement Banner */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Bannière d'Information Officielle (Flash Système)</span>
          </h3>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300">Message Défilant du En-tête</label>
            <input
              type="text"
              value={announcementBannerMessage}
              onChange={(e) => setAnnouncementBannerMessage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer la Configuration Globale</span>
          </button>
        </div>
      </form>
    </div>
  );
};
