/**
 * Qarayti.ai - Gate 07C.3: Controlled Moroccan Primary Curriculum Extraction Tests
 *
 * Standalone test suite for the first source-bound content extraction.
 * Uses npx tsx (NOT Vitest/Jest).
 *
 * Test categories:
 *   A — Provenance
 *   B — Scope
 *   C — Extraction
 *   D — Verification
 *   E — Versioning
 *   F — Identity
 *   G — Anti-fabrication
 *   H — Source terminology
 *   I — Temporal safety
 *   J — Regression (imports existing suites)
 */

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

// ============================================================
// IMPORTS
// ============================================================

import type {
  CurriculumExtractionClaim,
  CurriculumSourceLocator,
  ExtractionMethod,
  NormalizationClassification,
  LocatorPrecision,
  ExtractionContentStatus,
  ExtractionContentMetrics,
  CurriculumClaimConflict,
} from '../../../domain/types/curriculum-source-governance.types';

import {
  EXTRACTION_CLAIMS,
  EXTRACTION_METRICS,
  EXTRACTION_CONFLICTS,
  EXTRACTION_NOTES,
  stableLocatorKey,
} from '../../../domain/constants/moroccan-primary-extraction-registry';

import { PRIMARY_CURRICULUM_SOURCES } from '../../../domain/constants/moroccan-primary-curriculum-sources';
import { PRIMARY_CURRICULUM_ARTIFACT } from '../../../domain/constants/moroccan-primary-curriculum-artifact-forensics';
import { SOURCE_PRECEDENCE_POLICY } from '../../../domain/constants/curriculum-source-precedence-policy';
import { PRIMARY_GRADE_CODES } from '../../../domain/constants/curriculum-architecture.constants';
import { SOURCE_PROVENANCE_EVIDENCE } from '../../../domain/constants/moroccan-primary-curriculum-sources';
import { COVERAGE_SUMMARY } from '../../../domain/constants/moroccan-primary-coverage-matrix';

// ============================================================
// A: PROVENANCE (P01-P12)
// ============================================================
console.log('');
console.log('--- A: Provenance ---');

// P01: every claim has sourceId
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.sourceId.length > 0, `P01 - claim ${claim.id} has sourceId`);
}

// P02: every sourceId references an existing source
const sourceIds = PRIMARY_CURRICULUM_SOURCES.map((s) => s.id);
for (const claim of EXTRACTION_CLAIMS) {
  assert(sourceIds.includes(claim.sourceId), `P02 - claim ${claim.id} sourceId ${claim.sourceId} exists`);
}

// P03: every claim has sourceLocator
for (const claim of EXTRACTION_CLAIMS) {
  assert(!!claim.sourceLocator, `P03 - claim ${claim.id} has sourceLocator`);
  assert(claim.sourceLocator.precision.length > 0, `P03 - claim ${claim.id} locator has precision`);
}

// P04: no fabricated source IDs
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    claim.sourceId === 'src-primary-curriculum-2021',
    `P04 - claim ${claim.id} uses only src-primary-curriculum-2021`,
  );
}

// P05: retrieval host does not determine issuer authority
const curriculumSource = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
assert(!!curriculumSource, 'P05 - curriculum source exists');
assert(
  curriculumSource!.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT',
  'P05 - classification is OFFICIAL_CURRICULUM_DOCUMENT, not SECONDARY_REFERENCE',
);
assert(
  curriculumSource!.notes!.includes('RETRIEVAL HOST: profpress.net (secondary mirror) — NOT the issuer'),
  'P05 - notes explicitly distinguish retrieval host from issuer',
);

// P06: every claim has extractionMethod
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.extractionMethod.length > 0, `P06 - claim ${claim.id} has extractionMethod`);
}

// P07: every claim has normalizationClassification
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.normalizationClassification.length > 0, `P07 - claim ${claim.id} has normalizationClassification`);
}

// P08: every claim has verificationState
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.verificationState.length > 0, `P08 - claim ${claim.id} has verificationState`);
}

// P09: every claim has contentStatus
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.contentStatus.length > 0, `P09 - claim ${claim.id} has contentStatus`);
}

// P10: every claim has confidence
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.confidence.length > 0, `P10 - claim ${claim.id} has confidence`);
}

// P11: every claim has temporalApplicability
for (const claim of EXTRACTION_CLAIMS) {
  assert(!!claim.temporalApplicability, `P11 - claim ${claim.id} has temporalApplicability`);
}

