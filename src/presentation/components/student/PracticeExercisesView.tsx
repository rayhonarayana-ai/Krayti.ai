/**
 * Qarayti.ai — Practice Exercises View
 * Gate 06D.4: Trusted exercise submission through Edge Function.
 * Browser authority limited to: exerciseCode, raw answer, submissionId, schoolId claim.
 * Server determines correctness. Browser NEVER grades.
 *
 * Gate 06D.4 CORRECTION: Submission eligibility requires exerciseSource === 'CANONICAL'.
 * exerciseCode alone is NOT sufficient — proven canonical mapping is required.
 * solutionSteps are hidden until GRADED to avoid pre-grade exposure.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Clock,
  Sparkles,
  Zap,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { StudentExercise, ExerciseSubmissionResult, ExerciseSource, ExerciseSubmissionEligibility, getExerciseSubmissionEligibility } from '../../../domain/types/studentPortal.types';

export interface TrustedExerciseSubmissionResponse {
  success: boolean;
  id?: string;
  duplicate?: boolean;
  verified?: {
    exerciseCode: string;
    subjectCode: string;
    koCode: string;
    competencies: string[];
    interactionResult: 'CORRECT' | 'INCORRECT';
    gradedBy: string;
  };
  dataQualityWarning?: string;
  httpStatus?: number;
}

interface PracticeExercisesViewProps {
  exercises: StudentExercise[];
  onSubmitExercise?: (
    exerciseCode: string,
    answer: string,
    submissionId: string,
  ) => Promise<TrustedExerciseSubmissionResponse>;
  schoolContextStatus?: 'NONE' | 'RESOLVED' | 'AMBIGUOUS';
}

function isCanonical(exercise: StudentExercise | null): boolean {
  return exercise?.exerciseSource === 'CANONICAL' && Boolean(exercise.exerciseCode);
}

function sourceBadge(source: ExerciseSource | undefined): { label: string; className: string } | null {
  switch (source) {
    case 'CANONICAL':
      return { label: 'تمرين موثوق', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    case 'PROTOTYPE_UNMAPPED':
      return { label: 'تمرين تجريبي', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-600' };
    case 'AI_GENERATED':
      return { label: 'مولّد بالذكاء الاصطناعي', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
    default:
      return null;
  }
}

/**
 * Gate 06D.4 CORRECTION: Source-specific eligibility messages.
 * Each eligibility state has a unique learner-facing message that
 * does NOT conflate provenance conditions with operational failures.
 */
function eligibilityWarningMessage(eligibility: ExerciseSubmissionEligibility): string | null {
  switch (eligibility.status) {
    case 'ELIGIBLE':
      return null;
    case 'PROTOTYPE_UNMAPPED':
      return 'هذا تمرين تجريبي للعرض، ولم يتم ربطه بعد بالمنهج الموثوق. لن تُسجَّل إجابتك كتقييم أو دليل تعلم.';
    case 'CANONICAL_MISMATCH':
      return 'هذا التمرين غير متاح للتقييم حالياً بسبب عدم تطابقه مع مرجع المنهج المعتمد.';
    case 'UNSUPPORTED_GRADING_MODE':
      return 'هذا النوع من التمارين غير مدعوم بعد في نظام التحقق والتصحيح الموثوق.';
    default:
      return null;
  }
}

/**
 * Gate 06D.4: Error-specific messages for post-submission failures.
 * Distinguishes operational failure (retryable) from curriculum-integrity rejection.
 */
function submissionErrorMessage(errorCode: string | undefined): { message: string; retryable: boolean } {
  switch (errorCode) {
    case 'CURRICULUM_INTEGRITY_ERROR':
      return {
        message: 'تعذر اعتماد هذا التمرين بسبب مشكلة في ربطه بالمنهج المعتمد. لم يتم تسجيل نتيجة.',
        retryable: false,
      };
    case 'SUBMISSION_FAILED':
    case 'NETWORK_ERROR':
    default:
      return {
        message: 'تعذر التحقق من الإجابة حالياً. لم يتم اعتماد نتيجة. يمكنك المحاولة مرة أخرى.',
        retryable: true,
      };
  }
}

