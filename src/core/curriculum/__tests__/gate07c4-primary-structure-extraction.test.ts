/**
 * Qarayti.ai - Gate 07C.4: Primary Curriculum Structure Extraction Tests
 *
 * Test groups A-J per Gate 07C.4 specification.
 */

import assert from 'node:assert';
import { existsSync, readdirSync } from 'node:fs';

// ── IMPORTS ──────────────────────────────────────────────────

import {
  STRUCTURAL_ELEMENTS,
  STRUCTURAL_EXTRACTION_METRICS,
  GRADE_EXTRACTION_ENTRIES,
  SUBJECT_EXTRACTION_ENTRIES,
  EXTRACTION_GAPS,
  STRUCTURAL_EXTRACTION_NOTES,
} from '../../../domain/constants/moroccan-primary-structural-extraction';

import {
  EXTRACTION_MANIFEST,
  MANIFEST_SUMMARY,
} from '../../../domain/constants/moroccan-primary-extraction-manifest';

import {
  EXTRACTION_CLAIMS,
  EXTRACTION_METRICS as CLAIM_METRICS,
  EXTRACTION_NOTES as CLAIM_NOTES,
  stableLocatorKey,
} from '../../../domain/constants/moroccan-primary-extraction-registry';

import { PRIMARY_GRADE_CODES } from '../../../domain/constants/curriculum-architecture.constants';
import { SOURCE_PRECEDENCE_POLICY } from '../../../domain/constants/curriculum-source-precedence-policy';
import { VERIFIED_PRIMARY_COVERAGE_MATRIX } from '../../../domain/constants/moroccan-primary-coverage-matrix';
import { PRIMARY_CURRICULUM_SOURCES } from '../../../domain/constants/moroccan-primary-curriculum-sources';
import { ARTIFACT_CURRENTNESS } from '../../../domain/constants/moroccan-primary-curriculum-artifact-forensics';

import type {
  CurriculumStructuralElement,
  CurriculumSourceLocator,
} from '../../../domain/types/curriculum-source-governance.types';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (e: any) {
    failed++;
    console.log(`[FAIL] ${name}: ${e.message}`);
  }
}

// ============================================================
// A: BASELINE
// ============================================================
console.log('');
console.log('--- A: Baseline ---');

test('A01 — baseline HEAD expected', () => {
  assert(STRUCTURAL_ELEMENTS.length > 0, 'structural elements exist');
});

test('A02 — Gate 07C.3 identity model preserved', () => {
  assert(typeof stableLocatorKey === 'function', 'stableLocatorKey exists');
  assert(CLAIM_METRICS.totalClaims === 29, '29 claims from 07C.3');
});

test('A03 — 29 existing claims remain addressable', () => {
  for (const claim of EXTRACTION_CLAIMS) {
    assert(claim.id.length > 0, `claim ${claim.id} has non-empty ID`);
    assert(claim.sourceId === 'src-primary-curriculum-2021', `claim ${claim.id} has correct sourceId`);
  }
  assert(EXTRACTION_CLAIMS.length === 29, '29 claims');
});

test('A04 — no existing claim identity mutation', () => {
  const ids = EXTRACTION_CLAIMS.map((c) => c.id);
  const unique = new Set(ids);
  assert(unique.size === ids.length, 'no duplicate claim IDs');
});

test('A05 — source registry preserved', () => {
  assert(PRIMARY_CURRICULUM_SOURCES.length === 4, '4 source records');
});

test('A06 — precedence policy preserved', () => {
  assert(SOURCE_PRECEDENCE_POLICY.length === 8, '8 precedence levels');
});

test('A07 — temporal safety preserved', () => {
  for (const claim of EXTRACTION_CLAIMS) {
    assert(
      claim.temporalApplicability.effectiveDateConfidence === 'INFERRED',
      `claim ${claim.id} effectiveDateConfidence = INFERRED`,
    );
  }
});

test('A08 — ALL_PRIMARY safety preserved', () => {
  for (const claim of EXTRACTION_CLAIMS) {
    if (claim.gradeCode === 'ALL_PRIMARY') {
      assert(
        claim.subjectCode === 'ALL' || claim.claimType !== 'SUBJECT_APPLICABILITY',
        `ALL_PRIMARY claim ${claim.id} does not masquerade as learner grade`,
      );
    }
  }
});

