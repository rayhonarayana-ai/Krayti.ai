/**
 * Qarayti.ai — Student Portal Main Container
 * Shell component hosting all Student Portal modules
 */

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  BookOpen,
  Zap,
  FileText,
  GraduationCap,
  Brain,
  RotateCw,
  Trophy,
  User,
  BarChart2,
  Flame,
  Award,
  Loader2,
  RefreshCw,
  Building,
} from 'lucide-react';
import { container } from '../../../core/di/container';
import { authService } from '../../../core/auth/auth.service';
import { StudentPortalService } from '../../../domain/services/studentPortal.service';
import { UserProfile, SchoolMembershipState } from '../../../domain/types/auth.types';
import {
  StudentDashboardSummary,
  StudentLesson,
  StudentExercise,
  HomeworkAssignment,
  ExamPreparationItem,
  StudentAchievement,
  LeaderboardUser,
  StudentAttendanceRecord,
  StudentGradeRecord,
  StudentNotification,
} from '../../../domain/types/studentPortal.types';
import {
  SkillTreeNode,
  WeaknessDiagnostic,
  Recommendation,
  SpacedRepetitionCard,
  LearningAnalytics,
} from '../../../domain/types/adaptive.types';

import { StudentDashboardView } from './StudentDashboardView';
import { DailyLearningDashboardView } from './DailyLearningDashboardView';
import { AiTutorView } from './AiTutorView';
import { LearningJourneyView } from './LearningJourneyView';
import { PracticeExercisesView } from './PracticeExercisesView';
import { HomeworkCenterView } from './HomeworkCenterView';
import { ExamPrepCenterView } from './ExamPrepCenterView';
import { KnowledgeGraphView } from './KnowledgeGraphView';
import { SpacedRepetitionView } from './SpacedRepetitionView';
import { GamificationCenterView } from './GamificationCenterView';
import { StudentProfileView } from './StudentProfileView';
import { AnalyticsCalendarView } from './AnalyticsCalendarView';

