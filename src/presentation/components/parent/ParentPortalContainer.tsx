/**
 * Qarayti.ai — Parent Portal Unified Container Shell
 * Wraps and exposes all 10 Parent Portal sub-modules:
 * 1. Parent Dashboard
 * 2. Children Management
 * 3. Progress Reports
 * 4. Attendance
 * 5. Grades
 * 6. Homework
 * 7. Notifications
 * 8. Teacher Messaging
 * 9. Weekly AI Report
 * 10. Payments
 */

import React, { useState } from 'react';
import { ParentPortalProvider, useParentPortal } from '../../context/ParentPortalContext';
import { ParentDashboardView } from './ParentDashboardView';
import { ChildrenManagementView } from './ChildrenManagementView';
import { ProgressReportsView } from './ProgressReportsView';
import { AttendanceView } from './AttendanceView';
import { GradesView } from './GradesView';
import { HomeworkView } from './HomeworkView';
import { NotificationsView } from './NotificationsView';
import { TeacherMessagingView } from './TeacherMessagingView';
import { WeeklyAIReportView } from './WeeklyAIReportView';
import { PaymentsView } from './PaymentsView';

import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Bell,
  MessageSquare,
  BrainCircuit,
  CreditCard,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const InnerParentPortalContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const { children, activeChildId, setActiveChildId, activeChild } = useParentPortal();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'children', label: 'Enfants & Massar', icon: Users },
    { id: 'progress', label: 'Bilan Progression', icon: TrendingUp },
    { id: 'attendance', label: 'Présence & Retards', icon: Clock },
    { id: 'grades', label: 'Notes & Contrôles', icon: Award },
    { id: 'homework', label: 'Devoirs & Travaux', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messaging', label: 'Messagerie Profs', icon: MessageSquare },
    { id: 'weekly-ai', label: 'Rapport Hebdo IA', icon: BrainCircuit },
    { id: 'payments', label: 'Scolarité & Paiements', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Switcher for Active Child & Sub-Module Bar */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-[#0F1115]">
            <img src={activeChild.avatarUrl} alt={activeChild.fullName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-[#EAE9E6]">{activeChild.fullName}</span>
              <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30">
                Massar: {activeChild.massarCode}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#8E9299]">
              {activeChild.gradeLevel} • {activeChild.schoolName}
            </p>
          </div>
        </div>

        {/* Quick Child Select Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-[#8E9299] uppercase hidden sm:inline">Changer d'Enfant:</span>
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                child.id === activeChildId
                  ? 'bg-[#D4AF37] text-[#0F1115] font-bold border-[#D4AF37]'
                  : 'bg-[#0F1115] text-[#8E9299] border-[#2D333D] hover:text-[#EAE9E6]'
              }`}
            >
              {child.firstName}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Module Navigation Ribbon */}
      <div className="bg-[#161920] border border-[#2D333D] p-2 flex items-center space-x-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono whitespace-nowrap uppercase tracking-wider border transition-all ${
                isActive
                  ? 'bg-[#D4AF37] text-[#0F1115] font-bold border-[#D4AF37]'
                  : 'bg-transparent text-[#8E9299] border-transparent hover:text-[#EAE9E6] hover:bg-[#0F1115]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Module View Rendering */}
      <div>
        {activeModule === 'dashboard' && <ParentDashboardView />}
        {activeModule === 'children' && <ChildrenManagementView />}
        {activeModule === 'progress' && <ProgressReportsView />}
        {activeModule === 'attendance' && <AttendanceView />}
        {activeModule === 'grades' && <GradesView />}
        {activeModule === 'homework' && <HomeworkView />}
        {activeModule === 'notifications' && <NotificationsView />}
        {activeModule === 'messaging' && <TeacherMessagingView />}
        {activeModule === 'weekly-ai' && <WeeklyAIReportView />}
        {activeModule === 'payments' && <PaymentsView />}
      </div>
    </div>
  );
};

export const ParentPortalContainer: React.FC = () => {
  return (
    <ParentPortalProvider>
      <InnerParentPortalContent />
    </ParentPortalProvider>
  );
};