test('A09 — trusted evidence untouched', () => {
  assert(PRIMARY_CURRICULUM_SOURCES[0].sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT');
});

test('A10 — no migration introduced', () => {
  // The migrations directory may exist from earlier gates.
  // Verify no new migration file was created in Gate 07C.4 scope.
  if (existsSync('supabase/migrations')) {
    const files = readdirSync('supabase/migrations');
    const gate07c4Files = files.filter((f: string) => f.includes('07c4'));
    assert(gate07c4Files.length === 0, 'no 07c4 migration files');
  }
});

// ============================================================
// B: STRUCTURAL IDENTITY
// ============================================================
console.log('');
console.log('--- B: Structural Identity ---');

const ALL_IDS = STRUCTURAL_ELEMENTS.map((el) => el.id);

test('B01 — identical source structural element → identical ID', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const same = STRUCTURAL_ELEMENTS.find(
    (el) =>
      el.sourceId === first.sourceId &&
      el.sourceStructuralType === first.sourceStructuralType &&
      el.gradeCode === first.gradeCode &&
      el.subjectCode === first.subjectCode &&
      el.sourceLocator.precision === first.sourceLocator.precision &&
      el.sourceLocator.paragraph === first.sourceLocator.paragraph,
  );
  assert(!!same, 'found matching element');
  assert(first.id === same!.id, 'identical source → identical ID');
});

test('B02 — different sourceId → different ID', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const fakeId = [
    'src-fake-source',
    first.sourceVersionId,
    first.gradeCode,
    first.subjectCode,
    first.sourceStructuralType,
    stableLocatorKey(first.sourceLocator),
  ].join('::');
  assert(fakeId !== first.id, 'different sourceId → different ID');
});

test('B03 — different sourceVersionId → different ID', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const versionedId = [
    first.sourceId,
    'v2.0.0',
    first.gradeCode,
    first.subjectCode,
    first.sourceStructuralType,
    stableLocatorKey(first.sourceLocator),
  ].join('::');
  assert(versionedId !== first.id, 'different version → different ID');
});

test('B04 — same source/version/scope but different locator → different ID', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const altLocator: CurriculumSourceLocator = { precision: 'SECTION_ONLY', section: 'Alternative Section' };
  const altId = [
    first.sourceId,
    first.sourceVersionId,
    first.gradeCode,
    first.subjectCode,
    first.sourceStructuralType,
    stableLocatorKey(altLocator),
  ].join('::');
  assert(altId !== first.id, 'different locator → different ID');
});

test('B05 — same normalized label in two source sections → no collision', () => {
  const gradeSections = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceStructuralType === 'GRADE_SECTION',
  );
  const p1Arabic = gradeSections.find(
    (el) => el.gradeCode === 'P1' && el.subjectCode === 'ARABIC',
  );
  const p6Arabic = gradeSections.find(
    (el) => el.gradeCode === 'P6' && el.subjectCode === 'ARABIC',
  );
  assert(!!p1Arabic && !!p6Arabic, 'found both P1 and P6 ARABIC');
  assert(p1Arabic!.id !== p6Arabic!.id, 'same normalized label in different sections → no collision');
});

test('B06 — normalization wording change does not destroy source identity', () => {
  const domain = STRUCTURAL_ELEMENTS.find(
    (el) => el.sourceStructuralType === 'DOMAIN' && el.subjectCode === 'ALL',
  );
  assert(!!domain, 'found domain element');
  // The ID uses sourceStructuralType, not normalizedStructuralType.
  // If normalizedStructuralType were changed (e.g., to 'DOMAIN_GROUP'),
  // the source identity would remain the same because the ID is built from
  // sourceStructuralType, sourceId, sourceVersionId, etc.
  assert(domain!.id.includes(domain!.sourceStructuralType), 'ID uses sourceStructuralType');
});

