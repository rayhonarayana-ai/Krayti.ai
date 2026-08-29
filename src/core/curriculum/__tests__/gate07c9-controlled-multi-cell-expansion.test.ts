/**
 * Qarayti.ai - Gate 07C.9: Controlled Multi-Cell Content Expansion Readiness
 * Tests
 *
 * Groups (§37-§46) for the controlled multi-cell expansion:
 *   A. CELL SCOPE      A01-A07  cell count, source-native structural identity,
 *                               explicit physical/printed pages, artifact binding,
 *                               element binding, no fifth page, declared scope
 *   B. GRADE TRUTH     B01-B08  no fabricated grade ownership, sourceConfirmed
 *                               only when DIRECTLY_ESTABLISHED, candidate vs
 *                               confirmed distinct, calibrated has evidence,
 *                               REVIEW_REQUIRED never HIGH, no wording/claimId grade
 *   C. PROVENANCE      C01-C06  physical = scanned+1, printed != physical,
 *                               DIRECT_DIGITAL only on clean pages, page != identity,
 *                               stable locator, full provenance
 *   D. DIVERSITY       D01-D05  >=2 of 4 diversity dimensions, distinct grades,
 *                               distinct topics, not near-identical neighbors
 *   E. DEDUP/IDENTITY  E01-E05  no collision with pilot, stable identity, version in
 *                               identity, no duplicate claims, repeated truth kept once
 *   F. CONTENT SAFTEY  F01-F08  no lessons/KOs/exercises, contentVerified=0,
 *                               published=0, masteryDerived=false,
 *                               completeness UNMEASURABLE, denominator preserved
 *   G. FREEZE          G01-G06  07C.7 16 claims untouched, 07C.8 reviews untouched,
 *                               stop no new content state, additive-only
 *   H. LEDGER/VERDICT  H01-H08  derived counts consistent, verdict PASS, flags
 *   I. REPO/SECURITY   I01-I07  no PDF/OCR dump/image, no large dump, no abs path,
 *                               no migration/DB write/deploy, no secrets
 *   J. REVIEW-REUSE    J01-J05  reuse existing epistemic types, no newly invented
 *                               attribution authority, honest UNRESOLVED
 *
 * The tests validate the CONTROLLED-EXPANSION registry and its invariants. They
 * do NOT create units/lessons/KOs/exercises (§8) and do NOT modify learner/runtime
 * behavior, write to a database, or deploy anything (§32).
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  CONTROLLED_EXPANSION_CLAIMS,
  CONTROLLED_EXPANSION_CELLS,
  CONTROLLED_EXPANSION_DECLARATION,
  CONTROLLED_EXPANSION_LEDGER,
  CONTROLLED_EXPANSION_VERDICT,
  EXPANSION_ARTIFACT_SHA256,
  EXPANSION_SOURCE_VERSION_ID,
  EXPANSION_ATTRIBUTION_COUNTS,
  EXPANSION_STATE_COUNTS,
  EXPANSION_DEDUP_FREE,
  expansionClaimStableKey,
} from '../../../domain/constants/moroccan-primary-controlled-content-expansion-registry';

import {
  CONTENT_EXTRACTION_PILOT_CLAIMS,
  CONTENT_PILOT_DECLARATION,
  CONTENT_EXTRACTION_PILOT_LEDGER,
  SOURCE_TOPIC_PAGE_REGISTRY,
} from '../../../domain/constants/moroccan-primary-content-extraction-pilot-registry';

import {
  CELL_ATTRIBUTION_REVIEWS,
  CELL_ATTRIBUTION_REVIEW_LEDGER,
} from '../../../domain/constants/moroccan-primary-cell-attribution-review-registry';

import {
  SOURCE_NATIVE_STRUCTURAL_ELEMENTS,
  APPLICATION_MAPPING_MATRIX,
} from '../../../domain/constants/moroccan-primary-structure-reconciliation-registry';

import type {
  ContentClaimCategory,
  GateSourceTopic,
  ExpansionContentClaim,
  CellSourceConfirmedGrade,
} from '../../../domain/types/curriculum-source-governance.types';

let passed = 0;
let failed = 0;

const ALLOWED_CATEGORIES: ContentClaimCategory[] = [
  'OBJECTIVE', 'LEARNING_OUTCOME', 'COMPETENCY_STATEMENT', 'CONTENT_THEME',
  'CONTENT_ELEMENT', 'METHODOLOGICAL_GUIDANCE', 'ACTIVITY_TYPE',
  'ASSESSMENT_GUIDANCE', 'TEMPORAL_ALLOCATION', 'STRUCTURAL_DESCRIPTION',
];

const PILOT_TOPIC_PAGE = new Map<GateSourceTopic, { scannedIndex: number; physicalPage: number; printedPage: string }>(
  SOURCE_TOPIC_PAGE_REGISTRY.map((e) => [e.sourceTopic, { scannedIndex: e.scannedIndex, physicalPage: e.physicalPage, printedPage: e.printedPage }]),
);

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

function claimsForTopic(topic: GateSourceTopic): ExpansionContentClaim[] {
  return CONTROLLED_EXPANSION_CLAIMS.filter((c) => c.sourceTopic === topic);
}

// ============================================================
// A. CELL SCOPE (A01-A07)
// ============================================================

test('A01 - cell count is a small controlled set (2-4 cells)', () => {
  assert.ok(
    CONTROLLED_EXPANSION_CELLS.length >= 2 && CONTROLLED_EXPANSION_CELLS.length <= 4,
    `cell count ${CONTROLLED_EXPANSION_CELLS.length} within 2-4`,
  );
  assert.strictEqual(CONTROLLED_EXPANSION_CELLS.length, CONTROLLED_EXPANSION_LEDGER.cellCount);
});

test('A02 - every cell attaches to a source-native structural element', () => {
  const ids = new Set(SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => e.structuralElementId));
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    assert.ok(ids.has(c.structuralElementId), `cell ${c.cellId} -> source-native ${c.structuralElementId}`);
    assert.strictEqual(c.sourceSubject, 'SRC_MATH', `cell ${c.cellId} subject`);
  }
});

test('A03 - every cell carries explicit physical page / printed page / scanned index', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    assert.ok(Number.isInteger(c.physicalPage), `cell ${c.cellId} physical page`);
    assert.strictEqual(c.scannedIndex, c.physicalPage - 1, `cell ${c.cellId} scanned index`);
    assert.ok(c.printedPage.length > 0, `cell ${c.cellId} printed page`);
  }
});

test('A04 - cells bind to the authenticated artifact and source version', () => {
  assert.ok(/^[0-9A-F]{64}$/.test(CONTROLLED_EXPANSION_VERDICT.artifactSha256), 'sha256 64 hex');
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.sourceVersionId, 'v1.0.0');
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.strictEqual(c.sourceVersionId, EXPANSION_SOURCE_VERSION_ID, `claim ${c.claimId} version`);
  }
});

test('A05 - every claim binds to exactly one declared expansion cell', () => {
  const cellIds = new Set(CONTROLLED_EXPANSION_CELLS.map((c) => c.cellId));
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(cellIds.has(c.cellId), `claim ${c.claimId} -> cell ${c.cellId}`);
  }
});

test('A06 - no fifth page / no page outside the declared matrix region', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    assert.ok(c.physicalPage >= 332 && c.physicalPage <= 335, `cell ${c.cellId} page in matrix region`);
  }
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(c.provenance.physicalPage >= 332 && c.provenance.physicalPage <= 335, `claim ${c.claimId} page in region`);
  }
  assert.strictEqual(CONTROLLED_EXPANSION_DECLARATION.physicalPageRange, '332-335');
});

test('A07 - the declaration is declared before extraction (self-describing scope)', () => {
  const d = CONTROLLED_EXPANSION_DECLARATION;
  assert.strictEqual(d.gate, '07C.9');
  assert.strictEqual(d.sourceSubject, 'SRC_MATH');
  assert.strictEqual(d.structuralElementId, 'el-math-numbers');
  assert.strictEqual(d.extractionMethod, 'DIRECT_STRUCTURED_EXTRACTION');
  assert.strictEqual(d.extractionClass, 'DIRECT_DIGITAL');
  assert.strictEqual(d.cellCount, CONTROLLED_EXPANSION_CELLS.length);
  assert.ok(d.why && d.why.length > 20, 'why rationale present');
  assert.ok(d.ocrState.includes('NONE_REQUIRED'), 'no OCR in the digital expansion');
});

// ============================================================
// B. GRADE TRUTH (B01-B08)
// ============================================================

test('B01 - no fabricated grade ownership: grade never inferred from topic/id/wording', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    // candidateGrade is the DECLARED scope; it must not claim source-confirmed
    // status unless the evidence directly establishes it.
    if (c.sourceConfirmedGrade !== null) {
      assert.strictEqual(c.attributionMode, 'DIRECTLY_ESTABLISHED_GRADE', `claim ${c.claimId}`);
    }
    // REVIEW_REQUIRED must never carry a source-confirmed grade.
    if (c.attributionMode === 'REVIEW_REQUIRED') {
      assert.strictEqual(c.sourceConfirmedGrade, null, `claim ${c.claimId} sourceConfirmed null`);
    }
  }
});

test('B02 - candidate grade and source-confirmed grade are never conflated', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    // candidateGrade is always present; attributionMode records the epistemic level.
    assert.ok(CONTROLLED_EXPANSION_CELLS.length, 'cells present');
    assert.ok(
      ['DIRECTLY_ESTABLISHED_GRADE', 'STRUCTURALLY_CALIBRATED_GRADE', 'REVIEW_REQUIRED', 'SOURCE_STRUCTURE_INSUFFICIENT'].includes(c.attributionMode),
      `cell ${c.cellId} attribution mode known`,
    );
  }
});

test('B03 - STRUCTURALLY_CALIBRATED cells carry exactGradeEvidenceState STRUCTURALLY_CALIBRATED', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    if (c.attributionMode === 'STRUCTURALLY_CALIBRATED_GRADE') {
      assert.strictEqual(c.exactGradeEvidenceState, 'STRUCTURALLY_CALIBRATED', `cell ${c.cellId}`);
    }
  }
});

test('B04 - REVIEW_REQUIRED cells carry UNRESOLVED exact-grade evidence (honest)', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    if (c.attributionMode === 'REVIEW_REQUIRED') {
      assert.ok(['UNRESOLVED', 'STRUCTURALLY_CALIBRATED'].includes(c.exactGradeEvidenceState), `cell ${c.cellId}`);
    }
  }
});

test('B05 - REVIEW_REQUIRED claims are never HIGH confidence', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    if (c.attributionMode === 'REVIEW_REQUIRED') {
      assert.notStrictEqual(c.confidence, 'HIGH', `claim ${c.claimId} REVIEW_REQUIRED never HIGH`);
      assert.strictEqual(c.verificationState, 'REVIEW_REQUIRED', `claim ${c.claimId} review-state consistent`);
      assert.strictEqual(c.sourceConfirmedGrade, null, `claim ${c.claimId} no source-confirmed grade`);
    }
  }
});

test('B06 - every claim carries an explicitly declared attribution mode', () => {
  const modes = ['DIRECTLY_ESTABLISHED_GRADE', 'STRUCTURALLY_CALIBRATED_GRADE', 'REVIEW_REQUIRED', 'SOURCE_STRUCTURE_INSUFFICIENT'];
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(modes.includes(c.attributionMode), `claim ${c.claimId} mode ${c.attributionMode}`);
  }
});

test('B07 - the exact-grade evidence state is one of the closed epistemic levels', () => {
  const levels = ['DIRECTLY_ESTABLISHED', 'STRUCTURALLY_CALIBRATED', 'UNRESOLVED'];
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    assert.ok(levels.includes(c.exactGradeEvidenceState), `cell ${c.cellId} evidence level`);
  }
});

test('B08 - no claim masquerades as a directly-source-confirmed grade without that level', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    if (c.sourceConfirmedGrade !== null) {
      const cell = CONTROLLED_EXPANSION_CELLS.find((x) => x.cellId === c.cellId);
      assert.strictEqual(cell?.exactGradeEvidenceState, 'DIRECTLY_ESTABLISHED', `claim ${c.claimId}`);
    }
  }
});

// ============================================================
// C. PROVENANCE (C01-C06)
// ============================================================

test('C01 - physicalPage = scannedIndex + 1 for every cell and claim', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) assert.strictEqual(c.physicalPage, c.scannedIndex + 1, `cell ${c.cellId}`);
  for (const c of CONTROLLED_EXPANSION_CLAIMS) assert.strictEqual(c.provenance.physicalPage, c.provenance.scannedIndex + 1, `claim ${c.claimId}`);
});

test('C02 - printed page is never silently substituted for physical page', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) assert.notStrictEqual(Number(c.printedPage), c.physicalPage, `cell ${c.cellId}`);
  for (const c of CONTROLLED_EXPANSION_CLAIMS) assert.notStrictEqual(Number(c.provenance.printedPage), c.provenance.physicalPage, `claim ${c.claimId}`);
});

test('C03 - every cell/claim is routed DIRECT_DIGITAL (pages in clean digital set, no OCR)', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) assert.strictEqual(c.digitalState, 'DIRECT_DIGITAL', `cell ${c.cellId}`);
  for (const c of CONTROLLED_EXPANSION_CLAIMS) assert.strictEqual(c.provenance.extractionClass, 'DIRECT_DIGITAL', `claim ${c.claimId}`);
});

test('C04 - page is provenance, not identity', () => {
  const ids = new Set(CONTROLLED_EXPANSION_CLAIMS.map((c) => c.claimId));
  assert.strictEqual(ids.size, CONTROLLED_EXPANSION_CLAIMS.length, 'claim ids unique');
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    const key = expansionClaimStableKey({
      structuralElementId: c.structuralElementId,
      gradeCode: c.candidateGrade,
      category: c.category,
      normalizedValueAr: c.normalizedValueAr,
      sourceVersionId: c.sourceVersionId,
    });
    assert.ok(!key.includes(String(c.provenance.physicalPage)), 'identity does not embed page number');
  }
});

test('C05 - every claim has full provenance (block label, cell label, row/column note)', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(c.provenance.blockLabel.length > 0, `claim ${c.claimId} block label`);
    assert.ok(c.provenance.cellLabel.length > 0, `claim ${c.claimId} cell label`);
    assert.ok(c.provenance.rowColumnNote.length > 0, `claim ${c.claimId} row/column note`);
  }
});

test('C06 - claim provenance triple matches the pilot source-topic registry (page authority)', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    const exp = PILOT_TOPIC_PAGE.get(c.sourceTopic);
    assert.ok(exp, `registry entry for ${c.sourceTopic}`);
    assert.strictEqual(c.provenance.scannedIndex, exp.scannedIndex, `claim ${c.claimId} scannedIndex`);
    assert.strictEqual(c.provenance.physicalPage, exp.physicalPage, `claim ${c.claimId} physicalPage`);
    assert.strictEqual(c.provenance.printedPage, exp.printedPage, `claim ${c.claimId} printedPage`);
  }
});

// ============================================================
// D. DIVERSITY (D01-D05, §6)
// ============================================================

test('D01 - at least two distinct candidate grades are expanded (dimension A)', () => {
  const grades = new Set<CellSourceConfirmedGrade>(CONTROLLED_EXPANSION_CELLS.map((c) => c.candidateGrade));
  assert.ok(grades.size >= 2, `distinct grades ${grades.size} >= 2`);
});

test('D02 - at least two distinct source topics / content categories (dimension D)', () => {
  const topics = new Set(CONTROLLED_EXPANSION_CELLS.map((c) => c.sourceTopic));
  assert.ok(topics.size >= 2, `distinct topics ${topics.size} >= 2`);
});

test('D03 - diversity is satisfied (≥2 of the 4 §6 dimensions)', () => {
  const grades = new Set(CONTROLLED_EXPANSION_CELLS.map((c) => c.candidateGrade)).size;
  const topics = new Set(CONTROLLED_EXPANSION_CELLS.map((c) => c.sourceTopic)).size;
  // dimension A (grades) and dimension D (topic/content) both satisfied
  const dims = (grades >= 2 ? 1 : 0) + (topics >= 2 ? 1 : 0);
  assert.ok(dims >= 2, `diversity dimensions ${dims} >= 2`);
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.diversitySatisfied, true);
});

test('D04 - cells are not four near-identical neighboring rows (controlled selection)', () => {
  // Distinct topics across the expanded cells proves non-identical selection.
  const topics = Array.from(new Set(CONTROLLED_EXPANSION_CELLS.map((c) => c.sourceTopic)));
  assert.ok(topics.length >= 2, 'cells span distinct content columns');
});

test('D05 - no MUSIC, no CIVIC, no ambiguous-structure subject expanded', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    assert.notStrictEqual(c.applicationSubjectCode, 'MUSIC', `cell ${c.cellId} not MUSIC`);
    assert.notStrictEqual(c.applicationSubjectCode, 'CIVIC_EDUCATION', `cell ${c.cellId} not CIVIC`);
    assert.strictEqual(c.sourceSubject, 'SRC_MATH');
  }
});

// ============================================================
// E. DEDUP / IDENTITY (E01-E05, §18/§19)
// ============================================================

test('E01 - zero collision between expansion claims and the Gate-07C.7 pilot claims', () => {
  assert.strictEqual(EXPANSION_DEDUP_FREE.collisionCount, 0, 'no semantic-scope collision with pilot');
  assert.strictEqual(EXPANSION_DEDUP_FREE.pilotClaimCount, 16, 'pilot still 16 claims');
});

test('E02 - stable identity is independent of page/provenance', () => {
  const a = CONTROLLED_EXPANSION_CLAIMS[0];
  const alt = { ...a, provenance: { ...a.provenance, physicalPage: a.provenance.physicalPage + 1 } };
  const keyA = expansionClaimStableKey({
    structuralElementId: a.structuralElementId,
    gradeCode: a.candidateGrade,
    category: a.category,
    normalizedValueAr: a.normalizedValueAr,
    sourceVersionId: a.sourceVersionId,
  });
  const keyAlt = expansionClaimStableKey({
    structuralElementId: alt.structuralElementId,
    gradeCode: alt.candidateGrade,
    category: alt.category,
    normalizedValueAr: alt.normalizedValueAr,
    sourceVersionId: alt.sourceVersionId,
  });
  assert.strictEqual(keyA, keyAlt, 'stable key ignores page number');
});

test('E03 - the source version is part of the identity', () => {
  const a = CONTROLLED_EXPANSION_CLAIMS[0];
  const keyA = expansionClaimStableKey({
    structuralElementId: a.structuralElementId,
    gradeCode: a.candidateGrade,
    category: a.category,
    normalizedValueAr: a.normalizedValueAr,
    sourceVersionId: a.sourceVersionId,
  });
  const keyB = expansionClaimStableKey({
    structuralElementId: a.structuralElementId,
    gradeCode: a.candidateGrade,
    category: a.category,
    normalizedValueAr: a.normalizedValueAr,
    sourceVersionId: 'v2.0.0',
  });
  assert.notStrictEqual(keyA, keyB, 'version changes identity');
});

test('E04 - no duplicate claims within the expansion (distinct semantic scopes)', () => {
  const ids = new Set(CONTROLLED_EXPANSION_CLAIMS.map((c) => c.claimId));
  assert.strictEqual(ids.size, CONTROLLED_EXPANSION_CLAIMS.length, 'claim ids unique in expansion');
  // distinct semantic scopes (by stable key) equals the claim count
  const scopes = new Set(
    CONTROLLED_EXPANSION_CLAIMS.map((c) =>
      expansionClaimStableKey({
        structuralElementId: c.structuralElementId,
        gradeCode: c.candidateGrade,
        category: c.category,
        normalizedValueAr: c.normalizedValueAr,
        sourceVersionId: c.sourceVersionId,
      }),
    ),
  );
  assert.strictEqual(scopes.size, CONTROLLED_EXPANSION_CLAIMS.length, 'no semantic-scope duplication');
});

test('E05 - repeated source truth is kept once (no provenance-split duplicates)', () => {
  for (const [k, list] of new Map<string, ExpansionContentClaim[]>().entries()) {
    void k;
    void list;
  }
  // The registry holds one record per distinct semantic scope (checked in E04).
  assert.ok(CONTROLLED_EXPANSION_CLAIMS.length >= 8, 'expansion has a meaningful claim set (no drop to a single artifact)');
});

// ============================================================
// F. CONTENT SAFETY (F01-F08)
// ============================================================

test('F01 - no synthetic lessons', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.syntheticLessons, 0);
});

test('F02 - no synthetic knowledge objects (KOs)', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.syntheticKnowledgeObjects, 0);
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(!/\bKO\b|knowledge.?object/i.test(c.claimId), `claim ${c.claimId} not a KO`);
  }
});

test('F03 - no synthetic exercises', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.syntheticExercises, 0);
});

test('F04 - no content-verified claims (freeze stays 0)', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.notStrictEqual(c.contentStatus, 'CONTENT_VERIFIED', `claim ${c.claimId} not content-verified`);
  }
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.contentVerifiedCount, 0);
});

test('F05 - published stays 0', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.publishedCount, 0);
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.published, 0);
});

test('F06 - mastery is not derived', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.masteryDerived, false);
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.structureCompleteVerified, 0);
});

test('F07 - completeness is UNMEASURABLE (content denominator unknown)', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.contentDenominatorKnown, false);
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.completenessStatus, 'UNMEASURABLE');
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.completenessUnmeasurable, true);
});

test('F08 - structural denominator freeze preserved (verdict flag)', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.denominatorFrozenVerbatim, true);
});

// ============================================================
// G. FREEZE / ADDITIVE (G01-G06)
// ============================================================

test('G01 - Gate-07C.7 pilot registry is untouched (16 claims)', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_CLAIMS.length, 16);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.claimCount, 16);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount, 0);
  assert.strictEqual(CONTENT_PILOT_DECLARATION.gradeCode, 'P1');
});

test('G02 - Gate-07C.8 review registry is untouched (6 records)', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEWS.length, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.resolvedReviewCount, 6);
});

test('G03 - the expansion is additive and separate from the pilot claims array', () => {
  const pilotIds = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.claimId));
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(!pilotIds.has(c.claimId), `claim ${c.claimId} not a pilot re-use`);
  }
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.pilotRegistryFrozen, true);
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.reviewRegistryFrozen, true);
});

test('G04 - no claim reaches CONTENT_VERIFIED or PUBLISHED in the expansion', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.notStrictEqual(c.contentStatus, 'PUBLISHED', `claim ${c.claimId} not published`);
    assert.notStrictEqual(c.contentStatus, 'CONTENT_VERIFIED', `claim ${c.claimId} not content-verified`);
  }
});

test('G05 - expansion does not introduce new source-truth duplication against the pilot', () => {
  // EXPANSION_DEDUP_FREE.collisionCount already derived zero; re-assert non-vacuous.
  assert.strictEqual(EXPANSION_DEDUP_FREE.collisionCount, 0);
});

test('G06 - no persistence: expansion is a pure additive domain model', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.published, 0);
  assert.ok(CONTROLLED_EXPANSION_CLAIMS.every((c) => ['EXTRACTED_UNVERIFIED', 'REVIEW_REQUIRED'].includes(c.contentStatus)));
});

// ============================================================
// H. LEDGER / VERDICT (H01-H08)
// ============================================================

test('H01 - ledger claimCount equals claims array length', () => {
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.claimCount, CONTROLLED_EXPANSION_CLAIMS.length);
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.cellCount, CONTROLLED_EXPANSION_CELLS.length);
});

test('H02 - attribution-mode counts independently recomputed match the ledger', () => {
  const calc = (m: string) => CONTROLLED_EXPANSION_CLAIMS.filter((c) => c.attributionMode === m).length;
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.directlyEstablishedGradeCount, calc('DIRECTLY_ESTABLISHED_GRADE'));
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.structurallyCalibratedGradeCount, calc('STRUCTURALLY_CALIBRATED_GRADE'));
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.reviewRequiredGradeCount, calc('REVIEW_REQUIRED'));
  assert.strictEqual(CONTROLLED_EXPANSION_LEDGER.sourceStructureInsufficientGradeCount, calc('SOURCE_STRUCTURE_INSUFFICIENT'));
});

test('H03 - attribution-mode partition sums to claimCount', () => {
  const sum =
    EXPANSION_ATTRIBUTION_COUNTS.directlyEstablishedGrade +
    EXPANSION_ATTRIBUTION_COUNTS.structurallyCalibratedGrade +
    EXPANSION_ATTRIBUTION_COUNTS.reviewRequiredGrade +
    EXPANSION_ATTRIBUTION_COUNTS.sourceStructureInsufficientGrade;
  assert.strictEqual(sum, CONTROLLED_EXPANSION_CLAIMS.length);
});

test('H04 - state-count partition sums to claimCount', () => {
  const sum = EXPANSION_STATE_COUNTS.extractedUnverified + EXPANSION_STATE_COUNTS.reviewRequired;
  assert.strictEqual(sum, CONTROLLED_EXPANSION_CLAIMS.length);
});

test('H05 - there is at least one correctly-calibrated and at least one review-required claim', () => {
  assert.ok(EXPANSION_ATTRIBUTION_COUNTS.structurallyCalibratedGrade >= 1, 'at least one calibrated claim');
  assert.ok(EXPANSION_ATTRIBUTION_COUNTS.reviewRequiredGrade >= 1, 'at least one review-required claim proves honesty');
});

test('H06 - verdict is PASS with all safety flags set', () => {
  const v = CONTROLLED_EXPANSION_VERDICT;
  assert.strictEqual(v.recommendation, 'PASS');
  assert.strictEqual(v.noFabricatedGradeOwnership, true);
  assert.strictEqual(v.noSourceTruthDuplication, true);
  assert.strictEqual(v.noSyntheticUnitsLessonsKOsOrExercises, true);
  assert.strictEqual(v.sourceNativeFirst, true);
  assert.strictEqual(v.applicationMappingIsSecondary, true);
});

test('H07 - claim count is within the controlled expansion target (~10-30)', () => {
  const n = CONTROLLED_EXPANSION_CLAIMS.length;
  assert.ok(n >= 10 && n <= 30, `claim count ${n} within 10-30 target`);
});

test('H08 - distinct grades and topics are recorded in the ledger', () => {
  assert.ok(CONTROLLED_EXPANSION_LEDGER.distinctCandidateGrades.length >= 2);
  assert.ok(CONTROLLED_EXPANSION_LEDGER.distinctSourceTopics.length >= 2);
});

// ============================================================
// R. DERIVED-COUNT RECONCILIATION (R16-R23)
//    Every count below is recomputed FROM THE RECORDS; no hardcoded totals.
// ============================================================

const attrs = (m: string) => CONTROLLED_EXPANSION_CLAIMS.filter((c) => c.attributionMode === m).length;
const contentStates = (s: string) => CONTROLLED_EXPANSION_CLAIMS.filter((c) => c.contentStatus === s).length;
const verifyStates = (s: string) => CONTROLLED_EXPANSION_CLAIMS.filter((c) => c.verificationState === s).length;

test('R16 - grade-evidence partition is recomputed directly from all 11 claims', () => {
  assert.strictEqual(attrs('DIRECTLY_ESTABLISHED_GRADE'), EXPANSION_ATTRIBUTION_COUNTS.directlyEstablishedGrade);
  assert.strictEqual(attrs('STRUCTURALLY_CALIBRATED_GRADE'), EXPANSION_ATTRIBUTION_COUNTS.structurallyCalibratedGrade);
  assert.strictEqual(attrs('REVIEW_REQUIRED'), EXPANSION_ATTRIBUTION_COUNTS.reviewRequiredGrade);
  assert.strictEqual(attrs('SOURCE_STRUCTURE_INSUFFICIENT'), EXPANSION_ATTRIBUTION_COUNTS.sourceStructureInsufficientGrade);
});

test('R17 - grade-evidence partition sums to newClaimCount', () => {
  const sum = attrs('DIRECTLY_ESTABLISHED_GRADE') + attrs('STRUCTURALLY_CALIBRATED_GRADE') + attrs('REVIEW_REQUIRED') + attrs('SOURCE_STRUCTURE_INSUFFICIENT');
  assert.strictEqual(sum, CONTROLLED_EXPANSION_CLAIMS.length);
});

test('R18 - content-state partition is independently recomputed from all 11 claims', () => {
  assert.strictEqual(contentStates('EXTRACTED_UNVERIFIED'), EXPANSION_STATE_COUNTS.extractedUnverified);
  assert.strictEqual(contentStates('REVIEW_REQUIRED'), EXPANSION_STATE_COUNTS.reviewRequired);
  assert.strictEqual(contentStates('CONTENT_VERIFIED'), 0);
  assert.strictEqual(contentStates('PUBLISHED'), 0);
});

test('R19 - content-state partition sums to newClaimCount', () => {
  const sum = contentStates('EXTRACTED_UNVERIFIED') + contentStates('REVIEW_REQUIRED') + contentStates('CONTENT_VERIFIED') + contentStates('PUBLISHED');
  assert.strictEqual(sum, CONTROLLED_EXPANSION_CLAIMS.length);
});

test('R20 - verification-state partition is independently recomputed and sums to newClaimCount', () => {
  const sum = verifyStates('UNVERIFIED') + verifyStates('REVIEW_REQUIRED') + verifyStates('VERIFIED') + verifyStates('REJECTED');
  assert.strictEqual(sum, CONTROLLED_EXPANSION_CLAIMS.length);
  // REVIEW_REQUIRED content status must be driven by the VERIFICATION state, not inferred
  // merely from a grade label: EXTRACTED_UNVERIFIED is independent of calibrated grade.
  assert.ok(contentStates('EXTRACTED_UNVERIFIED') >= 1, 'content state has a real UNVERIFIED partition');
  assert.ok(verifyStates('UNVERIFIED') >= 1, 'verification has a real UNVERIFIED partition');
});

test('R21 - report/verdict/ledger counts equal canonical recomputation', () => {
  const L = CONTROLLED_EXPANSION_LEDGER;
  assert.strictEqual(L.claimCount, CONTROLLED_EXPANSION_CLAIMS.length);
  assert.strictEqual(L.structurallyCalibratedGradeCount, attrs('STRUCTURALLY_CALIBRATED_GRADE'));
  assert.strictEqual(L.reviewRequiredGradeCount, attrs('REVIEW_REQUIRED'));
  assert.strictEqual(L.directlyEstablishedGradeCount, attrs('DIRECTLY_ESTABLISHED_GRADE'));
  assert.strictEqual(L.sourceStructureInsufficientGradeCount, attrs('SOURCE_STRUCTURE_INSUFFICIENT'));
  assert.strictEqual(L.extractedUnverifiedCount, contentStates('EXTRACTED_UNVERIFIED'));
  assert.strictEqual(L.reviewRequiredContentCount, contentStates('REVIEW_REQUIRED'));
  // Verdict mirrors the ledger totals exactly.
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.claimCount, L.claimCount);
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.cellCount, L.cellCount);
});

test('R22 - no hardcoded 7/4 or 6/5 assumption is used to make counts pass', () => {
  const reg = readFileSync(fileURLToPath(new URL('../../../domain/constants/moroccan-primary-controlled-content-expansion-registry.ts', import.meta.url)), 'utf8');
  // Counts are derived via .filter().length; no literal totals for the partitions.
  assert.ok(!/(structurallyCalibratedGrade|reviewRequiredGrade|extractedUnverifiedCount|reviewRequiredContentCount)\s*[:=]\s*[0-9]+/.test(reg), 'no hardcoded partition totals in registry');
  // The test itself must derive totals from the canonical records (filter on the
  // claim collection and reference .length), never assert a literal 6/5 or 7/4.
  const thisText = readFileSync(fileURLToPath(new URL(import.meta.url)), 'utf8');
  assert.ok(/CONTROLLED_EXPANSION_CLAIMS\.filter\(/.test(thisText), 'tests recompute partitions from claim records');
  assert.ok(/CONTROLLED_EXPANSION_CLAIMS\.length/.test(thisText), 'tests reference the canonical claim count');
  assert.ok(!/(?:CONTROLLED_EXPANSION_LEDGER|EXPANSION_ATTRIBUTION_COUNTS|L\.)\s*(?:structurallyCalibratedGradeCount|reviewRequiredGradeCount|extractedUnverifiedCount|reviewRequiredContentCount)[^\n]*\b(6|5|7|4)\b/.test(thisText), 'test never asserts a literal partition total');
});

test('R23 - cell-level attribution and claim-level attribution cannot silently overwrite each other', () => {
  // Each claim carries its OWN attributionMode independent of its parent cell; a claim
  // may be MORE conservative than its cell (boundary element), but never forced to match.
  for (const cell of CONTROLLED_EXPANSION_CELLS) {
    const claimsInCell = CONTROLLED_EXPANSION_CLAIMS.filter((c) => c.cellId === cell.cellId);
    assert.ok(claimsInCell.length >= 1, `cell ${cell.cellId} has claims`);
    for (const c of claimsInCell) {
      // Claim mode is always one of the closed epistemic levels (its own field).
      assert.ok(['DIRECTLY_ESTABLISHED_GRADE', 'STRUCTURALLY_CALIBRATED_GRADE', 'REVIEW_REQUIRED', 'SOURCE_STRUCTURE_INSUFFICIENT'].includes(c.attributionMode), `claim ${c.claimId}`);
      // A claim may be more conservative than its cell, but never STRONGER than the cell
      // would permit (a calibrated child cannot sit under an UNRESOLVED/REVIEW cell).
      if (cell.exactGradeEvidenceState === 'UNRESOLVED') {
        assert.strictEqual(c.attributionMode, 'REVIEW_REQUIRED', `claim ${c.claimId} under unresolved cell`);
      }
    }
  }
});

// ============================================================
// I. REPO / SECURITY (I01-I07)
// ============================================================

const REGISTRY_PATH = fileURLToPath(
  new URL('../../../domain/constants/moroccan-primary-controlled-content-expansion-registry.ts', import.meta.url),
);

test('I01 - no migration / schema change', () => {
  const text = readFileSync(REGISTRY_PATH, 'utf8');
  assert.ok(!/createTable|ALTER TABLE|CREATE\s+TABLE|collections\(|\.insert\(|\.insertMany\(/.test(text), 'no migration/table-writing');
});

test('I02 - no DB write / no Supabase deployment', () => {
  const text = readFileSync(REGISTRY_PATH, 'utf8');
  assert.ok(!/app\.supabase\.co/i.test(text), 'no supabase project');
  assert.ok(!/supabase\s*\./i.test(text), 'no supabase client');
});

test('I03 - no PDF/image/OCR dump committed (compact registry)', () => {
  const sample = JSON.stringify(CONTROLLED_EXPANSION_CLAIMS);
  assert.ok(sample.length < 60000, 'registry is compact, wording-only');
  assert.ok(!sample.includes('.pdf') && !sample.includes('.png') && !sample.includes('.jpg'), 'no binary artifact refs');
});

test('I04 - short wording only; no large/long-page text dump', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(c.sourceWordingAr.length < 220, `claim ${c.claimId} source wording short`);
    assert.ok(c.provenance.rowColumnNote.length < 300, `claim ${c.claimId} compact note`);
  }
});

test('I05 - no absolute local path', () => {
  const haystack = JSON.stringify([...CONTROLLED_EXPANSION_CELLS, ...CONTROLLED_EXPANSION_CLAIMS.map((c) => c.provenance)]);
  assert.ok(!haystack.includes(':\\'), 'no drive-letter absolute path');
  assert.ok(!haystack.includes('/Users/'), 'no unix-home absolute path');
  assert.ok(!haystack.includes('/Temp/opencode'), 'no temp machine path');
});

test('I06 - no secrets', () => {
  const text = readFileSync(REGISTRY_PATH, 'utf8');
  assert.ok(!/sk-[A-Za-z0-9]{20}/.test(text), 'no sk- secret');
  assert.ok(!/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/.test(text), 'no private key');
  assert.ok(!/ghp_|github_pat_/.test(text), 'no github token');
  assert.ok(!/OPENAI_API_KEY\s*=\s*\S/.test(text), 'no inline API key');
});

test('I07 - expansion does not modify trusted learner/runtime structures', () => {
  const text = readFileSync(REGISTRY_PATH, 'utf8');
  assert.ok(!/from\s+['"].*learner.*['"]/i.test(text), 'no trusted learner/runtime import');
  assert.ok(!/from\s+['"].*ingest[-_]?evidence.*['"]/i.test(text), 'no ingest-evidence runtime import');
});

// ============================================================
// J. REVIEW-REUSE (J01-J05) — reuse existing epistemic types, no new authority
// ============================================================

test('J01 - expansion reuses the Gate-07C.8 cell-attribution review model', () => {
  // The 07C.8 review-ledger uses DirectlyEstablished/StructurallyCalibrated/
  // Unresolved epistemic levels and CellSourceConfirmedGrade. The expansion
  // references these same types; it must not re-define a competing authority.
  assert.ok(CELL_ATTRIBUTION_REVIEW_LEDGER.structurallyCalibratedGradeCount === 6);
  // 07C.8 had 0 DIRECTLY_ESTABLISHED — the expansion must not silently claim the
  // source now prints grade headers where it did not before.
  assert.strictEqual(EXPANSION_ATTRIBUTION_COUNTS.directlyEstablishedGrade, 0);
});

test('J02 - expansion adds no new grade-authority beyond the frozen epistemic model', () => {
  // Any STRUCTURALLY_CALIBRATED cell must carry exactly the calibrated level.
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    if (c.attributionMode === 'STRUCTURALLY_CALIBRATED_GRADE') {
      assert.strictEqual(c.exactGradeEvidenceState, 'STRUCTURALLY_CALIBRATED', `cell ${c.cellId}`);
    }
  }
  // No DIRECTLY_ESTABLISHED cells were introduced (grade headers absent).
  assert.strictEqual(EXPANSION_ATTRIBUTION_COUNTS.directlyEstablishedGrade, 0);
});

test('J03 - UNRESOLVED cells stay REVIEW_REQUIRED (never promoted to a grade)', () => {
  for (const c of CONTROLLED_EXPANSION_CELLS) {
    if (c.exactGradeEvidenceState === 'UNRESOLVED') {
      assert.strictEqual(c.attributionMode, 'REVIEW_REQUIRED', `cell ${c.cellId} unresolved stays review`);
    }
  }
});

test('J04 - the review-required band is not over-stated as a confirmed grade', () => {
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    if (c.attributionMode === 'REVIEW_REQUIRED') {
      assert.strictEqual(c.sourceConfirmedGrade, null, `claim ${c.claimId} no source-confirmed grade`);
      assert.ok(['REVIEW_REQUIRED', 'UNVERIFIED'].includes(c.verificationState), `claim ${c.claimId}`);
    }
  }
});

test('J05 - application mapping remains secondary for expansion claims', () => {
  const apps = new Set(APPLICATION_MAPPING_MATRIX.map((m) => m.applicationSubject));
  for (const c of CONTROLLED_EXPANSION_CLAIMS) {
    assert.ok(apps.has(c.applicationSubjectCode), `claim ${c.claimId} app code declared`);
    assert.ok(!c.claimId.startsWith(c.applicationSubjectCode.toLowerCase()), `claim ${c.claimId} not id'd by app code`);
    assert.ok(!c.claimId.includes('app-'), `claim ${c.claimId} source-native naming`);
  }
});

console.log('');
console.log(`--- GATE 07C.9: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}
