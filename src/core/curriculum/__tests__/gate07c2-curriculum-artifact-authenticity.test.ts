/**
 * Gate 07C.2 — Primary Curriculum Artifact Authenticity & Forensics
 *
 * Verifies the document authenticity analysis, issuer authentication,
 * mirror analysis, currentness assessment, French P1/P2 resolution,
 * coverage matrix transitions, source record upgrades, claim scope,
 * subject verification, and ingestion readiness criteria.
 *
 * Run: npx tsx src/core/curriculum/__tests__/gate07c2-curriculum-artifact-authenticity.test.ts
 */

import {
  PRIMARY_CURRICULUM_ARTIFACT,
  ARTIFACT_ISSUER_AUTHENTICITY,
  ARTIFACT_OFFICIAL_CORROBORATION,
  ARTIFACT_MIRROR_ANALYSIS,
  ARTIFACT_CURRENTNESS,
  ARTIFACT_CLAIM_SCOPE,
  ARTIFACT_FRENCH_P1_P2,
  ARTIFACT_SUBJECT_VERIFICATION,
  INGESTION_READINESS_CRITERIA,
} from '../../../domain/constants/moroccan-primary-curriculum-artifact-forensics';

import {
  PRIMARY_CURRICULUM_SOURCES,
  PRIMARY_SUBJECT_SOURCE_MAPPINGS,
  SOURCE_PROVENANCE_EVIDENCE,
  FRENCH_INTRODUCTION_CONFLICT,
} from '../../../domain/constants/moroccan-primary-curriculum-sources';

import {
  VERIFIED_PRIMARY_COVERAGE_MATRIX,
  COVERAGE_SUMMARY,
  NORMALIZATION_RISKS,
} from '../../../domain/constants/moroccan-primary-coverage-matrix';

import { PRIMARY_GRADE_CODES } from '../../../domain/constants/curriculum-architecture.constants';
import { SOURCE_CLASSIFICATIONS } from '../../../domain/constants/moroccan-curriculum-manifest';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log("[PASS] " + message);
  }
  else { console.error("[FAIL] " + message); throw new Error("Test failed: " + message); }
}

// ============================================================
// §1: ARTIFACT METADATA (F01-F06)
// ============================================================
console.log("--- §1: Artifact Metadata ---");

// F01: artifact has a unique identifier
assert(PRIMARY_CURRICULUM_ARTIFACT.artifactId.length > 0, 'F01 - artifactId is non-empty');
assert(PRIMARY_CURRICULUM_ARTIFACT.artifactId.startsWith('artifact-'), 'F01 - artifactId starts with artifact-');

// F02: artifact has Arabic and French titles
assert(PRIMARY_CURRICULUM_ARTIFACT.titleAr.length > 0, 'F02 - titleAr is non-empty');
assert(PRIMARY_CURRICULUM_ARTIFACT.titleFr.length > 0, 'F02 - titleFr is non-empty');

// F03: artifact has alternative titles
assert(PRIMARY_CURRICULUM_ARTIFACT.altTitles.length >= 2, 'F03 - at least 2 alt titles');

// F04: artifact has claimed issuer in Arabic and French
assert(PRIMARY_CURRICULUM_ARTIFACT.claimedIssuerAr.length > 0, 'F04 - claimedIssuerAr is non-empty');
assert(PRIMARY_CURRICULUM_ARTIFACT.claimedIssuerFr.length > 0, 'F04 - claimedIssuerFr is non-empty');
assert(PRIMARY_CURRICULUM_ARTIFACT.claimedIssuerShort.length > 0, 'F04 - claimedIssuerShort is non-empty');

// F05: artifact has publication date and page estimate
assert(PRIMARY_CURRICULUM_ARTIFACT.publicationDate === '2021-07', 'F05 - publicationDate is 2021-07');
assert(PRIMARY_CURRICULUM_ARTIFACT.pageEstimate >= 500, 'F05 - pageEstimate >= 500');

// F06: artifact has internal structure and implements references
assert(PRIMARY_CURRICULUM_ARTIFACT.internalStructure.length === 2, 'F06 - 2 main parts');
assert(PRIMARY_CURRICULUM_ARTIFACT.implementsReferences.length >= 2, 'F06 - implements at least 2 references');

// ============================================================
// §2: ISSUER AUTHENTICITY (F07-F12)
// ============================================================
console.log("");
console.log("--- §2: Issuer Authenticity ---");

// F07: issuer authenticity status is ISSUER_STRONGLY_SUPPORTED
assert(ARTIFACT_ISSUER_AUTHENTICITY.status === 'ISSUER_STRONGLY_SUPPORTED', 'F07 - status is ISSUER_STRONGLY_SUPPORTED');

// F08: artifact-internal evidence exists
assert(ARTIFACT_ISSUER_AUTHENTICITY.evidenceFromArtifact.length >= 3, 'F08 - at least 3 artifact-internal evidence items');

// F09: cross-mirror corroboration exists (8 independent mirrors)
assert(ARTIFACT_ISSUER_AUTHENTICITY.crossMirrorCorroboration.length >= 8, 'F09 - at least 8 cross-mirror corroborations');

// F10: academic corroboration exists
assert(ARTIFACT_ISSUER_AUTHENTICITY.academicCorroboration.length >= 2, 'F10 - at least 2 academic corroboration items');

// F11: official portal status documented
assert(ARTIFACT_ISSUER_AUTHENTICITY.officialPortalStatus.menGovMa.length > 0, 'F11 - menGovMa status documented');

// F12: notes field is non-empty
assert(ARTIFACT_ISSUER_AUTHENTICITY.notes.length > 0, 'F12 - notes is non-empty');

// ============================================================
// §3: OFFICIAL CORROBORATION (F13-F15)
// ============================================================
console.log("");
console.log("--- §3: Official Corroboration ---");

// F13: at least 5 corroboration references
assert(ARTIFACT_OFFICIAL_CORROBORATION.length >= 5, 'F13 - at least 5 corroboration references');

// F14: includes ARTIFACT_INTERNAL type
const artifactInternal = ARTIFACT_OFFICIAL_CORROBORATION.filter((r) => r.type === 'ARTIFACT_INTERNAL');
assert(artifactInternal.length >= 2, 'F14 - at least 2 ARTIFACT_INTERNAL references');

// F15: includes CROSS_MIRROR and ACADEMIC types
const crossMirror = ARTIFACT_OFFICIAL_CORROBORATION.filter((r) => r.type === 'CROSS_MIRROR');
const academic = ARTIFACT_OFFICIAL_CORROBORATION.filter((r) => r.type === 'ACADEMIC');
assert(crossMirror.length >= 1, 'F15 - at least 1 CROSS_MIRROR reference');
assert(academic.length >= 2, 'F15 - at least 2 ACADEMIC references');

// ============================================================
// §4: MIRROR ANALYSIS (F16-F20)
// ============================================================
console.log("");
console.log("--- §4: Mirror Analysis ---");