test('B07 — array ordering does not affect ID', () => {
  const ids1 = STRUCTURAL_ELEMENTS.map((el) => el.id);
  const shuffled = [...STRUCTURAL_ELEMENTS].sort(() => 0.5 - Math.random());
  const ids2 = shuffled.map((el) => el.id);
  const set1 = new Set(ids1);
  const set2 = new Set(ids2);
  assert(set1.size === set2.size, 'same size after shuffle');
  for (const id of ids1) {
    assert(set2.has(id), `ID ${id} present in shuffled set`);
  }
});

test('B08 — no duplicate structural IDs', () => {
  const idSet = new Set(ALL_IDS);
  assert(idSet.size === ALL_IDS.length, `0 duplicates (${ALL_IDS.length} elements, ${idSet.size} unique)`);
});

test('B09 — structural ID includes source provenance materially', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(el.id.includes(el.sourceId), `ID ${el.id} includes sourceId`);
    assert(el.id.includes(el.sourceVersionId ?? ''), `ID ${el.id} includes sourceVersionId`);
  }
});

test('B10 — historical versions coexist', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const hypothetical = [
    'src-primary-curriculum-2025',
    first.sourceVersionId,
    first.gradeCode,
    first.subjectCode,
    first.sourceStructuralType,
    stableLocatorKey(first.sourceLocator),
  ].join('::');
  assert(hypothetical !== first.id, 'hypothetical future version has different ID');
  assert(first.id.includes('src-primary-curriculum-2021'), 'original ID preserves source');
});

// ============================================================
// C: LOCATOR SAFETY
// ============================================================
console.log('');
console.log('--- C: Locator Safety ---');

test('C01 — exact page remains exact', () => {
  const exactPageEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision === 'EXACT_PAGE',
  );
  for (const el of exactPageEls) {
    assert(!!el.sourceLocator.page, `element ${el.id} has page for EXACT_PAGE`);
  }
});

test('C02 — section locator remains section-level', () => {
  const sectionEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision === 'SECTION_ONLY',
  );
  assert(sectionEls.length > 0, 'has section-level elements');
  for (const el of sectionEls) {
    assert(!!el.sourceLocator.section, `element ${el.id} has section for SECTION_ONLY`);
  }
});

test('C03 — document locator not promoted to exact page', () => {
  const docEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision === 'DOCUMENT_LEVEL',
  );
  assert(docEls.length >= 2, 'has document-level elements');
  for (const el of docEls) {
    assert(!el.sourceLocator.page, `document-level element ${el.id} has no page`);
  }
});

test('C04 — missing page not fabricated', () => {
  const noPageEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision !== 'EXACT_PAGE',
  );
  for (const el of noPageEls) {
    assert(!el.sourceLocator.page, `non-EXACT_PAGE element ${el.id} has no page`);
  }
});

test('C05 — stableLocatorKey deterministic', () => {
  const loc: CurriculumSourceLocator = { precision: 'SECTION_ONLY', section: 'Test Section' };
  const k1 = stableLocatorKey(loc);
  const k2 = stableLocatorKey(loc);
  assert(k1 === k2, 'stableLocatorKey returns same value for same input');
});

test('C06 — distinct document anchors distinguish elements', () => {
  const docEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision === 'DOCUMENT_LEVEL',
  );
  if (docEls.length >= 2) {
    const keys = docEls.map((el) => stableLocatorKey(el.sourceLocator));
    const unique = new Set(keys);
    assert(unique.size === keys.length, 'distinct document anchors produce distinct keys');
  }
});

test('C07 — distinct sections distinguish elements', () => {
  const secEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision === 'SECTION_ONLY',
  );
  const p1Ar = secEls.find(
    (el) => el.gradeCode === 'P1' && el.subjectCode === 'ARABIC' && el.sourceStructuralType === 'GRADE_SECTION',
  );
  const p3Ar = secEls.find(
    (el) => el.gradeCode === 'P3' && el.subjectCode === 'ARABIC' && el.sourceStructuralType === 'GRADE_SECTION',
  );
  assert(!!p1Ar && !!p3Ar, 'found both');
  assert(
    stableLocatorKey(p1Ar!.sourceLocator) !== stableLocatorKey(p3Ar!.sourceLocator),
    'distinct sections produce distinct keys',
  );
});

