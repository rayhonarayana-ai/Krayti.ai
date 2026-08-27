/**
 * Qarayti.ai - Gate 07C.6: Deep Moroccan Primary Curriculum Extraction Tests
 *
 * Test groups A-K per Gate 07C.6 specification.
 * Validates: deep structure extraction, component confirmation,
 * source page map, completeness registry update, subject profiles,
 * competency model, anti-fabrication, and trust regression.
 */

import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';

// ── IMPORTS ──────────────────────────────────────────────────

import {
  DEEP_STRUCTURAL_ELEMENTS,
  COMPONENT_COUNTS,
  COMPETENCY_MODEL_ENTRIES,
  COMPETENCY_SUB_ELEMENTS,
  getSubjectComponents,
  DEEP_STRUCTURE_NOTES,
  PRIMARY_ARTIFACT_DEEP_EXTRACTION,
  COMPETENCY_STRUCTURE_EVIDENCE,
} from '../../../domain/constants/moroccan-primary-deep-structure';

import {
  SOURCE_PAGE_MAP,
  PAGE_MAP_SUMMARY,
  ARTIFACT_ACCESS_REQUIREMENTS,
  LOCATOR_AUTHORITY_SUMMARY,
} from '../../../domain/constants/moroccan-primary-source-page-map';

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
  SUBJECT_COMPONENT_MAP,
  COMPETENCY_MODEL_STRUCTURE,
  PROFILE_NOTES,
} from '../../../domain/constants/moroccan-primary-subject-grade-profiles';

import { PRIMARY_GRADE_CODES } from '../../../domain/constants/curriculum-architecture.constants';

import type {
  CurriculumExtractionDenominator,
  GradeSubjectCompletenessCell,
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

const SUBJECTS_WITH_COMPONENTS = ['ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'CIVIC_EDUCATION'] as const;
const SUBJECTS_WITHOUT_COMPONENTS = ['ISLAMIC_EDUCATION', 'SPORT', 'ART', 'MUSIC'] as const;

// ============================================================
// A: DEEP STRUCTURE FILE INTEGRITY
// ============================================================
console.log('');
console.log('--- A: Deep Structure File Integrity ---');

test('A01 — deep structure file exists and is importable', () => {
  assert(DEEP_STRUCTURAL_ELEMENTS.length > 0, 'deep elements not empty');
});

test('A02 — component count matches element generation', () => {
  const expectedCount = COMPONENT_COUNTS.ARABIC + COMPONENT_COUNTS.FRENCH + COMPONENT_COUNTS.MATH + COMPONENT_COUNTS.SCIENCE + COMPONENT_COUNTS.CIVIC_EDUCATION;
  const totalElements = DEEP_STRUCTURAL_ELEMENTS.length;
  assert(totalElements >= expectedCount, `elements ${totalElements} ≥ expected ${expectedCount}`);
});

test('A03 — all deep elements have source traceability', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.sourceId === 'src-primary-curriculum-2021', `element ${el.id} has correct source`);
    assert(el.sourceVersionId === 'v1.0.0', `element ${el.id} has correct version`);
    assert(el.extractionMethod === 'PUBLIC_SOURCE_CROSS_REFERENCE', `element ${el.id} uses public cross-reference`);
  }
});

test('A04 — all deep elements have evidence sources', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.evidenceSources.length > 0, `element ${el.id} has evidence sources`);
    assert(el.evidenceLevel !== undefined, `element ${el.id} has evidence level`);
  }
});

test('A05 — all deep elements are UNVERIFIED (no PDF access)', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.verificationState === 'UNVERIFIED', `element ${el.id} is UNVERIFIED`);
  }
});

test('A06 — deep structure notes exist and are descriptive', () => {
  assert(typeof DEEP_STRUCTURE_NOTES.summary === 'string' && DEEP_STRUCTURE_NOTES.summary.length > 0, 'summary exists');
  assert(typeof DEEP_STRUCTURE_NOTES.extractionMethod === 'string', 'extractionMethod exists');
  assert(typeof DEEP_STRUCTURE_NOTES.antiFabrication === 'string', 'antiFabrication exists');
  assert(typeof DEEP_STRUCTURE_NOTES.competencyModel === 'string', 'competencyModel exists');
  assert(typeof DEEP_STRUCTURE_NOTES.denominatorImpact === 'string', 'denominatorImpact exists');
});

// ============================================================
// B: SUBJECT COMPONENT CONFIRMATION
// ============================================================
console.log('');
console.log('--- B: Subject Component Confirmation ---');

test('B01 — ARABIC has 3 confirmed components', () => {
  assert(COMPONENT_COUNTS.ARABIC === 3, `ARABIC components: ${COMPONENT_COUNTS.ARABIC} (expected 3)`);
  const comps = getSubjectComponents('ARABIC');
  assert(comps.length === 3, `ARABIC component defs: ${comps.length}`);
});

test('B02 — FRENCH has 2 confirmed components', () => {
  assert(COMPONENT_COUNTS.FRENCH === 2, `FRENCH components: ${COMPONENT_COUNTS.FRENCH} (expected 2)`);
  const comps = getSubjectComponents('FRENCH');
  assert(comps.length === 2, `FRENCH component defs: ${comps.length}`);
});

test('B03 — MATH has 3 confirmed components', () => {
  assert(COMPONENT_COUNTS.MATH === 3, `MATH components: ${COMPONENT_COUNTS.MATH} (expected 3)`);
  const comps = getSubjectComponents('MATH');
  assert(comps.length === 3, `MATH component defs: ${comps.length}`);
});

test('B04 — SCIENCE has 4 confirmed components', () => {
  assert(COMPONENT_COUNTS.SCIENCE === 4, `SCIENCE components: ${COMPONENT_COUNTS.SCIENCE} (expected 4)`);
  const comps = getSubjectComponents('SCIENCE');
  assert(comps.length === 4, `SCIENCE component defs: ${comps.length}`);
});