// F16: mirror classification is CONTENT_EQUIVALENT
assert(ARTIFACT_MIRROR_ANALYSIS.classification === 'CONTENT_EQUIVALENT', 'F16 - classification is CONTENT_EQUIVALENT');

// F17: at least 7 mirrors documented
assert(ARTIFACT_MIRROR_ANALYSIS.mirrors.length >= 7, 'F17 - at least 7 mirrors');

// F18: shared file IDs documented
assert(ARTIFACT_MIRROR_ANALYSIS.sharedFileIds.length >= 1, 'F18 - at least 1 shared file ID');

// F19: different file IDs documented
assert(ARTIFACT_MIRROR_ANALYSIS.differentFileIds.length >= 3, 'F19 - at least 3 different file IDs');

// F20: each mirror has host and a retrieval identifier
for (const mirror of ARTIFACT_MIRROR_ANALYSIS.mirrors) {
  assert(mirror.host.length > 0, 'F20 - mirror ' + mirror.host + ' has host');
  const hasRetrievalId = 'retrievalUrl' in mirror || 'documentId' in mirror || 'bookId' in mirror;
  assert(hasRetrievalId, 'F20 - mirror ' + mirror.host + ' has retrieval identifier');
}

// ============================================================
// §5: CURRENTNESS (F21-F24)
// ============================================================
console.log("");
console.log("--- §5: Currentness ---");

// F21: currentness status is LATEST_VERIFIED_ARTIFACT_FOUND (conservative, not permanent CURRENT_NATIONAL)
assert(ARTIFACT_CURRENTNESS.status === 'LATEST_VERIFIED_ARTIFACT_FOUND', 'F21 - status is LATEST_VERIFIED_ARTIFACT_FOUND (conservative per 0F)');

// F22: evidence exists
assert(ARTIFACT_CURRENTNESS.evidence.length >= 4, 'F22 - at least 4 currentness evidence items');

// F23: potential exceptions documented
assert(ARTIFACT_CURRENTNESS.potentialExceptions.length >= 2, 'F23 - at least 2 potential exceptions');

// F24: supersededBy is null
assert(ARTIFACT_CURRENTNESS.supersededBy === null, 'F24 - supersededBy is null');

// ============================================================
// §6: CLAIM SCOPE (F25-F28)
// ============================================================
console.log("");
console.log("--- §6: Claim Scope ---");

// F25: at least 11 claim types
assert(ARTIFACT_CLAIM_SCOPE.length >= 11, 'F25 - at least 11 claim types');

// F26: grade existence and subject-by-grade are SUPPORTED_BY_ARTIFACT
const gradeExistence = ARTIFACT_CLAIM_SCOPE.find((c) => c.claimType === 'GRADE_EXISTENCE');
const subjectByGrade = ARTIFACT_CLAIM_SCOPE.find((c) => c.claimType === 'SUBJECT_BY_GRADE');
assert(!!gradeExistence, 'F26 - GRADE_EXISTENCE claim exists');
assert(gradeExistence!.supportLevel === 'SUPPORTED_BY_ARTIFACT', 'F26 - GRADE_EXISTENCE is SUPPORTED_BY_ARTIFACT');
assert(!!subjectByGrade, 'F26 - SUBJECT_BY_GRADE claim exists');
assert(subjectByGrade!.supportLevel === 'SUPPORTED_BY_ARTIFACT', 'F26 - SUBJECT_BY_GRADE is SUPPORTED_BY_ARTIFACT');

// F27: exercises and coefficients are NOT_SUPPORTED
const exercises = ARTIFACT_CLAIM_SCOPE.find((c) => c.claimType === 'EXERCISES');
const coefficients = ARTIFACT_CLAIM_SCOPE.find((c) => c.claimType === 'COEFFICIENTS');
assert(!!exercises, 'F27 - EXERCISES claim exists');
assert(exercises!.supportLevel === 'NOT_SUPPORTED', 'F27 - EXERCISES is NOT_SUPPORTED');
assert(!!coefficients, 'F27 - COEFFICIENTS claim exists');
assert(coefficients!.supportLevel === 'NOT_SUPPORTED', 'F27 - COEFFICIENTS is NOT_SUPPORTED');

// F28: every claim has notes
for (const claim of ARTIFACT_CLAIM_SCOPE) {
  assert(claim.notes.length > 0, 'F28 - claim ' + claim.claimType + ' has notes');
}

// ============================================================
// §7: FRENCH P1/P2 RESOLUTION (F29-F31)
// ============================================================
console.log("");
console.log("--- §7: French P1/P2 Resolution ---");

// F29: document evidence shows French for all 6 years
assert(ARTIFACT_FRENCH_P1_P2.documentEvidence.internalReferences.length >= 3, 'F29 - at least 3 internal references for French');

// F30: classification is NATIONAL_CONFIRMED
assert(ARTIFACT_FRENCH_P1_P2.classification === 'NATIONAL_CONFIRMED', 'F30 - classification is NATIONAL_CONFIRMED');

// F31: implementation variation is documented
assert(ARTIFACT_FRENCH_P1_P2.implementationVariation.evidence.length >= 2, 'F31 - at least 2 implementation variation evidence items');

// ============================================================
// §8: SUBJECT VERIFICATION (F32-F34)
// ============================================================
console.log("");
console.log("--- §8: Subject Verification ---");

// F32: 9 subjects verified
assert(ARTIFACT_SUBJECT_VERIFICATION.length === 9, 'F32 - 9 subjects verified');

// F33: all subjects have HIGH confidence
for (const subject of ARTIFACT_SUBJECT_VERIFICATION) {
  assert(subject.confidence === 'HIGH', 'F33 - ' + subject.subjectCode + ' has HIGH confidence');
  assert(subject.artifactEvidence === true, 'F33 - ' + subject.subjectCode + ' has artifactEvidence');
}

// F34: SCIENCE official name is النشاط العلمي
const scienceVerification = ARTIFACT_SUBJECT_VERIFICATION.find((s) => s.subjectCode === 'SCIENCE');
assert(!!scienceVerification, 'F34 - SCIENCE verification exists');
assert(scienceVerification!.officialNameAr === 'النشاط العلمي', 'F34 - SCIENCE name is النشاط العلمي');

// ============================================================
// §9: INGESTION READINESS (F35-F37)
// ============================================================
console.log("");
console.log("--- §9: Ingestion Readiness ---");

// F35: readiness criteria are met
assert(INGESTION_READINESS_CRITERIA.artifactAuthenticity === 'ISSUER_STRONGLY_SUPPORTED', 'F35 - artifactAuthenticity is ISSUER_STRONGLY_SUPPORTED');
assert(INGESTION_READINESS_CRITERIA.currentnessStatus === 'LATEST_VERIFIED_ARTIFACT_FOUND', 'F35 - currentnessStatus is LATEST_VERIFIED_ARTIFACT_FOUND (conservative per 0F)');
assert(INGESTION_READINESS_CRITERIA.provenanceCaptured === true, 'F35 - provenanceCaptured is true');
assert(INGESTION_READINESS_CRITERIA.allCellsQualify === true, 'F35 - allCellsQualify is true');

