/**
 * Qarayti.ai — Student Portal Repository
 * Clean Architecture Repository for Student Portal Features
 *
 * NON_AUTHORITATIVE_UI_PROTOTYPE: This is a mock/stub implementation.
 * All data returned here is fabricated — not derived from learning_observation_history
 * or any trusted evidence source. It exists for UI development and prototyping only.
 * Real learner data flows through learningEvidenceEngine.getStudentEvidence() (canonical).
 */

import {
  StudentDashboardSummary,
  StudentLesson,
  StudentExercise,
  ExerciseSubmissionResult,
  HomeworkAssignment,
  ExamPreparationItem,
  ExamAiAnalysisResult,
  StudentAchievement,
  LeaderboardUser,
  StudentAttendanceRecord,
  StudentGradeRecord,
  StudentNotification,
  StudentGoalSetting,
} from '../types/studentPortal.types';
import {
  KnowledgeNode,
  SkillTreeNode,
  WeaknessDiagnostic,
  Recommendation,
  SpacedRepetitionCard,
  LearningAnalytics,
} from '../types/adaptive.types';
import { EducationLevel, HighSchoolTrack, EducationLanguage, ExamType } from '../types/education.types';
import { KNOWLEDGE_NODES, SPACED_REPETITION_CARDS } from '../data/adaptiveCurriculumData';

export interface IStudentPortalRepository {
  getDashboardSummary(studentId: string): Promise<StudentDashboardSummary>;
  getLessons(studentId: string, subjectId?: string): Promise<StudentLesson[]>;
  getLessonById(lessonId: string): Promise<StudentLesson | undefined>;
  completeLesson(studentId: string, lessonId: string): Promise<void>;
  
  getExercises(subjectId?: string, topic?: string): Promise<StudentExercise[]>;
  submitExerciseAnswer(exerciseId: string, answer: string): Promise<ExerciseSubmissionResult>;
  generateAiExercise(subjectName: string, topic: string, difficulty: string): Promise<StudentExercise>;

  getHomeworkList(studentId: string): Promise<HomeworkAssignment[]>;
  submitHomework(homeworkId: string, text: string): Promise<void>;

  getExamPrepItems(examType?: ExamType): Promise<ExamPreparationItem[]>;
  analyzeExamWithAi(examId: string, answers: Record<string, string>): Promise<ExamAiAnalysisResult>;

  getSkillTree(subjectId?: string): Promise<SkillTreeNode[]>;
  getWeaknessDiagnostics(studentId: string): Promise<WeaknessDiagnostic[]>;
  getRecommendations(studentId: string): Promise<Recommendation[]>;

  getFlashcards(studentId: string): Promise<SpacedRepetitionCard[]>;
  reviewFlashcard(cardId: string, rating: 1 | 2 | 3 | 4 | 5): Promise<SpacedRepetitionCard>;

  getAchievements(studentId: string): Promise<StudentAchievement[]>;
  getLeaderboard(track?: HighSchoolTrack): Promise<LeaderboardUser[]>;
  updateGoalSettings(studentId: string, goals: Partial<StudentGoalSetting>): Promise<StudentGoalSetting>;

  getStudentProfile(studentId: string): Promise<StudentDashboardSummary>;
  getAttendanceRecords(studentId: string): Promise<StudentAttendanceRecord[]>;
  getGradeRecords(studentId: string): Promise<StudentGradeRecord[]>;
  getNotifications(studentId: string): Promise<StudentNotification[]>;
  getLearningAnalytics(studentId: string): Promise<LearningAnalytics>;
}

export class StudentPortalRepositoryImpl implements IStudentPortalRepository {
  private flashcardStore: SpacedRepetitionCard[] = [...SPACED_REPETITION_CARDS];
  private homeworkStore: HomeworkAssignment[] = [
    {
      id: 'hw-01',
      title: 'واجب أسبوعي: تمارين الأعداد العقدية والهندسة',
      subjectName: 'Mathématiques',
      teacherName: 'Pr. Mohammed Alami',
      assignedDate: '2026-08-01',
      dueDate: '2026-08-05',
      status: 'PENDING',
      maxGrade: 20,
    },
    {
      id: 'hw-02',
      title: 'Devoir Libre 2: Électricité Dipôle RC & RLC',
      subjectName: 'Physique-Chimie',
      teacherName: 'Pr. Fatima Zahra',
      assignedDate: '2026-07-28',
      dueDate: '2026-08-02',
      status: 'GRADED',
      grade: 18.5,
      maxGrade: 20,
      feedback: 'Excellent travail sur les équations différentielles ! Attention aux unités de la constante tau.',
      submissionText: 'Fichier envoyé via le portail élèves Qarayti.',
    },
    {
      id: 'hw-03',
      title: 'تحليل نص فلسفي: مفهوم الشخص والهوية',
      subjectName: 'Philosophie',
      teacherName: 'Pr. Hassan Bennis',
      assignedDate: '2026-08-02',
      dueDate: '2026-08-08',
      status: 'PENDING',
      maxGrade: 20,
    },
  ];