export const PracticeExercisesView: React.FC<PracticeExercisesViewProps> = ({
  exercises,
  onSubmitExercise,
  schoolContextStatus,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<StudentExercise | null>(exercises[0] || null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [submission, setSubmission] = useState<ExerciseSubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const submissionIdRef = useRef<string | null>(null);

  // Gate 06D.4 CORRECTION: canSubmit requires CANONICAL source — exerciseCode alone is NOT sufficient
  const canSubmit = Boolean(
    isCanonical(selectedExercise) &&
    userAnswer.trim() &&
    !isSubmitting &&
    schoolContextStatus === 'RESOLVED' &&
    onSubmitExercise,
  );

  const handleSubmit = useCallback(async () => {
    if (!selectedExercise || !isCanonical(selectedExercise) || !selectedExercise.exerciseCode || !userAnswer.trim() || !onSubmitExercise) return;

    if (schoolContextStatus !== 'RESOLVED') return;

    const submissionId = crypto.randomUUID();
    submissionIdRef.current = submissionId;

    setSubmission({
      status: 'PENDING_VERIFICATION',
      exerciseId: selectedExercise.id,
      studentAnswer: userAnswer,
      feedbackAr: 'تم إرسال إجابتك، جارٍ التحقق منها...',
    });
    setIsSubmitting(true);

    try {
      const response = await onSubmitExercise(
        selectedExercise.exerciseCode,
        userAnswer,
        submissionId,
      );

      if (submissionIdRef.current !== submissionId) return;

      if (!response.success || !response.verified) {
        setSubmission({
          status: 'ERROR',
          exerciseId: selectedExercise.id,
          studentAnswer: userAnswer,
          feedbackAr: response.httpStatus === 422
            ? 'تعذر اعتماد هذا التمرين بسبب مشكلة في ربطه بالمنهج المعتمد. لم يتم تسجيل نتيجة.'
            : 'تعذر التحقق من الإجابة حالياً. لم يتم اعتماد نتيجة. يمكنك المحاولة مرة أخرى.',
          errorCode: response.httpStatus === 422 ? 'CURRICULUM_INTEGRITY_ERROR' : 'SUBMISSION_FAILED',
        });
        setIsSubmitting(false);
        return;
      }

      const isCorrect = response.verified.interactionResult === 'CORRECT';

      setSubmission({
        status: 'GRADED',
        exerciseId: selectedExercise.id,
        exerciseCode: response.verified.exerciseCode,
        studentAnswer: userAnswer,
        isCorrect,
        feedbackAr: isCorrect ? 'إجابة صحيحة' : 'الإجابة غير صحيحة',
        subjectCode: response.verified.subjectCode,
        koCode: response.verified.koCode,
        competencies: response.verified.competencies,
        observationId: response.id,
        duplicate: response.duplicate,
        dataQualityWarning: response.dataQualityWarning,
      });
    } catch {
      if (submissionIdRef.current !== submissionId) return;
      setSubmission({
        status: 'ERROR',
        exerciseId: selectedExercise.id,
        studentAnswer: userAnswer,
        feedbackAr: 'تعذر التحقق من الإجابة حالياً. لم يتم اعتماد نتيجة. يمكنك المحاولة مرة أخرى.',
        errorCode: 'NETWORK_ERROR',
      });
    } finally {
      if (submissionIdRef.current === submissionId) {
        setIsSubmitting(false);
      }
    }
  }, [selectedExercise, userAnswer, onSubmitExercise, schoolContextStatus]);

  const handleRetry = useCallback(() => {
    if (!submission || submission.status !== 'ERROR') return;
    handleSubmit();
  }, [submission, handleSubmit]);

  const handleNewAttempt = useCallback(() => {
    submissionIdRef.current = null;
    setSubmission(null);
    setUserAnswer('');
  }, []);

  const handleSelectExercise = useCallback((ex: StudentExercise) => {
    submissionIdRef.current = null;
    setSelectedExercise(ex);
    setSubmission(null);
    setUserAnswer('');
  }, []);

  const handleGenerateAi = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const newEx: StudentExercise = {
        id: `ai-ex-${Date.now()}`,
        exerciseSource: 'AI_GENERATED',
        subjectId: 'MATH',
        topicAr: 'الأعداد العقدية - التحويلات النقطية والتكامل',
        topicFr: 'Nombres complexes et transformations',
        difficulty: 'HARD',
        questionText:
          'تمرين مولد بالذكاء الاصطناعي (فهيم):\nلتكن N النقطة ذات اللاحق z_N = 1 + i. حدد العمدة والمعيار، ثم احسب z^2026.',
        hints: ['تذكر أن 1 + i = \\sqrt{2} e^{i \\pi / 4}'],
        maxPoints: 3,
        isAiGenerated: true,
      };
      setSelectedExercise(newEx);
      setSubmission(null);
      setUserAnswer('');
      setIsGeneratingAi(false);
    }, 1200);
  };

  const badge = sourceBadge(selectedExercise?.exerciseSource);
  const eligibility = getExerciseSubmissionEligibility(selectedExercise);
  const eligibilityMsg = eligibilityWarningMessage(eligibility);

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
          {exercises.map((ex) => {
            const exBadge = sourceBadge(ex.exerciseSource);
            return (
              <div
                key={ex.id}
                onClick={() => handleSelectExercise(ex)}
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
                {exBadge && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${exBadge.className}`}>
                      {ex.exerciseSource === 'CANONICAL' ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                      {exBadge.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Exercise Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {selectedExercise ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedExercise.topicAr}
                  </span>
                  {badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                      {selectedExercise.exerciseSource === 'CANONICAL' ? <ShieldCheck className="w-3 h-3 inline" /> : <ShieldOff className="w-3 h-3 inline" />}
                      {' '}{badge.label}
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
                      onClick={() => { if (!isSubmitting) setUserAnswer(opt); }}
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    placeholder="اكتب خطوات الحل أو الصياغة الرياضية..."
                    className="w-full text-sm p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
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

                {submission?.status === 'ERROR' && submissionErrorMessage(submission.errorCode).retryable ? (
                  <button
                    onClick={handleRetry}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50 transition-colors shadow-md flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة المحاولة</span>
                  </button>
                ) : submission?.status === 'GRADED' ? (
                  <button
                    onClick={handleNewAttempt}
                    className="px-6 py-2.5 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-bold text-xs transition-colors shadow-md"
                  >
                    محاولة جديدة
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/20 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جارٍ التحقق...</span>
                      </>
                    ) : (
                      <span>تصحيح التمرين الآن</span>
                    )}
                  </button>
                )}
              </div>

              {/* Source-specific pre-submission warnings — eligibility-based */}
              {eligibility.status !== 'ELIGIBLE' && eligibilityMsg && !submission && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  eligibility.status === 'CANONICAL_MISMATCH'
                    ? 'bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-700 dark:text-red-400'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{eligibilityMsg}</span>
                </div>
              )}

              {schoolContextStatus !== 'RESOLVED' && schoolContextStatus !== undefined && !submission && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>يجب تحديد السياق المدرسي أولاً قبل إرسال الإجابة.</span>
                </div>
              )}

              {showHint && selectedExercise.hints && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  {selectedExercise.hints[0]}
                </div>
              )}

              {/* PENDING_VERIFICATION state */}
              {submission?.status === 'PENDING_VERIFICATION' && (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span>جارٍ التحقق من الإجابة عبر الخادم الموثوق...</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {submission.feedbackAr}
                  </p>
                </div>
              )}

              {/* GRADED state */}
              {submission?.status === 'GRADED' && (
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  submission.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {submission.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-400">إجابة صحيحة</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-red-700 dark:text-red-400">الإجابة غير صحيحة</span>
                      </>
                    )}
                    {submission.duplicate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        إجابة مكررة
                      </span>
                    )}
                  </div>

                  {submission.dataQualityWarning && (
                    <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-[10px] font-medium">
                      {submission.dataQualityWarning}
                    </div>
                  )}

                  <div className="border-t border-emerald-500/20 dark:border-red-500/20 pt-3 space-y-1 text-[10px] font-mono text-slate-500 dark:text-slate-500">
                    <div>exerciseCode: {submission.exerciseCode}</div>
                    <div>subjectCode: {submission.subjectCode} | koCode: {submission.koCode}</div>
                    <div>competencies: {submission.competencies.join(', ')}</div>
                  </div>
                </div>
              )}

              {/* ERROR state — source-specific error message */}
              {submission?.status === 'ERROR' && (() => {
                const errInfo = submissionErrorMessage(submission.errorCode);
                return (
                  <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5" />
                      <span>
                        {submission.errorCode === 'CURRICULUM_INTEGRITY_ERROR'
                          ? 'خطأ في ربط التمرين بالمنهج'
                          : 'تعذر التحقق من الإجابة'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {errInfo.message}
                    </p>
                  </div>
                );
              })()}
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