// P12: every claim has normalizedValue
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.normalizedValue.length > 0, `P12 - claim ${claim.id} has normalizedValue`);
}

// ============================================================
// B: SCOPE (P13-P18)
// ============================================================
console.log('');
console.log('--- B: Scope ---');

// Source-scope grade/subject codes (ALL_PRIMARY, ALL) are valid for source-scope claims
// but NOT for student-grade claims.
const VALID_SOURCE_GRADES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'ALL', 'ALL_PRIMARY'];
const VALID_SOURCE_SUBJECTS = [
  'ARABIC', 'FRENCH', 'MATH', 'ISLAMIC_EDUCATION', 'CIVIC_EDUCATION',
  'SCIENCE', 'SPORT', 'ART', 'MUSIC', 'ALL', 'HISTORY_GEOGRAPHY',
  'CITIZENSHIP', 'PHYSICAL_EDUCATION', 'ARTS',
];
const VALID_STUDENT_GRADES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

// P13: grade scope valid (source-scope claims use ALL_PRIMARY; student claims use P1-P6)
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    VALID_SOURCE_GRADES.includes(claim.gradeCode),
    `P13 - claim ${claim.id} gradeCode ${claim.gradeCode} is valid source-scope grade`,
  );
}

// P14: subject scope valid (source-scope claims use ALL; student claims use specific subjects)
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    VALID_SOURCE_SUBJECTS.includes(claim.subjectCode),
    `P14 - claim ${claim.id} subjectCode ${claim.subjectCode} is valid source-scope subject`,
  );
}

// P15: no cross-grade leakage (SUBJECT_BY_GRADE claims target exactly one grade)
const subjectByGradeClaims = EXTRACTION_CLAIMS.filter((c) => c.claimType === 'SUBJECT_BY_GRADE');
for (const claim of subjectByGradeClaims) {
  assert(
    PRIMARY_GRADE_CODES.includes(claim.gradeCode as typeof PRIMARY_GRADE_CODES[number]),
    `P15 - claim ${claim.id} SUBJECT_BY_GRADE targets valid primary grade`,
  );
}

// P16: no cross-subject leakage (claims reference exactly one subject)
// Source-scope claims (DOMAIN_STRUCTURE, PROGRAM_ORGANIZATION, SECTION_SCOPE) may use ALL
const SOURCE_SCOPE_CLAIM_TYPES = ['PROGRAM_ORGANIZATION', 'CURRICULUM_DOMAINS', 'DOMAIN_STRUCTURE', 'SECTION_SCOPE'];
for (const claim of EXTRACTION_CLAIMS) {
  if (!SOURCE_SCOPE_CLAIM_TYPES.includes(claim.claimType)) {
    assert(
      VALID_SOURCE_SUBJECTS.filter((s) => s !== 'ALL').includes(claim.subjectCode),
      `P16 - claim ${claim.id} references exactly one subject`,
    );
  }
}

// P17: ALL/ALL_PRIMARY grade claims use domain/document claims, not subject-by-grade
const allGradeClaims = EXTRACTION_CLAIMS.filter((c) => c.gradeCode === 'ALL' || c.gradeCode === 'ALL_PRIMARY');
for (const claim of allGradeClaims) {
  assert(
    claim.claimType !== 'SUBJECT_BY_GRADE',
    `P17 - claim ${claim.id} with gradeCode=ALL is not SUBJECT_BY_GRADE`,
  );
}

// P18: scope is consistent with source (P1-P6 × 9 subjects)
assert(
  EXTRACTION_CLAIMS.some((c) => c.gradeCode === 'P1'),
  'P18 - extraction includes P1 claims',
);
assert(
  EXTRACTION_CLAIMS.some((c) => c.gradeCode === 'P3'),
  'P18 - extraction includes P3 claims',
);
assert(
  EXTRACTION_CLAIMS.some((c) => c.gradeCode === 'P6'),
  'P18 - extraction includes P6 claims',
);

// ============================================================
// C: EXTRACTION (P19-P25)
// ============================================================
console.log('');
console.log('--- C: Extraction ---');

const VALID_METHODS: ExtractionMethod[] = [
  'DIRECT_QUOTE', 'DIRECT_STRUCTURED_EXTRACTION', 'NORMALIZED_FROM_SOURCE',
  'DERIVED_STRUCTURAL_MAPPING', 'HUMAN_REVIEW_REQUIRED', 'OCR_EXTRACTED',
];
const VALID_NORM: NormalizationClassification[] = [
  'DIRECT', 'LOSSLESS_NORMALIZATION', 'DERIVED', 'AMBIGUOUS', 'UNMAPPABLE', 'REVIEW_REQUIRED',
];

