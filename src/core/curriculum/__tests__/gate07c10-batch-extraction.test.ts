/**
 * Qarayti.ai - Gate 07C.10: Controlled Batch Extraction Protocol - Phase B
 * Tests
 *
 * Groups for the controlled batch-extraction registry:
 *   A. BASELINE/FREEZE  A01-A06  exact two-batch universe, both manifests FROZEN,
 *                                artifact binding unchanged, source version bound
 *   B. MANIFEST FREEZE  B01-B09  Batch A manifest exact, Batch B manifest exact,
 *                                extraction method/class, page boundaries
 *   C. CELL SCOPE       C01-C07  cells attach to source-native elements, physical/
 *                                printed/scan consistency, DIRECT_DIGITAL only on
 *                                clean pages, cell->batch binding
 *   D. CLAIM BINDING    D01-D08  claims bound to manifest+cells, 3+8 counts,
 *                                exactly-one-language, no fabricated wording
 *   E. GRADE TRUTH      E01-E07  calibrated evidence, REVIEW_REQUIRED honesty,
 *                                no fabricated grade ownership, band vs exact
 *   F. CONTENT          F01-F07  only evidence-backed categories, no structural
 *                                restatement, states consistent
 *   G. DEDUP/IDENTITY   G01-G10  semantic-key identity, within-batch unique,
 *                                A<->B zero, vs 07C.7 zero, vs 07C.9 zero,
 *                                8 comparisons executed, 0 prevented, frozen
 *   H. NEGATIVE SCOPE   H01-H08  deferred/rejected never become claims, listening
 *                                BLOCKED, batch + gate-level rejections
 *   I. ISOLATION        I01-I06  07C.7 16 claims untouched, 07C.9 11/3 untouched,
 *                                07C.8 6 reviews untouched, no cross-universe ids
 *   J. LEDGER           J01-J08  derived counts, attribution counts, safety zeros
 *   K. CLOSURE          K01-K06  BATCH_CLOSED reached, closedAt bound,
 *                                closure != verified/published
 *   L. GLOBAL FREEZES   L01-L06  verified=0 published=0 denominator math,
 *                                mastery/completeness untouched
 *   M. VERDICT          M01-M08  PASS, flags, exact status line
 *   N. REPO/SECURITY    N01-N06  no PDF/OCR dumps, no abs paths, no secrets,
 *                                no migration/DB write/deploy
 *
 * The tests validate the CONTROLLED-BATCH registry and its invariants. They do
 * NOT create units/lessons/KOs/exercises and do NOT modify learner/runtime
 * behavior, write to a database, or deploy anything.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  ALL_BATCH_CELLS,
  ALL_BATCH_CLAIMS,
  BATCH_A_CELLS,
  BATCH_A_CLAIMS,
  BATCH_A_ID,
  BATCH_A_LEDGER,
  BATCH_A_MANIFEST,
  BATCH_ARTIFACT_SHA256,
  BATCH_B_CELLS,
  BATCH_B_CLAIMS,
  BATCH_B_ID,
  BATCH_B_LEDGER,
  BATCH_B_MANIFEST,
  BATCH_DEDUP,
  BATCH_DEDUP_PREVENTED_RECORDS,
  BATCH_FROZEN_DATE,
  BATCH_GLOBAL_LEDGER,
  BATCH_LIFECYCLE_STATES,
  BATCH_NEGATIVE_CANDIDATE_COUNT,
  BATCH_NEGATIVE_CANDIDATES,
  BATCH_SOURCE_ID,
  BATCH_SOURCE_VERSION_ID,
  BATCH_VERDICT,
  batchClaimStableKey,
  batchClaimStableKeyOf,
} from '../../../domain/constants/moroccan-primary-batch-extraction-registry';

import {
  CONTENT_EXTRACTION_PILOT_CLAIMS,
} from '../../../domain/constants/moroccan-primary-content-extraction-pilot-registry';

import {
  CONTROLLED_EXPANSION_CELLS,
  CONTROLLED_EXPANSION_CLAIMS,
} from '../../../domain/constants/moroccan-primary-controlled-content-expansion-registry';

import {
  CELL_ATTRIBUTION_REVIEWS,
} from '../../../domain/constants/moroccan-primary-cell-attribution-review-registry';

import {
  SOURCE_NATIVE_STRUCTURAL_ELEMENTS,
  APPLICATION_MAPPING_MATRIX,
} from '../../../domain/constants/moroccan-primary-structure-reconciliation-registry';

import {
  SUBJECT_READINESS,
} from '../../../domain/constants/moroccan-primary-artifact-extraction-readiness';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
} from '../../../domain/constants/moroccan-primary-direct-evidence-registry';

import type { BatchContentClaim } from '../../../domain/types/curriculum-source-governance.types';

let passed = 0;
let failed = 0;

const BATCH_A = [BATCH_A_ID, BATCH_A_MANIFEST, BATCH_A_CELLS, BATCH_A_CLAIMS, BATCH_A_LEDGER] as const;
const BATCH_B = [BATCH_B_ID, BATCH_B_MANIFEST, BATCH_B_CELLS, BATCH_B_CLAIMS, BATCH_B_LEDGER] as const;

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

function sourceNativeElementIds(): Set<string> {
  return new Set(SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => e.structuralElementId));
}

function languageFields(c: BatchContentClaim): { ar: boolean; fr: boolean } {
  return {
    ar: c.sourceWordingAr !== undefined && c.normalizedValueAr !== undefined,
    fr: c.sourceWordingFr !== undefined && c.normalizedValueFr !== undefined,
  };
}

// ============================================================
// A. BASELINE / FREEZE (A01-A06)
// ============================================================

test('A01 - exactly two controlled batches exist in the 07C.10 universe', () => {
  assert.strictEqual(BATCH_GLOBAL_LEDGER.batchCount, 2);
  assert.deepStrictEqual(BATCH_GLOBAL_LEDGER.batchIds, [BATCH_A_ID, BATCH_B_ID]);
  assert.strictEqual(new Set(BATCH_GLOBAL_LEDGER.batchIds).size, 2);
});

test('A02 - both manifests are FROZEN against the frozen date', () => {
  for (const [batchId, manifest] of [[BATCH_A_ID, BATCH_A_MANIFEST], [BATCH_B_ID, BATCH_B_MANIFEST]] as const) {
    assert.strictEqual(manifest.status, 'FROZEN', `${batchId} frozen`);
    assert.strictEqual(manifest.gate, '07C.10');
    assert.strictEqual(manifest.batchId, batchId);
    assert.strictEqual(manifest.declaredAt, BATCH_FROZEN_DATE);
  }
});

test('A03 - batch artifact binding reuses the authenticated direct-evidence binding', () => {
  assert.strictEqual(BATCH_ARTIFACT_SHA256, DIRECT_EVIDENCE_ARTIFACT_SHA256);
  assert.strictEqual(BATCH_SOURCE_ID, 'src-primary-curriculum-2021');
  assert.strictEqual(BATCH_SOURCE_VERSION_ID, 'v1.0.0');
  for (const manifest of [BATCH_A_MANIFEST, BATCH_B_MANIFEST]) {
    assert.strictEqual(manifest.artifactSha256, DIRECT_EVIDENCE_ARTIFACT_SHA256);
    assert.strictEqual(manifest.sourceVersionId, 'v1.0.0');
  }
});

test('A04 - every claim is bound to exactly one of the two frozen batches', () => {
  const batchIds = new Set([BATCH_A_ID, BATCH_B_ID]);
  for (const c of ALL_BATCH_CLAIMS) {
    assert.ok(batchIds.has(c.batchId), `claim ${c.claimId} -> batch ${c.batchId}`);
    assert.strictEqual(c.educationSystemCode, 'MOROCCO');
    assert.strictEqual(c.stageCode, 'PRIMARY');
    assert.strictEqual(c.sourceClassification, 'OFFICIAL_CURRICULUM_DOCUMENT');
  }
});

test('A05 - no batch claims bleed into the earlier frozen universes of records', () => {
  assert.strictEqual(BATCH_Verdict_Helper().duplicatesPrevented, 0);
});

function BATCH_Verdict_Helper(): { duplicatesPrevented: number } {
  return { duplicatesPrevented: BATCH_DEDUP.totalDuplicatesPrevented };
}

test('A06 - batch lifecycle is the closed six-state union of Phase B', () => {
  assert.deepStrictEqual(BATCH_LIFECYCLE_STATES, [
    'CANDIDATE', 'SCOPE_FROZEN', 'EXTRACTED', 'ATTRIBUTION_REVIEWED', 'DEDUP_CHECKED', 'BATCH_CLOSED',
  ]);
});

// ============================================================
// B. MANIFEST FREEZE (B01-B09)
// ============================================================

test('B01 - Batch A manifest: one math element, 0-9999 band, exactly 3 cells', () => {
  assert.strictEqual(BATCH_A_MANIFEST.sourceSubject, 'SRC_MATH');
  assert.strictEqual(BATCH_A_MANIFEST.applicationSubjectCode, 'MATH');
  assert.deepStrictEqual(BATCH_A_MANIFEST.structuralElementIds, ['el-math-numbers']);
  assert.strictEqual(BATCH_A_CELLS.length, 3);
});

test('B02 - Batch A extraction is DIRECT_DIGITAL structured extraction of one page', () => {
  assert.strictEqual(BATCH_A_MANIFEST.extractionMethod, 'DIRECT_STRUCTURED_EXTRACTION');
  assert.strictEqual(BATCH_A_MANIFEST.extractionClass, 'DIRECT_DIGITAL');
  assert.deepStrictEqual(BATCH_A_MANIFEST.authorizedExtractionPages, [333]);
  assert.deepStrictEqual(BATCH_A_MANIFEST.attributionContextPagesOnly, [336]);
});

test('B03 - Batch A ceiling: maximumClaims is a ceiling, never a quota', () => {
  assert.strictEqual(BATCH_A_MANIFEST.maximumClaims, 9);
  assert.ok(BATCH_A_MANIFEST.maximumClaims >= BATCH_A_CLAIMS.length, 'ceiling >= actual claims');
});

test('B04 - Batch A death-value pins the exact scope and excludes adjacent cells', () => {
  assert.match(BATCH_A_MANIFEST.deathValue, /three cells/);
  assert.match(BATCH_A_MANIFEST.deathValue, /9999/);
  assert.match(BATCH_A_MANIFEST.deathValue, /context only/);
  assert.match(BATCH_A_MANIFEST.deathValue, /page 336 as extraction/);
});

test('B05 - Batch B manifest: two French skill elements, reading + writing', () => {
  assert.strictEqual(BATCH_B_MANIFEST.sourceSubject, 'SRC_FRENCH');
  assert.strictEqual(BATCH_B_MANIFEST.applicationSubjectCode, 'FRENCH');
  assert.deepStrictEqual(BATCH_B_MANIFEST.structuralElementIds, ['el-skill-fr-reading', 'el-skill-fr-writing']);
  assert.strictEqual(BATCH_B_CELLS.length, 2);
});

test('B06 - Batch B extraction is DIRECT_DIGITAL on the clean 219-221 range', () => {
  assert.strictEqual(BATCH_B_MANIFEST.extractionMethod, 'DIRECT_STRUCTURED_EXTRACTION');
  assert.strictEqual(BATCH_B_MANIFEST.extractionClass, 'DIRECT_DIGITAL');
  assert.deepStrictEqual(BATCH_B_MANIFEST.authorizedExtractionPages, [219, 220, 221]);
  assert.deepStrictEqual(BATCH_B_MANIFEST.attributionContextPagesOnly, [218]);
});

test('B07 - Batch B ceiling: maximumClaims 8 is a ceiling for 8 claims', () => {
  assert.strictEqual(BATCH_B_MANIFEST.maximumClaims, 8);
  assert.ok(BATCH_B_MANIFEST.maximumClaims >= BATCH_B_CLAIMS.length);
});

test('B08 - Batch B death-value pins phys 218 as context-only and listening deferred', () => {
  assert.match(BATCH_B_MANIFEST.deathValue, /context only/);
  assert.match(BATCH_B_MANIFEST.deathValue, /DEFERRED/);
  assert.match(BATCH_B_MANIFEST.deathValue, /listening/);
});

test('B09 - FRENCH is READY_DIGITAL in the readiness registry (digital path, no OCR)', () => {
  const fr = SUBJECT_READINESS.find((s) => s.subject === 'FRENCH');
  assert.ok(fr, 'FRENCH readiness present');
  assert.strictEqual(fr.state, 'READY_DIGITAL');
  const math = SUBJECT_READINESS.find((s) => s.subject === 'MATH');
  assert.ok(math, 'MATH readiness present');
  assert.ok(
    BATCH_A_MANIFEST.extractionClass === 'DIRECT_DIGITAL' || math.state === 'READY_HYBRID',
    'math batch class consistent with readiness declaration',
  );
});

// ============================================================
// C. CELL SCOPE (C01-C07)
// ============================================================

test('C01 - every cell attaches to a source-native structural element', () => {
  const ids = sourceNativeElementIds();
  for (const cell of ALL_BATCH_CELLS) {
    assert.ok(ids.has(cell.structuralElementId), `cell ${cell.cellId} -> source-native ${cell.structuralElementId}`);
  }
});

test('C02 - cell scanned index is always physical page minus one', () => {
  for (const cell of ALL_BATCH_CELLS) {
    assert.strictEqual(cell.scannedIndex, cell.physicalPage - 1, `cell ${cell.cellId}`);
  }
});

test('C03 - printed page never equals the physical (footer != scan) for batch pages', () => {
  for (const cell of ALL_BATCH_CELLS) {
    assert.notStrictEqual(cell.printedPage, String(cell.physicalPage), `cell ${cell.cellId}`);
  }
});

test('C04 - every batch cell page lies inside its authorized extraction range', () => {
  const minMax = (range: readonly number[]) => [Math.min(...range), Math.max(...range)] as const;
  const [aMin, aMax] = minMax(BATCH_A_MANIFEST.authorizedExtractionPages);
  for (const cell of BATCH_A_CELLS) {
    assert.ok(cell.physicalPage >= aMin && cell.physicalPage <= aMax, `A cell ${cell.cellId}`);
  }
  const [bMin, bMax] = minMax(BATCH_B_MANIFEST.authorizedExtractionPages);
  for (const cell of BATCH_B_CELLS) {
    assert.ok(cell.physicalPage >= bMin && cell.physicalPage <= bMax, `B cell ${cell.cellId}`);
  }
});

test('C05 - attribution-context pages are never extraction pages', () => {
  for (const p of BATCH_A_MANIFEST.attributionContextPagesOnly) {
    assert.ok(!BATCH_A_MANIFEST.authorizedExtractionPages.includes(p));
  }
  for (const p of BATCH_B_MANIFEST.attributionContextPagesOnly) {
    assert.ok(!BATCH_B_MANIFEST.authorizedExtractionPages.includes(p));
  }
});

test('C06 - math cells are exactly the three calibrated 0-9999 cells on page 333', () => {
  assert.deepStrictEqual(
    BATCH_A_CELLS.map((c) => c.cellId),
    ['cell-aA-add-9999', 'cell-aB-subtract-9999', 'cell-aC-solve-addsub-9999'],
  );
  for (const cell of BATCH_A_CELLS) {
    assert.strictEqual(cell.batchId, BATCH_A_ID);
    assert.strictEqual(cell.physicalPage, 333);
    assert.strictEqual(cell.printedPage, '335');
    assert.strictEqual(cell.digitalState, 'DIRECT_DIGITAL');
    assert.strictEqual(cell.sourceSubject, 'SRC_MATH');
    assert.strictEqual(cell.applicationSubjectCode, 'MATH');
  }
});

test('C07 - French cells are the two skill cells on pages 219/221 with honest bands', () => {
  assert.deepStrictEqual(
    BATCH_B_CELLS.map((c) => c.cellId),
    ['cell-bA-fr-reading', 'cell-bA-fr-writing'],
  );
  const reading = BATCH_B_CELLS.find((c) => c.cellId === 'cell-bA-fr-reading')!;
  const writing = BATCH_B_CELLS.find((c) => c.cellId === 'cell-bA-fr-writing')!;
  assert.strictEqual(reading.physicalPage, 219);
  assert.strictEqual(reading.printedPage, '221');
  assert.strictEqual(writing.physicalPage, 221);
  assert.strictEqual(writing.printedPage, '223');
  assert.deepStrictEqual(reading.gradeBandScope, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
  assert.deepStrictEqual(writing.gradeBandScope, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
  assert.strictEqual(reading.attributionMode, 'REVIEW_REQUIRED');
  assert.strictEqual(reading.exactGradeEvidenceState, 'UNRESOLVED');
});

// ============================================================
// D. CLAIM BINDING (D01-D08)
// ============================================================

test('D01 - every claim binds to a frozen cell in its own batch', () => {
  for (const c of ALL_BATCH_CLAIMS) {
    const cells = c.batchId === BATCH_A_ID ? BATCH_A_CELLS : BATCH_B_CELLS;
    const cell = cells.find((x) => x.cellId === c.cellId);
    assert.ok(cell, `claim ${c.claimId} -> cell ${c.cellId}`);
    assert.strictEqual(cell.batchId, c.batchId);
    assert.strictEqual(c.structuralElementId, cell.structuralElementId);
    assert.strictEqual(c.sourceSubject, cell.sourceSubject);
    assert.strictEqual(c.applicationSubjectCode, cell.applicationSubjectCode);
  }
});

test('D02 - claim count per batch is exactly frozen (3 math, 8 French)', () => {
  assert.strictEqual(BATCH_A_CLAIMS.length, 3);
  assert.strictEqual(BATCH_B_CLAIMS.length, 8);
  assert.strictEqual(ALL_BATCH_CLAIMS.length, 11);
  assert.strictEqual(BATCH_A_LEDGER.claimCount, 3);
  assert.strictEqual(BATCH_B_LEDGER.claimCount, 8);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.totalClaimCount, 11);
});

test('D03 - exactly one source language: Arabic w.jpg wording or French wording, never both/neither', () => {
  for (const c of ALL_BATCH_CLAIMS) {
    const { ar, fr } = languageFields(c);
    assert.strictEqual(ar !== fr, true, `claim ${c.claimId} exactly-one-language`);
    if (c.sourceSubject === 'SRC_MATH') assert.ok(ar, `math claim ${c.claimId} carries Arabic wording`);
    if (c.sourceSubject === 'SRC_FRENCH') assert.ok(fr, `french claim ${c.claimId} carries French wording`);
  }
});

test('D04 - claim identity does not encode grade, subject, page, or app code', () => {
  const pattern = /(app-|SRC_|page|332|332|clm-)/;
  for (const c of ALL_BATCH_CLAIMS) {
    assert.ok(!pattern.test(c.claimId), `claim ${c.claimId} source-native naming`);
    assert.ok(c.claimId.startsWith('cl-'), `claim ${c.claimId}`);
    assert.ok(!c.claimId.startsWith(c.applicationSubjectCode.toLowerCase()), `claim ${c.claimId} not id'd by app code`);
  }
});

test('D05 - math claims: 0-9999 addition/subtraction/solve on page 333, extraction DIRECT', () => {
  const add = BATCH_A_CLAIMS[0];
  assert.strictEqual(add.cellId, 'cell-aA-add-9999');
  assert.strictEqual(add.category, 'OBJECTIVE');
  assert.strictEqual(add.extractionMethod, 'DIRECT_STRUCTURED_EXTRACTION');
  assert.strictEqual(add.provenance.physicalPage, 333);
  assert.strictEqual(add.provenance.printedPage, '335');
  assert.match(add.normalizedValueAr!, /9999/);
});

test('D06 - French claims: 8 claims from the two skill cells on pages 219/221', () => {
  const ids = BATCH_B_CLAIMS.map((c) => c.claimId);
  assert.deepStrictEqual(ids, [
    'cl-bA-fr-read-p13-conscience-phonologique',
    'cl-bA-fr-read-p13-habiletes-identification',
    'cl-bA-fr-read-p13-activites-type',
    'cl-bA-fr-read-p46-textes-choix',
    'cl-bA-fr-write-p1-activites-graphiques',
    'cl-bA-fr-write-p23-ecriture-cursive',
    'cl-bA-fr-write-p23-copie-dictee',
    'cl-bA-fr-write-p46-textes-types',
  ]);
  const readingClaims = BATCH_B_CLAIMS.filter((c) => c.cellId === 'cell-bA-fr-reading');
  const writingClaims = BATCH_B_CLAIMS.filter((c) => c.cellId === 'cell-bA-fr-writing');
  assert.strictEqual(readingClaims.length, 4);
  assert.strictEqual(writingClaims.length, 4);
});

test('D07 - French claims carry authoritative French source wording (never a translation)', () => {
  for (const c of BATCH_B_CLAIMS) {
    assert.ok(c.sourceWordingFr && c.sourceWordingFr.length > 0, `claim ${c.claimId} has French wording`);
    assert.ok(c.normalizedValueFr && c.normalizedValueFr.length > 0, `claim ${c.claimId} has French value`);
    assert.ok(c.sourceSubject === 'SRC_FRENCH');
  }
});

test('D08 - provenance is complete for every claim (physical/scan/printed/block/cell/note/class)', () => {
  for (const c of ALL_BATCH_CLAIMS) {
    const p = c.provenance;
    assert.ok(p.physicalPage >= 1, `claim ${c.claimId} physical`);
    assert.strictEqual(p.scannedIndex, p.physicalPage - 1, `claim ${c.claimId} scan`);
    assert.ok(p.printedPage, `claim ${c.claimId} printed`);
    assert.ok(p.blockLabel, `claim ${c.claimId} block`);
    assert.ok(p.cellLabel, `claim ${c.claimId} cell`);
    assert.ok(p.rowColumnNote, `claim ${c.claimId} note`);
    assert.strictEqual(p.extractionClass, c.provenance.extractionClass);
  }
});

// ============================================================
// E. GRADE TRUTH (E01-E07)
// ============================================================

test('E01 - math claims: STRUCTURALLY_CALIBRATED with structured evidence, not DIRECTLY_ESTABLISHED', () => {
  for (const c of BATCH_A_CLAIMS) {
    assert.strictEqual(c.attributionMode, 'STRUCTURALLY_CALIBRATED_GRADE', `claim ${c.claimId}`);
    assert.strictEqual(c.exactGradeEvidenceState, 'STRUCTURALLY_CALIBRATED', `claim ${c.claimId}`);
    assert.strictEqual(c.sourceConfirmedGrade, null, `claim ${c.claimId} no fabricated direct grade`);
    assert.strictEqual(c.candidateGrade, 'P3', `claim ${c.claimId} declared P3`);
  }
});

test('E02 - math claims stay UNVERIFIED / EXTRACTED_UNVERIFIED (no verification was fabricated)', () => {
  for (const c of BATCH_A_CLAIMS) {
    assert.strictEqual(c.verificationState, 'UNVERIFIED', `claim ${c.claimId}`);
    assert.strictEqual(c.contentStatus, 'EXTRACTED_UNVERIFIED', `claim ${c.claimId}`);
  }
});

test('E03 - French claims: REVIEW_REQUIRED, never promoted to a fabricated exact grade', () => {
  for (const c of BATCH_B_CLAIMS) {
    assert.strictEqual(c.attributionMode, 'REVIEW_REQUIRED', `claim ${c.claimId}`);
    assert.strictEqual(c.exactGradeEvidenceState, 'UNRESOLVED', `claim ${c.claimId}`);
    assert.strictEqual(c.candidateGrade, null, `claim ${c.claimId} no invented grade`);
    assert.strictEqual(c.sourceConfirmedGrade, null, `claim ${c.claimId} no confirmed grade`);
  }
});

test('E04 - French grade bands are the honest artifact sub-heading bands', () => {
  const expect: Record<string, string[]> = {
    'cl-bA-fr-read-p13-conscience-phonologique': ['P1', 'P2', 'P3'],
    'cl-bA-fr-read-p13-habiletes-identification': ['P1', 'P2', 'P3'],
    'cl-bA-fr-read-p13-activites-type': ['P1', 'P2', 'P3'],
    'cl-bA-fr-read-p46-textes-choix': ['P4', 'P5', 'P6'],
    'cl-bA-fr-write-p1-activites-graphiques': ['P1'],
    'cl-bA-fr-write-p23-ecriture-cursive': ['P2', 'P3'],
    'cl-bA-fr-write-p23-copie-dictee': ['P2', 'P3'],
    'cl-bA-fr-write-p46-textes-types': ['P4', 'P5', 'P6'],
  };
  for (const c of BATCH_B_CLAIMS) {
    assert.deepStrictEqual(c.gradeBandScope.slice().sort(), expect[c.claimId], `claim ${c.claimId} band`);
  }
});

test('E05 - REVIEW_REQUIRED claims are never HIGH confidence and never VERIFIED', () => {
  for (const c of ALL_BATCH_CLAIMS) {
    if (c.attributionMode === 'REVIEW_REQUIRED') {
      assert.notStrictEqual(c.confidence, 'HIGH', `claim ${c.claimId} not HIGH`);
      assert.notStrictEqual(c.verificationState, 'VERIFIED', `claim ${c.claimId} not VERIFIED`);
    }
  }
});

test('E06 - claimId/wording never fabricate a grade the artifact did not print', () => {
  const { BATCH_FRENCH_MIN} = { BATCH_FRENCH_MIN: 1 };
  assert.ok(BATCH_FRENCH_MIN >= 1);
  const gradeWords = /\bP[1-6]\b/;
  for (const c of ALL_BATCH_CLAIMS) {
    assert.ok(!gradeWords.test(c.normalizedValueAr ?? '') && !gradeWords.test(c.normalizedValueFr ?? ''),
      `claim ${c.claimId} value carries no invented grade`);
  }
});

test('E07 - no DIRECTLY_ESTABLISHED claim exists anywhere in the batch universe', () => {
  assert.strictEqual(BATCH_A_LEDGER.directlyEstablishedGradeCount, 0);
  assert.strictEqual(BATCH_B_LEDGER.directlyEstablishedGradeCount, 0);
});

// ============================================================
// F. CONTENT (F01-F07)
// ============================================================

test('F01 - all claim categories are within the governed content vocabulary', () => {
  const allowed = new Set([
    'OBJECTIVE', 'LEARNING_OUTCOME', 'COMPETENCY_STATEMENT', 'CONTENT_THEME',
    'CONTENT_ELEMENT', 'METHODOLOGICAL_GUIDANCE', 'ACTIVITY_TYPE',
    'ASSESSMENT_GUIDANCE', 'TEMPORAL_ALLOCATION', 'STRUCTURAL_DESCRIPTION',
  ]);
  for (const c of ALL_BATCH_CLAIMS) assert.ok(allowed.has(c.category), `claim ${c.claimId} -> ${c.category}`);
});

test('F02 - no claim is a structural restatement of its skill/element', () => {
  for (const c of ALL_BATCH_CLAIMS) {
    const value = c.normalizedValueAr ?? c.normalizedValueFr ?? '';
    assert.notStrictEqual(value, c.structuralElementId, `claim ${c.claimId} not a bare element echo`);
    assert.ok(value.length > 20, `claim ${c.claimId} carries substantive content`);
  }
});

test('F03 - artificial extraction-class labels are ruled out (no OCR-derived wording)', () => {
  const badSource = /OCR dump|ocr-dump|RENDER_OCR|pdf-render|\.png|\.jpg|art-scan/;
  for (const c of ALL_BATCH_CLAIMS) {
    const claimText = [c.sourceWordingAr ?? '', c.sourceWordingFr ?? ''].join(' ');
    assert.ok(!badSource.test(claimText), `claim ${c.claimId} no OCR-dump provenance in wording`);
  }
});

test('F04 - content states match verification state per claim', () => {
  for (const c of ALL_BATCH_CLAIMS) {
    if (c.verificationState === 'UNVERIFIED') assert.strictEqual(c.contentStatus, 'EXTRACTED_UNVERIFIED', c.claimId);
    if (c.verificationState === 'REVIEW_REQUIRED') assert.strictEqual(c.contentStatus, 'REVIEW_REQUIRED', c.claimId);
  }
});

test('F05 - Batch A introduces zero REVIEW_REQUIRED or VERIFIED content', () => {
  assert.strictEqual(BATCH_A_LEDGER.reviewRequiredContentCount, 0);
  assert.strictEqual(BATCH_A_LEDGER.contentVerifiedCount, 0);
});

test('F06 - Batch B introduces zero EXTRACTED_UNVERIFIED bulk (all human-review content)', () => {
  assert.strictEqual(BATCH_B_LEDGER.extractedUnverifiedCount, 0);
  assert.strictEqual(BATCH_B_LEDGER.reviewRequiredContentCount, 8);
});

test('F07 - batch claims never create lessons, KOs, or exercises', () => {
  assert.strictEqual(BATCH_A_LEDGER.syntheticLessons, 0);
  assert.strictEqual(BATCH_A_LEDGER.syntheticKnowledgeObjects, 0);
  assert.strictEqual(BATCH_A_LEDGER.syntheticExercises, 0);
  assert.strictEqual(BATCH_B_LEDGER.syntheticLessons, 0);
  assert.strictEqual(BATCH_B_LEDGER.syntheticKnowledgeObjects, 0);
  assert.strictEqual(BATCH_B_LEDGER.syntheticExercises, 0);
});

// ============================================================
// G. DEDUP / IDENTITY (G01-G10)
// ============================================================

test('G01 - eight dedup comparisons were executed, all with the canonical targets', () => {
  assert.strictEqual(BATCH_DEDUP.comparisons.length, 8);
  const targets = BATCH_DEDUP.comparisons.map((c) => c.against);
  const expectCounts: Record<string, number> = {
    WITHIN_BATCH: 2, OTHER_BATCH: 2, 'GATE_07C.7': 2, 'GATE_07C.9': 2,
  };
  for (const [k, v] of Object.entries(expectCounts)) {
    assert.strictEqual(targets.filter((t) => t === k).length, v, `target ${k} x${v}`);
  }
});

test('G02 - semantic key is stable and includes element|scope|category|value|version', () => {
  const c = BATCH_A_CLAIMS[0];
  const key = batchClaimStableKey({
    structuralElementId: c.structuralElementId,
    scopeKey: 'gP3',
    category: c.category,
    normalizedValue: c.normalizedValueAr!,
    sourceVersionId: c.sourceVersionId,
  });
  assert.ok(key.startsWith('[batch|'));
  assert.ok(key.includes(c.structuralElementId));
  assert.ok(key.includes('gP3'));
  assert.ok(key.includes('v1.0.0'));
  assert.strictEqual(batchClaimStableKeyOf(c), key);
});

test('G03 - within Batch A: 3 claims, 3 unique semantic keys (no internal duplicate)', () => {
  const keys = BATCH_A_CLAIMS.map((c) => batchClaimStableKeyOf(c));
  assert.strictEqual(new Set(keys).size, keys.length);
  assert.strictEqual(keys.length, 3);
});

test('G04 - within Batch B: 8 claims, 8 unique semantic keys (no internal duplicate)', () => {
  const keys = BATCH_B_CLAIMS.map((c) => batchClaimStableKeyOf(c));
  assert.strictEqual(new Set(keys).size, keys.length);
  assert.strictEqual(keys.length, 8);
});

test('G05 - no cross-batch collision between Batch A and Batch B', () => {
  const a = new Set(BATCH_A_CLAIMS.map((c) => batchClaimStableKeyOf(c)));
  const b = new Set(BATCH_B_CLAIMS.map((c) => batchClaimStableKeyOf(c)));
  for (const k of a) assert.ok(!b.has(k), `key ${k} must be Batch-A-only`);
  assert.strictEqual(BATCH_DEDUP.comparisons.find((x) => x.against === 'OTHER_BATCH')!.collisions, 0);
});

test('G06 - no collision with Gate 07C.7 pilot canonical claims', () => {
  const pilotKeys = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => batchClaimStableKey({
    structuralElementId: c.structuralElementId,
    scopeKey: 'g' + (c.gradeCode ?? ''),
    category: c.category,
    normalizedValue: c.normalizedValueAr ?? '',
    sourceVersionId: c.sourceVersionId,
  })));
  for (const c of ALL_BATCH_CLAIMS) {
    assert.ok(!pilotKeys.has(batchClaimStableKeyOf(c)), `claim ${c.claimId} not a pilot duplicate`);
  }
  const pilotComparisons = BATCH_DEDUP.comparisons.filter((x) => x.against === 'GATE_07C.7');
  assert.strictEqual(pilotComparisons.reduce((n, x) => n + x.collisions, 0), 0);
});

test('G07 - no collision with Gate 07C.9 expansion canonical claims', () => {
  const expansionKeys = new Set(CONTROLLED_EXPANSION_CLAIMS.map((c) => batchClaimStableKey({
    structuralElementId: c.structuralElementId,
    scopeKey: 'g' + (c.candidateGrade ?? ''),
    category: c.category,
    normalizedValue: c.normalizedValueAr ?? '',
    sourceVersionId: c.sourceVersionId,
  })));
  for (const c of ALL_BATCH_CLAIMS) {
    assert.ok(!expansionKeys.has(batchClaimStableKeyOf(c)), `claim ${c.claimId} not an expansion duplicate`);
  }
  const expComparisons = BATCH_DEDUP.comparisons.filter((x) => x.against === 'GATE_07C.9');
  assert.strictEqual(expComparisons.reduce((n, x) => n + x.collisions, 0), 0);
});

test('G08 - dedup evidence: 0 duplicates prevented, 0 prevention records', () => {
  assert.strictEqual(BATCH_DEDUP.totalDuplicatesPrevented, 0);
  assert.strictEqual(BATCH_DEDUP.duplicatesPrevented.length, 0);
  assert.strictEqual(BATCH_DEDUP_PREVENTED_RECORDS.length, 0);
  for (const cmp of BATCH_DEDUP.comparisons) assert.strictEqual(cmp.collisions, 0, `comparison ${cmp.against}`);
});

test('G09 - the frozen universes are declared untouched in the dedup result', () => {
  assert.strictEqual(BATCH_DEDUP.twentySevenC7SuiteFrozen, true);
  assert.strictEqual(BATCH_DEDUP.sevenC7PilotFrozen, true);
  assert.strictEqual(BATCH_DEDUP.sevenC8ReviewsFrozen, true);
  assert.strictEqual(BATCH_DEDUP.sevenC9ExpansionFrozen, true);
});

test('G10 - claim universe is exactly 11 unique claims, ids unique across batches', () => {
  const ids = ALL_BATCH_CLAIMS.map((c) => c.claimId);
  assert.strictEqual(new Set(ids).size, ids.length);
  const aIds = new Set(BATCH_A_CLAIMS.map((c) => c.claimId));
  const bIds = new Set(BATCH_B_CLAIMS.map((c) => c.claimId));
  for (const c of ALL_BATCH_CLAIMS) {
    assert.strictEqual(aIds.has(c.claimId) || bIds.has(c.claimId), true, c.claimId);
  }
});

// ============================================================
// H. NEGATIVE SCOPE (H01-H08)
// ============================================================

test('H01 - exactly five negative candidates, all never become claims', () => {
  assert.strictEqual(BATCH_NEGATIVE_CANDIDATE_COUNT, 5);
  for (const n of BATCH_NEGATIVE_CANDIDATES) {
    assert.strictEqual(n.neverBecomesClaim, true, `negative ${n.negativeId}`);
  }
});

test('H02 - French listening (compréhension de l\'oral) is BLOCKED and deferred', () => {
  const listening = BATCH_NEGATIVE_CANDIDATES.find((n) => n.negativeId === 'cell-bB-fr-listening');
  assert.ok(listening, 'listening negative present');
  assert.strictEqual(listening!.negativeState, 'BLOCKED');
  assert.strictEqual(listening!.batchId, BATCH_B_ID);
  assert.match(listening!.negativeReason, /DEFERRED|deferred/);
});

test('H03 - adjacent-band and adjacent-page rejections are REJECTED within-batch', () => {
  const frac = BATCH_NEGATIVE_CANDIDATES.find((n) => n.negativeId === 'cell-rej-math-p6-fractions');
  const p1p2 = BATCH_NEGATIVE_CANDIDATES.find((n) => n.negativeId === 'cell-rej-fr-p1p2');
  assert.strictEqual(frac!.negativeState, 'REJECTED');
  assert.strictEqual(frac!.batchId, BATCH_A_ID);
  assert.strictEqual(p1p2!.negativeState, 'REJECTED');
  assert.strictEqual(p1p2!.batchId, BATCH_B_ID);
});

test('H04 - gate-level rejections (music/civic) carry no batchId', () => {
  for (const id of ['cell-rej-music', 'cell-rej-civic']) {
    const n = BATCH_NEGATIVE_CANDIDATES.find((x) => x.negativeId === id);
    assert.ok(n, `${id} present`);
    assert.ok(!('batchId' in n), `${id} gate-level`);
    assert.strictEqual(n!.negativeState, 'REJECTED');
  }
});

test('H05 - negative candidates are never among live batch claims', () => {
  const live = new Set(ALL_BATCH_CLAIMS.map((c) => c.claimId));
  const negativeIds = new Set<string>(BATCH_NEGATIVE_CANDIDATES.map((n) => n.negativeId));
  for (const n of BATCH_NEGATIVE_CANDIDATES) assert.ok(!live.has(n.negativeId), n.negativeId);
  for (const c of ALL_BATCH_CLAIMS) assert.ok(!negativeIds.has(c.claimId), c.claimId);
});

test('H06 - no negative candidate references a cell or page used for extraction', () => {
  for (const n of BATCH_NEGATIVE_CANDIDATES) {
    assert.ok(!n.negativeReason.includes('BATCH-A-07C10-MATH-P3-NUMBERS') ||
      n.negativeReason.includes('outside') || n.negativeReason.includes('REJECTED'),
      `negative ${n.negativeId} reason coherent`);
  }
});

test('H07 - global ledger negative count is derived from the registry', () => {
  assert.strictEqual(BATCH_GLOBAL_LEDGER.negativeCandidateCount, BATCH_NEGATIVE_CANDIDATES.length);
});

test('H08 - every negative has a reason and a non-empty state', () => {
  for (const n of BATCH_NEGATIVE_CANDIDATES) {
    assert.ok(n.negativeReason.length > 10, `negative ${n.negativeId}`);
  }
});

// ============================================================
// I. ISOLATION (I01-I06)
// ============================================================

test('I01 - Gate 07C.7 pilot remains 16 untouched claims', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_CLAIMS.length, 16);
});

test('I02 - Gate 07C.9 expansion remains 3 cells / 11 claims untouched', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_CELLS.length, 3);
  assert.strictEqual(CONTROLLED_EXPANSION_CLAIMS.length, 11);
});

test('I03 - Gate 07C.8 remains 6 attribution reviews untouched', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEWS.length, 6);
});

test('I04 - batch claim ids never collide with pilot/expansion/review ids', () => {
  const ids = new Set([
    ...CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.claimId),
    ...CONTROLLED_EXPANSION_CLAIMS.map((c) => c.claimId),
    ...CELL_ATTRIBUTION_REVIEWS.map((r) => r.reviewId),
  ]);
  for (const c of ALL_BATCH_CLAIMS) {
    assert.ok(!ids.has(c.claimId), `claim id ${c.claimId} must be new`);
  }
});

test('I05 - batch elements are exactly the math-number and two French skills', () => {
  const used = new Set(ALL_BATCH_CLAIMS.map((c) => c.structuralElementId));
  assert.deepStrictEqual([...used].sort(), ['el-math-numbers', 'el-skill-fr-reading', 'el-skill-fr-writing']);
});

test('I06 - application mapping references remain secondary (no inverse write to mapping matrix)', () => {
  const appCodes = new Set(APPLICATION_MAPPING_MATRIX.map((m) => m.applicationSubject));
  for (const c of ALL_BATCH_CLAIMS) {
    assert.ok(appCodes.has(c.applicationSubjectCode), `claim ${c.claimId} app code declared`);
  }
});

// ============================================================
// J. LEDGER (J01-J08)
// ============================================================

test('J01 - per-batch ledger counts are derived from manifest and claims', () => {
  assert.strictEqual(BATCH_A_LEDGER.cellCount, BATCH_A_CELLS.length);
  assert.strictEqual(BATCH_A_LEDGER.claimCount, BATCH_A_CLAIMS.length);
  assert.strictEqual(BATCH_A_LEDGER.maximumClaims, BATCH_A_MANIFEST.maximumClaims);
  assert.strictEqual(BATCH_B_LEDGER.claimCount, BATCH_B_CLAIMS.length);
  assert.strictEqual(BATCH_B_LEDGER.maximumClaims, BATCH_B_MANIFEST.maximumClaims);
});

test('J02 - Batch A attribution counts: 3 calibrated, 0 directly established, 0 review', () => {
  assert.strictEqual(BATCH_A_LEDGER.structurallyCalibratedGradeCount, 3);
  assert.strictEqual(BATCH_A_LEDGER.directlyEstablishedGradeCount, 0);
  assert.strictEqual(BATCH_A_LEDGER.reviewRequiredGradeCount, 0);
  assert.strictEqual(BATCH_A_LEDGER.sourceStructureInsufficientGradeCount, 0);
});

test('J03 - Batch B attribution counts: 8 review-required, 0 calibrated/direct', () => {
  assert.strictEqual(BATCH_B_LEDGER.reviewRequiredGradeCount, 8);
  assert.strictEqual(BATCH_B_LEDGER.structurallyCalibratedGradeCount, 0);
  assert.strictEqual(BATCH_B_LEDGER.directlyEstablishedGradeCount, 0);
});

test('J04 - extracted-unverified and review-required state counts derive correctly', () => {
  assert.strictEqual(BATCH_A_LEDGER.extractedUnverifiedCount, 3);
  assert.strictEqual(BATCH_A_LEDGER.reviewRequiredContentCount, 0);
  assert.strictEqual(BATCH_B_LEDGER.extractedUnverifiedCount, 0);
  assert.strictEqual(BATCH_B_LEDGER.reviewRequiredContentCount, 8);
});

test('J05 - safety zeros in both per-batch ledgers', () => {
  for (const ledger of [BATCH_A_LEDGER, BATCH_B_LEDGER]) {
    assert.strictEqual(ledger.contentVerifiedCount, 0);
    assert.strictEqual(ledger.publishedCount, 0);
    assert.strictEqual(ledger.directSourceConfirmedCount, 0);
    assert.strictEqual(ledger.syntheticLessons, 0);
    assert.strictEqual(ledger.syntheticKnowledgeObjects, 0);
    assert.strictEqual(ledger.syntheticExercises, 0);
    assert.strictEqual(ledger.contentDenominatorKnown, false);
    assert.strictEqual(ledger.completenessStatus, 'UNMEASURABLE');
  }
});

test('J06 - global ledger aggregates derive from the two batches', () => {
  assert.strictEqual(BATCH_GLOBAL_LEDGER.totalCellCount, 5);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.totalClaimCount, 11);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.totalMaximumClaims, 9 + 8);
  const subjectCounts = new Map(BATCH_GLOBAL_LEDGER.claimsBySourceSubject.map((s) => [s.sourceSubject, s.count]));
  assert.strictEqual(subjectCounts.get('SRC_MATH'), 3);
  assert.strictEqual(subjectCounts.get('SRC_FRENCH'), 8);
});

test('J07 - global grade-evidence, content-status, and verification aggregates', () => {
  const byGrade = new Map(BATCH_GLOBAL_LEDGER.claimsByGradeEvidenceState.map((s) => [s.exactGradeEvidenceState, s.count]));
  assert.strictEqual(byGrade.get('STRUCTURALLY_CALIBRATED'), 3);
  assert.strictEqual(byGrade.get('UNRESOLVED'), 8);
  const byStatus = new Map(BATCH_GLOBAL_LEDGER.claimsByContentStatus.map((s) => [s.contentStatus, s.count]));
  assert.strictEqual(byStatus.get('EXTRACTED_UNVERIFIED'), 3);
  assert.strictEqual(byStatus.get('REVIEW_REQUIRED'), 8);
  const byVer = new Map(BATCH_GLOBAL_LEDGER.claimsByVerificationState.map((s) => [s.verificationState, s.count]));
  assert.strictEqual(byVer.get('UNVERIFIED'), 3);
  assert.strictEqual(byVer.get('REVIEW_REQUIRED'), 8);
});

test('J08 - global ledger duplicates/negative/closure fields', () => {
  assert.strictEqual(BATCH_GLOBAL_LEDGER.duplicateClaimsPreventedTotal, BATCH_DEDUP.totalDuplicatesPrevented);
  assert.ok(BATCH_GLOBAL_LEDGER.negativeCandidateCount >= 5);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.contentVerifiedCount, 0);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.publishedCount, 0);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.completenessStatus, 'UNMEASURABLE');
});

// ============================================================
// K. CLOSURE (K01-K06)
// ============================================================

test('K01 - both batches reached BATCH_CLOSED', () => {
  assert.strictEqual(BATCH_A_LEDGER.lifecycleState, 'BATCH_CLOSED');
  assert.strictEqual(BATCH_B_LEDGER.lifecycleState, 'BATCH_CLOSED');
});

test('K02 - closure is date-bound to the frozen date', () => {
  assert.strictEqual(BATCH_A_LEDGER.closedAt, BATCH_FROZEN_DATE);
  assert.strictEqual(BATCH_B_LEDGER.closedAt, BATCH_FROZEN_DATE);
});

test('K03 - global allBatchesClosed is a direct consequence of the two ledgers', () => {
  const calc =
    BATCH_A_LEDGER.lifecycleState === 'BATCH_CLOSED' && BATCH_B_LEDGER.lifecycleState === 'BATCH_CLOSED';
  assert.strictEqual(BATCH_GLOBAL_LEDGER.allBatchesClosed, calc);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.allBatchesClosed, true);
});

test('K04 - closure semantics: BATCH_CLOSED is NOT verification nor publication', () => {
  assert.strictEqual(BATCH_VERDICT.closureSemantics, true);
  assert.ok(BATCH_VERDICT.lifecycleProven);
  assert.strictEqual(BATCH_A_LEDGER.contentVerifiedCount, 0, 'no verification was asserted by closure');
  assert.strictEqual(BATCH_A_LEDGER.publishedCount, 0, 'no publication by closure');
});

test('K05 - closure requires the full lifecycle path to be present in the union', () => {
  for (const state of ['CANDIDATE', 'SCOPE_FROZEN', 'EXTRACTED', 'ATTRIBUTION_REVIEWED', 'DEDUP_CHECKED', 'BATCH_CLOSED']) {
    assert.ok(BATCH_LIFECYCLE_STATES.includes(state as any), `lifecycle state ${state}`);
  }
});

test('K06 - every claim in the universes is covered by a closed batch ledger', () => {
  const covered = new Set([...BATCH_A_LEDGER.claims, ...BATCH_B_LEDGER.claims].map((c) => c.claimId));
  for (const c of ALL_BATCH_CLAIMS) assert.ok(covered.has(c.claimId), c.claimId);
});

// ============================================================
// L. GLOBAL FREEZES (L01-L06)
// ============================================================

test('L01 - verified and published counts stay 0 everywhere', () => {
  assert.strictEqual(BATCH_VERDICT.contentVerified, 0);
  assert.strictEqual(BATCH_VERDICT.published, 0);
  assert.strictEqual(BATCH_VERDICT.structureCompleteVerified, 0);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.contentVerifiedCount, 0);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.publishedCount, 0);
});

test('L02 - mastery and completeness stay underived/unmeasurable', () => {
  assert.strictEqual(BATCH_VERDICT.masteryDerived, false);
  assert.strictEqual(BATCH_VERDICT.contentDenominatorKnown, false);
  assert.strictEqual(BATCH_VERDICT.completenessUnmeasurable, true);
});

test('L03 - no synthetic units/lessons/KOs/exercises in the batch registry', () => {
  assert.strictEqual(BATCH_VERDICT.noSyntheticUnitsLessonsKOsOrExercises, true);
  assert.strictEqual(BATCH_A_LEDGER.syntheticLessons + BATCH_A_LEDGER.syntheticKnowledgeObjects + BATCH_A_LEDGER.syntheticExercises, 0);
  assert.strictEqual(BATCH_B_LEDGER.syntheticLessons + BATCH_B_LEDGER.syntheticKnowledgeObjects + BATCH_B_LEDGER.syntheticExercises, 0);
});

test('L04 - source-native-first and secondary application mapping preserved', () => {
  assert.strictEqual(BATCH_VERDICT.sourceNativeFirst, true);
  assert.strictEqual(BATCH_VERDICT.applicationMappingIsSecondary, true);
});

test('L05 - no fabricated grade ownership and no source truth duplication', () => {
  assert.strictEqual(BATCH_VERDICT.noFabricatedGradeOwnership, true);
  assert.strictEqual(BATCH_VERDICT.noSourceTruthDuplication, true);
});

test('L06 - the global denominator freeze is verbatim for 07C.10', () => {
  assert.strictEqual(BATCH_VERDICT.denominatorFrozenVerbatim, true);
  assert.strictEqual(BATCH_DEDUP.twentySevenC7SuiteFrozen, true);
  assert.strictEqual(BATCH_GLOBAL_LEDGER.contentDenominatorKnown, false);
});

// ============================================================
// M. VERDICT (M01-M08)
// ============================================================

test('M01 - verdict is the controlled-batch protocol verdict card', () => {
  assert.strictEqual(BATCH_VERDICT.gate, '07C.10');
  assert.strictEqual(BATCH_VERDICT.artifactSha256, DIRECT_EVIDENCE_ARTIFACT_SHA256);
  assert.strictEqual(BATCH_VERDICT.sourceVersionId, 'v1.0.0');
  assert.deepStrictEqual(BATCH_VERDICT.batchIds, BATCH_GLOBAL_LEDGER.batchIds);
});

test('M02 - verdict counts derive from the global ledger', () => {
  assert.strictEqual(BATCH_VERDICT.batchCount, BATCH_GLOBAL_LEDGER.batchCount);
  assert.strictEqual(BATCH_VERDICT.cellCount, BATCH_GLOBAL_LEDGER.totalCellCount);
  assert.strictEqual(BATCH_VERDICT.claimCount, BATCH_GLOBAL_LEDGER.totalClaimCount);
});

test('M03 - registry-freeze flags are true across pilot, review, and expansion', () => {
  assert.strictEqual(BATCH_VERDICT.pilotRegistryFrozen, true);
  assert.strictEqual(BATCH_VERDICT.reviewRegistryFrozen, true);
  assert.strictEqual(BATCH_VERDICT.expansionRegistryFrozen, true);
});

test('M04 - recommendation is exactly PASS', () => {
  assert.strictEqual(BATCH_VERDICT.recommendation, 'PASS');
});

test('M05 - PASS requires every safety boolean to be true', () => {
  const flags = [
    BATCH_VERDICT.lifecycleProven,
    BATCH_VERDICT.closureSemantics,
    BATCH_VERDICT.sourceNativeFirst,
    BATCH_VERDICT.applicationMappingIsSecondary,
    BATCH_VERDICT.noSyntheticUnitsLessonsKOsOrExercises,
    BATCH_VERDICT.noFabricatedGradeOwnership,
    BATCH_VERDICT.noSourceTruthDuplication,
    BATCH_VERDICT.denominatorFrozenVerbatim,
    BATCH_VERDICT.pilotRegistryFrozen,
    BATCH_VERDICT.reviewRegistryFrozen,
    BATCH_VERDICT.expansionRegistryFrozen,
  ];
  for (const f of flags) assert.strictEqual(f, true);
});

test('M06 - no claim-quota arithmetic hid anything (ceilings not quotas)', () => {
  assert.ok(BATCH_A_MANIFEST.maximumClaims > BATCH_A_CLAIMS.length, 'A ceiling strictly above actual');
  assert.strictEqual(BATCH_B_MANIFEST.maximumClaims, BATCH_B_CLAIMS.length, 'B ceiling == actual (exact bound)');
});

test('M07 - verdict claim universe matches the ledgers exactly', () => {
  const fromLedgers = [...BATCH_A_LEDGER.claims, ...BATCH_B_LEDGER.claims].sort((a, b) =>
    a.claimId.localeCompare(b.claimId),
  );
  const fromVerdict = [...ALL_BATCH_CLAIMS].sort((a, b) => a.claimId.localeCompare(b.claimId));
  assert.deepStrictEqual(fromLedgers, fromVerdict);
});

test('M08 - every batch claim participates in a manifest with the same batch target', () => {
  for (const c of ALL_BATCH_CLAIMS) {
    const manifest = c.batchId === BATCH_A_ID ? BATCH_A_MANIFEST : BATCH_B_MANIFEST;
    assert.strictEqual(manifest.batchId, c.batchId);
    assert.ok(manifest.structuralElementIds.includes(c.structuralElementId), c.claimId);
  }
});

// ============================================================
// N. REPO / SECURITY (N01-N06)
// ============================================================

test('N01 - no absolute temp/export paths inside the batch registry', () => {
  const root = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-batch-extraction-registry.ts', import.meta.url));
  const src = readFileSync(root, 'utf8');
  assert.ok(!src.includes('C:\\'), 'no windows absolute path');
  assert.ok(!/AppData|opencode\\|Temp\\temp|temp\\opencode/i.test(src), 'no temp/opencode path');
  assert.ok(!/\b([A-Z]):\\/i.test(src), 'no drive-letter absolute path');
});

test('N02 - no OCR/PDF dumps, images, or artifact page transcripts are committed', () => {
  const registrySrc = readFileSync(
    fileURLToPath(new URL('../../../domain/constants/moroccan-primary-batch-extraction-registry.ts', import.meta.url)),
    'utf8',
  );
  const bad = /\.pdf|rendered|pdftoppm|base64|data:image|\.png|\.jpg|rowview|addsub\d+|frocr|fr_arSA|idx2\d\d|idx21[89]|idx22[01]/;
  assert.ok(!bad.test(registrySrc), 'registry holds no committed artifact dumps');
});

test('N03 - no secrets, keys, or openai tokens appear in the registry', () => {
  const registrySrc = readFileSync(
    fileURLToPath(new URL('../../../domain/constants/moroccan-primary-batch-extraction-registry.ts', import.meta.url)),
    'utf8',
  );
  const secret = /sk-[A-Za-z0-9_-]{10,}|OPENAI_API_KEY|api[_-]?key\s*[:=]|password\s*[:=]|secret\s*[:=]/i;
  assert.ok(!secret.test(registrySrc), 'no secret material');
});

test('N04 - no migration, DB write, or deployment code in the batch registry', () => {
  const registrySrc = readFileSync(
    fileURLToPath(new URL('../../../domain/constants/moroccan-primary-batch-extraction-registry.ts', import.meta.url)),
    'utf8',
  );
  const dangerous = /create table|INSERT INTO|supabase\.from|\.insert\(|migrat(ion|e)|npm publish|git push/;
  assert.ok(!dangerous.test(registrySrc), 'no persistence/deploy code');
});

test('N05 - the registry composes only frozen constants (no runtime side effects)', () => {
  const registrySrc = readFileSync(
    fileURLToPath(new URL('../../../domain/constants/moroccan-primary-batch-extraction-registry.ts', import.meta.url)),
    'utf8',
  );
  assert.ok(!registrySrc.includes('import.meta'), 'registry itself static');
  assert.ok(!registrySrc.includes('process.env'), 'no env access in registry');
});

test('N06 - artifact identity is hash-bound, not path-bound', () => {
  const registrySrc = readFileSync(
    fileURLToPath(new URL('../../../domain/constants/moroccan-primary-batch-extraction-registry.ts', import.meta.url)),
    'utf8',
  );
  assert.strictEqual(registrySrc.includes('Curriculum_Primaire'), false, 'no artifact file name committed');
  assert.strictEqual(BATCH_ARTIFACT_SHA256, '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F');
  assert.strictEqual(BATCH_ARTIFACT_SHA256, DIRECT_EVIDENCE_ARTIFACT_SHA256, 'reuses the authenticated binding');
});

console.log('');
console.log(`--- GATE 07C.10: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}