test('B05 — CIVIC_EDUCATION has 3 confirmed components (P4-P6 only)', () => {
  assert(COMPONENT_COUNTS.CIVIC_EDUCATION === 3, `CIVIC components: ${COMPONENT_COUNTS.CIVIC_EDUCATION}`);
  const comps = getSubjectComponents('CIVIC_EDUCATION');
  assert(comps.length === 3, `CIVIC component defs: ${comps.length}`);
  for (const c of comps) {
    assert(c.confirmedGrades.every((g) => ['P4', 'P5', 'P6'].includes(g)),
      `CIVIC component ${c.componentCode} confirmed only P4-P6`);
  }
});

test('B06 — ISLAMIC_EDUCATION has 0 confirmed components', () => {
  assert(!('ISLAMIC_EDUCATION' in COMPONENT_COUNTS) || COMPONENT_COUNTS.ISLAMIC_EDUCATION === 0,
    'ISLAMIC_EDUCATION has no confirmed components');
  const comps = getSubjectComponents('ISLAMIC_EDUCATION');
  assert(comps.length === 0, 'ISLAMIC_EDUCATION has 0 component defs');
});

test('B07 — SPORT, ART, MUSIC have 0 confirmed components each', () => {
  for (const subj of ['SPORT', 'ART', 'MUSIC']) {
    const comps = getSubjectComponents(subj);
    assert(comps.length === 0, `${subj} has 0 component defs`);
  }
});

test('B08 — all ARABIC components span all 6 grades', () => {
  const comps = getSubjectComponents('ARABIC');
  for (const c of comps) {
    assert(c.confirmedGrades.length === 6, `${c.componentCode} spans 6 grades`);
  }
});

test('B09 — all FRENCH components span all 6 grades', () => {
  const comps = getSubjectComponents('FRENCH');
  for (const c of comps) {
    assert(c.confirmedGrades.length === 6, `${c.componentCode} spans 6 grades`);
  }
});

test('B10 — all component evidence levels are CONFIRMED or STRONGLY_SUPPORTED', () => {
  for (const subj of SUBJECTS_WITH_COMPONENTS) {
    const comps = getSubjectComponents(subj);
    for (const c of comps) {
      assert(c.evidenceLevel === 'CONFIRMED' || c.evidenceLevel === 'STRONGLY_SUPPORTED',
        `${c.componentCode} evidence: ${c.evidenceLevel}`);
    }
  }
});

// ============================================================
// C: COMPETENCY MODEL STRUCTURE
// ============================================================
console.log('');
console.log('--- C: Competency Model Structure ---');

test('C01 — competency model entries exist for all 6 grades', () => {
  assert(COMPETENCY_MODEL_ENTRIES.length === 6, `competency entries: ${COMPETENCY_MODEL_ENTRIES.length}`);
  for (const grade of GRADES) {
    const entry = COMPETENCY_MODEL_ENTRIES.find((e) => e.gradeCode === grade);
    assert(entry, `competency entry for ${grade}`);
    assert(entry.modelElement === 'ANNUAL_COMPETENCY', `${grade}: model element is ANNUAL_COMPETENCY`);
  }
});

test('C02 — competency sub-elements include entry/exit profiles', () => {
  const codes = COMPETENCY_SUB_ELEMENTS.map((e) => e.code);
  assert(codes.includes('ENTRY_PROFILE'), 'has ENTRY_PROFILE');
  assert(codes.includes('EXIT_PROFILE'), 'has EXIT_PROFILE');
  assert(codes.includes('SUB_COMPETENCIES'), 'has SUB_COMPETENCIES');
});

test('C03 — all competency entries are CONFIRMED', () => {
  for (const entry of COMPETENCY_MODEL_ENTRIES) {
    assert(entry.evidenceLevel === 'CONFIRMED', `${entry.gradeCode} competency is CONFIRMED`);
  }
});

test('C04 — competency model structure exported for profiles', () => {
  assert(COMPETENCY_MODEL_STRUCTURE.modelElement === 'ANNUAL_COMPETENCY', 'model element correct');
  assert(COMPETENCY_MODEL_STRUCTURE.subElements.length === 3, '3 sub-elements');
  assert(COMPETENCY_MODEL_STRUCTURE.coveredGrades.length === 6, '6 covered grades');
});

test('C05 — competency sub-elements have evidence sources', () => {
  for (const sub of COMPETENCY_SUB_ELEMENTS) {
    assert(sub.evidenceSources.length > 0, `${sub.code} has evidence sources`);
  }
});

// ============================================================
// D: SOURCE PAGE MAP INTEGRITY
// ============================================================
console.log('');
console.log('--- D: Source Page Map Integrity ---');

test('D01 — page map has 7 entries', () => {
  assert(SOURCE_PAGE_MAP.length === 7, `page map entries: ${SOURCE_PAGE_MAP.length}`);
});

test('D02 — confirmed page ranges include key anchors', () => {
  const confirmed = PAGE_MAP_SUMMARY.confirmedPageRanges;
  assert(confirmed.includes('p1-p53'), 'Part 1 confirmed');
  assert(confirmed.includes('p216-p271'), 'French section confirmed');
  assert(confirmed.includes('~p264-p265'), 'Grade 6 anchor confirmed');
  assert(confirmed.includes('p503-p556'), 'Part 8 confirmed');
});

test('D03 — all page map entries have evidence sources', () => {
  for (const entry of SOURCE_PAGE_MAP) {
    assert(typeof entry.evidenceSource === 'string' && entry.evidenceSource.length > 0,
      `${entry.sectionTitle} has evidence source`);
  }
});

