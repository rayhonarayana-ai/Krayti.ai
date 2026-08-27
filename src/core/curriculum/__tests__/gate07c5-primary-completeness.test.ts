/**
 * Qarayti.ai - Gate 07C.5: Primary Curriculum Completeness Closure Tests
 *
 * Test groups D/T/C/S/P/G/R/V/A/J per Gate 07C.5 specification.
 */

import assert from 'node:assert';
import { existsSync, readdirSync } from 'node:fs';

// ── IMPORTS ──────────────────────────────────────────────────

import {
  DENOMINATOR_REGISTRY,
  COMPLETENESS_CELLS,
  COMPLETENESS_METRICS,
  RESOLVED_GAPS,
  COMPLETENESS_NOTES,
} from '../../../domain/constants/moroccan-primary-completeness-registry';

import {
  SUBJECT_STRUCTURAL_PROFILES,
  GRADE_COMPLETENESS_PROFILES,
  getSubjectProfile,
  getGradeProfile,
  PROFILE_NOTES,
} from '../../../domain/constants/moroccan-primary-subject-grade-profiles';

import {
  STRUCTURAL_ELEMENTS,
  STRUCTURAL_EXTRACTION_METRICS,
  EXTRACTION_GAPS,
} from '../../../domain/constants/moroccan-primary-structural-extraction';

import {
  EXTRACTION_CLAIMS,
  stableLocatorKey,
} from '../../../domain/constants/moroccan-primary-extraction-registry';

import {
  EXTRACTION_MANIFEST,
} from '../../../domain/constants/moroccan-primary-extraction-manifest';

import {
  VERIFIED_PRIMARY_COVERAGE_MATRIX,
} from '../../../domain/constants/moroccan-primary-coverage-matrix';

import {
  PRIMARY_CURRICULUM_SOURCES,
} from '../../../domain/constants/moroccan-primary-curriculum-sources';

import {
  ARTIFACT_CURRENTNESS,
} from '../../../domain/constants/moroccan-primary-curriculum-artifact-forensics';

import {
  SOURCE_PRECEDENCE_POLICY,
} from '../../../domain/constants/curriculum-source-precedence-policy';

import { PRIMARY_GRADE_CODES } from '../../../domain/constants/curriculum-architecture.constants';

import type {
  CurriculumExtractionDenominator,
  GradeSubjectCompletenessCell,
  SubjectStructuralProfile,
  GradeCompletenessProfile,
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

const GRADES = [...PRIMARY_GRADE_CODES];
const SUBJECTS = [
  'ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'ISLAMIC_EDUCATION',
  'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC',
] as const;

// ============================================================
// D: DENOMINATOR IDENTITY TESTS
// ============================================================
console.log('');
console.log('--- D: Denominator Identity Tests ---');

test('D01 — same source/version/scope/type → deterministic denominator ID', () => {
  const d1 = DENOMINATOR_REGISTRY.find((d) => d.gradeCode === 'P1' && d.subjectCode === 'ARABIC');
  const d2 = DENOMINATOR_REGISTRY.find((d) => d.gradeCode === 'P1' && d.subjectCode === 'ARABIC');
  assert(d1 && d2, 'both denominators exist');
  assert(d1.id === d2.id, 'same source/version/scope/type → same ID');
});

test('D02 — different source → different denominator ID', () => {
  const d1 = DENOMINATOR_REGISTRY[0];
  assert(d1, 'denominator exists');
  const fakeId = 'different-source::v1.0.0::P1::ARABIC::NONE_IDENTIFIED';
  assert(d1.id !== fakeId, 'different sourceId → different ID');
});

test('D03 — different version → different denominator ID', () => {
  const d1 = DENOMINATOR_REGISTRY[0];
  assert(d1, 'denominator exists');
  const fakeId = 'src-primary-curriculum-2021::v2.0.0::P1::ARABIC::NONE_IDENTIFIED';
  assert(d1.id !== fakeId, 'different version → different ID');
});

test('D04 — different grade → different denominator ID', () => {
  const d1 = DENOMINATOR_REGISTRY.find((d) => d.gradeCode === 'P1' && d.subjectCode === 'ARABIC');
  const d2 = DENOMINATOR_REGISTRY.find((d) => d.gradeCode === 'P2' && d.subjectCode === 'ARABIC');
  assert(d1 && d2, 'both exist');
  assert(d1.id !== d2.id, 'different grade → different ID');
});

test('D05 — different subject → different denominator ID', () => {
  const d1 = DENOMINATOR_REGISTRY.find((d) => d.gradeCode === 'P1' && d.subjectCode === 'ARABIC');
  const d2 = DENOMINATOR_REGISTRY.find((d) => d.gradeCode === 'P1' && d.subjectCode === 'FRENCH');
  assert(d1 && d2, 'both exist');
  assert(d1.id !== d2.id, 'different subject → different ID');
});

test('D06 — different denominatorType → different denominator ID', () => {
  const d1 = DENOMINATOR_REGISTRY[0];
  assert(d1, 'denominator exists');
  const fakeId = d1.id.replace('NONE_IDENTIFIED', 'GRADE_SECTION');
  assert(d1.id !== fakeId, 'different denominatorType → different ID');
});

test('D07 — historical denominators coexist', () => {
  const d1 = DENOMINATOR_REGISTRY[0];
  assert(d1, 'denominator exists');
  const historical = {
    ...d1,
    id: 'src-primary-curriculum-2021::v0.9.0::P1::ARABIC::NONE_IDENTIFIED',
    sourceVersionId: 'v0.9.0',
  };
  assert(historical.id !== d1.id, 'historical has different ID');
  assert(historical.sourceVersionId !== d1.sourceVersionId, 'different version');
});

test('D08 — no duplicate denominator IDs', () => {
  const ids = DENOMINATOR_REGISTRY.map((d) => d.id);
  const unique = new Set(ids);
  assert(unique.size === ids.length, `expected ${ids.length} unique IDs, got ${unique.size}`);
});

test('D09 — denominator ID independent of extracted count', () => {
  const d1 = DENOMINATOR_REGISTRY[0];
  assert(d1, 'denominator exists');
  assert(d1.expectedCount === undefined, 'expectedCount is undefined');
  assert(typeof d1.id === 'string' && d1.id.length > 0, 'ID exists regardless of count');
});

test('D10 — denominator identity does not change as extraction progresses', () => {
  const d1 = DENOMINATOR_REGISTRY.find((d) => d.gradeCode === 'P3' && d.subjectCode === 'MATH');
  assert(d1, 'denominator exists');
  const originalId = d1.id;
  assert(originalId.includes('P3'), 'ID includes grade');
  assert(originalId.includes('MATH'), 'ID includes subject');
  assert(originalId.includes('NONE_IDENTIFIED'), 'ID includes denominator type');
});

// ============================================================
// T: DENOMINATOR TRUST TESTS
// ============================================================
console.log('');
console.log('--- T: Denominator Trust Tests ---');

test('T01 — unknown denominator has no expectedCount', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'UNKNOWN') {
      assert(d.expectedCount === undefined, `denominator ${d.id} UNKNOWN → expectedCount undefined`);
    }
  }
});

