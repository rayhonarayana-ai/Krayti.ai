/**
 * Qarayti.ai — Sprint 2.4: Adaptive Learning Intelligence Presentation View
 * Rich product-focused UI for Student Learning Profiles, Next Best Lesson Engine,
 * Forgetting Curve Decay Visualization, Spaced Repetition Planner, and
 * End-to-End Golden Path Real-time Execution with Trace ID.
 */

import React, { useState } from 'react';
import {
  Zap,
  Brain,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  Send,
  Bell,
  BarChart3,
  BookOpen,
  Target,
  RefreshCw,
  Award,
} from 'lucide-react';
import { adaptiveIntelligenceDomainService } from '../../../domain/services/adaptive-intelligence.service';
import {
  StudentLearningProfile,
  CompetencyMastery,
  NextBestLessonRecommendation,
  DailyRevisionPlan,
  GoldenPathAdaptiveResult,
} from '../../../core/adaptive/adaptive-learning-intelligence';

export const AdaptiveIntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GOLDEN_PATH' | 'NEXT_BEST' | 'FORGETTING_CURVE' | 'PLANNER'>('GOLDEN_PATH');

  const [profile] = useState<StudentLearningProfile>(
    adaptiveIntelligenceDomainService.getStudentProfile()
  );

  const [masteries, setMasteries] = useState<CompetencyMastery[]>(
    adaptiveIntelligenceDomainService.getStudentMasteries()
  );

  const [nextBestLesson, setNextBestLesson] = useState<NextBestLessonRecommendation>(
    adaptiveIntelligenceDomainService.getNextBestLesson()
  );

  const [revisionPlans] = useState<DailyRevisionPlan[]>(
    adaptiveIntelligenceDomainService.generate7DayRevisionPlan()
  );

  // Golden Path Simulation State
  const [simIsCorrect, setSimIsCorrect] = useState<boolean>(true);
  const [simResponseTime, setSimResponseTime] = useState<number>(35);
  const [simConfidence, setSimConfidence] = useState<number>(90);
  const [isProcessingGoldenPath, setIsProcessingGoldenPath] = useState<boolean>(false);
  const [goldenPathResult, setGoldenPathResult] = useState<GoldenPathAdaptiveResult | null>(null);

  const handleExecuteGoldenPath = async () => {
    setIsProcessingGoldenPath(true);
    try {
      const res = await adaptiveIntelligenceDomainService.processGoldenPathAnswer(
        profile.studentId,
        nextBestLesson.recommendedKo.id,
        simIsCorrect,
        simResponseTime,
        simConfidence
      );
      setGoldenPathResult(res);
      // Refresh local state
      setMasteries(adaptiveIntelligenceDomainService.getStudentMasteries());
      setNextBestLesson(adaptiveIntelligenceDomainService.getNextBestLesson());
    } catch (err) {
      console.error('Golden path execution error:', err);
    } finally {
      setIsProcessingGoldenPath(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Student Learning Profile Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  SPRINT 2.4 — ADAPTIVE LEARNING INTELLIGENCE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRODUCT PHASE SHIFT
                </span>
              </div>
              <h2 className="text-2xl font-black mt-2 flex items-center gap-2.5">
                <Brain className="w-8 h-8 text-teal-400" />
                <span>محرك التكيف والتعلم الشخصي — Qarayti Adaptive Engine</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
                ملف الطالب التعلمي، نموذج الإتقان (BKT)، منحنى النسيان (Ebbinghaus Decay)، تحديد الدرس الموالي الأمثل (Next Best Lesson)، والدورة الذهبية (Golden Path) للتكيف الفوري.
              </p>
            </div>

            {/* Sub-tab navigation */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('GOLDEN_PATH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'GOLDEN_PATH'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Golden Path Executor</span>
              </button>
              <button
                onClick={() => setActiveTab('NEXT_BEST')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'NEXT_BEST'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Next Best Lesson</span>
              </button>
              <button
                onClick={() => setActiveTab('FORGETTING_CURVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'FORGETTING_CURVE'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Forgetting Curve</span>
              </button>
              <button
                onClick={() => setActiveTab('PLANNER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'PLANNER'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Revision Planner</span>
              </button>
            </div>
          </div>

          {/* Student Profile Card Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">الطالب الحالي</span>
              <span className="text-sm font-black text-white mt-0.5 block truncate">{profile.studentName}</span>
              <span className="text-[10px] text-teal-400 font-mono">{profile.grade}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">مستوى القدرة (Theta IRT)</span>
              <span className="text-xl font-black text-indigo-400 mt-0.5 block">
                {profile.thetaProficiency >= 0 ? `+${profile.thetaProficiency.toFixed(2)}` : profile.thetaProficiency.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">مقياس قدرة الاختبارات</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">سرعة التعلم (Learning Rate)</span>
              <span className="text-xl font-black text-teal-400 mt-0.5 block">
                {profile.learningSpeedRate}x
              </span>
              <span className="text-[10px] text-slate-400">معدل استيعاب المفاهيم</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">متوسط زمن الإجابة</span>
              <span className="text-xl font-black text-amber-400 mt-0.5 block">
                {profile.avgResponseTimeSeconds} ثانية
              </span>
              <span className="text-[10px] text-slate-400">سرعة الاستجابة الذهنية</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">مؤشر الثقة والنضج</span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                {profile.confidenceScore}%
              </span>
              <span className="text-[10px] text-slate-400">التقييم الذاتي الموثوق</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: GOLDEN PATH EXECUTION SIMULATION */}
      {activeTab === 'GOLDEN_PATH' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Simulation Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400">
                  REAL-TIME ADAPTIVE LOOP SIMULATOR
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  محاكاة الدورة الذهبية للتكيف السريع (Golden Path)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40">
                LIVE EXECUTION
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>الدرس المستهدف للمحاكاة:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    {nextBestLesson.recommendedKo.title}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  السؤال: هل المتتالية (U_n) متقاربة إذا كانت موفورة ومكبورة بالعدد 2؟
                </p>
              </div>

              {/* Simulation Controls */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">
                    نتيجة إجابة الطالب:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSimIsCorrect(true)}
                      className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        simIsCorrect
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إجابة صحيحة (صواب)</span>
                    </button>
                    <button
                      onClick={() => setSimIsCorrect(false)}
                      className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        !simIsCorrect
                          ? 'bg-rose-500 text-white border-rose-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>إجابة خاطئة (تعثر)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                      زمن الإجابة: {simResponseTime} ثانية
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="180"
                      value={simResponseTime}
                      onChange={(e) => setSimResponseTime(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                      ثقة الطالب الذاتية: {simConfidence}%
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={simConfidence}
                      onChange={(e) => setSimConfidence(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleExecuteGoldenPath}
                  disabled={isProcessingGoldenPath}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessingGoldenPath ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري معالجة نموذج التكيف وإرسال الأحداث...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>تنفيذ الدورة الذهبية والتزامن مع كافة المحركات (Execute Golden Path)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Golden Path Result Card */}
          <div className="p-5 rounded-2xl bg-slate-950 text-white border border-teal-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[11px] font-black text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>GOLDEN PATH E2E EXECUTION RESULT</span>
              </span>
              {goldenPathResult && (
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                  {goldenPathResult.traceId}
                </span>
              )}
            </div>

            {goldenPathResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الإجراء المتخذ (Action Taken):</span>
                    <span className="font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800">
                      {goldenPathResult.actionTaken}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">قدرة الطالب الجديدة (Theta IRT):</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {goldenPathResult.updatedTheta >= 0 ? `+${goldenPathResult.updatedTheta}` : goldenPathResult.updatedTheta}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">معدل الإتقان الجديد (BKT Mastery):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {goldenPathResult.newMasteryPercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">نسبة التذكر المحسوبة (Forgetting Curve):</span>
                    <span className="font-mono font-bold text-teal-400">
                      {goldenPathResult.predictedRetention}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/60 space-y-1.5">
                  <div className="text-[10px] font-black text-teal-300 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5" />
                    <span>تزامن إشعار ولي الأمر (Parent Notification Sync)</span>
                  </div>
                  <p className="text-[11px] text-teal-100 leading-relaxed font-bold">
                    {goldenPathResult.parentSyncNotification}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-1.5 font-mono text-[10px]">
                  <div className="text-indigo-300 font-bold">EventBus Payload Dispatched:</div>
                  <div className="text-slate-300 truncate">Event: {goldenPathResult.eventDispatched}</div>
                  <div className="text-slate-400">Next KO: {goldenPathResult.nextBestLesson.recommendedKo.title}</div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Activity className="w-10 h-10 text-slate-700 animate-pulse" />
                <p className="text-xs font-bold">اضغط على زر التنفيذ أعلاه لتجربة المعالجة التكيفية المباشرة مع التتبع التام.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NEXT BEST LESSON ENGINE */}
      {activeTab === 'NEXT_BEST' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black text-teal-600 dark:text-teal-400">
                AI RECOMMENDATION ENGINE — NEXT BEST KNOWLEDGE OBJECT
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                الدرس الموالي الأكثر ملاءمة لحاجة الطالب الحالية
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300/40">
              درجة الأهمية: {nextBestLesson.urgencyScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 col-span-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-black bg-indigo-100 text-indigo-700 text-[10px]">
                  نوع التوصية: {nextBestLesson.recommendationType}
                </span>
                <span className="text-slate-400">• المدة المقدرة: {nextBestLesson.estimatedDurationMinutes} دقيقة</span>
              </div>

              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {nextBestLesson.recommendedKo.title}
              </h4>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 leading-relaxed font-bold">
                توجيه الخوارزمية: {nextBestLesson.reasoningArabic}
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {nextBestLesson.recommendedKo.contentMarkdown}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>سياق Faheem AI الموجه</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed italic bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                "{nextBestLesson.faheemGuidancePrompt}"
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>المرجع الوزاري: {nextBestLesson.recommendedKo.ministryReference}</div>
                <div>تاريخ التحديث: {new Date(nextBestLesson.recommendedKo.updatedAt).toLocaleDateString('ar-MA')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FORGETTING CURVE DECAY */}
      {activeTab === 'FORGETTING_CURVE' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-black text-teal-600 dark:text-teal-400">
              EBBINGHAUS MEMORY DECAY & SPACED REPETITION MODEL
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              منحنى التذكر والنسيان ومؤشر استقرار الذاكرة (Memory Stability)
            </h3>
          </div>

          <div className="space-y-3">
            {masteries.map((m) => (
              <div
                key={m.competencyCode}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {m.competencyTitle}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 mr-2">({m.competencyCode})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-indigo-100 text-indigo-700">
                      ثبات الذاكرة: {m.memoryStabilityDays} أيام
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        m.predictedRetentionPercent >= 70
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      نسبة التذكر الحالية: {m.predictedRetentionPercent}%
                    </span>
                  </div>
                </div>

                {/* Visual Decay Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        m.predictedRetentionPercent >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${m.predictedRetentionPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>آخر مراجعة: {new Date(m.lastPracticedDate).toLocaleDateString('ar-MA')}</span>
                    <span>
                      {m.predictedRetentionPercent < 70
                        ? 'تنبيه: يُوصى بجدولة مراجعة متباعدة فورية لتعزيز الذاكرة'
                        : 'مستوى التذكر ممتاز ومستقر'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REVISION PLANNER */}
      {activeTab === 'PLANNER' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-black text-teal-600 dark:text-teal-400">
              PERSONALIZED SPACED REPETITION REVISION CALENDAR
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              جدول المراجعة التكيفية الأسبوعية للإعداد للامتحان الوطني
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-xs">
            {revisionPlans.map((plan) => (
              <div
                key={plan.date}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {plan.dayName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{plan.date}</div>

                  <div className="mt-3 space-y-2">
                    {plan.targetKos.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">
                          {item.title}
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-slate-500">
                          <span>{item.type}</span>
                          <span className="font-bold text-teal-600">{item.durationMinutes}د</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 font-bold">
                  الإجمالي: {plan.totalEstimatedMinutes} دقيقة
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
