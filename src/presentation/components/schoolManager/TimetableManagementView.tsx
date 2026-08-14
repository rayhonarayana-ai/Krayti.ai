/**
 * Qarayti.ai — School Manager Portal: Sub-Module 6: Timetable & Room Scheduling
 * Class timetables, assigned teachers, room numbers & slot planning.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { Clock, Plus, Calendar, MapPin } from 'lucide-react';

export const TimetableManagementView: React.FC = () => {
  const { timetable, addTimetableSlot } = useSchoolManager();
  const [showAdd, setShowAdd] = useState(false);

  const [dayOfWeek, setDayOfWeek] = useState<'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi'>('Lundi');
  const [timeSlot, setTimeSlot] = useState('08:30 - 10:30');
  const [className, setClassName] = useState('2ème BAC Sc. Math A');
  const [subject, setSubject] = useState('Mathématiques');
  const [teacherName, setTeacherName] = useState('Prof. Reda El Mansouri');
  const [roomNumber, setRoomNumber] = useState('Salle B12');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTimetableSlot({
      dayOfWeek,
      timeSlot,
      className,
      subject,
      teacherName,
      roomNumber,
    });
    setShowAdd(false);
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Emplois du Temps & Salles de Cours</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Planification des créneaux hebdomadaires, affectation des professeurs et occupation des salles.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Créneau</span>
        </button>
      </div>

      {/* Timetable Weekly Grid */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => {
            const slotsForDay = timetable.filter((s) => s.dayOfWeek === day);
            return (
              <div key={day} className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-3">
                <div className="text-sm font-serif italic font-bold text-[#D4AF37] border-b border-[#2D333D] pb-2 flex justify-between items-center">
                  <span>{day}</span>
                  <span className="text-[10px] font-mono text-[#8E9299]">{slotsForDay.length} cours</span>
                </div>

                <div className="space-y-2">
                  {slotsForDay.map((slot) => (
                    <div key={slot.id} className="bg-[#161920] p-3 border border-[#2D333D] space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-[#D4AF37]">
                        <span>{slot.timeSlot}</span>
                        <span className="text-[#10B981]">{slot.roomNumber}</span>
                      </div>
                      <div className="text-xs font-serif font-bold text-[#EAE9E6]">{slot.subject}</div>
                      <div className="text-[10px] font-mono text-[#8E9299]">
                        {slot.className} — {slot.teacherName}
                      </div>
                    </div>
                  ))}
                  {slotsForDay.length === 0 && (
                    <div className="text-[10px] font-mono text-[#8E9299] py-4 text-center">
                      Aucun cours planifié
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2D333D] p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Ajouter un Créneau d'Emploi du Temps</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Jour de la Semaine</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Horaires</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Matière</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Professeur</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Salle de Cours</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
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
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
