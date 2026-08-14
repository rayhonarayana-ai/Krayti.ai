/**
 * Qarayti.ai — Super Admin Subscription Center View
 */

import React from 'react';
import {
  ShieldCheck,
  Check,
  Building2,
  Users,
  HardDrive,
  CreditCard,
  Zap,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminSubscriptionCenterView: React.FC = () => {
  const { plans, schools } = useAdminPlatform();

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Catalogue des Offres & Abonnements Établissements</h2>
          <p className="text-xs text-slate-300">
            Gestion des forfaits SaaS Qarayti.ai, limites de capacité d'élèves et accès aux fonctionnalités premium.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const subscriberSchoolsCount = schools.filter((s) => s.tier === plan.id).length;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm space-y-5 flex flex-col justify-between ${
                plan.id === 'PRO_EXCELLENCE'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.title}</h3>
                    <div className="text-xs text-slate-500">{subscriberSchoolsCount} Écoles souscrites</div>
                  </div>
                  {plan.id === 'PRO_EXCELLENCE' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Populaire
                    </span>
                  )}
                </div>

                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {plan.priceMonthlyMAD > 0 ? (
                    <>
                      {plan.priceMonthlyMAD.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-400">DH / mois</span>
                    </>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">Gratuit</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Capacité Max Élèves:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{plan.maxStudents} élèves</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Quota Cloud Storage:</span>
                    <span className="text-blue-600 dark:text-blue-400">{plan.maxStorageGb} GB</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Fonctionnalités Incluses:</div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