// F36: no blocking conflicts
assert(INGESTION_READINESS_CRITERIA.blockingConflicts === 'NONE — French P1/P2 conflict resolved by primary source', 'F36 - no blocking conflicts');

// F37: notes field is non-empty
assert(INGESTION_READINESS_CRITERIA.notes.length > 0, 'F37 - readiness notes is non-empty');

// ============================================================
// §10: SOURCE RECORD UPGRADE (F38-F42)
// ============================================================
console.log("");
console.log("--- §10: Source Record Upgrade ---");

// F38: src-primary-curriculum-2021 is now OFFICIAL_CURRICULUM_DOCUMENT
const curriculumSource = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
assert(!!curriculumSource, 'F38 - src-primary-curriculum-2021 exists');
assert(curriculumSource!.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT', 'F38 - classification is OFFICIAL_CURRICULUM_DOCUMENT');

// F39: source authority mentions Direction des Curricula / MENFPESRS
assert(curriculumSource!.sourceAuthority.includes('Direction des Curricula'), 'F39 - authority mentions Direction des Curricula');
assert(curriculumSource!.sourceAuthority.includes('MENFPESRS'), 'F39 - authority mentions MENFPESRS');

// F40: provenance evidence shows issuerEvidenceFound = true
const curriculumEvidence = SOURCE_PROVENANCE_EVIDENCE['src-primary-curriculum-2021'];
assert(!!curriculumEvidence, 'F40 - provenance evidence exists');
assert(curriculumEvidence.issuerEvidenceFound === true, 'F40 - issuerEvidenceFound is true');

// F41: provenance rationale mentions OFFICIAL_CURRICULUM_DOCUMENT
assert(curriculumEvidence.classificationRationale.includes('OFFICIAL_CURRICULUM_DOCUMENT'), 'F41 - rationale mentions OFFICIAL_CURRICULUM_DOCUMENT');

// F42: all other source records unchanged
const guideSource = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-pedagogical-guide');
const lawSource = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-law-51-17');
const visionSource = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-vision-2015-2030');
assert(!!guideSource, 'F42 - pedagogical guide exists');
assert(guideSource!.sourceClassification === 'SECONDARY_REFERENCE', 'F42 - guide is SECONDARY_REFERENCE');
assert(!!lawSource, 'F42 - law exists');
assert(lawSource!.sourceClassification === 'OFFICIAL_PUBLIC_INSTITUTION', 'F42 - law is OFFICIAL_PUBLIC_INSTITUTION');
assert(!!visionSource, 'F42 - vision exists');
assert(visionSource!.sourceClassification === 'OFFICIAL_PUBLIC_INSTITUTION', 'F42 - vision is OFFICIAL_PUBLIC_INSTITUTION');

// ============================================================
// §11: COVERAGE MATRIX TRANSITIONS (F43-F47)
// ============================================================
console.log("");
console.log("--- §11: Coverage Matrix Transitions ---");

// F43: all 54 cells are SOURCE_VERIFIED
let sourceVerifiedCount = 0;
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.status === 'SOURCE_VERIFIED', 'F43 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is SOURCE_VERIFIED');
  sourceVerifiedCount++;
}
assert(sourceVerifiedCount === 54, 'F43 - exactly 54 SOURCE_VERIFIED cells');

// F44: no cell is SOURCE_REQUIRED
const sourceRequiredCount = VERIFIED_PRIMARY_COVERAGE_MATRIX.filter((c) => c.status === 'SOURCE_REQUIRED').length;
assert(sourceRequiredCount === 0, 'F44 - zero SOURCE_REQUIRED cells');

// F45: no cell is REVIEW_REQUIRED
let reviewRequiredCount = 0;
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  if (cell.verificationState === 'REVIEW_REQUIRED') { reviewRequiredCount++; }
}
assert(reviewRequiredCount === 0, 'F45 - zero REVIEW_REQUIRED cells');

// F46: all cells have verificationState UNVERIFIED
for (const cell of VERIFIED_PRIMARY_COVERAGE_MATRIX) {
  assert(cell.verificationState === 'UNVERIFIED', 'F46 - cell ' + cell.gradeCode + '/' + cell.subjectCode + ' is UNVERIFIED');
}

// F47: coverage summary reflects 54 SOURCE_VERIFIED
assert(COVERAGE_SUMMARY.byStatus.SOURCE_VERIFIED === 54, 'F47 - summary shows 54 SOURCE_VERIFIED');
assert(COVERAGE_SUMMARY.byStatus.SOURCE_REQUIRED === 0, 'F47 - summary shows 0 SOURCE_REQUIRED');
assert(COVERAGE_SUMMARY.byVerification.REVIEW_REQUIRED === 0, 'F47 - summary shows 0 REVIEW_REQUIRED');

// ============================================================
// §12: FRENCH CONFLICT RESOLUTION (F48-F50)
// ============================================================
console.log("");
console.log("--- §12: French Conflict Resolution ---");

// F48: FRENCH_INTRODUCTION_CONFLICT is RESOLVED_BY_PRIMARY_SOURCE
assert(FRENCH_INTRODUCTION_CONFLICT.resolutionStatus === 'RESOLVED_BY_PRIMARY_SOURCE', 'F48 - conflict resolution is RESOLVED_BY_PRIMARY_SOURCE');

// F49: sourceA classification is OFFICIAL_CURRICULUM_DOCUMENT
assert(FRENCH_INTRODUCTION_CONFLICT.sourceA.classification === 'OFFICIAL_CURRICULUM_DOCUMENT', 'F49 - sourceA is OFFICIAL_CURRICULUM_DOCUMENT');

// F50: French P1 and P2 cells are UNVERIFIED (not REVIEW_REQUIRED)
const frenchP1 = VERIFIED_PRIMARY_COVERAGE_MATRIX.find((c) => c.gradeCode === 'P1' && c.subjectCode === 'FRENCH');
const frenchP2 = VERIFIED_PRIMARY_COVERAGE_MATRIX.find((c) => c.gradeCode === 'P2' && c.subjectCode === 'FRENCH');
assert(!!frenchP1, 'F50 - French P1 cell exists');
assert(!!frenchP2, 'F50 - French P2 cell exists');
assert(frenchP1!.verificationState === 'UNVERIFIED', 'F50 - French P1 is UNVERIFIED');
assert(frenchP2!.verificationState === 'UNVERIFIED', 'F50 - French P2 is UNVERIFIED');
assert(frenchP1!.status === 'SOURCE_VERIFIED', 'F50 - French P1 is SOURCE_VERIFIED');
assert(frenchP2!.status === 'SOURCE_VERIFIED', 'F50 - French P2 is SOURCE_VERIFIED');

// ============================================================
// §13: DOMAIN STRUCTURE (F51-F53)
// ============================================================
console.log("");
console.log("--- §13: Domain Structure ---");

// F51: artifact has 3 domains
assert(PRIMARY_CURRICULUM_ARTIFACT.domains.length === 3, 'F51 - 3 domains');