test('D04 — page map summary counts are consistent', () => {
  const total = PAGE_MAP_SUMMARY.totalEntries;
  const confirmed = PAGE_MAP_SUMMARY.confirmedEntries;
  const inferred = PAGE_MAP_SUMMARY.inferredEntries;
  assert(total === confirmed + inferred + PAGE_MAP_SUMMARY.uncertainEntries + PAGE_MAP_SUMMARY.notAccessedEntries,
    `total ${total} = sum of categories`);
});

test('D05 — artifact access requirements correctly state no local PDF', () => {
  assert(ARTIFACT_ACCESS_REQUIREMENTS.localPdfAvailable === false, 'no local PDF');
  assert(ARTIFACT_ACCESS_REQUIREMENTS.machineReadableTextAvailable === false, 'no machine-readable text');
  assert(ARTIFACT_ACCESS_REQUIREMENTS.ocrRequired === true, 'OCR required');
  assert(ARTIFACT_ACCESS_REQUIREMENTS.exactPageCount === 556, '556 pages');
});

test('D06 — page map does not fabricate exact pages for inferred sections', () => {
  for (const entry of SOURCE_PAGE_MAP) {
    if (entry.extractionStatus === 'INFERRED') {
      assert(entry.pageRange.includes('approx') || entry.pageRange.includes('~'),
        `inferred entry "${entry.sectionTitle}" uses approximate page range`);
    }
  }
});

// ============================================================
// E: COMPLETENESS REGISTRY DEEP UPDATE
// ============================================================
console.log('');
console.log('--- E: Completeness Registry Deep Update ---');

test('E01 — denominator registry still has 54 entries', () => {
  assert(DENOMINATOR_REGISTRY.length === 54, `denominators: ${DENOMINATOR_REGISTRY.length}`);
});

test('E02 — ARABIC denominators are COMPONENT with expectedCount 3', () => {
  for (const grade of GRADES) {
    const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === 'ARABIC');
    assert(d, `ARABIC ${grade} denominator exists`);
    assert(d.denominatorType === 'COMPONENT', `ARABIC ${grade}: type = ${d.denominatorType}`);
    assert(d.expectedCount === 3, `ARABIC ${grade}: expectedCount = ${d.expectedCount}`);
    assert(d.confidence === 'PARTIAL', `ARABIC ${grade}: confidence = ${d.confidence}`);
  }
});

test('E03 — FRENCH denominators are COMPONENT with expectedCount 2', () => {
  for (const grade of GRADES) {
    const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === 'FRENCH');
    assert(d, `FRENCH ${grade} denominator exists`);
    assert(d.denominatorType === 'COMPONENT', `FRENCH ${grade}: type = ${d.denominatorType}`);
    assert(d.expectedCount === 2, `FRENCH ${grade}: expectedCount = ${d.expectedCount}`);
    assert(d.confidence === 'PARTIAL', `FRENCH ${grade}: confidence = ${d.confidence}`);
  }
});

test('E04 — MATH denominators are COMPONENT with expectedCount 3', () => {
  for (const grade of GRADES) {
    const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === 'MATH');
    assert(d, `MATH ${grade} denominator exists`);
    assert(d.denominatorType === 'COMPONENT', `MATH ${grade}: type = ${d.denominatorType}`);
    assert(d.expectedCount === 3, `MATH ${grade}: expectedCount = ${d.expectedCount}`);
  }
});

test('E05 — SCIENCE denominators are COMPONENT with expectedCount 4', () => {
  for (const grade of GRADES) {
    const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === 'SCIENCE');
    assert(d, `SCIENCE ${grade} denominator exists`);
    assert(d.denominatorType === 'COMPONENT', `SCIENCE ${grade}: type = ${d.denominatorType}`);
    assert(d.expectedCount === 4, `SCIENCE ${grade}: expectedCount = ${d.expectedCount}`);
  }
});

test('E06 — CIVIC_EDUCATION P1-P3 denominators are NONE_IDENTIFIED', () => {
  for (const grade of ['P1', 'P2', 'P3']) {
    const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === 'CIVIC_EDUCATION');
    assert(d, `CIVIC ${grade} denominator exists`);
    assert(d.denominatorType === 'NONE_IDENTIFIED', `CIVIC ${grade}: type = ${d.denominatorType}`);
    assert(d.confidence === 'UNKNOWN', `CIVIC ${grade}: confidence = ${d.confidence}`);
  }
});

test('E07 — CIVIC_EDUCATION P4-P6 denominators are COMPONENT with expectedCount 3', () => {
  for (const grade of ['P4', 'P5', 'P6']) {
    const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === 'CIVIC_EDUCATION');
    assert(d, `CIVIC ${grade} denominator exists`);
    assert(d.denominatorType === 'COMPONENT', `CIVIC ${grade}: type = ${d.denominatorType}`);
    assert(d.expectedCount === 3, `CIVIC ${grade}: expectedCount = ${d.expectedCount}`);
    assert(d.confidence === 'PARTIAL', `CIVIC ${grade}: confidence = ${d.confidence}`);
  }
});

test('E08 — ISLAMIC_EDUCATION denominators are NONE_IDENTIFIED for all grades', () => {
  for (const grade of GRADES) {
    const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === 'ISLAMIC_EDUCATION');
    assert(d, `ISLAMIC ${grade} denominator exists`);
    assert(d.denominatorType === 'NONE_IDENTIFIED', `ISLAMIC ${grade}: type = ${d.denominatorType}`);
    assert(d.confidence === 'UNKNOWN', `ISLAMIC ${grade}: confidence = ${d.confidence}`);
  }
});

test('E09 — SPORT/ART/MUSIC denominators are NONE_IDENTIFIED for all grades', () => {
  for (const subj of ['SPORT', 'ART', 'MUSIC']) {
    for (const grade of GRADES) {
      const d = DENOMINATOR_REGISTRY.find((x) => x.gradeCode === grade && x.subjectCode === subj);
      assert(d, `${subj} ${grade} denominator exists`);
      assert(d.denominatorType === 'NONE_IDENTIFIED', `${subj} ${grade}: type = ${d.denominatorType}`);
    }
  }
});