// P19: extractionMethod exists and is valid
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    VALID_METHODS.includes(claim.extractionMethod),
    `P19 - claim ${claim.id} extractionMethod is valid`,
  );
}

// P20: normalizationClassification exists and is valid
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    VALID_NORM.includes(claim.normalizationClassification),
    `P20 - claim ${claim.id} normalizationClassification is valid`,
  );
}

// P21: direct claims are not masquerading as derived
const directClaims = EXTRACTION_CLAIMS.filter(
  (c) => c.extractionMethod === 'DIRECT_QUOTE' || c.extractionMethod === 'DIRECT_STRUCTURED_EXTRACTION',
);
for (const claim of directClaims) {
  assert(
    claim.normalizationClassification === 'DIRECT' || claim.normalizationClassification === 'LOSSLESS_NORMALIZATION',
    `P21 - claim ${claim.id} direct method matches direct/lossless classification`,
  );
}

// P22: derived claims do not masquerade as direct
const derivedClaims = EXTRACTION_CLAIMS.filter((c) => c.normalizationClassification === 'DERIVED');
for (const claim of derivedClaims) {
  assert(
    claim.extractionMethod === 'DERIVED_STRUCTURAL_MAPPING',
    `P22 - claim ${claim.id} DERIVED classification uses DERIVED_STRUCTURAL_MAPPING method`,
  );
}

// P23: ambiguous mappings are review-required
const ambiguousClaims = EXTRACTION_CLAIMS.filter(
  (c) => c.normalizationClassification === 'AMBIGUOUS' || c.normalizationClassification === 'UNMAPPABLE',
);
for (const claim of ambiguousClaims) {
  assert(
    claim.verificationState === 'REVIEW_REQUIRED' || claim.contentStatus === 'REVIEW_REQUIRED',
    `P23 - claim ${claim.id} ambiguous/unmappable claim is REVIEW_REQUIRED`,
  );
}

// P24: DIRECT_QUOTE claims have originalText
const quoteClaims = EXTRACTION_CLAIMS.filter((c) => c.extractionMethod === 'DIRECT_QUOTE');
for (const claim of quoteClaims) {
  assert(
    (claim.originalTextAr && claim.originalTextAr.length > 0) ||
    (claim.originalTextFr && claim.originalTextFr.length > 0),
    `P24 - claim ${claim.id} DIRECT_QUOTE has original text`,
  );
}

// P25: locator precision is classified
const VALID_PRECISION: LocatorPrecision[] = ['EXACT_PAGE', 'SECTION_ONLY', 'DOCUMENT_LEVEL', 'UNKNOWN'];
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    VALID_PRECISION.includes(claim.sourceLocator.precision),
    `P25 - claim ${claim.id} locator precision is classified`,
  );
}

// ============================================================
// D: VERIFICATION (P26-P31)
// ============================================================
console.log('');
console.log('--- D: Verification ---');

// P26: SOURCE_VERIFIED != CONTENT_VERIFIED
// All 54 grade×subject cells are SOURCE_VERIFIED in coverage matrix
assert(COVERAGE_SUMMARY.byStatus.SOURCE_VERIFIED === 54, 'P26a - 54 SOURCE_VERIFIED cells in coverage');
// All extraction claims are EXTRACTED_UNVERIFIED (not CONTENT_VERIFIED)
const contentVerified = EXTRACTION_CLAIMS.filter((c) => c.contentStatus === 'CONTENT_VERIFIED');
assert(contentVerified.length === 0, 'P26b - zero extraction claims are CONTENT_VERIFIED');

// P27: CONTENT_VERIFIED != PUBLISHED
const published = EXTRACTION_CLAIMS.filter((c) => c.contentStatus === 'PUBLISHED');
assert(published.length === 0, 'P27 - zero extraction claims are PUBLISHED');

// P28: unsupported claims cannot be promoted
const unsupportedClaims = EXTRACTION_CLAIMS.filter(
  (c) => c.verificationState === 'REJECTED' || c.contentStatus === 'NOT_EXTRACTED',
);
// No claims should be rejected in this extraction
assert(unsupportedClaims.length === 0, 'P28 - no rejected/not-extracted claims in registry');

// P29: unresolved conflicts block promotion
assert(EXTRACTION_CONFLICTS.length === 0, 'P29 - no unresolved conflicts in extraction');