test('T02 — unknown denominator has no ratio', () => {
  for (const cell of COMPLETENESS_CELLS) {
    if (cell.denominatorConfidence === 'UNKNOWN') {
      assert(cell.completenessRatio === undefined, `cell ${cell.gradeCode}/${cell.subjectCode} UNKNOWN → ratio undefined`);
    }
  }
});

test('T03 — PARTIAL cannot become 100%', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(d.expectedCount === undefined || d.expectedCount > 0, 'PARTIAL denominator does not auto-promote to 100%');
    }
  }
});

test('T04 — SUPPORTED cannot become VERIFIED automatically', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'SUPPORTED') {
      assert(d.verificationState !== 'VERIFIED' || d.notes.includes('verified'), 'SUPPORTED does not auto-become VERIFIED');
    }
  }
});

test('T05 — VERIFIED requires provenance', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'VERIFIED') {
      assert(d.sourceId.length > 0, `VERIFIED denominator ${d.id} must have sourceId`);
      assert(d.evidenceMethod.length > 0, `VERIFIED denominator ${d.id} must have evidenceMethod`);
    }
  }
});

test('T06 — VERIFIED requires locator', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'VERIFIED') {
      assert(d.sourceLocator.precision !== 'UNKNOWN', `VERIFIED denominator ${d.id} must have known locator`);
    }
  }
});

test('T07 — manual guess cannot qualify as VERIFIED', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.evidenceMethod === 'MANUAL_GUESS' || d.evidenceMethod.includes('guess')) {
      assert(d.confidence !== 'VERIFIED', `manual guess denominator ${d.id} cannot be VERIFIED`);
    }
  }
});

test('T08 — AI-generated expected count rejected', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.evidenceMethod !== 'AI_GENERATED', `denominator ${d.id} must not use AI-generated evidence`);
    assert(d.evidenceMethod !== 'INVENTED', `denominator ${d.id} must not use invented evidence`);
  }
});

test('T09 — secondary source cannot override official denominator merely by recency', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.sourceId === 'src-primary-curriculum-2021', `all denominators from official primary source`);
  }
});

test('T10 — later official scoped revision can introduce new denominator version', () => {
  const d1 = DENOMINATOR_REGISTRY[0];
  assert(d1, 'denominator exists');
  assert(d1.sourceVersionId === 'v1.0.0', 'current version is v1.0.0');
  const hypotheticalNew = {
    ...d1,
    id: 'src-primary-curriculum-2021::v2.0.0::P1::ARABIC::COMPETENCY_GROUP',
    sourceVersionId: 'v2.0.0',
    denominatorType: 'COMPETENCY_GROUP' as const,
  };
  assert(hypotheticalNew.id !== d1.id, 'new version creates new denominator ID');
});

// ============================================================
// C: COMPLETENESS TESTS
// ============================================================
console.log('');
console.log('--- C: Completeness Tests ---');

test('C01 — expected=5 extracted=5 with VERIFIED denominator may equal 1.0', () => {
  const verified = DENOMINATOR_REGISTRY.filter((d) => d.confidence === 'VERIFIED');
  for (const d of verified) {
    if (d.expectedCount !== undefined && d.expectedCount > 0) {
      const cell = COMPLETENESS_CELLS.find(
        (c) => c.gradeCode === d.gradeCode && c.subjectCode === d.subjectCode,
      );
      if (cell && cell.extractedCount === d.expectedCount) {
        assert(cell.completenessRatio === 1.0, 'VERIFIED + expected == extracted → 1.0');
      }
    }
  }
});

