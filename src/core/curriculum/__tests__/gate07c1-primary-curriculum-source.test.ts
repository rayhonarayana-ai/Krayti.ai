/**
 * Qarayti.ai - Gate 07C.1: Moroccan Primary Curriculum Source Tests
 * Run: npx tsx src/core/curriculum/__tests__/gate07c1-primary-curriculum-source.test.ts
 *
 * Tests C01-C67c: Verify source provenance, coverage matrix integrity,
 * normalization blueprint correctness, governance compliance, and
 * provenance correction integrity.
 *
 * PROVENANCE RULE:
 *   Every assertion traces to verified evidence or explicit limitation.
 *   No synthetic observations. No fabricated counts.
 *   Retrieval host does NOT imply official issuer.
 *   Framework law does NOT substitute for curriculum content.
 *
 * COVERAGE:
 *   §5-§6: Source records + subject mappings (C01-C20)
 *   §7: Coverage matrix structure (C21-C30)
 *   §10: Normalization blueprint (C31-C38)
 *   §14-§15: Governance compliance (C39-C44)
 *   §18: Cross-cutting integrity (C45-C57)
 *   Provenance corrections: Issuer vs host (C58-C67c)
 */

import {
  PRIMARY_CURRICULUM_SOURCES,
  PRIMARY_SUBJECT_SOURCE_MAPPINGS,
  FRENCH_INTRODUCTION_CONFLICT,
  SOURCE_PROVENANCE_EVIDENCE,
} from '../../../domain/constants/moroccan-primary-curriculum-sources';
import {
  VERIFIED_PRIMARY_COVERAGE_MATRIX,
  COVERAGE_SUMMARY,
  NORMALIZATION_BLUEPRINT,
  NORMALIZATION_RISKS,
  OFFICIAL_PRIMARY_DOMAINS,
} from '../../../domain/constants/moroccan-primary-coverage-matrix';
import {
  MOROCCAN_LAUNCH_SUBJECTS,
  INGESTION_STATE_MACHINE,
  SOURCE_CLASSIFICATIONS,
} from '../../../domain/constants/moroccan-curriculum-manifest';
import { LAUNCH_GRADES, PRIMARY_GRADE_CODES, MOROCCO_EDUCATION_SYSTEM } from '../../../domain/constants/curriculum-architecture.constants';
import type { SourceClassification, IngestionState } from '../../../domain/types/curriculum-source-governance.types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) { console.log("[PASS] " + message); passedTests++; }
  else { console.error("[FAIL] " + message); throw new Error("Test failed: " + message); }
}

// ============================================================
// §5-§6: SOURCE RECORDS (C01-C10)
// ============================================================
console.log("");
console.log("--- §5-§6: Source Records ---");

// C01: every source record has a non-empty string id starting with src-
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(typeof src.id === 'string', 'C01 - source id is string: ' + src.id);
  assert(src.id.length > 0, 'C01 - source id non-empty: ' + src.id);
  assert(src.id.startsWith('src-'), 'C01 - source id starts with src-: ' + src.id);
}

// C02: every source record references the Morocco education system
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(src.educationSystemId === MOROCCO_EDUCATION_SYSTEM.id, 'C02 - source ' + src.id + ' references Morocco system');
}

// C03: every source record has classification, authority, and title
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(!!src.sourceClassification, 'C03 - source ' + src.id + ' has classification');
  assert(!!src.sourceAuthority, 'C03 - source ' + src.id + ' has authority');
  assert(!!src.sourceTitle, 'C03 - source ' + src.id + ' has title');
}

// C04: every source classification is a valid SourceClassification value
const validClassifications: SourceClassification[] = [
  'OFFICIAL_MINISTRY', 'OFFICIAL_EXAM', 'OFFICIAL_CURRICULUM_DOCUMENT',
  'OFFICIAL_TEXTBOOK_OR_GUIDE', 'OFFICIAL_PUBLIC_INSTITUTION',
  'AUTHORIZED_REFERENCE', 'SECONDARY_REFERENCE', 'INTERNAL_DRAFT', 'AI_GENERATED',
];
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(validClassifications.includes(src.sourceClassification), 'C04 - ' + src.id + ' has valid classification: ' + src.sourceClassification);
}

// C05: every source record has a valid ISO 8601 retrievedAt timestamp
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(!!src.retrievedAt, 'C05 - source ' + src.id + ' has retrievedAt');
  assert(!Number.isNaN(Date.parse(src.retrievedAt)), 'C05 - source ' + src.id + ' has valid ISO 8601 timestamp');
}

// C06: every source record with a URL has a recognized domain
const allowedDomains = ['men.gov.ma', 'modarissi.com', 'profpress.net', 'moutamadris.ma'];
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  if (src.sourceUrl) {
    const url = new URL(src.sourceUrl);
    const domain = url.hostname.replace('www.', '');
    assert(allowedDomains.includes(domain), 'C06 - source ' + src.id + ' has recognized domain: ' + domain);
  }
}

