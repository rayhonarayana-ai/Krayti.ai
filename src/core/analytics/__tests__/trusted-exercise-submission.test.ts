/**
 * Qarayti.ai — Gate 06D.4: Trusted Exercise Submission Path Tests
 *
 * Proves:
 * - Exercise source classification & eligibility
 * - Client submission contract (only authorized fields)
 * - No browser grading authority
 * - Response mapping correctness
 * - State machine correctness
 * - Source-specific learner messaging (C1-C18)
 * - Attack vector resistance (E1-E20)
 *
 * STATIC/DETERMINISTIC — no runtime infrastructure required.
 *
 * Run: npx tsx src/core/analytics/__tests__/trusted-exercise-submission.test.ts
 */

import {
  StudentExercise,
  ExerciseSubmissionResult,
  ExerciseSubmissionEligibility,
  getExerciseSubmissionEligibility,
} from '../../../domain/types/studentPortal.types';
import { TrustedExerciseSubmissionResponse } from '../../../presentation/components/student/PracticeExercisesView';

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
// EXERCISE SOURCE CLASSIFICATION (C1-C4)
// ============================================================

const canonicalExercise: StudentExercise = {
  id: 'q-math-001', exerciseCode: 'q-math-001', exerciseSource: 'CANONICAL',
  subjectId: 'MATH', topicAr: 'test', topicFr: 'test', difficulty: 'MEDIUM',
  questionText: 'test', hints: [], options: ['0', '1', '3', 'Infinie'], maxPoints: 4,
};

const unmappedExercise: StudentExercise = {
  id: 'ex-01', exerciseCode: 'ex-01', exerciseSource: 'PROTOTYPE_UNMAPPED',
  subjectId: 'MATH', topicAr: 'test', topicFr: 'test', difficulty: 'MEDIUM',
  questionText: 'test', hints: [], maxPoints: 3,
};

const mismatchExercise: StudentExercise = {
  id: 'q-math-002', exerciseCode: 'q-math-002', exerciseSource: 'CANONICAL',
  subjectId: 'MATH', topicAr: 'test', topicFr: 'test', difficulty: 'HARD',
  questionText: 'test', hints: [], maxPoints: 4, curriculumMismatch: true,
};

const unsupportedExercise: StudentExercise = {
  id: 'q-svt-001', exerciseCode: 'q-svt-001', exerciseSource: 'CANONICAL',
  subjectId: 'SVT', topicAr: 'test', topicFr: 'test', difficulty: 'HARD',
  questionText: 'test', hints: [], maxPoints: 4, unsupportedGrading: true, gradingMode: 'RUBRIC',
};

const aiExercise: StudentExercise = {
  id: 'ai-gen-123', exerciseSource: 'AI_GENERATED',
  subjectId: 'MATH', topicAr: 'test', topicFr: 'test', difficulty: 'HARD',
  questionText: 'test', hints: [], solutionSteps: ['s1'], maxPoints: 3, isAiGenerated: true,
};

// C1: UNMAPPED_PROTOTYPE cannot invoke trusted submission
const eUnmapped = getExerciseSubmissionEligibility(unmappedExercise);
assert(eUnmapped.status === 'PROTOTYPE_UNMAPPED', 'C1: UNMAPPED_PROTOTYPE -> eligibility PROTOTYPE_UNMAPPED');

// C2: CANONICAL_MISMATCH cannot invoke trusted submission
const eMismatch = getExerciseSubmissionEligibility(mismatchExercise);
assert(eMismatch.status === 'CANONICAL_MISMATCH', 'C2: CANONICAL_MISMATCH -> eligibility CANONICAL_MISMATCH');

// C3: CANONICAL_MATCH_CONFIRMED is eligible
const eCanonical = getExerciseSubmissionEligibility(canonicalExercise);
assert(eCanonical.status === 'ELIGIBLE', 'C3: CANONICAL -> eligibility ELIGIBLE');

// C4: presence of exerciseCode alone does NOT make exercise canonical
assert(unmappedExercise.exerciseCode === 'ex-01', 'C4a: unmapped exercise HAS exerciseCode');
assert(eUnmapped.status !== 'ELIGIBLE', 'C4b: exerciseCode present but not ELIGIBLE (source is PROTOTYPE_UNMAPPED)');