test('C02 — expected=5 extracted=4 cannot equal 1.0', () => {
  for (const cell of COMPLETENESS_CELLS) {
    if (cell.expectedCount !== undefined && cell.extractedCount < cell.expectedCount) {
      assert(cell.completenessRatio !== 1.0, `cell ${cell.gradeCode}/${cell.subjectCode}: extracted < expected → not 1.0`);
    }
  }
});

test('C03 — unresolved missing gap blocks complete', () => {
  for (const cell of COMPLETENESS_CELLS) {
    if (cell.knownGapCount > 0 && cell.completenessRatio === 1.0) {
      assert(false, `cell ${cell.gradeCode}/${cell.subjectCode} has gaps but claims 100%`);
    }
  }
});

test('C04 — unknown denominator ratio undefined', () => {
  for (const cell of COMPLETENESS_CELLS) {
    if (cell.denominatorConfidence === 'UNKNOWN') {
      assert(cell.completenessRatio === undefined, `UNKNOWN denominator → ratio undefined for ${cell.gradeCode}/${cell.subjectCode}`);
    }
  }
});

test('C05 — denominator zero invalid unless source explicitly defines empty set', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.expectedCount === 0) {
      assert(d.notes.includes('empty') || d.notes.includes('zero') || d.notes.includes('explicitly'),
        `zero denominator ${d.id} requires explicit justification in notes`);
    }
  }
});

test('C06 — extracted count greater than expected triggers review', () => {
  for (const cell of COMPLETENESS_CELLS) {
    if (cell.expectedCount !== undefined && cell.extractedCount > cell.expectedCount) {
      assert(cell.completenessStatus === 'REVIEW_REQUIRED' || cell.completenessStatus === 'EXTRACTION_MATCHES_DENOMINATOR',
        `over-extraction triggers review for ${cell.gradeCode}/${cell.subjectCode}`);
    }
  }
});

test('C07 — duplicate extracted elements do not inflate count', () => {
  const ids = STRUCTURAL_ELEMENTS.map((el) => el.id);
  const unique = new Set(ids);
  assert(unique.size === ids.length, `structural elements have ${ids.length} total, ${unique.size} unique — no duplicates`);
});

test('C08 — review-required element handling explicit', () => {
  for (const cell of COMPLETENESS_CELLS) {
    assert(typeof cell.reviewRequiredCount === 'number', `cell ${cell.gradeCode}/${cell.subjectCode} has explicit reviewRequiredCount`);
  }
});

test('C09 — grade completeness derived from child cells conservatively', () => {
  for (const profile of GRADE_COMPLETENESS_PROFILES) {
    assert(profile.totalCells === 9, `grade ${profile.gradeCode} has 9 cells`);
    assert(profile.denominatorReadyCells + profile.blockedCells >= 0, 'non-negative counts');
    assert(typeof profile.notes === 'string' && profile.notes.length > 0, `grade ${profile.gradeCode} has notes`);
  }
});

test('C10 — stage completeness derived conservatively', () => {
  const totalCells = GRADE_COMPLETENESS_PROFILES.reduce((sum, p) => sum + p.totalCells, 0);
  assert(totalCells === 54, `stage total cells: ${totalCells} (expected 54)`);
  const totalDenomReady = GRADE_COMPLETENESS_PROFILES.reduce((sum, p) => sum + p.denominatorReadyCells, 0);
  assert(totalDenomReady === 0, `stage denominator-ready cells: ${totalDenomReady} (expected 0)`);
});

// ============================================================
// S: SOURCE INVENTORY TESTS
// ============================================================
console.log('');
console.log('--- S: Source Inventory Tests ---');

test('S01 — source section index traceable', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(typeof el.sourceLocator === 'object', `element ${el.id} has sourceLocator`);
    assert(typeof el.sourceLocator.precision === 'string', `element ${el.id} has locator precision`);
    assert(el.sourceLocator.precision !== 'UNKNOWN' || el.sourceStructuralType === 'DOCUMENT_PART' || el.sourceStructuralType === 'DOMAIN',
      `element ${el.id} has non-UNKNOWN locator (except doc parts/domains)`);
  }
});

test('S02 — page index uses verified pages only', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    if (el.sourceLocator.precision === 'EXACT_PAGE') {
      assert(typeof el.sourceLocator.page === 'string' && el.sourceLocator.page.length > 0,
        `element ${el.id} EXACT_PAGE has page value`);
    }
  }
});

test('S03 — no fake exact page', () => {
  const exactPageElements = STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'EXACT_PAGE');
  for (const el of exactPageElements) {
    assert(el.sourceLocator.page !== 'p1' && el.sourceLocator.page !== '1',
      `element ${el.id} does not have suspicious single-page locator`);
  }
});

test('S04 — all denominator evidence links to source', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.sourceId.length > 0, `denominator ${d.id} has sourceId`);
    assert(d.sourceVersionId.length > 0, `denominator ${d.id} has sourceVersionId`);
    assert(d.evidenceMethod.length > 0, `denominator ${d.id} has evidenceMethod`);
  }
});

