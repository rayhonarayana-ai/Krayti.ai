/**
 * Qarayti.ai - Gate 07C.6.2A: Selective Arabic Text Recovery Pipeline helpers
 *
 * Pure classification helpers backing the recovery readiness registry and the
 * K01-K32 test suite. No artifact path, no secrets, no guessing at Arabic.
 *
 * These helpers operate on per-page METRICS (mbundance + distribution) already
 * measured from the artifact; they never reconstruct a lost glyph from an
 * expected word.
 */

import type {
  ArtifactScriptReadability,
  ArtifactTextExtractionStatus,
  ArtifactTableGeometryClass,
  ArtifactOcrQuality,
  ArtifactOcrClassification,
  ArtifactResidualPageCategory,
  ArtifactSubjectReadinessState,
} from '../../domain/types/curriculum-source-governance.types';

/**
 * Body-aware page classification. The running Arabic header of every page of
 * this artifact carries 1-2 U+FFFD in the decorative word "الدرا�سي"; that
 * decorative header glyph loss does NOT block curriculum readiness (per gate
 * Section 14). Body FFFD (in curriculum prose) does.
 */
export function classifyPageByBodyMetrics(opts: {
  bodyArabic: number;
  bodyReplacementChars: number;
  bodyPua: number;
  latin: number;
}): ArtifactTextExtractionStatus {
  const { bodyArabic, bodyReplacementChars, bodyPua, latin } = opts;
  if (bodyArabic <= 0 && latin > 300) return 'FRENCH_ONLY';
  if (bodyArabic <= 0 && bodyPua <= 1 && latin < 300) return 'EMPTY';
  if (bodyPua > 20) return 'PUA_BLOCKED';
  if (bodyReplacementChars > 0 && bodyArabic > 80) return 'PARTIAL';
  if (bodyReplacementChars > 0) return 'PARTIAL';
  return 'CLEAN';
}

/** A page is curriculum-text-ready only if its body Arabic has no unresolved
 *  glyph loss (replacement char or PUA). Decorative header loss is ignored. */
export function isBodyTextReady(opts: {
  bodyArabic: number;
  bodyReplacementChars: number;
  bodyPua: number;
}): boolean {
  return opts.bodyArabic > 0 && opts.bodyReplacementChars === 0 && opts.bodyPua === 0;
}

/**
 * Reading order is only declared correct where actually observed for a clean
 * Arabic page; partial body keeps PARTIAL.
 */
export function readabilityForBody(bodyReplacementChars: number): ArtifactScriptReadability {
  if (bodyReplacementChars === 0) return 'UNICODE_CORRECT_ORDER_CORRECT';
  return 'PARTIAL';
}

/**
 * Deterministic geometric table rebuild from text-item coordinates.
 * Items are clustered into rows by baseline y (tolerance) and into columns by
 * x within a row. This recovers the HEADER ROW / ROW ORDER / COLUMNS without
 * OCR and without inventing cell semantics. When x-clustering is ambiguous
 * (two items in a row overlap width) the association is marked ambiguous.
 */
export interface TextItemLike {
  str?: string;
  transform?: number[]; // [.. 4=x, 5=y]
  height?: number;
  width?: number;
}

export interface TableGeometryResult {
  rows: number;
  minColumns: number;
  maxColumns: number;
  headerCandidateCount: number;
  ambiguous: boolean;
  tableClass: ArtifactTableGeometryClass;
}

