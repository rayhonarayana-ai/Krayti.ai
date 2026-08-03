/**
 * Qarayti.ai — Teacher Portal: Sub-Module 4: Attendance Management
 * Session roll call, absence tracking, and justification logs for Moroccan high school sessions.
 */

import React from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { UserCheck, UserX, Clock, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { attendance, roster, activeClassId, updateAttendanceStatus, classes } = useTeacherPortal();

  const classStudents = roster.filter((s) => s.classId === activeClassId);

  // Today's attendance list
  const currentClassAttendance = attendance.filter((a) => a.classId === activeClassId);

  const presentCount = currentClassAttendance.filter((a) => a.status === 'PRESENT').length;
  const absentCount = currentClassAttendance.filter((a) => a.status === 'ABSENT').length;
  const lateCount = currentClassAttendance.filter((a) => a.status === 'LATE').length;

  const currentClassObj = classes.find((c) => c.id === activeClassId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Appel & Suivi des Absences en Séance</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Feuille de présence de la séance du jour ({new Date().toLocaleDateString('fr-FR')}) — {currentClassObj?.className}.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1">
            {presentCount} Présent(s)
          </span>
          <span className="text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-1">
            {absentCount} Absent(s)
          </span>
          <span className="text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1">
            {lateCount} En Retard
          </span>
        </div>
      </div>

      {/* Attendance Roster Roll Call */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D333D] pb-3">
          <div>
            <span className="text-xs font-mono text-[#D4AF37] uppercase">Feuille de Présence Numérique</span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
              Séance: {currentClassObj?.scheduleSlot || '08:30 - 10:30'}
            </h3>
          </div>
          <div className="text-xs font-mono text-[#8E9299]">
            Mis à jour automatiquement dans le bulletin de présence
          </div>
        </div>

        <div className="space-y-2">
          {classStudents.map((student) => {
            const attItem = currentClassAttendance.find((a) => a.studentId === student.id);
            const status = attItem ? attItem.status : 'PRESENT';

            return (
              <div
                key={student.id}
                className="bg-[#0F1115] border border-[#2D333D] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-10 h-10 rounded-full border border-[#D4AF37] object-cover"
                  />
                  <div>
                    <div className="text-sm font-serif italic text-[#EAE9E6] font-bold">{student.fullName}</div>
                    <div className="text-[10px] font-mono text-[#8E9299]">Massar: {student.massarCode}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 font-mono text-xs">
                  {/* Status Toggle Buttons */}
                  <button
                    onClick={() => updateAttendanceStatus(attItem?.id || '', 'PRESENT')}
                    className={`px-3 py-1.5 flex items-center space-x-1.5 border transition-all ${
                      status === 'PRESENT'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-[#161920] border-[#2D333D] text-[#8E9299] hover:text-[#EAE9E6]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Présent</span>
                  </button>

                  <button
                    onClick={() => updateAttendanceStatus(attItem?.id || '', 'LATE')}
                    className={`px-3 py-1.5 flex items-center space-x-1.5 border transition-all ${
                      status === 'LATE'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-400 font-bold'
                        : 'bg-[#161920] border-[#2D333D] text-[#8E9299] hover:text-[#EAE9E6]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>En Retard</span>
                  </button>

                  <button
                    onClick={() => updateAttendanceStatus(attItem?.id || '', 'ABSENT')}
                    className={`px-3 py-1.5 flex items-center space-x-1.5 border transition-all ${
                      status === 'ABSENT'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-400 font-bold'
                        : 'bg-[#161920] border-[#2D333D] text-[#8E9299] hover:text-[#EAE9E6]'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