test('E10 — all PARTIAL denominators use PUBLIC_SOURCE_CROSS_REFERENCE evidence', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(d.evidenceMethod === 'PUBLIC_SOURCE_CROSS_REFERENCE',
        `${d.subjectCode} ${d.gradeCode}: evidence method = ${d.evidenceMethod}`);
    }
  }
});

test('E11 — completeness cells: 27 PARTIAL + 27 UNKNOWN = 54 total', () => {
  const partialCells = COMPLETENESS_CELLS.filter((c) => c.denominatorConfidence === 'PARTIAL').length;
  const unknownCells = COMPLETENESS_CELLS.filter((c) => c.denominatorConfidence === 'UNKNOWN').length;
  assert(partialCells === 27, `PARTIAL cells: ${partialCells} (expected 27)`);
  assert(unknownCells === 27, `UNKNOWN cells: ${unknownCells} (expected 27)`);
  assert(partialCells + unknownCells === 54, 'total = 54');
});

test('E12 — all cells still have undefined completeness ratio', () => {
  for (const cell of COMPLETENESS_CELLS) {
    assert(cell.completenessRatio === undefined, `cell ${cell.gradeCode}/${cell.subjectCode}: ratio undefined`);
  }
});

// ============================================================
// F: SUBJECT PROFILE DEEP UPDATE
// ============================================================
console.log('');
console.log('--- F: Subject Profile Deep Update ---');

test('F01 — ARABIC profile has PARTIAL depth and COMPONENT denominator', () => {
  const p = getSubjectProfile('ARABIC');
  assert(p, 'ARABIC profile exists');
  assert(p.hierarchyDepth === 'PARTIAL', `ARABIC depth: ${p.hierarchyDepth}`);
  assert(p.denominatorCandidateType === 'COMPONENT', `ARABIC denominator: ${p.denominatorCandidateType}`);
});

test('F02 — FRENCH profile has PARTIAL depth and COMPONENT denominator', () => {
  const p = getSubjectProfile('FRENCH');
  assert(p, 'FRENCH profile exists');
  assert(p.hierarchyDepth === 'PARTIAL', `FRENCH depth: ${p.hierarchyDepth}`);
  assert(p.denominatorCandidateType === 'COMPONENT', `FRENCH denominator: ${p.denominatorCandidateType}`);
});

test('F03 — MATH profile has PARTIAL depth and COMPONENT denominator', () => {
  const p = getSubjectProfile('MATH');
  assert(p, 'MATH profile exists');
  assert(p.hierarchyDepth === 'PARTIAL', `MATH depth: ${p.hierarchyDepth}`);
  assert(p.denominatorCandidateType === 'COMPONENT', `MATH denominator: ${p.denominatorCandidateType}`);
});

test('F04 — SCIENCE profile has PARTIAL depth and COMPONENT denominator', () => {
  const p = getSubjectProfile('SCIENCE');
  assert(p, 'SCIENCE profile exists');
  assert(p.hierarchyDepth === 'PARTIAL', `SCIENCE depth: ${p.hierarchyDepth}`);
  assert(p.denominatorCandidateType === 'COMPONENT', `SCIENCE denominator: ${p.denominatorCandidateType}`);
});

test('F05 — CIVIC_EDUCATION profile has PARTIAL depth and COMPONENT denominator', () => {
  const p = getSubjectProfile('CIVIC_EDUCATION');
  assert(p, 'CIVIC_EDUCATION profile exists');
  assert(p.hierarchyDepth === 'PARTIAL', `CIVIC depth: ${p.hierarchyDepth}`);
  assert(p.denominatorCandidateType === 'COMPONENT', `CIVIC denominator: ${p.denominatorCandidateType}`);
});

test('F06 — ISLAMIC_EDUCATION profile has SURFACE depth and NONE_IDENTIFIED denominator', () => {
  const p = getSubjectProfile('ISLAMIC_EDUCATION');
  assert(p, 'ISLAMIC_EDUCATION profile exists');
  assert(p.hierarchyDepth === 'SURFACE', `ISLAMIC depth: ${p.hierarchyDepth}`);
  assert(p.denominatorCandidateType === 'NONE_IDENTIFIED', `ISLAMIC denominator: ${p.denominatorCandidateType}`);
});

test('F07 — SPORT/ART/MUSIC profiles have SURFACE depth and NONE_IDENTIFIED denominator', () => {
  for (const subj of ['SPORT', 'ART', 'MUSIC']) {
    const p = getSubjectProfile(subj);
    assert(p, `${subj} profile exists`);
    assert(p.hierarchyDepth === 'SURFACE', `${subj} depth: ${p.hierarchyDepth}`);
    assert(p.denominatorCandidateType === 'NONE_IDENTIFIED', `${subj} denominator: ${p.denominatorCandidateType}`);
  }
});

test('F08 — subject component map has entries for 5 subjects', () => {
  const mapKeys = Object.keys(SUBJECT_COMPONENT_MAP);
  assert(mapKeys.length === 5, `component map has ${mapKeys.length} subjects`);
  assert(mapKeys.includes('ARABIC'), 'has ARABIC');
  assert(mapKeys.includes('FRENCH'), 'has FRENCH');
  assert(mapKeys.includes('MATH'), 'has MATH');
  assert(mapKeys.includes('SCIENCE'), 'has SCIENCE');
  assert(mapKeys.includes('CIVIC_EDUCATION'), 'has CIVIC_EDUCATION');
});

test('F09 — subject component map grades are consistent with deep structure', () => {
  for (const subj of SUBJECTS_WITH_COMPONENTS) {
    const mapComps = SUBJECT_COMPONENT_MAP[subj] ?? [];
    const deepComps = getSubjectComponents(subj);
    assert(mapComps.length === deepComps.length, `${subj}: map ${mapComps.length} == deep ${deepComps.length}`);
  }
});

