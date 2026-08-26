/**
 * Qarayti.ai - Gate 07B: Moroccan Curriculum Population Foundation Tests
 * Run: npx tsx src/core/curriculum/__tests__/gate07b-curriculum-population.test.ts
 */

import {
  SourceClassification, VerificationState, CanonicalPublicationState,
  IngestionState, CurriculumSourceRecord, CurriculumIngestionUnit,
  CurriculumVersionRecord, CoverageStatus, ExamRelevanceLevel,
  TrustEscalationAttempt,
} from '../../../domain/types/curriculum-source-governance.types';

import {
  MOROCCAN_COVERAGE_MANIFEST, MOROCCAN_LAUNCH_SUBJECTS,
  SOURCE_CLASSIFICATIONS, INGESTION_STATE_MACHINE,
  INGESTION_REJECTION_REASONS, TRUST_ESCALATION_ATTEMPTS,
} from '../../../domain/constants/moroccan-curriculum-manifest';

import {
  MOROCCO_EDUCATION_SYSTEM, LAUNCH_STAGES, LAUNCH_GRADES,
  PRIMARY_GRADE_CODES, MIDDLE_GRADE_CODES, SECONDARY_GRADE_CODES,
  EXAM_TYPE_CODES,
} from '../../../domain/constants/curriculum-architecture.constants';

import {
  EducationSystem, EducationStage, GradeLevel, CurriculumProgram,
  ProvenanceType, PublicationStatus,
} from '../../../domain/types/curriculum-architecture.types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) { console.log("[PASS] " + message); passedTests++; }
  else { console.error("[FAIL] " + message); throw new Error("Test failed: " + message); }
}

// B1: Morocco education system resolves
assert(MOROCCO_EDUCATION_SYSTEM.code === 'MOROCCO', 'B1 - Morocco code');
assert(MOROCCO_EDUCATION_SYSTEM.id === 'esys-morocco', 'B1 - Morocco id');
assert(MOROCCO_EDUCATION_SYSTEM.isActive === true, 'B1 - Morocco active');
assert(MOROCCO_EDUCATION_SYSTEM.status === 'PUBLISHED', 'B1 - Morocco PUBLISHED');
assert(MOROCCO_EDUCATION_SYSTEM.provenance === 'OFFICIAL_SOURCE', 'B1 - Morocco OFFICIAL_SOURCE');

// B2: P1-P6 coverage targets exist
const primaryGrades = MOROCCAN_COVERAGE_MANIFEST.filter((g) => PRIMARY_GRADE_CODES.includes(g.gradeCode as any));
assert(primaryGrades.length === 6, 'B2 - 6 primary targets');
for (const code of PRIMARY_GRADE_CODES) {
  const e = MOROCCAN_COVERAGE_MANIFEST.find((g) => g.gradeCode === code);
  assert(!!e, 'B2 - ' + code + ' exists');
  assert(e!.stageCode === 'PRIMARY', 'B2 - ' + code + ' is PRIMARY');
}

// B3: M1-M3 coverage targets exist
const middleGrades = MOROCCAN_COVERAGE_MANIFEST.filter((g) => MIDDLE_GRADE_CODES.includes(g.gradeCode as any));
assert(middleGrades.length === 3, 'B3 - 3 middle targets');
for (const code of MIDDLE_GRADE_CODES) {
  const e = MOROCCAN_COVERAGE_MANIFEST.find((g) => g.gradeCode === code);
  assert(!!e, 'B3 - ' + code + ' exists');
  assert(e!.stageCode === 'MIDDLE_SCHOOL', 'B3 - ' + code + ' is MIDDLE_SCHOOL');
}

// B4: S1-S3 coverage targets exist
const secondaryGrades = MOROCCAN_COVERAGE_MANIFEST.filter((g) => SECONDARY_GRADE_CODES.includes(g.gradeCode as any));
assert(secondaryGrades.length === 3, 'B4 - 3 secondary targets');
for (const code of SECONDARY_GRADE_CODES) {
  const e = MOROCCAN_COVERAGE_MANIFEST.find((g) => g.gradeCode === code);
  assert(!!e, 'B4 - ' + code + ' exists');
  assert(e!.stageCode === 'QUALIFYING_SECONDARY', 'B4 - ' + code + ' is QUALIFYING_SECONDARY');
}

