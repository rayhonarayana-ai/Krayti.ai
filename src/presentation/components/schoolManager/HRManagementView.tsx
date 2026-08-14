/**
 * Qarayti.ai — School Manager Portal: Sub-Module 8: HR & Administrative Staff
 * Staff records, contracts (CDI/CDD), hiring dates, CNSS numbers & base monthly salaries.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { Briefcase, Plus, Search, ShieldCheck } from 'lucide-react';

export const HRManagementView: React.FC = () => {
  const { hrEmployees, addHREmployee } = useSchoolManager();
  const [showAdd, setShowAdd] = useState(false);

  const [fullName, setFullName] = useState('Mme. Samira El Fassi');
  const [role, setRole] = useState<'DIRECTEUR' | 'CENSEUR' | 'SURVEILLANT_GENERAL' | 'ENSEIGNANT' | 'COMPTABLE' | 'SECRETARIAT'>('CENSEUR');
  const [contractType, setContractType] = useState<'CDI' | 'CDD' | 'VACATAIRE'>('CDI');
  const [department, setDepartment] = useState('Direction Pédagogique');
  const [monthlyBaseMAD, setMonthlyBaseMAD] = useState(16000);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addHREmployee({
      fullName,
      role,
      contractType,
      hiringDate: '2022-09-01',
      cnssNumber: `CNSS-${Math.floor(1000000 + Math.random() * 9000000)}`,
      department,
      status: 'ACTIVE',
      monthlyBaseMAD: Number(monthlyBaseMAD),
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Ressources Humaines & Contrats de Travail</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Personnel administratif, encadrement pédagogique, statut CNSS, contrats CDI/CDD/Vacataires.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Recrutement</span>
        </button>
      </div>

      {/* HR Records Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
          Registre National du Personnel
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#2D333D] text-[#8E9299] uppercase text-[10px]">
                <th className="py-3 px-2">Nom & Rôle</th>
                <th className="py-3 px-2">Département & Contrat</th>
                <th className="py-3 px-2">Immatriculation CNSS</th>
                <th className="py-3 px-2 text-center">Salaire de Base (MAD)</th>
                <th className="py-3 px-2 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]">
              {hrEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#0F1115]/80 transition-all">
                  <td className="py-3 px-2">
                    <div className="font-serif font-bold text-[#EAE9E6]">{emp.fullName}</div>
                    <div className="text-[10px] text-[#D4AF37]">{emp.role}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-[#EAE9E6]">{emp.department}</div>
                    <div className="text-[10px] text-[#8E9299]">Contrat: {emp.contractType}</div>
                  </td>
                  <td className="py-3 px-2 text-[#8E9299]">
                    {emp.cnssNumber}
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-[#D4AF37]">
                    {emp.monthlyBaseMAD.toLocaleString()} MAD
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px]">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2D333D] p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Ajouter un Collaborateur RH</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Fonction / Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  <option value="DIRECTEUR">Directeur Établissement</option>
                  <option value="CENSEUR">Censeur Pédagogique</option>
                  <option value="SURVEILLANT_GENERAL">Surveillant Général</option>
                  <option value="COMPTABLE">Comptable</option>
                  <option value="SECRETARIAT">Secrétariat / Massar</option>
                </select>
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Salaire Mensuel Brut (MAD)</label>
                <input
                  type="number"
                  value={monthlyBaseMAD}
                  onChange={(e) => setMonthlyBaseMAD(Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-1.5 bg-[#2D333D] text-[#EAE9E6]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold"
                >
                  Enregistrer Collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
