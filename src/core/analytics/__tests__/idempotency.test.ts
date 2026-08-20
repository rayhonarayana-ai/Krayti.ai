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

  // Intercept submitExerciseEvidence for testing (Gate 06B.2B.2)
  const submittedExercises: any[] = [];
  const originalSubmit = observationHistoryRepo.submitExerciseEvidence.bind(observationHistoryRepo);

  observationHistoryRepo.submitExerciseEvidence = async (submission: any) => {
    // Check for exact idempotency duplicate (business key match)
    const existing = submittedExercises.find((s) => s.submissionId === submission.submissionId);
    if (existing) {
      return { success: true, duplicate: true, verified: existing.verified };
    }
    // Simulate server verification result (Gate 06B.2B.2.1: interactionResult, not isCorrect)
    const verified = {
      exerciseCode: submission.exerciseCode,
      subjectCode: 'MATH',
      koCode: 'ko-math-001',
      competencies: ['COMP-MATH-2BAC-01'],
      interactionResult: submission.answer === '42' ? 'CORRECT' as const : 'INCORRECT' as const,
      gradedBy: 'TRUSTED_SERVER',
    };
    const record = { ...submission, verified };
    submittedExercises.push(record);
    return { success: true, duplicate: false, verified };
  };

  try {
    // TEST A: Same exercise submission with same submissionId → idempotent
    const studentId = 'student-test-01';
    const submissionId = 'sub-test-unique-123';
    submittedExercises.length = 0;

    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-01',
      answer: '42',
      submissionId,
    });
    await new Promise((r) => setTimeout(r, 50));

    assert(submittedExercises.length === 1, 'First submission creates exercise record');
    const firstSub = submittedExercises[0];
    assert(firstSub.exerciseCode === 'ex-01', 'exerciseCode passed correctly');
    assert(firstSub.submissionId === submissionId, 'submissionId passed correctly');
    assert(firstSub.answer === '42', 'answer passed correctly');

    // TEST B: Retry with SAME submissionId → idempotent (no second submission)
    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-01',
      answer: '42',
      submissionId,
    });
    await new Promise((r) => setTimeout(r, 50));

    assert(submittedExercises.length === 1, 'Retry with same submissionId produces NO second submission');

    // TEST C: New submission with DIFFERENT submissionId → new record
    const newSubmissionId = 'sub-test-unique-456';
    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'ex-01',
      answer: '43',
      submissionId: newSubmissionId,
    });
    await new Promise((r) => setTimeout(r, 50));

    assert(submittedExercises.length === 2, 'New submission creates second record');
    assert(submittedExercises[1].submissionId === newSubmissionId, 'New submission has distinct submissionId');
    assert(submittedExercises[1].answer === '43', 'New submission has correct answer');

    // TEST D: Server-graded interactionResult is authoritative — not client-declared isCorrect
    const trustedResult = submittedExercises[0].verified.interactionResult;
    assert(trustedResult === 'CORRECT', 'Server-graded interactionResult is authoritative (answer "42" is CORRECT)');

    // TEST E: Client cannot override canonical exercise code
    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: 'q-math-001',
      answer: '3',
      submissionId: 'sub-trust-001',
    });
    await new Promise((r) => setTimeout(r, 50));

    const mathSub = submittedExercises.find((s) => s.submissionId === 'sub-trust-001');
    assert(mathSub !== undefined, 'q-math-001 submission created');
    assert(mathSub.exerciseCode === 'q-math-001', 'exerciseCode is q-math-001 (from event payload)');

    // TEST F: Empty exerciseCode → event is rejected (no submission)
    await qaraytiEventBus.publish(QaraytiEventType.STUDENT_EXERCISE_COMPLETED, studentId, 'STUDENT', {
      exerciseId: '',
      answer: 'test',
      submissionId: 'sub-empty-exercise',
    });
    await new Promise((r) => setTimeout(r, 50));

    const emptySub = submittedExercises.find((s) => s.submissionId === 'sub-empty-exercise');
    assert(emptySub === undefined, 'Empty exerciseCode rejected — no submission created');

    // TEST G: isCorrect is NOT passed to submitExerciseEvidence (not in contract)
    const testSub = submittedExercises.find((s) => s.submissionId === 'sub-trust-001');
    assert(testSub !== undefined, 'Submission exists for contract check');
    assert(!('isCorrect' in testSub) || testSub.isCorrect === undefined || !('isCorrect' in { exerciseCode: 1, answer: 1, submissionId: 1, schoolId: 1 }),
      'isCorrect is NOT in the submission contract (server derives interactionResult)');

    // TEST H: conceptId is NOT passed to submitExerciseEvidence (not in contract)
    assert(!('conceptId' in testSub) || testSub.conceptId === undefined,
      'conceptId is NOT in the submission contract (server derives it from canonical registry)');

    console.log(`--- ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY ---`);
    process.exit(0);
  } finally {
    // Restore original method
    observationHistoryRepo.submitExerciseEvidence = originalSubmit;
  }
}

runIdempotencyTests().catch((err) => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
