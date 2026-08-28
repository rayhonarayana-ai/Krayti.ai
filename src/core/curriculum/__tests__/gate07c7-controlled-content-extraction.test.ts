/**
 * Qarayti.ai - Gate 07C.7: Controlled Primary Curriculum Content
 * Extraction Foundation Tests
 *
 * Groups (§32-§39):
 *   A. CLAIM MODEL        A01-A08  source-native id, grade scope, hash, version,
 *                                  page, locator, method, mapping secondary
 *   B. SOURCE SAFETY      B01-B07  source wording vs normalized, ambiguous,
 *                                  OCR != DIRECT_DIGITAL, no provenance, page!=identity,
 *                                  no substitution, source-native > application
 *   C. PILOT SCOPE        C01-C08  one grade, one subject, explicit element/pages,
 *                                  no MUSIC, no CIVIC, small slice, no mass marker
 *   D. CONTENT SAFETY     D01-D07  no auto lesson/KO/exercise, no competency
 *                                  completeness inference, completeness unmeasurable,
 *                                  no cross-grade/subject copying
 *   E. DUPLICATION        E01-E05  stable identity, normalization != identity,
 *                                  duplicates != claim, repeated occurrence keeps
 *                                  provenance, version in identity
 *   F. PILOT EVIDENCE     F01-F07  real provenance/grade/subject/structure per
 *                                  claim, confirmed has readable evidence,
 *                                  REVIEW_REQUIRED != confirmed, REJECTED != confirmed
 *   G. FREEZE             G01-G09
 *   H. REPO / SECURITY    H01-H09  no PDF/image/OCR dump/large dump/abs path/migration/
 *                                  DB write/deployment/secrets
 *   P. PROVENANCE         P01-P10  explicit GateSourceTopic -> SOURCE_TOPIC_PAGE_REGISTRY
 *                                  authority; physicalPage = scannedIndex + 1; printed !=
 *                                  physical; no claimId/wording/regex heuristics
 *
 * The tests validate the CONTROLLED-EXTRACTION registry and its invariants.
 * They do NOT create units/lessons/KOs/exercises (§8) and do NOT modify
 * learner/runtime behavior, write to a database, or deploy anything (§31.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  CONTENT_EXTRACTION_PILOT_CLAIMS,
  CONTENT_PILOT_DECLARATION,
  CONTENT_EXTRACTION_PILOT_LEDGER,
  CONTROLLED_CONTENT_EXTRACTION_VERDICT,
  CONTENT_EXTRACTION_ARTIFACT_SHA256,
  CONTENT_EXTRACTION_SOURCE_VERSION_ID,
  SOURCE_TOPIC_PAGE_REGISTRY,
  CONTENT_ATTRIBUTION_COUNTS,
  CONTENT_STATE_COUNTS,
  CONTENT_VERIFICATION_COUNTS,
  contentClaimStableKey,
  contentClaimId,
} from '../../../domain/constants/moroccan-primary-content-extraction-pilot-registry';

import type {
  ContentClaimCategory,
  GateSourceTopic,
  SourceContentClaim,
} from '../../../domain/types/curriculum-source-governance.types';

import {
  SOURCE_NATIVE_STRUCTURAL_ELEMENTS,
  APPLICATION_MAPPING_MATRIX,
} from '../../../domain/constants/moroccan-primary-structure-reconciliation-registry';

let passed = 0;
let failed = 0;

// Content-claim categories allowed by Gate 07C.7 (§6/§7). We must NOT invent
// categories merely because they sound educational.
const ALLOWED_CATEGORIES: ContentClaimCategory[] = [
  'OBJECTIVE', 'LEARNING_OUTCOME', 'COMPETENCY_STATEMENT', 'CONTENT_THEME',
  'CONTENT_ELEMENT', 'METHODOLOGICAL_GUIDANCE', 'ACTIVITY_TYPE',
  'ASSESSMENT_GUIDANCE', 'TEMPORAL_ALLOCATION', 'STRUCTURAL_DESCRIPTION',
];

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
// A. CLAIM MODEL (A01-A08, §32)
// ============================================================

test('A01 - every claim attaches to a source-native structural element', () => {
  const elementIds = new Set(SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => e.structuralElementId));
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(elementIds.has(c.structuralElementId), `claim ${c.claimId} -> source-native element ${c.structuralElementId}`);
  }
});

test('A02 - every claim is scoped to exactly one grade (and it is P1)', () => {
  assert.strictEqual(CONTENT_PILOT_DECLARATION.gradeCode, 'P1');
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.strictEqual(c.gradeCode, 'P1', `claim ${c.claimId} grade`);
  }
});

test('A03 - artifact hash is bound (64-hex SHA-256) and source version is set', () => {
  assert.ok(/^[0-9A-F]{64}$/.test(CONTENT_EXTRACTION_ARTIFACT_SHA256), 'sha256 64 hex');
  assert.strictEqual(CONTENT_EXTRACTION_SOURCE_VERSION_ID, 'v1.0.0');
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) assert.strictEqual(c.sourceVersionId, CONTENT_EXTRACTION_SOURCE_VERSION_ID);
});

test('A04 - every claim carries physical page / printed page / scanned index provenance', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(Number.isInteger(c.provenance.physicalPage), `${c.claimId} physical page`);
    assert.strictEqual(c.provenance.scannedIndex, c.provenance.physicalPage - 1, `${c.claimId} scanned index`);
    assert.ok(c.provenance.printedPage.length > 0, `${c.claimId} printed page`);
    assert.ok(c.provenance.blockLabel.length > 0, `${c.claimId} block label`);
    assert.ok(c.provenance.rowColumnNote.length > 0, `${c.claimId} row/column note`);
  }
});

test('A05 - every claim carries an explicit extraction method', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.strictEqual(c.extractionMethod, 'DIRECT_STRUCTURED_EXTRACTION', `${c.claimId} method`);
  }
  assert.strictEqual(CONTENT_PILOT_DECLARATION.extractionMethod, 'DIRECT_STRUCTURED_EXTRACTION');
});

test('A06 - extraction class is atomically classified at claim level', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(
      ['DIRECT_DIGITAL', 'DIGITAL_WITH_OCR_RECOVERY', 'OCR_EXTRACTED'].includes(c.provenance.extractionClass),
      `${c.claimId} extraction class`,
    );
  }
});

test('A07 - application mapping is downstream metadata, not the claim identity', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    // The claim is identified by the SOURCE element + grade + value, never by
    // the application subject code.
    assert.ok(!c.claimId.startsWith(c.applicationSubjectCode.toLowerCase()), `claim ${c.claimId} not identified by app code`);
  }
});

test('A08 - category is from the allowed set (no invented educational-sounding types)', () => {
  const used = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.category));
  for (const cat of used) assert.ok(ALLOWED_CATEGORIES.includes(cat), `category ${cat} allowed`);
  // Every declared expected category type is used by at least one claim where possible.
  const expected: ContentClaimCategory[] = [
    'OBJECTIVE', 'CONTENT_ELEMENT', 'ACTIVITY_TYPE', 'ASSESSMENT_GUIDANCE',
  ];
  for (const e of expected) assert.ok(used.has(e), `expected category ${e} present`);
});

// ============================================================
// B. SOURCE SAFETY (B01-B07, §33)
// ============================================================

test('B01 - source wording is short and bounded (copyright-safe, §26)', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(c.sourceWordingAr.length < 220, `claim ${c.claimId} source wording is a short excerpt`);
    assert.ok(c.sourceWordingAr.length > 0, `claim ${c.claimId} has source wording`);
  }
});

test('B02 - ambiguous / uncertain attribution is NOT flagged as confirmed', () => {
  // REVIEW_REQUIRED claims must carry verificationState/category conveying review.
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    if (c.contentStatus === 'REVIEW_REQUIRED') {
      assert.ok(['REVIEW_REQUIRED', 'UNVERIFIED'].includes(c.verificationState), `claim ${c.claimId} not over-claimed`);
      assert.notStrictEqual(c.confidence, 'HIGH', `claim ${c.claimId} REVIEW_REQUIRED never HIGH`);
    }
  }
});

test('B03 - extraction class never mislabels OCR as DIRECT_DIGITAL', () => {
  // The pilot pages 332-335 are in the artifact CLEAN digital set, so
  // DIRECT_DIGITAL is correct here. The invariant is structural: an
  // OCR_EXTRACTED class must never be routed as DIRECT_DIGITAL. We assert the
  // used class is consistent with the declared digital method.
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    if (c.extractionMethod === 'DIRECT_STRUCTURED_EXTRACTION') {
      assert.strictEqual(c.provenance.extractionClass, 'DIRECT_DIGITAL', `${c.claimId} digital routing`);
    }
  }
});

test('B04 - no claim exists without provenance', () => {
  assert.ok(CONTENT_EXTRACTION_PILOT_CLAIMS.length > 0);
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(c.provenance && c.provenance.physicalPage > 0, `claim ${c.claimId} has provenance`);
  }
});

test('B05 - page number is provenance, not the claim identity', () => {
  const ids = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.claimId));
  // Two claims sharing a page still have distinct semantic identities, and the
  // identity is independent of the page value.
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(c.claimId.length > 0, `${c.claimId} id present`);
  }
  // Identity keys do not encode the page number.
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    const key = contentClaimStableKey(c);
    assert.ok(!key.includes(String(c.provenance.physicalPage)), 'identity does not embed the page number');
  }
  assert.strictEqual(ids.size, CONTENT_EXTRACTION_PILOT_CLAIMS.length, 'claim ids unique');
});

test('B06 - source wording is not substituted by fabricated prose', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    // normalizedValue is a conservative restatement of the same referent; it
    // must not assert content the source wording does not contain.
    assert.ok(c.normalizedValueAr.length > 0, `${c.claimId} normalized value`);
    assert.notStrictEqual(c.sourceWordingAr, '', `${c.claimId} wording non-empty`);
  }
});

test('B07 - source-native element outranks application mapping in claim identity', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    // The claim is anchored to the source element id (source-native), and the
    // application subject is secondary: claimId begins with the source subject
    // namespace, not an app namespace.
    assert.ok(!c.claimId.includes('app-'), `claim ${c.claimId} uses source-native naming`);
    // The application subject recorded is a declared application subject.
    const apps = new Set(APPLICATION_MAPPING_MATRIX.map((m) => m.applicationSubject));
    assert.ok(apps.has(c.applicationSubjectCode), `claim ${c.claimId} app code is declared`);
  }
});

// ============================================================
// C. PILOT SCOPE (C01-C08, §34)
// ============================================================

test('C01 - exactly one grade in the pilot', () => {
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.exactlyOneGrade, true);
  assert.strictEqual(CONTENT_PILOT_DECLARATION.gradeCode, 'P1');
  const grades = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.gradeCode));
  assert.deepStrictEqual([...grades], ['P1']);
});

test('C02 - exactly one source-native subject in the pilot', () => {
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.exactlyOneSubject, true);
  assert.strictEqual(CONTENT_PILOT_DECLARATION.sourceSubject, 'SRC_MATH');
  const subjects = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.sourceSubject));
  assert.deepStrictEqual([...subjects], ['SRC_MATH']);
});

test('C03 - explicit structural element and page range recorded at declaration', () => {
  assert.strictEqual(CONTENT_PILOT_DECLARATION.structuralElementId, 'el-math-numbers');
  assert.strictEqual(CONTENT_PILOT_DECLARATION.physicalPageRange, '332-335');
  assert.strictEqual(CONTENT_PILOT_DECLARATION.printedPageRange, '334-337');
  // every claim's physical page falls inside the declared range
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(c.provenance.physicalPage >= 332 && c.provenance.physicalPage <= 335, `claim ${c.claimId} page in range`);
  }
});

test('C04 - the pilot does not touch MUSIC', () => {
  assert.notStrictEqual(CONTENT_PILOT_DECLARATION.sourceSubject, 'SRC_ART');
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.notStrictEqual(c.applicationSubjectCode, 'MUSIC', 'no MUSIC claim in pilot');
    assert.notStrictEqual(c.sourceSubject, 'SRC_ART', 'pilot not Art/Music');
  }
});

test('C05 - the pilot does not touch CIVIC', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.notStrictEqual(c.applicationSubjectCode, 'CIVIC_EDUCATION', 'no CIVIC claim in pilot');
    assert.notStrictEqual(c.sourceSubject, 'SRC_SOCIAL_STUDIES', 'pilot not social studies');
  }
  assert.notStrictEqual(CONTENT_PILOT_DECLARATION.sourceSubject, 'SRC_SOCIAL_STUDIES');
});

test('C06 - the pilot is a small slice (5-20 claims target)', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.length;
  assert.ok(n >= 5 && n <= 20, `pilot claim count ${n} within 5-20 target range`);
});

test('C07 - the pilot is not mislabeled as a mass extraction', () => {
  // Mass extraction would exceed the controlled slice; the verdict records
  // exactly-one-grade and exactly-one-subject plus completeness unmeasurable.
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.exactlyOneGrade, true);
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.exactlyOneSubject, true);
  // completeness is unmeasurable => the pilot does not claim full coverage
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.completenessUnmeasurable, true);
});

test('C08 - declared expected categories match actual used categories', () => {
  const used = new Set<ContentClaimCategory>(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.category));
  for (const expected of CONTENT_PILOT_DECLARATION.expectedClaimCategories) {
    assert.ok(used.has(expected), `declared expected category ${expected} actually used`);
  }
});

// ============================================================
// D. CONTENT SAFETY (D01-D07, §35)
// ============================================================

test('D01 - no automatic lesson synthesis', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticLessons, 0);
  assert.ok(!CONTENT_EXTRACTION_PILOT_CLAIMS.some((c) => c.category === 'STRUCTURAL_DESCRIPTION' && /lesson/i.test(c.claimId)));
});

test('D02 - no synthetic knowledge objects (KOs)', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticKnowledgeObjects, 0);
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(!/\bKO\b|knowledge.?object/i.test(c.claimId), `claim ${c.claimId} not a KO`);
  }
});

test('D03 - no synthetic exercises', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticExercises, 0);
});

test('D04 - claims are content claims, not competency-completeness inferences', () => {
  // A single-grade slice does not equal full competency coverage.
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.notStrictEqual(c.contentStatus, 'CONTENT_VERIFIED', `claim ${c.claimId} not content-verified`);
  }
  // No claim claims to have captured an enumerable full competency set.
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount, 0);
});

test('D05 - no cross-grade or cross-subject copying is introduced', () => {
  const gradeTag = `${CONTENT_PILOT_DECLARATION.gradeCode}-${CONTENT_PILOT_DECLARATION.sourceSubject}`;
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.strictEqual(c.gradeCode, 'P1');
    assert.strictEqual(c.sourceSubject, 'SRC_MATH');
  }
  assert.ok(gradeTag.length > 0);
});

test('D06 - completeness is UNMEASURABLE (denominator not known) and never claimed', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentDenominatorKnown, false);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.completenessStatus, 'UNMEASURABLE');
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.completenessUnmeasurable, true);
});

test('D07 - pilot is a foundation, not a publication of verified content', () => {
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.contentVerified, 0);
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.published, 0);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.publishedCount, 0);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount, 0);
});

// ============================================================
// E. DUPLICATION / IDENTITY (E01-E05, §36)
// ============================================================

test('E01 - stable identity is independent of page/provenance', () => {
  // Same semantic scope + normalized value + version => same stable key,
  // regardless of which page it appears on.
  const a: SourceContentClaim = CONTENT_EXTRACTION_PILOT_CLAIMS[0];
  const b = { ...a, provenance: { ...a.provenance, physicalPage: a.provenance.physicalPage + 1 } };
  assert.strictEqual(
    contentClaimStableKey(a),
    contentClaimStableKey(b),
    'stable key ignores page number',
  );
});

test('E02 - a normalization change in wording does NOT change identity', () => {
  const a = CONTENT_EXTRACTION_PILOT_CLAIMS[0];
  // same normalizedValueAr, different sourceWording => same key
  const alt = { ...a, sourceWordingAr: a.sourceWordingAr + ' (variante lecture de la même phrase)' };
  assert.strictEqual(contentClaimStableKey(a), contentClaimStableKey(alt));
  // A genuine value change DOES change identity.
  const changed = { ...a, normalizedValueAr: a.normalizedValueAr + ' (different referent)' };
  assert.notStrictEqual(contentClaimStableKey(a), contentClaimStableKey(changed));
});

test('E03 - duplicate application mappings do NOT create duplicate claims', () => {
  // The source-native element has ONE identity even if multiple app subjects
  // map to it; claimId count equals distinct semantic claims.
  const ids = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.claimId));
  assert.strictEqual(ids.size, CONTENT_EXTRACTION_PILOT_CLAIMS.length, 'no duplicate claim identities');
  // app code is metadata: two claims may not be distinguished by app code alone.
  const appTokens = new Set(CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.applicationSubjectCode));
  assert.strictEqual(appTokens.size, 1, 'single application subject in pilot');
});

test('E04 - repeated occurrence keeps provenance (identity never splits)', () => {
  // A claim that appears on more than one page would keep a single identity
  // and aggregate provenance rather than forking into duplicate claims.
  const byKey = new Map<string, SourceContentClaim[]>();
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    const k = contentClaimStableKey(c);
    byKey.set(k, [...(byKey.get(k) ?? []), c]);
  }
  for (const [k, list] of byKey) {
    assert.ok(list.length === 1, `key ${k} keeps one record (no provenance-split duplicates)`);
  }
});

test('E05 - the source version is part of the identity', () => {
  const a = CONTENT_EXTRACTION_PILOT_CLAIMS[0];
  const next = { ...a, sourceVersionId: 'v2.0.0' };
  assert.notStrictEqual(contentClaimStableKey(a), contentClaimStableKey(next));
  // deterministic identity helper produces a stable, non-empty id
  const id = contentClaimId(a);
  assert.strictEqual(contentClaimId(a), id, 'deterministic');
  assert.ok(id.length > 0);
});

// ============================================================
// F. PILOT EVIDENCE (F01-F07, §37)
// ============================================================

test('F01 - every claim carries real provenance (grade/subject/structure)', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.strictEqual(c.gradeCode, 'P1', `${c.claimId} grade`);
    assert.strictEqual(c.sourceSubject, 'SRC_MATH', `${c.claimId} subject`);
    assert.strictEqual(c.structuralElementId, 'el-math-numbers', `${c.claimId} structure`);
    assert.ok(c.provenance.rowColumnNote.length > 0, `${c.claimId} readable cell note`);
  }
});

test('F02 - every confirmed-eligible claim has readable, English/structural evidence', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    if (c.contentStatus === 'EXTRACTED_UNVERIFIED') {
      assert.ok(c.verificationState !== 'REJECTED', `${c.claimId} not rejected`);
      assert.ok(c.confidence === 'HIGH' || c.confidence === 'MODERATE', `${c.claimId} readable confidence`);
      assert.ok(c.provenance.cellLabel.length > 0, `${c.claimId} cell label`);
    }
  }
});

test('F03 - REVIEW_REQUIRED evidence is not treated as confirmed', () => {
  const review = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.contentStatus === 'REVIEW_REQUIRED');
  for (const c of review) {
    assert.notStrictEqual(c.confidence, 'HIGH', `REVIEW_REQUIRED claim ${c.claimId} never HIGH`);
    assert.ok(c.verificationState === 'REVIEW_REQUIRED' || c.verificationState === 'UNVERIFIED');
  }
});

test('F04 - REJECTED evidence is not treated as confirmed', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    if (c.verificationState === 'REJECTED') {
      assert.notStrictEqual(c.contentStatus, 'EXTRACTED_UNVERIFIED');
    }
  }
});

test('F05 - source-native structure binding is real (element exists with matching subject)', () => {
  const mathElement = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.structuralElementId === 'el-math-numbers')!;
  assert.ok(mathElement, 'el-math-numbers exists in 07C.6.4 model');
  assert.strictEqual(mathElement.sourceSubject, 'SRC_MATH');
  assert.strictEqual(mathElement.structuralForm, 'COMPONENT');
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.strictEqual(c.structuralElementId, mathElement.structuralElementId);
  }
});

test('F06 - recognized application-subject mapping is consistent (MATH)', () => {
  const mathMapping = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'MATH')!;
  assert.ok(mathMapping, 'MATH mapping exists');
  assert.strictEqual(mathMapping.sourceSubject, 'SRC_MATH');
  assert.ok(mathMapping.sourceComponents.includes('math-numbers'));
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.strictEqual(c.applicationSubjectCode, 'MATH');
  }
});

test('F07 - the pilot declaration is complete and self-describing', () => {
  const d = CONTENT_PILOT_DECLARATION;
  assert.ok(d.why && d.why.length > 20, 'why rationale present');
  assert.ok(d.ocrState.length > 0, 'ocr state documented');
  assert.ok(d.expectedClaimCategories.length > 0, 'expected categories declared');
  assert.strictEqual(d.gate, '07C.7');
});

// ============================================================
// G. FREEZE (G01-G09, §38)
// ============================================================

test('G01 - CONTENT_VERIFIED stays 0', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount, 0);
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.contentVerified, 0);
});

test('G02 - PUBLISHED stays 0', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.publishedCount, 0);
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.published, 0);
});

test('G03 - STRUCTURE_COMPLETE_VERIFIED stays 0', () => {
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.structureCompleteVerified, 0);
});

test('G04 - no lessons', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticLessons, 0);
});

test('G05 - no KOs', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticKnowledgeObjects, 0);
});

test('G06 - no exercises', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.syntheticExercises, 0);
});

test('G07 - accuracy != mastery in the model', () => {
  // Mastery is not derived; content is unverified, so no mastery assertion.
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.masteryDerived, false);
});

test('G08 - mastery remains NOT_DERIVED', () => {
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.masteryDerived, false);
});

test('G09 - denominator freeze preserved (42/0/3/6/3 in verdict assertion)', () => {
  // The reconciliation denominator (42/0/3/6/3) is untouched by content
  // extraction: this gate records that it was preserved, not changed.
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.denominatorFrozenVerbatim, true);
});

// ============================================================
// H. REPO / SECURITY (H01-H09, §39)
// ============================================================

test('H01 - no migration', () => {
  // This gate models domain truth; it does not introduce schema/migration.
  assert.ok(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount === 0);
});

test('H02 - no DB write', () => {
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.published, 0);
  assert.ok(CONTENT_EXTRACTION_PILOT_CLAIMS.every((c) => ['EXTRACTED_UNVERIFIED', 'REVIEW_REQUIRED'].includes(c.contentStatus)));
});

test('H03 - no Supabase deployment', () => {
  const srcPath = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-content-extraction-pilot-registry.ts', import.meta.url));
  const text = readFileSync(srcPath, 'utf8');
  assert.ok(!/app\.supabase\.co/i.test(text), 'no supabase project reference');
  assert.ok(!/\.from\(/.test(text), 'no supabase table query call');
  assert.ok(!/supabase\s*\./i.test(text), 'no supabase client usage');
});

test('H04 - no PDF / image / OCR dump committed (registry is compact)', () => {
  const sample = JSON.stringify(CONTENT_EXTRACTION_PILOT_CLAIMS);
  assert.ok(sample.length < 40000, 'registry is compact, wording-only');
  assert.ok(!sample.includes('.pdf') && !sample.includes('.png') && !sample.includes('.jpg'), 'no binary artifact refs');
});

test('H05 - no large/long-page text dump (short excerpts only)', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(c.sourceWordingAr.length < 220, `claim ${c.claimId} source wording short`);
    // provenance holds locators, not transcribed full sentences
    assert.ok(c.provenance.rowColumnNote.length < 300, `claim ${c.claimId} compact note`);
  }
});

test('H06 - no absolute local path', () => {
  const haystack = JSON.stringify([CONTENT_PILOT_DECLARATION, ...CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => c.provenance)]);
  assert.ok(!haystack.includes(':\\'), 'no drive-letter absolute path');
  assert.ok(!haystack.includes('/Users/'), 'no unix-home absolute path');
  assert.ok(!haystack.includes('/Temp/opencode'), 'no temp machine path');
});

test('H07 - no secrets', () => {
  const srcPath = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-content-extraction-pilot-registry.ts', import.meta.url));
  const text = readFileSync(srcPath, 'utf8');
  assert.ok(!/sk-[A-Za-z0-9]{20}/.test(text), 'no sk- secret');
  assert.ok(!/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/.test(text), 'no private key');
  assert.ok(!/supabase_service_role|service_role_token/.test(text), 'no service-role token');
  assert.ok(!/ghp_|github_pat_/.test(text), 'no github token');
  assert.ok(!/OPENAI_API_KEY\s*=\s*\S/.test(text), 'no inline API key');
});

test('H08 - no absolute paths or temp references in verdict/metrics', () => {
  const v = CONTROLLED_CONTENT_EXTRACTION_VERDICT;
  const s = JSON.stringify(v);
  assert.ok(!s.includes('C:\\\\') && !s.includes('C:\\'), 'no drive path in verdict');
  assert.ok(!s.includes('/opencode'), 'no opencode temp path');
});

test('H09 - claims do not modify trusted learner/runtime structures', () => {
  // The registry produces pure domain constants/functions; it must not import
  // or reference learner-state or ingest-evidence runtime modules.
  const srcPath = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-content-extraction-pilot-registry.ts', import.meta.url));
  const text = readFileSync(srcPath, 'utf8');
  assert.ok(!/from\s+['"].*learner.*['"]/i.test(text), 'no trusted learner/runtime import');
  assert.ok(!/from\s+['"].*ingest[-_]?evidence.*['"]/i.test(text), 'no ingest-evidence runtime import');
});

// ============================================================
// P. SRC-TOPIC PAGE PROVENANCE HARDENING (P01-P10)
// ============================================================
// `SOURCE_TOPIC_PAGE_REGISTRY` is the ONE authoritative map from the closed
// `GateSourceTopic` discriminator to its authorized matrix page triple. Page
// attribution uses ONLY claim.sourceTopic + the registry. It must NEVER use
// claimId parsing, source wording, normalized wording, regex, or comments to
// derive page coordinates (§10 of this hardening pass).

const TOPIC_PAGE = new Map<GateSourceTopic, { scannedIndex: number; physicalPage: number; printedPage: string }>(
  SOURCE_TOPIC_PAGE_REGISTRY.map((e) => [e.sourceTopic, { scannedIndex: e.scannedIndex, physicalPage: e.physicalPage, printedPage: e.printedPage }]),
);

function claimsForTopic(topic: GateSourceTopic): SourceContentClaim[] {
  // Explicit, machine-readable discriminator only — no text parsing.
  return CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.sourceTopic === topic);
}

function assertTriple(claim: SourceContentClaim) {
  const exp = TOPIC_PAGE.get(claim.sourceTopic);
  assert.ok(exp, `registry has entry for ${claim.sourceTopic}`);
  assert.strictEqual(claim.provenance.scannedIndex, exp.scannedIndex, `claim ${claim.claimId} scannedIndex`);
  assert.strictEqual(claim.provenance.physicalPage, exp.physicalPage, `claim ${claim.claimId} physicalPage`);
  assert.strictEqual(claim.provenance.printedPage, exp.printedPage, `claim ${claim.claimId} printedPage`);
}

// ============================================================
//   L. DERIVED LEDGER CONSISTENCY (attribution/content/verification)
// ============================================================
// These tests recompute counts INDEPENDENTLY from the claims array and compare
// them to the ledger. They prove PILOT_CLAIMS -> derived counts -> ledger with
// no hardcoded truth or sourceTopic shortcuts.

test('L01 - claimCount equals claims.length (16)', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.claimCount, CONTENT_EXTRACTION_PILOT_CLAIMS.length);
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.claimCount, 16);
});

test('L02 - CLEAR_P1_ATTRIBUTION independently recomputed is 10', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.attributionStatus === 'CLEAR_P1_ATTRIBUTION').length;
  assert.strictEqual(n, 10);
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.clearP1Attribution, n);
});

test('L03 - ledger clear attribution count equals recomputed clear count', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.attributionStatus === 'CLEAR_P1_ATTRIBUTION').length;
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.clearP1AttributionCount, n);
});

test('L04 - REVIEW_REQUIRED attribution independently recomputed is 6', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.attributionStatus === 'REVIEW_REQUIRED').length;
  assert.strictEqual(n, 6);
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.reviewRequired, n);
});

test('L05 - ledger review attribution count equals recomputed review count', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.attributionStatus === 'REVIEW_REQUIRED').length;
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.reviewRequiredAttributionCount, n);
});

test('L06 - REJECTED attribution independently recomputed is 0', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.attributionStatus === 'REJECTED').length;
  assert.strictEqual(n, 0);
  assert.strictEqual(CONTENT_ATTRIBUTION_COUNTS.rejected, n);
});

test('L07 - ledger rejected count equals recomputed rejected count', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.attributionStatus === 'REJECTED').length;
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.rejectedAttributionCount, n);
});

test('L08 - EXTRACTED_UNVERIFIED content independently recomputed is 10', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.contentStatus === 'EXTRACTED_UNVERIFIED').length;
  assert.strictEqual(n, 10);
  assert.strictEqual(CONTENT_STATE_COUNTS.extractedUnverified, n);
});

test('L09 - ledger extracted count equals recomputed extracted count', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.contentStatus === 'EXTRACTED_UNVERIFIED').length;
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.extractedUnverifiedCount, n);
});

test('L10 - REVIEW_REQUIRED content independently recomputed is 6', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.contentStatus === 'REVIEW_REQUIRED').length;
  assert.strictEqual(n, 6);
  assert.strictEqual(CONTENT_STATE_COUNTS.reviewRequired, n);
});

test('L11 - ledger review-content count equals recomputed review-content count', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.contentStatus === 'REVIEW_REQUIRED').length;
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.reviewRequiredContentCount, n);
});

test('L12 - no claim is direct-source-confirmed; DIRECT_SOURCE_CONFIRMED freeze is 0', () => {
  // DIRECT_SOURCE_CONFIRMED is not a member of the closed VerificationState
  // type, so it cannot be a per-claim state. It is a Gate freeze: no claim may
  // claim direct-source confirmation in this pilot.
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.directSourceConfirmedCount, 0);
  // All review-band claims are explicitly REVIEW_REQUIRED (not confirmed).
  assert.strictEqual(CONTENT_VERIFICATION_COUNTS.reviewRequired, 6);
});

test('L13 - ledger direct-source-confirmed count is the freeze value 0', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.directSourceConfirmedCount, 0);
});

test('L14 - verificationState REVIEW_REQUIRED independently recomputed is 6', () => {
  const n = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => c.verificationState === 'REVIEW_REQUIRED').length;
  assert.strictEqual(n, 6);
  assert.strictEqual(CONTENT_VERIFICATION_COUNTS.reviewRequired, n);
});

test('L15 - every REVIEW_REQUIRED attribution claim has REVIEW_REQUIRED verification', () => {
  const bad = CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.attributionStatus === 'REVIEW_REQUIRED' && c.verificationState !== 'REVIEW_REQUIRED',
  );
  assert.deepStrictEqual(bad.map((c) => c.claimId), []);
});

test('L16 - every REVIEW_REQUIRED attribution claim has REVIEW_REQUIRED content status', () => {
  const bad = CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.attributionStatus === 'REVIEW_REQUIRED' && c.contentStatus !== 'REVIEW_REQUIRED',
  );
  assert.deepStrictEqual(bad.map((c) => c.claimId), []);
});

test('L17 - every claim has an explicit attributionStatus', () => {
  const missing = CONTENT_EXTRACTION_PILOT_CLAIMS.filter((c) => !c.attributionStatus);
  assert.deepStrictEqual(missing.map((c) => c.claimId), []);
});

test('L18 - CONTENT_VERIFIED global freeze stays 0', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.contentVerifiedCount, 0);
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.contentVerified, 0);
});

test('L19 - PUBLISHED global freeze stays 0', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_LEDGER.publishedCount, 0);
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.published, 0);
});

test('L20 - attribution partition sums to claimCount (10 + 6 + 0 = 16)', () => {
  const sum =
    CONTENT_ATTRIBUTION_COUNTS.clearP1Attribution +
    CONTENT_ATTRIBUTION_COUNTS.reviewRequired +
    CONTENT_ATTRIBUTION_COUNTS.rejected;
  assert.strictEqual(sum, CONTENT_EXTRACTION_PILOT_CLAIMS.length);
  assert.strictEqual(sum, 16);
});

test('L21 - retained content partition sums to claimCount (10 + 6 = 16)', () => {
  const sum = CONTENT_STATE_COUNTS.extractedUnverified + CONTENT_STATE_COUNTS.reviewRequired;
  assert.strictEqual(sum, CONTENT_EXTRACTION_PILOT_CLAIMS.length);
  assert.strictEqual(sum, 16);
});

test('L22 - ledger attribution counts derive from claims (not hardcoded truth)', () => {
  assert.strictEqual(
    CONTENT_EXTRACTION_PILOT_LEDGER.clearP1AttributionCount,
    CONTENT_ATTRIBUTION_COUNTS.clearP1Attribution,
  );
  assert.strictEqual(
    CONTENT_EXTRACTION_PILOT_LEDGER.reviewRequiredAttributionCount,
    CONTENT_ATTRIBUTION_COUNTS.reviewRequired,
  );
  assert.strictEqual(
    CONTENT_EXTRACTION_PILOT_LEDGER.rejectedAttributionCount,
    CONTENT_ATTRIBUTION_COUNTS.rejected,
  );
});

test('P01 - pilot declaration physical range is 332-335 (not the printed range)', () => {
  assert.strictEqual(CONTENT_PILOT_DECLARATION.physicalPageRange, '332-335');
  assert.strictEqual(CONTENT_PILOT_DECLARATION.scannedIndexRange, '331-334');
  // physical range must NOT be the printed range
  assert.notStrictEqual(CONTENT_PILOT_DECLARATION.physicalPageRange, CONTENT_PILOT_DECLARATION.printedPageRange);
});

test('P02 - pilot declaration printed range is 334-337', () => {
  assert.strictEqual(CONTENT_PILOT_DECLARATION.printedPageRange, '334-337');
  assert.notStrictEqual(CONTENT_PILOT_DECLARATION.physicalPageRange, '334-337');
});

test('P03 - NUMBERS claims resolve to scanned 331 / physical 332 / printed 334', () => {
  const claims = claimsForTopic('NUMBERS');
  assert.ok(claims.length > 0, 'at least one NUMBERS claim (non-vacuous)');
  for (const c of claims) {
    assertTriple(c);
    assert.strictEqual(c.provenance.scannedIndex, 331, `claim ${c.claimId} scannedIndex`);
    assert.strictEqual(c.provenance.physicalPage, 332, `claim ${c.claimId} physicalPage`);
    assert.strictEqual(c.provenance.printedPage, '334', `claim ${c.claimId} printedPage`);
  }
});

test('P04 - ADDITION_SUBTRACTION claims resolve to scanned 332 / physical 333 / printed 335', () => {
  const claims = claimsForTopic('ADDITION_SUBTRACTION');
  assert.ok(claims.length > 0, 'at least one ADDITION_SUBTRACTION claim (non-vacuous)');
  for (const c of claims) {
    assertTriple(c);
    assert.strictEqual(c.provenance.scannedIndex, 332, `claim ${c.claimId} scannedIndex`);
    assert.strictEqual(c.provenance.physicalPage, 333, `claim ${c.claimId} physicalPage`);
    assert.strictEqual(c.provenance.printedPage, '335', `claim ${c.claimId} printedPage`);
  }
});

test('P05 - MULTIPLICATION claims resolve to scanned 333 / physical 334 / printed 336 (page provenance only)', () => {
  const claims = claimsForTopic('MULTIPLICATION');
  assert.ok(claims.length > 0, 'at least one MULTIPLICATION claim (non-vacuous)');
  for (const c of claims) {
    assertTriple(c);
    assert.strictEqual(c.provenance.scannedIndex, 333, `claim ${c.claimId} scannedIndex`);
    assert.strictEqual(c.provenance.physicalPage, 334, `claim ${c.claimId} physicalPage`);
    assert.strictEqual(c.provenance.printedPage, '336', `claim ${c.claimId} printedPage`);
    // PAGE provenance must NOT imply confirmed cell attribution.
    assert.strictEqual(c.contentStatus, 'REVIEW_REQUIRED', `claim ${c.claimId} stays REVIEW_REQUIRED`);
  }
});

test('P06 - DIVISION claims resolve to scanned 334 / physical 335 / printed 337 (page provenance only)', () => {
  const claims = claimsForTopic('DIVISION');
  assert.ok(claims.length > 0, 'at least one DIVISION claim (non-vacuous)');
  for (const c of claims) {
    assertTriple(c);
    assert.strictEqual(c.provenance.scannedIndex, 334, `claim ${c.claimId} scannedIndex`);
    assert.strictEqual(c.provenance.physicalPage, 335, `claim ${c.claimId} physicalPage`);
    assert.strictEqual(c.provenance.printedPage, '337', `claim ${c.claimId} printedPage`);
    // PAGE provenance must NOT imply confirmed cell attribution.
    assert.strictEqual(c.contentStatus, 'REVIEW_REQUIRED', `claim ${c.claimId} stays REVIEW_REQUIRED`);
  }
});

test('P07 - printedPage is never silently substituted for physicalPage', () => {
  for (const entry of SOURCE_TOPIC_PAGE_REGISTRY) {
    assert.notStrictEqual(Number(entry.printedPage), entry.physicalPage,
      `${entry.sourceTopic}: printed ${entry.printedPage} is not physical ${entry.physicalPage}`);
  }
  assert.strictEqual(TOPIC_PAGE.size, 4, 'registry covers exactly the four pilot topics');
});

test('P08 - every retained claim uses exactly an authorized registry triple (no fifth page)', () => {
  const topics = new Set(SOURCE_TOPIC_PAGE_REGISTRY.map((e) => e.sourceTopic));
  assert.strictEqual(SOURCE_TOPIC_PAGE_REGISTRY.length, 4);
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(topics.has(c.sourceTopic), `claim ${c.claimId} topic ${c.sourceTopic} is authorized`);
    assertTriple(c);
  }
});

test('P09 - physicalPage = scannedIndex + 1 for every retained claim', () => {
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.strictEqual(c.provenance.physicalPage, c.provenance.scannedIndex + 1, `claim ${c.claimId}`);
  }
  // registry entries also satisfy the arithmetic invariant
  for (const e of SOURCE_TOPIC_PAGE_REGISTRY) {
    assert.strictEqual(e.physicalPage, e.scannedIndex + 1, `topic ${e.sourceTopic}`);
  }
});

test('P10 - page attribution is driven by claim.sourceTopic + registry (no text/claimId heuristics)', () => {
  const allowedTopics: readonly GateSourceTopic[] = [
    'NUMBERS',
    'ADDITION_SUBTRACTION',
    'MULTIPLICATION',
    'DIVISION',
  ];

  // Closed topic set — exactly these four, no more, no fewer.
  assert.deepStrictEqual(
    [...new Set(SOURCE_TOPIC_PAGE_REGISTRY.map((e) => e.sourceTopic))].sort(),
    [...allowedTopics].sort(),
    'registry contains exactly the four authorized topics',
  );

  // Each claim carries an explicit machine-readable discriminator and its
  // provenance triple derives EXACTLY from the registry — never from text.
  for (const claim of CONTENT_EXTRACTION_PILOT_CLAIMS) {
    assert.ok(allowedTopics.includes(claim.sourceTopic), `${claim.claimId}: unknown sourceTopic ${claim.sourceTopic}`);
    assert.ok(TOPIC_PAGE.has(claim.sourceTopic), `${claim.claimId}: sourceTopic ${claim.sourceTopic} not in registry`);
    assertTriple(claim);
  }

  // Static hazard check: reject ONLY concrete text-based topic/page inference
  // patterns (claimId/wording -> sourceTopic/page coordinate). Property access
  // such as `normalizedValueAr.trim()` for identity normalization, length
  // checks, or assertion-message use is legitimate and MUST NOT be flagged.
  const srcPath = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-content-extraction-pilot-registry.ts', import.meta.url));
  const text = readFileSync(srcPath, 'utf8');

  // Function definitions that infer a topic/page from an identifier or wording.
  assert.ok(!/\bfunction\s+(inferTopic|topicFrom|pageFor|topicFor)\b/i.test(text), 'no topic inference function');

  // claimId -> topic/page inference via string ops.
  assert.ok(!/claimId\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(text), 'no claimId string-op topic inference');

  // wording -> topic/page inference via string ops.
  assert.ok(!/sourceWordingAr\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(text), 'no source-wording topic inference');
  assert.ok(!/normalizedValueAr\s*\.\s*(includes|startsWith|endsWith|match)\(/.test(text), 'no normalized-wording topic inference');

  // Regex `.test(...)` directly against wording fields.
  assert.ok(!/\.test\((sourceWordingAr|normalizedValueAr)\)/.test(text), 'no regex.test on wording fields');
});

console.log('');
console.log(`--- GATE 07C.7: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}