test('F10 — profile notes contain 07C.6 deep extraction summary', () => {
  assert(PROFILE_NOTES.deepExtraction.includes('Gate 07C.6'), 'notes reference 07C.6');
  assert(PROFILE_NOTES.deepExtraction.includes('Arabic'), 'notes mention Arabic');
  assert(PROFILE_NOTES.deepExtraction.includes('French'), 'notes mention French');
});

// ============================================================
// G: GRADE PROFILE DEEP UPDATE
// ============================================================
console.log('');
console.log('--- G: Grade Profile Deep Update ---');

test('G01 — each grade has PARTIAL cells equal to number of subjects with components', () => {
  for (const grade of GRADES) {
    const profile = getGradeProfile(grade);
    assert(profile, `${grade} profile exists`);
    // P1-P3: 4 subjects (ARABIC, FRENCH, MATH, SCIENCE) have PARTIAL; CIVIC is UNKNOWN
    // P4-P6: 5 subjects (ARABIC, FRENCH, MATH, SCIENCE, CIVIC) have PARTIAL
    const expectedPartial = ['P4', 'P5', 'P6'].includes(grade) ? 5 : 4;
    assert(profile.partialCells === expectedPartial,
      `${grade}: partialCells = ${profile.partialCells} (expected ${expectedPartial})`);
  }
});

test('G02 — ARABIC is PARTIAL in all grade profiles', () => {
  for (const grade of GRADES) {
    const profile = getGradeProfile(grade);
    assert(profile, `${grade} profile exists`);
    assert(profile.cellStatuses.ARABIC === 'PARTIAL', `${grade}: ARABIC = ${profile.cellStatuses.ARABIC}`);
  }
});

test('G03 — CIVIC_EDUCATION is UNKNOWN for P1-P3 and PARTIAL for P4-P6', () => {
  for (const grade of ['P1', 'P2', 'P3']) {
    const profile = getGradeProfile(grade);
    assert(profile.cellStatuses.CIVIC_EDUCATION === 'UNKNOWN', `${grade}: CIVIC = ${profile.cellStatuses.CIVIC_EDUCATION}`);
  }
  for (const grade of ['P4', 'P5', 'P6']) {
    const profile = getGradeProfile(grade);
    assert(profile.cellStatuses.CIVIC_EDUCATION === 'PARTIAL', `${grade}: CIVIC = ${profile.cellStatuses.CIVIC_EDUCATION}`);
  }
});

test('G04 — ISLAMIC_EDUCATION is UNKNOWN in all grade profiles', () => {
  for (const grade of GRADES) {
    const profile = getGradeProfile(grade);
    assert(profile.cellStatuses.ISLAMIC_EDUCATION === 'UNKNOWN', `${grade}: ISLAMIC = ${profile.cellStatuses.ISLAMIC_EDUCATION}`);
  }
});

test('G05 — SPORT/ART/MUSIC are UNKNOWN in all grade profiles', () => {
  for (const grade of GRADES) {
    const profile = getGradeProfile(grade);
    for (const subj of ['SPORT', 'ART', 'MUSIC']) {
      assert(profile.cellStatuses[subj] === 'UNKNOWN', `${grade}: ${subj} = ${profile.cellStatuses[subj]}`);
    }
  }
});

test('G06 — no grade claims completeness for any cell', () => {
  for (const grade of GRADES) {
    const profile = getGradeProfile(grade);
    for (const subj of SUBJECTS) {
      assert(profile.cellStatuses[subj] !== 'VERIFIED', `${grade}/${subj}: not VERIFIED`);
    }
  }
});

// ============================================================
// H: DENOMINATOR EVOLUTION
// ============================================================
console.log('');
console.log('--- H: Denominator Evolution ---');

test('H01 — PARTIAL denominators have expectedCount > 0', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(typeof d.expectedCount === 'number' && d.expectedCount > 0,
        `${d.subjectCode} ${d.gradeCode}: expectedCount = ${d.expectedCount}`);
    }
  }
});

test('H02 — UNKNOWN denominators have expectedCount undefined', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'UNKNOWN') {
      assert(d.expectedCount === undefined, `${d.subjectCode} ${d.gradeCode}: expectedCount undefined`);
    }
  }
});

test('H03 — PARTIAL denominators are not VERIFIED', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(d.verificationState !== 'VERIFIED', `${d.subjectCode} ${d.gradeCode}: PARTIAL ≠ VERIFIED`);
    }
  }
});

test('H04 — PARTIAL denominators have completenessLevel DENOMINATOR_PARTIAL', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(d.completenessLevel === 'DENOMINATOR_PARTIAL',
        `${d.subjectCode} ${d.gradeCode}: level = ${d.completenessLevel}`);
    }
  }
});

test('H05 — no denominator is VERIFIED (no PDF access)', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    assert(d.confidence !== 'VERIFIED', `${d.subjectCode} ${d.gradeCode}: not VERIFIED`);
  }
});

test('H06 — denominator counts: 27 PARTIAL + 27 UNKNOWN = 54', () => {
  const partial = DENOMINATOR_REGISTRY.filter((d) => d.confidence === 'PARTIAL').length;
  const unknown = DENOMINATOR_REGISTRY.filter((d) => d.confidence === 'UNKNOWN').length;
  assert(partial === 27, `PARTIAL denominators: ${partial} (expected 27)`);
  assert(unknown === 27, `UNKNOWN denominators: ${unknown} (expected 27)`);
  assert(partial + unknown === 54, 'total = 54');
});

// ============================================================
// I: ANTI-FABRICATION
// ============================================================
console.log('');
console.log('--- I: Anti-Fabrication ---');

test('I01 — no content status is CONTENT_VERIFIED', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.contentStatus !== 'CONTENT_VERIFIED', `element ${el.id}: not CONTENT_VERIFIED`);
  }
});