export const StudentPortalContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [schoolContext, setSchoolContext] = useState<SchoolMembershipState | null>(null);

  // Loaded State
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [exercises, setExercises] = useState<StudentExercise[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkAssignment[]>([]);
  const [exams, setExams] = useState<ExamPreparationItem[]>([]);
  const [skills, setSkills] = useState<SkillTreeNode[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessDiagnostic[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [flashcards, setFlashcards] = useState<SpacedRepetitionCard[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [grades, setGrades] = useState<StudentGradeRecord[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);

  const studentId = currentUser?.id || '';

  // Auth + School context listener
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    const unsub = authService.subscribe((session) => {
      setCurrentUser(session?.user ?? null);
    });
    return unsub;
  }, []);

  // Gate 06D.3: Resolve school context after auth
  useEffect(() => {
    if (!currentUser) {
      setSchoolContext(null);
      return;
    }
    let cancelled = false;
    authService.resolveSchoolContext().then((ctx) => {
      if (!cancelled) setSchoolContext(ctx);
    });
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  // Gate 06D.3: Clear institutional state on auth transition
  useEffect(() => {
    setSummary(null);
    setLessons([]);
    setExercises([]);
    setHomeworkList([]);
    setExams([]);
    setSkills([]);
    setWeaknesses([]);
    setRecommendations([]);
    setFlashcards([]);
    setAchievements([]);
    setLeaderboard([]);
    setAttendance([]);
    setGrades([]);
    setNotifications([]);
    setAnalytics(null);
    setIsLoading(true);
  }, [currentUser?.id]);

  // Gate 06D.3: Clear institutional state on school context change
  useEffect(() => {
    if (!schoolContext || schoolContext.status !== 'RESOLVED') {
      setSummary(null);
      setLessons([]);
      setExercises([]);
      setHomeworkList([]);
      setExams([]);
      setSkills([]);
      setWeaknesses([]);
      setRecommendations([]);
      setFlashcards([]);
      setAchievements([]);
      setLeaderboard([]);
      setAttendance([]);
      setGrades([]);
      setNotifications([]);
      setAnalytics(null);
    }
  }, [schoolContext?.status]);

  // Gate 06D.3: resolved schoolId for institutional data loading
  const resolvedSchoolId = schoolContext?.status === 'RESOLVED' ? schoolContext.schoolId : undefined;

  const loadData = async () => {
    if (!studentId || !resolvedSchoolId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const service = container.resolve<StudentPortalService>('StudentPortalService');
      const [
        dashData,
        lessonsData,
        exercisesData,
        hwData,
        examData,
        skillData,
        weakData,
        recData,
        cardData,
        achData,
        leadData,
        attData,
        grdData,
        anaData,
      ] = await Promise.all([
        service.getDashboard(studentId),
        service.getLessons(studentId),
        service.getExercises(),
        service.getHomework(studentId),
        service.getExamPrepItems(),
        service.getSkillTree(),
        service.getWeaknessDiagnostics(studentId),
        service.getRecommendations(studentId),
        service.getFlashcards(studentId),
        service.getAchievements(studentId),
        service.getLeaderboard(),
        service.getAttendance(studentId),
        service.getGrades(studentId),
        service.getAnalytics(studentId),
      ]);

      // Gate 06D.3: Override identity fields with trusted auth data
      if (currentUser) {
        dashData.summary.studentId = currentUser.id;
        // Gate 06D.3: display name is SELF_ASSERTED_PROFILE_DISPLAY_DATA
        dashData.summary.name = currentUser.fullName || currentUser.email || 'تلميذ Qarayti';
        dashData.summary.level = currentUser.educationLevel || undefined;
        dashData.summary.track = currentUser.track || undefined;
      }
      // Gate 06D.3: Override school context from trusted membership resolution
      dashData.summary.schoolId = resolvedSchoolId;

      setSummary(dashData.summary);
      setNotifications(dashData.notifications);
      setRecommendations(recData);
      setLessons(lessonsData);
      setExercises(exercisesData);
      setHomeworkList(hwData);
      setExams(examData);
      setSkills(skillData);
      setWeaknesses(weakData);
      setFlashcards(cardData);
      setAchievements(achData);
      setLeaderboard(leadData);
      setAttendance(attData);
      setGrades(grdData);
      setAnalytics(anaData);
    } catch (err) {
      console.error('Failed to load Student Portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id, resolvedSchoolId]);

  // Gate 06D.3: Auth state handling
  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <User className="w-8 h-8 text-slate-400" />
        <span className="text-sm font-semibold">يرجى تسجيل الدخول للوصول إلى البوابة الخاصة بالتلميذ.</span>
      </div>
    );
  }

  if (schoolContext?.status === 'NONE') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Building className="w-8 h-8 text-slate-400" />
        <span className="text-sm font-semibold">لا يوجد انتماء مدرسي مرتبط بحسابك.</span>
        <span className="text-xs text-slate-400">يرجى التواصل مع إدارة المدرسة لربط حسابك.</span>
      </div>
    );
  }

  if (schoolContext?.status === 'AMBIGUOUS') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Building className="w-8 h-8 text-slate-400" />
        <span className="text-sm font-semibold">تم العثور على أكثر من انتماء مدرسي.</span>
        <span className="text-xs text-slate-400">يرجى اختيار المدرسة الصحيحة من إعدادات الحساب.</span>
      </div>
    );
  }

  const navTabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'daily-plan', label: 'خطة اليوم', icon: Calendar },
    { id: 'ai-tutor', label: 'فهيم AI', icon: Sparkles },
    { id: 'learning-journey', label: 'الدروس والمقرر', icon: BookOpen },
    { id: 'practice-exercises', label: 'التمارين والتطبيقات', icon: Zap },
    { id: 'homework', label: 'الواجبات المنزلية', icon: FileText },
    { id: 'exam-prep', label: 'امتحانات البكالوريا', icon: GraduationCap },
    { id: 'knowledge-graph', label: 'شجرة المهارات', icon: Brain },
    { id: 'spaced-repetition', label: 'بطاقات التكرار', icon: RotateCw },
    { id: 'gamification', label: 'الإنجازات والترتيب', icon: Trophy },
    { id: 'profile', label: 'الملف والنتائج', icon: User },
    { id: 'analytics', label: 'الإحصائيات', icon: BarChart2 },
  ];

  if (isLoading || !summary || !analytics) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold">جاري تحميل البوابة الخاصة بالتلميذ Qarayti...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar for Student Portal Modules */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm sticky top-0 z-30 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Tab Renderer */}
      <main className="transition-all duration-200">
        {activeTab === 'dashboard' && (
          <StudentDashboardView
            summary={summary}
            recommendations={recommendations}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'daily-plan' && (
          <DailyLearningDashboardView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'ai-tutor' && <AiTutorView />}

        {activeTab === 'learning-journey' && <LearningJourneyView lessons={lessons} />}

        {activeTab === 'practice-exercises' && <PracticeExercisesView exercises={exercises} />}

        {activeTab === 'homework' && (
          <HomeworkCenterView
            homeworkList={homeworkList}
            onSubmitHomework={async (hwId, text) => {
              const service = container.resolve<StudentPortalService>('StudentPortalService');
              await service.submitHomework(hwId, text);
            }}
          />
        )}

        {activeTab === 'exam-prep' && (
          <ExamPrepCenterView
            exams={exams}
            onAnalyzeExam={async (examId) => {
              const service = container.resolve<StudentPortalService>('StudentPortalService');
              return service.analyzeExamWithAi(examId, {});
            }}
          />
        )}

        {activeTab === 'knowledge-graph' && (
          <KnowledgeGraphView
            skills={skills}
            weaknesses={weaknesses}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'spaced-repetition' && (
          <SpacedRepetitionView
            cards={flashcards}
            onReviewCard={async (cardId, rating) => {
              const service = container.resolve<StudentPortalService>('StudentPortalService');
              return service.reviewFlashcard(cardId, rating);
            }}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationCenterView achievements={achievements} leaderboard={leaderboard} />
        )}

        {activeTab === 'profile' && (
          <StudentProfileView summary={summary} attendance={attendance} grades={grades} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCalendarView analytics={analytics} notifications={notifications} />
        )}
      </main>
    </div>
  );
};
