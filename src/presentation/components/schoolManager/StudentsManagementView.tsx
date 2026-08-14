/**
 * Qarayti.ai — School Manager Portal: Sub-Module 3: Students Management
 * Base élèves, Massar codes, tracks, guardian info, tuition payment status & risk levels.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { GraduationCap, Plus, Search, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export const StudentsManagementView: React.FC = () => {
  const { students, addStudent, updateStudentTuitionStatus } = useSchoolManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [massarCode, setMassarCode] = useState('');
  const [gradeLevel, setGradeLevel] = useState('2ème BAC');
  const [track, setTrack] = useState('Sciences Mathématiques A');
  const [guardianName, setGuardianName] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.massarCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !massarCode) return;

    addStudent({
      fullName,
      massarCode,
      gradeLevel,
      track,
      className: `${gradeLevel} Sc. Math A`,
      guardianName: guardianName || 'Tuteur Légal',
      guardianPhone: '+212 661-112233',
      academicAverage: 15.5,
      tuitionStatus: 'PAID',
      riskLevel: 'LOW',
      status: 'ACTIVE',
    });

    setFullName('');
    setMassarCode('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Base Élèves & Inscriptions Massar</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Gestion du fichier national élèves, codes Massar, statut financier et niveau de risque pédagogique.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Inscrire un Élève</span>
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D333D] pb-3">
          <div className="text-xs font-mono text-[#8E9299]">Total Élèves Enregistrés ({students.length})</div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#8E9299] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher nom, Code Massar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0F1115] border border-[#2D333D] pl-9 pr-4 py-1.5 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#2D333D] text-[#8E9299] uppercase text-[10px]">
                <th className="py-3 px-2">Élève & Code Massar</th>
                <th className="py-3 px-2">Niveau & Classe</th>
                <th className="py-3 px-2">Tuteur / Parent</th>
                <th className="py-3 px-2 text-center">Moyenne Actuelle</th>
                <th className="py-3 px-2 text-center">Statut Scolarité</th>
                <th className="py-3 px-2 text-center">Risque Décrochage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[#0F1115]/80 transition-all">
                  <td className="py-3 px-2">
                    <div className="font-serif font-bold text-[#EAE9E6]">{s.fullName}</div>
                    <div className="text-[10px] text-[#D4AF37]">{s.massarCode}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-[#EAE9E6] font-bold">{s.className}</div>
                    <div className="text-[10px] text-[#8E9299]">{s.track}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-[#EAE9E6]">{s.guardianName}</div>
                    <div className="text-[10px] text-[#8E9299]">{s.guardianPhone}</div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-[#D4AF37]">
                    {s.academicAverage} / 20
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() =>
                        updateStudentTuitionStatus(
                          s.id,
                          s.tuitionStatus === 'PAID' ? 'OVERDUE' : 'PAID'
                        )
                      }
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        s.tuitionStatus === 'PAID'
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                          : s.tuitionStatus === 'PARTIAL'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                          : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                      }`}
                    >
                      {s.tuitionStatus === 'PAID' ? 'RÉGLÉ' : s.tuitionStatus === 'PARTIAL' ? 'PARTIEL' : 'IMPAYÉ'}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        s.riskLevel === 'HIGH'
                          ? 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30'
                          : s.riskLevel === 'MEDIUM'
                          ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30'
                          : 'text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30'
                      }`}
                    >
                      {s.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2D333D] p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Inscrire un Nouvel Élève</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Nom & Prénom Élève</label>
                <input
                  type="text"
                  required
                  placeholder="Youssef El Amrani"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Code Massar (10 caractères)</label>
                <input
                  type="text"
                  required
                  placeholder="K139887766"
                  value={massarCode}
                  onChange={(e) => setMassarCode(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Nom du Tuteur / Parent</label>
                <input
                  type="text"
                  placeholder="Hassan El Amrani"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-[#2D333D] text-[#EAE9E6]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold"
                >
                  Valider Inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
