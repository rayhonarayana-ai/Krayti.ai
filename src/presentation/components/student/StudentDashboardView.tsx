/**
 * Qarayti.ai — Student Dashboard View
 * Primary Overview Module for Student Portal
 */

import React from 'react';
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