  private goalSettings: StudentGoalSetting = {
    dailyStudyMinutesGoal: 90,
    weeklyExercisesGoal: 25,
    targetBacScoreGoal: 17.5,
    preferredLanguage: EducationLanguage.ARABIC,
    notificationsEnabled: true,
  };

  public async getDashboardSummary(studentId: string): Promise<StudentDashboardSummary> {
    return {
      studentId,
      name: 'Youssef El Amrani',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      level: EducationLevel.HIGH_SCHOOL,
      track: HighSchoolTrack.MATHEMATICS_A,
      massarId: 'M134567890',
      schoolName: 'Lycée Moulay Youssef',
      regionalCity: 'Rabat-Salé-Kénitra',
      xp: 4250,
      coins: 380,
      levelRank: 14,
      levelTitle: 'بطل البكالوريا الذهبي (Gold Bac Hero)',
      streakDays: 14,
      bacTargetScore: 17.5,
      currentEstimatedBacScore: 16.2,
      todayStudyMinutes: 55,
      todayGoalMinutes: 90,
      completedTasksToday: 4,
      totalTasksToday: 6,
      upcomingExamsCount: 2,
      pendingHomeworkCount: 2,
      masteryPercentage: 78,
    };
  }

  public async getLessons(studentId: string, subjectId?: string): Promise<StudentLesson[]> {
    const allLessons: StudentLesson[] = [
      {
        id: 'les-math-01',
        subjectId: 'MATH',
        subjectName: 'Mathématiques',
        unitTitleAr: 'الأعداد العقدية (Nombres Complexes)',
        unitTitleFr: 'Nombres Complexes',
        lessonTitleAr: 'الدرس 1: الشكل الجبري والمعيار والشيء المرافق',
        lessonTitleFr: 'Forme algébrique, module et conjugué',
        complexity: 3,
        durationMinutes: 45,
        videoUrl: 'https://www.youtube.com/watch?v=sample1',
        contentMarkdown: `### 1. تعريف العدد العقدي (Forme Algébrique)
كل عدد عقدي $z$ يكتب بشكل فريد على الصورة:
$$z = a + i b$$
حيث $a, b \\in \\mathbb{R}$ و $i^2 = -1$.
- $a = \\text{Re}(z)$: الجزء الحقيقي (Partie réelle).
- $b = \\text{Im}(z)$: الجزء التخيلي (Partie imaginaire).

### 2. معيار عدد عقدي (Module d'un nombre complexe)
معيار العدد العقدي $z = a + ib$ هو العدد الحقيقي الموجب:
$$|z| = \\sqrt{a^2 + b^2}$$`,
        keyFormulae: ['z = a + ib', '|z| = \\sqrt{a^2 + b^2}', 'z \\bar{z} = |z|^2'],
        bacWeightPercentage: 15,
        isCompleted: true,
        masteryScore: 0.88,
      },
      {
        id: 'les-math-02',
        subjectId: 'MATH',
        subjectName: 'Mathématiques',
        unitTitleAr: 'الأعداد العقدية (Nombres Complexes)',
        unitTitleFr: 'Nombres Complexes',
        lessonTitleAr: 'الدرس 2: الشكل المثلثي والخيالي (Forme Trigonométrique et Exponentielle)',
        lessonTitleFr: 'Forme trigonométrique et exponentielle',
        complexity: 4,
        durationMinutes: 60,
        contentMarkdown: `### الشكل المثلثي والخيالي
إذا كان $z \\neq 0$ معيار $r = |z|$ وعمدته $\\theta = \\arg(z) [2\\pi]$:
$$z = r(\\cos \\theta + i \\sin \\theta) = r e^{i\\theta}$$

#### صياغة موآفر (Formule de Moivre):
$$(\\cos \\theta + i \\sin \\theta)^n = \\cos(n\\theta) + i \\sin(n\\theta)$$`,
        keyFormulae: ['z = r e^{i\\theta}', 'e^{i\\pi} + 1 = 0', '(\\cos\\theta + i\\sin\\theta)^n = e^{in\\theta}'],
        bacWeightPercentage: 15,
        isCompleted: false,
        masteryScore: 0.65,
      },
      {
        id: 'les-phys-01',
        subjectId: 'PHYS',
        subjectName: 'Physique-Chimie',
        unitTitleAr: 'الفيزياء: ثنائي القطب RC',
        unitTitleFr: 'Physique: Dipôle RC',
        lessonTitleAr: 'استجابة ثنائي القطب RC لرتبة طالعة ورتبة نازلة',
        lessonTitleFr: 'Réponse d\'un dipôle RC à un échelon de tension',
        complexity: 3,
        durationMinutes: 50,
        contentMarkdown: `### المعادلة التفاضلية للتوتر $u_C(t)$
$$u_R + u_C = E \\implies R C \\frac{du_C}{dt} + u_C = E$$
باستعمال ثابتة الزمن $\\tau = R C$:
$$\\tau \\frac{du_C}{dt} + u_C = E$$

#### حل المعادلة التفاضلية:
$$u_C(t) = E (1 - e^{-t/\\tau})$$`,
        keyFormulae: ['\\tau = R C', 'u_C(t) = E(1 - e^{-t/\\tau})', 'E_e = \\frac{1}{2} C u_C^2'],
        bacWeightPercentage: 18,
        isCompleted: true,
        masteryScore: 0.82,
      },
    ];

    if (subjectId) {
      return allLessons.filter((l) => l.subjectId === subjectId);
    }
    return allLessons;
  }