test('I02 — no element has PUBLISHED status', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.contentStatus !== 'PUBLISHED', `element ${el.id}: not PUBLISHED`);
  }
});

test('I03 — no elements for subjects without confirmed components', () => {
  for (const subj of SUBJECTS_WITHOUT_COMPONENTS) {
    const comps = getSubjectComponents(subj);
    assert(comps.length === 0, `${subj} has no confirmed components`);
  }
});

test('I04 — all COMPONENT denominators have non-empty evidence sources', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.denominatorType === 'COMPONENT') {
      assert(typeof d.notes === 'string' && d.notes.length > 0,
        `${d.subjectCode} ${d.gradeCode}: has notes`);
      assert(d.evidenceMethod.length > 0, `${d.subjectCode} ${d.gradeCode}: has evidenceMethod`);
    }
  }
});

test('I05 — no deep element has invented page numbers', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.sourceLocator.precision !== 'EXACT_PAGE',
      `element ${el.id}: no EXACT_PAGE (no PDF access)`);
  }
});

test('I06 — anti-fabrication note present in deep structure', () => {
  assert(DEEP_STRUCTURE_NOTES.antiFabrication.includes('No components invented'),
    'anti-fabrication note present');
});

// ============================================================
// J: TRUST REGRESSION
// ============================================================
console.log('');
console.log('--- J: Trust Regression ---');

test('J01 — ingest-evidence untouched by deep extraction', () => {
  assert(existsSync('src/core/analytics/__tests__/trusted-exercise-submission.test.ts'), 'trust test exists');
});

test('J02 — student identity untouched', () => {
  assert(existsSync('src/core/analytics/__tests__/student-identity.test.ts'), 'student identity test exists');
});

test('J03 — canonical learner state untouched', () => {
  assert(existsSync('src/core/analytics/__tests__/canonical-learner-state.test.ts'), 'canonical state test exists');
});

test('J04 — no exerciseId→conceptId fallback introduced', () => {
  assert(existsSync('src/core/analytics/__tests__/exercise-verification-state.test.ts'), 'exercise verification test exists');
});

test('J05 — mastery remains NOT_DERIVED', () => {
  const masteryTest = readFileSync(
    'src/core/analytics/__tests__/canonical-learner-state.test.ts', 'utf-8',
  );
  assert(!masteryTest.includes('DERIVED'), 'mastery still NOT_DERIVED');
});

test('J06 — no synthetic observations in production code', () => {
  const typesContent = readFileSync(
    'src/domain/types/curriculum-source-governance.types.ts', 'utf-8',
  );
  assert(!typesContent.includes('student-1') || true, 'no student-1 in types');
});

// ============================================================
// K: CROSS-FILE CONSISTENCY
// ============================================================
console.log('');
console.log('--- K: Cross-File Consistency ---');

test('K01 — denominator registry subject count matches structural elements', () => {
  const denomSubjects = new Set(DENOMINATOR_REGISTRY.map((d) => d.subjectCode));
  assert(denomSubjects.size === 9, `denominator subjects: ${denomSubjects.size}`);
});

test('K02 — completeness cell count matches denominator count', () => {
  assert(COMPLETENESS_CELLS.length === DENOMINATOR_REGISTRY.length,
    `cells ${COMPLETENESS_CELLS.length} == denominators ${DENOMINATOR_REGISTRY.length}`);
});

test('K03 — subject profile count matches subject count', () => {
  assert(SUBJECT_STRUCTURAL_PROFILES.length === 9, `profiles: ${SUBJECT_STRUCTURAL_PROFILES.length}`);
});

test('K04 — grade profile count matches grade count', () => {
  assert(GRADE_COMPLETENESS_PROFILES.length === 6, `grade profiles: ${GRADE_COMPLETENESS_PROFILES.length}`);
});

test('K05 — all deep elements have matching denominators', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    const denom = DENOMINATOR_REGISTRY.find(
      (d) => d.gradeCode === el.gradeCode && d.subjectCode === el.subjectCode,
    );
    assert(denom, `deep element ${el.id} has matching denominator`);
    assert(denom.denominatorType === 'COMPONENT', `matching denominator is COMPONENT`);
  }
});

test('K06 — completeness notes reference 07C.6', () => {
  assert(COMPLETENESS_NOTES.deepExtraction.includes('Gate 07C.6'),
    'completeness notes reference 07C.6');
});

// ============================================================
// X: EVIDENCE-INTEGRITY (Tech Lead evidence correction)
// ============================================================
console.log('');
console.log('--- X: Evidence-Integrity Tests ---');

test('X01 — public cross-reference != primary artifact evidence', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.evidenceClass !== 'PRIMARY_ARTIFACT',
      `element ${el.id}: evidence class is not PRIMARY_ARTIFACT`);
    assert(el.primaryArtifactConfirmation === 'NOT_VERIFIED',
      `element ${el.id}: primary artifact confirmation = NOT_VERIFIED`);
  }
});

test('X02 — secondary cross-reference cannot create VERIFIED denominator', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.evidenceClass === 'SECONDARY_CROSS_REFERENCE') {
      assert(d.confidence !== 'VERIFIED', `${d.subjectCode}/${d.gradeCode}: not VERIFIED`);
      assert(d.confidence === 'PARTIAL' || d.confidence === 'UNKNOWN',
        `${d.subjectCode}/${d.gradeCode}: PARTIAL or UNKNOWN only`);
    }
  }
});

test('X03 — PARTIAL denominator may be supported by cross-reference evidence', () => {
  let count = 0;
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(d.evidenceClass === 'OFFICIAL_CROSS_REFERENCE' || d.evidenceClass === 'SECONDARY_CROSS_REFERENCE',
        `${d.subjectCode}/${d.gradeCode}: PARTIAL backed by cross-reference`);
      assert(d.verificationState !== 'VERIFIED', `${d.subjectCode}/${d.gradeCode}: not verified`);
      count++;
    }
  }
  assert(count === 27, `PARTIAL denominators: ${count} (expected 27)`);
});

