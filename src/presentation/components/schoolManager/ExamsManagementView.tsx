/**
 * Qarayti.ai — School Manager Portal: Sub-Module 7: Exams & Bac Blanc Control
 * National Bac, Regional Bac, Bac Blanc & Unified Exams organization.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { FileText, Plus, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ExamsManagementView: React.FC = () => {
  const { exams, addExam, updateExamStatus } = useSchoolManager();
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState('Examen Blanc Régional de Mathématiques');
  const [examType, setExamType] = useState<'National BAC Session Ordinaire' | 'Regional BAC' | 'Bac Blanc' | 'Devoir Surveillé Unifié'>('Bac Blanc');
  const [targetGrade, setTargetGrade] = useState('2ème BAC Sc. Math');
  const [date, setDate] = useState('2026-05-15');
  const [leadSupervisor, setLeadSupervisor] = useState('M. Le Censeur Pédagogique');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addExam({
      title,
      examType,
      targetGrade,
      date,
      durationMinutes: 180,
      totalRegisteredStudents: 48,
      leadSupervisor,
      status: 'PLANNED',
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Organisation des Examens & Bac Blanc</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Contrôle des épreuves unifiées, convocations, attribution des surveillants et saisie des notes.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Programmer un Examen</span>
        </button>
      </div>

      {/* Exams List */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
          Session d'Examens Programmés
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((ex) => (
            <div key={ex.id} className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{ex.examType}</span>
                  <h4 className="text-sm font-serif font-bold text-[#EAE9E6] mt-0.5">{ex.title}</h4>
                </div>
                <button
                  onClick={() =>
                    updateExamStatus(
                      ex.id,
                      ex.status === 'PLANNED'
                        ? 'IN_PROGRESS'
                        : ex.status === 'IN_PROGRESS'
                        ? 'COMPLETED'
                        : 'GRADED'
                    )
                  }
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                    ex.status === 'GRADED'
                      ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                      : ex.status === 'IN_PROGRESS'
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                      : 'bg-[#2D333D] text-[#EAE9E6]'
                  }`}
                >
                  {ex.status}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#8E9299]">
                <div>Date: <strong className="text-[#EAE9E6]">{ex.date}</strong></div>
                <div>Durée: <strong className="text-[#EAE9E6]">{ex.durationMinutes} min</strong></div>
                <div>Élèves: <strong className="text-[#EAE9E6]">{ex.totalRegisteredStudents} inscrits</strong></div>
                <div>Superviseur: <strong className="text-[#EAE9E6]">{ex.leadSupervisor}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Exam Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2D333D] p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Programmer une Session d'Examen</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Intitulé de l'Examen</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Type d'Examen Officiel</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  <option value="Bac Blanc">Bac Blanc Établissement</option>
                  <option value="National BAC Session Ordinaire">National BAC Session Ordinaire</option>
                  <option value="Regional BAC">Regional BAC (1ère BAC)</option>
                  <option value="Devoir Surveillé Unifié">Devoir Surveillé Unifié</option>
                </select>
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Date Prévue</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  Valider la Programation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