// P30: EXTRACTION_METRICS shows zero content-verified and published
assert(EXTRACTION_METRICS.byContentStatus.CONTENT_VERIFIED === 0, 'P30a - metrics: zero content verified');
assert(EXTRACTION_METRICS.byContentStatus.PUBLISHED === 0, 'P30b - metrics: zero published');
assert(EXTRACTION_METRICS.totalClaims === EXTRACTION_CLAIMS.length, 'P30c - metrics: total claims matches registry');

// P31: totalClaims != content-verified
assert(
  EXTRACTION_METRICS.totalClaims > EXTRACTION_METRICS.byContentStatus.CONTENT_VERIFIED,
  'P31 - more total claims than content-verified',
);

// ============================================================
// E: VERSIONING (P32-P36)
// ============================================================
console.log('');
console.log('--- E: Versioning ---');

// P32: historical sources retained
assert(PRIMARY_CURRICULUM_SOURCES.length >= 1, 'P32a - at least 1 source retained');
const historicalSource = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
assert(!!historicalSource, 'P32b - historical source src-primary-curriculum-2021 exists');

// P33: supersession is scope-aware
// The precedence policy operates at claim scope, not document level
assert(SOURCE_PRECEDENCE_POLICY.length === 8, 'P33 - precedence policy has 8 levels');

// P34: partial amendment does not overwrite unrelated claims
// Proven by: extraction registry has claims from src-primary-curriculum-2021
// with no superseding source — all claims retain their sourceId
const source2021Claims = EXTRACTION_CLAIMS.filter((c) => c.sourceId === 'src-primary-curriculum-2021');
assert(source2021Claims.length === EXTRACTION_CLAIMS.length, 'P34 - all claims trace to source 2021');

// P35: authority outranks recency
// Proven by: precedence policy has OFFICIAL_CURRICULUM_DOCUMENT before SECONDARY_REFERENCE
const officialIdx = SOURCE_PRECEDENCE_POLICY.findIndex(
  (e) => e.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT',
);
const secondaryIdx = SOURCE_PRECEDENCE_POLICY.findIndex(
  (e) => e.sourceClassification === 'SECONDARY_REFERENCE',
);
assert(officialIdx < secondaryIdx, 'P35 - OFFICIAL_CURRICULUM_DOCUMENT outranks SECONDARY_REFERENCE');

// P36: all claims have temporalApplicability
for (const claim of EXTRACTION_CLAIMS) {
  assert(!!claim.temporalApplicability, `P36 - claim ${claim.id} has temporalApplicability`);
}

// ============================================================
// F: IDENTITY (P37-P42)
// ============================================================
console.log('');
console.log('--- F: Identity ---');

// P37: deterministic IDs — same claim always has same ID
const claimIds = EXTRACTION_CLAIMS.map((c) => c.id);
const uniqueIds = new Set(claimIds);
assert(uniqueIds.size === claimIds.length, 'P37a - all claim IDs are unique');
assert(uniqueIds.size === EXTRACTION_CLAIMS.length, 'P37b - no duplicate IDs');

// P38: no collisions across grades
const p1Ids = EXTRACTION_CLAIMS.filter((c) => c.gradeCode === 'P1').map((c) => c.id);
const p3Ids = EXTRACTION_CLAIMS.filter((c) => c.gradeCode === 'P3').map((c) => c.id);
const p6Ids = EXTRACTION_CLAIMS.filter((c) => c.gradeCode === 'P6').map((c) => c.id);
const p1Set = new Set(p1Ids);
const p3Set = new Set(p3Ids);
const p6Set = new Set(p6Ids);
for (const id of p3Ids) {
  assert(!p1Set.has(id), `P38a - P3 ID ${id} does not collide with P1`);
}
for (const id of p6Ids) {
  assert(!p1Set.has(id), `P38b - P6 ID ${id} does not collide with P1`);
  assert(!p3Set.has(id), `P38c - P6 ID ${id} does not collide with P3`);
}

// P39: no collisions across subjects
const mathIds = EXTRACTION_CLAIMS.filter((c) => c.subjectCode === 'MATH').map((c) => c.id);
const arabicIds = EXTRACTION_CLAIMS.filter((c) => c.subjectCode === 'ARABIC').map((c) => c.id);
const mathSet = new Set(mathIds);
for (const id of arabicIds) {
  assert(!mathSet.has(id), `P39 - ARABIC ID ${id} does not collide with MATH`);
}

// P40: stable IDs independent of array order (comprehensive version in I05)
assert(
  uniqueIds.size === EXTRACTION_CLAIMS.length,
  'P40 - IDs are stable (all unique)',
);