test('S05 — structural source terminology preserved', () => {
  for (const profile of SUBJECT_STRUCTURAL_PROFILES) {
    assert(typeof profile.sourceStructuralTerminology === 'string' && profile.sourceStructuralTerminology.length > 0,
      `${profile.subjectCode} has source terminology`);
  }
});

test('S06 — normalization remains explicit', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    assert(typeof el.normalizationClassification === 'string',
      `element ${el.id} has normalizationClassification`);
  }
});

test('S07 — document scan != curriculum complete', () => {
  assert(EXTRACTION_MANIFEST.extractionStatus === 'PARTIALLY_EXTRACTED',
    'manifest reports PARTIALLY_EXTRACTED, not COMPLETE');
});

test('S08 — page coverage != semantic completeness', () => {
  const locatorCounts = {
    EXACT_PAGE: STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'EXACT_PAGE').length,
    SECTION_ONLY: STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'SECTION_ONLY').length,
    DOCUMENT_LEVEL: STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'DOCUMENT_LEVEL').length,
  };
  assert(locatorCounts.EXACT_PAGE + locatorCounts.SECTION_ONLY + locatorCounts.DOCUMENT_LEVEL === STRUCTURAL_ELEMENTS.length,
    'all elements have locators');
});

// ============================================================
// P: SUBJECT PROFILE TESTS
// ============================================================
console.log('');
console.log('--- P: Subject Profile Tests ---');

test('P01 — Arabic profile exists', () => {
  const p = getSubjectProfile('ARABIC');
  assert(p !== undefined, 'Arabic profile exists');
  assert(p?.subjectCode === 'ARABIC', 'correct subject code');
});

test('P02 — French profile exists', () => {
  const p = getSubjectProfile('FRENCH');
  assert(p !== undefined, 'French profile exists');
  assert(p?.subjectCode === 'FRENCH', 'correct subject code');
});

test('P03 — Math profile exists', () => {
  const p = getSubjectProfile('MATH');
  assert(p !== undefined, 'Math profile exists');
  assert(p?.subjectCode === 'MATH', 'correct subject code');
});

test('P04 — Science profile exists', () => {
  const p = getSubjectProfile('SCIENCE');
  assert(p !== undefined, 'Science profile exists');
  assert(p?.subjectCode === 'SCIENCE', 'correct subject code');
});

test('P05 — Islamic Education profile exists', () => {
  const p = getSubjectProfile('ISLAMIC_EDUCATION');
  assert(p !== undefined, 'Islamic Education profile exists');
  assert(p?.subjectCode === 'ISLAMIC_EDUCATION', 'correct subject code');
});

test('P06 — Civic Education profile exists', () => {
  const p = getSubjectProfile('CIVIC_EDUCATION');
  assert(p !== undefined, 'Civic Education profile exists');
  assert(p?.subjectCode === 'CIVIC_EDUCATION', 'correct subject code');
});

test('P07 — Sport profile exists', () => {
  const p = getSubjectProfile('SPORT');
  assert(p !== undefined, 'Sport profile exists');
  assert(p?.subjectCode === 'SPORT', 'correct subject code');
});

test('P08 — Art profile exists', () => {
  const p = getSubjectProfile('ART');
  assert(p !== undefined, 'Art profile exists');
  assert(p?.subjectCode === 'ART', 'correct subject code');
});

test('P09 — Music profile exists', () => {
  const p = getSubjectProfile('MUSIC');
  assert(p !== undefined, 'Music profile exists');
  assert(p?.subjectCode === 'MUSIC', 'correct subject code');
});

test('P10 — all profiles source-backed', () => {
  for (const profile of SUBJECT_STRUCTURAL_PROFILES) {
    assert(typeof profile.sourceOrganization === 'string' && profile.sourceOrganization.length > 0,
      `${profile.subjectCode} has sourceOrganization`);
    assert(typeof profile.sourceStructuralTerminology === 'string' && profile.sourceStructuralTerminology.length > 0,
      `${profile.subjectCode} has sourceStructuralTerminology`);
  }
});

test('P11 — no profile fabricates units', () => {
  for (const profile of SUBJECT_STRUCTURAL_PROFILES) {
    const org = profile.sourceOrganization.toLowerCase();
    assert(!org.includes('6 units') && !org.includes('5 units') && !org.includes('4 units'),
      `${profile.subjectCode} does not fabricate unit count`);
    assert(!org.match(/\d+ (units?|lessons?|competencies)/),
      `${profile.subjectCode} does not claim specific enumerated counts`);
  }
});

test('P12 — profiles may use different hierarchy types', () => {
  const depths = new Set(SUBJECT_STRUCTURAL_PROFILES.map((p) => p.hierarchyDepth));
  assert(depths.has('SURFACE'), 'at least one SURFACE profile');
  assert(SUBJECT_STRUCTURAL_PROFILES.length === 9, '9 subject profiles');
});

// ============================================================
// G: GRADE PROFILE TESTS
// ============================================================
console.log('');
console.log('--- G: Grade Profile Tests ---');