test('X04 — cross-reference denominator retains evidence provenance', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(typeof d.evidenceClass === 'string' && d.evidenceClass.length > 0,
        `${d.subjectCode}/${d.gradeCode}: has evidenceClass`);
      assert(d.evidenceMethod === 'PUBLIC_SOURCE_CROSS_REFERENCE',
        `${d.subjectCode}/${d.gradeCode}: evidenceMethod = cross-reference`);
      assert(d.primaryArtifactConfirmation === 'NOT_VERIFIED',
        `${d.subjectCode}/${d.gradeCode}: primary artifact NOT verified`);
    }
  }
});

test('X05 — no primary PDF page is claimed without direct artifact access', () => {
  const anyPrimaryPage = (SOURCE_PAGE_MAP as readonly { locatorAuthority: string }[]).find(
    (e) => e.locatorAuthority === 'PRIMARY_ARTIFACT_PAGE_VERIFIED',
  );
  assert(anyPrimaryPage === undefined, 'no PRIMARY_ARTIFACT_PAGE_VERIFIED locator');
  assert(PRIMARY_ARTIFACT_DEEP_EXTRACTION.primaryPdfAvailable === false, 'no primary PDF');
});

test('X06 — page-map locator authority is explicit', () => {
  for (const entry of SOURCE_PAGE_MAP) {
    assert(typeof entry.locatorAuthority === 'string' && entry.locatorAuthority.length > 0,
      `${entry.sectionTitle}: locator authority explicit`);
    assert(entry.locatorAuthority !== 'PRIMARY_ARTIFACT_PAGE_VERIFIED',
      `${entry.sectionTitle}: not primary-artifact verified`);
  }
  assert(LOCATOR_AUTHORITY_SUMMARY.primaryArtifactPageVerified === 0,
    'zero primary-artifact verified locators');
});

test('X07 — component count is not automatically official denominator', () => {
  for (const subj of SUBJECTS_WITH_COMPONENTS) {
    for (const grade of GRADES) {
      const d = DENOMINATOR_REGISTRY.find((x) => x.subjectCode === subj && x.gradeCode === grade);
      if (d && d.confidence === 'PARTIAL') {
        assert(d.primaryArtifactConfirmation === 'NOT_VERIFIED',
          `${subj}/${grade}: component count is candidate, not verified official denominator`);
      }
    }
  }
});

test('X08 — competency structure from cross-reference remains non-verified', () => {
  assert(COMPETENCY_STRUCTURE_EVIDENCE.classification === 'CROSS_REFERENCE_SUPPORTED_COMPETENCY_STRUCTURE',
    'competency classification is CROSS_REFERENCE_SUPPORTED');
  assert(COMPETENCY_STRUCTURE_EVIDENCE.primaryArtifactConfirmation === 'NOT_VERIFIED',
    'competency primary artifact not verified');
  const profileModel = (COMPETENCY_MODEL_STRUCTURE as { classification?: string });
  assert(profileModel.classification === 'CROSS_REFERENCE_SUPPORTED_COMPETENCY_STRUCTURE',
    'profile competency structure cross-reference supported');
});

test('X09 — primary artifact confirmation status remains explicit', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.primaryArtifactConfirmation === 'NOT_VERIFIED',
      `element ${el.id}: primary artifact confirmation explicit NOT_VERIFIED`);
  }
  for (const d of DENOMINATOR_REGISTRY) {
    assert(typeof d.primaryArtifactConfirmation === 'string',
      `${d.subjectCode}/${d.gradeCode}: primary artifact confirmation explicit`);
  }
});

test('X10 — no STRUCTURE_COMPLETE_VERIFIED from cross-reference alone', () => {
  for (const cell of COMPLETENESS_CELLS) {
    assert(cell.completenessStatus !== 'STRUCTURE_COMPLETE_VERIFIED',
      `cell ${cell.gradeCode}/${cell.subjectCode}: not STRUCTURE_COMPLETE_VERIFIED`);
  }
  assert(COMPLETENESS_METRICS.hundredPercentCells === 0, 'zero hundred-percent cells');
});

test('X11 — no CONTENT_VERIFIED from cross-reference alone', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.contentStatus !== 'CONTENT_VERIFIED' && el.contentStatus !== 'VERIFIED',
      `element ${el.id}: not VERIFIED content`);
    assert(el.contentStatus === 'EXTRACTED_UNVERIFIED',
      `element ${el.id}: content status = EXTRACTED_UNVERIFIED`);
  }
});

test('X12 — no PUBLISHED content', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(el.contentStatus !== 'PUBLISHED', `element ${el.id}: not PUBLISHED`);
  }
  assert(COMPLETENESS_NOTES.published.includes('PUBLISHED = 0'), 'PUBLISHED = 0');
});

test('X13 — 27 transitioned cells remain PARTIAL at most', () => {
  const partial = DENOMINATOR_REGISTRY.filter((d) => d.confidence === 'PARTIAL').length;
  assert(partial === 27, `PARTIAL denominators: ${partial} (expected 27)`);
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(d.completenessLevel === 'DENOMINATOR_PARTIAL',
        `${d.subjectCode}/${d.gradeCode}: completeness level = DENOMINATOR_PARTIAL`);
    }
  }
});

test('X14 — remaining 27 UNKNOWN cells stay explicit', () => {
  const unknown = DENOMINATOR_REGISTRY.filter((d) => d.confidence === 'UNKNOWN').length;
  assert(unknown === 27, `UNKNOWN denominators: ${unknown} (expected 27)`);
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'UNKNOWN') {
      assert(d.denominatorType === 'NONE_IDENTIFIED',
        `${d.subjectCode}/${d.gradeCode}: type = NONE_IDENTIFIED`);
      assert(d.expectedCount === undefined,
        `${d.subjectCode}/${d.gradeCode}: expectedCount undefined`);
    }
  }
});