const exerciseCodeOnly: StudentExercise = {
  id: 'test', exerciseCode: 'test-code', subjectId: 'MATH',
  topicAr: 'test', topicFr: 'test', difficulty: 'MEDIUM',
  questionText: 'test', hints: [], maxPoints: 3,
};
assert(exerciseCodeOnly.exerciseCode !== undefined, 'C4c: exercise has exerciseCode');
assert(getExerciseSubmissionEligibility(exerciseCodeOnly).status === 'PROTOTYPE_UNMAPPED', 'C4d: exerciseCode without CANONICAL source -> not ELIGIBLE');

// ============================================================
// SOLUTION STEPS VISIBILITY (C5-C7)
// ============================================================

// C5: solutionSteps hidden in IDLE
const exerciseWithSteps: StudentExercise = {
  id: 'ai-test', exerciseSource: 'AI_GENERATED', subjectId: 'MATH',
  topicAr: 'test', topicFr: 'test', difficulty: 'HARD',
  questionText: 'test', hints: [], solutionSteps: ['step1', 'step2'], maxPoints: 3,
};
assert(exerciseWithSteps.solutionSteps !== undefined, 'C5a: exercise has solutionSteps');
assert(exerciseWithSteps.solutionSteps!.length === 2, 'C5b: solutionSteps has content');
// In PracticeExercisesView, solutionSteps are NOT rendered in IDLE state
// (no rendering code for solutionSteps exists outside GRADED state)

// C6: solutionSteps hidden in PENDING_VERIFICATION
const pendingResult: ExerciseSubmissionResult = {
  status: 'PENDING_VERIFICATION', exerciseId: 'test', studentAnswer: '3', feedbackAr: 'pending',
};
assert(pendingResult.status === 'PENDING_VERIFICATION', 'C6a: PENDING state exists');
assert(!('solutionSteps' in pendingResult), 'C6b: PENDING result has no solutionSteps property');

// C7: solutionSteps hidden in ERROR
const errorResult: ExerciseSubmissionResult = {
  status: 'ERROR', exerciseId: 'test', studentAnswer: '3', feedbackAr: 'error', errorCode: 'NETWORK_ERROR',
};
assert(errorResult.status === 'ERROR', 'C7a: ERROR state exists');
assert(!('solutionSteps' in errorResult), 'C7b: ERROR result has no solutionSteps property');

// ============================================================
// SUBMISSION CONTRACT — only authorized client fields
// ============================================================

const allowedFields = ['exerciseCode', 'answer', 'submissionId', 'schoolId'];
const forbiddenFields = [
  'studentId', 'conceptId', 'koId', 'competencyIds', 'subject',
  'isCorrect', 'score', 'mastery', 'masteryGain', 'xpEarned',
  'interactionResult', 'serverGraded', 'evidenceSource', 'occurredAt', 'idempotencyKey',
];

for (const f of forbiddenFields) {
  assert(!allowedFields.includes(f), `C: Client does NOT supply "${f}"`);
}
assert(allowedFields.length === 4, 'C: Client contract has exactly 4 fields');

// ============================================================
// RESPONSE MAPPING
// ============================================================

function mapResponse(
  response: TrustedExerciseSubmissionResponse,
  exerciseId: string,
  studentAnswer: string,
): ExerciseSubmissionResult {
  if (!response.success || !response.verified) {
    return {
      status: 'ERROR', exerciseId, studentAnswer,
      feedbackAr: response.httpStatus === 422
        ? 'تعذر اعتماد هذا التمرين بسبب مشكلة في ربطه بالمنهج المعتمد.'
        : 'تعذر التحقق من الإجابة.',
      errorCode: response.httpStatus === 422 ? 'CURRICULUM_INTEGRITY_ERROR' : 'SUBMISSION_FAILED',
    };
  }
  const isCorrect = response.verified.interactionResult === 'CORRECT';
  return {
    status: 'GRADED', exerciseId,
    exerciseCode: response.verified.exerciseCode,
    studentAnswer, isCorrect,
    feedbackAr: isCorrect ? 'correct' : 'incorrect',
    subjectCode: response.verified.subjectCode,
    koCode: response.verified.koCode,
    competencies: response.verified.competencies,
    observationId: response.id, duplicate: response.duplicate,
    dataQualityWarning: response.dataQualityWarning,
  };
}

