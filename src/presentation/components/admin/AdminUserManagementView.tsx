/**
 * Qarayti.ai — Super Admin User Management View
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck2,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';
import { PlatformRole } from '../../../domain/types/adminPlatform.types';

export const AdminUserManagementView: React.FC = () => {
  const { users, toggleUserStatus, searchUsers } = useAdminPlatform();
  const [selectedRole, setSelectedRole] = useState<PlatformRole | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const handleRoleChange = (role: PlatformRole | 'ALL') => {
    setSelectedRole(role);
    searchUsers(role === 'ALL' ? undefined : role, query);
  };

  const handleSearchChange = (q: string) => {
    setQuery(q);
    searchUsers(selectedRole === 'ALL' ? undefined : selectedRole, q);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Role Tabs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur par nom, email ou Massar/CIN..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="text-xs font-bold text-slate-500">
            Total utilisateurs répertoriés: <span className="text-slate-900 dark:text-white">{users.length}</span>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'Tous les Utilisateurs' },
            { id: 'STUDENT', label: 'Élèves' },
            { id: 'TEACHER', label: 'Professeurs' },
            { id: 'PARENT', label: 'Parents' },
            { id: 'SCHOOL_MANAGER', label: 'Directeurs & Managers' },
            { id: 'SUPER_ADMIN', label: 'Super Administrateurs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleRoleChange(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
                selectedRole === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 text-right">Nom & Email</th>
                <th className="p-3 text-right">Rôle</th>
                <th className="p-3 text-right">Établissement & Ville</th>
                <th className="p-3 text-right">Identifiant (Massar/CIN)</th>
                <th className="p-3 text-right">Dernière Connexion</th>
                <th className="p-3 text-right">Statut</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {usr.fullName}
                    <span className="block text-[11px] text-slate-500 font-normal">{usr.email}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        usr.role === 'SUPER_ADMIN'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : usr.role === 'SCHOOL_MANAGER'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : usr.role === 'TEACHER'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : usr.role === 'STUDENT'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                      }`}
                    >
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">
                    {usr.schoolName}
                    <span className="block text-[10px] text-slate-400 font-normal">{usr.city}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400 font-medium">
                    {usr.massarOrCinId || 'N/A'}
                  </td>
                  <td className="p-3 text-slate-500">{usr.lastLogin}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        usr.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {usr.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {usr.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => toggleUserStatus(usr.id, usr.status)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          usr.status === 'ACTIVE'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {usr.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                      </button>
                    )}
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