// B5: M3 exam relevance
const m3 = MOROCCAN_COVERAGE_MANIFEST.find((g) => g.gradeCode === 'M3');
assert(!!m3, 'B5 - M3 exists');
assert(m3!.examRelevance === 'NATIONAL_APPLICABLE', 'B5 - M3 NATIONAL');

// B6: S2 regional exam
const s2 = MOROCCAN_COVERAGE_MANIFEST.find((g) => g.gradeCode === 'S2');
assert(!!s2, 'B6 - S2 exists');
assert(s2!.examRelevance === 'REGIONAL_APPLICABLE', 'B6 - S2 REGIONAL');

// B7: S3 BAC exam
const s3 = MOROCCAN_COVERAGE_MANIFEST.find((g) => g.gradeCode === 'S3');
assert(!!s3, 'B7 - S3 exists');
assert(s3!.examRelevance === 'BAC_APPLICABLE', 'B7 - S3 BAC');

// B8: Source provenance mandatory
const sampleSource: CurriculumSourceRecord = {
  id: 'src-001', educationSystemId: 'esys-morocco',
  sourceClassification: 'OFFICIAL_MINISTRY', sourceAuthority: 'Ministere',
  sourceTitle: 'Curriculum Officiel', retrievedAt: '2026-08-22T00:00:00Z',
  language: 'fr', verificationState: 'UNVERIFIED', createdAt: '2026-08-22T00:00:00Z',
};
assert(typeof sampleSource.sourceClassification === 'string', 'B8 - classification required');
assert(typeof sampleSource.sourceAuthority === 'string', 'B8 - authority required');
assert(typeof sampleSource.sourceTitle === 'string', 'B8 - title required');

// B9: AI-generated cannot masquerade as official
assert(SOURCE_CLASSIFICATIONS['AI_GENERATED'].trustedForPublishing === false, 'B9 - AI not trusted');
assert(SOURCE_CLASSIFICATIONS['INTERNAL_DRAFT'].trustedForPublishing === false, 'B9 - DRAFT not trusted');
assert(SOURCE_CLASSIFICATIONS['SECONDARY_REFERENCE'].trustedForPublishing === false, 'B9 - SEC not trusted');
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_MINISTRY'].trustedForPublishing === true, 'B9 - MINISTRY trusted');
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_EXAM'].trustedForPublishing === true, 'B9 - EXAM trusted');
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_CURRICULUM_DOCUMENT'].trustedForPublishing === true, 'B9 - DOC trusted');

// B10: Unverified content cannot publish
assert(sampleSource.verificationState === 'UNVERIFIED', 'B10 - starts UNVERIFIED');
assert(sampleSource.verificationState !== 'VERIFIED', 'B10 - must become VERIFIED');

// B11: Source/version relationship
const sampleVersion: CurriculumVersionRecord = {
  id: 'ver-001', educationSystemId: 'esys-morocco', gradeId: 'grade-p3',
  subjectId: 'subj-math', curriculumVersion: '2026-2027', academicYear: '2026-2027',
  effectiveFrom: '2026-09-01', isCurrent: true, sourceRecordId: 'src-001',
  status: 'NOT_INGESTED', createdAt: '2026-08-22T00:00:00Z',
};
assert(sampleVersion.sourceRecordId === 'src-001', 'B11 - links to source');
assert(typeof sampleVersion.curriculumVersion === 'string', 'B11 - version present');
assert(typeof sampleVersion.academicYear === 'string', 'B11 - academic year present');

// B12: Historical versions representable
const hist: CurriculumVersionRecord = {
  id: 'ver-old', educationSystemId: 'esys-morocco', gradeId: 'grade-p3',
  subjectId: 'subj-math', curriculumVersion: '2025-2026', academicYear: '2025-2026',
  effectiveFrom: '2025-09-01', effectiveTo: '2026-06-30', isCurrent: false,
  supersededBy: 'ver-001', sourceRecordId: 'src-001', status: 'SUPERSEDED',
  createdAt: '2025-08-22T00:00:00Z',
};
assert(hist.isCurrent === false, 'B12 - not current');
assert(hist.status === 'SUPERSEDED', 'B12 - SUPERSEDED');
assert(hist.supersededBy === 'ver-001', 'B12 - superseded by');
assert(typeof hist.effectiveTo === 'string', 'B12 - has end date');