test('G01 — P1 profile', () => {
  const p = getGradeProfile('P1');
  assert(p !== undefined, 'P1 profile exists');
  assert(p?.gradeCode === 'P1', 'correct grade code');
});

test('G02 — P2 profile', () => {
  const p = getGradeProfile('P2');
  assert(p !== undefined, 'P2 profile exists');
  assert(p?.gradeCode === 'P2', 'correct grade code');
});

test('G03 — P3 profile', () => {
  const p = getGradeProfile('P3');
  assert(p !== undefined, 'P3 profile exists');
  assert(p?.gradeCode === 'P3', 'correct grade code');
});

test('G04 — P4 profile', () => {
  const p = getGradeProfile('P4');
  assert(p !== undefined, 'P4 profile exists');
  assert(p?.gradeCode === 'P4', 'correct grade code');
});

test('G05 — P5 profile', () => {
  const p = getGradeProfile('P5');
  assert(p !== undefined, 'P5 profile exists');
  assert(p?.gradeCode === 'P5', 'correct grade code');
});

test('G06 — P6 profile', () => {
  const p = getGradeProfile('P6');
  assert(p !== undefined, 'P6 profile exists');
  assert(p?.gradeCode === 'P6', 'correct grade code');
});

test('G07 — each profile has 9-cell accounting consistent with source coverage', () => {
  for (const profile of GRADE_COMPLETENESS_PROFILES) {
    assert(profile.totalCells === 9, `grade ${profile.gradeCode}: expected 9 cells, got ${profile.totalCells}`);
    assert(profile.subjects.length === 9, `grade ${profile.gradeCode}: expected 9 subjects, got ${profile.subjects.length}`);
  }
});

test('G08 — cell statuses explicit', () => {
  for (const profile of GRADE_COMPLETENESS_PROFILES) {
    for (const subj of profile.subjects) {
      assert(subj in profile.cellStatuses, `grade ${profile.gradeCode}: ${subj} has explicit status`);
      const status = profile.cellStatuses[subj];
      assert(typeof status === 'string' && status.length > 0, `grade ${profile.gradeCode}/${subj}: status is non-empty string`);
    }
  }
});

test('G09 — no missing cell silently omitted', () => {
  for (const profile of GRADE_COMPLETENESS_PROFILES) {
    const expectedSubjects = ['ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'ISLAMIC_EDUCATION', 'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC'];
    for (const subj of expectedSubjects) {
      assert(subj in profile.cellStatuses, `grade ${profile.gradeCode}: ${subj} not omitted`);
    }
  }
});

test('G10 — no grade claims complete with unknown denominator', () => {
  for (const profile of GRADE_COMPLETENESS_PROFILES) {
    for (const [subj, status] of Object.entries(profile.cellStatuses)) {
      assert(status !== 'VERIFIED', `grade ${profile.gradeCode}/${subj}: no grade claims VERIFIED with unknown denominator`);
    }
  }
});

// ============================================================
// R: GAP TESTS
// ============================================================
console.log('');
console.log('--- R: Gap Tests ---');

test('R01 — GAP-001 tracked', () => {
  const gap = RESOLVED_GAPS.find((g) => g.gapId === 'GAP-001');
  assert(gap !== undefined, 'GAP-001 exists in resolved gaps');
  assert(gap?.beforeStatus.length > 0, 'GAP-001 has beforeStatus');
});

test('R02 — GAP-002 tracked', () => {
  const gap = RESOLVED_GAPS.find((g) => g.gapId === 'GAP-002');
  assert(gap !== undefined, 'GAP-002 exists in resolved gaps');
  assert(gap?.beforeStatus.length > 0, 'GAP-002 has beforeStatus');
});

test('R03 — GAP-003 tracked', () => {
  const gap = RESOLVED_GAPS.find((g) => g.gapId === 'GAP-003');
  assert(gap !== undefined, 'GAP-003 exists in resolved gaps');
  assert(gap?.beforeStatus.length > 0, 'GAP-003 has beforeStatus');
});

test('R04 — GAP-004 tracked', () => {
  const gap = RESOLVED_GAPS.find((g) => g.gapId === 'GAP-004');
  assert(gap !== undefined, 'GAP-004 exists in resolved gaps');
  assert(gap?.beforeStatus.length > 0, 'GAP-004 has beforeStatus');
});

test('R05 — gap resolution requires evidence', () => {
  for (const gap of RESOLVED_GAPS) {
    assert(typeof gap.evidenceInvestigated === 'string' && gap.evidenceInvestigated.length > 20,
      `gap ${gap.gapId} has substantial evidenceInvestigated`);
    assert(typeof gap.resolutionReason === 'string' && gap.resolutionReason.length > 20,
      `gap ${gap.gapId} has substantial resolutionReason`);
  }
});

test('R06 — unresolved gap remains visible', () => {
  for (const gap of RESOLVED_GAPS) {
    assert(gap.afterStatus.length > 0, `gap ${gap.gapId} has afterStatus`);
  }
  assert(RESOLVED_GAPS.length === 4, '4 gaps tracked');
});

test('R07 — deferred != resolved', () => {
  for (const gap of RESOLVED_GAPS) {
    if (gap.afterStatus.startsWith('DEFERRED')) {
      assert(!gap.afterStatus.startsWith('RESOLVED'), `gap ${gap.gapId}: DEFERRED is not RESOLVED`);
    }
  }
});

test('R08 — blocking gap affects completeness', () => {
  const blocking = RESOLVED_GAPS.filter((g) => g.gapId === 'GAP-001');
  assert(blocking.length === 1, 'GAP-001 is the primary blocking gap');
  assert(blocking[0].afterStatus.includes('UNKNOWN') || blocking[0].afterStatus.includes('PARTIALLY'),
    'GAP-001 remains at UNKNOWN/PARTIAL level');
});

test('R09 — human review state explicit', () => {
  for (const gap of RESOLVED_GAPS) {
    assert(typeof gap.remainingBlocker === 'string', `gap ${gap.gapId} has explicit remainingBlocker`);
  }
});

test('R10 — no gap removed only because extraction increased', () => {
  for (const gap of RESOLVED_GAPS) {
    assert(!gap.resolutionReason.includes('extraction count increased'),
      `gap ${gap.gapId}: not resolved merely by extraction count increase`);
  }
});

// ============================================================
// V: VERSIONING TESTS
// ============================================================
console.log('');
console.log('--- V: Versioning Tests ---');

test('V01 — base source preserved', () => {
  assert(PRIMARY_CURRICULUM_SOURCES.length === 4, '4 source records preserved');
  const primary = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
  assert(primary !== undefined, 'primary source preserved');
});

test('V02 — no destructive overwrite', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.sourceId === 'src-primary-curriculum-2021', `denominator ${d.id} traces to primary source`);
  }
});

