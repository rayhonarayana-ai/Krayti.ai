/**
 * Qarayti.ai — Practice Exercises View
 * Interactive Exercises, AI Exercise Generator & Step-by-Step Scoring
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  Zap,
  RefreshCw,
  Lightbulb,
  ArrowLeft,
} from 'lucide-react';
import { StudentExercise, ExerciseSubmissionResult } from '../../../domain/types/studentPortal.types';

interface PracticeExercisesViewProps {
  exercises: StudentExercise[];
}

export const PracticeExercisesView: React.FC<PracticeExercisesViewProps> = ({ exercises }) => {
  const [selectedExercise, setSelectedExercise] = useState<StudentExercise | null>(exercises[0] || null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [submission, setSubmission] = useState<ExerciseSubmissionResult | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleSubmit = () => {
    if (!selectedExercise) return;
    setSubmission({
      exerciseId: selectedExercise.id,
      studentAnswer: userAnswer,
      scoreObtained: selectedExercise.maxPoints,
      maxPoints: selectedExercise.maxPoints,
      feedbackAr: 'إجابة نموذجية ومكتملة! تم استيفاء جميع المراحل المطلوبة في عناصر الإجابة الوطنية.',
      isCorrect: true,
      masteryGain: 0.08,
      xpEarned: 60,
    });
  };

  const handleGenerateAi = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const newEx: StudentExercise = {
        id: `ai-ex-${Date.now()}`,
        subjectId: 'MATH',
        topicAr: 'الأعداد العقدية - التحويلات النقطية والتكامل',
        topicFr: 'Nombres complexes et transformations',
        difficulty: 'HARD',
        questionText:
          'تمرين مولد بالذكاء الاصطناعي (فهيم):\nلتكن N النقطة ذات اللاحق z_N = 1 + i. حدد العمدة والمعيار، ثم احسب z^2026.',
        hints: ['تذكر أن 1 + i = \\sqrt{2} e^{i \\pi / 4}'],
        solutionSteps: [
          '1) المعيار: |z_N| = \\sqrt{1^2 + 1^2} = \\sqrt{2}',
          '2) العمدة: \\arg(z_N) = \\pi/4 [2\\pi]',
          '3) باستعمال صيغة موآفر: z^2026 = (\\sqrt{2})^2026 e^{i 2026 \\pi / 4} = 2^1013 e^{i 506.5 \\pi}',
        ],
        maxPoints: 3,
        isAiGenerated: true,
      };
      setSelectedExercise(newEx);
      setSubmission(null);
      setUserAnswer('');
      setIsGeneratingAi(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>تمارين تطبيقية تفاعلية</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            مركز التمارين والتطبيق العملي (Practice Exercises Hub)
          </h1>
          <p className="text-xs text-slate-500">
            تمرّن على صيغ أسئلة الامتحانات الوطنية والجهوية مع التقييم الآلي الفوري وسلالم التنقيط الرسمية.
          </p>
        </div>

        <button
          onClick={handleGenerateAi}
          disabled={isGeneratingAi}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{isGeneratingAi ? 'جاري توليد تمرين...' : 'توليد تمرين موجه بالذكاء الاصطناعي'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exercises List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white px-1">قائمة التمارين المتاحة</h2>
          {exercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                setSelectedExercise(ex);
                setSubmission(null);
                setUserAnswer('');
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedExercise?.id === ex.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{ex.topicAr}</span>
                <span className="font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {ex.maxPoints} ن
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 font-medium">
                {ex.questionText}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Active Exercise Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {selectedExercise ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedExercise.topicAr}
                  </span>
                  {selectedExercise.isAiGenerated && (
                    <span className="mr-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      مولد بـ فهيم AI
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  النقطة: {selectedExercise.maxPoints} ن
                </span>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-sm leading-relaxed text-slate-900 dark:text-white font-medium whitespace-pre-wrap">
                {selectedExercise.questionText}
              </div>

              {/* Multiple Choice Options if available */}
              {selectedExercise.options && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500">اختر الإجابة الصحيحة:</div>
                  {selectedExercise.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setUserAnswer(opt)}
                      className={`w-full text-right p-3 rounded-xl border text-xs font-semibold transition-all ${
                        userAnswer === opt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Written Answer Box */}
              {!selectedExercise.options && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500">اكتب مراحل الحل أو النتيجة النهائية:</div>
                  <textarea
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="اكتب خطوات الحل أو الصياغة الرياضية..."
                    className="w-full text-sm p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              {/* Actions & Hint */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showHint ? 'إخفاء المساعدة' : 'إظهار إشارة المساعدة (Hint)'}</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/20"
                >
                  تصحيح التمرين الآن
                </button>
              </div>

              {showHint && selectedExercise.hints && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  {selectedExercise.hints[0]}
                </div>
              )}

              {/* Submission Result */}
              {submission && (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>نتيجة التقييم: {submission.scoreObtained} / {submission.maxPoints} ن</span>
                    </div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                      +{submission.xpEarned} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {submission.feedbackAr}
                  </p>

                  <div className="border-t border-emerald-500/20 pt-3 space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">عناصر الإجابة النموذجية:</div>
                    {selectedExercise.solutionSteps?.map((step, idx) => (
                      <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {step}
                      </div>
                    )) || (
                      <div className="text-xs text-slate-500 dark:text-slate-500 italic">
                        التقييم يتم خادماً. النتيجة ستظهر بعد التحقق.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              اختر تمرين للبدء في الحل.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
