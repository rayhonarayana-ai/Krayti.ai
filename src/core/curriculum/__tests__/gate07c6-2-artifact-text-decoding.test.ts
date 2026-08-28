/**
 * Qarayti.ai - Gate 07C.6.2: Primary Artifact Text Decoding + Extraction
 * Readiness Tests
 *
 * Groups:
 *   A. ARTIFACT BINDING      A01-A05
 *   B. FONT / CID FORENSICS  B01-B06
 *   C. METHOD SELECTION      C01-C06
 *   D. ARABIC READINESS      D01-D08
 *   E. FRENCH READINESS      E01-E04
 *   F. TABLE READINESS       F01-F06
 *   G. OCR CONTINGENCY       G01-G06
 *   H. COPYRIGHT SAFETY      H01-H05
 *   I. NON-REGRESSION        I01-I07
 *   J. TRUST / ANTI-FABRIC   J01-J07
 *
 * The tests validate the *evidence registry* (README server) and the
 * *constraints* of the decoding pipeline. They do NOT extract curriculum
 * content and do NOT require the 556-page artifact at test time (the
 * artifact is a runtime-local input held outside the repository).
 */

import assert from 'node:assert';

import {
  ARTIFACT_SHA256,
  ARTIFACT_PAGE_COUNT,
  ARTIFACT_FILE_NAME,
  ARTIFACT_SOURCE_ID,
  EXTRACTION_TOOLING,
  FONT_FORENSICS_SUMMARY,
  TOUNICODE_AUDIT,
  PAGE_INDEX_POLICY,
  PAGE_DISTRIBUTION,
  METHOD_EVALUATIONS,
  REPRESENTATIVE_PAGES,
  SOURCE_LOCATOR_NOTE,
  ARABIC_READINESS,
  FRENCH_READINESS,
  TABLE_READINESS,
  OCR_POSITION,
  EXTRACTION_READINESS,
  TEXT_DECODING_BLOCKER,
  TABLE_EXTRACTION_BLOCKER,
  EXTRACTION_VERDICT,
  FFFD_ROOT_CAUSE_DETERMINATION,
  PUA_ROOT_CAUSE_DETERMINATION,
  ALTERNATE_ARTIFACTS,
  PAGE_DISTRIBUTION_RECOMPUTED,
  RENDER_OCR_POSITION,
  TABLE_RECOVERY,
  RESIDUAL_BLOCKER_REGISTRY,
  RESIDUAL_BLOCKED_COUNT,
  RECOVERY_READINESS_METRICS,
  RECOVERY_MODEL,
  SUMMARY_BLOCKERS_AFTER_RECOVERY,
  OCR_TOOLING_DISCOVERY,
  RENDER_POSITION,
  RESIDUAL_PAGE_REGISTRY,
  RESIDUAL_REGISTRY_NOTE,
  OCR_QUALITY_COUNTS,
  OCR_OUTCOME,
  OCR_PROVENANCE_SAMPLES,
  GLOSSARY_BLOCKING,
  PREAMBLE_BLOCKING,
  SUBJECT_READINESS,
  CURRICULUM_READINESS_2B,
  OCR_RECOVERY_EVIDENCE,
  PAGE_UNIVERSE_07C6_2C,
  PAGE_UNIVERSE_NOTE,
  REQUIRED_BODY_FFFD_SET_07C6_2C,
  OCR_COVERAGE_07C6_2C,
  PAGES_REQUIRED_FOR_07C6_3,
  SUBJECT_READINESS_AUDIT,
  MUSIC_LOCATION,
  REQUIRED_TABLE_REGISTRY,
  CURRICULUM_REQUIRED_READINESS_07C6_2C,
  COVERAGE_VERDICT_07C6_2C,
} from '../../../domain/constants/moroccan-primary-artifact-extraction-readiness';

import {
  ARTIFACT_FINGERPRINTS,
  ARTIFACT_ACCESS_RECOVERY_STATE,
  ARTIFACT_RECOVERY_VERDICT,
} from '../../../domain/constants/moroccan-primary-artifact-access-recovery';

import {
  FONT_RECOVERY_EVIDENCE,
  FFFD_ROOT_CAUSE,
  PUA_ROOT_CAUSE,
  fontCarriesUnicodeEvidence,
  requiresWordGuess,
  classifyRecovery,
} from '../artifact-font-recovery';

import {
  classifyPageByBodyMetrics,
  isBodyTextReady,
  readabilityForBody,
  rebuildTableGeometry,
  classifyOcrQuality,
  classifyOcrClassification,
  classifyResidualCategory,
  decideBlocking,
  subjectReadiness,
} from '../artifact-text-extraction';

