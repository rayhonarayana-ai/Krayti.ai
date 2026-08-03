/**
 * Qarayti.ai — Parent Portal: Sub-Module 6: Homework & Personal Work
 * Assigned homework tracking, completion toggles, missing alerts, and AI evaluation feedback.
 */

import React from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import { parentPortalService } from '../../../domain/services/parentPortal.service';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

export const HomeworkView: React.FC = () => {
  const { activeChild, homework, toggleHomeworkStatus } = useParentPortal();

  const childHomework = homework.filter((h) => h.childId === activeChild.id);
  const pendingCount = childHomework.filter((h) => h.status === 'PENDING').length;
  const completedCount = childHomework.filter((h) => h.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Travaux à la Maison & Fiches d'Exercices (AI Evaluated)
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Suivi quotidien des devoirs attribués par les enseignants et évaluation pédagogique automatique.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="bg-amber-950/40 text-amber-400 border border-amber-500/30 px-3 py-1.5">
            {pendingCount} En Attente
          </span>
          <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5">
            {completedCount} Terminé(s)
          </span>
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="space-y-4">
        {childHomework.map((hw) => {
          const aiEval = parentPortalService.evaluateHomeworkCompletion(hw);
          const isCompleted = hw.status === 'COMPLETED';

          return (
            <div
              key={hw.id}
              className={`bg-[#161920] border p-5 space-y-4 transition-all ${
                isCompleted ? 'border-[#2D333D] opacity-80' : 'border-[#D4AF37]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D333D] pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 border border-[#D4AF37]/30">
                      {hw.subject}
                    </span>
                    <span className="text-xs font-mono text-[#8E9299]">Enseignant: {hw.teacherName}</span>
                  </div>
                  <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold mt-1">
                    {hw.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-[#8E9299]">
                    À rendre le: <strong className="text-[#EAE9E6]">{hw.dueDate}</strong>
                  </span>

                  <button
                    onClick={() => toggleHomeworkStatus(hw.id)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                        : 'bg-[#D4AF37] text-[#0F1115] border-[#D4AF37] hover:bg-amber-400'
                    }`}
                  >
                    {isCompleted ? 'Marqué Terminé' : 'Valider Fait'}
                  </button>
                </div>
              </div>

              <p className="text-xs font-serif text-[#8E9299] leading-relaxed">{hw.description}</p>

              {/* AI Evaluation Comment */}
              <div className="bg-[#0F1115] p-3.5 border border-[#2D333D] flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase block">
                    Évaluation IA Qarayti.ai:
                  </span>
                  <p className="text-xs font-serif italic text-[#EAE9E6]">{aiEval.aiComment}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