export function rebuildTableGeometry(
  items: TextItemLike[],
  xTolerance = 6,
  yTolerance = 4,
): TableGeometryResult {
  const positioned = items
    .filter((it) => it.str && it.str.length > 0 && it.transform)
    .map((it) => ({
      x: it.transform![4],
      y: it.transform![5],
      w: it.width || 0,
      s: it.str as string,
    }));

  if (positioned.length === 0) {
    return { rows: 0, minColumns: 0, maxColumns: 0, headerCandidateCount: 0, ambiguous: false, tableClass: 'TABLE_UNREADABLE' };
  }

  // Order rows by y descending (PDF y grows upward from baseline).
  const sorted = [...positioned].sort((a, b) => b.y - a.y);
  const rows: number[][] = [];
  let currentRowY: number | null = null;
  let row: number[] = [];
  for (const it of sorted) {
    if (currentRowY === null || Math.abs(it.y - currentRowY) <= yTolerance) {
      if (currentRowY === null) currentRowY = it.y;
      row.push(positioned.indexOf(it));
    } else {
      rows.push(row);
      row = [positioned.indexOf(it)];
      currentRowY = it.y;
    }
  }
  if (row.length > 0) rows.push(row);

  let ambiguous = false;
  let minColumns = Infinity;
  let maxColumns = 0;
  for (const r of rows) {
    const inRow = r.map((i) => positioned[i]).sort((a, b) => a.x - b.x);
    if (inRow.length === 0) continue;
    // overlap check within the row
    for (let i = 1; i < inRow.length; i++) {
      const prev = inRow[i - 1];
      const cur = inRow[i];
      if (cur.x < prev.x + prev.w - xTolerance) { ambiguous = true; break; }
    }
    minColumns = Math.min(minColumns, inRow.length);
    maxColumns = Math.max(maxColumns, inRow.length);
  }
  if (minColumns === Infinity) minColumns = 0;

  const headerCandidateCount = rows.length > 0 ? rows[0].length : 0;
  const tableClass: ArtifactTableGeometryClass =
    ambiguous ? 'TABLE_PARTIAL' : 'TABLE_STRUCTURED_DIGITAL';

  return { rows: rows.length, minColumns, maxColumns, headerCandidateCount, ambiguous, tableClass };
}

// ============================================================
// GATE 07C.6.2B — TARGETED OCR / PAGE RECOVERY helpers
// ============================================================

/** OCR quality state (Section 11). Evidence-based from rendered-page metrics,
 *  never from expected-word agreement. */
export function classifyOcrQuality(opts: {
  arabicCodepoints: number;
  replacementChars: number;
  latinCodepoints: number;
  lines: number;
  reviewRequired: boolean;
}): ArtifactOcrQuality {
  if (opts.lines === 0 && opts.arabicCodepoints === 0 && opts.replacementChars === 0) return 'OCR_FAILED';
  if (opts.replacementChars > 0 || opts.lines === 0) return 'OCR_UNRELIABLE';
  if (opts.arabicCodepoints < 40) return 'OCR_PARTIAL';
  if (opts.reviewRequired) return 'OCR_USABLE_WITH_REVIEW';
  return 'OCR_HIGH_CONFIDENCE';
}

/** A page routed through OCR is NEVER classified DIRECT_DIGITAL (Section 7). */
export function classifyOcrClassification(digitalTextPresent: boolean): ArtifactOcrClassification {
  return digitalTextPresent ? 'DIGITAL_WITH_OCR_RECOVERY' : 'OCR_EXTRACTED';
}

/** Residual bucket (Section 3): explicit, no silent omission. */
export function classifyResidualCategory(opts: {
  curriculumRelevant: boolean;
  isGlossaryReference: boolean;
  isEmpty: boolean;
  isDecorAdmin: boolean;
}): ArtifactResidualPageCategory {
  if (opts.isEmpty) return 'EMPTY';
  if (opts.isDecorAdmin) return 'DECORATIVE_ADMIN_BLOCKED';
  if (opts.isGlossaryReference) return 'GLOSSARY_REFERENCE_BLOCKED';
  if (opts.curriculumRelevant) return 'CURRICULUM_RELEVANT_BLOCKED';
  return 'NON_CURRICULUM_BLOCKED';
}

/** A page blocks curriculum readiness only if curriculum-relevant and not
 *  recovered (Section 15/16). */
export function decideBlocking(curriculumRelevant: boolean, ocrRecovered: boolean): boolean {
  return curriculumRelevant && !ocrRecovered;
}

/** Subject readiness (Section 17). */
export function subjectReadiness(opts: {
  digitalReady: boolean;
  ocrRecovered: boolean;
  indexed: boolean;
}): ArtifactSubjectReadinessState {
  if (!opts.indexed) return 'NOT_YET_INDEXED';
  if (opts.digitalReady && !opts.ocrRecovered) return 'READY_DIGITAL';
  if (opts.ocrRecovered) return 'READY_HYBRID';
  return 'BLOCKED';
}