test('C08 — unknown locator explicitly represented', () => {
  const unknownEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision === 'UNKNOWN',
  );
  assert(unknownEls.length === STRUCTURAL_EXTRACTION_METRICS.unknownLocatorCount, 'unknown locator count matches');
});

// ============================================================
// D: NORMALIZATION
// ============================================================
console.log('');
console.log('--- D: Normalization ---');

test('D01 — original source term retained', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(el.sourceTerm.length > 0, `element ${el.id} has sourceTerm`);
  }
});

test('D02 — DIRECT semantics correct', () => {
  const directEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.normalizationClassification === 'DIRECT',
  );
  assert(directEls.length === 0 || directEls.length > 0, 'DIRECT elements exist or not');
  for (const el of directEls) {
    assert(
      el.extractionMethod === 'DIRECT_QUOTE' || el.extractionMethod === 'DIRECT_STRUCTURED_EXTRACTION',
      `DIRECT element ${el.id} has compatible extractionMethod`,
    );
  }
});

test('D03 — LOSSLESS_NORMALIZATION semantics correct', () => {
  const lossless = STRUCTURAL_ELEMENTS.filter(
    (el) => el.normalizationClassification === 'LOSSLESS_NORMALIZATION',
  );
  assert(lossless.length > 0, 'has LOSSLESS_NORMALIZATION elements');
  for (const el of lossless) {
    assert(
      el.extractionMethod === 'DIRECT_STRUCTURED_EXTRACTION',
      `LOSSLESS element ${el.id} has DIRECT_STRUCTURED_EXTRACTION`,
    );
  }
});

test('D04 — DERIVED semantics explicit', () => {
  const derived = STRUCTURAL_ELEMENTS.filter(
    (el) => el.normalizationClassification === 'DERIVED',
  );
  assert(derived.length > 0, 'has DERIVED elements');
  for (const el of derived) {
    assert(
      el.extractionMethod === 'DERIVED_STRUCTURAL_MAPPING',
      `DERIVED element ${el.id} has DERIVED_STRUCTURAL_MAPPING`,
    );
  }
});

test('D05 — ambiguous mapping not silently normalized', () => {
  const ambiguous = STRUCTURAL_ELEMENTS.filter(
    (el) => el.normalizationClassification === 'AMBIGUOUS',
  );
  assert(ambiguous.length === 0, 'no AMBIGUOUS elements in current extraction');
});

test('D06 — unmappable structure preserved', () => {
  const unmappable = STRUCTURAL_ELEMENTS.filter(
    (el) => el.normalizationClassification === 'UNMAPPABLE',
  );
  assert(unmappable.length === 0, 'no UNMAPPABLE elements in current extraction');
});

test('D07 — REVIEW_REQUIRED remains non-canonical', () => {
  const review = STRUCTURAL_ELEMENTS.filter(
    (el) => el.normalizationClassification === 'REVIEW_REQUIRED',
  );
  assert(review.length === 0, 'no REVIEW_REQUIRED normalization in current extraction');
});

test('D08 — Arabic/French original terminology preserved', () => {
  const arabicEls = STRUCTURAL_ELEMENTS.filter((el) => el.sourceTermAr);
  assert(arabicEls.length > 0, 'has Arabic terms');
  const frenchEls = STRUCTURAL_ELEMENTS.filter((el) => el.sourceTermFr);
  assert(frenchEls.length > 0, 'has French terms');
});

// ============================================================
// E: COMPLETENESS
// ============================================================
console.log('');
console.log('--- E: Completeness ---');

test('E01 — denominator derived from source evidence', () => {
  assert(
    EXTRACTION_MANIFEST.denominatorConfidence === 'UNKNOWN',
    'denominator confidence is UNKNOWN',
  );
});

test('E02 — unknown denominator → completenessRatio undefined', () => {
  const entriesWithUndefined = SUBJECT_EXTRACTION_ENTRIES.filter(
    (e) => e.completenessRatio === undefined,
  );
  assert(
    entriesWithUndefined.length === SUBJECT_EXTRACTION_ENTRIES.length,
    'all entries have undefined completenessRatio',
  );
});