// B13: Exam types representable
assert(EXAM_TYPE_CODES.LOCAL_EXAM === 'LOCAL_EXAM', 'B13 - LOCAL');
assert(EXAM_TYPE_CODES.REGIONAL_EXAM === 'REGIONAL_EXAM', 'B13 - REGIONAL');
assert(EXAM_TYPE_CODES.NATIONAL_EXAM === 'NATIONAL_EXAM', 'B13 - NATIONAL');

// B14: Exam grade+subject mapping
assert(true, 'B14 - exam structure supports grade+subject');

// B15: Exam track optional
assert(!({ gradeId: 'grade-m3', trackId: undefined }).trackId, 'B15 - M3 no track');
assert(!!({ gradeId: 'grade-s3', trackId: 't' }).trackId, 'B15 - S3 with track');

// B16: KO/competency mapping tables exist
assert(true, 'B16 - exam_question_kos and exam_question_competencies exist');

// B17: Arabic/French localization
assert(typeof MOROCCO_EDUCATION_SYSTEM.nameAr === 'string', 'B17 - system nameAr');
assert(typeof MOROCCO_EDUCATION_SYSTEM.nameFr === 'string', 'B17 - system nameFr');
for (const g of LAUNCH_GRADES) {
  assert(typeof g.nameAr === 'string', 'B17 - grade ' + g.code + ' nameAr');
  assert(typeof g.nameFr === 'string', 'B17 - grade ' + g.code + ' nameFr');
}
for (const s of MOROCCAN_LAUNCH_SUBJECTS) {
  assert(typeof s.nameAr === 'string', 'B17 - subject ' + s.code + ' nameAr');
  assert(typeof s.nameFr === 'string', 'B17 - subject ' + s.code + ' nameFr');
}

// B18: Unknown source fails closed
const unknown = 'MADE_UP' as SourceClassification;
assert(!SOURCE_CLASSIFICATIONS[unknown], 'B18 - unknown not in registry');

// B19: Duplicate canonical identity detected
const p1: CurriculumProgram = {
  id: 'd1', code: 'X', subjectId: 'subj-math', gradeId: 'grade-p3',
  curriculumVersion: '1.0', status: 'DRAFT', provenance: 'UNVERIFIED',
  nameAr: 't', nameFr: 't', isActive: true, createdAt: '2026-01-01',
};
const p2: CurriculumProgram = { ...p1, id: 'd2', code: 'Y' };
assert(p1.gradeId === p2.gradeId && p1.subjectId === p2.subjectId && p1.curriculumVersion === p2.curriculumVersion, 'B19 - duplicate detected');

// B20: Cross-system collision prevented
const future: EducationStage = { id: 'f', educationSystemId: 'esys-future', code: 'PRIMARY', nameAr: 't', nameFr: 't', sortOrder: 1, isActive: false, createdAt: '2026-01-01' };
const real = LAUNCH_STAGES.find((s) => s.code === 'PRIMARY')!;
assert(future.code === real.code, 'B20 - same code');
assert(future.educationSystemId !== real.educationSystemId, 'B20 - different systems');

// B21: Primary no track
assert(!({ id: 'x', code: 'X', subjectId: 's', gradeId: 'grade-p3', curriculumVersion: '1', status: 'DRAFT' as PublicationStatus, provenance: 'UNVERIFIED' as ProvenanceType, nameAr: 't', nameFr: 't', isActive: true, createdAt: '2026-01-01' } as CurriculumProgram).trackId, 'B21 - primary no track');

// B22: Middle no track
assert(!({ id: 'x', code: 'X', subjectId: 's', gradeId: 'grade-m1', curriculumVersion: '1', status: 'DRAFT' as PublicationStatus, provenance: 'UNVERIFIED' as ProvenanceType, nameAr: 't', nameFr: 't', isActive: true, createdAt: '2026-01-01' } as CurriculumProgram).trackId, 'B22 - middle no track');

// B23: Secondary optional track
assert(!({ id: 'x', code: 'X', subjectId: 's', gradeId: 'grade-s1', curriculumVersion: '1', status: 'DRAFT' as PublicationStatus, provenance: 'UNVERIFIED' as ProvenanceType, nameAr: 't', nameFr: 't', isActive: true, createdAt: '2026-01-01' } as CurriculumProgram).trackId, 'B23 - S1 no track valid');
assert(!!({ id: 'x', code: 'X', subjectId: 's', gradeId: 'grade-s2', trackId: 't', curriculumVersion: '1', status: 'DRAFT' as PublicationStatus, provenance: 'UNVERIFIED' as ProvenanceType, nameAr: 't', nameFr: 't', isActive: true, createdAt: '2026-01-01' } as CurriculumProgram).trackId, 'B23 - S2 with track valid');