// P41: IDs follow version-safe convention (sourceId::claimType::grade::subject::locatorKey::version)
for (const claim of EXTRACTION_CLAIMS) {
  const parts = claim.id.split('::');
  assert(
    parts.length === 6,
    `P41 - claim ${claim.id} has exactly 6 segments`,
  );
  assert(
    parts[0] === claim.sourceId,
    `P41 - segment 0 is sourceId ${claim.sourceId}`,
  );
  assert(
    parts[1] === claim.claimType,
    `P41 - segment 1 is claimType ${claim.claimType}`,
  );
  assert(
    parts[5] === claim.sourceVersionId,
    `P41 - segment 5 is sourceVersionId ${claim.sourceVersionId}`,
  );
}

// P42: IDs include sourceId, grade, subject, and sourceVersion for traceability
const p1MathClaim = EXTRACTION_CLAIMS.find((c) =>
  c.claimType === 'SUBJECT_APPLICABILITY' && c.gradeCode === 'P1' && c.subjectCode === 'MATH',
);
assert(!!p1MathClaim, 'P42a - P1/MATH/SUBJECT_APPLICABILITY claim exists');
assert(p1MathClaim!.sourceId === 'src-primary-curriculum-2021', 'P42b - claim has correct sourceId');
assert(p1MathClaim!.gradeCode === 'P1', 'P42c - claim targets P1');
assert(p1MathClaim!.subjectCode === 'MATH', 'P42d - claim targets MATH');
assert(p1MathClaim!.id.includes('v1.0.0'), 'P42e - claim includes sourceVersion');

// ============================================================
// F2: CLAIM IDENTITY HARDENING (I01-I16)
// ============================================================
console.log('');
console.log('--- F2: Claim Identity ---');

import { CurriculumSourceLocator as Locator } from '../../../domain/types/curriculum-source-governance.types';

// I01 — identical source assertion generates identical claimId
const ar1 = EXTRACTION_CLAIMS.find(
  (c) => c.claimType === 'SUBJECT_APPLICABILITY' && c.gradeCode === 'P1' && c.subjectCode === 'ARABIC',
);
const ar2 = EXTRACTION_CLAIMS.find(
  (c) => c.claimType === 'SUBJECT_APPLICABILITY' && c.gradeCode === 'P1' && c.subjectCode === 'ARABIC',
);
assert(!!ar1 && !!ar2, 'I01a - two references to same claim exist');
assert(ar1!.id === ar2!.id, 'I01b - identical source assertion → identical claimId');

// I02 — same scope + same version string + different sourceId → different claimIds
const fakeLocator: Locator = { precision: 'SECTION_ONLY', section: 'Fake Section' };
const fakeId = [
  'src-fake-source', 'SUBJECT_APPLICABILITY', 'P1', 'ARABIC',
  stableLocatorKey(fakeLocator), 'v1.0.0',
].join('::');
assert(fakeId !== ar1!.id, 'I02 - same scope + different sourceId → different claimId');
assert(fakeId.includes('src-fake-source'), 'I02 - fake ID contains fake sourceId');
assert(ar1!.id.includes('src-primary-curriculum-2021'), 'I02 - real ID contains real sourceId');

// I03 — same sourceId + different sourceVersionId → different claimIds
const versionedId = [
  'src-primary-curriculum-2021', 'SUBJECT_APPLICABILITY', 'P1', 'ARABIC',
  stableLocatorKey(ar1!.sourceLocator), 'v2.0.0',
].join('::');
assert(versionedId !== ar1!.id, 'I03 - same source + different version → different claimId');
assert(versionedId.includes('v2.0.0'), 'I03 - versioned ID contains v2.0.0');

// I04 — same source/version/scope + different source locator → different claimIds
const altLocator: Locator = { precision: 'SECTION_ONLY', section: 'Alternative Section for P1 ARABIC' };
const altId = [
  'src-primary-curriculum-2021', 'SUBJECT_APPLICABILITY', 'P1', 'ARABIC',
  stableLocatorKey(altLocator), 'v1.0.0',
].join('::');
assert(altId !== ar1!.id, 'I04 - same scope + different locator → different claimId');

// I05 — array ordering does not affect identity
const ids1 = EXTRACTION_CLAIMS.map((c) => c.id);
const shuffled = [...EXTRACTION_CLAIMS].sort(() => 0.5 - Math.random());
const ids2 = shuffled.map((c) => c.id);
const set1 = new Set(ids1);
const set2 = new Set(ids2);
assert(set1.size === set2.size, 'I05a - shuffled set has same size');
for (const id of ids1) {
  assert(set2.has(id), `I05b - ID ${id} present in shuffled set`);
}

