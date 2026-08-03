/**
 * Qarayti.ai — Daily Learning Dashboard View
 * Today Learning Plan, Adaptive Timeline & Study Time Tracker
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Zap,
  BookOpen,
  Filter,
  Plus,
  Sparkles,
  Award,
} from 'lucide-react';
import { DailyPlanItem } from '../../../domain/types/adaptive.types';

interface DailyLearningDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
}

export const DailyLearningDashboardView: React.FC<DailyLearningDashboardViewProps> = ({
  onNavigateTab,
}) => {
  const [items, setItems] = useState<DailyPlanItem[]>([
    {
      id: 'dpi-1',
      nodeId: 'MATH-06',
      taskTitle: 'مراجعة درس الأعداد العقدية: الشكل المثلثي صياغة موآفر',
      subjectName: 'Mathématiques',
      durationMinutes: 30,
      completed: true,
      priorityScore: 95,
      exerciseType: 'concept_review',
      scheduledTime: '08:30 AM',
    },
    {
      id: 'dpi-2',
      nodeId: 'MATH-06',
      taskTitle: 'تطبيق عملي: حل 3 تمارين امتحانات وطنية سابقة (2BAC)',
      subjectName: 'Mathématiques',
      durationMinutes: 45,
      completed: false,
      priorityScore: 90,
      exerciseType: 'problem_solving',
      scheduledTime: '10:00 AM',
    },
    {
      id: 'dpi-3',
      nodeId: 'PHYS-03',
      taskTitle: 'مراجعة بطاقات الذاكرة: ثنائي القطب RC وثابتة الزمن',
      subjectName: 'Physique-Chimie',
      durationMinutes: 20,
      completed: false,
      priorityScore: 82,
      exerciseType: 'flashcards',
      scheduledTime: '02:00 PM',
    },
    {
      id: 'dpi-4',
      nodeId: 'PHIL-01',
      taskTitle: 'قراءة وفهم موقف كانط وهيجل حول مفهوم الشخص',
      subjectName: 'Philosophie',
      durationMinutes: 25,
      completed: false,
      priorityScore: 70,
      exerciseType: 'concept_review',
      scheduledTime: '04:30 PM',
    },
  ]);

  const toggleTask = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const totalMinutes = items.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const completedMinutes = items
    .filter((i) => i.completed)
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CalendarIcon className="w-4 h-4" />
            <span>خطة اليوم المتكيفة - الاثنين 3 غشت 2026</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            برنامج المذاكرة اليومي الذكي (Today Learning Plan)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تم إنشاؤه تلقائياً بواسطة خوارزمية التعلم المتكيف بـ Qarayti بناءً على أهداف البكالوريا والتعثرات المرصودة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="text-[10px] text-slate-500 font-medium">نسبة إنجاز اليوم</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {completedMinutes} / {totalMinutes} دقيقة ({Math.round((completedMinutes / totalMinutes) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline & Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Timeline Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>مهام الخطة اليومية</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">
              مكتمل: {completedCount} من {items.length}
            </span>
          </div>

          <div className="relative border-r-2 border-emerald-500/20 pr-6 mr-3 space-y-6">
            {items.map((item, idx) => (
              <div key={item.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  onClick={() => toggleTask(item.id)}
                  className={`absolute -right-[31px] top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    item.completed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/30 opacity-80'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {item.scheduledTime}
                        </span>
                        <span className="font-semibold text-slate-500">{item.subjectName}</span>
                        <span className="text-slate-400">• {item.durationMinutes} دقيقة</span>
                      </div>
                      <h3
                        className={`text-base font-bold ${
                          item.completed
                            ? 'line-through text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.taskTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {!item.completed && (
                        <button
                          onClick={() => {
                            if (item.exerciseType === 'flashcards') onNavigateTab('spaced-repetition');
                            else if (item.exerciseType === 'problem_solving') onNavigateTab('practice-exercises');
                            else onNavigateTab('learning-journey');
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>ابدأ المهمة</span>
                        </button>
                      )}
                      <button
                        onClick={() => toggleTask(item.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                          item.completed
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                            : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.completed ? 'إلغاء الإنجاز' : 'تحديد كمكتمل'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Today Stats & AI Adaptive Note */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>ملاحظة خوارزمية التكيف اليومية</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              تم تخصيص 45 دقيقة للرياضيات و20 دقيقة للفيزياء اليوم للتركيز على استكمال مكتسبات
              <strong> الأعداد العقدية</strong> و<strong>دارة RC</strong> قبل إجراء الفرض المحروس القادم.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>مكافأة إكمال الخطة اليومية</span>
              </div>
              <div>إكمال الخطة يمنحك +150 XP ويرفع السلسلة إلى 15 يوماً متتالياً!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
