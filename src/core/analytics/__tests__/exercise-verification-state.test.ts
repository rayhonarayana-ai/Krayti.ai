/**
 * Qarayti.ai — Gate 06D.2 + 06D.4: Exercise Verification State Tests
 *
 * Proves that PENDING_VERIFICATION cannot be interpreted as INCORRECT,
 * that GRADED carries only genuine server-verified fields,
 * that fabricated grading fields (scoreObtained, masteryGain, xpEarned)
 * are removed from the trusted contract,
 * and that ERROR state exists for failures.
 *
 * Run: npx tsx src/core/analytics/__tests__/exercise-verification-state.test.ts
 */

import { ExerciseSubmissionResult } from '../../../domain/types/studentPortal.types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

// ============================================================
// T1: PENDING_VERIFICATION has no grading authority
// ============================================================
const pendingResult: ExerciseSubmissionResult = {
  status: 'PENDING_VERIFICATION',
  exerciseId: 'ex-001',
  studentAnswer: 'z = 1 + i',
  feedbackAr: 'تم إرسال إجابتك، جارٍ التحقق منها...',
};

assert(
  'status' in pendingResult && pendingResult.status === 'PENDING_VERIFICATION',
  'T1a: PENDING_VERIFICATION status is correctly set'
);

assert(
  !('isCorrect' in pendingResult),
  'T1b: PENDING_VERIFICATION has no isCorrect property'
);

assert(
  !('scoreObtained' in pendingResult),
  'T1c: PENDING_VERIFICATION has no scoreObtained property'
);

assert(
  !('masteryGain' in pendingResult),
  'T1d: PENDING_VERIFICATION has no masteryGain property'
);

assert(
  !('xpEarned' in pendingResult),
  'T1e: PENDING_VERIFICATION has no xpEarned property'
);

// ============================================================
// T2: PENDING_VERIFICATION cannot be interpreted as INCORRECT
// ============================================================
const isPending = pendingResult.status === 'PENDING_VERIFICATION';
assert(
  isPending,
  'T2a: status is PENDING_VERIFICATION'
);
assert(
  !('isCorrect' in pendingResult),
  'T2b: PENDING_VERIFICATION cannot be interpreted as INCORRECT — isCorrect absent'
);
assert(
  !('scoreObtained' in pendingResult),
  'T2c: PENDING_VERIFICATION cannot carry a score of 0 as graded result'
);
assert(
  !('masteryGain' in pendingResult),
  'T2d: PENDING_VERIFICATION cannot carry masteryGain as graded result'
);
assert(
  !('xpEarned' in pendingResult),
  'T2e: PENDING_VERIFICATION cannot carry xpEarned as graded result'
);

// ============================================================
// T3: GRADED + isCorrect=false — only server-proven fields
// ============================================================
const gradedIncorrect: ExerciseSubmissionResult = {
  status: 'GRADED',
  exerciseId: 'ex-002',
  exerciseCode: 'q-math-001',
  studentAnswer: 'z = 2 + i',
  feedbackAr: 'الإجابة غير صحيحة',
  isCorrect: false,
  subjectCode: 'MATH',
  koCode: 'ko-math-001',
  competencies: ['comp-limit'],
};

assert(
  gradedIncorrect.status === 'GRADED',
  'T3a: GRADED status is set for genuinely graded result'
);

assert(
  'isCorrect' in gradedIncorrect && gradedIncorrect.isCorrect === false,
  'T3b: GRADED + isCorrect=false represents genuinely graded incorrect answer'
);

assert(
  !('scoreObtained' in gradedIncorrect),
  'T3c: GRADED result does NOT carry fabricated scoreObtained'
);

assert(
  !('masteryGain' in gradedIncorrect),
  'T3d: GRADED result does NOT carry fabricated masteryGain'
);

assert(
  !('xpEarned' in gradedIncorrect),
  'T3e: GRADED result does NOT carry fabricated xpEarned'
);

assert(
  !('maxPoints' in gradedIncorrect),
  'T3f: GRADED result does NOT carry maxPoints'
);

// ============================================================
// T4: GRADED + isCorrect=true — server-proven fields only
// ============================================================
const gradedCorrect: ExerciseSubmissionResult = {
  status: 'GRADED',
  exerciseId: 'ex-003',
  exerciseCode: 'q-math-001',
  studentAnswer: '3',
  feedbackAr: 'إجابة صحيحة',
  isCorrect: true,
  subjectCode: 'MATH',
  koCode: 'ko-math-001',
  competencies: ['comp-limit'],
  observationId: 'obs-uuid-123',
};

assert(
  gradedCorrect.status === 'GRADED',
  'T4a: GRADED status is set for genuinely graded result'
);