// C07: no source record uses AI_GENERATED or INTERNAL_DRAFT classification
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(src.sourceClassification !== 'AI_GENERATED', 'C07 - ' + src.id + ' is not AI_GENERATED');
  assert(src.sourceClassification !== 'INTERNAL_DRAFT', 'C07 - ' + src.id + ' is not INTERNAL_DRAFT');
}

// C08: all sources have verificationState
const validStates = ['UNVERIFIED', 'REVIEW_REQUIRED', 'VERIFIED', 'REJECTED'];
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(validStates.includes(src.verificationState), 'C08 - ' + src.id + ' has valid verificationState: ' + src.verificationState);
}

// C09: all source record IDs are unique
const sourceIds = PRIMARY_CURRICULUM_SOURCES.map((s) => s.id);
const uniqueSourceIds = new Set(sourceIds);
assert(uniqueSourceIds.size === sourceIds.length, 'C09 - all source IDs are unique');

// C10: there are exactly 4 source records
assert(PRIMARY_CURRICULUM_SOURCES.length === 4, 'C10 - exactly 4 source records (got ' + PRIMARY_CURRICULUM_SOURCES.length + ')');

// ============================================================
// §5-§6: SUBJECT SOURCE MAPPINGS (C11-C20)
// ============================================================
console.log("");
console.log("--- §5-§6: Subject Source Mappings ---");

const EXPECTED_PRIMARY_SUBJECTS = [
  'ARABIC', 'FRENCH', 'MATH', 'ISLAMIC_EDUCATION',
  'CIVIC_EDUCATION', 'SCIENCE', 'SPORT', 'ART', 'MUSIC',
];

// C11: all 9 official primary subjects have source mappings
const mappedCodes = PRIMARY_SUBJECT_SOURCE_MAPPINGS.map((m) => m.subjectCode);
for (const code of EXPECTED_PRIMARY_SUBJECTS) {
  assert(mappedCodes.includes(code), 'C11 - subject ' + code + ' has source mapping');
}
assert(mappedCodes.length === 9, 'C11 - exactly 9 subject mappings (got ' + mappedCodes.length + ')');

// C12: every subject mapping references at least one source
for (const mapping of PRIMARY_SUBJECT_SOURCE_MAPPINGS) {
  assert(mapping.sourceIds.length >= 1, 'C12 - ' + mapping.subjectCode + ' has at least one source');
}

// C13: every sourceId in a mapping exists in PRIMARY_CURRICULUM_SOURCES
const allSourceIds = new Set(PRIMARY_CURRICULUM_SOURCES.map((s) => s.id));
for (const mapping of PRIMARY_SUBJECT_SOURCE_MAPPINGS) {
  for (const srcId of mapping.sourceIds) {
    assert(allSourceIds.has(srcId), 'C13 - sourceId ' + srcId + ' in ' + mapping.subjectCode + ' exists');
  }
}

// C14: Arabic is confirmed for all primary grades P1-P6
const arabicMapping = PRIMARY_SUBJECT_SOURCE_MAPPINGS.find((m) => m.subjectCode === 'ARABIC');
assert(!!arabicMapping, 'C14 - Arabic mapping exists');
for (const grade of PRIMARY_GRADE_CODES) {
  assert(arabicMapping!.confirmedGrades.includes(grade), 'C14 - Arabic confirmed for ' + grade);
}

// C15: Math is confirmed for all primary grades P1-P6
const mathMapping = PRIMARY_SUBJECT_SOURCE_MAPPINGS.find((m) => m.subjectCode === 'MATH');
assert(!!mathMapping, 'C15 - Math mapping exists');
for (const grade of PRIMARY_GRADE_CODES) {
  assert(mathMapping!.confirmedGrades.includes(grade), 'C15 - Math confirmed for ' + grade);
}

// C16: Islamic Education is confirmed for all primary grades P1-P6
const islamicMapping = PRIMARY_SUBJECT_SOURCE_MAPPINGS.find((m) => m.subjectCode === 'ISLAMIC_EDUCATION');
assert(!!islamicMapping, 'C16 - Islamic Education mapping exists');
for (const grade of PRIMARY_GRADE_CODES) {
  assert(islamicMapping!.confirmedGrades.includes(grade), 'C16 - Islamic Education confirmed for ' + grade);
}

// C17: French IS confirmed for P1-P6 (Gate 07C.2: authenticated document includes French for all 6 years)
const frenchMapping = PRIMARY_SUBJECT_SOURCE_MAPPINGS.find((m) => m.subjectCode === 'FRENCH');
assert(!!frenchMapping, 'C17 - French mapping exists');
assert(frenchMapping!.confirmedGrades.includes('P1'), 'C17 - French confirmed for P1 (Gate 07C.2)');
assert(frenchMapping!.confirmedGrades.includes('P2'), 'C17 - French confirmed for P2 (Gate 07C.2)');