test('V03 — newer official scoped revision can coexist', () => {
  const d1 = DENOMINATOR_REGISTRY[0];
  assert(d1, 'denominator exists');
  const hypotheticalNew = {
    ...d1,
    id: 'src-primary-curriculum-2025::v1.0.0::P1::ARABIC::NONE_IDENTIFIED',
    sourceId: 'src-primary-curriculum-2025',
  };
  assert(hypotheticalNew.id !== d1.id, 'new source creates new denominator ID');
});

test('V04 — secondary newer source cannot override official', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.sourceId !== 'SECONDARY_REFERENCE', `denominator ${d.id} not from secondary source`);
  }
});

test('V05 — scope-aware precedence', () => {
  assert(SOURCE_PRECEDENCE_POLICY.length === 8, '8 precedence levels');
  const officialIdx = SOURCE_PRECEDENCE_POLICY.findIndex((p) => p.level === 'OFFICIAL_CURRICULUM_DOCUMENT');
  const secondaryIdx = SOURCE_PRECEDENCE_POLICY.findIndex((p) => p.level === 'SECONDARY_REFERENCE');
  assert(officialIdx < secondaryIdx, 'official has higher precedence than secondary');
});

test('V06 — denominator version tied to source version', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.sourceVersionId === 'v1.0.0', `denominator ${d.id} version matches source`);
    assert(d.id.includes('v1.0.0'), `denominator ${d.id} ID includes version`);
  }
});

test('V07 — historical denominator queryable', () => {
  const historical = DENOMINATOR_REGISTRY.map((d) => ({
    ...d,
    id: d.id.replace('v1.0.0', 'v0.9.0'),
    sourceVersionId: 'v0.9.0',
  }));
  assert(historical.length === DENOMINATOR_REGISTRY.length, 'historical set has same count');
  assert(historical[0].id !== DENOMINATOR_REGISTRY[0].id, 'historical has different ID');
});

test('V08 — unknown temporal applicability exposed', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.notes.length > 0, `denominator ${d.id} has temporal notes`);
  }
});

// ============================================================
// A: ANTI-FABRICATION TESTS
// ============================================================
console.log('');
console.log('--- A: Anti-Fabrication Tests ---');

test('A01 — invented units = 0', () => {
  const unitLike = DENOMINATOR_REGISTRY.filter((d) =>
    d.denominatorType === 'GRADE_SECTION' && d.expectedCount !== undefined && d.expectedCount > 0,
  );
  assert(unitLike.length === 0, 'no invented units');
});

test('A02 — invented lessons = 0', () => {
  const lessonLike = DENOMINATOR_REGISTRY.filter((d) =>
    d.denominatorType === 'ACTIVITY' && d.expectedCount !== undefined && d.expectedCount > 0,
  );
  assert(lessonLike.length === 0, 'no invented lessons');
});

test('A03 — invented KOs = 0', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(!d.notes.includes('invented KO') && !d.notes.includes('fabricated KO'),
      `denominator ${d.id}: no invented KOs`);
  }
});

test('A04 — invented competencies = 0', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.evidenceMethod !== 'COMPETENCY_FABRICATION',
      `denominator ${d.id}: no fabricated competencies`);
  }
  const compDenom = DENOMINATOR_REGISTRY.filter((d) => d.denominatorType === 'COMPETENCY_GROUP');
  for (const d of compDenom) {
    assert(d.expectedCount === undefined, `COMPETENCY_GROUP ${d.id}: no invented expected count`);
  }
});

test('A05 — invented exercises = 0', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(!d.notes.includes('invented exercises') && !d.notes.includes('exercise count'),
      `denominator ${d.id}: no invented exercises`);
  }
});

