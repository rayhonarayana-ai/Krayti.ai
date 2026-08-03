/**
 * Qarayti.ai — Parent Portal Context & State Management
 * Provides state and mutation actions across all Parent Portal sub-modules.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  ParentChild,
  ProgressReport,
  AttendanceRecord,
  GradeRecord,
  HomeworkItem,
  ParentNotification,
  PaymentInvoice,
  TeacherThread,
  WeeklyReportDigest,
  AIRecommendation,
} from '../../domain/types/parentPortal.types';

import {
  INITIAL_CHILDREN,
  INITIAL_PROGRESS_REPORTS,
  INITIAL_ATTENDANCE,
  INITIAL_GRADES,
  INITIAL_HOMEWORK,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_TEACHER_THREADS,
  INITIAL_WEEKLY_REPORTS,
  INITIAL_AI_RECOMMENDATIONS,
} from '../../domain/data/parentPortalData';

interface ParentPortalContextType {
  children: ParentChild[];
  activeChildId: string;
  activeChild: ParentChild;
  progressReports: ProgressReport[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  homework: HomeworkItem[];
  notifications: ParentNotification[];
  payments: PaymentInvoice[];
  teacherThreads: TeacherThread[];
  weeklyReports: WeeklyReportDigest[];
  aiRecommendations: AIRecommendation[];
  
  // Actions
  setActiveChildId: (id: string) => void;
  toggleHomeworkStatus: (homeworkId: string) => void;
  justifyAbsence: (attendanceId: string, reason: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  payInvoice: (invoiceId: string, paymentMethod: string) => void;
  sendTeacherMessage: (threadId: string, text: string) => void;
}

const ParentPortalContext = createContext<ParentPortalContextType | undefined>(undefined);

export const ParentPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children: reactChildren }) => {
  const [childrenState, setChildrenState] = useState<ParentChild[]>(INITIAL_CHILDREN);
  const [activeChildId, setActiveChildId] = useState<string>(INITIAL_CHILDREN[0].id);

  const [progressReports, setProgressReports] = useState<ProgressReport[]>(INITIAL_PROGRESS_REPORTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [homework, setHomework] = useState<HomeworkItem[]>(INITIAL_HOMEWORK);
  const [notifications, setNotifications] = useState<ParentNotification[]>(INITIAL_NOTIFICATIONS);
  const [payments, setPayments] = useState<PaymentInvoice[]>(INITIAL_PAYMENTS);
  const [teacherThreads, setTeacherThreads] = useState<TeacherThread[]>(INITIAL_TEACHER_THREADS);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportDigest[]>(INITIAL_WEEKLY_REPORTS);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);

  const activeChild = useMemo(() => {
    return childrenState.find((c) => c.id === activeChildId) || childrenState[0];
  }, [childrenState, activeChildId]);

  // Actions
  const toggleHomeworkStatus = (homeworkId: string) => {
    setHomework((prev) =>
      prev.map((item) => {
        if (item.id === homeworkId) {
          const nextStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const justifyAbsence = (attendanceId: string, reason: string) => {
    setAttendance((prev) =>
      prev.map((record) => {
        if (record.id === attendanceId) {
          return {
            ...record,
            justified: true,
            justificationReason: reason,
          };
        }
        return record;
      })
    );
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.childId === activeChildId ? { ...n, read: true } : n))
    );
  };

  const payInvoice = (invoiceId: string, paymentMethod: string) => {
    setPayments((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'PAID',
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod,
            receiptNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}-MA`,
          };
        }
        return inv;
      })
    );

    // Update child unpaid balance
    const targetInvoice = payments.find((i) => i.id === invoiceId);
    if (targetInvoice) {
      setChildrenState((prev) =>
        prev.map((c) => {
          if (c.id === targetInvoice.childId) {
            return {
              ...c,
              unpaidBalanceMad: Math.max(0, c.unpaidBalanceMad - targetInvoice.amountMad),
            };
          }
          return c;
        })
      );
    }
  };

  const sendTeacherMessage = (threadId: string, text: string) => {
    if (!text.trim()) return;

    setTeacherThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const newMessage = {
            id: `msg-${Date.now()}`,
            sender: 'PARENT' as const,
            text,
            timestamp: 'À l\'instant',
          };
          return {
            ...thread,
            lastMessage: text,
            lastMessageTime: 'À l\'instant',
            messages: [...thread.messages, newMessage],
          };
        }
        return thread;
      })
    );
  };

  return (
    <ParentPortalContext.Provider
      value={{
        children: childrenState,
        activeChildId,
        activeChild,
        progressReports,
        attendance,
        grades,
        homework,
        notifications,
        payments,
        teacherThreads,
        weeklyReports,
        aiRecommendations,
        setActiveChildId,
        toggleHomeworkStatus,
        justifyAbsence,
        markNotificationRead,
        markAllNotificationsRead,
        payInvoice,
        sendTeacherMessage,
      }}
    >
      {reactChildren}
    </ParentPortalContext.Provider>
  );
};

export const useParentPortal = () => {
  const context = useContext(ParentPortalContext);
  if (!context) {
    throw new Error('useParentPortal must be used within a ParentPortalProvider');
  }
  return context;
};
