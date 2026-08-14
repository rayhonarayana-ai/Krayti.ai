/**
 * Qarayti.ai — School Manager Portal: Sub-Module 11: Governance & RBAC
 * Role-Based Access Control matrix (Directeur, Censeur, Surveillant Général, Comptable, Secrétariat).
 */

import React from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { ShieldCheck, Check, X, Lock } from 'lucide-react';

export const PermissionsManagementView: React.FC = () => {
  const { permissions, updateRolePermission } = useSchoolManager();

  const moduleNames = [
    { key: 'teachers', label: 'Profs & Enseignants' },
    { key: 'students', label: 'Élèves & Massar' },
    { key: 'finance', label: 'Comptabilité & Paie' },
    { key: 'analytics', label: 'Analytique & Prédictions' },
    { key: 'timetable', label: 'Emplois du temps' },
    { key: 'exams', label: 'Examens & Bac Blanc' },
    { key: 'hr', label: 'Ressources Humaines' },
    { key: 'documents', label: 'Documents MEN' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-lg font-serif italic text-[#EAE9E6]">Gouvernance, Droits d'Accès & Matrice RBAC</h2>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
          Configuration des Privilèges de l'Établissement
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#2D333D] text-[#8E9299] uppercase text-[10px]">
                <th className="py-3 px-2">Rôle & Utilisateurs</th>
                {moduleNames.map((m) => (
                  <th key={m.key} className="py-3 px-2 text-center">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-[#0F1115]/80 transition-all">
                  <td className="py-3 px-2">
                    <div className="font-serif font-bold text-[#EAE9E6]">{p.roleTitle}</div>
                    <div className="text-[10px] text-[#8E9299]">{p.userCount} utilisateurs</div>
                  </td>
                  {moduleNames.map((m) => {
                    const level = p.modulesAccess[m.key] || 'NONE';
                    return (
                      <td key={m.key} className="py-3 px-2 text-center">
                        <select
                          value={level}
                          onChange={(e) =>
                            updateRolePermission(p.id, m.key, e.target.value as any)
                          }
                          className={`text-[10px] p-1 font-bold bg-[#0F1115] border ${
                            level === 'ADMIN'
                              ? 'text-[#D4AF37] border-[#D4AF37]/50'
                              : level === 'WRITE'
                              ? 'text-[#10B981] border-[#10B981]/50'
                              : level === 'READ'
                              ? 'text-[#EAE9E6] border-[#2D333D]'
                              : 'text-[#8E9299] border-[#2D333D]'
                          }`}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="WRITE">ECRITURE</option>
                          <option value="READ">LECTURE</option>
                          <option value="NONE">AUCUN</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