  public async getLessonById(lessonId: string): Promise<StudentLesson | undefined> {
    const lessons = await this.getLessons('usr-1');
    return lessons.find((l) => l.id === lessonId);
  }

  public async completeLesson(studentId: string, lessonId: string): Promise<void> {
    // updates local completion
  }

  public async getExercises(subjectId?: string, topic?: string): Promise<StudentExercise[]> {
    // Gate 06B.2B.2.1: Strip correctAnswer and solutionSteps from student-facing DTO.
    // Answer authority remains in curriculum_exercise_grading (server-side only).
    // Gate 06D.4: exerciseSource explicitly declares canonical status.
    // CANONICAL exercises are eligible for trusted submission via ingest-evidence.
    // PROTOTYPE_UNMAPPED exercises cannot produce authoritative evidence — submission disabled.
    const exercises: StudentExercise[] = [
      // Gate 06D.4: CANONICAL exercise — mapped to ko-math-001 (TVI), EXACT_ANSWER grading
      {
        id: 'q-math-001',
        exerciseCode: 'q-math-001',
        exerciseSource: 'CANONICAL',
        subjectId: 'MATH',
        topicAr: 'التحليل — النهايات والاتصال (Limites et Continuité)',
        topicFr: 'Analyse — Limites et Continuité',
        difficulty: 'MEDIUM',
        questionText: 'Calculer la limite quand x tend vers 0 de (sin(3x) / x) :',
        hints: ['استعمل حدودية sin(u)/u عند 0', 'sin(3x)/x = 3·sin(3x)/(3x)'],
        options: ['0', '1', '3', 'Infinie'],
        maxPoints: 4,
      },
      // Gate 06D.4: PROTOTYPE_UNMAPPED — ko_id NULL, no canonical KO exists
      {
        id: 'ex-01',
        exerciseCode: 'ex-01',
        exerciseSource: 'PROTOTYPE_UNMAPPED',
        subjectId: 'MATH',
        topicAr: 'الأعداد العقدية - المعادلة من الدرجة الثانية',
        topicFr: 'Nombres Complexes - Équation du 2nd degré',
        difficulty: 'MEDIUM',
        questionText: 'حل في مجموعة الأعداد العقدية \\mathbb{C} المعادلة التالية:\n$$z^2 - 2\\sqrt{3} z + 4 = 0$$',
        hints: ['احسب المميز المميز \\Delta', 'تذكر أن \\Delta = (2\\sqrt{3})^2 - 4(1)(4) = 12 - 16 = -4 = (2i)^2'],
        options: [
          'z_1 = \\sqrt{3} + i, z_2 = \\sqrt{3} - i',
          'z_1 = 2 + i\\sqrt{3}, z_2 = 2 - i\\sqrt{3}',
          'z_1 = 1 + 2i, z_2 = 1 - 2i',
        ],
        maxPoints: 3,
      },
      // Gate 06D.4: PROTOTYPE_UNMAPPED — ko_id NULL, no physics KO exists
      {
        id: 'ex-02',
        exerciseCode: 'ex-02',
        exerciseSource: 'PROTOTYPE_UNMAPPED',
        subjectId: 'PHYS',
        topicAr: 'الفيزياء - ثنائي القطب RC وثابتة الزمن',
        topicFr: 'Dipôle RC - Constante de temps',
        difficulty: 'HARD',
        questionText: 'أوجد تعبير constante de temps \\tau لدارة تحتوي على موصل أومي R = 100 \\,\\Omega ومكثف سعته C = 10 \\,\\mu F.',
        hints: ['تذكر تحويل \\mu F إلى Farad: 10 \\mu F = 10 \\times 10^{-6} F'],
        maxPoints: 2,
      },
      // Gate 06D.4: CANONICAL_MISMATCH — mapped to ko-math-002 (dichotomy) but content is complex numbers
      {
        id: 'q-math-002',
        exerciseCode: 'q-math-002',
        exerciseSource: 'CANONICAL',
        subjectId: 'MATH',
        topicAr: 'الأعداد العقدية — الشكل المثلثي (Forme Trigonométrique)',
        topicFr: 'Nombres Complexes — Forme Trigonométrique',
        difficulty: 'HARD',
        questionText: 'Soit z = 1 + i√3. Écrire z sous forme trigonométrique et calculer z⁶.',
        hints: ['|z| = √(1² + (√3)²) = 2', 'arg(z) = π/3'],
        maxPoints: 4,
        curriculumMismatch: true,
      },
      // Gate 06D.4: UNSUPPORTED_GRADING_MODE — RUBRIC grading not supported by trusted verification
      {
        id: 'q-svt-001',
        exerciseCode: 'q-svt-001',
        exerciseSource: 'CANONICAL',
        subjectId: 'SVT',
        topicAr: 'علوم الحياة — الأشجار sourceMappingية',
        topicFr: 'SVT — Arbres Généalogiques',
        difficulty: 'HARD',
        questionText: 'Analyser l\'arbre généalogique fourni et déterminer si l\'allèle est dominant ou récessif.',
        hints: ['ابحث عن ت Saltos de génération'],
        maxPoints: 4,
        unsupportedGrading: true,
        gradingMode: 'RUBRIC',
      },
    ];

    if (subjectId) {
      return exercises.filter((l) => l.subjectId === subjectId);
    }
    return exercises;
  }

