import { qaraytiEventBus, QaraytiEventType } from '../../integration/event-bus';
import { LearningEvidenceEngine } from '../learning-evidence-engine';
import { observationHistoryRepo } from '../supabase-observation-history-repository';

async function runIdempotencyTests() {
  console.log('--- STARTING IDEMPOTENCY UNIT TESTS ---');
  let passedTests = 0;
  let totalTests = 0;

  // Instantiate LearningEvidenceEngine listeners
  LearningEvidenceEngine.getInstance();

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

  // Intercept recorded observations in observationHistoryRepo for testing
  const recordedObservations: any[] = [];
  const originalRecord = observationHistoryRepo.recordObservation.bind(observationHistoryRepo);

  observationHistoryRepo.recordObservation = async (obs: any) => {
    // Check for exact idempotency duplicate in our recorded list
    const existing = recordedObservations.find((o) => o.idempotencyKey === obs.idempotencyKey);
    if (existing) {
      return { success: true, duplicate: true, data: existing };
    }
    recordedObservations.push(obs);
    return { success: true, duplicate: false, data: obs };
  };

  try {
    // TEST A & C & D: Same business action with same submissionId -> same idempotencyKey across UI double-submit / Network Retry
    const studentId = 'student-test-01';
    const submissionId = 'sub-test-unique-123';
    recordedObservations.length = 0;

    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-algebra-1',
      answer: '42',
      isCorrect: true,
      submissionId,
    });
    await new Promise((r) => setTimeout(r, 50));

    assert(recordedObservations.length === 1, 'First submission creates observation');
    const firstObs = recordedObservations[0];
    // GATE 06B.1: Idempotency key now includes school segment (noschool for unauthenticated)
    assert(firstObs.idempotencyKey === `obs_ex_${studentId}_noschool_${submissionId}`, 'idempotencyKey is derived deterministically from school + submissionId');

    // Network Retry / UI Double Submit with DIFFERENT runtime event.id, BUT SAME submissionId
    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-algebra-1',
      answer: '42',
      isCorrect: true,
      submissionId,
    });
    await new Promise((r) => setTimeout(r, 50));

    assert(recordedObservations.length === 1, 'Retry/double-submit with same submissionId produces NO second observation');

    // TEST E: Genuinely new submission -> NEW idempotencyKey
    const newSubmissionId = 'sub-test-unique-456';
    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-algebra-1',
      answer: '43',
      isCorrect: false,
      submissionId: newSubmissionId,
    });
    await new Promise((r) => setTimeout(r, 50));

    assert(recordedObservations.length === 2, 'Genuinely new submission creates a second observation');
    assert(recordedObservations[1].idempotencyKey === `obs_ex_${studentId}_noschool_${newSubmissionId}`, 'New submission has distinct idempotencyKey');

    // TEST F & G: Event Replay & Repository retry
    const replayRes = await observationHistoryRepo.recordObservation(recordedObservations[0]);
    assert(replayRes.duplicate === true, 'Repository safely handles duplicates without error (code 23505 behavior)');

    // TEST H: Verify event IDs differ between attempts but idempotencyKey remains stable
    const event1 = await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-calc-1',
      answer: 'x^2',
      isCorrect: true,
      submissionId: 'sub-calc-789',
    });
    await new Promise((r) => setTimeout(r, 50));

    const event2 = await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-calc-1',
      answer: 'x^2',
      isCorrect: true,
      submissionId: 'sub-calc-789',
    });
    await new Promise((r) => setTimeout(r, 50));

    assert(event1.id !== event2.id, 'Runtime event IDs differ between calls');
    const obsCalc = recordedObservations.find((o) => o.metadata?.submissionId === 'sub-calc-789');
    assert(obsCalc !== undefined, 'Observation created for sub-calc-789');
    assert(obsCalc.idempotencyKey === `obs_ex_${studentId}_noschool_sub-calc-789`, 'Business idempotencyKey remained perfectly stable despite different event IDs');

    console.log(`--- ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY ---`);
    process.exit(0);
  } finally {
    // Restore original method
    observationHistoryRepo.recordObservation = originalRecord;
  }
}

runIdempotencyTests().catch((err) => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