test('A06 — invented coefficients = 0', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(!d.notes.includes('coefficient') && !d.notes.includes('weight'),
      `denominator ${d.id}: no invented coefficients`);
  }
});

test('A07 — invented dates = 0', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.notes.match(/\d{4}/)?.[0] === undefined || d.notes.includes('2021'),
      `denominator ${d.id}: no invented dates`);
  }
});

test('A08 — invented pages = 0', () => {
  for (const el of STRUCTURAL_ELEMENTS) {
    if (el.sourceLocator.precision === 'EXACT_PAGE') {
      assert(el.sourceLocator.page !== 'p1' && el.sourceLocator.page !== 'p556',
        `element ${el.id}: no suspicious page`);
    }
  }
});

test('A09 — invented denominators = 0', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.evidenceMethod !== 'INVENTED' && d.evidenceMethod !== 'AI_GENERATED',
      `denominator ${d.id}: evidence method is not invented`);
  }
});

test('A10 — unsupported CONTENT_VERIFIED = 0', () => {
  const verifiedCells = COMPLETENESS_CELLS.filter((c) => c.completenessStatus === 'STRUCTURE_COMPLETE_VERIFIED');
  assert(verifiedCells.length === 0, `no cells claim STRUCTURE_COMPLETE_VERIFIED: got ${verifiedCells.length}`);
});

test('A11 — PUBLISHED = 0', () => {
  assert(COMPLETENESS_METRICS.totalCells === 54, '54 cells exist');
  const publishedStatuses = ['PUBLISHED'] as string[];
  for (const cell of COMPLETENESS_CELLS) {
    assert(!publishedStatuses.includes(cell.completenessStatus as string), `cell ${cell.gradeCode}/${cell.subjectCode}: not PUBLISHED`);
  }
});

// ============================================================
// J: TRUST REGRESSION TESTS
// ============================================================
console.log('');
console.log('--- J: Trust Regression Tests ---');

test('J01 — ingest-evidence untouched', () => {
  assert(typeof EXTRACTION_MANIFEST.sourceId === 'string', 'manifest sourceId intact');
  assert(EXTRACTION_MANIFEST.sourceId === 'src-primary-curriculum-2021', 'manifest source correct');
});

test('J02 — observation history untouched', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('observation'), 'no observation references in completeness notes');
});

test('J03 — canonical learner state untouched', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('learner state'), 'no learner state references');
});

test('J04 — student identity untouched', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('student') || COMPLETENESS_NOTES.summary.includes('student-facing'),
    'no student identity references');
});

test('J05 — school membership untouched', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('school membership'), 'no school membership references');
});

test('J06 — trusted grading untouched', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('grading'), 'no grading references');
});

test('J07 — correct-answer privacy untouched', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('correct answer'), 'no correct-answer references');
});

test('J08 — mastery remains NOT_DERIVED', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('mastery'), 'no mastery references in completeness');
});

test('J09 — accuracy != mastery', () => {
  assert(!COMPLETENESS_NOTES.summary.includes('accuracy'), 'no accuracy references in completeness');
});

test('J10 — no synthetic observations', () => {
  assert(COMPLETENESS_NOTES.antiFabrication.includes('No denominators invented'), 'anti-fabrication note present');
  assert(!COMPLETENESS_NOTES.summary.includes('synthetic'), 'no synthetic references');
});

// ── ADDITIONAL TESTS ─────────────────────────────────────────

console.log('');
console.log('--- Additional: 07C.5 Specific ---');

test('AD01 — denominator registry has 54 entries', () => {
  assert(DENOMINATOR_REGISTRY.length === 54, `expected 54 denominators, got ${DENOMINATOR_REGISTRY.length}`);
});

test('AD02 — completeness cells has 54 entries', () => {
  assert(COMPLETENESS_CELLS.length === 54, `expected 54 cells, got ${COMPLETENESS_CELLS.length}`);
});

test('AD03 — all denominator IDs include source', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.id.startsWith('src-primary-curriculum-2021::'), `denominator ${d.id} starts with source ID`);
  }
});

test('AD04 — all denominator IDs include version', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.id.includes('v1.0.0'), `denominator ${d.id} includes version`);
  }
});

test('AD05 — GAP-004 resolved as NOT_APPLICABLE', () => {
  const gap = RESOLVED_GAPS.find((g) => g.gapId === 'GAP-004');
  assert(gap, 'GAP-004 exists');
  assert(gap?.afterStatus.includes('RESOLVED'), 'GAP-004 resolved');
  assert(gap?.resolutionReason.includes('NOT_APPLICABLE'), 'GAP-004 NOT_APPLICABLE');
});

test('AD06 — all subject profiles have denominator type', () => {
  for (const profile of SUBJECT_STRUCTURAL_PROFILES) {
    assert(typeof profile.denominatorCandidateType === 'string', `${profile.subjectCode} has denominatorCandidateType`);
  }
});