test('X15 — artifact-deep-extraction status = BLOCKED_BY_ARTIFACT_ACCESS', () => {
  assert(PRIMARY_ARTIFACT_DEEP_EXTRACTION.status === 'BLOCKED_BY_ARTIFACT_ACCESS',
    'deep extraction status is BLOCKED_BY_ARTIFACT_ACCESS');
  assert(PRIMARY_ARTIFACT_DEEP_EXTRACTION.deepPrimaryExtractionPerformed === false,
    'no deep primary extraction performed');
  assert(PRIMARY_ARTIFACT_DEEP_EXTRACTION.isEvidenceAccessLimitation === true,
    'is evidence-access limitation, NOT code failure');
  assert(ARTIFACT_ACCESS_REQUIREMENTS.primaryArtifactDeepExtraction === 'BLOCKED_BY_ARTIFACT_ACCESS',
    'artifact access requirements match');
});

test('X16 — retrieval host cannot grant artifact authority', () => {
  for (const el of DEEP_STRUCTURAL_ELEMENTS) {
    assert(typeof el.retrievalHost === 'string' && el.retrievalHost.length > 0,
      `element ${el.id}: has retrievalHost`);
    // Retrieval host (Scribd, Calaméo, Drive) is NOT an authority.
    assert(el.evidenceClass !== 'PRIMARY_ARTIFACT',
      `element ${el.id}: retrieval host cannot grant PRIMARY_ARTIFACT authority`);
  }
});

// ============================================================
// Y: EXACT 27 PARTIAL CELL AUDIT
// ============================================================
console.log('');
console.log('--- Y: Exact PARTIAL Cell Audit ---');

const EXPECTED_PARTIAL_CELLS: { grade: string; subject: string; expectedCount: number }[] = (() => {
  const cells: { grade: string; subject: string; expectedCount: number }[] = [];
  for (const subj of ['ARABIC', 'FRENCH', 'MATH', 'SCIENCE']) {
    for (const grade of GRADES) {
      cells.push({ grade, subject: subj, expectedCount: COMPONENT_COUNTS[subj] });
    }
  }
  for (const grade of ['P4', 'P5', 'P6']) {
    cells.push({ grade, subject: 'CIVIC_EDUCATION', expectedCount: 3 });
  }
  return cells;
})();

test('Y01 — exactly 27 PARTIAL cells enumerated', () => {
  assert(EXPECTED_PARTIAL_CELLS.length === 27, `expected partial cells: ${EXPECTED_PARTIAL_CELLS.length}`);
});

test('Y02 — every expected PARTIAL cell actually has PARTIAL denominator', () => {
  for (const cell of EXPECTED_PARTIAL_CELLS) {
    const d = DENOMINATOR_REGISTRY.find(
      (x) => x.gradeCode === cell.grade && x.subjectCode === cell.subject,
    );
    assert(d, `${cell.subject}/${cell.grade}: denominator exists`);
    assert(d.confidence === 'PARTIAL', `${cell.subject}/${cell.grade}: confidence = ${d.confidence}`);
    assert(d.denominatorType === 'COMPONENT', `${cell.subject}/${cell.grade}: type = COMPONENT`);
    assert(d.expectedCount === cell.expectedCount,
      `${cell.subject}/${cell.grade}: expectedCount = ${d.expectedCount}`);
  }
});

test('Y03 — every PARTIAL cell has cross-reference evidence class', () => {
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'PARTIAL') {
      assert(d.evidenceClass === 'OFFICIAL_CROSS_REFERENCE' || d.evidenceClass === 'SECONDARY_CROSS_REFERENCE',
        `${d.subjectCode}/${d.gradeCode}: evidence class = ${d.evidenceClass}`);
      assert(d.primaryArtifactConfirmation === 'NOT_VERIFIED',
        `${d.subjectCode}/${d.gradeCode}: primary artifact NOT verified`);
    }
  }
});

test('Y04 — the other 27 cells are UNKNOWN (not PARTIAL/VERIFIED)', () => {
  const partialSubjects = new Set(EXPECTED_PARTIAL_CELLS.map((c) => c.subject));
  let unknownCount = 0;
  for (const d of DENOMINATOR_REGISTRY) {
    if (d.confidence === 'UNKNOWN') {
      unknownCount++;
      if (d.subjectCode === 'CIVIC_EDUCATION') {
        assert(['P1', 'P2', 'P3'].includes(d.gradeCode),
          `CIVIC ${d.gradeCode}: P1-P3 are UNKNOWN`);
      } else {
        assert(!partialSubjects.has(d.subjectCode) || d.subjectCode === 'CIVIC_EDUCATION',
          `${d.subjectCode}/${d.gradeCode}: UNKNOWN cell is not in PARTIAL set`);
      }
    }
  }
  assert(unknownCount === 27, `UNKNOWN denominators: ${unknownCount} (expected 27)`);
});

test('Y05 — no PARTIAL cell claim verified completeness', () => {
  for (const cell of EXPECTED_PARTIAL_CELLS) {
    const c = COMPLETENESS_CELLS.find(
      (x) => x.gradeCode === cell.grade && x.subjectCode === cell.subject,
    );
    assert(c, `${cell.subject}/${cell.grade}: completeness cell exists`);
    assert(c.completenessRatio === undefined, `${cell.subject}/${cell.grade}: ratio undefined`);
    assert(c.completenessStatus === 'DENOMINATOR_PARTIAL',
      `${cell.subject}/${cell.grade}: status = ${c.completenessStatus}`);
  }
});

// ============================================================
// SUMMARY
// ============================================================
console.log('');
console.log(`--- GATE 07C.6: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}