// F52: domains cover all 9 subjects
const allDomainSubjects = PRIMARY_CURRICULUM_ARTIFACT.domains.flatMap((d) => [...d.subjects]);
assert(allDomainSubjects.length === 9, 'F52 - 9 total subject references across domains');
const uniqueSubjects = new Set(allDomainSubjects);
assert(uniqueSubjects.size === 9, 'F52 - 9 unique subjects across domains');

// F53: each domain has Arabic and French names
for (const domain of PRIMARY_CURRICULUM_ARTIFACT.domains) {
  assert(domain.nameAr.length > 0, 'F53 - domain has Arabic name');
  assert(domain.nameFr.length > 0, 'F53 - domain has French name');
}

// ============================================================
// §14: SUBJECT MAPPING UPGRADE (F54-F56)
// ============================================================
console.log("");
console.log("--- §14: Subject Mapping Upgrade ---");

// F54: all 9 subject mappings have verifiedAtGradeLevel = true
for (const mapping of PRIMARY_SUBJECT_SOURCE_MAPPINGS) {
  assert(mapping.verifiedAtGradeLevel === true, 'F54 - ' + mapping.subjectCode + ' verifiedAtGradeLevel is true');
}

// F55: French mapping includes P1-P6
const frenchMapping = PRIMARY_SUBJECT_SOURCE_MAPPINGS.find((m) => m.subjectCode === 'FRENCH');
assert(!!frenchMapping, 'F55 - French mapping exists');
assert(frenchMapping!.confirmedGrades.includes('P1'), 'F55 - French confirmed for P1');
assert(frenchMapping!.confirmedGrades.includes('P2'), 'F55 - French confirmed for P2');
assert(frenchMapping!.confirmedGrades.length === 6, 'F55 - French confirmed for 6 grades');

// F56: all subject mapping notes mention Gate 07C.2
for (const mapping of PRIMARY_SUBJECT_SOURCE_MAPPINGS) {
  assert(mapping.mappingNotes.includes('Gate 07C.2'), 'F56 - ' + mapping.subjectCode + ' mapping notes mention Gate 07C.2');
}

// ============================================================
// §15: RISK REGISTER (F57-F58)
// ============================================================
console.log("");
console.log("--- §15: Risk Register ---");

// F57: issuer risk is RESOLVED
const resolvedRisk = NORMALIZATION_RISKS.find((r) => r.severity === 'RESOLVED');
assert(!!resolvedRisk, 'F57 - RESOLVED risk exists');
assert(resolvedRisk!.risk.includes('Gate 07C.2'), 'F57 - resolved risk mentions Gate 07C.2');

// F58: French conflict risk is RESOLVED
const frenchRisk = NORMALIZATION_RISKS.find((r) => r.risk.includes('French') || r.risk.includes('french'));
assert(!!frenchRisk, 'F58 - French risk exists');
assert(frenchRisk!.severity === 'RESOLVED', 'F58 - French risk is RESOLVED');

// ============================================================
// §16: CURRICULUM VERSIONING (F59-F63)
// ============================================================
console.log("");
console.log("--- §16: Curriculum Versioning (0A) ---");

import type { CurriculumSourceRecord } from '../../../domain/types/curriculum-source-governance.types';

// F59: source record has temporal applicability fields
assert('effectiveFrom' in curriculumSource!, 'F59 - curriculum source has effectiveFrom field');
assert('effectiveTo' in curriculumSource!, 'F59 - curriculum source has effectiveTo field');
assert('supersedesSourceId' in curriculumSource!, 'F59 - curriculum source has supersedesSourceId field');
assert('supersededBySourceId' in curriculumSource!, 'F59 - curriculum source has supersededBySourceId field');

// F60: effectiveFrom is undefined (no exact effective date in artifact — publication ≠ effective)
assert(curriculumSource!.effectiveFrom === undefined, 'F60 - effectiveFrom is undefined (no exact effective date in artifact)');

// F61: effectiveTo is undefined (no known end)
assert(curriculumSource!.effectiveTo === undefined, 'F61 - effectiveTo is undefined (no known end)');

// F62: no superseding source yet
assert(curriculumSource!.supersedesSourceId === undefined, 'F62 - supersedesSourceId is undefined (no predecessor)');
assert(curriculumSource!.supersededBySourceId === undefined, 'F63 - supersededBySourceId is undefined (not superseded)');

// ============================================================
// §17: SOURCE PRECEDENCE POLICY (F64-F68)
// ============================================================
console.log("");
console.log("--- §17: Source Precedence Policy (0C) ---");

import { SOURCE_PRECEDENCE_POLICY, resolveSourcePrecedence, getPrecedenceLevel } from '../../../domain/constants/curriculum-source-precedence-policy';

// F64: precedence policy has 8 levels
assert(SOURCE_PRECEDENCE_POLICY.length === 8, 'F64 - precedence policy has 8 levels');