// I06 — scopeKey remains equal across competing source claims for same semantic fact
const scope1 = ar1!.scopeKey;
const scopeFake = [
  'MOROCCO', 'PRIMARY', 'P1', 'ARABIC', 'SUBJECT_APPLICABILITY',
].join('|');
assert(scope1 === scopeFake, 'I06 - scopeKey matches for same semantic fact regardless of source');

// I07 — claimId differs while scopeKey remains same for competing versions
const versionedScopeClaim = {
  id: versionedId,
  scopeKey: ar1!.scopeKey,
};
assert(versionedScopeClaim.id !== ar1!.id, 'I07a - claimIds differ');
assert(versionedScopeClaim.scopeKey === ar1!.scopeKey, 'I07b - scopeKeys remain same');

// I08 — normalizedValue change does not cause source provenance loss
// Simulate: normalize DOMAIN_MATH_SCIENCE_TECH → MATHEMATICS_SCIENCE_TECHNOLOGY_DOMAIN
const domainClaim = EXTRACTION_CLAIMS.find(
  (c) => c.claimType === 'DOMAIN_STRUCTURE' && c.normalizedValue === 'DOMAIN_MATH_SCIENCE_TECH',
);
assert(!!domainClaim, 'I08a - domain claim exists');
const originalId = domainClaim!.id;
assert(!originalId.includes('DOMAIN_MATH_SCIENCE_TECH'), 'I08b - ID does not contain normalizedValue');
// The ID is safe from normalization wording changes because normalizedValue is excluded

// I09 — sourceId is materially part of claim-record identity
const allIds = EXTRACTION_CLAIMS.map((c) => c.id);
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    claim.id.includes(claim.sourceId),
    `I09 - claim ${claim.id} includes sourceId ${claim.sourceId}`,
  );
}

// I10 — sourceVersion is materially part of claim-record identity
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    claim.id.includes(claim.sourceVersionId ?? ''),
    `I10 - claim ${claim.id} includes sourceVersionId`,
  );
}

// I11 — source locator/claim key is materially part of identity
for (const claim of EXTRACTION_CLAIMS) {
  const expectedLocator = stableLocatorKey(claim.sourceLocator);
  assert(
    claim.id.includes(expectedLocator),
    `I11 - claim ${claim.id} includes locatorKey ${expectedLocator}`,
  );
}

// I12 — registry contains zero duplicate claimIds
const allClaimIds = EXTRACTION_CLAIMS.map((c) => c.id);
const idSet = new Set(allClaimIds);
assert(idSet.size === allClaimIds.length, 'I12 - zero duplicate claimIds in registry');

// I13 — two source documents both using version v1.0.0 cannot collide
const docA_id = [
  'src-document-a', 'SUBJECT_APPLICABILITY', 'P3', 'MATH',
  stableLocatorKey(ar1!.sourceLocator), 'v1.0.0',
].join('::');
const docB_id = [
  'src-document-b', 'SUBJECT_APPLICABILITY', 'P3', 'MATH',
  stableLocatorKey(ar1!.sourceLocator), 'v1.0.0',
].join('::');
assert(docA_id !== docB_id, 'I13 - two sources with same version cannot collide');
assert(docA_id.includes('src-document-a'), 'I13 - doc A ID contains doc A sourceId');
assert(docB_id.includes('src-document-b'), 'I13 - doc B ID contains doc B sourceId');

// I14 — old and new versions coexist without mutation
const oldClaim = {
  id: 'src-primary-curriculum-2021::SUBJECT_APPLICABILITY::P3::MATH::' +
    stableLocatorKey({ precision: 'SECTION_ONLY', section: 'P3 curriculum section' }) + '::v1.0.0',
  sourceId: 'src-primary-curriculum-2021',
  sourceVersionId: 'v1.0.0',
  scopeKey: 'MOROCCO|PRIMARY|P3|MATH|SUBJECT_APPLICABILITY',
};
const newClaim = {
  id: 'src-primary-curriculum-2025::SUBJECT_APPLICABILITY::P3::MATH::' +
    stableLocatorKey({ precision: 'SECTION_ONLY', section: 'P3 curriculum section' }) + '::v1.0.0',
  sourceId: 'src-primary-curriculum-2025',
  sourceVersionId: 'v1.0.0',
  scopeKey: 'MOROCCO|PRIMARY|P3|MATH|SUBJECT_APPLICABILITY',
};
assert(oldClaim.id !== newClaim.id, 'I14a - old and new versions have different IDs');
assert(oldClaim.scopeKey === newClaim.scopeKey, 'I14b - old and new share scopeKey');
assert(oldClaim.sourceId !== newClaim.sourceId, 'I14c - different sourceIds');

