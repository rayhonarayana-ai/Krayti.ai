/**
 * Qarayti.ai — Moroccan Master Teacher Pedagogical Policy
 * Implements the 10-Step Pedagogical Loop and Cognitive Load Principles for Faheem
 * "أستاذ خصوصي مغربي ذكي وصبور، كيجلس مع التلميذ وكيشرح ليه حتى يفهم"
 */

import { EducationLanguage, EducationLevel } from '../../../domain/types/education.types';

export enum PedagogicalStep {
  CONNECT = 'CONNECT',                     // 1. Intuition & hook: what are we trying to find?
  EXPLAIN = 'EXPLAIN',                     // 2. One idea at a time, clear reasoning
  SHOW = 'SHOW',                           // 3. Step-by-step transformation explaining WHY
  DO_TOGETHER = 'DO_TOGETHER',             // 4. Collaborative breakdown
  LET_STUDENT_TRY = 'LET_STUDENT_TRY',     // 5. Short interactive step for student
  CHECK = 'CHECK',                         // 6. Diagnosis of student response
  CORRECT = 'CORRECT',                     // 7. Compassionate misconception explanation
  GENERALIZE = 'GENERALIZE',               // 8. Reusable compact rule
  EXAM_APPLICATION = 'EXAM_APPLICATION',   // 9. Moroccan Bac/Brevet exam methodology & traps
  RECAP = 'RECAP',                         // 10. Short recap (3-5 points) + practice
}

export type PedagogicalErrorType =
  | 'CONCEPT_ERROR'
  | 'SIGN_ERROR'
  | 'ALGEBRA_ERROR'
  | 'CALCULATION_ERROR'
  | 'READING_ERROR'
  | 'INCOMPLETE_REASONING';

export interface PedagogicalDiagnosis {
  errorType?: PedagogicalErrorType;
  isCorrect: boolean;
  positiveFeedback: string;
  gentleHint: string;
  nextStepPrompt: string;
}

export type PedagogicalIntentType =
  | 'LESSON_EXPLANATION'
  | 'CONCEPT_CONFUSION'
  | 'CONFUSION_RECOVERY'
  | 'EXERCISE_REQUEST'
  | 'STUDENT_ATTEMPT'
  | 'EXAM_TIP'
  | 'GREETING'
  | 'GENERAL_QUERY';

export interface PedagogicalIntent {
  type: PedagogicalIntentType;
  topic?: string;
  subtopic?: string;
  studentAttemptValue?: string;
  detectedLanguage: EducationLanguage;
}

export class MasterTeacherPedagogy {
  /**
   * Master Moroccan Teacher Core System Directives
   */
  public static getMasterTeacherPromptDirectives(): string {
    return `
============================================================
FAHEEM IDENTITY: MOROCCAN MASTER PRIVATE TUTOR (أستاذ خصوصي مغربي)
============================================================
You are "Faheem" (فهيم) — an expert, patient, and pedagogical Moroccan private tutor sitting beside the student to teach interactively step by step.

NON-NEGOTIABLE PEDAGOGICAL AXIOMS:
1. "TEACH BEFORE YOU EXPLAIN":
   - Start with intuition and a very simple concrete example before formulas.
   - Ask ONE question and wait.
   - Do not dump 5+ formulas or fully solved multi-step solutions in the first turn.

2. THE "ONE COGNITIVE STEP" RULE:
   - Each response must introduce ONLY ONE main cognitive step.
   - Short explanation -> Simple example -> ONE question -> WAIT.

3. AUTHENTIC MOROCCAN DARIJA & ACCESSIBLE LANGUAGE:
   - Match student language: Natural Darija for Darija, simplified Arabic for Arabic, formal BIOF French for French.
   - Use warm teacher phrases ("شوف معايا هاد المثال...", "قبل ما نحفظو القاعدة، خلينا نفهمو علاش...", "خد وقتك وفكر...").

4. ERROR-FIRST DIAGNOSIS:
   - If the student errs, provide the smallest useful hint without solving it completely or shaming them.

5. "ما فهمتش" RECOVERY:
   - When the student says they don't understand, change representation (concrete analogy / balance / number line), never repeat the same words.
`.trim();
  }

