/**
 * Qarayti.ai — Production Foundation Shell Header
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Terminal, Layers, BrainCircuit, Users, Bot, GraduationCap, School, Building2, FileText, BookOpen, Zap, LogIn, UserCheck } from 'lucide-react';
import { authService } from '../../core/auth/auth.service';
import { AuthSession } from '../../domain/types/auth.types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isReady: boolean;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isReady, onOpenLogin }) => {
  const [session, setSession] = useState<AuthSession | null>(authService.getCurrentSession());

  useEffect(() => {
    const unsubscribe = authService.subscribe((newSession) => {
      setSession(newSession);
    });
    return () => unsubscribe();
  }, []);

  const tabs = [
    { id: 'super-admin', label: 'منصة الإدارة العليا', icon: ShieldCheck },
    { id: 'assessment', label: 'محرك التقويم', icon: FileText },
    { id: 'cms', label: 'إدارة المحتوى التعليمي', icon: BookOpen },
    { id: 'knowledge-intel', label: 'ذكاء المعرفة', icon: BrainCircuit },
    { id: 'student', label: 'فضاء التلميذ', icon: GraduationCap },
    { id: 'school-manager', label: 'إدارة المؤسسة (School OS)', icon: Building2 },
    { id: 'teacher', label: 'فضاء الأستاذ', icon: School },
    { id: 'faheem', label: 'محرك فهيم الذكي (Faheem AI)', icon: Bot },
    { id: 'parent', label: 'فضاء الوالدين', icon: Users },
    { id: 'adaptive', label: 'التعليم التكيفي', icon: Zap },
    { id: 'startup', label: 'تشخيص وسلامة النظام', icon: ShieldCheck },
    { id: 'di', label: 'حاوية DI', icon: Cpu },
    { id: 'rbac', label: 'محرك الصلاحيات RBAC', icon: Layers },
    { id: 'education', label: 'معايير الوزارة MEN', icon: Layers },
    { id: 'logs', label: 'سجل التشغيل Logs', icon: Terminal },
  ];

  return (
    <header className="bg-[#0F1115] border-b border-[#2D333D] text-[#EAE9E6] pt-8 pb-4" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-[#2D333D]">
          <div className="flex flex-col">
            <span className="text-[#D4AF37] font-mono text-xs tracking-[0.2em] mb-2 uppercase">
              المنظومة الرقمية السيادية • Qarayti.ai
            </span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight text-[#EAE9E6]">
                قرأتي.أي
              </h1>
              <span className="text-[#D4AF37] font-mono text-sm dir-ltr">
                Qarayti.ai
              </span>
            </div>
            <p className="text-xs font-sans text-[#8E9299] mt-2 tracking-wide">
              المنظومة التعليمية الذكية الأولى للمملكة المغربية • مسلك البكالوريا والتوجيه
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-3">
            <div className="flex items-center gap-3">
              {/* Login / Auth Button */}
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#0F1115] text-xs font-bold rounded transition-colors flex items-center gap-2 shadow-md"
              >
                {session ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>حسابي: {session.user.fullName.split(' ')[0]} ({session.user.role})</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>تسجيل الدخول / الحساب</span>
                  </>
                )}
              </button>

              <div className="text-xs font-mono text-[#D4AF37] border border-[#D4AF37]/60 px-3 py-1 bg-[#D4AF37]/5 inline-flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                ></span>
                <span className="uppercase tracking-wider">
                  {isReady ? 'الأنظمة جاهزة للعمل' : 'جاري تشغيل الأنظمة...'}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#8E9299]">
              البنية المفهومية والذكاء الاصطناعي السيادي
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide transition-all whitespace-nowrap border-t-2 ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#161920] text-[#D4AF37]'
                    : 'border-transparent text-[#8E9299] hover:text-[#EAE9E6] hover:bg-[#161920]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#8E9299]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