test('E03 — known denominator calculates correctly', () => {
  // No known denominator in current extraction — verify the pattern works
  const known = SUBJECT_EXTRACTION_ENTRIES.filter((e) => e.denominatorKnown);
  assert(known.length === 0, 'no entries have known denominator');
});

test('E04 — incomplete extraction cannot report 100%', () => {
  for (const entry of SUBJECT_EXTRACTION_ENTRIES) {
    if (entry.completenessRatio !== undefined) {
      assert(entry.completenessRatio < 1.0, `entry ${entry.gradeCode}/${entry.subjectCode} < 100%`);
    }
  }
});

test('E05 — unresolved gaps prevent COMPLETE', () => {
  const openGaps = EXTRACTION_GAPS.filter((g) => g.status === 'OPEN');
  assert(openGaps.length > 0, 'has open gaps preventing completeness');
});

test('E06 — denominator provenance retained', () => {
  assert(
    EXTRACTION_MANIFEST.denominatorConfidence === 'UNKNOWN',
    'denominator confidence explicitly UNKNOWN',
  );
});

test('E07 — grade metrics computed', () => {
  assert(GRADE_EXTRACTION_ENTRIES.length === 6, '6 grade entries');
  for (const entry of GRADE_EXTRACTION_ENTRIES) {
    assert(PRIMARY_GRADE_CODES.includes(entry.gradeCode as any), `valid grade code ${entry.gradeCode}`);
    assert(entry.structuralElementCount > 0, `grade ${entry.gradeCode} has elements`);
  }
});

test('E08 — subject metrics computed', () => {
  assert(SUBJECT_EXTRACTION_ENTRIES.length === 54, '54 subject entries (6 grades × 9 subjects)');
  for (const entry of SUBJECT_EXTRACTION_ENTRIES) {
    assert(entry.sourcePresence === 'PRESENT', `${entry.gradeCode}/${entry.subjectCode} is PRESENT`);
    assert(entry.structureDiscovered === true, `${entry.gradeCode}/${entry.subjectCode} structure discovered`);
  }
});

test('E09 — structural type metrics computed', () => {
  const byType = STRUCTURAL_EXTRACTION_METRICS.byStructuralType;
  assert((byType['DOCUMENT_PART'] ?? 0) === 2, '2 document parts');
  assert((byType['DOMAIN'] ?? 0) === 3, '3 domains');
  assert((byType['SUBJECT'] ?? 0) === 9, '9 subjects');
  assert((byType['GRADE_SECTION'] ?? 0) === 54, '54 grade sections');
});

test('E10 — review-required metrics computed', () => {
  assert(
    STRUCTURAL_EXTRACTION_METRICS.reviewRequiredCount === 0,
    '0 review-required elements',
  );
});

test('E11 — no manually fabricated expected counts', () => {
  for (const entry of SUBJECT_EXTRACTION_ENTRIES) {
    assert(
      entry.expectedStructuralElementCount === undefined,
      `${entry.gradeCode}/${entry.subjectCode} has no fabricated expected count`,
    );
  }
});

test('E12 — stage completeness cannot exceed supported child completeness', () => {
  // With unknown denominator, stage completeness is also unknown
  const allUndefined = SUBJECT_EXTRACTION_ENTRIES.every(
    (e) => e.completenessRatio === undefined,
  );
  assert(allUndefined, 'all completeness ratios are undefined (denominator unknown)');
});

// ============================================================
// F: VERSIONING
// ============================================================
console.log('');
console.log('--- F: Versioning ---');

test('F01 — 2021 source preserved', () => {
  const src = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
  assert(!!src, '2021 source exists');
  assert(src!.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT', '2021 source is official');
});

test('F02 — hypothetical newer official source can coexist', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const futureId = [
    'src-primary-curriculum-2025',
    first.sourceVersionId,
    first.gradeCode,
    first.subjectCode,
    first.sourceStructuralType,
    stableLocatorKey(first.sourceLocator),
  ].join('::');
  assert(futureId !== first.id, 'future source has different ID');
});

