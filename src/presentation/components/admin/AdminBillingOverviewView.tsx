/**
 * Qarayti.ai — Super Admin Billing Overview View
 */

import React from 'react';
import {
  DollarSign,
  FileText,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminBillingOverviewView: React.FC = () => {
  const { invoices, health } = useAdminPlatform();

  const totalPaidMAD = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amountMAD, 0);

  const totalPendingMAD = invoices
    .filter((inv) => inv.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amountMAD, 0);

  const totalOverdueMAD = invoices
    .filter((inv) => inv.status === 'OVERDUE')
    .reduce((acc, curr) => acc + curr.amountMAD, 0);

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase text-slate-500">MRR Actuel (Revenu Mensuel)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {health?.monthlyRecurringRevenueMAD.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">DH</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% croissance</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase text-slate-500">Factures Encaissées (Payé)</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {totalPaidMAD.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">DH</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Août 2026</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase text-slate-500">Factures En Attente</div>
          <div className="text-2xl font-black text-amber-500">
            {totalPendingMAD.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">DH</span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">À échoir sous 15j</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase text-slate-500">Retards de Paiement</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {totalOverdueMAD.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">DH</span>
          </div>
          <div className="text-[11px] text-rose-600 font-semibold">Relance automatique activée</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Facturation Établissements (Abonnements SaaS)</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">{invoices.length} Factures émisses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 text-right">Réf. Facture</th>
                <th className="p-3 text-right">Établissement</th>
                <th className="p-3 text-right">Montant (DH)</th>
                <th className="p-3 text-right">Formule</th>
                <th className="p-3 text-right">Date d'Échéance</th>
                <th className="p-3 text-right">Statut</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{inv.id}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{inv.schoolName}</td>
                  <td className="p-3 font-black text-slate-900 dark:text-white">
                    {inv.amountMAD.toLocaleString('fr-FR')} DH
                  </td>
                  <td className="p-3 text-slate-500 font-medium">{inv.planTier}</td>
                  <td className="p-3 text-slate-500 font-mono">{inv.dueDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : inv.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 hover:bg-slate-200 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
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