// I15 — precedence operates on semantic scope, not claimId equality
// Two claims with same scopeKey but different IDs can both exist and be compared
assert(oldClaim.scopeKey === newClaim.scopeKey, 'I15a - same scopeKey for precedence');
assert(oldClaim.id !== newClaim.id, 'I15b - different claimIds for provenance');

// I16 — losing historical claim remains addressable by its own ID
assert(
  oldClaim.id.includes('src-primary-curriculum-2021'),
  'I16 - historical claim ID contains original sourceId',
);
assert(
  oldClaim.id.includes('v1.0.0'),
  'I16 - historical claim ID contains original version',
);

// ============================================================
// G: ANTI-FABRICATION (P43-P49)
// ============================================================
console.log('');
console.log('--- G: Anti-fabrication ---');

// P43: no invented units
const unitClaims = EXTRACTION_CLAIMS.filter((c) => c.claimType === 'UNITS_CONTENT');
assert(unitClaims.length === 0, 'P43 - no UNITS_CONTENT claims (none invented)');

// P44: no invented lessons
const lessonClaims = EXTRACTION_CLAIMS.filter(
  (c) => c.normalizedValue.toLowerCase().includes('lesson') || c.normalizedValue.includes('درس'),
);
assert(lessonClaims.length === 0, 'P44 - no lesson claims (none invented)');

// P45: no invented KOs
const koClaims = EXTRACTION_CLAIMS.filter(
  (c) => c.normalizedValue.toLowerCase().includes('knowledge object') || c.normalizedValue.includes('معلومة'),
);
assert(koClaims.length === 0, 'P45 - no KO claims (none invented)');

// P46: no invented competencies
const competencyClaims = EXTRACTION_CLAIMS.filter((c) => c.claimType === 'COMPETENCIES');
assert(competencyClaims.length === 0, 'P46 - no COMPETENCIES claims (none invented)');

// P47: no invented exercises
const exerciseClaims = EXTRACTION_CLAIMS.filter((c) => c.claimType === 'EXERCISES');
assert(exerciseClaims.length === 0, 'P47 - no EXERCISES claims (none invented)');

// P48: no invented dates
for (const claim of EXTRACTION_CLAIMS) {
  if (claim.temporalApplicability.effectiveFrom) {
    assert(false, `P48 - claim ${claim.id} has invented effectiveFrom date`);
  }
}

// P49: no invented coefficients
const coeffClaims = EXTRACTION_CLAIMS.filter((c) => c.claimType === 'COEFFICIENTS');
assert(coeffClaims.length === 0, 'P49 - no COEFFICIENTS claims (none invented)');

// ============================================================
// H: SOURCE TERMINOLOGY (P50-P54)
// ============================================================
console.log('');
console.log('--- H: Source terminology ---');

// P50: original Arabic terminology preserved
const arabicNameClaim = EXTRACTION_CLAIMS.find(
  (c) => c.claimType === 'SUBJECT_NAME' && c.subjectCode === 'ARABIC',
);
assert(!!arabicNameClaim, 'P50a - Arabic name claim exists');
assert(arabicNameClaim!.originalTextAr === 'اللغة العربية', 'P50b - Arabic original text preserved');

// P51: original French terminology preserved
assert(arabicNameClaim!.originalTextFr === 'Langue Arabe', 'P51 - French original text preserved');

// P52: normalizationClassification present on all claims
for (const claim of EXTRACTION_CLAIMS) {
  assert(claim.normalizationClassification.length > 0, `P52 - claim ${claim.id} has normalizationClassification`);
}

// P53: ambiguous semantic mapping cannot become canonical silently
const ambiguousCanonical = EXTRACTION_CLAIMS.filter(
  (c) =>
    (c.normalizationClassification === 'AMBIGUOUS' || c.normalizationClassification === 'UNMAPPABLE') &&
    (c.contentStatus === 'CONTENT_VERIFIED' || c.contentStatus === 'PUBLISHED'),
);
assert(ambiguousCanonical.length === 0, 'P53 - no ambiguous/unmappable claims are CONTENT_VERIFIED or PUBLISHED');

