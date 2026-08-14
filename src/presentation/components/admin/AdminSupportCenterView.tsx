/**
 * Qarayti.ai — Super Admin Support Center View
 */

import React from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminSupportCenterView: React.FC = () => {
  const { tickets, updateTicketStatus } = useAdminPlatform();

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Centre de Support et Assistance Technique Tier 3</h2>
          <p className="text-xs text-slate-300">
            Gestion des tickets d'assistance soumis par les directeurs d'établissements et enseignants.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          SLA Réponse &lt; 2h
        </span>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Tickets de Support Actifs</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">{tickets.length} Tickets répertoriés</span>
        </div>

        <div className="space-y-3">
          {tickets.map((tkt) => (
            <div
              key={tkt.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{tkt.ticketNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      tkt.priority === 'URGENT'
                        ? 'bg-rose-500/20 text-rose-600 border border-rose-500/30'
                        : tkt.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                    }`}
                  >
                    {tkt.priority}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tkt.subject}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <select
                    value={tkt.status}
                    onChange={(e) => updateTicketStatus(tkt.id, e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="OPEN">NOUVEAU (OPEN)</option>
                    <option value="IN_PROGRESS">EN COURS (IN_PROGRESS)</option>
                    <option value="RESOLVED">RÉSOLU (RESOLVED)</option>
                    <option value="CLOSED">FERMÉ (CLOSED)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <div>
                  Demandeur: <strong className="text-slate-800 dark:text-slate-200">{tkt.requesterName}</strong> ({tkt.requesterRole}) — {tkt.schoolName}
                </div>
                <div>Créé: {tkt.createdAt} | Catégorie: <strong className="text-emerald-600 dark:text-emerald-400">{tkt.category}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