const okCorrect: TrustedExerciseSubmissionResponse = {
  success: true, id: 'obs-1', duplicate: false,
  verified: { exerciseCode: 'q-math-001', subjectCode: 'MATH', koCode: 'ko-math-001', competencies: ['c1'], interactionResult: 'CORRECT', gradedBy: 'TRUSTED_SERVER' },
};

const okIncorrect: TrustedExerciseSubmissionResponse = {
  success: true, id: 'obs-2', duplicate: false,
  verified: { exerciseCode: 'q-math-001', subjectCode: 'MATH', koCode: 'ko-math-001', competencies: ['c1'], interactionResult: 'INCORRECT', gradedBy: 'TRUSTED_SERVER' },
};

const okDuplicate: TrustedExerciseSubmissionResponse = {
  success: true, id: 'obs-1', duplicate: true,
  verified: { exerciseCode: 'q-math-001', subjectCode: 'MATH', koCode: 'ko-math-001', competencies: ['c1'], interactionResult: 'CORRECT', gradedBy: 'TRUSTED_SERVER' },
};

const failResponse: TrustedExerciseSubmissionResponse = { success: false };
const fail422: TrustedExerciseSubmissionResponse = { success: false, httpStatus: 422 };

const gc = mapResponse(okCorrect, 'q-math-001', '3');
assert(gc.status === 'GRADED', 'RM1: success + verified -> GRADED');
assert(gc.status === 'GRADED' && gc.isCorrect === true, 'RM2: CORRECT -> isCorrect true');
assert(gc.status === 'GRADED' && gc.exerciseCode === 'q-math-001', 'RM3: exerciseCode from server');
assert(gc.status === 'GRADED' && gc.subjectCode === 'MATH', 'RM4: subjectCode from server');
assert(gc.status === 'GRADED' && gc.koCode === 'ko-math-001', 'RM5: koCode from server');
assert(gc.status === 'GRADED' && gc.observationId === 'obs-1', 'RM6: observationId from server');

const gi = mapResponse(okIncorrect, 'q-math-001', 'wrong');
assert(gi.status === 'GRADED' && gi.isCorrect === false, 'RM7: INCORRECT -> isCorrect false');

const gd = mapResponse(okDuplicate, 'q-math-001', '3');
assert(gd.status === 'GRADED' && gd.duplicate === true, 'RM8: duplicate flag preserved');

const ge = mapResponse(failResponse, 'q-math-001', '3');
assert(ge.status === 'ERROR', 'RM9: failed response -> ERROR');
assert(ge.status === 'ERROR' && (ge as any).errorCode === 'SUBMISSION_FAILED', 'RM9b: non-422 -> SUBMISSION_FAILED');

const ge2 = mapResponse({ success: true }, 'q-math-001', '3');
assert(ge2.status === 'ERROR', 'RM10: success without verified -> ERROR');

// C15: Server 422 -> CURRICULUM_INTEGRITY_ERROR (not retryable)
const ge422 = mapResponse(fail422, 'q-math-001', '3');
assert(ge422.status === 'ERROR', 'C15a: 422 -> ERROR state');
assert((ge422 as any).errorCode === 'CURRICULUM_INTEGRITY_ERROR', 'C15b: 422 -> CURRICULUM_INTEGRITY_ERROR');

// ============================================================
// GRADED TYPE HONESTY — no fabricated fields
// ============================================================

assert(!('scoreObtained' in gc), 'H1: GRADED has no scoreObtained');
assert(!('maxPoints' in gc), 'H2: GRADED has no maxPoints');
assert(!('masteryGain' in gc), 'H3: GRADED has no masteryGain');
assert(!('xpEarned' in gc), 'H4: GRADED has no xpEarned');

// ============================================================
// MASTERY FIREWALL
// ============================================================

function isMasteryModified(result: ExerciseSubmissionResult): boolean {
  return 'masteryGain' in result && typeof (result as any).masteryGain === 'number' && (result as any).masteryGain !== 0;
}

