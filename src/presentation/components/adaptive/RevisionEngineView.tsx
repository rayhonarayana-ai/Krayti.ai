/**
 * Qarayti.ai — Sub-Module 7 & 8: Revision Engine & Spaced Repetition Flashcards Room
 * Interactive active recall studio with immediate SM-2 rating feedback, hint revelation,
 * and live BKT & memory decay recalculation.
 */

import React, { useState } from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { Repeat, Eye, HelpCircle, CheckCircle, Flame, Star, Zap, Award } from 'lucide-react';

export const RevisionEngineView: React.FC = () => {
  const { cards, submitCardReview, nodes } = useAdaptiveEngine();
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentCard = cards[cardIndex % cards.length];
  const linkedNode = nodes.find((n) => n.id === currentCard.nodeId);

  const handleRating = (qualityScore: number) => {
    submitCardReview(currentCard.id, qualityScore);
    setShowAnswer(false);
    setShowHint(false);
    setCardIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Repeat className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Moteur de Révision & Rappel Actif (Active Recall Room)</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Sessions d'entraînement interactives avec notation d'effort SM-2 et mise à jour BKT instantanée.
          </p>
        </div>

        <div className="text-xs font-mono text-[#D4AF37] border border-[#D4AF37]/50 px-3 py-1 bg-[#D4AF37]/10">
          Carte {cardIndex + 1} sur {cards.length}
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Flashcard Studio Box */}
        <div className="bg-[#161920] border-2 border-[#2D333D] hover:border-[#D4AF37]/80 p-8 min-h-[360px] flex flex-col justify-between transition-all relative">
          
          {/* Card Top Meta */}
          <div className="flex items-center justify-between text-xs font-mono text-[#8E9299] border-b border-[#2D333D] pb-3">
            <span>{linkedNode?.subjectName}</span>
            <span className="text-[#D4AF37] font-bold">{linkedNode?.code}</span>
            <span>Facteur Facilité: {currentCard.easeFactor}</span>
          </div>

          {/* Question / Prompt */}
          <div className="py-6 space-y-4 text-center">
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
              Question de Rappel Actif
            </span>
            <h3 className="text-2xl font-serif italic text-[#EAE9E6] leading-relaxed">
              {currentCard.prompt}
            </h3>
            {currentCard.promptAr && (
              <p className="text-lg font-sans text-[#8E9299] dir-rtl text-center font-medium pt-2">
                {currentCard.promptAr}
              </p>
            )}

            {/* Hint Box */}
            {showHint && currentCard.hint && (
              <div className="bg-[#0F1115] border border-[#D4AF37]/40 p-3 text-xs font-mono text-[#D4AF37] max-w-md mx-auto">
                💡 Indice: {currentCard.hint}
              </div>
            )}
          </div>

          {/* Answer Area */}
          {showAnswer ? (
            <div className="border-t border-[#2D333D] pt-6 space-y-6 animate-fadeIn">
              <div className="bg-[#0F1115] border border-emerald-500/40 p-6 text-center space-y-2">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  Réponse Explicative Exacte
                </span>
                <div className="text-xl font-serif italic text-emerald-300 font-bold">
                  {currentCard.answer}
                </div>
                {currentCard.answerAr && (
                  <p className="text-base font-sans text-emerald-400/80 dir-rtl text-center">
                    {currentCard.answerAr}
                  </p>
                )}
              </div>

              {/* SM-2 Quality Feedback Rating Buttons */}
              <div className="space-y-2">
                <div className="text-center text-xs font-mono text-[#8E9299] uppercase">
                  Évaluez la Facilité du Rappel (Mise à Jour Algorithme SM-2)
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRating(0)}
                    className="p-3 border border-rose-500 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 text-xs font-mono font-bold transition-all text-center"
                  >
                    <div>0 - Oubli Total</div>
                    <div className="text-[9px] text-rose-300 font-normal">Revoir demain (1j)</div>
                  </button>

                  <button
                    onClick={() => handleRating(3)}
                    className="p-3 border border-amber-500 bg-amber-950/30 text-amber-400 hover:bg-amber-900/50 text-xs font-mono font-bold transition-all text-center"
                  >
                    <div>3 - Difficile</div>
                    <div className="text-[9px] text-amber-300 font-normal">Intervalle + 2j</div>
                  </button>

                  <button
                    onClick={() => handleRating(4)}
                    className="p-3 border border-sky-500 bg-sky-950/30 text-sky-400 hover:bg-sky-900/50 text-xs font-mono font-bold transition-all text-center"
                  >
                    <div>4 - Bon Rappel</div>
                    <div className="text-[9px] text-sky-300 font-normal">Intervalle + 5j</div>
                  </button>

                  <button
                    onClick={() => handleRating(5)}
                    className="p-3 border border-emerald-500 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 text-xs font-mono font-bold transition-all text-center"
                  >
                    <div>5 - Parfait</div>
                    <div className="text-[9px] text-emerald-300 font-normal">Intervalle + 12j</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Reveal Controls */
            <div className="border-t border-[#2D333D] pt-4 flex items-center justify-between">
              {currentCard.hint ? (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center space-x-1.5 text-xs font-mono text-[#8E9299] hover:text-[#D4AF37]"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{showHint ? 'Masquer l\'indice' : 'Afficher l\'indice'}</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setShowAnswer(true)}
                className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#b8952c] text-[#0F1115] px-6 py-2.5 text-xs font-mono font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Révéler la Réponse</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