// C18: French is confirmed for P3, P4, P5, P6
assert(frenchMapping!.confirmedGrades.includes('P3'), 'C18 - French confirmed for P3');
assert(frenchMapping!.confirmedGrades.includes('P4'), 'C18 - French confirmed for P4');
assert(frenchMapping!.confirmedGrades.includes('P5'), 'C18 - French confirmed for P5');
assert(frenchMapping!.confirmedGrades.includes('P6'), 'C18 - French confirmed for P6');

// C19: SCIENCE official primary name is النشاط العلمي (not التربية العلمية)
const scienceMapping = PRIMARY_SUBJECT_SOURCE_MAPPINGS.find((m) => m.subjectCode === 'SCIENCE');
assert(!!scienceMapping, 'C19 - Science mapping exists');
assert(scienceMapping!.officialNameAr === 'النشاط العلمي', 'C19 - Science name is النشاط العلمي');
assert(scienceMapping!.officialNameAr !== 'التربية العلمية', 'C19 - Science name is NOT التربية العلمية');

// C20: all subject mappings have verifiedAtGradeLevel = true (Gate 07C.2: source authenticated)
for (const mapping of PRIMARY_SUBJECT_SOURCE_MAPPINGS) {
  assert(mapping.verifiedAtGradeLevel === true, 'C20 - ' + mapping.subjectCode + ' verifiedAtGradeLevel is true (Gate 07C.2)');
}

// ============================================================
// §7: COVERAGE MATRIX (C21-C30)
// ============================================================
console.log("");
console.log("--- §7: Coverage Matrix ---");

// C21: coverage matrix has exactly 54 cells (6 grades × 9 subjects)
assert(VERIFIED_PRIMARY_COVERAGE_MATRIX.length === 54, 'C21 - coverage matrix has 54 cells (got ' + VERIFIED_PRIMARY_COVERAGE_MATRIX.length + ')');

// C22: no cell has status PUBLISHED or VERIFIED
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.status !== 'PUBLISHED', 'C22 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is not PUBLISHED');
  assert(cell.status !== 'VERIFIED', 'C22 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is not VERIFIED');
}

// C23: no cell claims unitCountKnown = true (no fabricated counts)
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.unitCountKnown === false, 'C23 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' unitCountKnown is false');
}

// C24: no cell claims lessonCountKnown = true (no fabricated counts)
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.lessonCountKnown === false, 'C24 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' lessonCountKnown is false');
}

// C25: no cell claims exerciseCountKnown = true (no fabricated counts)
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.exerciseCountKnown === false, 'C25 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' exerciseCountKnown is false');
}

// C26: every cell references at least one source
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.sourceIds.length >= 1, 'C26 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' has at least one source');
}

// C27: French P1 and P2 cells are now UNVERIFIED (Gate 07C.2: conflict resolved by primary source)
const frenchP1 = VERIFIED_PRIMARY_COVERAGE_MATRIX.find(
  (c) => c.gradeCode === 'P1' && c.subjectCode === 'FRENCH',
);
const frenchP2 = VERIFIED_PRIMARY_COVERAGE_MATRIX.find(
  (c) => c.gradeCode === 'P2' && c.subjectCode === 'FRENCH',
);
assert(!!frenchP1, 'C27 - French P1 cell exists');
assert(!!frenchP2, 'C27 - French P2 cell exists');
assert(frenchP1!.verificationState === 'UNVERIFIED', 'C27 - French P1 is UNVERIFIED (Gate 07C.2)');
assert(frenchP2!.verificationState === 'UNVERIFIED', 'C27 - French P2 is UNVERIFIED (Gate 07C.2)');

// C28: French introduction conflict is documented with resolved classifications (Gate 07C.2)
assert(FRENCH_INTRODUCTION_CONFLICT.claim.includes('French'), 'C28 - conflict claim mentions French');
assert(FRENCH_INTRODUCTION_CONFLICT.sourceA.classification === 'OFFICIAL_CURRICULUM_DOCUMENT', 'C28 - sourceA is OFFICIAL_CURRICULUM_DOCUMENT (Gate 07C.2)');
assert(FRENCH_INTRODUCTION_CONFLICT.sourceB.classification === 'SECONDARY_REFERENCE', 'C28 - sourceB is SECONDARY_REFERENCE');
assert(FRENCH_INTRODUCTION_CONFLICT.resolutionStatus === 'RESOLVED_BY_PRIMARY_SOURCE', 'C28 - resolution is RESOLVED_BY_PRIMARY_SOURCE (Gate 07C.2)');
assert(FRENCH_INTRODUCTION_CONFLICT.affectedGrades.includes('P1'), 'C28 - affected grades include P1');
assert(FRENCH_INTRODUCTION_CONFLICT.affectedGrades.includes('P2'), 'C28 - affected grades include P2');
assert(FRENCH_INTRODUCTION_CONFLICT.affectedGrades.includes('P3'), 'C28 - affected grades include P3');