  /**
   * Gate 06C.5.1: Exercise verification requires server-side grading through
   * the ingest-evidence Edge Function (Gate 06B.2B.2). This mock repository
   * cannot verify answers — it must not fabricate correctness, mastery, XP,
   * or feedback. Fail closed.
   */
  public async submitExerciseAnswer(exerciseId: string, answer: string): Promise<ExerciseSubmissionResult> {
    throw new Error(
      'submitExerciseAnswer requires server-side grading via the ingest-evidence Edge Function. ' +
      'Exercise verification cannot be performed by the mock repository. ' +
      'Route exercise submissions through the verified ingestion path.'
    );
  }

  public async generateAiExercise(subjectName: string, topic: string, difficulty: string): Promise<StudentExercise> {
    return {
      id: `ai-gen-${Date.now()}`,
      subjectId: 'MATH',
      exerciseSource: 'AI_GENERATED',
      topicAr: topic,
      topicFr: topic,
      difficulty: difficulty as any,
      questionText: `تمرين مولد بواسطة نظام فهيم الذكي فـ ${topic}:\nاحسب النهاية التالية عند +\\infty:\n$$\\lim_{x \\to +\\infty} \\frac{x^2 - e^x}{x + \\ln x}$$`,
      hints: ['استعمل التزايد المقارن بين e^x و x^2 عند +\\infty'],
      solutionSteps: [
        'نعمل بـ e^x في البسط و x في المقام.',
        'نستعمل الحدودية المرجعية: \\lim_{x\\to\\infty} \\frac{e^x}{x^2} = +\\infty.',
        'النتيجة النهائية هي -\\infty.',
      ],
      maxPoints: 3,
      isAiGenerated: true,
    };
  }

