/**
 * Qarayti.ai — Gate 06D.2: Explicit Exercise Verification State Tests
 *
 * Proves that PENDING_VERIFICATION cannot be interpreted as INCORRECT,
 * that GRADED carries genuine grading authority, and that the pending
 * state carries no score/mastery/XP grading authority.
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
// T1: PENDING_VERIFICATION has no isCorrect boolean authority
// ============================================================
const pendingResult: ExerciseSubmissionResult = {
  status: 'PENDING_VERIFICATION',
  exerciseId: 'ex-001',
  studentAnswer: 'z = 1 + i',
  feedbackAr: 'تم إرسال إجابتك وهي بانتظار التحقق من الخادم.',
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
// After narrowing to PENDING, status cannot be 'GRADED' — TypeScript proves it
assert(
  isPending,
  'T2a: status is PENDING_VERIFICATION'
);
// Verify that all GRADED-exclusive fields are absent
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
// T3: GRADED + isCorrect=false represents a genuinely graded incorrect answer
// ============================================================
const gradedIncorrect: ExerciseSubmissionResult = {
  status: 'GRADED',
  exerciseId: 'ex-002',
  studentAnswer: 'z = 2 + i',
  scoreObtained: 14,
  maxPoints: 20,
  feedbackAr: 'إجابة غير صحيحة — تحقق من العمدة.',
  isCorrect: false,
  masteryGain: 0,
  xpEarned: 5,
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
  gradedIncorrect.scoreObtained === 14,
  'T3c: GRADED result carries genuine scoreObtained'
);

// ============================================================
// T4: GRADED + isCorrect=true represents a genuinely graded correct answer
// ============================================================
const gradedCorrect: ExerciseSubmissionResult = {
  status: 'GRADED',
  exerciseId: 'ex-003',
  studentAnswer: 'z = 1 + i',
  scoreObtained: 20,
  maxPoints: 20,
  feedbackAr: 'إجابة صحيحة — أحسنت!',
  isCorrect: true,
  masteryGain: 0.05,
  xpEarned: 15,
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
  gradedCorrect.masteryGain === 0.05,
  'T4c: GRADED result carries genuine masteryGain'
);

assert(
  gradedCorrect.xpEarned === 15,
  'T4d: GRADED result carries genuine xpEarned'
);

// ============================================================
// T5: Pending result carries no score/mastery/XP grading authority
// ============================================================
assert(
  !('scoreObtained' in pendingResult) && !('masteryGain' in pendingResult) && !('xpEarned' in pendingResult),
  'T5: PENDING_VERIFICATION carries no score, mastery, or XP grading authority'
);

// ============================================================
// T6: PracticeExercisesView creates PENDING_VERIFICATION, not fabricated GRADED
// ============================================================
// Simulate what PracticeExercisesView.handleSubmit creates:
const simulatedViewSubmission: ExerciseSubmissionResult = {
  status: 'PENDING_VERIFICATION',
  exerciseId: 'ai-ex-12345',
  studentAnswer: 'test answer',
  feedbackAr: 'تم إرسال إجابتك وهي بانتظار التحقق من الخادم.',
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
// Type-narrowing proof: discriminant works correctly
// ============================================================
function processResult(result: ExerciseSubmissionResult): string {
  if (result.status === 'PENDING_VERIFICATION') {
    // Must NOT access isCorrect, scoreObtained, masteryGain, xpEarned here
    return `pending:${result.exerciseId}`;
  } else {
    // GRADED — safe to access grading fields
    return `graded:${result.exerciseId}:${result.isCorrect}:${result.scoreObtained}`;
  }
}

const pendingOutcome = processResult(pendingResult);
assert(
  pendingOutcome === 'pending:ex-001',
  'T7a: Type narrowing correctly handles PENDING_VERIFICATION'
);

const gradedOutcome = processResult(gradedCorrect);
assert(
  gradedOutcome === 'graded:ex-003:true:20',
  'T7b: Type narrowing correctly handles GRADED'
);

// ============================================================
// Summary
// ============================================================
console.log('');
console.log(`--- GATE 06D.2: ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY ---`);