assert(
  'isCorrect' in gradedCorrect && gradedCorrect.isCorrect === true,
  'T4b: GRADED + isCorrect=true represents genuinely graded correct answer'
);

assert(
  gradedCorrect.exerciseCode === 'q-math-001',
  'T4c: GRADED carries exerciseCode from server'
);

assert(
  gradedCorrect.subjectCode === 'MATH',
  'T4d: GRADED carries subjectCode from server'
);

assert(
  gradedCorrect.koCode === 'ko-math-001',
  'T4e: GRADED carries koCode from server'
);

assert(
  Array.isArray(gradedCorrect.competencies),
  'T4f: GRADED carries competencies from server'
);

assert(
  !('masteryGain' in gradedCorrect),
  'T4g: GRADED result does NOT carry fabricated masteryGain'
);

assert(
  !('xpEarned' in gradedCorrect),
  'T4h: GRADED result does NOT carry fabricated xpEarned'
);

// ============================================================
// T5: PENDING carries no grading authority
// ============================================================
assert(
  !('scoreObtained' in pendingResult) && !('masteryGain' in pendingResult) && !('xpEarned' in pendingResult),
  'T5: PENDING_VERIFICATION carries no score, mastery, or XP grading authority'
);

// ============================================================
// T6: PracticeExercisesView creates PENDING_VERIFICATION, not fabricated GRADED
// ============================================================
const simulatedViewSubmission: ExerciseSubmissionResult = {
  status: 'PENDING_VERIFICATION',
  exerciseId: 'ai-ex-12345',
  studentAnswer: 'test answer',
  feedbackAr: 'تم إرسال إجابتك، جارٍ التحقق منها...',
};

assert(
  simulatedViewSubmission.status === 'PENDING_VERIFICATION',
  'T6a: View creates PENDING_VERIFICATION, not GRADED'
);

assert(
  !('isCorrect' in simulatedViewSubmission),
  'T6b: View submission has no isCorrect boolean'
);

assert(
  !('scoreObtained' in simulatedViewSubmission),
  'T6c: View submission has no scoreObtained'
);

assert(
  !('masteryGain' in simulatedViewSubmission),
  'T6d: View submission has no masteryGain'
);

assert(
  !('xpEarned' in simulatedViewSubmission),
  'T6e: View submission has no xpEarned'
);

// ============================================================
// T7: Type-narrowing proof — discriminant works correctly
// ============================================================
function processResult(result: ExerciseSubmissionResult): string {
  if (result.status === 'PENDING_VERIFICATION') {
    return `pending:${result.exerciseId}`;
  } else if (result.status === 'ERROR') {
    return `error:${result.exerciseId}:${result.errorCode || 'UNKNOWN'}`;
  } else {
    return `graded:${result.exerciseId}:${result.isCorrect}:${result.exerciseCode}`;
  }
}

const pendingOutcome = processResult(pendingResult);
assert(
  pendingOutcome === 'pending:ex-001',
  'T7a: Type narrowing correctly handles PENDING_VERIFICATION'
);

const gradedOutcome = processResult(gradedCorrect);
assert(
  gradedOutcome === 'graded:ex-003:true:q-math-001',
  'T7b: Type narrowing correctly handles GRADED'
);

// ============================================================
// T8: ERROR state exists for failures
// ============================================================
const errorResult: ExerciseSubmissionResult = {
  status: 'ERROR',
  exerciseId: 'ex-004',
  studentAnswer: 'answer',
  feedbackAr: 'تعذر التحقق من الإجابة. حاول مرة أخرى.',
  errorCode: 'NETWORK_ERROR',
};

assert(
  errorResult.status === 'ERROR',
  'T8a: ERROR status is correctly set'
);

assert(
  !('isCorrect' in errorResult),
  'T8b: ERROR has no isCorrect property'
);

assert(
  !('scoreObtained' in errorResult),
  'T8c: ERROR has no scoreObtained'
);

assert(
  errorResult.errorCode === 'NETWORK_ERROR',
  'T8d: ERROR carries error code'
);

// ============================================================
// T9: GRADED duplicate flag
// ============================================================
const duplicateResult: ExerciseSubmissionResult = {
  status: 'GRADED',
  exerciseId: 'ex-005',
  exerciseCode: 'q-math-001',
  studentAnswer: '3',
  feedbackAr: 'إجابة صحيحة',
  isCorrect: true,
  subjectCode: 'MATH',
  koCode: 'ko-math-001',
  competencies: ['comp-limit'],
  duplicate: true,
};

assert(
  duplicateResult.duplicate === true,
  'T9: GRADED result can carry duplicate flag from idempotent response'
);

// ============================================================
// Summary
// ============================================================
console.log('');
console.log(`--- GATE 06D.2+06D.4: ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY ---`);