  public async getHomeworkList(studentId: string): Promise<HomeworkAssignment[]> {
    return this.homeworkStore;
  }

  public async submitHomework(homeworkId: string, text: string): Promise<void> {
    const hw = this.homeworkStore.find((h) => h.id === homeworkId);
    if (hw) {
      hw.status = 'SUBMITTED';
      hw.submissionText = text;
    }
  }

  public async getExamPrepItems(examType?: ExamType): Promise<ExamPreparationItem[]> {
    const exams: ExamPreparationItem[] = [
      {
        id: 'exam-bac-2024-math-a',
        title: 'الامتحان الوطني للبكالوريا 2024 - الدورة العادية (علوم رياضية)',
        examType: ExamType.NATIONAL_EXAM,
        year: 2024,
        session: 'ORDINAIRE',
        track: HighSchoolTrack.MATHEMATICS_A,
        subjectName: 'Mathématiques',
        durationMinutes: 240,
        totalPoints: 20,
        pdfUrl: 'https://qarayti.ai/exams/2024_math_a.pdf',
        correctionPdfUrl: 'https://qarayti.ai/exams/2024_math_a_corr.pdf',
        interactiveQuestionsCount: 12,
        completionStatus: 'COMPLETED',
        bestScore: 17.5,
      },
      {
        id: 'exam-bac-2023-phys',
        title: 'الامتحان الوطني للبكالوريا 2023 - الدورة العادية (علوم فيزيائية)',
        examType: ExamType.NATIONAL_EXAM,
        year: 2023,
        session: 'ORDINAIRE',
        track: HighSchoolTrack.PHYSICS_CHEMISTRY,
        subjectName: 'Physique-Chimie',
        durationMinutes: 180,
        totalPoints: 20,
        interactiveQuestionsCount: 15,
        completionStatus: 'IN_PROGRESS',
        bestScore: 15.0,
      },
      {
        id: 'exam-reg-2024-french-1bac',
        title: 'الامتحان الجهوي الموحد 1BAC 2024 - اللغة الفرنسية (جهات الرباط-سلا-القنيطرة)',
        examType: ExamType.REGIONAL_EXAM,
        year: 2024,
        session: 'ORDINAIRE',
        track: HighSchoolTrack.MATHEMATICS_A,
        subjectName: 'Français',
        durationMinutes: 120,
        totalPoints: 20,
        interactiveQuestionsCount: 10,
        completionStatus: 'NOT_STARTED',
      },
    ];

    if (examType) {
      return exams.filter((e) => e.examType === examType);
    }
    return exams;
  }

  public async analyzeExamWithAi(examId: string, answers: Record<string, string>): Promise<ExamAiAnalysisResult> {
    return {
      examId,
      examTitle: 'تحليل الامتحان الوطني 2024 - نظام فهيم الذكي',
      overallScore: 16.5,
      timeSpentMinutes: 165,
      strengthTopics: ['الأعداد العقدية - الشكل المثلثي', 'التحليل والحساب التكاملي'],
      weaknessTopics: ['المعادلات التفاضلية للفيزياء RC', 'استدلال بالتراجع'],
      recommendations: [
        'مراجعة ملخص درس دارة RC وحل 3 تمارين تطبيقية إضافية.',
        'التركيز على قواعد تكامل بالأجزاء (Intégration par parties).',
      ],
      detailedRubric: [
        {
          questionNumber: 'التمرين 1 (3 ن)',
          topic: 'Nombres Complexes',
          pointsEarned: 3.0,
          maxPoints: 3.0,
          adviceAr: 'إجابة كاملة مع مراعاة الشكل المثلثي والصياغة النقطية.',
        },
        {
          questionNumber: 'التمرين 2 (3 ن)',
          topic: 'Équations Différentielles',
          pointsEarned: 1.5,
          maxPoints: 3.0,
          mistakeType: 'خطأ في تحديد ثابتة الشروط البدئية',
          adviceAr: 'تأكد دائماً من انطلاق المكثف بدون شحنة بدئية u_C(0) = 0.',
        },
      ],
    };
  }

