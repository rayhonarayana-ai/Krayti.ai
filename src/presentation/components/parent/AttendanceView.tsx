/**
 * Qarayti.ai — Parent Portal: Sub-Module 4: Attendance
 * Tracking Daily/Monthly Attendance, Late Arrivals, Absence Analytics,
 * and Absence Justification Submission.
 */

import React, { useState } from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import { parentPortalService } from '../../../domain/services/parentPortal.service';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Calendar,
  BarChart,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { activeChild, attendance, justifyAbsence } = useParentPortal();
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('');

  const childAttendance = attendance.filter((a) => a.childId === activeChild.id);
  const stats = parentPortalService.analyzeAttendance(childAttendance);

  const handleJustifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAbsenceId && reasonInput.trim()) {
      justifyAbsence(selectedAbsenceId, reasonInput.trim());
      setSelectedAbsenceId(null);
      setReasonInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Registre de Présence & Assiduité (Massar System)
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Suivi en temps réel des absences, retards, justifications réglementaires et analytique mensuelle.
          </p>
        </div>
        <div className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 self-start md:self-auto">
          Taux Globale: {stats.attendancePercentage}%
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#161920] border border-[#2D333D] p-4 text-center">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase block">Total Enregistrements</span>
          <span className="text-2xl font-serif font-bold text-[#EAE9E6]">{stats.totalRecords}</span>
        </div>
        <div className="bg-[#161920] border border-[#2D333D] p-4 text-center">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase block">Absences Signalées</span>
          <span className="text-2xl font-serif font-bold text-rose-400">{stats.absenceCount}</span>
        </div>
        <div className="bg-[#161920] border border-[#2D333D] p-4 text-center">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase block">Retards de Cours</span>
          <span className="text-2xl font-serif font-bold text-amber-400">{stats.lateCount}</span>
        </div>
        <div className="bg-[#161920] border border-[#2D333D] p-4 text-center">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase block">Absences Non Justifiées</span>
          <span className={`text-2xl font-serif font-bold ${stats.unjustifiedAbsences > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {stats.unjustifiedAbsences}
          </span>
        </div>
      </div>

      {/* Absence & Attendance Records Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-sm font-serif italic text-[#EAE9E6] font-bold border-b border-[#2D333D] pb-3">
          Historique Complet des Pointages d'Assiduité
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2D333D] text-[#8E9299] uppercase text-[10px]">
                <th className="py-2.5 px-3">Date & Créneau</th>
                <th className="py-2.5 px-3">Matière</th>
                <th className="py-2.5 px-3">Enseignant</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3">Justification</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]/50 text-[#EAE9E6]">
              {childAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#0F1115]">
                  <td className="py-3 px-3">
                    <span className="block font-bold text-[#D4AF37]">{rec.date}</span>
                    <span className="text-[10px] text-[#8E9299]">{rec.timeSlot}</span>
                  </td>
                  <td className="py-3 px-3 font-serif italic text-sm">{rec.subject}</td>
                  <td className="py-3 px-3 text-[#8E9299]">{rec.teacherName}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase border ${
                        rec.type === 'PRESENT'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                          : rec.type === 'LATE'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                          : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {rec.type === 'PRESENT' ? 'Présent' : rec.type === 'LATE' ? 'Retard' : 'Absence'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {rec.type === 'ABSENCE' ? (
                      rec.justified ? (
                        <span className="text-emerald-400 text-[11px] font-serif italic">
                          Justifiée ({rec.justificationReason})
                        </span>
                      ) : (
                        <span className="text-rose-400 text-[11px]">Non Justifiée</span>
                      )
                    ) : (
                      <span className="text-[#8E9299]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {rec.type === 'ABSENCE' && !rec.justified && (
                      <button
                        onClick={() => setSelectedAbsenceId(rec.id)}
                        className="px-2.5 py-1 bg-[#D4AF37] text-[#0F1115] font-bold text-[10px] uppercase hover:bg-amber-400"
                      >
                        Justifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Justification Modal / Form */}
      {selectedAbsenceId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#D4AF37] p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Transmettre un Justificatif d'Absence (Administration)
            </h3>
            <p className="text-xs font-mono text-[#8E9299]">
              Conformément à la réglementation du Ministère de l'Éducation Nationale, précisez le motif légitime (Certificat médical, motif familial impérieux).
            </p>

            <form onSubmit={handleJustifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#D4AF37] mb-1 uppercase">
                  Motif de l'absence:
                </label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Ex: Consultation médicale urgente chez le pédiatre..."
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-3 text-xs font-mono text-[#EAE9E6] focus:border-[#D4AF37] outline-none h-24"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedAbsenceId(null)}
                  className="px-4 py-2 bg-[#0F1115] border border-[#2D333D] text-xs font-mono text-[#8E9299]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold text-xs font-mono uppercase"
                >
                  Transmettre Justificatif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