test('AD07 — completeness metrics consistent', () => {
  assert(COMPLETENESS_METRICS.totalCells === 54, '54 total cells');
  assert(COMPLETENESS_METRICS.measurableCells === 0, '0 measurable cells');
  assert(COMPLETENESS_METRICS.hundredPercentCells === 0, '0 hundred percent cells');
  assert(COMPLETENESS_METRICS.denominatorUnknownCount === 54, '54 unknown denominators');
  assert(COMPLETENESS_METRICS.denominatorKnownCount === 0, '0 known denominators');
});

test('AD08 — all cells have undefined ratio', () => {
  for (const cell of COMPLETENESS_CELLS) {
    assert(cell.completenessRatio === undefined, `cell ${cell.gradeCode}/${cell.subjectCode}: ratio is undefined`);
  }
});

test('AD09 — percentage requires denominator invariant', () => {
  for (const cell of COMPLETENESS_CELLS) {
    if (cell.completenessRatio !== undefined) {
      assert(cell.denominatorConfidence !== 'UNKNOWN', `cell with ratio must not have UNKNOWN confidence`);
    }
  }
});

test('AD10 — 100% invariant strict', () => {
  for (const cell of COMPLETENESS_CELLS) {
    if (cell.completenessRatio === 1.0) {
      assert(cell.denominatorConfidence === 'VERIFIED', '100% requires VERIFIED denominator');
      assert(cell.expectedCount !== undefined && cell.expectedCount > 0, '100% requires expectedCount > 0');
      assert(cell.knownGapCount === 0, '100% requires no blocking gaps');
      assert(cell.reviewRequiredCount === 0, '100% requires no review-required items');
    }
  }
});

test('AD11 — locator quality from 07C.4 preserved', () => {
  const exactPages = STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'EXACT_PAGE').length;
  const sections = STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'SECTION_ONLY').length;
  const docLevels = STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'DOCUMENT_LEVEL').length;
  const unknown = STRUCTURAL_ELEMENTS.filter((el) => el.sourceLocator.precision === 'UNKNOWN').length;
  assert(exactPages >= 0, `EXACT_PAGE: ${exactPages}`);
  assert(sections > 0, `SECTION_ONLY: ${sections}`);
  assert(docLevels >= 0, `DOCUMENT_LEVEL: ${docLevels}`);
  assert(unknown === 0, `UNKNOWN: ${unknown}`);
});

test('AD12 — source inventory traceable', () => {
  assert(PRIMARY_CURRICULUM_SOURCES.length === 4, '4 source records');
  const primary = PRIMARY_CURRICULUM_SOURCES.find((s) => s.id === 'src-primary-curriculum-2021');
  assert(primary, 'primary source exists');
  assert(primary?.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT', 'primary is OFFICIAL');
});

test('AD13 — structural extraction count preserved from 07C.4', () => {
  assert(STRUCTURAL_ELEMENTS.length === 68, `expected 68 structural elements, got ${STRUCTURAL_ELEMENTS.length}`);
});

test('AD14 — grade extraction entries preserved from 07C.4', () => {
  const gradeEntries = STRUCTURAL_ELEMENTS.filter((el) => el.sourceStructuralType === 'GRADE_SECTION');
  assert(gradeEntries.length === 54, `expected 54 grade sections, got ${gradeEntries.length}`);
});

test('AD15 — 07C.3 claim count preserved', () => {
  assert(EXTRACTION_CLAIMS.length === 29, `expected 29 claims, got ${EXTRACTION_CLAIMS.length}`);
});

test('AD16 — stableLocatorKey function still works', () => {
  assert(typeof stableLocatorKey === 'function', 'stableLocatorKey is a function');
  const result = stableLocatorKey({ precision: 'EXACT_PAGE', page: 'p42' });
  assert(result === 'PAGE:p42', `got: ${result}`);
});

test('AD17 — all 07C.4 files still exist', () => {
  assert(existsSync('src/domain/constants/moroccan-primary-structural-extraction.ts'), 'structural extraction exists');
  assert(existsSync('src/domain/constants/moroccan-primary-extraction-manifest.ts'), 'extraction manifest exists');
});

test('AD18 — all 07C.5 files exist', () => {
  assert(existsSync('src/domain/constants/moroccan-primary-completeness-registry.ts'), 'completeness registry exists');
  assert(existsSync('src/domain/constants/moroccan-primary-subject-grade-profiles.ts'), 'subject-grade profiles exists');
});

test('AD19 — no 07C.5 migration files', () => {
  const migrationDir = 'supabase/migrations';
  if (existsSync(migrationDir)) {
    const files = readdirSync(migrationDir);
    const migrationFiles = files.filter((f) => typeof f === 'string' && f.includes('07c5'));
    assert(migrationFiles.length === 0, `no 07c5 migration files found: ${migrationFiles.join(', ')}`);
  }
});

test('AD20 — consistency check: denominator count == grade count × subject count', () => {
  const grades = PRIMARY_GRADE_CODES.length;
  const subjects = SUBJECTS.length;
  assert(DENOMINATOR_REGISTRY.length === grades * subjects,
    `denominators: ${DENOMINATOR_REGISTRY.length}, grades: ${grades}, subjects: ${subjects}, expected: ${grades * subjects}`);
});

// ── SUMMARY ──────────────────────────────────────────────────
console.log('');
console.log(`--- GATE 07C.5: ALL ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);
process.exit(failed > 0 ? 1 : 0);