  public async getSkillTree(subjectId?: string): Promise<SkillTreeNode[]> {
    return [
      {
        id: 'skill-01',
        nodeId: 'MATH-01',
        title: 'النهايات والاتصال',
        titleAr: 'النهايات والاتصال',
        category: 'التحليل الرياضي',
        tier: 1,
        status: 'mastered',
        iconName: 'Function',
        xpReward: 200,
        prerequisiteSkillIds: [],
      },
      {
        id: 'skill-02',
        nodeId: 'MATH-02',
        title: 'الاشتقاق وتطبيقاته',
        titleAr: 'الاشتقاق وتطبيقاته',
        category: 'التحليل الرياضي',
        tier: 2,
        status: 'mastered',
        iconName: 'TrendingUp',
        xpReward: 300,
        prerequisiteSkillIds: ['skill-01'],
      },
      {
        id: 'skill-03',
        nodeId: 'MATH-03',
        title: 'الدوال اللوغاريتمية',
        titleAr: 'الدوال اللوغاريتمية',
        category: 'التحليل الرياضي',
        tier: 3,
        status: 'in_progress',
        iconName: 'Calculator',
        xpReward: 400,
        prerequisiteSkillIds: ['skill-02'],
      },
      {
        id: 'skill-04',
        nodeId: 'MATH-06',
        title: 'الأعداد العقدية',
        titleAr: 'الأعداد العقدية',
        category: 'الجبر الهندسي',
        tier: 3,
        status: 'weak',
        iconName: 'Compass',
        xpReward: 500,
        prerequisiteSkillIds: ['skill-02'],
      },
    ];
  }

  public async getWeaknessDiagnostics(studentId: string): Promise<WeaknessDiagnostic[]> {
    return [
      {
        id: 'weak-01',
        nodeId: 'MATH-06',
        nodeTitle: 'الأعداد العقدية - الشكل الأسّي والهندسة',
        subjectId: 'MATH',
        severity: 'critical',
        gapType: 'conceptual_misunderstanding',
        impactScore: 85,
        rootCauseNodeIds: ['MATH-02'],
        remediationRecommendation: 'إعادة مراجعة التحويلات النقطية (الدوران والتحاكي) والتعبير عن المعيار والعمدة.',
        detectedAt: '2026-08-02T14:30:00.000Z',
      },
      {
        id: 'weak-02',
        nodeId: 'PHYS-03',
        nodeTitle: 'الفيزياء: حل المعادلة التفاضلية لدارة RC',
        subjectId: 'PHYS',
        severity: 'moderate',
        gapType: 'procedural_error',
        impactScore: 60,
        rootCauseNodeIds: ['MATH-02'],
        remediationRecommendation: 'التمرن على طريقة الاشتماق وتعويض الثوابت A و \\tau في التوتر u_C(t).',
        detectedAt: '2026-08-01T11:00:00.000Z',
      },
    ];
  }

  public async getRecommendations(studentId: string): Promise<Recommendation[]> {
    return [
      {
        id: 'rec-01',
        nodeId: 'MATH-06',
        title: 'تمارين الأعداد العقدية للبكالوريا الوطني',
        subjectId: 'MATH',
        subjectName: 'Mathématiques',
        reason: 'تدارك التعثر في الشكل الأسّي والتحويلات النقطية',
        reasonBadge: 'Weakness Remediation',
        priority: 'urgent',
        priorityScore: 92,
        expectedMasteryGain: 0.18,
        estimatedTimeMinutes: 30,
        exerciseType: 'problem_solving',
      },
      {
        id: 'rec-02',
        nodeId: 'PHYS-03',
        title: 'مراجعة بطاقات الذاكرة لمفاهيم الفيزياء RC',
        subjectId: 'PHYS',
        subjectName: 'Physique-Chimie',
        reason: 'موعد المراجعة المتباعدة حسب خوارزمية التكرار',
        reasonBadge: 'Overdue Revision',
        priority: 'high',
        priorityScore: 84,
        expectedMasteryGain: 0.12,
        estimatedTimeMinutes: 15,
        exerciseType: 'flashcards',
      },
    ];
  }

  public async getFlashcards(studentId: string): Promise<SpacedRepetitionCard[]> {
    return this.flashcardStore;
  }