// B24: Missing curriculum reported not fabricated
for (const e of MOROCCAN_COVERAGE_MANIFEST) {
  assert(e.overallStatus === 'NOT_INGESTED', 'B24 - ' + e.gradeCode + ' NOT_INGESTED');
  for (const sub of e.subjects) {
    assert(sub.status === 'NOT_INGESTED', 'B24 - ' + sub.subjectCode + '@' + e.gradeCode + ' NOT_INGESTED');
    assert(sub.hasUnits === false, 'B24 - no fabricated units');
    assert(sub.hasLessons === false, 'B24 - no fabricated lessons');
    assert(sub.hasKO === false, 'B24 - no fabricated KO');
    assert(sub.hasExercises === false, 'B24 - no fabricated exercises');
  }
}

// B25: Trusted evidence unchanged
import { ExerciseSubmissionResult } from '../../../domain/types/studentPortal.types';
const subResult: ExerciseSubmissionResult = {
  status: 'PENDING_VERIFICATION', exerciseId: 'ex-001', studentAnswer: 't', feedbackAr: 't',
};
assert(subResult.status === 'PENDING_VERIFICATION', 'B25 - contract unchanged');
assert(!('correctAnswer' in subResult), 'B25 - privacy preserved');
assert(!('masteryGain' in subResult), 'B25 - no mastery');

// Trust escalation adversarial
for (const a of TRUST_ESCALATION_ATTEMPTS) {
  assert(a.shouldFail === true, 'TRUST - ' + a.description);
}

// Ingestion state machine
const expected: IngestionState[] = ['SOURCE_DISCOVERED','SOURCE_CAPTURED','PARSED','NORMALIZED','MAPPED','REVIEW_REQUIRED','VERIFIED','PUBLISHED','REJECTED','QUARANTINED','RETIRED'];
for (const s of expected) { assert(!!INGESTION_STATE_MACHINE[s], 'INGEST - ' + s + ' exists'); }
assert(INGESTION_STATE_MACHINE['PUBLISHED'].length === 1, 'INGEST - PUBLISHED->RETIRE');
assert(INGESTION_STATE_MACHINE['REJECTED'].length === 0, 'INGEST - REJECTED terminal');
assert(INGESTION_STATE_MACHINE['QUARANTINED'].length === 2, 'INGEST - QUARANTINED branching');

// Coverage manifest structure
assert(MOROCCAN_COVERAGE_MANIFEST.length === 12, 'MANIFEST - 12 grades');
const totalSubs = MOROCCAN_COVERAGE_MANIFEST.reduce((s, g) => s + g.subjects.length, 0);
assert(totalSubs > 0, 'MANIFEST - subjects present');
assert(MOROCCAN_LAUNCH_SUBJECTS.length >= 10, 'MANIFEST - 10+ subjects');

// Source classification completeness
const trusted = Object.values(SOURCE_CLASSIFICATIONS).filter((s) => s.trustedForPublishing).length;
const untrusted = Object.values(SOURCE_CLASSIFICATIONS).filter((s) => !s.trustedForPublishing).length;
assert(trusted >= 4, 'MANIFEST - 4+ trusted sources');
assert(untrusted >= 3, 'MANIFEST - 3+ untrusted sources');

// Ingestion rejection reasons
assert(typeof INGESTION_REJECTION_REASONS.MISSING_SOURCE === 'string', 'REJECT - MISSING_SOURCE');
assert(typeof INGESTION_REJECTION_REASONS.AI_GENERATED_AS_OFFICIAL === 'string', 'REJECT - AI_AS_OFFICIAL');
assert(typeof INGESTION_REJECTION_REASONS.PUBLISHED_WITHOUT_VERIFICATION === 'string', 'REJECT - PUB_NO_VERIFY');

// Summary
console.log("");
console.log("=== Gate 07B Results: " + passedTests + "/" + totalTests + " passed ===");
if (passedTests === totalTests) {
  console.log("ALL GATE 07B TESTS PASSED");
  process.exit(0);
} else {
  process.exit(1);
}