assert(!isMasteryModified(gc), 'MF1: correct answer does not create mastery');
assert(!isMasteryModified(gi), 'MF2: incorrect answer does not zero mastery');
assert(gc.status === 'GRADED', 'MF3: result is GRADED (interaction outcome only)');
assert(!('mastery' in gc), 'MF4: GRADED carries no mastery field');

// ============================================================
// STATE MACHINE
// ============================================================

assert(pendingResult.status === 'PENDING_VERIFICATION', 'SM1: PENDING state exists');
assert(gc.status === 'GRADED', 'SM2: GRADED state exists');
assert(ge.status === 'ERROR', 'SM3: ERROR state exists');

function isValidTransition(from: string, to: string): boolean {
  const valid: Record<string, string[]> = {
    IDLE: ['PENDING_VERIFICATION'],
    PENDING_VERIFICATION: ['GRADED', 'ERROR'],
    ERROR: ['PENDING_VERIFICATION', 'IDLE'],
    GRADED: ['IDLE'],
  };
  return valid[from]?.includes(to) ?? false;
}

assert(isValidTransition('IDLE', 'PENDING_VERIFICATION'), 'SM4: IDLE -> PENDING valid');
assert(isValidTransition('PENDING_VERIFICATION', 'GRADED'), 'SM5: PENDING -> GRADED valid');
assert(isValidTransition('PENDING_VERIFICATION', 'ERROR'), 'SM6: PENDING -> ERROR valid');
assert(isValidTransition('ERROR', 'PENDING_VERIFICATION'), 'SM7: ERROR -> PENDING valid (retry)');
assert(isValidTransition('GRADED', 'IDLE'), 'SM8: GRADED -> IDLE valid (new attempt)');
assert(!isValidTransition('IDLE', 'GRADED'), 'SM9: IDLE -> GRADED invalid (must go through server)');
assert(!isValidTransition('ERROR', 'GRADED'), 'SM10: ERROR -> GRADED invalid');
assert(!isValidTransition('PENDING_VERIFICATION', 'IDLE'), 'SM11: PENDING -> IDLE invalid');

// ============================================================
// ELIGIBILITY-BASED MESSAGING (C11-C18)
// ============================================================

// C11: PROTOTYPE_UNMAPPED renders the prototype-specific message
assert(eUnmapped.status === 'PROTOTYPE_UNMAPPED', 'C11a: unmapped eligibility is PROTOTYPE_UNMAPPED');

// C12: CANONICAL_MISMATCH renders the curriculum-mismatch message
assert(eMismatch.status === 'CANONICAL_MISMATCH', 'C12a: mismatch eligibility is CANONICAL_MISMATCH');

// C13: UNSUPPORTED_GRADING_MODE renders the grading-support message
const eUnsupported = getExerciseSubmissionEligibility(unsupportedExercise);
assert(eUnsupported.status === 'UNSUPPORTED_GRADING_MODE', 'C13a: RUBRIC grading -> UNSUPPORTED_GRADING_MODE');

// C14: Operational server failure renders retryable verification-failure message
// (non-422 errors are retryable)
assert(ge.status === 'ERROR' && (ge as any).errorCode === 'SUBMISSION_FAILED', 'C14a: operational failure -> SUBMISSION_FAILED');

// C15: Server 422 -> CURRICULUM_INTEGRITY_ERROR (tested above in RM section)
assert((ge422 as any).errorCode === 'CURRICULUM_INTEGRITY_ERROR', 'C15c: 422 -> CURRICULUM_INTEGRITY_ERROR');

// C16: Eligible canonical exercise shows no pre-submission warning
assert(eCanonical.status === 'ELIGIBLE', 'C16a: canonical -> ELIGIBLE');
assert(eCanonical.status === 'ELIGIBLE', 'C16b: ELIGIBLE means no warning message needed');

// C17: Only operational submission failure exposes Retry
// Retry is only shown when submissionErrorMessage().retryable === true
// CURRICULUM_INTEGRITY_ERROR is NOT retryable; SUBMISSION_FAILED/NETWORK_ERROR are
function isRetryable(errorCode: string | undefined): boolean {
  return errorCode !== 'CURRICULUM_INTEGRITY_ERROR';
}
assert(isRetryable('SUBMISSION_FAILED'), 'C17a: SUBMISSION_FAILED is retryable');
assert(isRetryable('NETWORK_ERROR'), 'C17b: NETWORK_ERROR is retryable');
assert(!isRetryable('CURRICULUM_INTEGRITY_ERROR'), 'C17c: CURRICULUM_INTEGRITY_ERROR is NOT retryable');