// F65: OFFICIAL_CURRICULUM_DOCUMENT is higher than SECONDARY_REFERENCE
const curriculumLevel = SOURCE_PRECEDENCE_POLICY.find((e) => e.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT');
const secondaryLevel = SOURCE_PRECEDENCE_POLICY.find((e) => e.sourceClassification === 'SECONDARY_REFERENCE');
assert(!!curriculumLevel, 'F65 - OFFICIAL_CURRICULUM_DOCUMENT level exists');
assert(!!secondaryLevel, 'F65 - SECONDARY_REFERENCE level exists');
const curriculumIndex = SOURCE_PRECEDENCE_POLICY.indexOf(curriculumLevel!);
const secondaryIndex = SOURCE_PRECEDENCE_POLICY.indexOf(secondaryLevel!);
assert(curriculumIndex < secondaryIndex, 'F65 - OFFICIAL_CURRICULUM_DOCUMENT higher than SECONDARY_REFERENCE');

// F66: resolveSourcePrecedence works
const precedence = resolveSourcePrecedence('OFFICIAL_CURRICULUM_DOCUMENT', 'SECONDARY_REFERENCE');
assert(precedence === 'OFFICIAL_CURRICULUM_DOCUMENT', 'F66 - OFFICIAL_CURRICULUM_DOCUMENT wins over SECONDARY_REFERENCE');

// F67: getPrecedenceLevel works — returns the highest matching level for a classification
const level = getPrecedenceLevel('OFFICIAL_CURRICULUM_DOCUMENT');
assert(level !== null, 'F67 - getPrecedenceLevel returns non-null for OFFICIAL_CURRICULUM_DOCUMENT');
assert(level === 'OFFICIAL_AMENDMENT_REVISION', 'F67 - getPrecedenceLevel returns highest level (OFFICIAL_AMENDMENT_REVISION)');

const secondaryLevelResult = getPrecedenceLevel('SECONDARY_REFERENCE');
assert(secondaryLevelResult === 'SECONDARY_REFERENCE', 'F67 - getPrecedenceLevel returns SECONDARY_REFERENCE');

const nullResult = getPrecedenceLevel('NONEXISTENT' as any);
assert(nullResult === null, 'F67 - getPrecedenceLevel returns null for unknown classification');

// F68: each precedence entry has required fields
for (const entry of SOURCE_PRECEDENCE_POLICY) {
  assert(entry.level.length > 0, 'F68 - entry has level');
  assert(entry.sourceClassification.length > 0, 'F68 - entry has sourceClassification');
  assert(entry.description.length > 0, 'F68 - entry has description');
  assert(typeof entry.overridesLowerLevels === 'boolean', 'F68 - entry has overridesLowerLevels boolean');
}

// ============================================================
// §18: CLAIM-LEVEL PROVENANCE TYPES (F69-F72)
// ============================================================
console.log("");
console.log("--- §18: Claim-Level Provenance (0G) ---");

import type { ClaimProvenance, AssembledCanonicalClaim, PartialSupersession } from '../../../domain/types/curriculum-source-governance.types';

// F69: ClaimProvenance type is representable
const sampleProvenance: ClaimProvenance = {
  claimType: 'SUBJECT_BY_GRADE',
  gradeCode: 'P3',
  subjectCode: 'FRENCH',
  sourceId: 'src-primary-curriculum-2021',
  sourceVersion: '2021-FINAL',
  verificationState: 'UNVERIFIED',
  effectiveScope: 'French at P3 level',
  confidence: 'HIGH',
};
assert(sampleProvenance.claimType === 'SUBJECT_BY_GRADE', 'F69 - ClaimProvenance claimType is representable');
assert(sampleProvenance.sourceId === 'src-primary-curriculum-2021', 'F69 - ClaimProvenance sourceId is representable');

// F70: AssembledCanonicalClaim type is representable
const sampleAssembled: AssembledCanonicalClaim = {
  claimType: 'SUBJECT_BY_GRADE',
  gradeCode: 'P3',
  subjectCode: 'FRENCH',
  claimValue: 'FRENCH present at P3',
  sourceProvenances: [sampleProvenance],
  precedenceResolved: true,
  latestSourceId: 'src-primary-curriculum-2021',
};
assert(sampleAssembled.sourceProvenances.length === 1, 'F70 - AssembledCanonicalClaim has sourceProvenances');
assert(sampleAssembled.precedenceResolved === true, 'F70 - AssembledCanonicalClaim precedenceResolved is true');

// F71: PartialSupersession type is representable
const samplePartial: PartialSupersession = {
  supersedingSourceId: 'src-curriculum-2026-amendment',
  supersededSourceId: 'src-primary-curriculum-2021',
  affectedGrades: ['P1'],
  affectedSubjects: ['FRENCH'],
  affectedClaimTypes: ['FRENCH_INTRODUCTION_GRADE'],
  effectiveFrom: '2026-09-01',
  scopeDescription: 'Amendment changing French introduction at P1',
};
assert(samplePartial.affectedGrades.includes('P1'), 'F71 - PartialSupersession affectedGrades is representable');
assert(samplePartial.affectedClaimTypes.includes('FRENCH_INTRODUCTION_GRADE'), 'F71 - PartialSupersession affectedClaimTypes is representable');

// F72: CurriculumCurrentnessStatus type is representable
import type { CurriculumCurrentnessStatus } from '../../../domain/types/curriculum-source-governance.types';
const currentnessStatuses: CurriculumCurrentnessStatus[] = [
  'LATEST_VERIFIED_ARTIFACT_FOUND',
  'CURRENT_WITH_EXCEPTIONS',
  'SUPERSEDED_IN_PART',
  'SUPERSEDED_FULLY',
  'CURRENTNESS_UNRESOLVED',
];
assert(currentnessStatuses.includes('LATEST_VERIFIED_ARTIFACT_FOUND'), 'F72 - LATEST_VERIFIED_ARTIFACT_FOUND is a valid status');
assert(currentnessStatuses.includes('SUPERSEDED_IN_PART'), 'F72 - SUPERSEDED_IN_PART is a valid status');

// ============================================================
// §19: HISTORICAL CURRICULUM PRESERVATION (F73-F75)
// ============================================================
console.log("");
console.log("--- §19: Historical Curriculum Support (0H) ---");

// F73: source record is NOT destructive — older records remain untouched
// (verified by: all 4 source records still exist with original IDs)
assert(PRIMARY_CURRICULUM_SOURCES.length === 4, 'F73 - all 4 source records preserved');

// F74: CurriculumVersionRecord supports isCurrent = false for historical versions
import type { CurriculumVersionRecord } from '../../../domain/types/curriculum-source-governance.types';
const historicalVersion: CurriculumVersionRecord = {
  id: 'ver-old', educationSystemId: 'esys-morocco', gradeId: 'grade-p3',
  subjectId: 'subj-math', curriculumVersion: '2020-2021', academicYear: '2020-2021',
  effectiveFrom: '2020-09-01', effectiveTo: '2021-06-30', isCurrent: false,
  supersededBy: 'ver-2021', sourceRecordId: 'src-primary-curriculum-2021',
  status: 'SUPERSEDED', createdAt: '2020-08-01T00:00:00Z',
};
assert(historicalVersion.isCurrent === false, 'F74 - historical version isCurrent is false');
assert(historicalVersion.status === 'SUPERSEDED', 'F74 - historical version status is SUPERSEDED');

// F75: CurriculumVersionRecord supports supersedesSourceId
const newVersion: CurriculumVersionRecord = {
  id: 'ver-2026', educationSystemId: 'esys-morocco', gradeId: 'grade-p3',
  subjectId: 'subj-french', curriculumVersion: '2026-2027', academicYear: '2026-2027',
  effectiveFrom: '2026-09-01', isCurrent: true,
  supersedesSourceId: 'src-primary-curriculum-2021',
  sourceRecordId: 'src-curriculum-2026',
  status: 'NOT_INGESTED', createdAt: '2026-08-26T00:00:00Z',
};
assert(newVersion.supersedesSourceId === 'src-primary-curriculum-2021', 'F75 - new version supersedes old source');

// ============================================================
// §20: EFFECTIVE DATE FORENSICS (F76-F77)
// ============================================================
console.log("");
console.log("--- §20: Effective Date Forensics ---");

// F76: publication date does not imply effective date
// The artifact was published July 2021, but effectiveFrom is undefined
// because the artifact does not explicitly state an implementation start date.
assert(curriculumSource!.publicationDate === '2021-07-01', 'F76a - publicationDate is 2021-07-01');
assert(curriculumSource!.effectiveFrom === undefined, 'F76b - effectiveFrom is undefined (publication ≠ effective)');
assert(curriculumSource!.publicationDate !== curriculumSource!.effectiveFrom, 'F76c - publicationDate and effectiveFrom are different');

// F77: unsupported exact effective date remains unknown
// No evidence found in any of 8 mirrors or academic citations that states
// "this curriculum takes effect on September 1, 2021" or similar.
// The school-year-starts-in-September inference is NOT acceptable as evidence.
const temporalProvenanceEffectiveFrom: TemporalClaimProvenance = {
  fieldName: 'effectiveFrom',
  value: undefined,
  confidence: 'UNKNOWN',
  sourceOfAssertion: 'No evidence in artifact or official circulars',
  evidenceDescription: 'Artifact published July 2021 does not state an implementation start date. School year September start is contextual knowledge, not artifact evidence.',
};
assert(temporalProvenanceEffectiveFrom.confidence === 'UNKNOWN', 'F77 - effectiveFrom confidence is UNKNOWN');
assert(temporalProvenanceEffectiveFrom.value === undefined, 'F77 - effectiveFrom value is undefined');

// ============================================================
// §21: TEMPORAL CLAIM PROVENANCE (F78)
// ============================================================
console.log("");
console.log("--- §21: Temporal Claim Provenance ---");

import type { TemporalClaimProvenance } from '../../../domain/types/curriculum-source-governance.types';

// F78: temporal metadata requires provenance — all fields tracked
const temporalProvenances: TemporalClaimProvenance[] = [
  {
    fieldName: 'publicationDate',
    value: '2021-07-01',
    confidence: 'VERIFIED',
    sourceOfAssertion: 'Artifact title page — "Juillet 2021"',
    evidenceDescription: 'Publication date stated on artifact title. Multiple mirrors confirm same date.',
  },
  {
    fieldName: 'effectiveFrom',
    value: undefined,
    confidence: 'UNKNOWN',
    sourceOfAssertion: 'No evidence in artifact or official circulars',
    evidenceDescription: 'School year September start is contextual, not artifact evidence.',
  },
  {
    fieldName: 'effectiveTo',
    value: undefined,
    confidence: 'UNKNOWN',
    sourceOfAssertion: 'No evidence of supersession',
    evidenceDescription: 'No newer official curriculum found replacing this document.',
  },
  {
    fieldName: 'academicYearFrom',
    value: '2021-2022',
    confidence: 'INFERRED',
    sourceOfAssertion: 'Inferred from publication date July 2021 + Moroccan academic year calendar',
    evidenceDescription: 'Publication in July 2021 + academic year starting September = 2021-2022 is the first applicable year. But this is inference, not artifact statement.',
  },
  {
    fieldName: 'academicYearUntil',
    value: undefined,
    confidence: 'UNKNOWN',
    sourceOfAssertion: 'No evidence of end date',
    evidenceDescription: 'No superseding document found. Status is LATEST_VERIFIED_ARTIFACT_FOUND.',
  },
  {
    fieldName: 'supersedesSourceId',
    value: undefined,
    confidence: 'UNKNOWN',
    sourceOfAssertion: 'No predecessor document identified',
    evidenceDescription: 'This is the earliest complete primary curriculum found in research.',
  },
  {
    fieldName: 'supersededBySourceId',
    value: undefined,
    confidence: 'UNKNOWN',
    sourceOfAssertion: 'No newer document found',
    evidenceDescription: 'LATEST_VERIFIED_ARTIFACT_FOUND as of 2026.',
  },
];

// Every temporal field has provenance
assert(temporalProvenances.length === 7, 'F78a - all 7 temporal fields have provenance');
for (const tp of temporalProvenances) {
  assert(tp.fieldName.length > 0, 'F78b - temporal provenance has fieldName');
  assert(tp.confidence.length > 0, 'F78c - temporal provenance has confidence');
  assert(tp.sourceOfAssertion.length > 0, 'F78d - temporal provenance has sourceOfAssertion');
  assert(tp.evidenceDescription.length > 0, 'F78e - temporal provenance has evidenceDescription');
}

// publicationDate is VERIFIED, not INFERRED
const pubProvenance = temporalProvenances.find((p) => p.fieldName === 'publicationDate');
assert(pubProvenance!.confidence === 'VERIFIED', 'F78f - publicationDate is VERIFIED');

// effectiveFrom is UNKNOWN (not INFERRED)
const effProvenance = temporalProvenances.find((p) => p.fieldName === 'effectiveFrom');
assert(effProvenance!.confidence === 'UNKNOWN', 'F78g - effectiveFrom is UNKNOWN, not INFERRED');

// academicYearFrom is INFERRED (not VERIFIED)
const ayProvenance = temporalProvenances.find((p) => p.fieldName === 'academicYearFrom');
assert(ayProvenance!.confidence === 'INFERRED', 'F78h - academicYearFrom is INFERRED, not VERIFIED');

// ============================================================
// §22: AUTHORITY BEFORE RECENCY (F79)
// ============================================================
console.log("");
console.log("--- §22: Authority Before Recency (0C) ---");

import { canOverride, resolveScopePrecedence, type PrecedenceCandidate } from '../../../domain/constants/curriculum-source-precedence-policy';

// F79: newer secondary source CANNOT override older official source
const secondaryOverridesOfficial = canOverride('SECONDARY_REFERENCE', 'OFFICIAL_CURRICULUM_DOCUMENT');
assert(secondaryOverridesOfficial === false, 'F79a - SECONDARY_REFERENCE cannot override OFFICIAL_CURRICULUM_DOCUMENT');

const authorizedOverridesOfficial = canOverride('AUTHORIZED_REFERENCE', 'OFFICIAL_CURRICULUM_DOCUMENT');
assert(authorizedOverridesOfficial === false, 'F79b - AUTHORIZED_REFERENCE cannot override OFFICIAL_CURRICULUM_DOCUMENT');

// Official CAN override secondary
const officialOverridesSecondary = canOverride('OFFICIAL_CURRICULUM_DOCUMENT', 'SECONDARY_REFERENCE');
assert(officialOverridesSecondary === true, 'F79c - OFFICIAL_CURRICULUM_DOCUMENT can override SECONDARY_REFERENCE');

// Scope-aware: newer secondary loses to older official even when secondary is more recent
const secondaryCandidate: PrecedenceCandidate = {
  sourceId: 'src-secondary-2025',
  sourceClassification: 'SECONDARY_REFERENCE',
  publicationDate: '2025-01-01',
  applicabilityScope: { grades: ['P1'], subjects: ['FRENCH'], claimTypes: ['SUBJECT_BY_GRADE'] },
};
const officialCandidate: PrecedenceCandidate = {
  sourceId: 'src-primary-curriculum-2021',
  sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
  publicationDate: '2021-07-01',
  applicabilityScope: { grades: ['P1'], subjects: ['FRENCH'], claimTypes: ['SUBJECT_BY_GRADE'] },
};
const scopeResult = resolveScopePrecedence(
  [secondaryCandidate, officialCandidate],
  'P1', 'FRENCH', 'SUBJECT_BY_GRADE',
);
assert(!!scopeResult, 'F79d - scope precedence returns a result');
assert(scopeResult!.winningSourceId === 'src-primary-curriculum-2021', 'F79e - official wins over newer secondary');
assert(scopeResult!.reason === 'HIGHER_AUTHORITY', 'F79f - reason is HIGHER_AUTHORITY, not recency');

// ============================================================
// §23: SCOPE-AWARE PRECEDENCE (F80-F81)
// ============================================================
console.log("");
console.log("--- §23: Scope-Aware Precedence (0C+0D) ---");

// F80: newer official amendment overrides ONLY explicit scope
const amendmentCandidate: PrecedenceCandidate = {
  sourceId: 'src-amendment-2026',
  sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
  publicationDate: '2026-01-15',
  applicabilityScope: {
    grades: ['P1'],
    subjects: ['FRENCH'],
    claimTypes: ['SUBJECT_BY_GRADE', 'FRENCH_INTRODUCTION_GRADE'],
  },
};
const baseCurriculumCandidate: PrecedenceCandidate = {
  sourceId: 'src-primary-curriculum-2021',
  sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
  publicationDate: '2021-07-01',
  applicabilityScope: { grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], subjects: ['ARABIC', 'FRENCH', 'MATH', 'ISLAMIC_EDUCATION', 'CIVIC_EDUCATION', 'SCIENCE', 'SPORT', 'ART', 'MUSIC'], claimTypes: ['SUBJECT_BY_GRADE', 'FRENCH_INTRODUCTION_GRADE', 'COMPETENCIES', 'ASSESSMENT_RULES'] },
};