// C29: coverage summary totals add up to 54 (Gate 07C.2: all 54 cells SOURCE_VERIFIED)
const totalFromStatuses =
  COVERAGE_SUMMARY.byStatus.SOURCE_REQUIRED +
  COVERAGE_SUMMARY.byStatus.SOURCE_VERIFIED +
  COVERAGE_SUMMARY.byStatus.NOT_INGESTED +
  COVERAGE_SUMMARY.byStatus.PARTIALLY_COVERED +
  COVERAGE_SUMMARY.byStatus.FULLY_COVERED +
  COVERAGE_SUMMARY.byStatus.VERIFIED +
  COVERAGE_SUMMARY.byStatus.PUBLISHED;
assert(totalFromStatuses === 54, 'C29 - status totals sum to 54 (got ' + totalFromStatuses + ')');
assert(COVERAGE_SUMMARY.byStatus.SOURCE_VERIFIED === 54, 'C29 - all 54 cells are SOURCE_VERIFIED (Gate 07C.2)');
assert(COVERAGE_SUMMARY.byStatus.SOURCE_REQUIRED === 0, 'C29 - zero SOURCE_REQUIRED cells (Gate 07C.2)');

// C30: all grade codes in the matrix are valid primary grade codes
const validGradeCodes = new Set(PRIMARY_GRADE_CODES);
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(validGradeCodes.has(cell.gradeCode as any), 'C30 - cell grade ' + cell.gradeCode + ' is valid primary code');
}

// ============================================================
// §10: NORMALIZATION BLUEPRINT (C31-C38)
// ============================================================
console.log("");
console.log("--- §10: Normalization Blueprint ---");

// C31: blueprint has mappings for grade, subject, domain, unit, and lesson
const targetFields = NORMALIZATION_BLUEPRINT.map((r) => r.targetField);
assert(targetFields.some((f) => f.includes('GradeLevel')), 'C31 - blueprint has GradeLevel mapping');
assert(targetFields.some((f) => f.includes('subjectCode')), 'C31 - blueprint has subjectCode mapping');
assert(targetFields.some((f) => f.includes('domain')), 'C31 - blueprint has domain mapping');
assert(targetFields.some((f) => f.includes('CurriculumUnit')), 'C31 - blueprint has CurriculumUnit mapping');
assert(targetFields.some((f) => f.includes('CurriculumLesson')), 'C31 - blueprint has CurriculumLesson mapping');

// C32: grade mapping is DIRECT
const gradeRule = NORMALIZATION_BLUEPRINT.find((r) => r.targetField.includes('GradeLevel'));
assert(!!gradeRule, 'C32 - grade rule exists');
assert(gradeRule!.mappingType === 'DIRECT', 'C32 - grade mapping is DIRECT');

// C33: domain mapping is DERIVED, not DIRECT
const domainRule = NORMALIZATION_BLUEPRINT.find((r) => r.targetField.includes('domain'));
assert(!!domainRule, 'C33 - domain rule exists');
assert(domainRule!.mappingType === 'DERIVED', 'C33 - domain mapping is DERIVED');
assert(domainRule!.mappingType !== 'DIRECT', 'C33 - domain mapping is not DIRECT');

// C34: unit mapping is MANUAL_REVIEW
const unitRule = NORMALIZATION_BLUEPRINT.find(
  (r) => r.sourceField.includes('Unit') && r.targetField.includes('CurriculumUnit'),
);
assert(!!unitRule, 'C34 - unit rule exists');
assert(unitRule!.mappingType === 'MANUAL_REVIEW', 'C34 - unit mapping is MANUAL_REVIEW');

// C35: lesson mapping is MANUAL_REVIEW
const lessonRule = NORMALIZATION_BLUEPRINT.find(
  (r) => r.sourceField.includes('Lesson') && r.targetField.includes('CurriculumLesson'),
);
assert(!!lessonRule, 'C35 - lesson rule exists');
assert(lessonRule!.mappingType === 'MANUAL_REVIEW', 'C35 - lesson mapping is MANUAL_REVIEW');

// C36: competency mapping is DERIVED or MANUAL_REVIEW, not DIRECT
const competencyRule = NORMALIZATION_BLUEPRINT.find((r) => r.sourceField.includes('Competency'));
assert(!!competencyRule, 'C36 - competency rule exists');
assert(competencyRule!.mappingType !== 'DIRECT', 'C36 - competency mapping is not DIRECT');

// C37: risk register includes issuer risk at RESOLVED severity (Gate 07C.2)
const resolvedRisk = NORMALIZATION_RISKS.find((r) => r.risk.includes('issuer') || r.risk.includes('resolved') || r.risk.includes('RESOLVED'));
assert(!!resolvedRisk, 'C37 - issuer/resolved risk exists');
assert(resolvedRisk!.severity === 'RESOLVED', 'C37 - issuer risk is RESOLVED (Gate 07C.2)');

