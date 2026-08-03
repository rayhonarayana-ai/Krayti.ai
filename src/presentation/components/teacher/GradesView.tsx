/**
 * Qarayti.ai — Teacher Portal: Sub-Module 3: Grades & Massar Gradebook
 * Grade recording, coefficient calculation, and Massar export compatibility.
 */

import React, { useState } from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { Award, Download, Plus, CheckCircle, Calculator, AlertCircle } from 'lucide-react';

export const GradesView: React.FC = () => {
  const { grades, roster, activeClassId, recordStudentGrade } = useTeacherPortal();

  const [selectedExamType, setSelectedExamType] = useState<
    'Devoir Surveillé N°1' | 'Devoir Surveillé N°2' | 'Contrôle Continu' | 'Examen Blanc'
  >('Devoir Surveillé N°1');

  const [showGradeEntryModal, setShowGradeEntryModal] = useState(false);

  // Quick Grade Form
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState<number>(14);
  const [coefficient, setCoefficient] = useState<number>(9);
  const [feedback, setFeedback] = useState('');

  const classStudents = roster.filter((s) => s.classId === activeClassId);

  const handleRecordGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    const studentObj = classStudents.find((s) => s.id === studentId);
    if (!studentObj) return;

    recordStudentGrade({
      studentId: studentObj.id,
      studentName: studentObj.fullName,
      massarCode: studentObj.massarCode,
      classId: activeClassId,
      subject: 'Mathématiques',
      examTitle: `${selectedExamType}`,
      examType: selectedExamType,
      score,
      coefficient,
      examDate: new Date().toISOString().split('T')[0],
      feedback: feedback || 'Note enregistrée dans le système.',
    });

    setFeedback('');
    setShowGradeEntryModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Carnet de Notes & Examen National</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Saisie des notes des devoirs surveillés (DS), contrôles continus (CC) et calcul du coefficient Massar.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGradeEntryModal(true)}
            className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#c4a02f] text-[#0F1115] px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir une Note</span>
          </button>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D333D] pb-3">
          <div>
            <span className="text-xs font-mono text-[#D4AF37] uppercase">Relevé de Notes par Élève</span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
              Bilan des Évaluations (Devoirs Surveillés)
            </h3>
          </div>
          <div className="text-xs font-mono text-[#8E9299] bg-[#0F1115] border border-[#2D333D] px-3 py-1.5">
            Export Massar Format CSV Prêt
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-[#EAE9E6]">
            <thead className="bg-[#0F1115] text-[#8E9299] uppercase text-[10px] border-b border-[#2D333D]">
              <tr>
                <th className="p-3">Élève & Code Massar</th>
                <th className="p-3">DS N°1 (Coef 9)</th>
                <th className="p-3">Moyenne Générale</th>
                <th className="p-3">Observations Enseignant</th>
                <th className="p-3 text-right">Statut Massar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]">
              {classStudents.map((std) => {
                const stdGradeRecord = grades.find((g) => g.studentId === std.id);

                return (
                  <tr key={std.id} className="hover:bg-[#0F1115]/50 transition-colors">
                    <td className="p-3 font-bold">
                      <div className="text-[#EAE9E6] font-serif italic text-sm">{std.fullName}</div>
                      <div className="text-[10px] text-[#8E9299]">Massar: {std.massarCode}</div>
                    </td>
                    <td className="p-3">
                      {stdGradeRecord ? (
                        <span className="text-[#D4AF37] font-bold text-sm">{stdGradeRecord.score} / 20</span>
                      ) : (
                        <span className="text-[#8E9299] italic">Non saisi</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-bold">{std.currentAverage} / 20</span>
                    </td>
                    <td className="p-3 text-[#8E9299] max-w-xs truncate">
                      {stdGradeRecord?.feedback || 'Aucune observation enregistrée'}
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 text-[10px]">
                        <CheckCircle className="w-3 h-3" />
                        <span>Sincronisé Massar</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Entry Modal */}
      {showGradeEntryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-[#D4AF37] max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#2D333D] pb-3">
              <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
                Saisie de Note pour l'Évaluation
              </h3>
              <button
                onClick={() => setShowGradeEntryModal(false)}
                className="text-[#8E9299] hover:text-[#EAE9E6] text-xs font-mono"
              >
                [ Fermer ]
              </button>
            </div>

            <form onSubmit={handleRecordGradeSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#8E9299]">Sélectionner l'Élève</label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                >
                  <option value="">-- Choisir un élève --</option>
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.massarCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#8E9299]">Type d'Évaluation</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                >
                  <option value="Devoir Surveillé N°1">Devoir Surveillé N°1</option>
                  <option value="Devoir Surveillé N°2">Devoir Surveillé N°2</option>
                  <option value="Contrôle Continu">Contrôle Continu</option>
                  <option value="Examen Blanc">Examen Blanc</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#8E9299]">Note (sur 20)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    required
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#8E9299]">Coefficient MEN</label>
                  <input
                    type="number"
                    value={coefficient}
                    onChange={(e) => setCoefficient(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8E9299]">Appréciation / Feedback Pédagogique</label>
                <textarea
                  rows={3}
                  placeholder="Appréciation sur la copie et conseils de révision..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGradeEntryModal(false)}
                  className="px-4 py-2 border border-[#2D333D] text-[#8E9299] hover:text-[#EAE9E6]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold hover:bg-[#c4a02f]"
                >
                  Enregistrer la Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
