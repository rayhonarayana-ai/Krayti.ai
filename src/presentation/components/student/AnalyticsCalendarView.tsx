/**
 * Qarayti.ai — Analytics & Calendar View
 * Learning Analytics, Retention Decay, Exam Calendar & Settings
 */

import React from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar as CalendarIcon,
  Bell,
  Settings,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LearningAnalytics, StudentNotification } from '../../../domain/types/studentPortal.types';

interface AnalyticsCalendarViewProps {
  analytics: LearningAnalytics;
  notifications: StudentNotification[];
}

export const AnalyticsCalendarView: React.FC<AnalyticsCalendarViewProps> = ({
  analytics,
  notifications,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>تحليلات التعلم المتقدمة بـ Qarayti AI</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          إحصائيات التعلم والإشعارات (Learning Analytics & Calendar)
        </h1>
        <p className="text-xs text-slate-500">
          تتبع سرعة اكتساب المهارات، منحنى الاستبقاء الذكري، الإشعارات والتنبيهات المدرسية.
        </p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">سرعة المكتسبات (Velocity)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics.velocity} <span className="text-xs font-normal text-slate-500">دروس / أسبوع</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">نسبة التذكر الذكري (Retention)</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {analytics.retentionRate}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">المفاهيم المستوعبة بنجاح</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {analytics.masteredNodesCount} <span className="text-xs font-normal text-slate-500">/ {analytics.totalNodesCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">المعدل المتوقع للبكالوريا</div>
          <div className="text-2xl font-black text-amber-500">
            {analytics.forecastBacScore} <span className="text-xs font-normal text-slate-500">/ 20</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Decay Curve Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            <span>منحنى انخفاض التذكر (Ebbinghaus Decay Curve)</span>
          </h2>

          <div className="space-y-3">
            {analytics.retentionDecayCurve.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    قبل {item.daysAgo} أيام
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {item.retentionRate}% تذكر
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${item.retentionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Center */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>الإشعارات والتنبيهات المدرسية</span>
          </h2>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