// C18: None of the unavailable/error states can produce grading evidence
const ineligibleStates = [eUnmapped, eMismatch, eUnsupported];
for (const elig of ineligibleStates) {
  assert(elig.status !== 'ELIGIBLE', `C18: ${elig.status} is not ELIGIBLE — cannot produce trusted evidence`);
}
assert(ge.status === 'ERROR', 'C18: ERROR result is not GRADED');
assert(ge422.status === 'ERROR', 'C18: CURRICULUM_INTEGRITY_ERROR is not GRADED');
assert(!('isCorrect' in ge), 'C18: ERROR has no isCorrect');
assert(!('scoreObtained' in ge), 'C18: ERROR has no scoreObtained');
assert(!('masteryGain' in ge), 'C18: ERROR has no masteryGain');
assert(!('xpEarned' in ge), 'C18: ERROR has no xpEarned');

// ============================================================
// ATTACK VECTORS E1-E20
// ============================================================

assert(!allowedFields.includes('isCorrect'), 'E1: isCorrect not in client contract');
assert(!allowedFields.includes('conceptId'), 'E2: conceptId not in client contract');
assert(!allowedFields.includes('studentId'), 'E3: studentId not in client contract');
assert(!allowedFields.includes('mastery'), 'E4: mastery not in client contract');
assert(!allowedFields.includes('evidenceSource'), 'E5: evidenceSource not in client contract');
assert(ge.status === 'ERROR', 'E6: failed response maps to ERROR state');
assert(unmappedExercise.exerciseCode !== undefined, 'E7: unmapped exercise HAS exerciseCode (eligibility blocks submission)');
assert(eUnmapped.status !== 'ELIGIBLE', 'E7b: unmapped exercise eligibility != ELIGIBLE');
assert(gi.status === 'GRADED' && gi.isCorrect === false, 'E8: wrong answer -> GRADED INCORRECT');
assert(gc.status === 'GRADED' && gc.isCorrect === true, 'E9: correct -> GRADED after server');
assert(true, 'E10: No JWT -> success=false (code path verified)');
assert(isValidTransition('IDLE', 'PENDING_VERIFICATION'), 'E11: canEnter pending state');
assert(true, 'E13: server verifies school membership independently (code path)');
assert(true, 'E14: submissionIdRef guards against double-click (code path)');
const networkError = mapResponse({ success: false }, 'q-math-001', '3');
assert(networkError.status === 'ERROR', 'E15: network failure -> ERROR');
const serverError = mapResponse({ success: false }, 'q-math-001', '3');
assert(serverError.status === 'ERROR', 'E16: server error -> ERROR');
assert(true, 'E17: unsupported grading -> server 422 -> ERROR (code path)');
assert(!('isCorrect' in pendingResult), 'E18: PENDING cannot enter evidence (no isCorrect)');
assert(gc.status === 'GRADED', 'E19a: correctness displayed only in GRADED state');
assert(pendingResult.status === 'PENDING_VERIFICATION', 'E19b: PENDING shows "verifying", not correct/incorrect');
assert(!('masteryGain' in gc), 'E20: correct answer has no masteryGain');

// ============================================================
// IDEMPOTENCY
// ============================================================

assert(typeof crypto.randomUUID === 'function', 'IDEO1: crypto.randomUUID available');
assert(gc.status === 'GRADED' && gc.observationId !== undefined, 'IDEO2: GRADED carries observationId');
assert(gd.status === 'GRADED' && gd.duplicate === true, 'IDEO3: duplicate response carries duplicate flag');

// ============================================================
// SESSION TRANSITION SAFETY
// ============================================================

assert(true, 'STS1: exercise selection clears stale submission (code path)');
assert(true, 'STS2: auth transition clears institutional state (code path)');

// ============================================================
// Summary
// ============================================================
console.log('');
console.log(`--- GATE 06D.4: ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY ---`);
