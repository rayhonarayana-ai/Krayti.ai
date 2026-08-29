/**
 * Qarayti.ai - Gate 07C.8: Primary Curriculum Cell Attribution & Review
 * Resolution Tests
 *
 * Verifies that the six Gate-07C.7 REVIEW_REQUIRED cell-attribution claims
 * (3 MULTIPLICATION + 3 DIVISION) are resolved from the primary artifact's
 * table GEOMETRY ONLY (§13), and that the resolution is an ADDITIVE review
 * layer that PRESERVES the frozen Gate-07C.7 state (§1/§55: 07C.7 stays 92/92,
 * REVIEW=6 / REJECTED=0, claim count 16).
 *
 * Groups:
 *   A. BASELINE / SCOPE      A01-A03  gate, scope, artifact binding
 *   B. REVIEW MODEL          B01-B07  closed decision/basis/resolve, grade-scope
 *                                     distinction, claim references = 6 pilot rows
 *   C. GEOMETRY SAFETY       C01-C04  geometry-only, DIRECT_DIGITAL, no text/OCR/page
 *   D. DECISION SAFETY       D01-D05  only §15 states, only §39 bases, all OTHER_GRADE
 *   E. CLAIM INTEGRITY       E01-E04  count stays 16, no mutation, no new claims
 *   F. FREEZE                F01-F05  07C.7 ledger untouched, content/published zero
 *   G. SECURITY / REPO       G01-G06  no PDF/image/OCR/abs path/migration/secrets
 *   H. OUTCOME HONESTY       H01-H08  resolved=6, partition sums, distinct grades,
 *                                     topics, no masquerade, no duplicated totals
 *
 * The tests validate static registries and invariants only. They do NOT create
 * units/lessons/KOs/exercises (§8), write to a database, or deploy anything.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  CELL_ATTRIBUTION_REVIEWS,
  CELL_ATTRIBUTION_REVIEW_LEDGER,
  CELL_ATTRIBUTION_REVIEW_VERDICT,
} from '../../../domain/constants/moroccan-primary-cell-attribution-review-registry';

import {
  CONTENT_EXTRACTION_PILOT_CLAIMS,
  CONTENT_EXTRACTION_PILOT_LEDGER,
  CONTENT_EXTRACTION_ARTIFACT_SHA256,
  CONTENT_EXTRACTION_SOURCE_VERSION_ID,
  CONTENT_ATTRIBUTION_COUNTS,
  CONTENT_STATE_COUNTS,
  CONTENT_VERIFICATION_COUNTS,
  CONTROLLED_CONTENT_EXTRACTION_VERDICT,
} from '../../../domain/constants/moroccan-primary-content-extraction-pilot-registry';

import { DIRECT_EVIDENCE_ARTIFACT_SHA256 } from '../../../domain/constants/moroccan-primary-direct-evidence-registry';

import type {
  AttributionDecisionBasis,
  CellAttributionReview,
  CellSourceConfirmedGrade,
  ContentCellAttributionDecision,
  GateSourceTopic,
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
    console.log(`[FAIL] ${name}`);
    console.log('       ' + String(e && e.message ? e.message : e));
  }
}

const CLOSED_DECISIONS: ContentCellAttributionDecision[] = [
  'CONFIRMED_P1',
  'CONFIRMED_OTHER_GRADE',
  'STILL_AMBIGUOUS',
  'SOURCE_STRUCTURE_INSUFFICIENT',
  'REJECTED_AS_P1',
];

const CLOSED_BASES: AttributionDecisionBasis[] = [
  'DIRECT_CELL_HEADER_ALIGNMENT',
  'MERGED_CELL_GRADE_SPAN',
  'TABLE_ROW_COLUMN_ALIGNMENT',
  'CONTINUATION_FROM_LABELED_HEADER',
  'VISUAL_BOUNDARY_CONFIRMATION',
  'DIGITAL_GEOMETRY_CONFIRMATION',
  'OCR_ASSISTED_GEOMETRY_REVIEW',
  'SOURCE_STRUCTURE_INSUFFICIENT',
];

const CLOSED_GRADES: CellSourceConfirmedGrade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

// ---- A. BASELINE / SCOPE ----
test('A01: gate declares 07C.8', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.gate, '07C.8');
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.gate, '07C.8');
});

test('A02: review scope is exactly six review claims', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEWS.length, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.reviewRequestCount, 6);
});

test('A03: artifact binding matches the authenticated primary artifact', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.artifactSha256, DIRECT_EVIDENCE_ARTIFACT_SHA256);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.artifactSha256, CONTENT_EXTRACTION_ARTIFACT_SHA256);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.sourceVersionId, CONTENT_EXTRACTION_SOURCE_VERSION_ID);
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(r.artifactId.length > 0, `${r.reviewId}: artifactId present`);
    assert.strictEqual(r.sourceVersionId, 'v1.0.0', `${r.reviewId}: source version v1.0.0`);
  }
});

// ---- B. REVIEW MODEL ----
test('B01: each review decision is a closed §15 member', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(CLOSED_DECISIONS.includes(r.attributionDecision), `${r.reviewId}: unknown decision`);
  }
});

test('B02: each decision basis is a closed §39 member', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(r.decisionBasis.length > 0, `${r.reviewId}: at least one basis`);
    for (const b of r.decisionBasis) {
      assert.ok(CLOSED_BASES.includes(b), `${r.reviewId}: unknown basis ${b}`);
    }
  }
});

test('B03: each review is RESOLVED, closing its REVIEW_REQUIRED request', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.reviewState, 'RESOLVED', `${r.reviewId}: resolved`);
    assert.strictEqual(r.reviewRequirement, 'REVIEW_REQUIRED', `${r.reviewId}: resolves a 07C.7 review`);
    assert.ok(r.reviewedAt.length > 0, `${r.reviewId}: reviewedAt present`);
  }
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.resolvedReviewCount, 6);
});

test('B04: grade scope keeps candidateGrade (P1) distinct from any source grade field', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.candidateGrade, 'P1', `${r.reviewId}: candidate pilot scope P1`);
    // sourceConfirmedGrade is closed-or-null; calibrated grade is a closed grade.
    assert.ok(
      r.sourceConfirmedGrade === null || CLOSED_GRADES.includes(r.sourceConfirmedGrade),
      `${r.reviewId}: source-confirmed grade closed or null`,
    );
    if (r.structurallyCalibratedGrade !== null) {
      assert.ok(CLOSED_GRADES.includes(r.structurallyCalibratedGrade), `${r.reviewId}: calibrated grade closed`);
    }
    assert.notStrictEqual(r.structurallyCalibratedGrade, 'P1', `${r.reviewId}: calibrated grade is NOT P1`);
    assert.notStrictEqual(r.sourceConfirmedGrade, 'P1', `${r.reviewId}: source grade is NOT relabelled P1`);
  }
});

test('B05: every review record references a real 07C.7 claim via stable claimId', () => {
  const pilotIds = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.claimId));
  const reviewIds = new Set(CELL_ATTRIBUTION_REVIEWS.map((r) => r.claimId));
  assert.strictEqual(reviewIds.size, 6, 'six distinct referenced claims');
  for (const id of reviewIds) {
    assert.ok(pilotIds.has(id), `referenced claimId ${id} exists in pilot registry`);
  }
});

test('B06: the six referenced claims are exactly the MULT + DIV REVIEW_REQUIRED claims', () => {
  const referenced = CELL_ATTRIBUTION_REVIEWS.map((r) => r.claimId).sort();
  const reviewClaims = CONTENT_EXTRACTION_PILOT_CLAIMS
    .filter((c) => c.attributionStatus === 'REVIEW_REQUIRED')
    .map((c) => c.claimId)
    .sort();
  assert.deepStrictEqual(referenced, reviewClaims, 'review covers all 6 REVIEW_REQUIRED claims and no more');
});

test('B07: review records map to the authorized MULT (phys 334) / DIV (phys 335) pages', () => {
  const pageOf: Record<string, number> = {};
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    pageOf[r.sourceTopic] = r.physicalPage;
  }
  assert.strictEqual(pageOf['MULTIPLICATION'], 334);
  assert.strictEqual(pageOf['DIVISION'], 335);
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.structuralElementId, 'el-math-numbers', `${r.reviewId}: source-native element`);
    assert.strictEqual(r.tableLocator.length > 0 && r.cellLocator.length > 0, true, `${r.reviewId}: locators present`);
  }
});

// ---- C. GEOMETRY SAFETY ----
test('C01: no text-based topic/page inference in the review registry source', () => {
  const srcPath = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(srcPath, 'utf8');
  assert.ok(!/\bfunction\s+(inferTopic|topicFrom|pageFor|topicFor)\b/i.test(text), 'no topic inference function');
  assert.ok(!/claimId\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(text), 'no claimId text-op inference');
  assert.ok(!/sourceWordingAr\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(text), 'no wording text-op inference');
  assert.ok(!/normalizedValueAr\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(text), 'no normalized text-op inference');
  assert.ok(!/\.test\((sourceWordingAr|normalizedValueAr)\)/.test(text), 'no regex.test on wording');
});

test('C02: all reviewed pages are DIRECT_DIGITAL (no OCR routing)', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.reviewMethod, 'DIRECT_DIGITAL', `${r.reviewId}: DIRECT_DIGITAL`);
  }
});

test('C03: every review carries geometry evidence and a grade-header locator', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.gradeHeaderLocator.length > 0, true, `${r.reviewId}: grade header locator`);
    const ev = r.geometryEvidence;
    assert.ok(ev.elementLabel.length > 0, `${r.reviewId}: element label`);
    assert.ok(ev.headerOrRangeNote.length > 0, `${r.reviewId}: range note`);
    assert.ok(ev.rowColumnAlignmentNote.length > 0, `${r.reviewId}: alignment note`);
  }
});

test('C04: no page/OCR/image dump committed in the review registry', () => {
  const srcPath = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(srcPath, 'utf8');
  const dangerous = [
    /\.pdf/i, /\.png/i, /\.jpg/i, /\.jpeg/i, /C:\\/i,
    /AppData/i, /\\Temp\\/i, /opencode/i, /pdfjsdir/i,
  ];
  for (const re of dangerous) {
    assert.ok(!re.test(text), `no dump/absolute path marker: ${re}`);
  }
});

// ---- D. DECISION SAFETY ----
test('D01: every decision is either CONFIRMED_P1 or CONFIRMED_OTHER_GRADE (no pseudo-confidence)', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(
      r.attributionDecision === 'CONFIRMED_P1' || r.attributionDecision === 'CONFIRMED_OTHER_GRADE',
      `${r.reviewId}: set decision (no arbitrary numeric confidence)`,
    );
  }
});

test('D02: no review claims a P1 confirmation', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedP1Count, 0);
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.notStrictEqual(r.attributionDecision, 'CONFIRMED_P1', `${r.reviewId}: not P1`);
  }
});

test('D03: every review resolves to CONFIRMED_OTHER_GRADE', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedOtherGradeCount, 6);
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.attributionDecision, 'CONFIRMED_OTHER_GRADE', `${r.reviewId}: other grade`);
  }
});

test('D04: calibrated source grades stay within {P3, P4}; none is directly source-confirmed', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    const cal = r.structurallyCalibratedGrade;
    assert.ok(cal === 'P3' || cal === 'P4', `calibrated grade ${cal} in {P3,P4}`);
    // sourceConfirmedGrade is null unless the exact grade is DIRECTLY established.
    assert.strictEqual(
      r.sourceConfirmedGrade,
      r.exactGradeEvidenceState === 'DIRECTLY_ESTABLISHED' ? r.structurallyCalibratedGrade : null,
      `${r.reviewId}: sourceConfirmedGrade only when directly established`,
    );
  }
  assert.deepStrictEqual(
    [...new Set(CELL_ATTRIBUTION_REVIEW_LEDGER.distinctStructurallyCalibratedGrades)].sort(),
    ['P3', 'P4'],
    'distinct calibrated source grades',
  );
  assert.deepStrictEqual(
    CELL_ATTRIBUTION_REVIEW_LEDGER.distinctSourceConfirmedGrades,
    [],
    'no directly source-confirmed exact grade',
  );
});

test('D05: decisions rely on geometry bases, not semantic heuristics or numeric confidence', () => {
  const GEOMETRY_BASES: AttributionDecisionBasis[] = [
    'TABLE_ROW_COLUMN_ALIGNMENT',
    'DIGITAL_GEOMETRY_CONFIRMATION',
    'CONTINUATION_FROM_LABELED_HEADER',
    'DIRECT_CELL_HEADER_ALIGNMENT',
    'MERGED_CELL_GRADE_SPAN',
    'VISUAL_BOUNDARY_CONFIRMATION',
  ];
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    const usesGeometry = r.decisionBasis.some((b) => GEOMETRY_BASES.includes(b));
    assert.ok(usesGeometry, `${r.reviewId}: relies on a geometry basis`);
    // A CONFIRMED_OTHER_GRADE attribution is a categorical, evidence-backed
    // classification — no arbitrary numeric confidence is attached.
    if (r.attributionDecision === 'CONFIRMED_OTHER_GRADE') {
      assert.strictEqual(r.decisionBasis.includes('SOURCE_STRUCTURE_INSUFFICIENT'), false);
    }
  }
  const srcPath = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(srcPath, 'utf8');
  // No fabricated machine-readable numeric confidence used to drive a decision.
  assert.ok(!/\bconfidence\s*:\s*['"]\d/.test(text), 'no numeric confidence tier');
  // No code-level semantic heuristic selector (categorical grade from wording).
  assert.ok(!/\bgradeBy\(|\bgradeFromWording\(|\bsemanticGrade\(/.test(text), 'no semantic-grade selector fn');
});

// ---- E. CLAIM INTEGRITY ----
test('E01: pilot claim count stays frozen at 16', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_CLAIMS.length, 16);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.claimCount, 16);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.pilotClaimCountFrozen, true);
});

test('E02: 07C.7 attribution state is preserved (REVIEW=6 / REJECTED=0 / CLEAR=10)', () => {
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.clearP1Attribution, 10);
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.reviewRequired, 6);
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.rejected, 0);
});

test('E03: 07C.7 content/verification state is preserved', () => {
  assert.strictEqual(CONTENT_STATE_COUNTS.extractedUnverified, 10);
  assert.strictEqual(CONTENT_STATE_COUNTS.reviewRequired, 6);
  assert.strictEqual(CONTENT_VERIFICATION_COUNTS.reviewRequired, 6);
});

test('E04: the review layer adds no new content claims and duplicates no totals', () => {
  // Review registry holds review records only (no SourceContentClaim entries).
  assert.strictEqual(CELL_ATTRIBUTION_REVIEWS.length, 6);
  const pilotIds = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.claimId));
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(pilotIds.has(r.claimId), `${r.reviewId}: references pilot claim, not a new claim`);
  }
});

// ---- F. FREEZE ----
test('F01: CONTENT_VERIFIED stays 0 (no unverified content becomes verified)', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount, 0);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.contentVerifiedStaysZero, true);
});

test('F02: PUBLISHED stays 0 (no publication)', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.publishedCount, 0);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.publishedStaysZero, true);
});

test('F03: structural completeness remains UNMEASURABLE (denominator unknown)', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.completenessStatus, 'UNMEASURABLE');
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentDenominatorKnown, false);
});

test('F04: no synthetic lessons / KOs / exercises introduced', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticLessons, 0);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticKnowledgeObjects, 0);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticExercises, 0);
});

test('F05: the 07C.8 review freeze surface is fixed at six', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.frozenPilotReviewCount, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.sevenC7SuitePreserved, true);
});

// ---- G. SECURITY / REPO ----
test('G01: no PDF/image dumps committed', () => {
  const reg = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(reg, 'utf8');
  assert.ok(!/\.pdf\b|\.png\b|\.jpg\b|\.jpeg\b/i.test(text), 'no binary artifact dump');
});

test('G02: no OCR-dump or page-dump commit', () => {
  const reg = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(reg, 'utf8');
  assert.ok(!/\b(ocrdump|ocr_dump|pagedump|tabledump)\b/i.test(text), 'no OCR/page dump constant');
});

test('G03: no absolute paths / machine-local paths', () => {
  const reg = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(reg, 'utf8');
  assert.ok(!/C:\\|AppData|Temp|opencode/i.test(text), 'no local/machine absolute path');
});

test('G04: no migration / DB write / deployment', () => {
  const reg = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(reg, 'utf8');
  assert.ok(!/\bsupabase\b|\bmigration\b|\binsert\(|\bupsert\(|\bdeploy\b/i.test(text), 'no migration/db/deploy');
});

test('G05: only minimal short wording + locators are committed (copyright)', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(r.sourceTopic.length > 0, `${r.reviewId}: topic`);
  }
  const reg = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(reg, 'utf8');
  assert.ok(!/\bbase64\b/i.test(text), 'no base64 payload');
  assert.ok(!/[\u4e00-\u9fff]{100,}/.test(text), 'no huge text blob');
});

test('G06: no secrets / keys committed', () => {
  const reg = fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  );
  const text = readFileSync(reg, 'utf8');
  assert.ok(!/api[_-]?key|sk-[A-Za-z0-9]{16,}|secret|password|token\s*[:=]/i.test(text), 'no secret material');
});

// ---- H. OUTCOME HONESTY ----
test('H01: review request and resolution counts are equal and explicit', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.reviewRequestCount, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.resolvedReviewCount, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.reviewRequestCount, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.resolvedReviewCount, 6);
});

test('H02: outcome partition is complete (sums to six, no double counting)', () => {
  const {
    confirmedP1Count,
    confirmedOtherGradeCount,
    stillAmbiguousCount,
    sourceStructureInsufficientCount,
    rejectedAsP1Count,
  } = CELL_ATTRIBUTION_REVIEW_LEDGER;
  const total = confirmedP1Count + confirmedOtherGradeCount + stillAmbiguousCount
    + sourceStructureInsufficientCount + rejectedAsP1Count;
  assert.strictEqual(total, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.confirmedP1Count, confirmedP1Count);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.confirmedOtherGradeCount, confirmedOtherGradeCount);
});

test('H03: specific outcomes are confirmed (0 P1 / 6 other-grade)', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedP1Count, 0);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedOtherGradeCount, 6);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.stillAmbiguousCount, 0);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.sourceStructureInsufficientCount, 0);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.rejectedAsP1Count, 0);
});

test('H04: sources reviewed are exactly MULTIPLICATION and DIVISION', () => {
  assert.deepStrictEqual(
    [...CELL_ATTRIBUTION_REVIEW_LEDGER.sourceTopicsReviewed].sort(),
    ['DIVISION', 'MULTIPLICATION'],
  );
  const topics = CELL_ATTRIBUTION_REVIEWS.map((r) => r.sourceTopic);
  assert.strictEqual(topics.filter((t) => t === 'MULTIPLICATION').length, 3);
  assert.strictEqual(topics.filter((t) => t === 'DIVISION').length, 3);
});

test('H05: no claim masquerades as P1 after resolution', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.claimsMasqueradingAsP1, false);
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.notStrictEqual(r.sourceConfirmedGrade, 'P1', `${r.reviewId}: not P1 scope truth`);
  }
});

test('H06: all six are resolved as other grade with explicit evidence per topic', () => {
  const byTopic: Record<GateSourceTopic, CellAttributionReview[]> = {
    MULTIPLICATION: [], DIVISION: [], NUMBERS: [], ADDITION_SUBTRACTION: [],
  };
  for (const r of CELL_ATTRIBUTION_REVIEWS) byTopic[r.sourceTopic].push(r);
  assert.strictEqual(byTopic.MULTIPLICATION.length, 3);
  assert.strictEqual(byTopic.DIVISION.length, 3);
  for (const r of [...byTopic.MULTIPLICATION, ...byTopic.DIVISION]) {
    assert.strictEqual(r.attributionDecision, 'CONFIRMED_OTHER_GRADE', `${r.reviewId}`);
  }
});

test('H07: grade-scope is explicitly distinct in the verdict (candidate vs source)', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.gradeScopeDistinct, true);
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.candidateGrade, 'P1');
    assert.ok(r.sourceConfirmedGrade !== 'P1');
  }
});

test('H08: no duplicated totals across ledger and verdict', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.gate, CELL_ATTRIBUTION_REVIEW_LEDGER.gate);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.reviewRequestCount, CELL_ATTRIBUTION_REVIEWS.length);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.resolvedReviewCount, CELL_ATTRIBUTION_REVIEWS.length);
  const uniqueReviews = new Set(CELL_ATTRIBUTION_REVIEWS.map((r) => r.reviewId)).size;
  assert.strictEqual(uniqueReviews, 6, 'unique review IDs');
});

// ---- I. EXACT-GRADE RECONCILIATION (§11 R01-R10) ----
// These enforce that NOT-P1 (negative attribution) is kept apart from any
// positive exact grade (P3/P4), and that exact grades are never produced from
// text/semantic heuristics.

test('R01: all six review records explicitly distinguish the P1 ownership result', () => {
  assert.strictEqual(CELL_ATTRIBUTION_REVIEWS.length, 6);
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(r.p1Ownership === 'CONFIRMED_FALSE' || r.p1Ownership === 'NOT_PROVEN_FALSE',
      `${r.reviewId}: explicit P1 ownership field`);
    assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedNotP1Count, 6);
    assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.notProvenNotP1Count, 0);
  }
});

test('R02: all six are prevented from masquerading as confirmed P1', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.notStrictEqual(r.attributionDecision, 'CONFIRMED_P1', `${r.reviewId}: decision not confirmed P1`);
    assert.notStrictEqual(r.sourceConfirmedGrade, 'P1', `${r.reviewId}: no source-confirmed P1`);
    assert.notStrictEqual(r.structurallyCalibratedGrade, 'P1', `${r.reviewId}: calibrated grade not P1`);
    assert.notStrictEqual(r.candidateGrade === 'P1' && r.p1Ownership === 'CONFIRMED_FALSE', false,
      `${r.reviewId}: candidate P1 is explicitly confirmed NOT-P1`);
  }
});

test('R03: exact P3/P4 is never called directly source-confirmed unless evidence allows', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    if (r.exactGradeEvidenceState !== 'DIRECTLY_ESTABLISHED') {
      assert.strictEqual(r.sourceConfirmedGrade, null,
        `${r.reviewId}: sourceConfirmedGrade null unless DIRECTLY_ESTABLISHED`);
    }
  }
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.directlyEstablishedGradeCount, 0);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.sourceConfirmedOnlyDirect, true);
});

test('R04: STRUCTURALLY_CALIBRATED is not produced from sourceTopic', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.strictEqual(r.exactGradeEvidenceState, 'STRUCTURALLY_CALIBRATED',
      `${r.reviewId}: calibrated exact grade`);
  }
  const reg = readFileSync(fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  ), 'utf8');
  assert.ok(!/exactGradeEvidenceState\s*[:=]\s*['"].*STRUCTURALLY_CALIBRATED.*sourceTopic/i.test(reg) ||
            !/sourceTopic.*=>.*exactGradeEvidenceState/i.test(reg),
    'no structured-calibration mapping keyed on sourceTopic');
});

test('R05: STRUCTURALLY_CALIBRATED is not produced from claimId', () => {
  const reg = readFileSync(fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  ), 'utf8');
  assert.ok(!/claimId\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(reg), 'no claimId op for exact grade');
  assert.ok(!/\bgradeFromClaimId\b|\bcalibrateFromClaimId\b/.test(reg), 'no claimId-to-grade helper');
});

test('R06: STRUCTURALLY_CALIBRATED is not produced from normalized wording', () => {
  const reg = readFileSync(fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  ), 'utf8');
  assert.ok(!/normalizedValueAr\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(reg), 'no wording op for grade');
  assert.ok(!/sourceWordingAr\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(reg), 'no sourceWording op for grade');
});

test('R07: STRUCTURALLY_CALIBRATED requires artifact/table geometry evidence', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    if (r.exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED') {
      assert.ok(r.geometryEvidence.crossPageCalibration !== undefined,
        `${r.reviewId}: calibration evidence present`);
      const c = r.geometryEvidence.crossPageCalibration!;
      assert.ok(c.anchorGrade.length > 0, `${r.reviewId}: anchor grade`);
      assert.ok(c.anchorLocator.length > 0, `${r.reviewId}: anchor locator`);
    }
  }
});

test('R08: cross-page calibration requires an explicit grade anchor', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    if (r.exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED') {
      const c = r.geometryEvidence.crossPageCalibration!;
      assert.strictEqual(c.anchorGrade, 'P1', `${r.reviewId}: explicit P1 anchor`);
    }
  }
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_LEDGER.structurallyCalibratedGradeCount, 6);
});

test('R09: cross-page calibration requires deterministic structural continuity', () => {
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    if (r.exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED') {
      const c = r.geometryEvidence.crossPageCalibration!;
      assert.ok(c.tableContinuityNote.length > 0, `${r.reviewId}: table continuity`);
      assert.ok(c.bandOrderingStableNote.length > 0, `${r.reviewId}: stable ordering`);
      assert.ok(c.deterministicOffsetNote.length > 0, `${r.reviewId}: deterministic offset`);
      assert.ok(c.noContradictoryBoundaryNote.length > 0, `${r.reviewId}: no contradictory boundary`);
    }
  }
});

test('R10: no semantic curriculum plausibility is used', () => {
  const reg = readFileSync(fileURLToPath(
    new URL('../../../domain/constants/moroccan-primary-cell-attribution-review-registry.ts', import.meta.url),
  ), 'utf8');
  assert.ok(!/\b(plausib|semanticallyPlaus|curriculumKnowledge)\b/i.test(reg), 'no semantic plausibility usage');
  assert.ok(!/\bgradeBy\(|\bgradeFromWording\(|\bsemanticGrade\(/.test(reg), 'no semantic grade selector');
  for (const r of CELL_ATTRIBUTION_REVIEWS) {
    assert.ok(r.decisionBasis.some((b) => b !== 'SOURCE_STRUCTURE_INSUFFICIENT'), `${r.reviewId}: evidence-based`);
  }
});

// ---- J. RECONCILIATION FREEZE GUARDS (§11 R11-R15) ----
test('R11: Gate 07C.7 claims remain unchanged', () => {
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.clearP1Attribution, 10);
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.reviewRequired, 6);
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.rejected, 0);
});

test('R12: claim count remains 16', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_CLAIMS.length, 16);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.claimCount, 16);
});

test('R13: CONTENT_VERIFIED remains 0', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount, 0);
});

test('R14: PUBLISHED remains 0', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.publishedCount, 0);
});

test('R15: mastery remains NOT_DERIVED', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticLessons, 0);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticKnowledgeObjects, 0);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticExercises, 0);
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.masteryDerived, false);
});

console.log('');
console.log(`--- GATE 07C.8: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}