// C38: risk register includes retrieval host does not imply issuer risk
const hostRisk = NORMALIZATION_RISKS.find((r) => r.risk.includes('Retrieval host'));
assert(!!hostRisk, 'C38 - retrieval host risk exists');
assert(hostRisk!.severity === 'HIGH', 'C38 - retrieval host risk is HIGH');

// ============================================================
// §14-§15: GOVERNANCE COMPLIANCE (C39-C44)
// ============================================================
console.log("");
console.log("--- §14-§15: Governance Compliance ---");

// C39: no source record uses AI_GENERATED classification
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(src.sourceClassification !== 'AI_GENERATED', 'C39 - ' + src.id + ' is not AI_GENERATED');
}

// C40: no source record uses INTERNAL_DRAFT classification
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(src.sourceClassification !== 'INTERNAL_DRAFT', 'C40 - ' + src.id + ' is not INTERNAL_DRAFT');
}

// C41: no cell with PUBLISHED status exists
const publishedCells = VERIFIED_PRIMARY_COVERAGE_MATRIX.filter((c) => c.status === 'PUBLISHED');
assert(publishedCells.length === 0, 'C41 - no PUBLISHED cells');

// C42: every source mapping has a traceable sourceIds array
const validMappingSourceIds = new Set(PRIMARY_CURRICULUM_SOURCES.map((s) => s.id));
for (const mapping of PRIMARY_SUBJECT_SOURCE_MAPPINGS) {
  assert(mapping.sourceIds.length >= 1, 'C42 - ' + mapping.subjectCode + ' has at least one source');
  for (const srcId of mapping.sourceIds) {
    assert(validMappingSourceIds.has(srcId), 'C42 - sourceId ' + srcId + ' in ' + mapping.subjectCode + ' is valid');
  }
}

// C43: AI_GENERATED and INTERNAL_DRAFT are not trusted for publishing
assert(SOURCE_CLASSIFICATIONS['AI_GENERATED'].trustedForPublishing === false, 'C43 - AI_GENERATED not trusted');
assert(SOURCE_CLASSIFICATIONS['INTERNAL_DRAFT'].trustedForPublishing === false, 'C43 - INTERNAL_DRAFT not trusted');
assert(SOURCE_CLASSIFICATIONS['SECONDARY_REFERENCE'].trustedForPublishing === false, 'C43 - SECONDARY_REFERENCE not trusted');

// C44: OFFICIAL classifications and OFFICIAL_PUBLIC_INSTITUTION are trusted
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_MINISTRY'].trustedForPublishing === true, 'C44 - OFFICIAL_MINISTRY trusted');
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_EXAM'].trustedForPublishing === true, 'C44 - OFFICIAL_EXAM trusted');
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_CURRICULUM_DOCUMENT'].trustedForPublishing === true, 'C44 - OFFICIAL_CURRICULUM_DOCUMENT trusted');
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_TEXTBOOK_OR_GUIDE'].trustedForPublishing === true, 'C44 - OFFICIAL_TEXTBOOK_OR_GUIDE trusted');
assert(SOURCE_CLASSIFICATIONS['OFFICIAL_PUBLIC_INSTITUTION'].trustedForPublishing === true, 'C44 - OFFICIAL_PUBLIC_INSTITUTION trusted');

// ============================================================
// §18: CROSS-CUTTING INTEGRITY (C45-C57)
// ============================================================
console.log("");
console.log("--- §18: Cross-cutting Integrity ---");

// C45: three official domains cover all 9 primary subjects
const allDomainSubjects = OFFICIAL_PRIMARY_DOMAINS.flatMap((d) => [...d.subjects]);
const expectedSubjects = [
  'ARABIC', 'FRENCH', 'MATH', 'ISLAMIC_EDUCATION',
  'CIVIC_EDUCATION', 'SCIENCE', 'SPORT', 'ART', 'MUSIC',
];
const sortedActual = [...allDomainSubjects].sort();
const sortedExpected = [...expectedSubjects].sort();
assert(JSON.stringify(sortedActual) === JSON.stringify(sortedExpected), 'C45 - domains cover all 9 primary subjects');

// C46: each official domain has Arabic and French names
for (const domain of OFFICIAL_PRIMARY_DOMAINS) {
  assert(!!domain.nameAr, 'C46 - domain has Arabic name');
  assert(!!domain.nameFr, 'C46 - domain has French name');
}

// C47: no subject appears in more than one domain
const seenSubjects = new Set<string>();
for (const domain of OFFICIAL_PRIMARY_DOMAINS) {
  for (const subject of domain.subjects) {
    assert(!seenSubjects.has(subject), 'C47 - subject ' + subject + ' is not duplicated across domains');
    seenSubjects.add(subject);
  }
}