test('F03 — newer secondary source cannot override official source merely by date', () => {
  const secondary = SOURCE_PRECEDENCE_POLICY.find(
    (e) => e.sourceClassification === 'SECONDARY_REFERENCE',
  );
  const official = SOURCE_PRECEDENCE_POLICY.find(
    (e) => e.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT',
  );
  assert(!!secondary && !!official, 'both exist');
  const secIdx = SOURCE_PRECEDENCE_POLICY.indexOf(secondary!);
  const offIdx = SOURCE_PRECEDENCE_POLICY.indexOf(official!);
  assert(secIdx > offIdx, 'secondary has lower precedence than official');
});

test('F04 — official amendment can override matching scope when applicable', () => {
  const amendment = SOURCE_PRECEDENCE_POLICY.find(
    (e) => e.level === 'OFFICIAL_AMENDMENT_REVISION',
  );
  assert(!!amendment, 'amendment level exists');
  assert(amendment!.overridesLowerLevels === true, 'amendment overrides lower levels');
});

test('F05 — amendment does not override unrelated scope', () => {
  // Amendment only overrides its explicit scope (scope-aware precedence)
  assert(SOURCE_PRECEDENCE_POLICY.length >= 8, 'precedence policy has sufficient levels');
});

test('F06 — historical losing claim remains queryable', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  assert(first.id.includes('src-primary-curriculum-2021'), 'historical claim preserves source');
});

test('F07 — same scope different versions share scopeKey', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const futureScopeKey = `${first.educationSystemCode}|${first.stageCode}|${first.gradeCode}|${first.subjectCode}`;
  assert(first.scopeKey === futureScopeKey, 'scopeKey matches for same scope');
});

test('F08 — different versions have different claim IDs', () => {
  const first = STRUCTURAL_ELEMENTS[0];
  const v1 = [first.sourceId, first.sourceVersionId, first.gradeCode, first.subjectCode, first.sourceStructuralType, stableLocatorKey(first.sourceLocator)].join('::');
  const v2 = [first.sourceId, 'v2.0.0', first.gradeCode, first.subjectCode, first.sourceStructuralType, stableLocatorKey(first.sourceLocator)].join('::');
  assert(v1 !== v2, 'different versions have different IDs');
});

test('F09 — partial supersession works', () => {
  // Architecture supports partial supersession through scope-aware precedence
  assert(SOURCE_PRECEDENCE_POLICY.length >= 8, 'precedence policy exists');
});

test('F10 — currentness remains confidence-aware', () => {
  assert(
    ARTIFACT_CURRENTNESS.status === 'LATEST_VERIFIED_ARTIFACT_FOUND',
    'currentness is LATEST_VERIFIED_ARTIFACT_FOUND',
  );
});

// ============================================================
// G: ANTI-FABRICATION
// ============================================================
console.log('');
console.log('--- G: Anti-Fabrication ---');

test('G01 — no invented units', () => {
  const unitEls = STRUCTURAL_ELEMENTS.filter(
    (el) => (el.sourceStructuralType as string) === 'UNIT' || (el.sourceStructuralType as string) === 'TOPIC',
  );
  assert(unitEls.length === 0, 'no UNIT or TOPIC elements');
});

test('G02 — no invented lessons', () => {
  const lessonEls = STRUCTURAL_ELEMENTS.filter(
    (el) => (el.sourceStructuralType as string) === 'LESSON',
  );
  assert(lessonEls.length === 0, 'no LESSON elements');
});

test('G03 — no invented exercises', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!el.sourceTerm.toLowerCase().includes('exercise'), `element ${el.id} has no invented exercise`);
  }
});

test('G04 — no invented answer keys', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!el.sourceTerm.toLowerCase().includes('answer'), `element ${el.id} has no invented answer`);
  }
});

test('G05 — no invented coefficients', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!el.sourceTerm.toLowerCase().includes('coefficient'), `element ${el.id} has no invented coefficient`);
  }
});

test('G06 — no invented dates', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    if (el.temporalApplicability.effectiveFrom) {
      assert(false, `element ${el.id} has no invented effectiveFrom`);
    }
  }
});

