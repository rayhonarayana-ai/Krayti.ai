/**
 * Qarayti.ai — School Manager Portal Master Container (School OS)
 * Orchestrates all 11 sub-modules for Moroccan School Operating System.
 */

import React, { useState } from 'react';
import { SchoolManagerProvider } from '../../context/SchoolManagerContext';
import { SchoolDashboardView } from './SchoolDashboardView';
import { TeachersManagementView } from './TeachersManagementView';
import { StudentsManagementView } from './StudentsManagementView';
import { FinanceManagementView } from './FinanceManagementView';
import { AnalyticsSchoolView } from './AnalyticsSchoolView';
import { TimetableManagementView } from './TimetableManagementView';
import { ExamsManagementView } from './ExamsManagementView';
import { HRManagementView } from './HRManagementView';
import { DocumentsManagementView } from './DocumentsManagementView';
import { AnnouncementsManagementView } from './AnnouncementsManagementView';
import { PermissionsManagementView } from './PermissionsManagementView';

import {
  Building2,
  Users,
  GraduationCap,
  DollarSign,
  BarChart2,
  Clock,
  FileText,
  Briefcase,
  FolderDown,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';

export const SchoolManagerContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'الإدارة العامة للمؤسسة', icon: Building2 },
    { id: 'teachers', label: 'الأساتذة والأطر التربوية', icon: Users },
    { id: 'students', label: 'سجل التلاميذ ومسار Massar', icon: GraduationCap },
    { id: 'finance', label: 'المعدات والمالية', icon: DollarSign },
    { id: 'analytics', label: 'تحليلات البكالوريا والنتائج', icon: BarChart2 },
    { id: 'timetable', label: 'جداول الحصص الزمنية', icon: Clock },
    { id: 'exams', label: 'الامتحانات والبكالوريا التجريبية', icon: FileText },
    { id: 'hr', label: 'الموارد البشرية والشواهد', icon: Briefcase },
    { id: 'documents', label: 'وثائق الوزارة MEN', icon: FolderDown },
    { id: 'announcements', label: 'البلاغات والإعلانات', icon: Megaphone },
    { id: 'permissions', label: 'الحكامة والصلاحيات', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* School Manager Sub-Navigation Bar */}
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
      {activeTab === 'dashboard' && <SchoolDashboardView onNavigate={(tab) => setActiveTab(tab)} />}
      {activeTab === 'teachers' && <TeachersManagementView />}
      {activeTab === 'students' && <StudentsManagementView />}
      {activeTab === 'finance' && <FinanceManagementView />}
      {activeTab === 'analytics' && <AnalyticsSchoolView />}
      {activeTab === 'timetable' && <TimetableManagementView />}
      {activeTab === 'exams' && <ExamsManagementView />}
      {activeTab === 'hr' && <HRManagementView />}
      {activeTab === 'documents' && <DocumentsManagementView />}
      {activeTab === 'announcements' && <AnnouncementsManagementView />}
      {activeTab === 'permissions' && <PermissionsManagementView />}
    </div>
  );
};

export const SchoolManagerContainer: React.FC = () => {
  return (
    <SchoolManagerProvider>
      <SchoolManagerContent />
    </SchoolManagerProvider>
  );
};
