/**
 * Qarayti.ai — Teacher Portal Master Container
 * Unifies and orchestrates all 10 Teacher Portal modules using TeacherPortalProvider.
 */

import React, { useState } from 'react';
import { TeacherPortalProvider } from '../../context/TeacherPortalContext';
import { TeacherDashboardView } from './TeacherDashboardView';
import { ClassManagementView } from './ClassManagementView';
import { AssignmentsView } from './AssignmentsView';
import { GradesView } from './GradesView';
import { AttendanceView } from './AttendanceView';
import { QuestionBankView } from './QuestionBankView';
import { LessonPlanningView } from './LessonPlanningView';
import { StudentAnalyticsView } from './StudentAnalyticsView';
import { MessagingView } from './MessagingView';
import { ClassReportsView } from './ClassReportsView';

import {
  LayoutDashboard,
  School,
  FileText,
  Award,
  CheckSquare,
  Database,
  BookOpen,
  TrendingUp,
  MessageSquare,
  BarChart,
  Sparkles,
} from 'lucide-react';

export const TeacherPortalContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم الأستاذ', icon: LayoutDashboard },
    { id: 'classes', label: 'الأقسام والتلاميذ', icon: School },
    { id: 'assignments', label: 'الواجبات والتطبيقات', icon: FileText },
    { id: 'grades', label: 'النقاط والتقويم', icon: Award },
    { id: 'attendance', label: 'سجل الحضور والغياب', icon: CheckSquare },
    { id: 'questions', label: 'بنك تمارين البكالوريا', icon: Database },
    { id: 'lessons', label: 'دفتر النصوص وتخطيط الدروس', icon: BookOpen },
    { id: 'analytics', label: 'تحليلات التعلم التكيفي', icon: TrendingUp },
    { id: 'messages', label: 'الرسائل والتواصل', icon: MessageSquare },
    { id: 'reports', label: 'التقارير ومجالس الأقسام', icon: BarChart },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Teacher Portal Module Sub-Navigation Bar */}
      <div className="bg-[#161920] border border-[#2D333D] p-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#0F1115] shadow-md'
                    : 'text-[#8E9299] hover:text-[#EAE9E6] hover:bg-[#0F1115]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'dashboard' && <TeacherDashboardView onNavigate={(tab) => setActiveTab(tab)} />}
      {activeTab === 'classes' && <ClassManagementView />}
      {activeTab === 'assignments' && <AssignmentsView />}
      {activeTab === 'grades' && <GradesView />}
      {activeTab === 'attendance' && <AttendanceView />}
      {activeTab === 'questions' && <QuestionBankView />}
      {activeTab === 'lessons' && <LessonPlanningView />}
      {activeTab === 'analytics' && <StudentAnalyticsView />}
      {activeTab === 'messages' && <MessagingView />}
      {activeTab === 'reports' && <ClassReportsView />}
    </div>
  );
};

export const TeacherPortalContainer: React.FC = () => {
  return (
    <TeacherPortalProvider>
      <TeacherPortalContent />
    </TeacherPortalProvider>
  );
};