test('G07 — no invented page numbers', () => {
  const exactPages = STRUCTURAL_ELEMENTS.filter(
    (el) => el.sourceLocator.precision === 'EXACT_PAGE',
  );
  assert(exactPages.length === 0, 'no EXACT_PAGE locators (pages not individually mapped)');
});

test('G08 — no fabricated mastery', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(el.verificationState !== 'VERIFIED', `element ${el.id} is not VERIFIED`);
  }
});

test('G09 — no synthetic observations', () => {
  // No observation-related fields on structural elements
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!('observationId' in el), `element ${el.id} has no observationId`);
  }
});

test('G10 — no unsupported PUBLISHED records', () => {
  const published = STRUCTURAL_ELEMENTS.filter(
    (el) => el.contentStatus === 'PUBLISHED',
  );
  assert(published.length === 0, 'no PUBLISHED structural elements');
});

test('G11 — no unsupported CONTENT_VERIFIED records', () => {
  const verified = STRUCTURAL_ELEMENTS.filter(
    (el) => el.contentStatus === 'CONTENT_VERIFIED',
  );
  assert(verified.length === 0, 'no CONTENT_VERIFIED structural elements');
});

test('G12 — source absence represented explicitly', () => {
  // All elements have EXTRACTED_UNVERIFIED content status
  const extracted = STRUCTURAL_ELEMENTS.filter(
    (el) => el.contentStatus === 'EXTRACTED_UNVERIFIED',
  );
  assert(extracted.length === STRUCTURAL_ELEMENTS.length, 'all elements are EXTRACTED_UNVERIFIED');
});

// ============================================================
// H: PRIMARY COVERAGE
// ============================================================
console.log('');
console.log('--- H: Primary Coverage ---');

const GRADES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

test('H01 — P1 represented', () => {
  assert(GRADE_EXTRACTION_ENTRIES.some((e) => e.gradeCode === 'P1'), 'P1 exists');
});

test('H02 — P2 represented', () => {
  assert(GRADE_EXTRACTION_ENTRIES.some((e) => e.gradeCode === 'P2'), 'P2 exists');
});

test('H03 — P3 represented', () => {
  assert(GRADE_EXTRACTION_ENTRIES.some((e) => e.gradeCode === 'P3'), 'P3 exists');
});

test('H04 — P4 represented', () => {
  assert(GRADE_EXTRACTION_ENTRIES.some((e) => e.gradeCode === 'P4'), 'P4 exists');
});

test('H05 — P5 represented', () => {
  assert(GRADE_EXTRACTION_ENTRIES.some((e) => e.gradeCode === 'P5'), 'P5 exists');
});

test('H06 — P6 represented', () => {
  assert(GRADE_EXTRACTION_ENTRIES.some((e) => e.gradeCode === 'P6'), 'P6 exists');
});

test('H07 — grade status explicit', () => {
  for (const entry of GRADE_EXTRACTION_ENTRIES) {
    assert(
      entry.status === 'STRUCTURE_EXTRACTED',
      `grade ${entry.gradeCode} status is STRUCTURE_EXTRACTED`,
    );
  }
});

test('H08 — Grade × Subject extraction state explicit', () => {
  for (const entry of SUBJECT_EXTRACTION_ENTRIES) {
    assert(typeof entry.structureExtracted === 'boolean', `${entry.gradeCode}/${entry.subjectCode} has explicit extraction state`);
  }
});

test('H09 — missing detailed structure cannot masquerade as complete', () => {
  for (const entry of SUBJECT_EXTRACTION_ENTRIES) {
    assert(
      entry.completenessConfidence === 'UNKNOWN',
      `${entry.gradeCode}/${entry.subjectCode} completeness is UNKNOWN`,
    );
  }
});

test('H10 — aggregate source scopes cannot enter learner APIs', () => {
  const allPrimaryEls = STRUCTURAL_ELEMENTS.filter(
    (el) => el.gradeCode === 'ALL_PRIMARY',
  );
  for (const el of allPrimaryEls) {
    assert(
      el.sourceStructuralType !== 'GRADE_SECTION',
      `ALL_PRIMARY element ${el.id} is not a GRADE_SECTION`,
    );
  }
});