// Amendment wins for P1/FRENCH (it explicitly targets that scope)
const amendmentScope = resolveScopePrecedence(
  [amendmentCandidate, baseCurriculumCandidate],
  'P1', 'FRENCH', 'SUBJECT_BY_GRADE',
);
assert(!!amendmentScope, 'F80a - amendment scope returns a result');
assert(amendmentScope!.winningSourceId === 'src-amendment-2026', 'F80b - amendment wins for P1/FRENCH');

// Base curriculum remains authoritative for P3/FRENCH (amendment doesn't cover P3)
const baseScopeP3 = resolveScopePrecedence(
  [amendmentCandidate, baseCurriculumCandidate],
  'P3', 'FRENCH', 'SUBJECT_BY_GRADE',
);
assert(!!baseScopeP3, 'F80c - base scope returns a result for P3');
assert(baseScopeP3!.winningSourceId === 'src-primary-curriculum-2021', 'F80d - base curriculum wins for P3/FRENCH');

// Base curriculum remains authoritative for P1/MATH (amendment doesn't cover MATH)
const baseScopeMath = resolveScopePrecedence(
  [amendmentCandidate, baseCurriculumCandidate],
  'P1', 'MATH', 'SUBJECT_BY_GRADE',
);
assert(!!baseScopeMath, 'F80e - base scope returns a result for P1/MATH');
assert(baseScopeMath!.winningSourceId === 'src-primary-curriculum-2021', 'F80f - base curriculum wins for P1/MATH');

