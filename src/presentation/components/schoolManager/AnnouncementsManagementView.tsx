/**
 * Qarayti.ai — School Manager Portal: Sub-Module 10: Announcements & Communiqués
 * Official announcements broadcasted to teachers, parents, students or entire school.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { Megaphone, Plus, Bell, AlertTriangle } from 'lucide-react';

export const AnnouncementsManagementView: React.FC = () => {
  const { announcements, addAnnouncement } = useSchoolManager();
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState('Planning des Examens Blancs du Semestre 2');
  const [content, setContent] = useState('Nous informons l’ensemble des élèves et professeurs des classes de 2ème BAC que la session des examens blancs débutera le 15 mai.');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS'>('ALL');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      title,
      content,
      targetAudience,
      author: 'La Direction Générale',
      priority,
      isPinned: true,
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Communiqués Officiels & Diffusion Instantanée</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Publication d'annonces officielles envoyées simultanément aux portails Professeurs, Parents et Élèves.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(false)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Publier un Communiqué</span>
        </button>
      </div>

      {/* Announcements Stream */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
          Annonces Actives ({announcements.length})
        </h3>

        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                    ann.priority === 'URGENT'
                      ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                      : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                  }`}>
                    {ann.priority}
                  </span>
                  <span className="text-[10px] font-mono text-[#8E9299]">Cible: {ann.targetAudience}</span>
                </div>
                <span className="text-[10px] font-mono text-[#8E9299]">{ann.publishDate}</span>
              </div>

              <h4 className="text-sm font-serif font-bold text-[#EAE9E6]">{ann.title}</h4>
              <p className="text-xs font-mono text-[#8E9299] leading-relaxed">{ann.content}</p>
              <div className="text-[10px] font-mono text-[#D4AF37] pt-1">Émis par: {ann.author}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2D333D] p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Rédiger un Communiqué</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Titre du Communiqué</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Destinataires</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  <option value="ALL">Tous (Profs, Parents, Élèves)</option>
                  <option value="TEACHERS">Corps Enseignant Uniquement</option>
                  <option value="PARENTS">Tuteurs / Parents Uniquement</option>
                  <option value="STUDENTS">Élèves Uniquement</option>
                </select>
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Texte de l'annonce</label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  Publier l'Annonce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
