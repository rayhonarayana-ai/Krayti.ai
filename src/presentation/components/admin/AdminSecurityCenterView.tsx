/**
 * Qarayti.ai — Super Admin Security Center View (RBAC & Audit Engine)
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Key,
  UserCheck,
  RefreshCcw,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminSecurityCenterView: React.FC = () => {
  const { securityLogs, securityAlerts, resolveSecurityAlert } = useAdminPlatform();
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'ALERTS' | 'RBAC'>('ALERTS');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Centre de Sécurité & RBAC Qarayti Shield</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Journalisation des audits d'accès, détection d'anomalies de sécurité et gestion des rôles à privilèges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'ALERTS'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Alertes ({securityAlerts.filter((a) => !a.isResolved).length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'AUDIT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Logs d'Audit ({securityLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('RBAC')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'RBAC'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Matrice RBAC
          </button>
        </div>
      </div>

      {/* Security Alerts Section */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>Alertes de Sécurité & Activités Suspectes</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {securityAlerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl border shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  alt.isResolved
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-rose-500/40 ring-1 ring-rose-500/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        alt.severity === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {alt.severity} SEVERITY
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alt.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{alt.description}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                    <span>Horodatage: {alt.timestamp}</span>
                    <span>IP Source: <code className="font-mono text-slate-700 dark:text-slate-300">{alt.sourceIp}</code></span>
                  </div>
                </div>

                <div className="shrink-0">
                  {alt.isResolved ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Résolue</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => resolveSecurityAlert(alt.id)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-colors"
                    >
                      Marquer comme Résolu
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Section */}
      {activeTab === 'AUDIT' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Journal des Événements d'Audit Immuable
            </h3>
            <span className="text-xs text-slate-500">Traçabilité complète des actions d'administration</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-right">Horodatage</th>
                  <th className="p-3 text-right">Utilisateur / Rôle</th>
                  <th className="p-3 text-right">Action Effectuée</th>
                  <th className="p-3 text-right">Adresse IP & Geolocation</th>
                  <th className="p-3 text-right">Niveau</th>
                  <th className="p-3 text-right">Résultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {log.actorEmail}
                      <span className="block text-[10px] text-slate-400 font-normal">{log.actorRole}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-700 dark:text-slate-300">{log.action}</td>
                    <td className="p-3 font-mono text-slate-500">
                      {log.ipAddress}
                      <span className="block text-[10px] text-slate-400">{log.location}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RBAC Matrix Section */}
      {activeTab === 'RBAC' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Matrice d'Habilitations et de Rôles (RBAC Core)</span>
            </h3>
            <span className="text-xs text-slate-500">Conforme Directives MEN & GDPR/CNDP</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="p-3 text-right">Module / Permission</th>
                  <th className="p-3">Élève</th>
                  <th className="p-3">Enseignant</th>
                  <th className="p-3">Parent</th>
                  <th className="p-3">Directeur École</th>
                  <th className="p-3 bg-purple-500/10 text-purple-700 dark:text-purple-300">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { name: 'Accès Tutorat Faheem AI', student: 'V', teacher: 'V', parent: 'X', manager: 'V', admin: 'V' },
                  { name: 'Saisie des Notes & Évaluations', student: 'X', teacher: 'V', parent: 'X', manager: 'V', admin: 'V' },
                  { name: 'Consultation Bulletin Parent', student: 'V', teacher: 'V', parent: 'V', manager: 'V', admin: 'V' },
                  { name: 'Gestion Massar & Emplois du Temps', student: 'X', teacher: 'X', parent: 'X', manager: 'V', admin: 'V' },
                  { name: 'Administration Établissement & Billing', student: 'X', teacher: 'X', parent: 'X', manager: 'V', admin: 'V' },
                  { name: 'Supervision Global & Configuration Système', student: 'X', teacher: 'X', parent: 'X', manager: 'X', admin: 'V' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-3 font-black text-emerald-600">{row.student === 'V' ? '✓' : '—'}</td>
                    <td className="p-3 font-black text-emerald-600">{row.teacher === 'V' ? '✓' : '—'}</td>
                    <td className="p-3 font-black text-emerald-600">{row.parent === 'V' ? '✓' : '—'}</td>
                    <td className="p-3 font-black text-emerald-600">{row.manager === 'V' ? '✓' : '—'}</td>
                    <td className="p-3 font-black text-purple-600 bg-purple-500/5">{row.admin === 'V' ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