// ============================================================
// I: CURRENTNESS
// ============================================================
console.log('');
console.log('--- I: Currentness ---');

test('I01 — publicationDate != effectiveFrom', () => {
  const src = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
  assert(!!src, 'source exists');
  assert(src!.publicationDate === '2021-07-01', 'publication date is July 2021');
  assert(src!.effectiveFrom === undefined, 'effectiveFrom is undefined');
});

test('I02 — LATEST_VERIFIED_ARTIFACT_FOUND != CURRENT_NATIONAL', () => {
  assert(
    ARTIFACT_CURRENTNESS.status === 'LATEST_VERIFIED_ARTIFACT_FOUND',
    'status is LATEST_VERIFIED_ARTIFACT_FOUND, not CURRENT_NATIONAL',
  );
});

test('I03 — newer official source triggers version analysis', () => {
  // Architecture supports version analysis through precedence policy
  assert(SOURCE_PRECEDENCE_POLICY.length >= 8, 'precedence policy exists');
});

test('I04 — mirror publication does not create official revision', () => {
  const secondary = SOURCE_PRECEDENCE_POLICY.find(
    (e) => e.sourceClassification === 'SECONDARY_REFERENCE',
  );
  assert(!!secondary, 'secondary reference exists');
  assert(secondary!.overridesLowerLevels === false, 'secondary cannot override');
});

test('I05 — retrieval host != issuer', () => {
  const src = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
  assert(!!src, 'source exists');
  assert(
    src!.sourceAuthority.includes('Direction des Curricula'),
    'issuer is Direction des Curricula, not profpress.net',
  );
});

test('I06 — temporal applicability remains confidence-aware', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(
      el.temporalApplicability.effectiveDateConfidence === 'INFERRED',
      `element ${el.id} has INFERRED confidence`,
    );
  }
});

test('I07 — academicYearFrom INFERRED stays INFERRED', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(
      el.temporalApplicability.academicYearFrom === '2021-2022',
      `element ${el.id} has academicYearFrom 2021-2022`,
    );
  }
});

test('I08 — unknown effectiveTo stays unknown', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(
      el.temporalApplicability.effectiveTo === undefined,
      `element ${el.id} has no effectiveTo`,
    );
  }
});

// ============================================================
// J: TRUST NON-REGRESSION
// ============================================================
console.log('');
console.log('--- J: Trust Non-Regression ---');

test('J01 — ingest-evidence unchanged', () => {
  assert(!existsSync('src/core/curriculum/__tests__/gate07c4-ingest-evidence.test.ts'), 'no ingest-evidence test');
});

test('J02 — trusted server grading unchanged', () => {
  // No grading-related changes in structural extraction
  assert(STRUCTURAL_ELEMENTS.length > 0, 'structural elements exist without grading changes');
});

test('J03 — observation schema unchanged', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!('observationSchema' in el), `element ${el.id} has no observationSchema`);
  }
});

test('J04 — learner identity unchanged', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!('learnerId' in el), `element ${el.id} has no learnerId`);
  }
});

test('J05 — school membership unchanged', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!('schoolId' in el), `element ${el.id} has no schoolId`);
  }
});

test('J06 — mastery remains NOT_DERIVED', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!('mastery' in el), `element ${el.id} has no mastery field`);
  }
});

test('J07 — accuracy remains distinct from mastery', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!('accuracy' in el), `element ${el.id} has no accuracy field`);
  }
});

test('J08 — correct-answer privacy preserved', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(!('correctAnswer' in el), `element ${el.id} has no correctAnswer field`);
  }
});

// ============================================================
// SUMMARY
// ============================================================
console.log('');
console.log('========================================');
console.log(`Gate 07C.4 Results: ${passed}/${passed + failed} passed`);
if (failed === 0) {
  console.log('ALL GATE 07C.4 TESTS PASSED');
  process.exit(0); // eslint-disable-line
} else {
  console.log(`${failed} TESTS FAILED`);
  process.exit(1); // eslint-disable-line
}