  public async reviewFlashcard(cardId: string, rating: 1 | 2 | 3 | 4 | 5): Promise<SpacedRepetitionCard> {
    const card = this.flashcardStore.find((c) => c.id === cardId);
    if (card) {
      card.repetitionCount += 1;
      card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
      card.intervalDays = rating >= 3 ? Math.round(card.intervalDays * card.easeFactor) : 1;
      card.lastReviewDate = new Date().toISOString();
      card.retentionProbability = Math.min(1.0, card.retentionProbability + 0.1);
      return card;
    }
    throw new Error(`Card ${cardId} not found`);
  }

  public async getAchievements(studentId: string): Promise<StudentAchievement[]> {
    return [
      {
        id: 'ach-01',
        titleAr: 'سيد الاستمرارية (14 يوماً متتالياً)',
        titleFr: 'Maître de la Régularité',
        descriptionAr: 'الدخول والمذاكرة اليومية لمدة 14 يوماً بدون انقطاع.',
        iconName: 'Flame',
        badgeCategory: 'STREAK',
        unlockedAt: '2026-08-01',
        isUnlocked: true,
        xpReward: 500,
        progressPercentage: 100,
      },
      {
        id: 'ach-02',
        titleAr: 'بطل الامتحان الوطني (BAC Master)',
        titleFr: 'Héros du Bac National',
        descriptionAr: 'إنجاز 10 امتحانات وطنية سابقة بنقطة أكبر من 16/20.',
        iconName: 'Award',
        badgeCategory: 'EXAM_HERO',
        isUnlocked: false,
        xpReward: 1000,
        progressPercentage: 70,
      },
      {
        id: 'ach-03',
        titleAr: 'خبير التكرار المتباعد (Flashcard Wizard)',
        titleFr: 'Expert de Répétition Espacée',
        descriptionAr: 'مراجعة 100 بطاقة استذكار بنسبة تذكر أعلى من 80%.',
        iconName: 'Zap',
        badgeCategory: 'MASTERY',
        isUnlocked: true,
        unlockedAt: '2026-07-25',
        xpReward: 400,
        progressPercentage: 100,
      },
    ];
  }

  public async getLeaderboard(track?: HighSchoolTrack): Promise<LeaderboardUser[]> {
    return [
      {
        rank: 1,
        studentId: 'st-top-1',
        name: 'أمين الشرايبي (Amine Chraibi)',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
        track: HighSchoolTrack.MATHEMATICS_A,
        xp: 8900,
        streakDays: 28,
        bacTarget: 18.8,
      },
      {
        rank: 2,
        studentId: 'usr-1',
        name: 'يوسف العمراني (You - Youssef El Amrani)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        track: HighSchoolTrack.MATHEMATICS_A,
        xp: 4250,
        streakDays: 14,
        bacTarget: 17.5,
        isCurrentUser: true,
      },
      {
        rank: 3,
        studentId: 'st-top-3',
        name: 'سلمى بنجلون (Salma Benjelloun)',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
        track: HighSchoolTrack.PHYSICS_CHEMISTRY,
        xp: 3890,
        streakDays: 9,
        bacTarget: 16.5,
      },
    ];
  }

  public async updateGoalSettings(
    studentId: string,
    goals: Partial<StudentGoalSetting>
  ): Promise<StudentGoalSetting> {
    this.goalSettings = { ...this.goalSettings, ...goals };
    return this.goalSettings;
  }

  public async getStudentProfile(studentId: string): Promise<StudentDashboardSummary> {
    return this.getDashboardSummary(studentId);
  }

  public async getAttendanceRecords(studentId: string): Promise<StudentAttendanceRecord[]> {
    return [
      { date: '2026-08-01', status: 'PRESENT', subjectName: 'Mathématiques' },
      { date: '2026-08-01', status: 'PRESENT', subjectName: 'Physique-Chimie' },
      { date: '2026-07-31', status: 'PRESENT', subjectName: 'SVT' },
      { date: '2026-07-30', status: 'PRESENT', subjectName: 'Philosophie' },
      { date: '2026-07-29', status: 'EXCUSED', subjectName: 'Anglais', notes: 'مبرر طبي مسلم لإدارة الثانوية' },
    ];
  }

