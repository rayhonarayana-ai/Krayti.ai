/**
 * Qarayti.ai — Production Foundation (Sprint 1)
 * Clean Architecture & Infrastructure Diagnostic Dashboard
 */

import React, { useEffect, useState } from 'react';
import { startupSequence, StartupReport } from './core/startup/startup.sequence';
import { Header } from './presentation/components/Header';
import { LoginModal } from './presentation/components/LoginModal';
import { StartupStatusCard } from './presentation/components/StartupStatusCard';
import { DIContainerInspector } from './presentation/components/DIContainerInspector';
import { RBACInspector } from './presentation/components/RBACInspector';
import { EducationConstantsInspector } from './presentation/components/EducationConstantsInspector';
import { LiveLogConsole } from './presentation/components/LiveLogConsole';
import { AdaptiveEngineContainer } from './presentation/components/adaptive/AdaptiveEngineContainer';
import { ParentPortalContainer } from './presentation/components/parent/ParentPortalContainer';
import { FaheemEngineContainer } from './presentation/components/faheem/FaheemEngineContainer';
import { StudentPortalContainer } from './presentation/components/student/StudentPortalContainer';
import { TeacherPortalContainer } from './presentation/components/teacher/TeacherPortalContainer';
import { SchoolManagerContainer } from './presentation/components/schoolManager/SchoolManagerContainer';
import { AdminPlatformContainer } from './presentation/components/admin/AdminPlatformContainer';
import { AssessmentEngineView } from './presentation/components/assessment/AssessmentEngineView';
import { CMSManagerView } from './presentation/components/cms/CMSManagerView';
import { KnowledgeIntelligenceView } from './presentation/components/cms/KnowledgeIntelligenceView';
import { AdaptiveIntelligenceView } from './presentation/components/adaptive/AdaptiveIntelligenceView';
import { ShieldAlert, CheckCircle, Code } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('super-admin');
  const [startupReport, setStartupReport] = useState<StartupReport | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const runBootSequence = async () => {
    setIsBootstrapping(true);
    const report = await startupSequence.run();
    setStartupReport(report);
    setIsBootstrapping(false);
  };

  useEffect(() => {
    runBootSequence();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#EAE9E6] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0F1115]">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isReady={startupSequence.isReady()}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        {isBootstrapping ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-2 border-[#2D333D] border-t-[#D4AF37] animate-spin"></div>
            <p className="text-xs font-mono text-[#8E9299]">
              جاري تهيئة البنية التحتية ومحرك التعلم التكيفي لـ Qarayti.ai...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'super-admin' && <AdminPlatformContainer />}

            {activeTab === 'assessment' && <AssessmentEngineView />}

            {activeTab === 'cms' && <CMSManagerView />}

            {activeTab === 'knowledge-intel' && <KnowledgeIntelligenceView />}

            {activeTab === 'student' && <StudentPortalContainer />}

            {activeTab === 'school-manager' && <SchoolManagerContainer />}

            {activeTab === 'teacher' && <TeacherPortalContainer />}

            {activeTab === 'faheem' && <FaheemEngineContainer />}

            {activeTab === 'parent' && <ParentPortalContainer />}

            {activeTab === 'adaptive' && <AdaptiveIntelligenceView />}

            {activeTab === 'startup' && (
              <StartupStatusCard report={startupReport} onReboot={runBootSequence} />
            )}

            {activeTab === 'di' && <DIContainerInspector />}

            {activeTab === 'rbac' && <RBACInspector />}

            {activeTab === 'education' && <EducationConstantsInspector />}

            {activeTab === 'logs' && <LiveLogConsole />}
          </>
        )}
      </main>

      {/* Foundation Status Footer */}
      <footer className="border-t border-[#2D333D] bg-[#0F1115] py-8 text-xs text-[#8E9299]" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-serif text-sm text-[#EAE9E6]">منصة قرأتي.أي السيادية جاهزة ومكتملة</span>
            <span className="font-mono text-xs text-[#8E9299]">— Qarayti.ai Morocco Edition</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-[#8E9299] uppercase">
            <span>الحزمة الوطنية المغربية (MA)</span>
            <span>•</span>
            <span>الهندسة النظيفة Clean Architecture</span>
            <span>•</span>
            <span>TypeScript Strict</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
