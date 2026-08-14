/**
 * Qarayti.ai — Student Dashboard View
 * Primary Overview Module for Student Portal
 */

import React, { useState } from 'react';
import {
  Flame,
  Award,
  BookOpen,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  Battery,
  BatteryCharging,
  Brain,
  Calculator,
  Compass,
  Milestone,
  Sliders,
  RotateCcw,
  Activity,
  Check,
} from 'lucide-react';
import { StudentDashboardSummary } from '../../../domain/types/studentPortal.types';
import { Recommendation } from '../../../domain/types/adaptive.types';

interface StudentDashboardViewProps {
  summary: StudentDashboardSummary;
  recommendations: Recommendation[];
  onNavigateTab: (tabId: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  summary,
  recommendations,
  onNavigateTab,
}) => {
  const progressPercent = Math.min(100, Math.round((summary.todayStudyMinutes / summary.todayGoalMinutes) * 100));

  // Feature State 2: Learning Energy
  const [learningEnergy, setLearningEnergy] = useState<'optimal' | 'light' | 'rest'>('optimal');

  // Feature State 4: BAC Score Simulator Marks
  const [simMath, setSimMath] = useState<number>(16.5);
  const [simPhys, setSimPhys] = useState<number>(15.0);
  const [simSvt, setSimSvt] = useState<number>(16.0);
  const [simPhilo, setSimPhilo] = useState<number>(14.0);
  const [simEng, setSimEng] = useState<number>(15.5);

  const totalCoeffs = 9 + 7 + 5 + 2 + 2; // 25
  const simAverage = Number(
    ((simMath * 9 + simPhys * 7 + simSvt * 5 + simPhilo * 2 + simEng * 2) / totalCoeffs).toFixed(2)
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نظام البكالوريا المغربي - مسلك العلوم الرياضية أ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              مرحباً بك {summary.name} 👋
            </h1>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              تلميذ بـ <strong className="text-white">{summary.schoolName}</strong> ({summary.regionalCity}).
              هدفك هو الحصول على معدل <strong className="text-yellow-300 font-bold">{summary.bacTargetScore}/20</strong> في البكالوريا.
              توقعات نظام فهيم الحالية: <strong className="text-emerald-300 font-bold">{summary.currentEstimatedBacScore}/20</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('daily-plan')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>مواصلة خطة اليوم</span>
              </button>
              <button
                onClick={() => onNavigateTab('ai-tutor')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-sm transition-colors border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>المساعد الذكي (فهيم AI)</span>
              </button>
            </div>
          </div>

          {/* Target BAC Score Circle Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 self-start md:self-auto min-w-[200px]">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 text-slate-950 font-black text-xl shadow-md">
              {summary.bacTargetScore}
              <span className="text-xs font-normal opacity-80">/20</span>
            </div>
            <div>
              <div className="text-xs text-emerald-200 font-medium">هدف البكالوريا (BAC)</div>
              <div className="text-sm font-bold text-white mt-0.5">معدل التميز الوطني</div>
              <div className="text-xs text-emerald-300/80 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>تطور +0.8 هذا الشهر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative backdrop blobs */}
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.streakDays} <span className="text-xs font-normal text-slate-500">أيام</span>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">سلسلة المذاكرة (Streak)</div>
          </div>
        </div>

        {/* XP Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.xp} <span className="text-xs font-normal text-slate-500">XP</span>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{summary.levelTitle}</div>
          </div>
        </div>

        {/* Today's Study Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.todayStudyMinutes} <span className="text-xs font-normal text-slate-500">/ {summary.todayGoalMinutes} د</span>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">وقت الدراسة اليوم</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Global Mastery */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.masteryPercentage}%
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">نسبة استيعاب المقررات</div>
          </div>
        </div>
      </div>

      {/* 1. BAC Goal Progress Bar & High Impact Analysis */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              شريط التقدم نحو هدف البكالوريا (BAC Goal Progress)
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400">احتمال النجاح الحالي: 88.5%</span>
            <span className="text-slate-400">•</span>
            <span className="text-amber-600 dark:text-amber-400">المسافة المتبقية للهدف: 1.3 نقطة</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">المعدل المتوقع الحالي: {summary.currentEstimatedBacScore}/20</span>
            <span className="text-emerald-600 dark:text-emerald-400">الهدف المنشود: {summary.bacTargetScore}/20</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(summary.currentEstimatedBacScore / summary.bacTargetScore) * 100}%` }}
            />
          </div>
        </div>

        {/* High Impact Subjects Projection Note */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            <strong className="text-emerald-700 dark:text-emerald-300 block mb-1">
              تحليل التأثير العالي لحساب معدل البكالوريا (High Impact Subjects):
            </strong>
            إذا رفعت <strong>الرياضيات (معامل 9)</strong> بـ <strong>1.2 نقطة</strong> و<strong>الفيزياء (معامل 7)</strong> بـ <strong>0.8 نقطة</strong>، سيصبح التوقع المباشر لمعدلك <strong>17.6 / 20</strong> وتتجاوز هدفك!
          </div>
        </div>
      </div>

      {/* Feature 1: "طريقك إلى الهدف" (Road to Goal Timeline) & Feature 2: "مؤشر الطاقة الذهنية" (Learning Energy) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Road to Goal Timeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Milestone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                طريقك إلى الهدف (Road to Goal)
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              مسار التطور التوقعي
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: 'اليوم', score: '16.2', status: 'المستوى الحالي', active: true, color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800' },
              { title: 'بعد أسبوع', score: '16.6', status: 'تثبيت الأعداد العقدية', active: false, color: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20' },
              { title: 'بعد شهر', score: '17.0', status: 'إنهاء الدورة الأولى', active: false, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { title: 'قبل البكالوريا', score: '17.6', status: 'التفوق والهدف', active: false, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                  step.active
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{step.title}</div>
                <div className={`text-xl font-black ${step.color.split(' ')[0]}`}>{step.score}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{step.status}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            💡 <strong>تشخيص فهيم:</strong> بالالتزام بـ 45 دقيقة يومياً من التكرار المتباعد، يرتفع احتمال وصولك إلى <strong>17.6</strong> بـ <strong>+34%</strong> مقارنة بالنظام التقليدي.
          </p>
        </div>

        {/* Learning Energy Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                مؤشر الطاقة الذهنية (Learning Energy)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">موصى به بواسطة فهيم AI</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: 'optimal',
                label: '🟢 طاقة عالية (88%)',
                sub: 'وقت مناسب للدراسة العميقة',
                badge: 'مثالي للرياضيات',
                activeClass: 'bg-emerald-500 text-slate-950 font-extrabold border-emerald-400',
              },
              {
                id: 'light',
                label: '🟡 طاقة متوسطة (55%)',
                sub: 'مراجعة خفيفة وتكرار',
                badge: 'بطاقات المفاهيم',
                activeClass: 'bg-amber-500 text-slate-950 font-extrabold border-amber-400',
              },
              {
                id: 'rest',
                label: '🔴 طاقة منخفضة (20%)',
                sub: 'استرح 20 دقيقة',
                badge: 'تجديد النشاط',
                activeClass: 'bg-rose-500 text-white font-extrabold border-rose-400',
              },
            ].map((energy) => (
              <button
                key={energy.id}
                onClick={() => setLearningEnergy(energy.id as any)}
                className={`p-3 rounded-xl border text-right space-y-1 transition-all ${
                  learningEnergy === energy.id
                    ? energy.activeClass + ' shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{energy.label}</div>
                <div className="text-[10px] opacity-90">{energy.sub}</div>
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                {learningEnergy === 'optimal' && '🔥 توصية فهيم: ابدأ الآن بأعقد جزء في الرياضيات (الهندسة الفضائية)!'}
                {learningEnergy === 'light' && '📖 توصية فهيم: ركز على 15 دقيقة من مراجعة مفاهيم الفلسفة واللغة الإنجليزية.'}
                {learningEnergy === 'rest' && '☕ توصية فهيم: أوقف الشاشة لمدة 20 دقيقة، واستمتع باستراحة قصيرة!'}
              </span>
            </div>
            <button
              onClick={() => {
                if (learningEnergy === 'optimal') onNavigateTab('practice-exercises');
                else if (learningEnergy === 'light') onNavigateTab('spaced-repetition');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold shrink-0 hover:bg-emerald-500 transition-colors"
            >
              تطبيق التوصية
            </button>
          </div>
        </div>
      </div>

      {/* 2. Early Risk Indicator & 3. Smart Daily Plan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Early Risk Indicator (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                مؤشر الخطر المبكر
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold">
              🟡 متوسط
            </span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>تشخيص فهيم AI للتعثر المبكر:</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              "انخفاض المراجعة المتباعدة في مادة <strong>الفيزياء-الكيمياء</strong> منذ 8 أيام. يُنصح بإكمال جلسة مراجعة سريعة لدارة RC لمنع نسق النسيان حسب منحنى إبينغهاوس."
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('spaced-repetition')}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>معالجة الخطر (جلسة تكرار متباعد)</span>
          </button>
        </div>

        {/* Smart Daily Plan Prioritized List (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                خطة اليوم الذكية (مرتبة حسب الأولوية الوطنية)
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('daily-plan')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>عرض جدول الخطة الكامل</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 1, type: '1. مراجعة متأخرة', title: 'مراجعة ثنائي القطب RC وتثبيت المفاهيم', sub: 'الفيزياء-الكيمياء (20 دقيقة)', badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
              { id: 2, type: '2. واجب قريب', title: 'حل تمارين الأعداد العقدية والهندسة الفضائية', sub: 'الرياضيات (45 دقيقة)', badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
              { id: 3, type: '3. درس جديد', title: 'صياغة موآفر والشكل الأسّي للأعداد العقدية', sub: 'الرياضيات (30 دقيقة)', badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
              { id: 4, type: '4. تدريب بكالوريا', title: 'حل مسألة امتحان وطني سابق 2024 BAC SM', sub: 'الرياضيات (40 دقيقة)', badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
              { id: 5, type: '5. مراجعة سريعة', title: 'بطاقات المفاهيم الفلسفية: مفهوم الشخص', sub: 'الفلسفة (15 دقيقة)', badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
            ].map((planItem) => (
              <div
                key={planItem.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${planItem.badgeClass}`}>
                    {planItem.type}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{planItem.title}</h4>
                    <p className="text-[11px] text-slate-500">{planItem.sub}</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('daily-plan')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 transition-colors shrink-0"
                >
                  ابدأ
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature 3: مؤشر احتمال النسيان (Retention Risk) & Feature 4: محاكاة نتيجة البكالوريا (BAC Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Risk Curve per Subject */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                مؤشر احتمال النسيان (منحنى إبينغهاوس للتذكر)
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('spaced-repetition')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              تنشيط ذاكرة المواد
            </button>
          </div>

          <div className="space-y-3">
            {[
              { subject: 'الرياضيات', percent: 95, status: 'استقرار ممتاز', date: 'آخر مراجعة: منذ يومين', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
              { subject: 'الفيزياء-الكيمياء', percent: 63, status: 'ينصح بالتنشيط اليوم', date: 'آخر مراجعة: منذ 8 أيام', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
              { subject: 'الفلسفة', percent: 41, status: 'خطر نسيان مرتفع (أولوية)', date: 'آخر مراجعة: منذ 14 يوم', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
              { subject: 'علوم الحياة والأرض', percent: 82, status: 'استقرار جيد', date: 'آخر مراجعة: منذ 4 أيام', color: 'bg-teal-500', text: 'text-teal-600 dark:text-teal-400' },
            ].map((sub, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{sub.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">{sub.date}</span>
                    <span className={`font-extrabold ${sub.text}`}>{sub.percent}% تذكّر</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} rounded-full transition-all duration-500`} style={{ width: `${sub.percent}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{sub.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive BAC Score Simulator (What-If Tool) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                محاكاة نتيجة البكالوريا (BAC What-If Simulator)
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">المعدل المحاكى:</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                {simAverage} / 20
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setSimMath(18);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold hover:bg-amber-500/20 transition-colors"
            >
              💡 ماذا لو حصلت على 18 في الرياضيات؟
            </button>
            <button
              onClick={() => {
                setSimMath(19);
                setSimPhys(18);
                setSimSvt(17);
                setSimPhilo(16);
                setSimEng(17);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold hover:bg-emerald-500/20 transition-colors"
            >
              🚀 سيناريو التفوق المتميز (18.1)
            </button>
            <button
              onClick={() => {
                setSimMath(16.5);
                setSimPhys(15.0);
                setSimSvt(16.0);
                setSimPhilo(14.0);
                setSimEng(15.5);
              }}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          {/* Sliders Grid */}
          <div className="space-y-2.5 text-xs">
            {[
              { label: 'الرياضيات (معامل 9)', val: simMath, set: setSimMath },
              { label: 'الفيزياء-الكيمياء (معامل 7)', val: simPhys, set: setSimPhys },
              { label: 'علوم الحياة والأرض (معامل 5)', val: simSvt, set: setSimSvt },
              { label: 'الفلسفة (معامل 2)', val: simPhilo, set: setSimPhilo },
              { label: 'اللغة الإنجليزية (معامل 2)', val: simEng, set: setSimEng },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{item.val} / 20</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="20"
                  step="0.25"
                  value={item.val}
                  onChange={(e) => item.set(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              مقارنة مع الهدف ({summary.bacTargetScore}):
            </span>
            <span className={`font-black px-2 py-0.5 rounded-md ${
              simAverage >= summary.bacTargetScore
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              {simAverage >= summary.bacTargetScore
                ? `🎉 تتجاوز الهدف بـ +${(simAverage - summary.bacTargetScore).toFixed(2)} نقطة!`
                : `ينقصك ${(summary.bacTargetScore - simAverage).toFixed(2)} نقطة للوصول لهدفك`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent AI Recommendations + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): AI Personal Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                توصيات نظام فهيم المخصصة اليوم
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('knowledge-graph')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>عرض شجرة المهارات الكاملة</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        rec.priority === 'urgent'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {rec.reasonBadge}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {rec.subjectName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {rec.estimatedTimeMinutes} دقيقة
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      كتكسب +{(rec.expectedMasteryGain * 100).toFixed(0)}% استيعاب
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (rec.exerciseType === 'flashcards') onNavigateTab('spaced-repetition');
                    else onNavigateTab('practice-exercises');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-emerald-400 transition-colors shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>بدء النشاط الآن</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Homework & Upcoming Exams */}
        <div className="space-y-6">
          {/* Homework Deadlines Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  الواجبات المنزلية
                </h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                {summary.pendingHomeworkCount} معلقة
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">الرياضيات</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">متبقي يومان</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  تمارين الأعداد العقدية والهندسة الفضائية
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">الفلسفة</span>
                  <span className="text-slate-500 font-medium">متبقي 5 أيام</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  تحليل نص فلسفي حول مفهوم الشخص
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('homework')}
              className="w-full py-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline block"
            >
              انتقال إلى مركز الواجبات
            </button>
          </div>

          {/* Exam Countdown Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-lg space-y-4 border border-slate-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold">الامتحان الوطني الموحد للبكالوريا (2BAC)</h2>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
              <div className="text-xs text-slate-400 font-medium">العد التنازلي للامتحان الوطني</div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">128</div>
                  <div className="text-[10px] text-slate-400">يوم</div>
                </div>
                <div className="text-xl font-bold text-slate-600">:</div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">14</div>
                  <div className="text-[10px] text-slate-400">ساعة</div>
                </div>
                <div className="text-xl font-bold text-slate-600">:</div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">45</div>
                  <div className="text-[10px] text-slate-400">دقيقة</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('exam-prep')}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs hover:bg-amber-300 transition-colors shadow-md"
            >
              فتح مركز امتحانات البكالوريا
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