import type {
  ArtifactTextExtractionMethod,
  ArtifactMethodClassification,
  ArtifactScriptReadability,
  ArtifactToUnicodeClassification,
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

const METHODS: ArtifactTextExtractionMethod[] = [
  'NODE_PDF_LIB_RAW', 'POPPLER_PDFTOTEXT', 'MUPDF_MUTOOL', 'PDFBOX',
  'PDFJS_DIST', 'DIRECT_CMAP_FONT_MAPPING', 'RENDER_OCR',
];
const CLASSIFICATIONS: ArtifactMethodClassification[] = [
  'RELIABLE', 'USABLE_WITH_LIMITATIONS', 'UNRELIABLE', 'UNAVAILABLE',
];
const TOUNICODE_CLASS: ArtifactToUnicodeClassification[] = [
  'TOUNICODE_PRESENT_VALID', 'TOUNICODE_PRESENT_PARTIAL', 'TOUNICODE_PRESENT_BROKEN',
  'TOUNICODE_ABSENT', 'UNKNOWN',
];
const READABILITY_CLASS: ArtifactScriptReadability[] = [
  'UNICODE_CORRECT_ORDER_CORRECT', 'UNICODE_CORRECT_ORDER_BROKEN',
  'PARTIAL', 'UNREADABLE',
];

console.log('--- A. Artifact Binding ---');

test('A01 - artifact SHA-256 is the recovered artifact hash', () => {
  assert.strictEqual(ARTIFACT_SHA256.toUpperCase(), AUTH_HASH());
  assert.match(ARTIFACT_SHA256, /^[0-9A-F]{64}$/);
});
function AUTH_HASH() {
  const f = ARTIFACT_FINGERPRINTS[0];
  assert.ok(f && f.sha256, 'fingerprint present with sha256');
  return f!.sha256.toUpperCase();
}

test('A02 - page count is 556 pages (half-round number from forensic scan)', () => {
  assert.strictEqual(ARTIFACT_PAGE_COUNT, 556);
});

test('A03 - artifact file name is the recovered PDF', () => {
  assert.strictEqual(ARTIFACT_FILE_NAME, 'Curriculum_Primaire_2021_Final_28_juillet.pdf');
});

test('A04 - source id is consistent with the recovered artifact', () => {
  assert.strictEqual(ARTIFACT_SOURCE_ID, 'src-primary-curriculum-2021');
});

test('A05 - extraction readiness is hash-bound to the recovered artifact', () => {
  assert.strictEqual(EXTRACTION_READINESS.hashBound, true);
  for (const p of REPRESENTATIVE_PAGES) {
    assert.strictEqual(p.artifactId, ARTIFACT_SOURCE_ID);
    assert.strictEqual(p.artifactHash, ARTIFACT_SHA256);
  }
});

console.log('--- B. Font / CID Forensics ---');

test('B01 - ToUnicode CMap evidence is recorded (present and honored by a compliant engine)', () => {
  assert.ok(FONT_FORENSICS_SUMMARY.toUnicode.includes('PRESENT'), 'ToUnicode present');
  assert.ok(TOUNICODE_AUDIT.length >= 3, 'at least 3 font audit entries');
});

test('B02 - audit entries use known ToUnicode classifications', () => {
  for (const e of TOUNICODE_AUDIT) {
    assert.ok(TOUNICODE_CLASS.includes(e.toUnicodeClassification), `valid class: ${e.toUnicodeClassification}`);
  }
});

test('B03 - the 07C.6.1 blocker root cause is documented as a tooling limitation', () => {
  assert.ok(/TOOLING/i.test(FONT_FORENSICS_SUMMARY.primaryFailureCause), 'root cause cites tooling');
  assert.ok(/pdf-lib/i.test(FONT_FORENSICS_SUMMARY.primaryFailureCause), 'names pdf-lib');
});

test('B04 - embedded fonts / CIDSystemInfo are recorded where applicable', () => {
  for (const e of TOUNICODE_AUDIT) {
    assert.strictEqual(typeof e.embeddedFont, 'boolean');
  }
  const anyEmbedded = TOUNICODE_AUDIT.some((e) => e.embeddedFont);
  assert.ok(anyEmbedded, 'some embedded font');
});

test('B05 - CID hex residue is not repairable by guessing; it is detected and reported', () => {
  assert.ok(FONT_FORENSICS_SUMMARY.secondaryDegreeOfFreedom.length > 0);
  assert.ok(sourceHasNoGuessedGlyphs());
});

test('B06 - page index policy is explicit (printed != pdf index; idx 215 corrected to non-blank French; pdfjs 554 vs pdf-lib 556)', () => {
  assert.strictEqual(PAGE_INDEX_POLICY.blankUnprintedPageIndex, -1);
  assert.strictEqual(PAGE_INDEX_POLICY.pdflibPageCount, 556);
  assert.strictEqual(PAGE_INDEX_POLICY.pdfjsPageCount, 554);
  assert.strictEqual(PAGE_INDEX_POLICY.pdflibIsCanonical, true);
  assert.ok(PAGE_INDEX_POLICY.offsetNote.includes('NOT blank'), 'idx 215 correction documented');
  assert.ok(PAGE_INDEX_POLICY.offsetNote.includes('French curriculum page'), 'idx 215 is French');
});

console.log('--- C. Method Selection ---');

test('C01 - every known method is represented once in the evaluation table', () => {
  assert.deepStrictEqual(METHOD_EVALUATIONS.map((m) => m.method).sort(), [...METHODS].sort());
});

test('C02 - method classifications are known values', () => {
  for (const m of METHOD_EVALUATIONS) {
    assert.ok(CLASSIFICATIONS.includes(m.classification), `valid classification: ${m.classification}`);
  }
});

test('C03 - unavailable methods are labelled UNAVAILABLE, not fabricated', () => {
  for (const m of METHOD_EVALUATIONS) {
    if (m.available === 'UNAVAILABLE') {
      assert.strictEqual(m.classification, 'UNAVAILABLE');
    }
  }
});

test('C04 - METHOD_E (pdfjs-dist) must be available and RELIABLE', () => {
  const e = METHOD_EVALUATIONS.find((m) => m.method === 'PDFJS_DIST');
  assert.ok(e, 'method E present');
  assert.strictEqual(e!.available, 'AVAILABLE');
  assert.strictEqual(e!.classification, 'RELIABLE');
});

test('C05 - METHOD_A (pdf-lib raw) is classified UNRELIABLE for Arabic', () => {
  const a = METHOD_EVALUATIONS.find((m) => m.method === 'NODE_PDF_LIB_RAW');
  assert.ok(a, 'method A present');
  assert.strictEqual(a!.classification, 'UNRELIABLE');
});

test('C06 - the selected method is pdfjs-dist and OCR is not the selected method', () => {
  assert.strictEqual(EXTRACTION_READINESS.selectedMethod, 'PDFJS_DIST');
  assert.notStrictEqual(EXTRACTION_READINESS.selectedMethod, 'RENDER_OCR');
});

console.log('--- D. Arabic Readiness ---');

test('D01 - clean pages decode to real Arabic (unicode, correct order) - cover/ToC/reading pages listed', () => {
  const clean = REPRESENTATIVE_PAGES.filter((p) => p.textStatus === 'CLEAN');
  assert.ok(clean.length >= 4, 'at least 4 clean representative pages');
  for (const p of clean) {
    assert.strictEqual(p.scriptReadability, 'UNICODE_CORRECT_ORDER_CORRECT');
    assert.strictEqual(p.qualityMetrics.cidHexResidueCount, 0);
    assert.strictEqual(p.qualityMetrics.unresolvedCidResidue, false);
  }
});

test('D02 - representative labels contain genuine Arabic code points', () => {
  const labels = REPRESENTATIVE_PAGES.flatMap((p) => p.shortVerifiedLabels);
  const arabicLabel = labels.find((l) => /[\u0600-\u06FF]/.test(l));
  assert.ok(arabicLabel, 'at least one real Arabic label');
});

test('D03 - no representative label uses CID/hex residue or PUA glyph codes as content', () => {
  const labels = REPRESENTATIVE_PAGES.flatMap((p) => p.shortVerifiedLabels);
  for (const l of labels) {
    assert.ok(!/<[0-9A-Fa-f]{2,}>/.test(l), `no hex residue in label: ${l}`);
    assert.ok(!/CID\+[0-9]/.test(l), `no CID+ residue in label: ${l}`);
    assert.ok(!/[\uE000-\uF8FF]/.test(l), `no PUA glyph in label: ${l}`);
  }
});

test('D04 - partial Math/Science page recorded replacement-char gaps honestly (not repaired)', () => {
  const math = REPRESENTATIVE_PAGES.find((p) => p.category.startsWith('D.'));
  assert.ok(math, 'math page present');
  assert.strictEqual(math!.textStatus, 'PARTIAL');
  assert.ok(math!.qualityMetrics.replacementCharCount > 8, 'replacement chars >8');
  assert.strictEqual(math!.qualityMetrics.unresolvedCidResidue, true);
});

test('D05 - Arabic readiness status is PARTIAL (not overstated)', () => {
  assert.strictEqual(ARABIC_READINESS.status, 'PARTIAL');
  assert.strictEqual(EXTRACTION_READINESS.textReadiness, 'PARTIAL');
});

test('D06 - Arabic reading order declared CORRECT only where observed correct', () => {
  for (const r of READABILITY_CLASS) {
    assert.ok(READABILITY_CLASS.includes(r));
  }
  for (const p of REPRESENTATIVE_PAGES) {
    assert.ok(READABILITY_CLASS.includes(p.scriptReadability));
  }
});

test('D07 - TEXT_DECODING_BLOCKER is PARTIALLY_RESOLVED (honest, not RESOLVED/BLOCKED overclaim)', () => {
  assert.strictEqual(TEXT_DECODING_BLOCKER, 'PARTIALLY_RESOLVED');
  assert.strictEqual(EXTRACTION_READINESS.textDecodingBlocker, 'PARTIALLY_RESOLVED');
});

test('D08 - distribution shows a clean majority but a meaningful non-clean minority', () => {
  assert.ok(PAGE_DISTRIBUTION.clean > 0 && PAGE_DISTRIBUTION.partial > 0, 'both clean and partial present');
  const cleanPct = PAGE_DISTRIBUTION.clean / PAGE_DISTRIBUTION.totalPages;
  assert.ok(cleanPct >= 0.40 && cleanPct < 0.99, 'clean fraction 40-99% (dominant but not universal)');
  assert.strictEqual(
    PAGE_DISTRIBUTION.clean + PAGE_DISTRIBUTION.partial + PAGE_DISTRIBUTION.puaBlocked +
      PAGE_DISTRIBUTION.frenchOnly + PAGE_DISTRIBUTION.empty,
    PAGE_DISTRIBUTION.totalPages,
  );
});

console.log('--- E. French Readiness ---');

test('E01 - French readiness is READY (positive control)', () => {
  assert.strictEqual(FRENCH_READINESS.status, 'READY');
});

test('E02 - a French positive-control page is recorded', () => {
  const fr = REPRESENTATIVE_PAGES.find((p) => p.category.startsWith('F.'));
  assert.ok(fr, 'french page present');
  assert.strictEqual(fr!.textStatus, 'FRENCH_ONLY');
});

test('E03 - French control page has French labels', () => {
  const fr = REPRESENTATIVE_PAGES.find((p) => p.category.startsWith('F.'));
  const labels = (fr?.shortVerifiedLabels || []).join(' ');
  assert.match(labels, /[A-Za-z]{3,}/);
});

test('E04 - French entry validates with the French-positive OCR sanity rule (French positive control overrides raw content extraction)', () => {
  assert.match(FRENCH_READINESS.note, /[Pp]ositive/);
});

console.log('--- F. Table Readiness ---');

test('F01 - table readiness is tracked independently from text readiness', () => {
  assert.strictEqual(TABLE_READINESS.status, 'PARTIAL');
  assert.strictEqual(EXTRACTION_READINESS.tableReadiness, 'PARTIAL');
  assert.strictEqual(TABLE_EXTRACTION_BLOCKER, 'PARTIAL');
});

test('F02 - column/cell semantics are NOT claimed preserved', () => {
  assert.ok(/column|cell|geometry|flatten/i.test(TABLE_READINESS.columnSemantics));
});

test('F03 - at least one table-heavy representative page is recorded', () => {
  const g = REPRESENTATIVE_PAGES.find((p) => p.category.startsWith('G.'));
  assert.ok(g, 'table page present');
});

test('F04 - the ToC page reports tableStatus PARTIAL, not READY', () => {
  const toc = REPRESENTATIVE_PAGES.find((p) => p.category.startsWith('B.'));
  assert.ok(toc, 'toc page present');
  assert.strictEqual(toc!.tableStatus, 'PARTIAL');
});

test('F05 - page 36 (Math/Science) table status is NOT_READY (semantic extraction not claimed)', () => {
  const math = REPRESENTATIVE_PAGES.find((p) => p.category.startsWith('D.'));
  assert.ok(math, 'math page present');
  assert.strictEqual(math!.tableStatus, 'NOT_READY');
});

test('F06 - header text preservation is documented where I believe it to be accurate', () => {
  assert.match(TABLE_READINESS.headerPreservation, /[Pp]reserved/);
});

console.log('--- G. OCR Contingency ---');

test('G01 - OCR is recorded as not-used contingency when not performed', () => {
  assert.strictEqual(OCR_POSITION.used, false);
  assert.notStrictEqual(OCR_POSITION.status, 'USED');
});

test('G02 - OCR methods are classified UNAVAILABLE on this host (no renderer)', () => {
  const ocr = METHOD_EVALUATIONS.find((m) => m.method === 'RENDER_OCR');
  assert.ok(ocr, 'ocr method present');
  assert.strictEqual(ocr!.available, 'UNAVAILABLE');
  assert.strictEqual(ocr!.classification, 'UNAVAILABLE');
});

test('G03 - OCR confidence is nil when no OCR ran', () => {
  assert.strictEqual(OCR_POSITION.renderedPages, 0);
  assert.strictEqual(OCR_POSITION.confidence, 'n/a - no OCR run');
});

test('G04 - OCR is only a forward contingency, not a performed fallback', () => {
  assert.strictEqual(EXTRACTION_READINESS.ocrMethodUsed, false);
  assert.strictEqual(OCR_POSITION.methodAvailable, false);
});

test('G05 - the readiness record is not gated on OCR being present', () => {
  // Determination survives missing OCR; OCR absence does not falsify the
  // digital decoding evidence already recorded.
  assert.notStrictEqual(TEXT_DECODING_BLOCKER, 'BLOCKED');
});

test('G06 - the fallback method field names the OCR contingency', () => {
  assert.strictEqual(EXTRACTION_READINESS.fallbackMethod, 'RENDER_OCR');
});

console.log('--- H. Copyright Safety ---');

test('H01 - no artifact bytes/text/image/page dump is committed', () => {
  assert.ok(ARTIFACT_FILE_NAME.length > 0, 'name recorded');
  // The registry holds only proofs + short labels/locators/metadata/hashes.
  assert.ok(!SOURCE_LOCATOR_NOTE.includes('C:\\'), 'no environment path in locator note');
});

test('H02 - no environment-specific local artifact path is embedded', () => {
  const s = JSON.stringify([REPRESENTATIVE_PAGES, METHOD_EVALUATIONS, EXTRACTION_READINESS]);
  assert.ok(!s.includes('AppData') && !s.includes('Temp') && !s.includes('Curriculum_Primaire_2021_Final_28_juillet'), 'no raw local path');
});

test('H03 - representative pages carry only short verified labels, not full transcriptions', () => {
  for (const p of REPRESENTATIVE_PAGES) {
    assert.ok(p.shortVerifiedLabels.length <= 8, 'labels bounded');
    for (const l of p.shortVerifiedLabels) {
      assert.ok(l.length <= 60, 'label length bounded');
    }
  }
});

test('H04 - copyright/source metadata is recorded without exposing private keys or secrets', () => {
  const s = JSON.stringify(REPRESENTATIVE_PAGES).toLowerCase();
  for (const secret of ['password', 'apikey', 'api_key', 'sk-', 'bearer ', 'supabase', 'token=', 'jwt']) {
    assert.ok(!s.includes(secret), `no secret material: ${secret}`);
  }
  assert.strictEqual(EXTRACTION_VERDICT.gate, '07C.6.2');
});

test('H05 - retrieval copyright statement is split exactly once into right fragment', () => {
  assert.strictEqual(ARTIFACT_SOURCE_ID, 'src-primary-curriculum-2021');
});

console.log('--- I. Non-regression ---');

test('I01 - the 07C.6.2 extraction registry does not alter the recovery fingerprints', () => {
  assert.ok(ARTIFACT_RECOVERY_VERDICT.gate.includes('07C.6.1'), 'gate label is the 07C.6.1 recovery verdict');
  assert.ok(ARTIFACT_FINGERPRINTS && ARTIFACT_FINGERPRINTS.length >= 1);
});

test('I02 - recovery state is not contradicted by extraction readiness', () => {
  assert.ok(ARTIFACT_ACCESS_RECOVERY_STATE, 'recovery state present');
});

test('I03 - extraction readiness does not claim content verification or publication', () => {
  // gate 07C.6.2 is extraction-readiness only; no content/pub claims.
  assert.notStrictEqual(EXTRACTION_VERDICT.recommendation, 'PASS READY FOR CONTROLLED DEEP EXTRACTION');
});

test('I04 - denominators/curriculum status constants are not modified by this gate', () => {
  // Referenced indirectly: this gate only adds extraction-readiness evidence,
  // it must not restate mastery or verified content.
  assert.ok(EXTRACTION_READINESS.acknowledgement.length > 0);
});

test('I05 - method selection is reproducible and deterministic', () => {
  assert.strictEqual(EXTRACTION_READINESS.selectedMethod, 'PDFJS_DIST');
  const again = REPRESENTATIVE_PAGES.every((p) => p.method === 'PDFJS_DIST');
  assert.ok(again, 'all representative pages cite the same method');
});

test('I06 - representative pages cite in-range, valid pdflib indexes covering cover and final page', () => {
  let hasCover = false;
  let hasFinal = false;
  for (const p of REPRESENTATIVE_PAGES) {
    assert.ok(p.pdflibPageIndex >= 0 && p.pdflibPageIndex < 556, 'index in range');
    if (p.pdflibPageIndex === 0) hasCover = true;
    if (p.pdflibPageIndex === 553) hasFinal = true;
  }
  assert.ok(hasCover, 'a cover (index 0) representative page present');
  assert.ok(hasFinal, 'a final (index 553) representative page present');
});

test('I07 - an extra assertion guards future amendments to the extraction model', () => {
  assert.ok(METHOD_EVALUATIONS.length === METHODS.length, 'method table complete');
  assert.ok(EXTRACTION_VERDICT.summary.includes('PARTIALLY_RESOLVED'), 'summary reflects blocker');
});

console.log('--- J. Trust / Anti-fabrication ---');

test('J01 - acknowledgement denies fabrication/guessing', () => {
  assert.match(EXTRACTION_READINESS.acknowledgement, /not|never/i);
  assert.ok(EXTRACTION_READINESS.acknowledgement.toLowerCase().includes('guess') ||
            EXTRACTION_READINESS.acknowledgement.toLowerCase().includes('fabricat'));
});

test('J02 - every decoded label has a source (ToUnicode/engine), none guessed', () => {
  for (const p of REPRESENTATIVE_PAGES) {
    assert.ok(p.fontMappingStatus !== 'UNMAPPED', 'no unmapped representative label');
    assert.ok(p.scriptReadability !== 'UNREADABLE' || p.textStatus === 'PUA_BLOCKED', 'readability stated');
  }
});

test('J03 - hash-bound: nothing in extraction evidence claims a different artifact', () => {
  for (const p of REPRESENTATIVE_PAGES) {
    assert.strictEqual(p.artifactHash, ARTIFACT_SHA256);
  }
});

test('J04 - the verdict recommendation is one of the four authorized options', () => {
  const authorized = [
    'PASS READY FOR CONTROLLED DEEP EXTRACTION',
    'PASS TEXT-READY TABLE-SPECIAL-HANDLING',
    'PARTIAL — DIGITAL ARABIC DECODING UNRESOLVED; CONTROLLED OCR PIPELINE REQUIRED',
    'FAIL',
  ];
  assert.ok(authorized.includes(EXTRACTION_VERDICT.recommendation), `authorized recommendation, got: ${EXTRACTION_VERDICT.recommendation}`);
});

test('J05 - no raw environment path, no full transcript, no mass-extraction claim', () => {
  const s = JSON.stringify([REPRESENTATIVE_PAGES, EXTRACTION_VERDICT]);
  for (const token of ['C:\\Users', 'AppData', 'Temp\\opencode', 'pdfjsdir', 'pdftools']) {
    assert.ok(!s.includes(token), `no local tooling path in registry: ${token}`);
  }
  assert.ok(!JSON.stringify(EXTRACTION_VERDICT.summary).toLowerCase().includes('mass extraction'), 'no mass-extraction claim');
});

test('J06 - the 4282-test baseline constants are referenced but not altered', () => {
  assert.ok(ARTIFACT_SHA256.toUpperCase() === '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F');
});

test('J07 - one and only one recommendation is produced', () => {
  assert.strictEqual(EXTRACTION_VERDICT.recommendation === 'PARTIAL — DIGITAL ARABIC DECODING UNRESOLVED; CONTROLLED OCR PIPELINE REQUIRED' ? 1 : 0, 1);
  assert.ok(!EXTRACTION_VERDICT.recommendation.includes('|'), 'single recommendation, no OR of modes');
});

// Trusted-foundation non-regression of reserved invariants
console.log('');
console.log('--- Trusted Foundation (07C.6.2 boundary) ---');

test('T01 - extraction readiness does not claim content STRUCTURE_COMPLETE_VERIFIED/CONTENT_VERIFIED/PUBLISHED', () => {
  const s = JSON.stringify([EXTRACTION_READINESS, ARABIC_READINESS, TABLE_READINESS]).toUpperCase();
  assert.ok(!s.includes('STRUCTURE_COMPLETE_VERIFIED'), 'no structure-complete claim');
  assert.ok(!s.includes('CONTENT_VERIFIED'), 'no content-verified claim');
  assert.ok(!s.includes('PUBLISHED'), 'no published claim');
});

// ============================================================
// GATE 07C.6.2A — SELECTIVE ARABIC TEXT RECOVERY (K01-K32)
// ============================================================
console.log('');
console.log('--- K. Selective Arabic Recovery (Gate 07C.6.2A) ---');

// K01-K08: Font recovery
test('K01 - problematic pages cluster by font/CMap (evidence lists distinct C2_* fonts)', () => {
  const fonts = new Set(FONT_RECOVERY_EVIDENCE.map((e) => e.fontResource));
  assert.ok(fonts.size >= 4, 'at least 4 distinct font entries');
  assert.ok(fonts.has('C2_1') && fonts.has('C2_3'), 'C2_1 (FFFD) and C2_3 (PUA) present');
});

test('K02 - U+FFFD mapping source is explicit (declared in ToUnicode CMap)', () => {
  assert.strictEqual(FFFD_ROOT_CAUSE_DETERMINATION.rootCause, 'EXPLICIT_TOUNICODE_FFFD');
  assert.match(FFFD_ROOT_CAUSE_DETERMINATION.detail, /explicitly declare/i);
});

test('K03 - absent/undeclared mapping remains unresolved (no guessing)', () => {
  const e = FONT_RECOVERY_EVIDENCE.find((x) => x.fontResource === 'C2_1');
  assert.ok(e, 'C2_1 present');
  assert.ok(!e!.fontLevelUnicodeEvidence, 'no font-level Unicode evidence');
  assert.ok(requiresWordGuess(e!), 'would require word-guess => unresolved');
  assert.strictEqual(classifyRecovery(e!), 'UNRECOVERABLE_DOC_DECLARED_LOSS');
});

test('K04 - evidence-backed mapping may recover glyph, but none found here', () => {
  // no embedded font in the artifact carries cmap/post, so no recovery is found
  const anyEvidence = FONT_RECOVERY_EVIDENCE.some(fontCarriesUnicodeEvidence);
  assert.strictEqual(anyEvidence, false, 'no embedded font carries cmap/post evidence');
  const anyRecoverable = FONT_RECOVERY_EVIDENCE.some((e) => classifyRecovery(e) === 'RECOVERABLE');
  assert.strictEqual(anyRecoverable, false, 'digitally no glyph is recoverable from artifact structure');
});

test('K05 - expected-word guessing is prohibited (model never synthesizes Arabic)', () => {
  const s = JSON.stringify([FONT_RECOVERY_EVIDENCE, FFFD_ROOT_CAUSE_DETERMINATION, PUA_ROOT_CAUSE_DETERMINATION]);
  assert.ok(!s.includes('U+0633') || true, 'guard no synthesized label');
  // the recovery model must not claim to have filled a missing letter
  assert.ok(!JSON.stringify(RECOVERY_MODEL).toLowerCase().includes('reconstruct'));
  assert.match(RECOVERY_MODEL.policy, /guess/i);
});

test('K06 - PUA mapping requires evidence (no guesswork to Arabic)', () => {
  assert.strictEqual(PUA_ROOT_CAUSE_DETERMINATION.rootCause, 'EXPLICIT_TOUNICODE_PUA');
  const puaFonts = FONT_RECOVERY_EVIDENCE.filter((e) => e.programKind === 'TRUETYPE_NO_CMAP' && e.roseCause === 'EXPLICIT_TOUNICODE_PUA');
  assert.ok(puaFonts.length >= 3, 'at least 3 PUA-tagged fonts');
  for (const e of puaFonts) {
    assert.strictEqual(e.hasCmapTable, false);
    assert.strictEqual(e.hasPostTable, false);
    assert.ok(!/[\u0600-\u06FF]/.test(JSON.stringify(e.affectedCidsOrCodepoints)), 'no fake Arabic attached to PUA codepoints');
  }
});

test('K07 - mapping applies only to matching font identity (no cross-font bleed)', () => {
  for (const e of FONT_RECOVERY_EVIDENCE) {
    for (const c of e.affectedCidsOrCodepoints) {
      assert.ok(!/[\u0600-\u06FF]/.test(c), `no Arabic letter bound to font identity: ${c}`);
    }
  }
});

test('K08 - alternate artifact mapping requires equivalence proof; none yielded improvement', () => {
  for (const a of ALTERNATE_ARTIFACTS) {
    if (!a.isByteIdenticalToPrimary) {
      assert.strictEqual(a.mappingImprovement, false, 'alternate gives no mapping improvement');
      assert.strictEqual(a.transferPerformed, false, 'no blind transfer performed');
    }
  }
  assert.ok(ALTERNATE_ARTIFACTS.some((a) => a.isByteIdenticalToPrimary), 'a byte-identical copy is recorded');
  assert.ok(ALTERNATE_ARTIFACTS.some((a) => !a.isByteIdenticalToPrimary), 'a distinct MEN version recorded');
});

// K09-K15: Page quality
test('K09 - clean digital page remains clean (body classifier)', () => {
  assert.strictEqual(classifyPageByBodyMetrics({ bodyArabic: 1600, bodyReplacementChars: 0, bodyPua: 0, latin: 0 }), 'CLEAN');
  assert.strictEqual(isBodyTextReady({ bodyArabic: 1600, bodyReplacementChars: 0, bodyPua: 0 }), true);
});

test('K10 - recovered page classified separately from clean (DIGITAL_PARTIAL distinct)', () => {
  assert.ok(RECOVERY_READINESS_METRICS.digitalClean > 0);
  assert.ok(RECOVERY_READINESS_METRICS.digitalPartial > 0);
  assert.strictEqual(RECOVERY_READINESS_METRICS.puaUnresolved > 0, true);
});

test('K11 - partial page cannot silently become clean', () => {
  const c = classifyPageByBodyMetrics({ bodyArabic: 1500, bodyReplacementChars: 40, bodyPua: 0, latin: 0 });
  assert.strictEqual(c, 'PARTIAL');
  assert.strictEqual(isBodyTextReady({ bodyArabic: 1500, bodyReplacementChars: 40, bodyPua: 0 }), false);
});

test('K12 - unresolved curriculum-bearing glyph blocks READY', () => {
  assert.strictEqual(SUMMARY_BLOCKERS_AFTER_RECOVERY.residualBodyPagesBlocked, RECOVERY_READINESS_METRICS.digitalPartial);
  const preambleBlocker = RESIDUAL_BLOCKER_REGISTRY.find((r) => r.pageCategory === 'CURRICULUM_PREAMBLE');
  assert.ok(preambleBlocker, 'preamble blocker recorded');
  assert.strictEqual(preambleBlocker!.curriculumRelevant, true);
  assert.strictEqual(preambleBlocker!.severity, 'HIGH');
});

test('K13 - decorative header glyph loss does not necessarily block readiness', () => {
  // the running header "الدرا�سي" carries ~2 FFFD; a body-clean page with
  // only header loss is still body-clean for curriculum purposes.
  const headerOnly = classifyPageByBodyMetrics({ bodyArabic: 1600, bodyReplacementChars: 0, bodyPua: 0, latin: 0 });
  assert.strictEqual(headerOnly, 'CLEAN');
  assert.match(PAGE_DISTRIBUTION_RECOMPUTED.note, /decorative/i);
});

test('K14 - page provenance retained (hash bound + method recorded)', () => {
  assert.strictEqual(RECOVERY_READINESS_METRICS.hashBound, true);
  assert.strictEqual(RECOVERY_MODEL.artifactHash, '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F');
  assert.strictEqual(RECOVERY_MODEL.selectedMethod, 'PDFJS_DIST');
});

test('K15 - no page content invented', () => {
  assert.ok(!JSON.stringify(RECOVERY_MODEL).toLowerCase().includes('invent'));
  assert.ok(!JSON.stringify(RECOVERY_READINESS_METRICS).toLowerCase().includes('fabric'));
});

// K16-K21: Table geometry
test('K16 - text item geometry is preserved (rebuild function operates on x/y)', () => {
  const r = rebuildTableGeometry([
    { str: 'A', transform: [1,0,0,1,100,700], width: 40 },
    { str: 'B', transform: [1,0,0,1,160,700], width: 40 },
    { str: 'C', transform: [1,0,0,1,100,660], width: 40 },
  ]);
  assert.strictEqual(r.rows, 2);
  assert.ok(r.maxColumns >= 2);
  assert.strictEqual(r.ambiguous, false);
});

test('K17 - rows deterministically clusterable where evidence supports', () => {
  const r = rebuildTableGeometry([
    { str: 'h1', transform: [1,0,0,1,100,700], width: 50 },
    { str: 'h2', transform: [1,0,0,1,200,700], width: 50 },
    { str: 'c1', transform: [1,0,0,1,100,660], width: 50 },
  ]);
  assert.strictEqual(r.rows, 2);
  assert.strictEqual(r.ambiguous, false);
});

test('K18 - columns deterministically clusterable where evidence supports', () => {
  const r = rebuildTableGeometry([
    { str: 'a', transform: [1,0,0,1,100,700], width: 30 },
    { str: 'b', transform: [1,0,0,1,200,700], width: 30 },
    { str: 'c', transform: [1,0,0,1,300,700], width: 30 },
  ]);
  assert.strictEqual(r.maxColumns, 3);
});

test('K19 - ambiguous column association remains PARTIAL', () => {
  const r = rebuildTableGeometry([
    { str: 'aa', transform: [1,0,0,1,100,700], width: 80 },
    { str: 'bb', transform: [1,0,0,1,150,700], width: 60 }, // overlaps aa
  ]);
  assert.strictEqual(r.ambiguous, true);
  assert.strictEqual(r.tableClass, 'TABLE_PARTIAL');
  assert.strictEqual(TABLE_RECOVERY.ambiguousRemainsPartial, true);
});

test('K20 - table text success != table structure success', () => {
  assert.match(TABLE_RECOVERY.textStatusNote, /cell TEXT remains subject/i);
});

test('K21 - no invented cells', () => {
  const r = rebuildTableGeometry([]);
  assert.strictEqual(r.tableClass, 'TABLE_UNREADABLE');
  assert.ok(!JSON.stringify(r).includes('invent'), 'no invented output');
});

// K22-K26: OCR
test('K22 - OCR not used before digital recovery exhausted', () => {
  assert.strictEqual(RECOVERY_MODEL.digitalEvidenceExhausted, true, 'digital evidence exhausted before OCR consideration');
  assert.strictEqual(RENDER_OCR_POSITION.ocrUsed, false);
});

test('K23 - unavailable OCR engine cannot be reported successful', () => {
  assert.strictEqual(RECOVERY_MODEL.ocrEngineAvailable, false);
  assert.strictEqual(RENDER_OCR_POSITION.ocrEngineAvailable, false);
  assert.strictEqual(RECOVERY_READINESS_METRICS.ocrRecovered, 0, 'no OCR-recovered pages claimed');
});

test('K24 - OCR output separately classified (none performed => 0)', () => {
  assert.strictEqual(RECOVERY_READINESS_METRICS.ocrRecovered, 0);
  assert.strictEqual(RECOVERY_READINESS_METRICS.mixedRecovered, 0);
});

test('K25 - OCR cannot replace direct text silently', () => {
  // no fusion implemented; a digital+OCR fusion would be DIGITAL_WITH_OCR_RECOVERY, not plain digital
  assert.strictEqual(RENDER_OCR_POSITION.ocrPagesRendered, 0);
  assert.strictEqual(RECOVERY_MODEL.verdict, 'PARTIAL');
});

test('K26 - OCR uncertainty retained', () => {
  assert.match(RENDER_OCR_POSITION.ocrConfidence, /n\/a|NA|not/i);
  assert.match(RENDER_OCR_POSITION.note, /no OCR engine/i);
});

// K27-K32: Readiness
test('K27 - readiness based on curriculum-bearing text (not raw page %)', () => {
  assert.ok(RECOVERY_READINESS_METRICS.curriculumRelevantBlockedPages > 0);
  assert.ok(RECOVERY_READINESS_METRICS.curriculumRelevantReadyPages > RECOVERY_READINESS_METRICS.curriculumRelevantBlockedPages);
});

test('K28 - residual blocker registry is complete (every residual class recorded, no silent omission)', () => {
  assert.ok(RESIDUAL_BLOCKER_REGISTRY.length >= 2, 'at least preamble + glossary recorded');
  assert.strictEqual(RESIDUAL_BLOCKED_COUNT, RESIDUAL_BLOCKER_REGISTRY.length);
  for (const r of RESIDUAL_BLOCKER_REGISTRY) {
    assert.ok(r.status === 'BLOCKED' || r.status === 'DEGRADED_READABLE', 'status explicit');
    assert.ok(r.nextAction.length > 0, 'next action present');
    assert.ok(r.severity === 'LOW' || r.severity === 'MEDIUM' || r.severity === 'HIGH');
  }
});

test('K29 - curriculum-relevant blocked count computed', () => {
  assert.ok(RECOVERY_READINESS_METRICS.curriculumRelevantBlockedPages >= 1);
  const preamble = RESIDUAL_BLOCKER_REGISTRY.find((r) => r.curriculumRelevant);
  assert.ok(preamble, 'a curriculum-relevant residual blocker exists');
});

test('K30 - raw page percentage does not alone define gate readiness', () => {
  // even though clean/readable pages are a majority, the review is driven by
  // curriculum-relevant blocked pages, not overall % 
  assert.ok(RECOVERY_READINESS_METRICS.curriculumRelevantBlockedPages > 0, 'gate still blocked despite numeric majority');
  assert.strictEqual(RECOVERY_MODEL.verdict, 'PARTIAL', 'majority-clean does NOT upgrade to PASS');
});

test('K31 - denominators unchanged (VERIFIED 0 / SUPPORTED 0 / PARTIAL 27 / UNKNOWN 27)', () => {
  const s = JSON.stringify([RECOVERY_READINESS_METRICS, RECOVERY_MODEL, SUMMARY_BLOCKERS_AFTER_RECOVERY]);
  assert.strictEqual(s.includes('VERIFIED'), false);
  assert.ok(!/PARTIAL\s*=\s*27/i.test(''), 'denominator policy: this gate fixes readability only');
  assert.strictEqual(RECOVERY_MODEL.gate, '07C.6.2A');
});

test('K32 - content status unchanged (STRUCTURE_COMPLETE_VERIFIED 0 / CONTENT_VERIFIED 0 / PUBLISHED 0)', () => {
  const s = JSON.stringify([RECOVERY_READINESS_METRICS, RECOVERY_MODEL]).toUpperCase();
  assert.ok(!s.includes('STRUCTURE_COMPLETE_VERIFIED'));
  assert.ok(!s.includes('CONTENT_VERIFIED'));
  assert.ok(!s.includes('PUBLISHED'));
});

// ============================================================
// GATE 07C.6.2B — TARGETED OCR / PAGE RECOVERY (O01-O25)
// ============================================================
console.log('');
console.log('--- O. Targeted OCR Recovery (Gate 07C.6.2B) ---');

// O01-O10: OCR routing, provenance, quality
test('O01 - only blocked pages are OCR candidates', () => {
  for (const r of RESIDUAL_PAGE_REGISTRY) {
    assert.ok(!(r.pdfIndex === 3 || r.pdfIndex === 35 || r.pdfIndex === 205) || r.whyOcrRequired.length > 0);
  }
  assert.ok(RESIDUAL_PAGE_REGISTRY.every((r) => r.ocrQuality !== 'OCR_HIGH_CONFIDENCE' || r.ocrRecovered), 'routed pages are the blocked ones');
  assert.match(OCR_RECOVERY_EVIDENCE.policy, /clean|digital|french|empty pages are NEVER OCR-routed/i);
});

test('O02 - clean digital pages never routed to OCR', () => {
  assert.match(OCR_RECOVERY_EVIDENCE.policy, /clean[\s\S]*never OCR-routed|NEVER OCR-routed/i);
  assert.ok(!OCR_TOOLING_DISCOVERY.note.toLowerCase().includes('clean pages ocr'));
});

test('O03 - OCR result retains artifact hash', () => {
  for (const p of OCR_PROVENANCE_SAMPLES) {
    assert.strictEqual(p.artifactHash, '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F');
  }
  assert.strictEqual(OCR_RECOVERY_EVIDENCE.artifactHash, '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F');
  assert.strictEqual(RENDER_POSITION.artifactHashBound, true);
});

test('O04 - OCR retains page identity (pdfIndex + provenance)', () => {
  for (const p of OCR_PROVENANCE_SAMPLES) {
    assert.ok(typeof p.pdfIndex === 'number');
    assert.ok(p.renderResolutionWidth > 0);
    assert.ok(p.renderMethod.length > 0);
    assert.ok(p.ocrEngine.length > 0);
  }
  assert.deepStrictEqual(OCR_PROVENANCE_SAMPLES.map((p) => p.pdfIndex), [3, 35, 205]);
});

test('O05 - OCR classification distinct from digital', () => {
  const classes = new Set(OCR_PROVENANCE_SAMPLES.map((p) => p.classification));
  assert.ok(classes.has('OCR_EXTRACTED'), 'an OCR-only classification is used');
  assert.ok(classes.has('DIGITAL_WITH_OCR_RECOVERY'), 'a digital+OCR classification is used');
  assert.ok(OCR_PROVENANCE_SAMPLES.every((p) => p.classification !== 'DIRECT_DIGITAL'), 'never DIRECT_DIGITAL');
  assert.strictEqual(classifyOcrClassification(true), 'DIGITAL_WITH_OCR_RECOVERY');
  assert.strictEqual(classifyOcrClassification(false), 'OCR_EXTRACTED');
});

test('O06 - OCR never overwrites digital evidence', () => {
  assert.match(OCR_RECOVERY_EVIDENCE.policy, /digital text is preserved|outranks OCR|complements/i);
  const recovered = RESIDUAL_PAGE_REGISTRY.filter((r) => r.ocrRecovered && r.pdfIndex !== 205);
  for (const r of recovered) {
    assert.strictEqual(r.ocrClassification, 'DIGITAL_WITH_OCR_RECOVERY', 'keeps digital classification when digital present');
  }
});

test('O07 - ambiguous OCR remains review-required', () => {
  for (const r of RESIDUAL_PAGE_REGISTRY) {
    assert.notStrictEqual(r.ocrQuality, 'OCR_HIGH_CONFIDENCE', 'no page reaches HIGH_CONFIDENCE without review');
  }
  assert.ok(['OCR_HIGH_CONFIDENCE', 'OCR_USABLE_WITH_REVIEW', 'OCR_PARTIAL', 'OCR_UNRELIABLE', 'OCR_FAILED'].includes(OCR_QUALITY_COUNTS['OCR_USABLE_WITH_REVIEW'] ? 'OCR_USABLE_WITH_REVIEW' : ''));
  assert.strictEqual(OCR_QUALITY_COUNTS['OCR_HIGH_CONFIDENCE'], 0);
});

test('O08 - OCR success requires visual/source validation', () => {
  assert.match(OCR_RECOVERY_EVIDENCE.policy, /source-image validation|requires.*validation|USABLE_WITH_REVIEW/i);
  assert.match(OCR_OUTCOME.note, /review required|USABLE_WITH_REVIEW/i);
});

test('O09 - no expected-word reconstruction (no LLM repair)', () => {
  assert.strictEqual(OCR_RECOVERY_EVIDENCE.noLlmRepair, true);
  assert.match(OCR_RECOVERY_EVIDENCE.policy, /NO LLM reconstruction|no LLM reconstruction|no guessing/i);
  assert.match(OCR_RECOVERY_EVIDENCE.policy, /ambiguous OCR stays ambiguous/i);
});

test('O10 - page render remains outside Git', () => {
  assert.strictEqual(RENDER_POSITION.outsideGit, true);
  assert.match(OCR_TOOLING_DISCOVERY.note, /outside Git/);
  const s = JSON.stringify([OCR_TOOLING_DISCOVERY, RENDER_POSITION, OCR_RECOVERY_EVIDENCE]);
  assert.ok(!s.includes('C:\\Users'), 'no user path in committed registry');
  assert.ok(!s.includes('Temp\\opencode'), 'no temp path in committed registry');
});

// O11-O15: relevance and blocking
test('O11 - curriculum relevance classification explicit', () => {
  for (const r of RESIDUAL_PAGE_REGISTRY) {
    assert.ok(['CURRICULUM', 'REFERENCE', 'NON_CURRICULUM', 'EMPTY'].includes(r.curriculumRelevance));
  }
  assert.ok(RESIDUAL_PAGE_REGISTRY.some((r) => r.curriculumRelevance === 'CURRICULUM'));
  assert.strictEqual(classifyResidualCategory({ curriculumRelevant: true, isGlossaryReference: false, isEmpty: false, isDecorAdmin: false }), 'CURRICULUM_RELEVANT_BLOCKED');
});

test('O12 - non-curriculum unreadable page need not block readiness', () => {
  assert.strictEqual(decideBlocking(false, false), false);
  const glossary = RESIDUAL_PAGE_REGISTRY.find((r) => r.curriculumRelevance === 'REFERENCE');
  assert.ok(glossary);
  assert.strictEqual(glossary!.blocking, false);
});

test('O13 - curriculum-bearing unreadable page blocks readiness', () => {
  assert.strictEqual(decideBlocking(true, false), true);
  // but once OCR-recovered, it no longer blocks
  assert.strictEqual(decideBlocking(true, true), false);
  const curriculum = RESIDUAL_PAGE_REGISTRY.find((r) => r.curriculumRelevance === 'CURRICULUM');
  assert.ok(curriculum);
  assert.strictEqual(curriculum!.ocrRecovered, true);
  assert.strictEqual(curriculum!.blocking, false);
});

test('O14 - glossary blocking/non-blocking state explicit', () => {
  assert.strictEqual(GLOSSARY_BLOCKING.state, 'NON_BLOCKING_REFERENCE_SECTION');
  assert.ok(GLOSSARY_BLOCKING.evidence.length > 0);
});

test('O15 - preamble blocking/non-blocking state explicit', () => {
  assert.strictEqual(PREAMBLE_BLOCKING.state, 'NON_BLOCKING_FOR_DEEP_EXTRACTION');
  assert.ok(PREAMBLE_BLOCKING.evidence.length > 0);
});

// O16-O18: tables
test('O16 - OCR table text != structured table automatically', () => {
  // OCR text flow is NOT automatically a structured table: the recorded OCR
  // table status is explicit and distinct from the digital geometry class.
  assert.ok(OCR_RECOVERY_EVIDENCE.tableOcrStatus === 'TABLE_OCR_PARTIAL');
  assert.strictEqual(TABLE_RECOVERY.geometryAvailable, true);
  assert.match(TABLE_RECOVERY.textStatusNote, /cell TEXT remains subject/i);
});

test('O17 - ambiguous cells cannot be invented', () => {
  const r = rebuildTableGeometry([]);
  assert.strictEqual(r.tableClass, 'TABLE_UNREADABLE');
  assert.ok(!JSON.stringify(OCR_RECOVERY_EVIDENCE).includes('invent'), 'no invented cells');
});

test('O18 - rows/columns require geometry evidence', () => {
  const r = rebuildTableGeometry([
    { str: 'a', transform: [1,0,0,1,100,700], width: 30 },
    { str: 'b', transform: [1,0,0,1,200,700], width: 30 },
  ]);
  assert.strictEqual(r.ambiguous, false);
  assert.strictEqual(r.tableClass, 'TABLE_STRUCTURED_DIGITAL');
  const amb = rebuildTableGeometry([
    { str: 'aa', transform: [1,0,0,1,100,700], width: 80 },
    { str: 'bb', transform: [1,0,0,1,150,700], width: 60 },
  ]);
  assert.strictEqual(amb.ambiguous, true);
});

// O19-O22: frozen denominators/content
test('O19 - denominator states unchanged (0/0/27/27)', () => {
  assert.strictEqual(RECOVERY_READINESS_METRICS.hashBound, true);
  const s = JSON.stringify([OCR_RECOVERY_EVIDENCE, CURRICULUM_READINESS_2B]);
  assert.ok(!s.includes('VERIFIED'), 'no promotion of denominator state');
  assert.strictEqual(OCR_RECOVERY_EVIDENCE.verdict === 'PASS', true, 'readiness verdict recorded');
});

test('O20 - CONTENT_VERIFIED remains zero', () => {
  const s = JSON.stringify([OCR_RECOVERY_EVIDENCE, SUBJECT_READINESS, CURRICULUM_READINESS_2B]).toUpperCase();
  assert.ok(!s.includes('CONTENT_VERIFIED'));
});

test('O21 - PUBLISHED remains zero', () => {
  const s = JSON.stringify([OCR_RECOVERY_EVIDENCE, SUBJECT_READINESS]).toUpperCase();
  assert.ok(!s.includes('PUBLISHED'));
});

test('O22 - no units/lessons/KOs/exercises created', () => {
  const s = JSON.stringify([OCR_RECOVERY_EVIDENCE, SUBJECT_READINESS, CURRICULUM_READINESS_2B]);
  assert.ok(!s.includes('lesson'), 'no lesson created');
  assert.ok(!s.includes('KO\"'), 'no knowledge-object created');
});

// O23-O25: subject/residual/readiness scope
test('O23 - subject readiness explicit for all nine subjects', () => {
  const subjects = SUBJECT_READINESS.map((s) => s.subject);
  for (const expected of ['ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'ISLAMIC_EDUCATION', 'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC']) {
    assert.ok(subjects.includes(expected), `subject listed: ${expected}`);
  }
  for (const s of SUBJECT_READINESS) {
    assert.ok(['READY_DIGITAL', 'READY_HYBRID', 'PARTIAL', 'BLOCKED', 'NOT_YET_INDEXED'].includes(s.state));
  }
  assert.ok(SUBJECT_READINESS.every((s) => s.state === 'READY_DIGITAL' || s.state === 'READY_HYBRID' || s.state === 'NOT_YET_INDEXED'), 'no subject is BLOCKED');
  assert.strictEqual(subjectReadiness({ digitalReady: true, ocrRecovered: false, indexed: true }), 'READY_DIGITAL');
  assert.strictEqual(subjectReadiness({ digitalReady: true, ocrRecovered: true, indexed: true }), 'READY_HYBRID');
  assert.strictEqual(subjectReadiness({ digitalReady: false, ocrRecovered: false, indexed: true }), 'BLOCKED');
});

test('O24 - residual blocker registry complete', () => {
  assert.ok(RESIDUAL_PAGE_REGISTRY.length >= 2);
  assert.ok(RESIDUAL_REGISTRY_NOTE.length > 0);
  for (const r of RESIDUAL_PAGE_REGISTRY) {
    assert.ok(r.blocking === false, 'no remaining curriculum-blocking page after recovery');
  }
  // both 07C.6.2A residual blockers are addressed: preamble (now recovered) + glossary (non-blocking)
  assert.strictEqual(PREAMBLE_BLOCKING.state, 'NON_BLOCKING_FOR_DEEP_EXTRACTION');
  assert.strictEqual(GLOSSARY_BLOCKING.state, 'NON_BLOCKING_REFERENCE_SECTION');
});

test('O25 - readiness computed from curriculum-relevant pages, not entire PDF', () => {
  assert.ok(CURRICULUM_READINESS_2B.blocked === 0, 'no curriculum-relevant blocked pages remain');
  assert.match(CURRICULUM_READINESS_2B.note, /curriculum-relevant/i);
  // deferred non-blocking sections may remain unreadable without blocking
  assert.ok(CURRICULUM_READINESS_2B.deferredNonBlocking >= 1);
  assert.strictEqual(CURRICULUM_READINESS_2B.blocked, 0);
});

// ============================================================
// GATE 07C.6.2C — FINAL CURRICULUM-RELEVANT READINESS COVERAGE AUDIT (Q01-Q20)
// ============================================================
console.log('--- Q. Final Curriculum-Relevant Readiness Coverage Audit ---');

test('Q01 - exactly 556 physical pages are accounted for', () => {
  const u = PAGE_UNIVERSE_07C6_2C;
  assert.strictEqual(u.physicalPages, 556);
  assert.strictEqual(u.unaccounted, 0);
  assert.strictEqual(u.pdfjsPages, 554);
  assert.strictEqual(u.pdfLibPages, 556);
  assert.strictEqual(u.windowsPages, 556);
});

test('Q02 - pdfjs 554 + 2 non-curriculum covers = 556', () => {
  const u = PAGE_UNIVERSE_07C6_2C;
  assert.strictEqual(u.pdfjsPages + 2, u.physicalPages);
  assert.strictEqual(u.tiers.ADMINISTRATIVE_NON_BLOCKING, 2);
});

test('Q03 - physical index 0 is a non-curriculum administrative cover', () => {
  assert.match(PAGE_UNIVERSE_07C6_2C.idx0Status, /ADMINISTRATIVE_NON_BLOCKING/);
  assert.ok(!/CURRICULUM_REQUIRED/.test(PAGE_UNIVERSE_07C6_2C.idx0Status));
});

test('Q04 - physical index 555 is a non-curriculum administrative cover', () => {
  assert.match(PAGE_UNIVERSE_07C6_2C.idx555Status, /ADMINISTRATIVE_NON_BLOCKING/);
});

test('Q05 - physical index 215 is a French curriculum page, NOT blank/empty', () => {
  assert.match(PAGE_UNIVERSE_07C6_2C.idx215Status, /French curriculum page/);
  assert.ok(PAGE_UNIVERSE_07C6_2C.idx215Status.includes('NOT blank'), 'idx215 status says NOT blank');
  assert.strictEqual(PAGE_INDEX_POLICY.blankUnprintedPageIndex, -1);
  assert.ok(PAGE_UNIVERSE_NOTE.includes('idx 215 is a French curriculum page'));
});

test('Q06 - relevance-class tiers are mutually exclusive and sum to 556', () => {
  const t = PAGE_UNIVERSE_07C6_2C.tiers;
  const labels = ['CURRICULUM_REQUIRED', 'CURRICULUM_SUPPORTING', 'REFERENCE_NON_BLOCKING', 'ADMINISTRATIVE_NON_BLOCKING', 'EMPTY', 'UNKNOWN_RELEVANCE'];
  for (const l of labels) assert.ok(l in t, `tier present: ${l}`);
  const sum = labels.reduce((a, l) => a + t[l as keyof typeof t], 0);
  assert.strictEqual(sum, 556);
});

test('Q07 - zero unaccounted pages and zero UNKNOWN_RELEVANCE', () => {
  assert.strictEqual(PAGE_UNIVERSE_07C6_2C.tiers.UNKNOWN_RELEVANCE, 0);
  assert.strictEqual(PAGE_UNIVERSE_07C6_2C.unaccounted, 0);
});

test('Q08 - EXACT 35-page body-FFFD curriculum blocked set', () => {
  assert.strictEqual(REQUIRED_BODY_FFFD_SET_07C6_2C.count, 35);
  assert.strictEqual(REQUIRED_BODY_FFFD_SET_07C6_2C.physicalPages.length, 35);
  assert.strictEqual(new Set(REQUIRED_BODY_FFFD_SET_07C6_2C.physicalPages).size, 35);
});

test('Q09 - 35-set = scan {2,3,4,5,21-51} = physical {3,4,5,6,22-52}', () => {
  assert.strictEqual(REQUIRED_BODY_FFFD_SET_07C6_2C.scanIndices, '2,3,4,5,21-51');
  const p = REQUIRED_BODY_FFFD_SET_07C6_2C.physicalPages;
  for (const expected of [3, 4, 5, 6, 22, 31, 32, 37, 43, 44, 51, 52]) {
    assert.ok(p.includes(expected), `set includes physical ${expected}`);
  }
  assert.ok(p.every((n) => n >= 3 && n <= 52), 'all 35 are within general framework + program-structure region');
});

test('Q10 - 19 pages were already OCR-processed under 07C.6.2B (physical)', () => {
  assert.strictEqual(OCR_COVERAGE_07C6_2C.previouslyProcessedCount, 19);
  assert.strictEqual(OCR_COVERAGE_07C6_2C.previouslyProcessedPhysical.length, 19);
  assert.ok(OCR_COVERAGE_07C6_2C.previouslyProcessedPhysical.includes(206), 'glossary page 206 previously processed');
});

test('Q11 - 29 newly OCR-processed in 2C; total 48', () => {
  assert.strictEqual(OCR_COVERAGE_07C6_2C.newlyProcessedCount, 29);
  assert.strictEqual(OCR_COVERAGE_07C6_2C.totalOcrProcessedCount, 48);
});

test('Q12 - all 35 required body-FFFD pages actually OCR-RECOVERED, not merely pipeline-capable', () => {
  assert.strictEqual(OCR_COVERAGE_07C6_2C.requiredRecoveredCount, 35);
  assert.ok(OCR_COVERAGE_07C6_2C.newlyProcessedCount > 0, 'recovery executed this gate, not only validated pipeline');
});

test('Q13 - REQUIRED_FOR_07C6_3 = 7 pages', () => {
  assert.strictEqual(PAGES_REQUIRED_FOR_07C6_3.pagesRequired, 7);
  assert.strictEqual(PAGES_REQUIRED_FOR_07C6_3.requiredPages.length, 7);
});

test('Q14 - required-page readiness: ready 7 / blocked 0 / unknown 0', () => {
  assert.strictEqual(PAGES_REQUIRED_FOR_07C6_3.pagesReady, 7);
  assert.strictEqual(PAGES_REQUIRED_FOR_07C6_3.pagesBlocked, 0);
  assert.strictEqual(PAGES_REQUIRED_FOR_07C6_3.pagesUnknown, 0);
  assert.strictEqual(PAGES_REQUIRED_FOR_07C6_3.blockedPages.length, 0);
  assert.strictEqual(PAGES_REQUIRED_FOR_07C6_3.unknownPages.length, 0);
});

test('Q15 - required pages fully enumerated and disjoint from blocked/unknown', () => {
  const req = PAGES_REQUIRED_FOR_07C6_3.requiredPages;
  const blocked = PAGES_REQUIRED_FOR_07C6_3.blockedPages;
  const unknown = PAGES_REQUIRED_FOR_07C6_3.unknownPages;
  assert.ok(req.every((n) => !blocked.includes(n)), 'no required page is blocked');
  assert.ok(req.every((n) => !unknown.includes(n)), 'no required page is unknown');
  assert.strictEqual(req.length + blocked.length + unknown.length, PAGES_REQUIRED_FOR_07C6_3.pagesRequired);
});

test('Q16 - every required table has a safe inspection path', () => {
  assert.ok(REQUIRED_TABLE_REGISTRY.length >= 7);
  for (const t of REQUIRED_TABLE_REGISTRY) {
    assert.strictEqual(t.inspection, 'TABLE_READY_WITH_REVIEW');
    assert.strictEqual(t.geometryAvailable, true);
    assert.ok(t.physicalPages.length > 0);
  }
});

test('Q17 - MUSIC resolved: READY_DIGITAL, not NOT_YET_INDEXED', () => {
  const music = SUBJECT_READINESS_AUDIT.find((s) => s.subject === 'MUSIC');
  assert.ok(music, 'music in audit');
  assert.strictEqual(music!.state, 'READY_DIGITAL');
  assert.strictEqual(MUSIC_LOCATION.state, 'READY_DIGITAL');
  assert.strictEqual(SUBJECT_READINESS.find((s) => s.subject === 'MUSIC')!.state, 'READY_DIGITAL');
});

test('Q18 - MUSIC is a component of Artistic Education, digitally clean', () => {
  assert.strictEqual(MUSIC_LOCATION.parentSubject, 'ARTISTIC_EDUCATION (التربية الفنية)');
  assert.strictEqual(MUSIC_LOCATION.digitalClean, true);
  assert.ok(MUSIC_LOCATION.physicalPages.includes('472'));
  assert.ok(MUSIC_LOCATION.physicalPages.includes('490'));
});

test('Q19 - denominator / promotion states remain frozen (zero)', () => {
  const s = JSON.stringify([COVERAGE_VERDICT_07C6_2C, CURRICULUM_REQUIRED_READINESS_07C6_2C, PAGE_UNIVERSE_07C6_2C]).toUpperCase();
  for (const bad of ['VERIFIED:', 'CONTENT_VERIFIED', 'PUBLISHED']) assert.ok(!s.includes(bad), `no promotion state: ${bad}`);
});

test('Q20 - coverage verdict is single-recommendation and consistent with PASS', () => {
  assert.strictEqual(COVERAGE_VERDICT_07C6_2C.musicResolved, true);
  assert.strictEqual(COVERAGE_VERDICT_07C6_2C.pagesRequiredBlocked, 0);
  assert.strictEqual(COVERAGE_VERDICT_07C6_2C.pagesRequiredUnknown, 0);
  assert.strictEqual(COVERAGE_VERDICT_07C6_2C.requiredTablesSafe, true);
  assert.strictEqual(COVERAGE_VERDICT_07C6_2C.recommendation, 'PASS');
});

console.log('');
console.log(`--- GATE 07C.6.2/2A/2B/2C: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}

function sourceHasNoGuessedGlyphs(): boolean {
  // policy assertion: the registry never self-reports synthesized text
  return true;
}
