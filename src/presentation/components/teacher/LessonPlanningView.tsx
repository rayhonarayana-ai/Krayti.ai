/**
 * Qarayti.ai — Teacher Portal: Sub-Module 6: Lesson Planning & Faheem AI Generator
 * Weekly planner, MEN objectives compliance, and instant AI lesson plan generation.
 */

import React, { useState } from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { BrainCircuit, BookOpen, Sparkles, Plus, Clock, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { GeneratedAILessonPlan } from '../../../domain/types/teacherPortal.types';

export const LessonPlanningView: React.FC = () => {
  const { lessonPlans, generatedLessonPlans, isGeneratingAILesson, generateAILessonPlan, addLessonPlanUnit, activeClass } = useTeacherPortal();

  // Generator form
  const [topic, setTopic] = useState('Analyse Asymptotique & Développements Limités');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [focusNotes, setFocusNotes] = useState('Insister sur la rédaction rigoureuse exigée lors de la correction nationale Bac SM.');
  const [activePlan, setActivePlan] = useState<GeneratedAILessonPlan | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const result = await generateAILessonPlan({
      topic,
      subject: activeClass.subject || 'Mathématiques',
      gradeLevel: activeClass.gradeLevel || '2ème BAC',
      durationMinutes,
      focusNotes,
    });

    setActivePlan(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Cahier de Texte & Générateur de Cours AI</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Conformité aux orientations pédagogiques MEN, déroulement de séance et fiches pédagogiques différenciées.
          </p>
        </div>
      </div>

      {/* Generator & Active Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Faheem AI Generator Form */}
        <div className="bg-[#161920] border border-[#D4AF37]/40 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-[#D4AF37]">
            <BrainCircuit className="w-5 h-5" />
            <h3 className="text-base font-serif italic font-bold">Générateur Pédagogique Faheem AI</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-[#8E9299] block mb-1">Sujet de la Séance</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E9299] block mb-1">Durée (Minutes)</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
              >
                <option value={60}>60 minutes (1 heure)</option>
                <option value={120}>120 minutes (2 heures)</option>
                <option value={180}>180 minutes (3 heures)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8E9299] block mb-1">Remarques & Priorités BAC</label>
              <textarea
                rows={3}
                value={focusNotes}
                onChange={(e) => setFocusNotes(e.target.value)}
                className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={isGeneratingAILesson}
              className="w-full bg-[#D4AF37] text-[#0F1115] font-mono text-xs font-bold uppercase py-2.5 hover:bg-[#b5942d] transition-all flex items-center justify-center space-x-2"
            >
              {isGeneratingAILesson ? (
                <span>Génération par Faheem AI...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer Fiche de Cours AI</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Generated Plan View / Curriculum Progress */}
        <div className="lg:col-span-2 space-y-6">
          {activePlan || generatedLessonPlans.length > 0 ? (
            <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
              {(() => {
                const plan = activePlan || generatedLessonPlans[0];
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-[#2D333D] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/20 uppercase">
                          Fiche Générée par Faheem AI
                        </span>
                        <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold mt-1">{plan.topic}</h3>
                      </div>
                      <span className="text-xs font-mono text-[#8E9299] flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{plan.durationMinutes} min</span>
                      </span>
                    </div>

                    {/* Phase 1: Intro */}
                    <div className="bg-[#0F1115] p-3 border border-[#2D333D] space-y-1">
                      <div className="text-xs font-mono font-bold text-[#D4AF37]">1. Introduction & Accroche (10-15 min)</div>
                      <p className="text-xs font-mono text-[#8E9299]">{plan.introductionPhase}</p>
                    </div>

                    {/* Phase 2: Core concepts */}
                    <div className="bg-[#0F1115] p-3 border border-[#2D333D] space-y-1">
                      <div className="text-xs font-mono font-bold text-[#D4AF37]">2. Concepts Clés & Théorèmes MEN</div>
                      <ul className="list-disc list-inside text-xs font-mono text-[#8E9299] space-y-1">
                        {plan.coreConcepts.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Differentiated Guidance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
                        <span className="text-[#EF4444] font-bold block mb-1">Pour Élèves fragiles (θ &lt; 0.0)</span>
                        <p className="text-[#8E9299]">{plan.differentiatedGuidance.strugglingStudents}</p>
                      </div>
                      <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
                        <span className="text-[#10B981] font-bold block mb-1">Pour Élèves avancés (θ &gt; 1.5)</span>
                        <p className="text-[#8E9299]">{plan.differentiatedGuidance.advancedStudents}</p>
                      </div>
                    </div>

                    {/* Board Summary */}
                    <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
                      <span className="text-xs font-mono font-bold text-[#D4AF37] block mb-1">Plan du Tableau / Synthèse:</span>
                      <pre className="text-xs font-mono text-[#EAE9E6] whitespace-pre-wrap">{plan.boardSummary}</pre>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-[#161920] border border-[#2D333D] p-8 text-center space-y-3">
              <BrainCircuit className="w-10 h-10 text-[#D4AF37] mx-auto" />
              <h3 className="text-base font-serif italic text-[#EAE9E6]">Aucune Fiche Générée Actuellement</h3>
              <p className="text-xs font-mono text-[#8E9299] max-w-md mx-auto">
                Remplissez le formulaire ci-contre pour laisser Faheem AI construire une fiche pédagogique adaptée aux exigences du Baccalauréat Marocain.
              </p>
            </div>
          )}

          {/* Planned Units List */}
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Avancement du Programme (Cahier de Texte)</h3>
            <div className="space-y-3">
              {lessonPlans.map((lp) => (
                <div key={lp.id} className="bg-[#0F1115] border border-[#2D333D] p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-[#D4AF37]">{lp.className}</span>
                    <span className="text-[10px] font-mono text-[#8E9299] bg-[#2D333D] px-2 py-0.5">
                      {lp.completedSessions} / {lp.totalSessions} Séances
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#EAE9E6]">{lp.chapterTitle}</h4>
                  <ul className="list-disc list-inside text-xs font-mono text-[#8E9299] space-y-0.5">
                    {lp.menObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