  /**
   * Classify user query intent for pedagogical routing
   */
  public static detectIntent(query: string, preferredLang: EducationLanguage): PedagogicalIntent {
    const q = query.trim().toLowerCase();

    // 1. "ما فهمتش" / Confusion recovery requests
    if (
      q.includes('ما فهمتش') ||
      q.includes('مافهمتش') ||
      q.includes('ما فهمت والو') ||
      q.includes('ما فهمت') ||
      q.includes('مافهمت') ||
      q.includes('pas compris') ||
      q.includes('je ne comprends pas') ||
      q.includes('comprends rien') ||
      q.includes('don\'t understand')
    ) {
      if (q.includes('دلتا') || q.includes('delta')) {
        return { type: 'CONCEPT_CONFUSION', topic: 'QUADRATIC_EQUATIONS', subtopic: 'DELTA_INTUITION', detectedLanguage: preferredLang };
      }
      return { type: 'CONFUSION_RECOVERY', topic: 'GENERAL_MATH', detectedLanguage: preferredLang };
    }

    // 2. Greetings
    if (q.length < 5 || q === 'سلام' || q === 'السلام عليكم' || q === 'hello' || q === 'bonjour' || q === 'hi' || q === 'coucou') {
      return { type: 'GREETING', detectedLanguage: preferredLang };
    }

    // 3. Specific conceptual confusions / "Why" questions
    if (
      (q.includes('علاش') && (q.includes('دلتا') || q.includes('delta') || q.includes('المميز'))) ||
      q.includes('منين جات دلتا') ||
      q.includes('pourquoi delta') ||
      q.includes('شنو هي دلتا') ||
      q.includes('شنو هو المميز') ||
      q.includes('دور دلتا')
    ) {
      return { type: 'CONCEPT_CONFUSION', topic: 'QUADRATIC_EQUATIONS', subtopic: 'DELTA_INTUITION', detectedLanguage: preferredLang };
    }

    if (
      q.includes('علاش كنقلبو') ||
      q.includes('علاش كنقلبو الاشارة') ||
      q.includes('علاش كنقلبو الإشارة') ||
      q.includes('علاش كنقلبو المتراجحة') ||
      q.includes('pourquoi on change le signe') ||
      q.includes('pourquoi on inverse') ||
      q.includes('signe inéquation') ||
      q.includes('قلب الاشارة')
    ) {
      return { type: 'CONCEPT_CONFUSION', topic: 'INEQUALITIES', subtopic: 'SIGN_FLIP_INTUITION', detectedLanguage: preferredLang };
    }

    // 4. Student numerical / algebraic attempts & answers
    const isAttempt =
      /^(\s*x\s*=|\s*s\s*=|\s*delta\s*=|\s*دلتا\s*=|\s*\d+\s*$|\s*[-+]?\d+[\/.]?\d*\s*$|\s*a\s*=|\s*b\s*=|\s*c\s*=)/i.test(q) ||
      q.includes('الجواب هو') ||
      q.includes('الحل هو') ||
      q.includes('la solution est') ||
      q.includes('لقيت') ||
      q.includes('2 و 3') ||
      q.includes('2 و 4') ||
      q.includes('2 و 5') ||
      q.includes('2 et 3') ||
      q.includes('تقلب') ||
      q.includes('نقلب') ||
      q.includes('نطرح') ||
      q.includes('نقسم');

    if (isAttempt) {
      return { type: 'STUDENT_ATTEMPT', studentAttemptValue: query.trim(), detectedLanguage: preferredLang };
    }

    // 5. Exercise requests
    if (
      q.includes('عطيني تمرين') ||
      q.includes('عطيني شي تمرين') ||
      q.includes('تمرين تطبيقي') ||
      q.includes('donne-moi un exercice') ||
      q.includes('give me an exercise') ||
      q.includes('exercice') ||
      q === 'تمرين'
    ) {
      return { type: 'EXERCISE_REQUEST', topic: 'GENERAL_MATH', detectedLanguage: preferredLang };
    }

    // 6. Lesson Explanation requests
    if (
      q.includes('اشرحلي') ||
      q.includes('شرح ليا') ||
      q.includes('شرحها ليا') ||
      q.includes('كيفاش نحل') ||
      q.includes('كيف نحل') ||
      q.includes('كيف أحل') ||
      q.includes('expliqu') ||
      q.includes('comment résoud') ||
      q.includes('معادلات') ||
      q.includes('متراجحات') ||
      q.includes('عقدية') ||
      q.includes('نهايات') ||
      q.includes('اشتقاق') ||
      q.includes('فيزياء') ||
      q.includes('فلسفة')
    ) {
      return { type: 'LESSON_EXPLANATION', topic: 'CURRICULUM_LESSON', detectedLanguage: preferredLang };
    }

    return { type: 'GENERAL_QUERY', detectedLanguage: preferredLang };
  }
}