// C48: French conflict has sources with different classifications (Gate 07C.2: resolved)
assert(FRENCH_INTRODUCTION_CONFLICT.sourceA.classification !== FRENCH_INTRODUCTION_CONFLICT.sourceB.classification, 'C48 - sourceA and sourceB have different classifications');
assert(FRENCH_INTRODUCTION_CONFLICT.sourceA.classification === 'OFFICIAL_CURRICULUM_DOCUMENT', 'C48 - sourceA is OFFICIAL_CURRICULUM_DOCUMENT (Gate 07C.2)');
assert(FRENCH_INTRODUCTION_CONFLICT.sourceB.classification === 'SECONDARY_REFERENCE', 'C48 - sourceB is SECONDARY_REFERENCE');

// C49: INGESTION_STATE_MACHINE includes RETIRED as a terminal state
assert(JSON.stringify(INGESTION_STATE_MACHINE['RETIRED']) === JSON.stringify([]), 'C49 - RETIRED is terminal');
assert(INGESTION_STATE_MACHINE['PUBLISHED'].includes('RETIRED'), 'C49 - PUBLISHED can transition to RETIRED');

// C50: every coverage cell has a non-empty notes field
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.notes.length > 0, 'C50 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' has non-empty notes');
}

// C51: all grade codes in matrix exist in LAUNCH_GRADES
const launchGradeCodes = new Set<string>(LAUNCH_GRADES.map((g) => g.code));
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(launchGradeCodes.has(cell.gradeCode), 'C51 - cell grade ' + cell.gradeCode + ' exists in LAUNCH_GRADES');
}

// C52: all subject codes in matrix exist in MOROCCAN_LAUNCH_SUBJECTS
const launchSubjectCodes = new Set<string>(MOROCCAN_LAUNCH_SUBJECTS.map((s) => s.code));
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(launchSubjectCodes.has(cell.subjectCode), 'C52 - cell subject ' + cell.subjectCode + ' exists in MOROCCAN_LAUNCH_SUBJECTS');
}

// C53: all MOROCCAN_LAUNCH_SUBJECTS with primary=true appear in coverage matrix
const primarySubjects = MOROCCAN_LAUNCH_SUBJECTS.filter((s) => s.primary).map((s) => s.code);
const matrixSubjectCodes = new Set(VERIFIED_PRIMARY_COVERAGE_MATRIX.map((c) => c.subjectCode));
for (const code of primarySubjects) {
  assert(matrixSubjectCodes.has(code), 'C53 - primary subject ' + code + ' appears in matrix');
}

// C54: coverage summary notes reflect Gate 07C.2 upgrade
assert(COVERAGE_SUMMARY.notes.includes('SOURCE_VERIFIED'), 'C54 - summary notes mention SOURCE_VERIFIED (Gate 07C.2)');
assert(COVERAGE_SUMMARY.sourceAuthorityNote.includes('OFFICIAL_CURRICULUM_DOCUMENT'), 'C54 - sourceAuthorityNote mentions OFFICIAL_CURRICULUM_DOCUMENT (Gate 07C.2)');
assert(COVERAGE_SUMMARY.sourceAuthorityNote.includes('STRONGLY SUPPORTED'), 'C54 - sourceAuthorityNote mentions STRONGLY SUPPORTED (Gate 07C.2)');

// C55: every normalization risk has required fields with correct types and non-empty values
assert(NORMALIZATION_RISKS.length >= 7, 'C55 - at least 7 risks (got ' + NORMALIZATION_RISKS.length + ')');
for (const risk of NORMALIZATION_RISKS) {
  const riskEntry = risk as Record<string, unknown>;
  assert('risk' in riskEntry, 'C55 - risk entry has "risk" field');
  assert('severity' in riskEntry, 'C55 - risk entry has "severity" field');
  assert('description' in riskEntry, 'C55 - risk entry has "description" field');
  assert('mitigation' in riskEntry, 'C55 - risk entry has "mitigation" field');
  assert(typeof riskEntry['risk'] === 'string', 'C55 - risk.risk is string');
  assert(typeof riskEntry['severity'] === 'string', 'C55 - risk.severity is string');
  assert(typeof riskEntry['description'] === 'string', 'C55 - risk.description is string');
  assert(typeof riskEntry['mitigation'] === 'string', 'C55 - risk.mitigation is string');
  assert((riskEntry['risk'] as string).length > 0, 'C55 - risk.risk is non-empty');
  assert((riskEntry['severity'] as string).length > 0, 'C55 - risk.severity is non-empty');
  assert((riskEntry['description'] as string).length > 0, 'C55 - risk.description is non-empty');
  assert((riskEntry['mitigation'] as string).length > 0, 'C55 - risk.mitigation is non-empty');
}

// C56: every source record has a non-empty sourceAuthority
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(src.sourceAuthority.length > 0, 'C56 - source ' + src.id + ' has non-empty sourceAuthority');
}

// C57: source provenance evidence registry covers all 4 sources
const allSourceRecordIds = PRIMARY_CURRICULUM_SOURCES.map((s) => s.id);
for (const id of allSourceRecordIds) {
  assert(id in SOURCE_PROVENANCE_EVIDENCE, 'C57 - provenance evidence exists for ' + id);
}

