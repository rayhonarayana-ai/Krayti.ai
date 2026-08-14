/**
 * Qarayti.ai — School Manager Portal: Sub-Module 2: Teachers Management
 * Manage teaching staff, qualifications, Massar IDs, class assignments, status & salaries.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { Users, Plus, Search, CheckCircle, AlertCircle, Award } from 'lucide-react';

export const TeachersManagementView: React.FC = () => {
  const { teachers, addTeacher, updateTeacherStatus } = useSchoolManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [massarId, setMassarId] = useState('');
  const [subject, setSubject] = useState('Mathématiques');
  const [track, setTrack] = useState('Sciences Mathématiques A');
  const [qualification, setQualification] = useState('Agrégé en Mathématiques (ENS Rabat)');
  const [monthlySalary, setMonthlySalary] = useState(14500);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.massarId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !massarId) return;

    addTeacher({
      fullName,
      massarId,
      subject,
      track,
      assignedClasses: ['2ème BAC Sc. Math A', '1ère BAC Sc. Math'],
      qualification,
      email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@lycee-excellence.ma`,
      phone: '+212 661-987654',
      status: 'ACTIVE',
      monthlySalary: Number(monthlySalary),
      yearsOfService: 5,
    });

    setFullName('');
    setMassarId('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Gestion du Corps Enseignant & Affectations</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Professeurs agrégés, spécialités, identifiants Massar et affectations de classes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Professeur</span>
        </button>
      </div>

      {/* Teachers Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D333D] pb-3">
          <div className="text-xs font-mono text-[#8E9299]">Total Enseignants ({teachers.length})</div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#8E9299] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher nom, matière..."
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
                <th className="py-3 px-2">Professeur & Qualification</th>
                <th className="py-3 px-2">Matière & Filière</th>
                <th className="py-3 px-2">Classes Affectées</th>
                <th className="py-3 px-2 text-center">Salaire Mensuel</th>
                <th className="py-3 px-2 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-[#0F1115]/80 transition-all">
                  <td className="py-3 px-2">
                    <div className="font-serif font-bold text-[#EAE9E6]">{t.fullName}</div>
                    <div className="text-[10px] text-[#D4AF37]">{t.qualification}</div>
                    <div className="text-[10px] text-[#8E9299]">Massar ID: {t.massarId}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-[#EAE9E6] font-bold">{t.subject}</div>
                    <div className="text-[10px] text-[#8E9299]">{t.track}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1">
                      {t.assignedClasses.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-[#0F1115] border border-[#2D333D] text-[10px] text-[#EAE9E6]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-[#D4AF37]">
                    {t.monthlySalary.toLocaleString()} MAD
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() =>
                        updateTeacherStatus(t.id, t.status === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE')
                      }
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        t.status === 'ACTIVE'
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                      }`}
                    >
                      {t.status}
                    </button>
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
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Ajouter un Professeur</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Reda El Mansouri"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Identifiant Massar / CIN</label>
                <input
                  type="text"
                  required
                  placeholder="TCH-9921"
                  value={massarId}
                  onChange={(e) => setMassarId(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Matière Spécialisée</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="Sciences de la Vie et de la Terre">SVT</option>
                  <option value="Philosophie">Philosophie</option>
                  <option value="Français & Anglais">Langues</option>
                </select>
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Salaire Mensuel (MAD)</label>
                <input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