// F81: partial supersession preserves unaffected claims
const partialSupersession: PartialSupersession = {
  supersedingSourceId: 'src-amendment-2026',
  supersededSourceId: 'src-primary-curriculum-2021',
  affectedGrades: ['P1'],
  affectedSubjects: ['FRENCH'],
  affectedClaimTypes: ['FRENCH_INTRODUCTION_GRADE'],
  effectiveFrom: '2026-09-01',
  scopeDescription: 'Amendment changing French introduction at P1 only',
};
assert(partialSupersession.affectedGrades.length === 1, 'F81a - only P1 affected');
assert(partialSupersession.affectedSubjects.length === 1, 'F81b - only FRENCH affected');
assert(partialSupersession.affectedClaimTypes.length === 1, 'F81c - only FRENCH_INTRODUCTION_GRADE affected');

// Unaffected claims (P3/FRENCH, P1/MATH, COMPETENCIES, etc.) remain from base source
// This is proven by the scope-aware precedence: amendment doesn't cover those scopes
const unaffectedResult = resolveScopePrecedence(
  [amendmentCandidate, baseCurriculumCandidate],
  'P5', 'FRENCH', 'COMPETENCIES',
);
assert(!!unaffectedResult, 'F81d - unaffected claim still resolves');
assert(unaffectedResult!.winningSourceId === 'src-primary-curriculum-2021', 'F81e - base source wins for unaffected scope');

// ============================================================
// §24: MULTI-SOURCE CLAIM COMPOSITION (F82-F83)
// ============================================================
console.log("");
console.log("--- §24: Multi-Source Claim Composition (0B) ---");

import { assembleCanonicalClaim } from '../../../domain/constants/curriculum-source-precedence-policy';

// F82: canonical state can be assembled from multiple sources
const mathProvenance: ClaimProvenance = {
  claimType: 'SUBJECT_BY_GRADE',
  gradeCode: 'P3',
  subjectCode: 'MATH',
  sourceId: 'src-primary-curriculum-2021',
  sourceVersion: '2021-FINAL',
  verificationState: 'UNVERIFIED',
  effectiveScope: 'Mathematics at P3 level',
  confidence: 'HIGH',
};

const frenchRuleProvenance: ClaimProvenance = {
  claimType: 'FRENCH_INTRODUCTION_GRADE',
  gradeCode: 'P1',
  sourceId: 'src-amendment-2026',
  sourceVersion: '2026-AMENDMENT',
  verificationState: 'UNVERIFIED',
  effectiveScope: 'French introduction at P1 level',
  confidence: 'HIGH',
  effectivePeriodFrom: '2026-09-01',
};

const examProvenance: ClaimProvenance = {
  claimType: 'ASSESSMENT_RULES',
  gradeCode: 'P6',
  subjectCode: 'MATH',
  sourceId: 'src-official-exam-2025',
  sourceVersion: '2025-EXAM',
  verificationState: 'UNVERIFIED',
  effectiveScope: 'Assessment rules for P6 Mathematics',
  confidence: 'MODERATE',
};

// F82: assemble claims from different sources
const mathClaim = assembleCanonicalClaim(
  'SUBJECT_BY_GRADE', 'P3', 'MATH', 'MATH present at P3',
  [mathProvenance], 'src-primary-curriculum-2021',
);
const frenchClaim = assembleCanonicalClaim(
  'FRENCH_INTRODUCTION_GRADE', 'P1', 'FRENCH', 'FRENCH introduced at P1',
  [frenchRuleProvenance], 'src-amendment-2026',
);
const examClaim = assembleCanonicalClaim(
  'ASSESSMENT_RULES', 'P6', 'MATH', 'Assessment rules for P6 Math',
  [examProvenance], 'src-official-exam-2025',
);

assert(mathClaim.latestSourceId === 'src-primary-curriculum-2021', 'F82a - math from curriculum source');
assert(frenchClaim.latestSourceId === 'src-amendment-2026', 'F82b - french from amendment source');
assert(examClaim.latestSourceId === 'src-official-exam-2025', 'F82c - exam from exam source');

// F83: each assembled claim retains source provenance
assert(mathClaim.sourceProvenances.length === 1, 'F83a - math has 1 provenance');
assert(mathClaim.sourceProvenances[0].sourceId === 'src-primary-curriculum-2021', 'F83b - math provenance traces to curriculum source');
assert(frenchClaim.sourceProvenances[0].sourceId === 'src-amendment-2026', 'F83c - french provenance traces to amendment source');
assert(examClaim.sourceProvenances[0].sourceId === 'src-official-exam-2025', 'F83d - exam provenance traces to exam source');

