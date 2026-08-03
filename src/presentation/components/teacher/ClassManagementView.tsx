/**
 * Qarayti.ai — Teacher Portal: Sub-Module 1: Class Management
 * Overview of assigned classes, class schedules, room numbers, student rosters, and IRT risk indicators.
 */

import React, { useState } from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { School, Users, Clock, MapPin, Award, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';

export const ClassManagementView: React.FC = () => {
  const { classes, activeClassId, setActiveClassId, roster } = useTeacherPortal();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const activeClassRoster = roster.filter((s) => s.classId === activeClassId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <School className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Gestion des Classes & Effectifs</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Gestion des classes affectées, emploi du temps hebdomadaire, suivi des effectifs et détection précoce du risque Bac.
          </p>
        </div>
        <div className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 self-start md:self-auto">
          {classes.length} Classe(s) Enseignée(s)
        </div>
      </div>

      {/* Class Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const isActive = cls.id === activeClassId;
          return (
            <button
              key={cls.id}
              onClick={() => setActiveClassId(cls.id)}
              className={`text-left p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'bg-[#161920] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5'
                  : 'bg-[#0F1115] border-[#2D333D] hover:border-[#8E9299] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[#8E9299] uppercase">{cls.gradeLevel}</span>
                  <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#0F1115] px-2 py-0.5 border border-[#2D333D]">
                    Coef. {cls.coefficient}
                  </span>
                </div>
                <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold">{cls.className}</h3>
                <p className="text-xs font-mono text-[#D4AF37]">{cls.track}</p>
              </div>

              <div className="space-y-1.5 border-t border-[#2D333D] pt-3 text-xs font-mono text-[#8E9299]">
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{cls.studentCount} Élèves Inscrits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Moyenne Classe: {cls.classAverage} / 20</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8E9299]" />
                  <span>{cls.roomNumber}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Roster & Schedule Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Roster Table */}
        <div className="lg:col-span-2 bg-[#161920] border border-[#2D333D] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D333D] pb-3">
            <div>
              <span className="text-xs font-mono text-[#D4AF37] uppercase">Roster de la Classe</span>
              <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
                {activeClassRoster.length > 0 ? `Élèves de ${classes.find(c => c.id === activeClassId)?.className}` : 'Liste des Élèves'}
              </h3>
            </div>
            <div className="text-xs font-mono text-[#8E9299]">
              {activeClassRoster.length} Élève(s) dans le Roster
            </div>
          </div>

          <div className="space-y-2">
            {activeClassRoster.map((student) => {
              let riskBadge = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
              if (student.riskLevel === 'HIGH') {
                riskBadge = 'bg-rose-950/40 text-rose-400 border-rose-500/30';
              } else if (student.riskLevel === 'MEDIUM') {
                riskBadge = 'bg-amber-950/40 text-amber-400 border-amber-500/30';
              }

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`bg-[#0F1115] border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                    selectedStudentId === student.id ? 'border-[#D4AF37] bg-[#161920]' : 'border-[#2D333D] hover:border-[#8E9299]'
                  }`}
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

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-[#D4AF37] font-bold">{student.currentAverage} / 20</div>
                      <div className="text-[10px] text-[#8E9299]">Moyenne Actuelle</div>
                    </div>

                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">{student.attendanceRate}%</div>
                      <div className="text-[10px] text-[#8E9299]">Présence</div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-mono border font-bold ${riskBadge}`}>
                      {student.riskLevel === 'HIGH' ? 'RISQUE BAC' : student.riskLevel === 'MEDIUM' ? 'ATTENTION' : 'REGULIER'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule & Class Details Panel */}
        <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-6">
          <div className="border-b border-[#2D333D] pb-3">
            <span className="text-xs font-mono text-[#D4AF37] uppercase">Fiche Technique Classe</span>
            <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold mt-1">
              Informations Organisationnelles
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-2">
              <div className="text-[#D4AF37] font-bold flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Créneaux Hebdomadaires</span>
              </div>
              <p className="text-[#EAE9E6] leading-relaxed pt-1">
                {classes.find((c) => c.id === activeClassId)?.scheduleSlot}
              </p>
            </div>

            <div className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-2">
              <div className="text-[#D4AF37] font-bold flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Salle Affectée</span>
              </div>
              <p className="text-[#EAE9E6]">
                {classes.find((c) => c.id === activeClassId)?.roomNumber} — Lycée Qualifiant Moulay Youssef
              </p>
            </div>

            <div className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-2">
              <div className="text-[#D4AF37] font-bold flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Matière & Programme MEN</span>
              </div>
              <p className="text-[#EAE9E6]">
                {classes.find((c) => c.id === activeClassId)?.subject} (Coefficient {classes.find((c) => c.id === activeClassId)?.coefficient})
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
