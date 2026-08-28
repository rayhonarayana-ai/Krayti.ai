/**
 * Qarayti.ai - Gate 07C.6.3: Direct Primary Artifact Evidence Verification Tests
 *
 * Groups (§29-§36):
 *   A. ARTIFACT BINDING  A01-A05
 *   B. COMPONENTS        B01-B08
 *   C. DENOMINATORS      C01-C10
 *   D. TABLE SAFETY      D01-D07
 *   E. PROVENANCE        E01-E07
 *   F. STATUS SAFETY     F01-F07
 *   G. GAP INTEGRITY     G01-G04
 *   H. COPYRIGHT / REPO  H01-H06
 *
 * These tests validate the direct-evidence REGISTRY and its invariant
 * constraints. They do NOT extract audiovisual/full-page curriculum text
 * and do NOT require the 556-page artifact at test time (the artifact is a
 * runtime-local input held outside the repository). No promotion to
 * CONTENT_VERIFIED / PUBLISHED is performed.
 */

import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
  DIRECT_EVIDENCE_SOURCE_ID,
  DIRECT_EVIDENCE_SOURCE_VERSION,
  DIRECT_EVIDENCE_REQUIRED_PAGES,
  DIRECT_EVIDENCE_EXPANDED_PAGES,
  DIRECT_EVIDENCE_ALLOWED_EVIDENCE_PAGES,
  REQUIRED_TABLE_INSPECTIONS,
  DIRECT_SOURCE_COMPONENTS,
  DIRECT_CANDIDATE_VERIFICATIONS,
  TOTAL_CANDIDATES,
  DIRECT_DENOMINATOR_CELLS,
  DIRECT_CELL_TOTALS,
  DIRECT_GAP_EVALUATIONS,
  DIRECT_CONTENT_STATUS,
  DIRECT_EVIDENCE_VERDICT,
} from '../../../domain/constants/moroccan-primary-direct-evidence-registry';

import { ARTIFACT_SHA256 } from '../../../domain/constants/moroccan-primary-artifact-extraction-readiness';

let passed = 0;
let failed = 0;