  public async getGradeRecords(studentId: string): Promise<StudentGradeRecord[]> {
    return [
      { id: 'g1', subjectName: 'Mathématiques', coefficient: 7, grade: 18.5, classAverage: 13.2, maxGrade: 20, minGrade: 8, examType: 'المراقبة المستمرة 1', date: '2026-07-20' },
      { id: 'g2', subjectName: 'Physique-Chimie', coefficient: 7, grade: 17.0, classAverage: 12.8, maxGrade: 19.5, minGrade: 7.5, examType: 'المراقبة المستمرة 1', date: '2026-07-22' },
      { id: 'g3', subjectName: 'SVT', coefficient: 5, grade: 16.5, classAverage: 12.1, maxGrade: 18.0, minGrade: 9.0, examType: 'المراقبة المستمرة 1', date: '2026-07-25' },
      { id: 'g4', subjectName: 'Philosophie', coefficient: 2, grade: 15.5, classAverage: 11.4, maxGrade: 17.0, minGrade: 6.0, examType: 'المراقبة المستمرة 1', date: '2026-07-27' },
      { id: 'g5', subjectName: 'Anglais', coefficient: 2, grade: 16.0, classAverage: 13.5, maxGrade: 19.0, minGrade: 10.0, examType: 'المراقبة المستمرة 1', date: '2026-07-28' },
    ];
  }

  public async getNotifications(studentId: string): Promise<StudentNotification[]> {
    return [
      {
        id: 'n1',
        title: 'واجب جديد في المادة',
        message: 'قام الأستاذ محمد العالمي بإضافة واجب جديد في الرياضيات: تمارين الأعداد العقدية.',
        type: 'ASSIGNMENT',
        timestamp: '2026-08-03T10:00:00.000Z',
        read: false,
      },
      {
        id: 'n2',
        title: 'تحديث النظام',
        message: 'تم تحديث منصة التعلم. راجع التمارين الجديدة المتاحة.',
        type: 'SYSTEM',
        timestamp: '2026-08-02T16:30:00.000Z',
        read: true,
      },
      {
        id: 'n3',
        title: 'إنجاز جديد unlocked!',
        message: 'تهانينا! لقد حصلت على وسام "سيد الاستمرارية" لإكمال 14 يوماً من المذاكرة بدون انقطاع.',
        type: 'ACHIEVEMENT',
        timestamp: '2026-08-01T09:15:00.000Z',
        read: true,
      },
    ];
  }

  public async getLearningAnalytics(studentId: string): Promise<LearningAnalytics> {
    return {
      velocity: 4.5,
      retentionRate: 88,
      overallMastery: 78,
      studyMinutesToday: 55,
      weakNodesCount: 2,
      masteredNodesCount: 14,
      totalNodesCount: 18,
      forecastBacScore: 16.5,
      masteryBySubject: [
        { subjectId: 'MATH', subjectName: 'Mathématiques', masteryScore: 0.85, nodeCount: 6 },
        { subjectId: 'PHYS', subjectName: 'Physique-Chimie', masteryScore: 0.78, nodeCount: 5 },
        { subjectId: 'SVT', subjectName: 'SVT', masteryScore: 0.72, nodeCount: 4 },
        { subjectId: 'PHIL', subjectName: 'Philosophie', masteryScore: 0.70, nodeCount: 3 },
      ],
      retentionDecayCurve: [
        { daysAgo: 0, retentionRate: 100, predictedRetention: 100 },
        { daysAgo: 1, retentionRate: 92, predictedRetention: 90 },
        { daysAgo: 3, retentionRate: 82, predictedRetention: 78 },
        { daysAgo: 7, retentionRate: 71, predictedRetention: 65 },
        { daysAgo: 14, retentionRate: 58, predictedRetention: 50 },
      ],
      accuracyTrend: [
        { date: '2026-07-28', accuracy: 0.75, attempts: 12 },
        { date: '2026-07-29', accuracy: 0.80, attempts: 15 },
        { date: '2026-07-30', accuracy: 0.78, attempts: 18 },
        { date: '2026-07-31', accuracy: 0.85, attempts: 20 },
        { date: '2026-08-01', accuracy: 0.88, attempts: 22 },
        { date: '2026-08-02', accuracy: 0.90, attempts: 25 },
        { date: '2026-08-03', accuracy: 0.92, attempts: 14 },
      ],
    };
  }
}
