/**
 * Qarayti.ai — Administration Platform Master Container Component
 * Super Admin Portal Orchestrator
 */

import React, { useState } from 'react';
import {
  Activity,
  Building2,
  Users,
  Brain,
  Server,
  ShieldAlert,
  Bell,
  CreditCard,
  DollarSign,
  LifeBuoy,
  Sliders,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { AdminPlatformProvider } from '../../context/AdminPlatformContext';
import { AdminGlobalDashboardView } from './AdminGlobalDashboardView';
import { AdminSchoolManagementView } from './AdminSchoolManagementView';
import { AdminUserManagementView } from './AdminUserManagementView';
import { AdminAIMonitoringView } from './AdminAIMonitoringView';
import { AdminPlatformMonitoringView } from './AdminPlatformMonitoringView';
import { AdminSecurityCenterView } from './AdminSecurityCenterView';
import { AdminNotificationsCenterView } from './AdminNotificationsCenterView';
import { AdminSubscriptionCenterView } from './AdminSubscriptionCenterView';
import { AdminBillingOverviewView } from './AdminBillingOverviewView';
import { AdminSupportCenterView } from './AdminSupportCenterView';
import { AdminGlobalSettingsView } from './AdminGlobalSettingsView';
import { AdminIntegrationFlowView } from './AdminIntegrationFlowView';
import { SystemValidationView } from './SystemValidationView';
import { Workflow, CheckCircle2 } from 'lucide-react';

export type AdminPlatformSubTab =
  | 'dashboard'
  | 'validation'
  | 'integration'
  | 'schools'
  | 'users'
  | 'ai-monitoring'
  | 'platform-monitoring'
  | 'security'
  | 'notifications'
  | 'subscriptions'
  | 'billing'
  | 'support'
  | 'settings';

export const AdminPlatformContent: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AdminPlatformSubTab>('dashboard');

  const subNavItems: Array<{ id: AdminPlatformSubTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'لوحة التحكم الشاملة', icon: Activity },
    { id: 'validation', label: 'التحقق من صحة النظام E2E', icon: CheckCircle2 },
    { id: 'integration', label: 'محرك التكامل والربط', icon: Workflow },
    { id: 'schools', label: 'المؤسسات التعليمية', icon: Building2 },
    { id: 'users', label: 'المستخدمين والحسابات', icon: Users },
    { id: 'ai-monitoring', label: 'مراقبة الذكاء الاصطناعي', icon: Brain },
    { id: 'platform-monitoring', label: 'مراقبة البنية التحتية', icon: Server },
    { id: 'security', label: 'الأمان والأذونات RBAC', icon: ShieldAlert },
    { id: 'notifications', label: 'مركز الإشعارات', icon: Bell },
    { id: 'subscriptions', label: 'الاشتراكات والتراخيص', icon: CreditCard },
    { id: 'billing', label: 'الفواتير والمالية', icon: DollarSign },
    { id: 'support', label: 'الدعم الفني التقني', icon: LifeBuoy },
    { id: 'settings', label: 'الإعدادات العامة', icon: Sliders },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Sub Header & Module Navigation */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  منصة الإدارة العليا (Super Admin)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  لوحة التحكم السيادية الوطنية
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                القيادة المركزية لمنظومة Qarayti.ai — السحابة السيادية للتربية الوطنية بالمملكة المغربية
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Nav Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`px-3 py-2 rounded-xl font-bold shrink-0 flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Content Renderer */}
      <div className="transition-all duration-300">
        {activeSubTab === 'dashboard' && <AdminGlobalDashboardView />}
        {activeSubTab === 'validation' && <SystemValidationView />}
        {activeSubTab === 'integration' && <AdminIntegrationFlowView />}
        {activeSubTab === 'schools' && <AdminSchoolManagementView />}
        {activeSubTab === 'users' && <AdminUserManagementView />}
        {activeSubTab === 'ai-monitoring' && <AdminAIMonitoringView />}
        {activeSubTab === 'platform-monitoring' && <AdminPlatformMonitoringView />}
        {activeSubTab === 'security' && <AdminSecurityCenterView />}
        {activeSubTab === 'notifications' && <AdminNotificationsCenterView />}
        {activeSubTab === 'subscriptions' && <AdminSubscriptionCenterView />}
        {activeSubTab === 'billing' && <AdminBillingOverviewView />}
        {activeSubTab === 'support' && <AdminSupportCenterView />}
        {activeSubTab === 'settings' && <AdminGlobalSettingsView />}
      </div>
    </div>
  );
};

export const AdminPlatformContainer: React.FC = () => {
  return (
    <AdminPlatformProvider>
      <AdminPlatformContent />
    </AdminPlatformProvider>
  );
};
