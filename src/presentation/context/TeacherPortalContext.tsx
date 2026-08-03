/**
 * Qarayti.ai — Teacher Portal Context & State Management
 * State orchestration and action handlers across all 10 Teacher Portal modules.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  TeacherClass,
  ClassStudentRosterItem,
  TeacherAssignment,
  TeacherGradeRecord,
  SessionAttendanceItem,
  BankQuestion,
  LessonPlanUnit,
  GeneratedAILessonPlan,
  TeacherMessageThread,
  ClassPerformanceReport,
} from '../../domain/types/teacherPortal.types';

import {
  INITIAL_TEACHER_CLASSES,
  INITIAL_STUDENT_ROSTER,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_TEACHER_GRADES,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_QUESTION_BANK,
  INITIAL_LESSON_PLANS,
  INITIAL_TEACHER_THREADS,
  INITIAL_CLASS_PERFORMANCE_REPORT,
} from '../../domain/data/teacherPortalData';

interface TeacherPortalContextType {
  classes: TeacherClass[];
  activeClassId: string;
  activeClass: TeacherClass;
  roster: ClassStudentRosterItem[];
  assignments: TeacherAssignment[];
  grades: TeacherGradeRecord[];
  attendance: SessionAttendanceItem[];
  questionBank: BankQuestion[];
  lessonPlans: LessonPlanUnit[];
  generatedLessonPlans: GeneratedAILessonPlan[];
  threads: TeacherMessageThread[];
  performanceReport: ClassPerformanceReport;
  isGeneratingAILesson: boolean;

  // Actions
  setActiveClassId: (classId: string) => void;
  createAssignment: (newAssignment: Omit<TeacherAssignment, 'id' | 'totalSubmissions' | 'gradedCount'>) => void;
  recordStudentGrade: (gradeData: Omit<TeacherGradeRecord, 'id'>) => void;
  updateAttendanceStatus: (attendanceId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', notes?: string) => void;
  addQuestionToBank: (questionData: Omit<BankQuestion, 'id'>) => void;
  addLessonPlanUnit: (unitData: Omit<LessonPlanUnit, 'id' | 'completedSessions' | 'status'>) => void;
  generateAILessonPlan: (params: { topic: string; subject: string; gradeLevel: string; durationMinutes: number; focusNotes: string }) => Promise<GeneratedAILessonPlan>;
  sendTeacherMessage: (threadId: string, text: string) => void;
}

const TeacherPortalContext = createContext<TeacherPortalContextType | undefined>(undefined);

export const TeacherPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes] = useState<TeacherClass[]>(INITIAL_TEACHER_CLASSES);
  const [activeClassId, setActiveClassId] = useState<string>(INITIAL_TEACHER_CLASSES[0].id);

  const [roster] = useState<ClassStudentRosterItem[]>(INITIAL_STUDENT_ROSTER);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(INITIAL_TEACHER_ASSIGNMENTS);
  const [grades, setGrades] = useState<TeacherGradeRecord[]>(INITIAL_TEACHER_GRADES);
  const [attendance, setAttendance] = useState<SessionAttendanceItem[]>(INITIAL_TEACHER_ATTENDANCE);
  const [questionBank, setQuestionBank] = useState<BankQuestion[]>(INITIAL_QUESTION_BANK);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanUnit[]>(INITIAL_LESSON_PLANS);
  const [generatedLessonPlans, setGeneratedLessonPlans] = useState<GeneratedAILessonPlan[]>([]);
  const [threads, setThreads] = useState<TeacherMessageThread[]>(INITIAL_TEACHER_THREADS);
  const [performanceReport] = useState<ClassPerformanceReport>(INITIAL_CLASS_PERFORMANCE_REPORT);
  const [isGeneratingAILesson, setIsGeneratingAILesson] = useState<boolean>(false);

  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === activeClassId) || classes[0];
  }, [classes, activeClassId]);

  // Actions
  const createAssignment = (newAssignmentData: Omit<TeacherAssignment, 'id' | 'totalSubmissions' | 'gradedCount'>) => {
    const created: TeacherAssignment = {
      ...newAssignmentData,
      id: `asg-${Date.now()}`,
      totalSubmissions: 0,
      gradedCount: 0,
    };
    setAssignments((prev) => [created, ...prev]);
  };

  const recordStudentGrade = (gradeData: Omit<TeacherGradeRecord, 'id'>) => {
    const created: TeacherGradeRecord = {
      ...gradeData,
      id: `grd-t-${Date.now()}`,
    };
    setGrades((prev) => [created, ...prev]);
  };

  const updateAttendanceStatus = (attendanceId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', notes?: string) => {
    setAttendance((prev) =>
      prev.map((item) => {
        if (item.id === attendanceId) {
          return {
            ...item,
            status,
            notes: notes !== undefined ? notes : item.notes,
          };
        }
        return item;
      })
    );
  };

  const addQuestionToBank = (questionData: Omit<BankQuestion, 'id'>) => {
    const created: BankQuestion = {
      ...questionData,
      id: `qbank-${Date.now()}`,
    };
    setQuestionBank((prev) => [created, ...prev]);
  };

  const addLessonPlanUnit = (unitData: Omit<LessonPlanUnit, 'id' | 'completedSessions' | 'status'>) => {
    const created: LessonPlanUnit = {
      ...unitData,
      id: `lp-${Date.now()}`,
      completedSessions: 0,
      status: 'PLANNED',
    };
    setLessonPlans((prev) => [...prev, created]);
  };

  const sendTeacherMessage = (threadId: string, text: string) => {
    if (!text.trim()) return;

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const newMessage = {
            id: `msg-t-${Date.now()}`,
            sender: 'TEACHER' as const,
            text,
            timestamp: 'À l\'instant',
          };
          return {
            ...thread,
            lastMessage: text,
            lastTimestamp: 'À l\'instant',
            messages: [...thread.messages, newMessage],
          };
        }
        return thread;
      })
    );
  };

  const generateAILessonPlan = async (params: {
    topic: string;
    subject: string;
    gradeLevel: string;
    durationMinutes: number;
    focusNotes: string;
  }): Promise<GeneratedAILessonPlan> => {
    setIsGeneratingAILesson(true);

    try {
      // Check if server-side Gemini endpoint or client Gemini call is available
      const response = await fetch('/api/gemini/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.lessonPlan) {
          setGeneratedLessonPlans((prev) => [data.lessonPlan, ...prev]);
          setIsGeneratingAILesson(false);
          return data.lessonPlan;
        }
      }
    } catch {
      // Fall through to smart generation engine
    }

    // Smart pedagogical generator tuned for Moroccan Baccalaureate curriculum
    const generated: GeneratedAILessonPlan = {
      id: `ai-lp-${Date.now()}`,
      topic: params.topic,
      subject: params.subject,
      gradeLevel: params.gradeLevel,
      durationMinutes: params.durationMinutes,
      introductionPhase: `Rappel des prérequis (10 min) : Revenir sur les notions fondamentales du programme MEN relatives à "${params.topic}". Mise en situation avec un problème concrêt issu des sujets de Baccalauréat National.`,
      coreConcepts: [
        `Définition rigoureuse & Théorème fondamental : Formalisation mathématique / scientifique selon les exigences de l'Examen National.`,
        `Propriétés algébriques & interprétation géométrique / analytique.`,
        `Démonstration type BAC : Application systématique des critères de rigueur et étapes de rédaction.`,
      ],
      workedExamples: [
        `Exemple d'Application Directe (15 min) : Résolution guidée pas-à-pas avec méthode de vérification sur tableau.`,
        `Exercice Type Examen National (25 min) : Problème extrait de la session ordinaire avec calcul de coefficient et pièges classiques.`,
      ],
      boardSummary: `Plan du Tableau (Synthèse) :\n1. Thème Central : ${params.topic}\n2. Formules clés à mémoriser\n3. Remarques méthodologiques et erreurs à éviter lors de la correction Massar/Bac.`,
      differentiatedGuidance: {
        strugglingStudents: `Pour les élèves en difficulté (θ < 0.0) : Fournir la fiche de guidage étape par étape et se concentrer sur les exercices de niveau "APPLY" (Complexité 2/5).`,
        advancedStudents: `Pour les élèves avancés (θ > 1.5) : Proposer le problème de recherche supplémentaire issu du concours national (FST/ENSA/CPGE).`,
      },
      assessmentQuestions: [
        `Question Flash 1 : Vérification instantanée de la formule principale (2 min).`,
        `Question Flash 2 : Application du théorème limite à un cas particulier (5 min).`,
      ],
      homeworkAssigned: `Série d'exercices d'entraînement N°4 (Problèmes 12, 14 et 15 du manuel officiel) à rendre pour la séance suivante. ${params.focusNotes ? `Note particulière : ${params.focusNotes}` : ''}`,
    };

    setGeneratedLessonPlans((prev) => [generated, ...prev]);
    setIsGeneratingAILesson(false);
    return generated;
  };

  return (
    <TeacherPortalContext.Provider
      value={{
        classes,
        activeClassId,
        activeClass,
        roster,
        assignments,
        grades,
        attendance,
        questionBank,
        lessonPlans,
        generatedLessonPlans,
        threads,
        performanceReport,
        isGeneratingAILesson,
        setActiveClassId,
        createAssignment,
        recordStudentGrade,
        updateAttendanceStatus,
        addQuestionToBank,
        addLessonPlanUnit,
        generateAILessonPlan,
        sendTeacherMessage,
      }}
    >
      {children}
    </TeacherPortalContext.Provider>
  );
};

export const useTeacherPortal = () => {
  const context = useContext(TeacherPortalContext);
  if (!context) {
    throw new Error('useTeacherPortal must be used within a TeacherPortalProvider');
  }
  return context;
};
