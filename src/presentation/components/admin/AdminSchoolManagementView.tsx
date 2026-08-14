/**
 * Qarayti.ai — Super Admin School Management View
 */

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  HardDrive,
  ShieldCheck,
  Phone,
  Mail,
  X,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';
import { SchoolSubscriptionTier, SchoolStatus } from '../../../domain/types/adminPlatform.types';

export const AdminSchoolManagementView: React.FC = () => {
  const { schools, registerSchool, toggleSchoolStatus } = useAdminPlatform();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [region, setRegion] = useState('Casablanca-Settat');
  const [directorName, setDirectorName] = useState('');
  const [directorEmail, setDirectorEmail] = useState('');
  const [phone, setPhone] = useState('+212 5');
  const [tier, setTier] = useState<SchoolSubscriptionTier>('PRO_EXCELLENCE');
  const [studentCapacity, setStudentCapacity] = useState(600);
  const [monthlyFeeMAD, setMonthlyFeeMAD] = useState(14500);

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !directorEmail) return;
    await registerSchool({
      name,
      city,
      region,
      directorName,
      directorEmail,
      phone,
      tier,
      studentCapacity,
      monthlyFeeMAD,
    });
    setIsModalOpen(false);
    // Reset
    setName('');
    setDirectorName('');
    setDirectorEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un établissement, ville ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Inscrire un Nouvel Établissement</span>
        </button>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((sch) => {
          const storagePercent = Math.round((sch.storageUsedGb / sch.storageLimitGb) * 100);
          const capacityPercent = Math.round((sch.currentStudentCount / sch.studentCapacity) * 100);

          return (
            <div
              key={sch.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{sch.code}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{sch.name}</h3>
                    <div className="text-xs text-slate-500 font-medium">{sch.city} ({sch.region})</div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      sch.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : sch.status === 'PENDING_ONBOARDING'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {sch.status}
                  </span>
                </div>

                {/* Director Info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{sch.directorName}</div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{sch.directorEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{sch.phone}</span>
                  </div>
                </div>

                {/* Capacity & Storage Bars */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
                      <span>Capacité Élèves:</span>
                      <span>
                        {sch.currentStudentCount} / {sch.studentCapacity} ({capacityPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${capacityPercent}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
                      <span>Stockage Cloud:</span>
                      <span>
                        {sch.storageUsedGb} GB / {sch.storageLimitGb} GB ({storagePercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${storagePercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tarification</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {sch.monthlyFeeMAD.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">DH/mois</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleSchoolStatus(sch.id, sch.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    sch.status === 'ACTIVE'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                >
                  {sch.status === 'ACTIVE' ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Suspendre</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Activer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Enregistrer un Nouvel Établissement
                </h3>
                <p className="text-xs text-slate-500">
                  Création de l'instance d'école et affectation des quotas Cloud Qarayti.ai
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nom de l'Établissement</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Lycée Privé Al Amine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ville</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Région MEN</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nom du Directeur</label>
                  <input
                    type="text"
                    required
                    placeholder="M. Mohamed..."
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email Officiel</label>
                  <input
                    type="email"
                    required
                    placeholder="direction@ecole.ma"
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Formule d'Abonnement</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as SchoolSubscriptionTier)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="FREE_STARTER">Offre Découverte Starter</option>
                    <option value="PRO_EXCELLENCE">Pack Excellence Pro (14,500 DH/mois)</option>
                    <option value="ENTERPRISE_ACADEMY">Grands Groupes Enterprise (22,000 DH/mois)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Capacité Élèves (Max)</label>
                  <input
                    type="number"
                    value={studentCapacity}
                    onChange={(e) => setStudentCapacity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Créer l'Établissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