// ============================================================
// PROVENANCE CORRECTIONS: ISSUER VS HOST (C58-C67c)
// ============================================================
console.log("");
console.log("--- Provenance Corrections: Issuer vs Host ---");

// C58: Moutamadris.ma host does not grant OFFICIAL provenance to src-primary-pedagogical-guide
const guide = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-pedagogical-guide');
assert(!!guide, 'C58 - src-primary-pedagogical-guide exists');
assert(guide!.sourceUrl.includes('moutamadris.ma'), 'C58 - pedagogical guide is hosted on moutamadris.ma');
assert(guide!.sourceClassification !== 'OFFICIAL_TEXTBOOK_OR_GUIDE', 'C58 - moutamadris host does not grant OFFICIAL_TEXTBOOK_OR_GUIDE');
assert(guide!.sourceClassification !== 'OFFICIAL_MINISTRY', 'C58 - moutamadris host does not grant OFFICIAL_MINISTRY');
assert(guide!.sourceClassification === 'SECONDARY_REFERENCE', 'C58 - pedagogical guide is SECONDARY_REFERENCE');

// C59: src-primary-curriculum-2021 is OFFICIAL_CURRICULUM_DOCUMENT (Gate 07C.2: issuer authenticated)
const curriculum = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
assert(!!curriculum, 'C59 - src-primary-curriculum-2021 exists');
assert(curriculum!.sourceUrl.includes('profpress.net'), 'C59 - curriculum 2021 retrieval URL is on profpress.net');
assert(curriculum!.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT', 'C59 - curriculum 2021 is OFFICIAL_CURRICULUM_DOCUMENT (Gate 07C.2)');

// C60: sourceClassification is determined by issuer evidence, not by retrieval host domain
// Gate 07C.2: src-primary-curriculum-2021 classified as OFFICIAL_CURRICULUM_DOCUMENT via issuer evidence (profpress.net is retrieval host, not issuer)
for (const src of PRIMARY_CURRICULUM_SOURCES) {
  assert(!!src.sourceAuthority, 'C60 - source ' + src.id + ' has sourceAuthority');
  assert(!!src.sourceClassification, 'C60 - source ' + src.id + ' has sourceClassification');

  if (src.sourceUrl) {
    const urlHost = new URL(src.sourceUrl).hostname.replace('www.', '');
    const hostIsIndependentPortal = urlHost === 'moutamadris.ma';

    if (hostIsIndependentPortal) {
      assert(src.sourceClassification !== 'OFFICIAL_MINISTRY', 'C60 - ' + src.id + ' host ' + urlHost + ' cannot grant OFFICIAL_MINISTRY');
      assert(src.sourceClassification !== 'OFFICIAL_TEXTBOOK_OR_GUIDE', 'C60 - ' + src.id + ' host ' + urlHost + ' cannot grant OFFICIAL_TEXTBOOK_OR_GUIDE');
    }
  }
}

// C61: Vision 2015-2030 issuer is CSEFRS, not MEN
const vision = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-vision-2015-2030');
assert(!!vision, 'C61 - src-vision-2015-2030 exists');
assert(vision!.sourceAuthority.includes('CSEFRS'), 'C61 - vision sourceAuthority mentions CSEFRS');
assert(vision!.sourceAuthority.includes('NOT MEN'), 'C61 - vision sourceAuthority states NOT MEN');
assert(vision!.sourceClassification !== 'OFFICIAL_MINISTRY', 'C61 - vision is not OFFICIAL_MINISTRY');
assert(vision!.sourceClassification === 'OFFICIAL_PUBLIC_INSTITUTION', 'C61 - vision is OFFICIAL_PUBLIC_INSTITUTION');

// C62: Law 51-17 is classified as OFFICIAL_PUBLIC_INSTITUTION, not OFFICIAL_MINISTRY
const law = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-law-51-17');
assert(!!law, 'C62 - src-law-51-17 exists');
assert(law!.sourceClassification === 'OFFICIAL_PUBLIC_INSTITUTION', 'C62 - law is OFFICIAL_PUBLIC_INSTITUTION');
assert(law!.sourceClassification !== 'OFFICIAL_MINISTRY', 'C62 - law is not OFFICIAL_MINISTRY');
assert(law!.sourceClassification !== 'OFFICIAL_CURRICULUM_DOCUMENT', 'C62 - law is not OFFICIAL_CURRICULUM_DOCUMENT');

// C62b: Law 51-17 notes specify governance context only, not grade×subject evidence
assert(law!.notes.includes('governance context'), 'C62b - law notes mention governance context');
assert(law!.notes.includes('MUST NOT be used as evidence for specific Grade'), 'C62b - law notes state not for grade×subject evidence');

// C63: Vision 2015-2030 notes specify strategic direction only, not curriculum content
assert(vision!.notes.includes('Strategic direction'), 'C63 - vision notes mention strategic direction');
assert(vision!.notes.includes('MUST NOT be used as evidence for specific Grade'), 'C63 - vision notes state not for grade×subject evidence');

// C64: src-primary-curriculum-2021 is OFFICIAL_CURRICULUM_DOCUMENT because issuer evidence found (Gate 07C.2)
const curriculumEvidence = SOURCE_PROVENANCE_EVIDENCE['src-primary-curriculum-2021'];
assert(!!curriculumEvidence, 'C64 - provenance evidence exists for curriculum 2021');
assert(curriculumEvidence.issuerEvidenceFound === true, 'C64 - issuer evidence found for curriculum 2021 (Gate 07C.2)');
assert(curriculumEvidence.officialPortalListed === false, 'C64 - curriculum 2021 not listed on official portal (but issuer evidence is artifact-internal)');
assert(curriculumEvidence.classificationRationale.includes('OFFICIAL_CURRICULUM_DOCUMENT'), 'C64 - rationale includes OFFICIAL_CURRICULUM_DOCUMENT (Gate 07C.2)');

// C64b: src-primary-pedagogical-guide is SECONDARY_REFERENCE because host is independent
const guideEvidence = SOURCE_PROVENANCE_EVIDENCE['src-primary-pedagogical-guide'];
assert(!!guideEvidence, 'C64b - provenance evidence exists for pedagogical guide');
assert(guideEvidence.issuerEvidenceFound === false, 'C64b - issuer evidence not found for pedagogical guide');
assert(guideEvidence.classificationRationale.includes('SECONDARY_REFERENCE'), 'C64b - rationale includes SECONDARY_REFERENCE');

// C65: law and vision sources are not cited as sourceIds for any grade×subject cell
const lawAndVisionIds = new Set(['src-law-51-17', 'src-vision-2015-2030']);
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  for (const srcId of cell.sourceIds) {
    assert(!lawAndVisionIds.has(srcId), 'C65 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' does not cite law or vision');
  }
}

// C66: all 54 cells have status SOURCE_VERIFIED (Gate 07C.2: source authenticated)
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.status === 'SOURCE_VERIFIED', 'C66 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is SOURCE_VERIFIED (Gate 07C.2)');
}