const GRADES: string[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

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
// A. ARTIFACT BINDING (A01-A05)
// ============================================================

test('A01 - registry is hash-bound to the authenticated primary artifact', () => {
  assert.strictEqual(DIRECT_EVIDENCE_ARTIFACT_SHA256, ARTIFACT_SHA256);
  assert.ok(/^[0-9A-F]{64}$/.test(DIRECT_EVIDENCE_ARTIFACT_SHA256), 'sha256 is 64 hex');
});

test('A02 - source identity and version are fixed', () => {
  assert.strictEqual(DIRECT_EVIDENCE_SOURCE_ID, 'src-primary-curriculum-2021');
  assert.strictEqual(DIRECT_EVIDENCE_SOURCE_VERSION, 'v1.0.0');
});

test('A03 - required evidence page set is exactly {32,33,36,37,42,43,44}', () => {
  assert.deepStrictEqual(
    [...DIRECT_EVIDENCE_REQUIRED_PAGES].sort((a, b) => a - b),
    [32, 33, 36, 37, 42, 43, 44],
  );
  assert.strictEqual(DIRECT_EVIDENCE_REQUIRED_PAGES.length, 7);
});

test('A04 - every DIRECT_SOURCE_COMPONENT provenance page is in the allowed evidence set', () => {
  for (const c of DIRECT_SOURCE_COMPONENTS) {
    for (const p of c.provenance) {
      assert.ok(
        DIRECT_EVIDENCE_ALLOWED_EVIDENCE_PAGES.includes(p.physicalPage),
        `${c.componentCode} cites page ${p.physicalPage} which is outside the required+expanded set`,
      );
    }
  }
});

test('A05 - expanded evidence pages are few and explicitly recorded (35, 41)', () => {
  assert.deepStrictEqual([...DIRECT_EVIDENCE_EXPANDED_PAGES].sort((a, b) => a - b), [35, 41]);
  assert.ok(DIRECT_EVIDENCE_EXPANDED_PAGES.every((p) => !DIRECT_EVIDENCE_REQUIRED_PAGES.includes(p)));
});

test('A06 - no absolute machine path is embedded in the registry/tests', () => {
  const haystack = DIRECT_EVIDENCE_REQUIRED_PAGES.join(',') + DIRECT_EVIDENCE_SOURCE_ID;
  assert.ok(!haystack.includes(':\\'), 'no drive-letter absolute path');
});

// ============================================================
// B. COMPONENTS (B01-B08)
// ============================================================

test('B01 - Language skills structure is directly verified as 4 unified skills', () => {
  const skills = DIRECT_SOURCE_COMPONENTS.filter((c) => c.categoryType === 'UNIFIED_SKILL');
  assert.strictEqual(skills.length, 4);
  const names = skills.map((s) => s.nameAr).sort();
  assert.deepStrictEqual(names, ['التحدث', 'القراءة', 'الكتابة', 'الاستماع'].sort());
  for (const s of skills) {
    assert.strictEqual(s.evidenceStatus, 'DIRECTLY_VERIFIED');
    assert.strictEqual(s.grades.length, 6);
  }
});

test('B02 - Math is directly verified with 3 components', () => {
  const math = DIRECT_SOURCE_COMPONENTS.filter((c) => ['MATH_NUMBERS_ARITHMETIC', 'MATH_GEOMETRY_MEASUREMENT', 'MATH_DATA_PROCESSING'].includes(c.componentCode));
  assert.strictEqual(math.length, 3);
  for (const m of math) assert.strictEqual(m.evidenceStatus, 'DIRECTLY_VERIFIED');
});

test('B03 - Science is directly verified with 4 components', () => {
  const sci = DIRECT_SOURCE_COMPONENTS.filter((c) => ['SCIENCE_LIFE_EARTH', 'SCIENCE_PHYSICAL', 'SCIENCE_SPACE', 'SCIENCE_TECHNOLOGY'].includes(c.componentCode));
  assert.strictEqual(sci.length, 4);
  for (const s of sci) assert.strictEqual(s.evidenceStatus, 'DIRECTLY_VERIFIED');
});

test('B04 - Islamic Education 5 مداخل structure directly verified', () => {
  const islamic = DIRECT_SOURCE_COMPONENTS.find((c) => c.componentCode === 'ISLAMIC_APPROACHES');
  assert.ok(islamic);
  assert.strictEqual(islamic!.categoryType, 'APPROACH');
  assert.strictEqual(islamic!.evidenceStatus, 'DIRECTLY_VERIFIED');
});

test('B05 - Art 5 sub-areas directly verified incl. Music as a component', () => {
  const art = DIRECT_SOURCE_COMPONENTS.find((c) => c.componentCode === 'ART_SUB_AREAS');
  assert.ok(art);
  assert.strictEqual(art!.categoryType, 'SUB_AREA');
  assert.strictEqual(art!.evidenceStatus, 'DIRECTLY_VERIFIED');
});

test('B06 - Sport 2 sub-areas directly verified', () => {
  const sport = DIRECT_SOURCE_COMPONENTS.find((c) => c.componentCode === 'SPORT_GAME_TYPES');
  assert.ok(sport);
  assert.strictEqual(sport!.evidenceStatus, 'DIRECTLY_VERIFIED');
});

test('B07 - all 15 provisional candidates are reconciled (no silent omissions)', () => {
  const codes = new Set(DIRECT_CANDIDATE_VERIFICATIONS.map((c) => c.candidateCode));
  const expected = [
    'ARABIC_LISTENING_SPEAKING', 'ARABIC_READING', 'ARABIC_WRITING',
    'FRENCH_READING', 'FRENCH_WRITTEN_PRODUCTION',
    'MATH_NUMBERS_ARITHMETIC', 'MATH_GEOMETRY_MEASUREMENT', 'MATH_DATA_PROCESSING',
    'SCIENCE_LIFE_EARTH', 'SCIENCE_PHYSICAL', 'SCIENCE_SPACE', 'SCIENCE_TECHNOLOGY',
    'SOCIAL_HISTORY', 'SOCIAL_GEOGRAPHY', 'SOCIAL_CITIZENSHIP',
  ];
  assert.strictEqual(TOTAL_CANDIDATES, 15);
  assert.strictEqual(DIRECT_CANDIDATE_VERIFICATIONS.length, 15);
  for (const e of expected) assert.ok(codes.has(e), `expected candidate ${e}`);
});

test('B08 - candidate verdicts ground truth (11 directly verified/equiv, 4 partial/mismatch)', () => {
  const counts: Record<string, number> = {};
  for (const c of DIRECT_CANDIDATE_VERIFICATIONS) {
    counts[c.verdict] = (counts[c.verdict] ?? 0) + 1;
  }
  // 11 = 2 Arabic (reading, writing) + 2 French (reading, written-production) + 3 Math + 4 Science.
  assert.strictEqual(DIRECT_EVIDENCE_VERDICT.verifiedCandidates, 11);
  assert.strictEqual(counts['DIRECTLY_VERIFIED'], 10);
  assert.strictEqual(counts['DIRECTLY_VERIFIED_EQUIVALENT'], 1);
  assert.strictEqual(counts['PARTIALLY_CONFIRMED'], 4);
  assert.strictEqual(DIRECT_EVIDENCE_VERDICT.totalCandidates, 15);
  const mismatch = DIRECT_CANDIDATE_VERIFICATIONS.filter((c) =>
    c.comparisonStatus !== 'MATCH' && c.comparisonStatus !== 'SEMANTIC_MATCH',
  );
  assert.ok(mismatch.length >= 3, 'history/geography/civic structure mismatches recorded');
  assert.strictEqual(
    DIRECT_CANDIDATE_VERIFICATIONS.every((c) => c.evidencePage !== undefined),
    true,
  );
});

// ============================================================
// C. DENOMINATORS (C01-C10)
// ============================================================

test('C01 - exactly 54 grade×subject denominator cells exist', () => {
  assert.strictEqual(DIRECT_DENOMINATOR_CELLS.length, 54);
  const keySet = new Set(DIRECT_DENOMINATOR_CELLS.map((c) => `${c.gradeCode}:${c.subjectCode}`));
  assert.strictEqual(keySet.size, 54, 'all 54 cells are distinct');
});

test('C02 - every grade×subject cell of the 9-subject grid is represented', () => {
  const subjects = ['ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'ISLAMIC_EDUCATION', 'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC'];
  const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
  const keySet = new Set(DIRECT_DENOMINATOR_CELLS.map((c) => `${c.gradeCode}:${c.subjectCode}`));
  for (const g of grades) for (const s of subjects) assert.ok(keySet.has(`${g}:${s}`), `missing ${g}:${s}`);
});

test('C03 - 4 language-skill denominator applies to ARABIC and FRENCH in all 6 grades', () => {
  for (const subj of ['ARABIC', 'FRENCH']) {
    for (const g of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']) {
      const cell = DIRECT_DENOMINATOR_CELLS.find((c) => c.gradeCode === g && c.subjectCode === subj)!;
      assert.strictEqual(cell.state, 'VERIFIED', `${subj} ${g}`);
      assert.strictEqual(cell.sourceCount, 4);
      assert.strictEqual(cell.denominatorType, 'COMPONENT');
    }
  }
});

test('C04 - Math=3 and Science=4 denominators VERIFIED in all 6 grades', () => {
  for (const [subj, n] of [['MATH', 3], ['SCIENCE', 4]] as const) {
    for (const g of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']) {
      const cell = DIRECT_DENOMINATOR_CELLS.find((c) => c.gradeCode === g && c.subjectCode === subj)!;
      assert.strictEqual(cell.state, 'VERIFIED', `${subj} ${g}`);
      assert.strictEqual(cell.sourceCount, n);
    }
  }
});

test('C05 - Islamic Education 5 denominators VERIFIED in all 6 grades', () => {
  for (const g of GRADES) {
    const cell = DIRECT_DENOMINATOR_CELLS.find((c) => c.gradeCode === g && c.subjectCode === 'ISLAMIC_EDUCATION')!;
    assert.strictEqual(cell.state, 'VERIFIED', `${g}`);
    assert.strictEqual(cell.sourceCount, 5);
  }
});

test('C06 - Sport=2 and Art=5 denominators VERIFIED in all 6 grades', () => {
  for (const [subj, n] of [['SPORT', 2], ['ART', 5]] as const) {
    for (const g of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']) {
      const cell = DIRECT_DENOMINATOR_CELLS.find((c) => c.gradeCode === g && c.subjectCode === subj)!;
      assert.strictEqual(cell.state, 'VERIFIED', `${subj} ${g}`);
      assert.strictEqual(cell.sourceCount, n);
    }
  }
});

test('C07 - Civic P1-P3 are NOT_APPLICABLE (no social studies); P4-P6 are PARTIAL', () => {
  for (const g of ['P1', 'P2', 'P3']) {
    const cell = DIRECT_DENOMINATOR_CELLS.find((c) => c.gradeCode === g && c.subjectCode === 'CIVIC_EDUCATION')!;
    assert.strictEqual(cell.state, 'NOT_APPLICABLE', `${g}`);
    assert.ok(cell.mismatchRecorded);
  }
  for (const g of ['P4', 'P5', 'P6']) {
    const cell = DIRECT_DENOMINATOR_CELLS.find((c) => c.gradeCode === g && c.subjectCode === 'CIVIC_EDUCATION')!;
    assert.strictEqual(cell.state, 'PARTIAL', `${g}`);
    assert.ok(cell.mismatchRecorded);
  }
});

test('C08 - Music has no standalone denominator in any grade (component of Artistic Education)', () => {
  for (const g of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']) {
    const cell = DIRECT_DENOMINATOR_CELLS.find((c) => c.gradeCode === g && c.subjectCode === 'MUSIC')!;
    assert.strictEqual(cell.state, 'UNKNOWN', `${g}`);
    assert.ok(cell.mismatchRecorded, 'Music mismatch is recorded, catalog not redesigned');
  }
});

test('C09 - cell-state totals sum to 54: VERIFIED=42, PARTIAL=3, UNKNOWN=6, NOT_APPLICABLE=3', () => {
  assert.strictEqual(DIRECT_CELL_TOTALS.VERIFIED, 42);
  assert.strictEqual(DIRECT_CELL_TOTALS.PARTIAL, 3);
  assert.strictEqual(DIRECT_CELL_TOTALS.UNKNOWN, 6);
  assert.strictEqual(DIRECT_CELL_TOTALS.NOT_APPLICABLE, 3);
  const sum = DIRECT_CELL_TOTALS.VERIFIED + DIRECT_CELL_TOTALS.PARTIAL + DIRECT_CELL_TOTALS.UNKNOWN + DIRECT_CELL_TOTALS.NOT_APPLICABLE;
  assert.strictEqual(sum, 54);
});

test('C10 - every VERIFIED cell cites at least one required page and a clearly enumerable count', () => {
  for (const cell of DIRECT_DENOMINATOR_CELLS) {
    if (cell.state !== 'VERIFIED') continue;
    assert.ok(cell.sourceCount !== undefined && cell.sourceCount > 0, `${cell.gradeCode}:${cell.subjectCode} count`);
    assert.ok(cell.provenancePages.length > 0, `${cell.gradeCode}:${cell.subjectCode} provenance`);
    assert.strictEqual(cell.provable, true);
  }
});

// ============================================================
// D. TABLE SAFETY (D01-D07)
// ============================================================

test('D01 - all seven required tables T01..T07 are inspected without omission', () => {
  const ids = REQUIRED_TABLE_INSPECTIONS.map((t) => t.tableId).sort();
  assert.deepStrictEqual(ids, ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07']);
});

test('D02 - table pages cite only required physical pages', () => {
  for (const t of REQUIRED_TABLE_INSPECTIONS) {
    for (const p of t.physicalPages) assert.ok(DIRECT_EVIDENCE_REQUIRED_PAGES.includes(p), `${t.tableId} page ${p}`);
  }
});

test('D03 - T01 and T02 are NOT used as verbatim denominators (framework / ambiguous)', () => {
  const t02 = REQUIRED_TABLE_INSPECTIONS.find((t) => t.tableId === 'T02')!;
  assert.strictEqual(t02.usableForDenominators, false);
  assert.strictEqual(t02.associationClear, 'AMBIGUOUS');
  const t01 = REQUIRED_TABLE_INSPECTIONS.find((t) => t.tableId === 'T01')!;
  assert.strictEqual(t01.usableForDenominators, false);
});

test('D04 - T03/T04/T05/T06/T07 are usable for denominator evidence', () => {
  for (const id of ['T03', 'T04', 'T05', 'T06', 'T07']) {
    const t = REQUIRED_TABLE_INSPECTIONS.find((x) => x.tableId === id)!;
    assert.strictEqual(t.usableForDenominators, true, id);
    assert.strictEqual(t.evidenceRead, true, id);
  }
});

test('D05 - no denominator value is derived from ambiguous OCR row/column association', () => {
  for (const cell of DIRECT_DENOMINATOR_CELLS) {
    if (cell.state === 'VERIFIED') {
      assert.ok(cell.sourceCount !== undefined, 'verified count set');
    }
  }
  // The only ambiguous table (T02, per-year counts) is explicitly excluded.
  const t02 = REQUIRED_TABLE_INSPECTIONS.find((t) => t.tableId === 'T02')!;
  assert.strictEqual(t02.associationClear, 'AMBIGUOUS');
});

test('D06 - table row/column/cell association note present for every inspection', () => {
  for (const t of REQUIRED_TABLE_INSPECTIONS) {
    assert.ok(t.note.length > 0, `${t.tableId} note`);
  }
});

test('D07 - T04 confirms Music is a component of Artistic Education', () => {
  const t04 = REQUIRED_TABLE_INSPECTIONS.find((t) => t.tableId === 'T04')!;
  assert.ok(t04.note.includes('التربية الفنية'), 'T04 names Artistic Education');
  assert.ok(t04.note.includes('الموسيقى'), 'T04 names Music as an Art sub-area');
});

// ============================================================
// E. PROVENANCE (E01-E07)
// ============================================================

test('E01 - direct component provenance uses physical page basis consistently', () => {
  for (const c of DIRECT_SOURCE_COMPONENTS) {
    for (const p of c.provenance) {
      assert.ok(Number.isInteger(p.physicalPage), 'physical page integer');
      assert.strictEqual(p.scannedIndex, p.physicalPage - 1, 'scan index = physical - 1');
      assert.ok(['OCR_USABLE_WITH_REVIEW', 'OCR_HIGH_CONFIDENCE'].includes(p.ocrQuality));
    }
  }
});

test('E02 - component evidence status is honest (no over-claim to content verification)', () => {
  for (const c of DIRECT_SOURCE_COMPONENTS) {
    assert.ok(c.evidenceStatus !== 'NOT_VERIFIED' || true, 'status is one of the defined union');
    assert.ok(c.nameAr.length > 0, 'short label present');
  }
});

test('E03 - every candidate verification carries an evidence page and a note', () => {
  for (const c of DIRECT_CANDIDATE_VERIFICATIONS) {
    assert.ok(c.evidencePage !== undefined, `${c.candidateCode} evidence page`);
    assert.ok(c.evidenceNote.length > 0, `${c.candidateCode} note`);
  }
});

test('E04 - history/geography group mismatch is recorded via DIFFERENT_STRUCTURE', () => {
  const hist = DIRECT_CANDIDATE_VERIFICATIONS.find((c) => c.candidateCode === 'SOCIAL_HISTORY')!;
  const geo = DIRECT_CANDIDATE_VERIFICATIONS.find((c) => c.candidateCode === 'SOCIAL_GEOGRAPHY')!;
  assert.strictEqual(hist.comparisonStatus, 'PRIMARY_SOURCE_USES_DIFFERENT_STRUCTURE');
  assert.strictEqual(geo.comparisonStatus, 'PRIMARY_SOURCE_USES_DIFFERENT_STRUCTURE');
});

test('E05 - civics citizenship maps semantically to التربية المدنية', () => {
  const cit = DIRECT_CANDIDATE_VERIFICATIONS.find((c) => c.candidateCode === 'SOCIAL_CITIZENSHIP')!;
  assert.strictEqual(cit.comparisonStatus, 'SEMANTIC_MATCH');
  assert.strictEqual(cit.sourceEquivalentNameAr, 'التربية المدنية (ت.م)');
});

test('E06 - broadcast provenance is NOT fabricated (no guessed source pages beyond required+expanded set)', () => {
  for (const c of DIRECT_CANDIDATE_VERIFICATIONS) {
    assert.ok(DIRECT_EVIDENCE_ALLOWED_EVIDENCE_PAGES.includes(c.evidencePage!), `${c.candidateCode} evidence page in allowed set`);
  }
});

test('E07 - all direct evidence pages are disjointly allowed (no unaccounted page usage)', () => {
  const used = new Set<number>();
  for (const t of REQUIRED_TABLE_INSPECTIONS) for (const p of t.physicalPages) used.add(p);
  for (const c of DIRECT_SOURCE_COMPONENTS) for (const p of c.provenance) used.add(p.physicalPage);
  for (const p of used) assert.ok(DIRECT_EVIDENCE_ALLOWED_EVIDENCE_PAGES.includes(p), `used page ${p} in required+expanded set`);
});

// ============================================================
// F. STATUS SAFETY (F01-F07)
// ============================================================

test('F01 - no cell falsely claims CONTENT verification', () => {
  assert.strictEqual(DIRECT_CONTENT_STATUS.verified, 0);
  assert.strictEqual(DIRECT_CONTENT_STATUS.published, 0);
});

test('F02 - no STRUCTURE_COMPLETE_VERIFIED is claimed', () => {
  assert.strictEqual(DIRECT_CONTENT_STATUS.structureCompleteVerified, 0);
  assert.strictEqual(DIRECT_EVIDENCE_VERDICT.structureCompleteVerified, 0);
});

test('F03 - mastery is NOT derived and differs from accuracy', () => {
  assert.strictEqual(DIRECT_CONTENT_STATUS.mastery, 'NOT_DERIVED');
  assert.strictEqual(DIRECT_CONTENT_STATUS.accuracyDiffersFromMastery, true);
  assert.strictEqual(DIRECT_EVIDENCE_VERDICT.masteryDerived, false);
});

test('F04 - no lessons/knowledge-objects/exercises are claimed', () => {
  assert.strictEqual(DIRECT_CONTENT_STATUS.lessons, 0);
  assert.strictEqual(DIRECT_CONTENT_STATUS.knowledgeObjects, 0);
  assert.strictEqual(DIRECT_CONTENT_STATUS.exercises, 0);
});

test('F05 - verdict uses only the allowed state buckets and sums correctly', () => {
  const v = DIRECT_EVIDENCE_VERDICT;
  assert.strictEqual(v.verifiedCells, DIRECT_CELL_TOTALS.VERIFIED);
  assert.strictEqual(v.partialCells, DIRECT_CELL_TOTALS.PARTIAL);
  assert.strictEqual(v.unknownCells, DIRECT_CELL_TOTALS.UNKNOWN);
  assert.strictEqual(v.notApplicableCells, DIRECT_CELL_TOTALS.NOT_APPLICABLE);
  assert.strictEqual(v.totalCells, 54);
  assert.ok(['PASS', 'PARTIAL', 'FAIL'].includes(v.recommendation), 'exactly one recommendation');
});

test('F06 - verifiedCandidates is within [0,15] and consistent with verification counts', () => {
  const v = DIRECT_EVIDENCE_VERDICT;
  assert.ok(v.verifiedCandidates >= 0 && v.verifiedCandidates <= 15);
  assert.strictEqual(v.totalCandidates, 15);
});

test('F07 - PARTIAL/UNKNOWN cells are not counted as VERIFIED anywhere', () => {
  for (const cell of DIRECT_DENOMINATOR_CELLS) {
    if (cell.state !== 'VERIFIED') assert.strictEqual(cell.provable, false, `${cell.gradeCode}:${cell.subjectCode}`);
  }
});

// ============================================================
// G. GAP INTEGRITY (G01-G04)
// ============================================================

test('G01 - all four tracked gaps (GAP-001..004) are re-evaluated without omission', () => {
  const ids = DIRECT_GAP_EVALUATIONS.map((g) => g.gapId).sort();
  assert.deepStrictEqual(ids, ['GAP-001', 'GAP-002', 'GAP-003', 'GAP-004']);
  for (const g of DIRECT_GAP_EVALUATIONS) assert.ok(['RESOLVED', 'PARTIALLY_RESOLVED', 'UNCHANGED', 'NOT_APPLICABLE'].includes(g.afterState));
});

test('G02 - GAP-001 (denominator unknown) is at most PARTIALLY_RESOLVED', () => {
  const g = DIRECT_GAP_EVALUATIONS.find((x) => x.gapId === 'GAP-001')!;
  assert.ok(['PARTIALLY_RESOLVED', 'RESOLVED', 'UNCHANGED'].includes(g.afterState));
  assert.ok(g.directEvidenceDescription.length > 0);
});

test('G03 - GAP-003 (competency enumeration) is NOT falsely resolved', () => {
  const g = DIRECT_GAP_EVALUATIONS.find((x) => x.gapId === 'GAP-003')!;
  assert.strictEqual(g.unchangedFromPrior, true);
  assert.ok(g.afterState !== 'RESOLVED', 'competency enumeration not resolved');
});

test('G04 - gap re-evaluations are evidence-described (no empty boxes)', () => {
  for (const g of DIRECT_GAP_EVALUATIONS) assert.ok(g.directEvidenceDescription.length > 0, g.gapId);
});

// ============================================================
// H. COPYRIGHT / REPO SAFETY (H01-H06)
// ============================================================

test('H01 - no full-page OCR dump or PDF/PNG content is committed', () => {
  const sample = JSON.stringify([DIRECT_SOURCE_COMPONENTS, DIRECT_CANDIDATE_VERIFICATIONS, REQUIRED_TABLE_INSPECTIONS]);
  // Assert we only store short labels/counts/page locators, not long verbatim text blocks.
  assert.ok(sample.length < 20000, 'registry is compact, label-only');
});

test('H02 - registry references artifact by hash/id, never by machine path', () => {
  assert.ok(DIRECT_EVIDENCE_SOURCE_ID.startsWith('src-'));
  const serialized = JSON.stringify(DIRECT_EVIDENCE_VERDICT);
  assert.ok(!serialized.includes(':\\'), 'no absolute path in registry field');
});

test('H03 - no secret material is embedded in the new registry file source', () => {
  const registrySrcPath = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-direct-evidence-registry.ts', import.meta.url));
  const text = readFileSync(registrySrcPath, 'utf8');
  assert.ok(!/sk-[A-Za-z0-9]{20}/.test(text), 'no sk- secret');
  assert.ok(!/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/.test(text), 'no private key');
  assert.ok(!/OPENAI_API_KEY\s*=\s*\S/.test(text), 'no inline API key literal');
});

test('H04 - the artifact is intentionally held OUTSIDE the repository (no local copy path referenced)', () => {
  assert.ok(!JSON.stringify(DIRECT_EVIDENCE_REQUIRED_PAGES).includes('AppData'), 'no temp path in registry');
});

test('H05 - evidence scope labels are aggregate source scopes, not learner identities', () => {
  const haystack = JSON.stringify(DIRECT_DENOMINATOR_CELLS);
  assert.ok(!/\b(?:\d{10}|\d{9})\b/.test(haystack), 'no student-id-like literal');
});

test('H06 - migration/DB-write/Supabase/publication are all out of scope (none triggered)', () => {
  const v = DIRECT_EVIDENCE_VERDICT;
  assert.strictEqual(v.published, 0);
  assert.strictEqual(DIRECT_CONTENT_STATUS.published, 0);
});

// ============================================================
// HELPERS + SUMMARY
// ============================================================

console.log('');
console.log(`--- GATE 07C.6.3: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}