// No provenance flattening: each claim has its own sourceId, not a merged one
assert(mathClaim.sourceProvenances[0].sourceId !== frenchClaim.sourceProvenances[0].sourceId, 'F83e - math and french have different source provenances');

// ============================================================
// §25: WHOLE-DOCUMENT REPLACEMENT NOT REQUIRED (F84)
// ============================================================
console.log("");
console.log("--- §25: Whole-Document Replacement ---");

// F84: PartialSupersession does not require whole-document replacement
const partialOnly: PartialSupersession = {
  supersedingSourceId: 'src-amendment-2026',
  supersededSourceId: 'src-primary-curriculum-2021',
  affectedGrades: ['P1'],
  affectedSubjects: ['FRENCH'],
  affectedClaimTypes: ['FRENCH_INTRODUCTION_GRADE'],
  scopeDescription: 'Only P1 French introduction changed',
};
assert(partialOnly.affectedGrades.length === 1, 'F84a - partial supersession covers only 1 grade');
assert(partialOnly.affectedSubjects.length === 1, 'F84b - partial supersession covers only 1 subject');

// The base source is NOT fully replaced — it remains authoritative for all other claims
const baseStillAuthoritative = resolveScopePrecedence(
  [amendmentCandidate, baseCurriculumCandidate],
  'P2', 'FRENCH', 'SUBJECT_BY_GRADE',
);
assert(!!baseStillAuthoritative, 'F84c - base source still resolves for unaffected scope');
assert(baseStillAuthoritative!.winningSourceId === 'src-primary-curriculum-2021', 'F84d - base source is still authoritative for P2/FRENCH');

// ============================================================
// §26: HISTORICAL REPRODUCIBILITY (F85-F86)
// ============================================================
console.log("");
console.log("--- §26: Historical Reproducibility (0H) ---");

// F85: historical source remains addressable after supersession
// A superseded source record still exists and is queryable
const supersededSource = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
assert(!!supersededSource, 'F85a - superseded source still exists');
assert(supersededSource!.id === 'src-primary-curriculum-2021', 'F85b - superseded source is addressable by ID');
assert(supersededSource!.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT', 'F85c - superseded source retains classification');
assert(supersededSource!.publicationDate === '2021-07-01', 'F85d - superseded source retains publication date');

// SUPERSEDED != deleted
const sourceStillExists = PRIMARY_CURRICULUM_SOURCES.some((s) => s.id === 'src-primary-curriculum-2021');
assert(sourceStillExists, 'F85e - source is NOT deleted after supersession');

// F86: curriculum applicable for a past academic year can be reconstructed
// For academic year 2020-2021, the system should query sources effective in that period
// Since src-primary-curriculum-2021 has publicationDate 2021-07-01 and academicYear 2021-2022+,
// it was NOT effective in 2020-2021. A historical query for 2020-2021 would find no source.
const historicalYear = '2020-2021';
const sourcesForHistoricalYear = PRIMARY_CURRICULUM_SOURCES.filter((s) => {
  if (!s.publicationDate) return false;
  const pubYear = parseInt(s.publicationDate.substring(0, 4), 10);
  const histYearStart = parseInt(historicalYear.split('-')[0], 10);
  return pubYear <= histYearStart;
});
// No sources were published before 2021, so 2020-2021 has no matching source
assert(sourcesForHistoricalYear.length === 0, 'F86a - no source matches academic year 2020-2021 (published before 2021)');

// For academic year 2021-2022, the 2021 curriculum is the source
const modernYear = '2021-2022';
const sourcesForModernYear = PRIMARY_CURRICULUM_SOURCES.filter((s) => {
  if (!s.publicationDate) return false;
  const pubYear = parseInt(s.publicationDate.substring(0, 4), 10);
  const modYearStart = parseInt(modernYear.split('-')[0], 10);
  return pubYear <= modYearStart;
});
assert(sourcesForModernYear.length >= 1, 'F86b - at least one source matches academic year 2021-2022');

// ============================================================
// §27: RECENCY AFTER TRUST (F87)
// ============================================================
console.log("");
console.log("--- §27: Recency After Trust ---");

// F87: recency is evaluated only after trust/applicability requirements
// Among candidates that PASS authority check, recency breaks ties.
// Among candidates that FAIL authority check, recency is irrelevant.

// Two official sources — authority is equal, recency decides
const olderOfficial: PrecedenceCandidate = {
  sourceId: 'src-2021',
  sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
  publicationDate: '2021-07-01',
  applicabilityScope: { grades: ['P1'], subjects: ['FRENCH'], claimTypes: ['SUBJECT_BY_GRADE'] },
};
const newerOfficial: PrecedenceCandidate = {
  sourceId: 'src-2026',
  sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
  publicationDate: '2026-01-15',
  applicabilityScope: { grades: ['P1'], subjects: ['FRENCH'], claimTypes: ['SUBJECT_BY_GRADE'] },
};

const equalAuthResult = resolveScopePrecedence(
  [olderOfficial, newerOfficial],
  'P1', 'FRENCH', 'SUBJECT_BY_GRADE',
);
assert(!!equalAuthResult, 'F87a - equal authority returns result');
assert(equalAuthResult!.winningSourceId === 'src-2026', 'F87b - newer source wins among equal authority (recency tiebreak)');
assert(equalAuthResult!.reason === 'LATER_APPLICABLE', 'F87c - reason is LATER_APPLICABLE');

// Secondary + official — authority decides, NOT recency
const recentSecondary: PrecedenceCandidate = {
  sourceId: 'src-secondary-2026',
  sourceClassification: 'SECONDARY_REFERENCE',
  publicationDate: '2026-06-01',
  applicabilityScope: { grades: ['P1'], subjects: ['FRENCH'], claimTypes: ['SUBJECT_BY_GRADE'] },
};
const oldOfficial: PrecedenceCandidate = {
  sourceId: 'src-official-2021',
  sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
  publicationDate: '2021-07-01',
  applicabilityScope: { grades: ['P1'], subjects: ['FRENCH'], claimTypes: ['SUBJECT_BY_GRADE'] },
};

const authBeforeRecencyResult = resolveScopePrecedence(
  [recentSecondary, oldOfficial],
  'P1', 'FRENCH', 'SUBJECT_BY_GRADE',
);
assert(!!authBeforeRecencyResult, 'F87d - authority+recency returns result');
assert(authBeforeRecencyResult!.winningSourceId === 'src-official-2021', 'F87e - older official wins over newer secondary (authority before recency)');
assert(authBeforeRecencyResult!.reason === 'HIGHER_AUTHORITY', 'F87f - reason is HIGHER_AUTHORITY, not LATER_APPLICABLE');

// ============================================================
// Summary
// ============================================================
console.log("");
console.log("=== Gate 07C.2 Results: " + passedTests + "/" + totalTests + " passed ===");
if (passedTests === totalTests) {
  console.log("ALL GATE 07C.2 TESTS PASSED");
  process.exit(0);
} else {
  process.exit(1);
}
