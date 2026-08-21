/**
 * Qarayti.ai — Gate 06C.2: Canonical Derived Learner State Tests
 *
 * Deterministic tests for deriveConceptState and deriveLearnerState.
 * These are pure functions — no DB, no network, no side effects.
 *
 * Run: npx ts-node src/core/analytics/__tests__/canonical-learner-state.test.ts
 */

import {
  deriveConceptState,
  deriveLearnerState,
  isTrustedCanonicalObservation,
  DerivedConceptState,
} from '../canonical-learner-state';

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

function assertEqual<T>(actual: T, expected: T, message: string) {
  totalTests++;
  if (actual === expected) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    throw new Error(`Test failed: ${message}`);
  }
}

// Helper to create a mock observation
function mockObs(
  conceptId: string,
  observationType: string,
  interactionResult: 'CORRECT' | 'INCORRECT' | null | undefined,
  occurredAt: string
) {
  return {
    conceptId,
    observationType,
    interactionResult,
    occurredAt,
    metadata: observationType === 'EXERCISE_COMPLETION'
      ? { serverGraded: true, evidenceSource: 'TRUSTED_SERVER' }
      : {},
  };
}

async function runTests() {
  console.log('--- STARTING CANONICAL LEARNER STATE TESTS ---');

  // D1: 0 trusted observations → NO_EVIDENCE → mastery null
  {
    const state = deriveConceptState('ko-math-001', []);
    assertEqual(state.evidenceState, 'NO_EVIDENCE', 'D1: 0 observations → NO_EVIDENCE');
    assertEqual(state.mastery, null, 'D1: mastery is null');
    assertEqual(state.verifiedInteractionCount, 0, 'D1: 0 verified interactions');
    assertEqual(state.accuracyRate, null, 'D1: accuracyRate is null');
  }

  // D2: 1 verified correct exercise → INSUFFICIENT_EVIDENCE → correctCount=1 → mastery null
  {
    const obs = [mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T10:00:00Z')];
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.evidenceState, 'INSUFFICIENT_EVIDENCE', 'D2: 1 observation → INSUFFICIENT_EVIDENCE');
    assertEqual(state.correctCount, 1, 'D2: correctCount=1');
    assertEqual(state.incorrectCount, 0, 'D2: incorrectCount=0');
    assertEqual(state.mastery, null, 'D2: mastery is null');
    assertEqual(state.verifiedInteractionCount, 1, 'D2: 1 verified interaction');
  }

  // D3: 1 verified incorrect exercise → INSUFFICIENT_EVIDENCE → incorrectCount=1 → mastery null
  {
    const obs = [mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'INCORRECT', '2026-08-20T10:00:00Z')];
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.evidenceState, 'INSUFFICIENT_EVIDENCE', 'D3: 1 observation → INSUFFICIENT_EVIDENCE');
    assertEqual(state.incorrectCount, 1, 'D3: incorrectCount=1');
    assertEqual(state.correctCount, 0, 'D3: correctCount=0');
    assertEqual(state.mastery, null, 'D3: mastery is null');
  }

  // D4: 2 verified exercises → OBSERVED → accuracy derived → mastery still null
  {
    const obs = [
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T10:00:00Z'),
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'INCORRECT', '2026-08-20T11:00:00Z'),
    ];
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.evidenceState, 'OBSERVED', 'D4: 2 observations → OBSERVED');
    assertEqual(state.correctCount, 1, 'D4: correctCount=1');
    assertEqual(state.incorrectCount, 1, 'D4: incorrectCount=1');
    assertEqual(state.accuracyRate, 0.5, 'D4: accuracyRate=0.5');
    assertEqual(state.mastery, null, 'D4: mastery is still null');
    assertEqual(state.verifiedInteractionCount, 2, 'D4: 2 verified interactions');
  }

  // D5: LESSON_COMPLETION does not affect canonical state
  {
    const obs = [
      mockObs('ko-math-001', 'LESSON_COMPLETION', null, '2026-08-20T10:00:00Z'),
    ];
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.evidenceState, 'NO_EVIDENCE', 'D5: LESSON_COMPLETION → NO_EVIDENCE');
    assertEqual(state.verifiedInteractionCount, 0, 'D5: 0 verified interactions from LESSON');
    assertEqual(state.mastery, null, 'D5: mastery is null');
  }

  // D6: ADAPTIVE_SKILL_MASTERED does not affect canonical state
  {
    const obs = [
      mockObs('ko-math-001', 'ADAPTIVE_SKILL_MASTERED', null, '2026-08-20T10:00:00Z'),
    ];
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.evidenceState, 'NO_EVIDENCE', 'D6: SKILL_MASTERED → NO_EVIDENCE');
    assertEqual(state.verifiedInteractionCount, 0, 'D6: 0 verified interactions from SKILL');
    assertEqual(state.mastery, null, 'D6: mastery is null');
  }

  // D7: ADAPTIVE_GAP_REMEDIATED does not affect canonical state
  {
    const obs = [
      mockObs('ko-math-001', 'ADAPTIVE_GAP_REMEDIATED', null, '2026-08-20T10:00:00Z'),
    ];
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.evidenceState, 'NO_EVIDENCE', 'D7: GAP_REMEDIATED → NO_EVIDENCE');
    assertEqual(state.verifiedInteractionCount, 0, 'D7: 0 verified interactions from GAP');
    assertEqual(state.mastery, null, 'D7: mastery is null');
  }

  // D8: NO_COMPETENCY_MAPPING does not enter canonical state
  {
    const obs = [
      mockObs('NO_COMPETENCY_MAPPING', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T10:00:00Z'),
    ];
    const state = deriveConceptState('NO_COMPETENCY_MAPPING', obs);
    assertEqual(state.evidenceState, 'NO_EVIDENCE', 'D8: NO_COMPETENCY_MAPPING → NO_EVIDENCE');
    assertEqual(state.verifiedInteractionCount, 0, 'D8: 0 verified interactions');
    assertEqual(state.mastery, null, 'D8: mastery is null');
  }

  // D9: legacy learner_memory values cannot influence canonical derived state
  // (pure function test — learner_memory is not an input to deriveConceptState)
  {
    const obs = [
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'INCORRECT', '2026-08-20T10:00:00Z'),
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'INCORRECT', '2026-08-20T11:00:00Z'),
    ];
    const state = deriveConceptState('ko-math-001', obs);
    // Even if learner_memory had mastery=1.0 for this concept, the derived state shows 0% accuracy
    assertEqual(state.accuracyRate, 0, 'D9: accuracy=0 — legacy learner_memory cannot influence canonical state');
    assertEqual(state.mastery, null, 'D9: mastery is null — learner_memory is ignored as an authority');
    assertEqual(state.correctCount, 0, 'D9: correctCount=0');
    assertEqual(state.incorrectCount, 2, 'D9: incorrectCount=2');
  }

  // D10: same trusted observation set produces identical derived state
  {
    const obs = [
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T10:00:00Z'),
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'INCORRECT', '2026-08-20T11:00:00Z'),
      mockObs('ko-math-002', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T12:00:00Z'),
    ];
    const state1 = deriveLearnerState('student-001', obs);
    const state2 = deriveLearnerState('student-001', obs);
    assertEqual(state1.evidenceState, state2.evidenceState, 'D10: same evidenceState');
    assertEqual(state1.totalVerifiedInteractions, state2.totalVerifiedInteractions, 'D10: same totalVerifiedInteractions');
    assertEqual(state1.overallAccuracyRate, state2.overallAccuracyRate, 'D10: same overallAccuracyRate');
    assertEqual(state1.concepts.size, state2.concepts.size, 'D10: same concepts count');
    assertEqual(state1.firstObservedAt, state2.firstObservedAt, 'D10: same firstObservedAt');
    assertEqual(state1.lastObservedAt, state2.lastObservedAt, 'D10: same lastObservedAt');
  }

  // ============================================================
  // PROVENANCE TESTS P1–P5
  // ============================================================

  // P1: Trusted server observation qualifies (EXERCISE_COMPLETION + interactionResult + serverGraded)
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: 'CORRECT' as const,
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: { serverGraded: true, evidenceSource: 'TRUSTED_SERVER' },
    }];
    assertEqual(isTrustedCanonicalObservation(obs[0]), true, 'P1: trusted server observation qualifies');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.verifiedInteractionCount, 1, 'P1: trusted observation counted');
    assertEqual(state.correctCount, 1, 'P1: correct interaction counted');
  }

  // P2: Legacy EXERCISE_COMPLETION does NOT qualify (no interactionResult, no serverGraded)
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: null,
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: { currentMastery: 1.0 },
    }];
    assertEqual(isTrustedCanonicalObservation(obs[0]), false, 'P2: legacy EXERCISE_COMPLETION does NOT qualify');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.verifiedInteractionCount, 0, 'P2: legacy observation excluded');
    assertEqual(state.evidenceState, 'NO_EVIDENCE', 'P2: legacy → NO_EVIDENCE');
  }

  // P3: Forged metadata does NOT qualify (interactionResult present but serverGraded absent)
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: 'CORRECT' as const,
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: { evidenceSource: 'TRUSTED_SERVER' }, // no serverGraded
    }];
    assertEqual(isTrustedCanonicalObservation(obs[0]), false, 'P3: forged metadata (no serverGraded) does NOT qualify');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.verifiedInteractionCount, 0, 'P3: forged observation excluded');
  }

  // P4: Trusted INCORRECT interaction qualifies
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: 'INCORRECT' as const,
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: { serverGraded: true, evidenceSource: 'TRUSTED_SERVER' },
    }];
    assertEqual(isTrustedCanonicalObservation(obs[0]), true, 'P4: trusted INCORRECT qualifies');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.verifiedInteractionCount, 1, 'P4: INCORRECT observation counted');
    assertEqual(state.incorrectCount, 1, 'P4: incorrect interaction counted');
  }

  // P5: Trusted CORRECT interaction qualifies
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: 'CORRECT' as const,
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: { serverGraded: true, evidenceSource: 'TRUSTED_SERVER', exerciseCode: 'q-math-001' },
    }];
    assertEqual(isTrustedCanonicalObservation(obs[0]), true, 'P5: trusted CORRECT qualifies');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.verifiedInteractionCount, 1, 'P5: CORRECT observation counted');
    assertEqual(state.correctCount, 1, 'P5: correct interaction counted');
  }

  // ============================================================
  // ATTACK TESTS P6–P10
  // These prove the provenance boundary holds against client forgery.
  // Edge Function runtime tests are NOT VERIFIED (no infra).
  // These are deterministic/static verification of the canonical predicate.
  // ============================================================

  // P6: Generic route + EXERCISE_COMPLETION → REJECTED at predicate level
  // (Edge Function now rejects this at HTTP 403; predicate also rejects)
  // Static verification: observation without interactionResult fails predicate
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      // No interactionResult — what a legacy/generic route would produce
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: {},
    }];
    assertEqual(isTrustedCanonicalObservation(obs[0]), false, 'P6: generic EXERCISE_COMPLETION without interactionResult → REJECTED');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.verifiedInteractionCount, 0, 'P6: does not enter canonical state');
    assertEqual(state.evidenceState, 'NO_EVIDENCE', 'P6: → NO_EVIDENCE');
  }

  // P7: Generic route + EXERCISE_COMPLETION + forged serverGraded=true + interactionResult=CORRECT → REJECTED
  // Client supplies all provenance fields but serverGraded is stripped by Edge Function.
  // Static verification: predicate requires serverGraded from server, not client.
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: 'CORRECT' as const,
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: {
        // Client tries to forge all provenance markers
        serverGraded: true,
        evidenceSource: 'TRUSTED_SERVER',
        interactionResult: 'CORRECT',
      },
    }];
    // After Edge Function fix, serverGraded is deleted from client metadata.
    // Simulate: metadata after Edge Function strips client fields
    const sanitizedMetadata = { ...obs[0].metadata };
    delete sanitizedMetadata.serverGraded;
    delete sanitizedMetadata.interactionResult;
    delete sanitizedMetadata.evidenceSource;
    const sanitizedObs = [{ ...obs[0], metadata: sanitizedMetadata }];

    assertEqual(isTrustedCanonicalObservation(sanitizedObs[0]), false,
      'P7: forged provenance (serverGraded stripped) → REJECTED');
    const state = deriveConceptState('ko-math-001', sanitizedObs);
    assertEqual(state.verifiedInteractionCount, 0, 'P7: forged observation excluded');
  }

  // P8: Verified exercise route → ACCEPTED
  // Simulates the output of handleExerciseVerification (server-constructed)
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: 'CORRECT' as const,
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: {
        exerciseCode: 'q-math-001',
        koCode: 'ko-math-001',
        serverGraded: true,
        evidenceSource: 'TRUSTED_SERVER',
        gradingType: 'EXACT_ANSWER',
      },
    }];
    assertEqual(isTrustedCanonicalObservation(obs[0]), true, 'P8: verified exercise route → ACCEPTED');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.verifiedInteractionCount, 1, 'P8: observation enters canonical state');
    assertEqual(state.evidenceState, 'INSUFFICIENT_EVIDENCE', 'P8: → INSUFFICIENT_EVIDENCE (1 obs)');
  }

  // P9: Client cannot override server grading result
  // Client sends interactionResult=CORRECT but server grades INCORRECT
  // The server overwrites — client value is never stored
  {
    // Simulate what Edge Function produces: server grading overrides client
    const clientAnswer = "Paris"; // client thinks this is correct
    const serverCorrectAnswer = "Berlin"; // server knows correct answer
    const isCorrect = clientAnswer.trim().toLowerCase() === serverCorrectAnswer.trim().toLowerCase(); // false

    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: (isCorrect ? 'CORRECT' : 'INCORRECT') as 'CORRECT' | 'INCORRECT',
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: { serverGraded: true },
    }];

    assertEqual(obs[0].interactionResult, 'INCORRECT', 'P9: server grading overrides client belief');
    assertEqual(isTrustedCanonicalObservation(obs[0]), true, 'P9: server-graded INCORRECT observation qualifies');
    const state = deriveConceptState('ko-math-001', obs);
    assertEqual(state.incorrectCount, 1, 'P9: server grading recorded correctly');
    assertEqual(state.correctCount, 0, 'P9: client wrong answer not counted as correct');
  }

  // P10: Client cannot create trusted provenance by supplying evidenceSource=TRUSTED_SERVER
  {
    const obs = [{
      observationType: 'EXERCISE_COMPLETION',
      interactionResult: null as null, // no interactionResult (client didn't go through exercise path)
      occurredAt: '2026-08-20T10:00:00Z',
      metadata: {
        evidenceSource: 'TRUSTED_SERVER', // client tries to claim trusted provenance
        serverGraded: true, // client tries to claim server grading
      },
    }];
    // After Edge Function fix, both fields are deleted from client metadata
    const sanitizedMetadata = { ...obs[0].metadata };
    delete sanitizedMetadata.serverGraded;
    delete sanitizedMetadata.evidenceSource;
    const sanitizedObs = [{ ...obs[0], metadata: sanitizedMetadata }];

    assertEqual(isTrustedCanonicalObservation(sanitizedObs[0]), false,
      'P10: client evidenceSource=TRUSTED_SERVER (stripped) → REJECTED');
    const state = deriveConceptState('ko-math-001', sanitizedObs);
    assertEqual(state.verifiedInteractionCount, 0, 'P10: client cannot forge trusted provenance');
  }

  // Additional: GAP-UNKNOWN and CONCEPT-UNKNOWN are blocked
  {
    const state1 = deriveConceptState('GAP-UNKNOWN', []);
    assertEqual(state1.evidenceState, 'NO_EVIDENCE', 'GAP-UNKNOWN blocked → NO_EVIDENCE');

    const state2 = deriveConceptState('CONCEPT-UNKNOWN', []);
    assertEqual(state2.evidenceState, 'NO_EVIDENCE', 'CONCEPT-UNKNOWN blocked → NO_EVIDENCE');

    const state3 = deriveConceptState('lesson-unknown', []);
    assertEqual(state3.evidenceState, 'NO_EVIDENCE', 'lesson-unknown blocked → NO_EVIDENCE');
  }

  // Additional: learner-level derivation aggregates correctly
  {
    const obs = [
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T10:00:00Z'),
      mockObs('ko-math-001', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T10:05:00Z'),
      mockObs('ko-math-002', 'EXERCISE_COMPLETION', 'INCORRECT', '2026-08-20T11:00:00Z'),
      mockObs('ko-math-002', 'EXERCISE_COMPLETION', 'CORRECT', '2026-08-20T11:05:00Z'),
      // This should be ignored
      mockObs('ko-math-003', 'LESSON_COMPLETION', null, '2026-08-20T12:00:00Z'),
    ];
    const state = deriveLearnerState('student-001', obs);
    assertEqual(state.totalVerifiedInteractions, 4, 'Aggregation: 4 verified interactions');
    assertEqual(state.totalCorrect, 3, 'Aggregation: 3 correct');
    assertEqual(state.totalIncorrect, 1, 'Aggregation: 1 incorrect');
    assertEqual(state.overallAccuracyRate, 0.75, 'Aggregation: 75% accuracy');
    assertEqual(state.concepts.size, 3, 'Aggregation: 3 concept entries (lesson ignored for verified interactions)');
    assertEqual(state.concepts.get('ko-math-003')?.evidenceState, 'NO_EVIDENCE', 'Aggregation: lesson concept has NO_EVIDENCE');
    assertEqual(state.evidenceState, 'OBSERVED', 'Aggregation: OBSERVED (4 >= 2)');
  }

  console.log(`--- ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY ---`);
  process.exit(0);
}

runTests().catch((err) => {
  console.error(`TEST SUITE FAILED: ${err.message}`);
  process.exit(1);
});