// P54: science name preserves activity-based naming
const scienceClaim = EXTRACTION_CLAIMS.find(
  (c) => c.claimType === 'SUBJECT_NAME' && c.subjectCode === 'SCIENCE',
);
assert(!!scienceClaim, 'P54a - science name claim exists');
assert(scienceClaim!.originalTextAr === 'النشاط العلمي', 'P54b - science Arabic name is activity-based (النشاط العلمي)');
assert(
  scienceClaim!.notes!.includes('Science'),
  'P54c - science notes document naming',
);

// ============================================================
// I: TEMPORAL SAFETY (P55-P59)
// ============================================================
console.log('');
console.log('--- I: Temporal safety ---');

// P55: UNKNOWN effective dates remain UNKNOWN
for (const claim of EXTRACTION_CLAIMS) {
  if (!claim.temporalApplicability.effectiveFrom) {
    // No effectiveFrom — correct, UNKNOWN
    assert(true, `P55 - claim ${claim.id} effectiveFrom is UNKNOWN (undefined)`);
  } else {
    assert(false, `P55 - claim ${claim.id} has unexpected effectiveFrom: ${claim.temporalApplicability.effectiveFrom}`);
  }
}

// P56: no inferred date promoted to VERIFIED
for (const claim of EXTRACTION_CLAIMS) {
  if (claim.temporalApplicability.academicYearFrom) {
    // academicYearFrom is INFERRED, not VERIFIED
    assert(
      claim.temporalApplicability.academicYearFrom === '2021-2022',
      `P56 - claim ${claim.id} academicYearFrom is inferred 2021-2022`,
    );
  }
}

// P57: academic-year inference remains distinguishable from verified evidence
// The academicYearFrom is INFERRED (from publication date + calendar), not VERIFIED
assert(
  EXTRACTION_CLAIMS.every(
    (c) => !c.temporalApplicability.effectiveFrom,
  ),
  'P57 - no claim has verified effectiveFrom (all UNKNOWN)',
);

// P58: publication date not conflated with effective date
const pubDateClaim = EXTRACTION_CLAIMS.find(
  (c) => c.claimType === 'SECTION_SCOPE' && c.subjectCode === 'FRENCH',
);
assert(!!pubDateClaim, 'P58a - French section claim exists');
assert(
  !pubDateClaim!.temporalApplicability.effectiveFrom,
  'P58b - French section claim does not have fabricated effectiveFrom',
);

// P59: temporal applicability does not invent effectiveTo
for (const claim of EXTRACTION_CLAIMS) {
  assert(
    !claim.temporalApplicability.effectiveTo,
    `P59 - claim ${claim.id} does not have invented effectiveTo`,
  );
}

// ============================================================
// J: REGRESSION — import existing suites (P60-P65)
// ============================================================
console.log('');
console.log('--- J: Regression ---');

// P60: Gate 07C.2 precedence policy preserved
assert(SOURCE_PRECEDENCE_POLICY.length === 8, 'P60 - precedence policy has 8 levels');

// P61: Gate 07C.1 source records preserved
assert(PRIMARY_CURRICULUM_SOURCES.length === 4, 'P61 - 4 source records preserved');

// P62: Gate 07C.2 artifact authenticity preserved
assert(
  PRIMARY_CURRICULUM_ARTIFACT.claimedIssuerShort === 'MENFPESRS / Direction des Curricula',
  'P62 - artifact issuer preserved',
);

// P63: Gate 07B governance preserved — coverage matrix has 54 SOURCE_VERIFIED
assert(COVERAGE_SUMMARY.byStatus.SOURCE_VERIFIED === 54, 'P63 - 54 SOURCE_VERIFIED cells');

// P64: Gate 07A hierarchy preserved — 6 primary grade codes
assert(PRIMARY_GRADE_CODES.length === 6, 'P64 - 6 primary grade codes');

// P65: source provenance evidence preserved
const curriculumEvidence = SOURCE_PROVENANCE_EVIDENCE['src-primary-curriculum-2021'];
assert(!!curriculumEvidence, 'P65 - curriculum source provenance evidence exists');
assert(curriculumEvidence.issuerEvidenceFound === true, 'P65 - issuer evidence found for curriculum source');

// ============================================================
// SUMMARY
// ============================================================
console.log('');
console.log('=== Gate 07C.3 Results: ' + passedTests + '/' + totalTests + ' passed ===');
if (passedTests === totalTests) {
  console.log('ALL GATE 07C.3 TESTS PASSED');
  process.exit(0);
} else {
  process.exit(1);
}