// C66b: all cells have verificationState UNVERIFIED (Gate 07C.2: REVIEW_REQUIRED resolved)
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.verificationState === 'UNVERIFIED', 'C66b - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is UNVERIFIED (Gate 07C.2)');
  assert(cell.verificationState !== 'REVIEW_REQUIRED', 'C66b - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is not REVIEW_REQUIRED (Gate 07C.2)');
  assert(cell.verificationState !== 'VERIFIED', 'C66b - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is not VERIFIED');
}

// C67: French P1 cell is now UNVERIFIED (Gate 07C.2: conflict resolved by primary source)
const frenchP1Final = VERIFIED_PRIMARY_COVERAGE_MATRIX.find(
  (c) => c.gradeCode === 'P1' && c.subjectCode === 'FRENCH',
);
assert(!!frenchP1Final, 'C67 - French P1 cell exists');
assert(frenchP1Final!.verificationState === 'UNVERIFIED', 'C67 - French P1 is UNVERIFIED (Gate 07C.2)');
assert(frenchP1Final!.notes.includes('Gate 07C.2'), 'C67 - French P1 notes mention Gate 07C.2');

// C67b: French P2 cell is now UNVERIFIED (Gate 07C.2: conflict resolved by primary source)
const frenchP2Final = VERIFIED_PRIMARY_COVERAGE_MATRIX.find(
  (c) => c.gradeCode === 'P2' && c.subjectCode === 'FRENCH',
);
assert(!!frenchP2Final, 'C67b - French P2 cell exists');
assert(frenchP2Final!.verificationState === 'UNVERIFIED', 'C67b - French P2 is UNVERIFIED (Gate 07C.2)');
assert(frenchP2Final!.notes.includes('Gate 07C.2'), 'C67b - French P2 notes mention Gate 07C.2');

// C67c: French P3-P6 cells are UNVERIFIED (not REVIEW_REQUIRED)
for (const grade of ['P3', 'P4', 'P5', 'P6']) {
  const frenchCell = VERIFIED_PRIMARY_COVERAGE_MATRIX.find(
    (c) => c.gradeCode === grade && c.subjectCode === 'FRENCH',
  );
  assert(!!frenchCell, 'C67c - French ' + grade + ' cell exists');
  assert(frenchCell!.verificationState === 'UNVERIFIED', 'C67c - French ' + grade + ' is UNVERIFIED');
}

// ============================================================
// Summary
// ============================================================
console.log("");
console.log("=== Gate 07C.1 Results: " + passedTests + "/" + totalTests + " passed ===");
if (passedTests === totalTests) {
  console.log("ALL GATE 07C.1 TESTS PASSED");
  process.exit(0);
} else {
  process.exit(1);
}
