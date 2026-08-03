/**
 * Qarayti.ai — Teacher Portal: Sub-Module 2: Assignments Manager
 * Create, assign, track, and grade homework and Baccalaureate practice series.
 */

import React, { useState } from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { FileText, Plus, Calendar, CheckCircle2, Clock, Upload, Send, Paperclip } from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  const { assignments, classes, activeClassId, createAssignment } = useTeacherPortal();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetClassId, setTargetClassId] = useState(activeClassId);
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(20);
  const [attachmentName, setAttachmentName] = useState('');

  const filteredAssignments = assignments.filter((a) => a.classId === activeClassId);

  const handleSubmitNewAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedClassObj = classes.find((c) => c.id === targetClassId) || classes[0];

    createAssignment({
      classId: targetClassId,
      className: selectedClassObj.className,
      subject: selectedClassObj.subject,
      title,
      description,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      totalStudents: selectedClassObj.studentCount,
      status: 'PUBLISHED',
      maxScore,
      attachmentName: attachmentName || undefined,
    });

    setTitle('');
    setDescription('');
    setAttachmentName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Devoirs à La Maison & Séries d'Exercices</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Création de devoirs, distribution des séries type Examen National, suivi des rendus et correction.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#c4a02f] text-[#0F1115] px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Devoir</span>
        </button>
      </div>

      {/* Assignment Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map((assignment) => {
          const submissionPercentage = Math.round(
            (assignment.totalSubmissions / (assignment.totalStudents || 1)) * 100
          );

          let statusBadge = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
          if (assignment.status === 'CLOSED') {
            statusBadge = 'bg-[#0F1115] text-[#8E9299] border-[#2D333D]';
          }

          return (
            <div
              key={assignment.id}
              className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col justify-between space-y-4 hover:border-[#8E9299] transition-all"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 text-[10px] font-mono border font-bold ${statusBadge}`}>
                    {assignment.status}
                  </span>
                  <div className="text-[10px] font-mono text-[#8E9299] flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" />
                    <span>À rendre le {assignment.dueDate}</span>
                  </div>
                </div>

                <h3 className="text-base font-serif italic text-[#EAE9E6] font-bold">{assignment.title}</h3>
                <p className="text-xs font-mono text-[#8E9299] leading-relaxed">{assignment.description}</p>

                {assignment.attachmentName && (
                  <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#D4AF37] bg-[#0F1115] border border-[#2D333D] px-2.5 py-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{assignment.attachmentName}</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="border-t border-[#2D333D] pt-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[11px] text-[#8E9299]">
                  <span>Rendus Élèves</span>
                  <span className="text-[#EAE9E6] font-bold">
                    {assignment.totalSubmissions} / {assignment.totalStudents} ({submissionPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#0F1115] h-1.5 border border-[#2D333D] overflow-hidden">
                  <div className="bg-[#D4AF37] h-full" style={{ width: `${submissionPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#8E9299] pt-1">
                  <span>Corrigés: {assignment.gradedCount}</span>
                  <span>Barème: {assignment.maxScore} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-[#D4AF37] max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#2D333D] pb-3">
              <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
                Nouveau Devoir / Série d'Exercices
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8E9299] hover:text-[#EAE9E6] text-xs font-mono"
              >
                [ Fermer ]
              </button>
            </div>

            <form onSubmit={handleSubmitNewAssignment} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#8E9299]">Classe Destinataire</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#8E9299]">Titre du Devoir / Problème</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Devoir Maison N°3 — Analyse Fonctionnelle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8E9299]">Instructions & Consignes</label>
                <textarea
                  rows={3}
                  placeholder="Consignes particulières, numéros d'exercices..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#8E9299]">Date Limite de Rendu</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#8E9299]">Barème (Max Score)</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8E9299]">Nom du Fichier Joint (Optionnel)</label>
                <input
                  type="text"
                  placeholder="ex: Serie_Probalites_2026.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] p-2 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#2D333D] text-[#8E9299] hover:text-[#EAE9E6]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold hover:bg-[#c4a02f]"
                >
                  Publier le Devoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
