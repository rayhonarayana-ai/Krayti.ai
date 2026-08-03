/**
 * Qarayti.ai — Spaced Repetition Center View
 * Flashcards Deck Player with SM-2 Spaced Repetition Engine
 */

import React, { useState } from 'react';
import {
  RotateCw,
  CheckCircle2,
  Brain,
  Clock,
  Sparkles,
  Zap,
  HelpCircle,
  Eye,
  Award,
} from 'lucide-react';
import { SpacedRepetitionCard } from '../../../domain/types/adaptive.types';

interface SpacedRepetitionViewProps {
  cards: SpacedRepetitionCard[];
  onReviewCard: (cardId: string, rating: 1 | 2 | 3 | 4 | 5) => Promise<SpacedRepetitionCard>;
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({
  cards,
  onReviewCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardStore, setCardStore] = useState<SpacedRepetitionCard[]>(cards);

  const currentCard = cardStore[currentIndex];

  const handleRating = async (rating: 1 | 2 | 3 | 4 | 5) => {
    if (!currentCard) return;
    const updated = await onReviewCard(currentCard.id, rating);
    setCardStore((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % cardStore.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>خوارزمية التكرار المتباعد (SM-2 Spaced Repetition)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            بطاقات الاستذكار الفعال (Flashcard Revision Center)
          </h1>
          <p className="text-xs text-slate-500">
            تثبيت التعريفات والقوانين والعلاقات المرجعية للبكالوريا ومنع النسيان حسب منحنى إيبنغهاوس الذاكري.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="text-[10px] text-slate-500 font-medium">بطاقات اليوم</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">
              {currentIndex + 1} / {cardStore.length}
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Interactive Deck */}
      {currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="min-h-[280px] p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-700/80 flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-all text-center relative group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{currentCard.subjectId === 'MATH' ? 'الرياضيات' : 'الفيزياء الكيمياء'}</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Brain className="w-4 h-4" /> نسبة التذكر المقدرة: {(currentCard.retentionProbability * 100).toFixed(0)}%
              </span>
            </div>

            <div className="my-auto space-y-4">
              <div className="text-sm font-medium text-amber-300">
                {currentCard.promptAr || currentCard.prompt}
              </div>

              {showAnswer ? (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-lg font-bold text-emerald-300 animate-fadeIn">
                  {currentCard.answerAr || currentCard.answer}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-xs text-slate-400 font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Eye className="w-4 h-4" />
                  <span>انقر على البطاقة لكشف الجواب النموذجي</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              معامل السهولة (Ease Factor): {currentCard.easeFactor.toFixed(2)} • التكرارات: {currentCard.repetitionCount}
            </div>
          </div>

          {/* Rating Rating Controls */}
          {showAnswer && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="text-xs font-bold text-center text-slate-500">
                قيم مستوى تذكرك للبطاقة لتحديد موعد التكرار القادم:
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRating(1)}
                  className="p-3 rounded-xl bg-rose-500/10 text-rose-600 font-bold text-xs hover:bg-rose-500 hover:text-white transition-all text-center"
                >
                  صعب جداً (إعادة اليوم)
                </button>
                <button
                  onClick={() => handleRating(3)}
                  className="p-3 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-xs hover:bg-amber-500 hover:text-white transition-all text-center"
                >
                  متوسط (بعد 2 يوم)
                </button>
                <button
                  onClick={() => handleRating(4)}
                  className="p-3 rounded-xl bg-blue-500/10 text-blue-600 font-bold text-xs hover:bg-blue-500 hover:text-white transition-all text-center"
                >
                  جيد (بعد 4 أيام)
                </button>
                <button
                  onClick={() => handleRating(5)}
                  className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all text-center"
                >
                  سهل جداً (بعد أسبوع)
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          لا توجد بطاقات معلقة الآن. تهانينا!
        </div>
      )}
    </div>
  );
};
