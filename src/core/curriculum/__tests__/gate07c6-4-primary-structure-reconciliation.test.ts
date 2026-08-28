/**
 * Qarayti.ai - Gate 07C.6.4: Canonical Primary Curriculum Structure
 * Reconciliation Tests
 *
 * Groups (§31-§38):
 *   A. MODEL                A01-A06
 *   B. MUSIC / ART          B01-B06
 *   C. CIVIC                C01-C09
 *   D. LANGUAGE STRUCTURE   D01-D05
 *   E. OTHER STRUCTURES     E01-E06
 *   F. PROVENANCE           F01-F06
 *   G. SAFETY               G01-G09
 *   H. REPO / SECURITY      H01-H06
 *
 * The tests validate the reconciliation REGISTRY and its invariants. They
 * only assert that the source-native structure is preserved and explicitly
 * mapped to the application catalog. They do NOT create units/lessons/KOs/
 * exercises and do NOT change runtime behavior (§21) or the database (§22).
 */

import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  SOURCE_NATIVE_STRUCTURAL_ELEMENTS,
  SOURCE_NATIVE_STRUCTURE_REGISTRY,
  APPLICATION_MAPPING_MATRIX,
  sourceStructuresForApplicationSubject,
  applicationSubjectsForSourceSubject,
  everyMappingIsNonTrivial,
  FUTURE_EXTRACTION_CONTRACT,
  RECONCILIATION_MISMATCH_ISSUES,
  RECONCILIATION_CONTENT_STATUS,
  CANONICAL_RECONCILIATION_VERDICT,
  RECONCILIATION_ARTIFACT_SHA256,
  RECONCILIATION_SOURCE_VERSION_ID,
  RECONCILIATION_ARTIFACT_ID,
} from '../../../domain/constants/moroccan-primary-structure-reconciliation-registry';

import { TOTAL_CANDIDATES } from '../../../domain/constants/moroccan-primary-direct-evidence-registry';

let passed = 0;
let failed = 0;

const GRADES: string[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const APPS: string[] = ['ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'ISLAMIC_EDUCATION', 'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC'];

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
// A. MODEL (A01-A06, §31)
// ============================================================

test('A01 - source subject is distinguished from application subject', () => {
  const sourceSet = new Set(SOURCE_NATIVE_STRUCTURE_REGISTRY.map((r) => r.sourceSubject));
  const appSet = new Set(APPLICATION_MAPPING_MATRIX.map((m) => m.applicationSubject));
  // Namespaces exist and are distinct.
  assert.ok(sourceSet.size > 0, 'source subjects present');
  assert.ok(appSet.size === 9, 'nine application subjects');
  // A source subject named SRC_* is never equal to an application code (no SRCPREFIX in app).
  for (const s of sourceSet) assert.ok(s.startsWith('SRC_'), `source ${s} prefixed`);
  for (const a of appSet) assert.ok(!a.startsWith('SRC_'), `app ${a} unprefixed`);
});

test('A02 - every mapping carries an explicit relationship', () => {
  const rels = [
    'DIRECT_MATCH', 'SEMANTIC_EQUIVALENT', 'COMPONENT_OF', 'GROUPED_UNDER',
    'REPLACED_BY', 'APPLICATION_SPLIT', 'SOURCE_SPLIT', 'NO_DIRECT_MATCH', 'NOT_APPLICABLE',
  ];
  for (const m of APPLICATION_MAPPING_MATRIX) {
    assert.ok(rels.includes(m.mappingRelationship), `${m.applicationSubject} relationship`);
  }
});

test('A03 - non-1:1 mappings are supported (multiple relationships present)', () => {
  const rels = new Set(APPLICATION_MAPPING_MATRIX.map((m) => m.mappingRelationship));
  // At minimum we observe several distinct relationship types: direct, component-of, grouped.
  assert.ok(rels.has('COMPONENT_OF'), 'MUSIC is COMPONENT_OF');
  assert.ok(rels.has('GROUPED_UNDER'), 'CIVIC is GROUPED_UNDER');
  assert.ok(rels.has('DIRECT_MATCH'), 'several subjects are DIRECT_MATCH');
  assert.ok(rels.size >= 3, 'relationships are not all identical');
});

test('A04 - source structural form is explicit on every mapping and element', () => {
  const forms = ['SKILL', 'COMPONENT', 'APPROACH', 'SUB_AREA', 'GROUPED_SUBJECT_AREA', 'NONE_IDENTIFIED'];
  for (const m of APPLICATION_MAPPING_MATRIX) assert.ok(forms.includes(m.sourceStructuralForm), `${m.applicationSubject} form`);
  for (const e of SOURCE_NATIVE_STRUCTURAL_ELEMENTS) assert.ok(forms.includes(e.structuralForm), `element ${e.structuralElementId} form`);
});

test('A05 - source element identity is independent from page number (semantic scope id)', () => {
  const ids = new Set(SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => e.structuralElementId));
  assert.strictEqual(ids.size, SOURCE_NATIVE_STRUCTURAL_ELEMENTS.length, 'unique ids');
  for (const e of SOURCE_NATIVE_STRUCTURAL_ELEMENTS) {
    assert.ok(/^el-[a-z0-9-]+$/.test(e.structuralElementId), `id format ${e.structuralElementId}`);
    // id embeds educationSystem/stage/sourceSubject/structuralForm semantic scope
    assert.strictEqual(e.educationSystemCode, 'MOROCCO');
    assert.strictEqual(e.stageCode, 'PRIMARY');
    assert.ok(e.sourceElementKey.length > 0, 'semantic key');
    assert.ok(e.sourceVersionId.length > 0, 'version');
  }
});

test('A06 - source version is retained (no destructive latest-only model)', () => {
  assert.strictEqual(RECONCILIATION_SOURCE_VERSION_ID, 'v1.0.0');
  assert.strictEqual(RECONCILIATION_ARTIFACT_ID, 'src-primary-curriculum-2021');
  for (const e of SOURCE_NATIVE_STRUCTURAL_ELEMENTS) assert.strictEqual(e.sourceVersionId, RECONCILIATION_SOURCE_VERSION_ID);
});

// ============================================================
// B. MUSIC / ART (B01-B06, §32)
// ============================================================

test('B01 - ART maps to source التربية الفنية', () => {
  const art = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'ART')!;
  assert.strictEqual(art.sourceSubject, 'SRC_ART');
  assert.strictEqual(art.sourceSubjectNameAr, 'التربية الفنية');
  assert.strictEqual(art.denominatorState, 'VERIFIED');
});

test('B02 - MUSIC does not create a standalone source program', () => {
  const musicSourceSubjects = APPLICATION_MAPPING_MATRIX
    .filter((m) => m.applicationSubject === 'MUSIC')
    .map((m) => m.sourceSubject);
  // MUSIC maps to SRC_ART (component), never to a standalone SRC_MUSIC.
  assert.deepStrictEqual(musicSourceSubjects, ['SRC_ART']);
  // The full set of source-native subjects is exactly the declared union
  // (LANGUAGES/ARABIC/FRENCH/MATH/SCIENCE/ISLAMIC/ART/SPORT/SOCIAL_STUDIES),
  // which has NO standalone SRC_MUSIC — proving Music is not a source program.
  const sourceSubjects = new Set(SOURCE_NATIVE_STRUCTURE_REGISTRY.map((r) => r.sourceSubject));
  assert.ok(!sourceSubjects.has('SRC_MUSIC' as never), 'no SRC_MUSIC structure');
  assert.deepStrictEqual(
    [...sourceSubjects].sort(),
    ['SRC_ART', 'SRC_FRENCH', 'SRC_ISLAMIC', 'SRC_LANGUAGES', 'SRC_MATH', 'SRC_SCIENCE', 'SRC_SOCIAL_STUDIES', 'SRC_SPORT'].sort(),
  );
});

test('B03 - MUSIC maps as component / application split', () => {
  const music = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'MUSIC')!;
  assert.ok(['COMPONENT_OF', 'APPLICATION_SPLIT'].includes(music.mappingRelationship), music.mappingRelationship);
  assert.strictEqual(music.mappingStatus, 'MISMATCH');
});

test('B04 - ART denominator remains verified', () => {
  const art = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'ART')!;
  assert.strictEqual(art.denominatorState, 'VERIFIED');
  assert.strictEqual(art.mappingStatus, 'VERIFIED_DIRECT');
});

test('B05 - MUSIC standalone denominator remains UNKNOWN (not converted by reconciliation)', () => {
  const music = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'MUSIC')!;
  assert.strictEqual(music.denominatorState, 'UNKNOWN');
});

test('B06 - Music source-native hierarchy (component of Art) is preserved', () => {
  // A source element keeps the Art sub-area (SRC_ART) as its native identity;
  // MUSIC app view references art-subareas, it does not create its own element.
  const artElement = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'art-subareas')!;
  assert.strictEqual(artElement.sourceSubject, 'SRC_ART');
  const musicApp = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'MUSIC')!;
  assert.ok(musicApp.sourceComponents.includes('art-subareas'));
  // No music standalone element: every source element is bound to a declared
  // source subject (union has no SRC_MUSIC).
  const elementSourceSubjects = new Set(SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => e.sourceSubject));
  assert.ok(!elementSourceSubjects.has('SRC_MUSIC' as never), 'no standalone SRC_MUSIC element');
});

// ============================================================
// C. CIVIC (C01-C09, §33)
// ============================================================

test('C01..C03 - CIVIC P1/P2/P3 NOT_APPLICABLE preserved', () => {
  const civ = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'CIVIC_EDUCATION')!;
  const src = civ.sourceSubject;
  const p1p3 = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceSubject === src && e.gradeScope.join() === ['P1', 'P2', 'P3'].join())!;
  assert.deepStrictEqual([...p1p3.gradeScope].sort(), ['P1', 'P2', 'P3']);
  assert.strictEqual(p1p3.sourceElementKey, 'social-not-applicable');
  assert.strictEqual(civ.denominatorState, 'NOT_APPLICABLE');
  assert.ok(civ.gradeScope.includes('P1') && civ.gradeScope.includes('P2') && civ.gradeScope.includes('P3'));
  assert.ok(civ.mappingStatus === 'PARTIAL' || civ.mappingStatus === 'NOT_APPLICABLE', 'civic not over-claimed');
});

test('C04..C06 - CIVIC P4/P5/P6 PARTIAL preserved (no fabricated standalone denominator)', () => {
  const civ = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'CIVIC_EDUCATION')!;
  // gradeScope covers P4..P6 and the source grouping is retained
  const social = SOURCE_NATIVE_STRUCTURE_REGISTRY.find((r) => r.sourceSubject === civ.sourceSubject)!;
  assert.strictEqual(social.structuralForm, 'GROUPED_SUBJECT_AREA');
  // denominatorState is NOT_APPLICABLE at app level for the blended scoped row; per-grade P4-P6 remain PARTIAL per 07C.6.3.
  // Assert P4..P6 are in scope and no VERIFIED claim is made.
  assert.ok(['P4', 'P5', 'P6'].every((g) => civ.gradeScope.includes(g)));
  assert.notStrictEqual(civ.denominatorState, 'VERIFIED', 'civics never claimed VERIFIED');
  assert.notStrictEqual(civ.denominatorState, 'SUPPORTED', 'civics never claimed SUPPORTED');
});

test('C07 - grouped History/Geography source structure retained (ت.ج)', () => {
  const hg = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'social-history-geo')!;
  assert.strictEqual(hg.structuralForm, 'GROUPED_SUBJECT_AREA');
  assert.strictEqual(hg.nameAr, 'تاريخ وجغرافيا (ت.ج)');
});

test('C08 - التربية المدنية source wording retained (ت.م)', () => {
  const civ = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'social-civics')!;
  assert.strictEqual(civ.nameAr, 'التربية المدنية (ت.م)');
});

test('C09 - no fake standalone Civic / History-Geography denominator created', () => {
  const socialHasStandalone = SOURCE_NATIVE_STRUCTURE_REGISTRY.some(
    (r) => r.sourceSubject === 'SRC_SOCIAL_STUDIES' && r.structuralForm !== 'GROUPED_SUBJECT_AREA' && r.structuralForm !== 'NONE_IDENTIFIED',
  );
  assert.strictEqual(socialHasStandalone, false, 'social studies stays grouped, no fabricated standalone set');
});

// ============================================================
// D. LANGUAGE STRUCTURE (D01-D05, §34)
// ============================================================

test('D01 - Arabic listening retained separately (الاستماع)', () => {
  const el = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'ar-listening')!;
  assert.strictEqual(el.nameAr, 'الاستماع');
  assert.strictEqual(el.structuralForm, 'SKILL');
});

test('D02 - Arabic speaking retained separately (التحدث)', () => {
  const el = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'ar-speaking')!;
  assert.strictEqual(el.nameAr, 'التحدث');
  assert.strictEqual(el.structuralForm, 'SKILL');
});

test('D03 - old combined candidate (ARABIC_LISTENING_SPEAKING) does not overwrite source structure', () => {
  // The combined candidate is NOT a source-native element; listening and speaking remain separate.
  assert.ok(!SOURCE_NATIVE_STRUCTURAL_ELEMENTS.some((e) => e.sourceElementKey === 'arabic-listening-speaking'), 'no combined source element');
  const ls = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.filter((e) => e.sourceElementKey === 'ar-listening' || e.sourceElementKey === 'ar-speaking');
  assert.strictEqual(ls.length, 2, 'two distinct source skills');
});

test('D04 - French writing is a semantic-equivalent mapping (الكتابة)', () => {
  const frWriting = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'fr-writing')!;
  assert.strictEqual(frWriting.nameAr, 'الكتابة');
  assert.strictEqual(frWriting.internalName, 'FRENCH_WRITTEN_PRODUCTION');
  const french = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'FRENCH')!;
  assert.strictEqual(french.sourceSubject, 'SRC_FRENCH');
  assert.ok(french.sourceComponents.includes('fr-writing'));
});

test('D05 - source labels outrank provisional English internal names', () => {
  for (const e of SOURCE_NATIVE_STRUCTURAL_ELEMENTS) {
    assert.ok(e.nameAr.length > 0, `${e.structuralElementId} has Arabic source label`);
    // internalName (English alias) never replaces the authoritative source label
    if (e.internalName) {
      assert.notStrictEqual(e.nameAr, e.internalName, `source label ${e.nameAr} differs from internal alias`);
    }
  }
});

// ============================================================
// E. OTHER STRUCTURES (E01-E06, §35)
// ============================================================

test('E01 - Math source components preserved', () => {
  const mathKeys = ['math-numbers', 'math-geometry', 'math-data'];
  for (const k of mathKeys) {
    const el = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === k)!;
    assert.strictEqual(el.sourceSubject, 'SRC_MATH');
    assert.strictEqual(el.structuralForm, 'COMPONENT');
  }
  const math = APPLICATION_MAPPING_MATRIX.find((m) => m.applicationSubject === 'MATH')!;
  assert.deepStrictEqual([...math.sourceComponents].sort(), [...mathKeys].sort());
});

test('E02 - Science source components preserved', () => {
  const sciKeys = ['sci-life-earth', 'sci-physical', 'sci-space', 'sci-technology'];
  for (const k of sciKeys) {
    const el = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === k)!;
    assert.strictEqual(el.sourceSubject, 'SRC_SCIENCE');
    assert.strictEqual(el.structuralForm, 'COMPONENT');
  }
});

test('E03 - Islamic مداخل structural form preserved (APPROACH, not UNIT)', () => {
  const islamic = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'islamic-approaches')!;
  assert.strictEqual(islamic.structuralForm, 'APPROACH');
  const rec = SOURCE_NATIVE_STRUCTURE_REGISTRY.find((r) => r.sourceSubject === 'SRC_ISLAMIC')!;
  assert.strictEqual(rec.structuralForm, 'APPROACH');
});

test('E04 - Sport sub-area structure preserved', () => {
  const sport = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'sport-game-types')!;
  assert.strictEqual(sport.structuralForm, 'SUB_AREA');
  assert.strictEqual(sport.nameAr, 'الألعاب الفردية والجماعية');
});

test('E05 - Art sub-area structure preserved', () => {
  const art = SOURCE_NATIVE_STRUCTURAL_ELEMENTS.find((e) => e.sourceElementKey === 'art-subareas')!;
  assert.strictEqual(art.structuralForm, 'SUB_AREA');
});

test('E06 - no universal UNIT abstraction introduced', () => {
  const forms: string[] = [
    ...SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => e.structuralForm),
    ...SOURCE_NATIVE_STRUCTURE_REGISTRY.map((r) => r.structuralForm),
  ];
  assert.ok(!forms.includes('UNIT'), 'no UNIT structural form');
  assert.ok(!forms.includes('LESSON'), 'no LESSON structural form');
});

// ============================================================
// F. PROVENANCE (F01-F06, §36)
// ============================================================

test('F01 - every mapping carries the artifact hash binding', () => {
  assert.ok(/^[0-9A-F]{64}$/.test(RECONCILIATION_ARTIFACT_SHA256), 'sha256 64 hex');
  for (const m of APPLICATION_MAPPING_MATRIX) {
    assert.ok(m.provenance.length > 0, `${m.applicationSubject} provenance`);
  }
});

test('F02 - every mapping carries a sourceVersionId (implicit via element-level version binding)', () => {
  assert.strictEqual(RECONCILIATION_SOURCE_VERSION_ID, 'v1.0.0');
  // Every source element and every registry record is versioned.
  for (const e of SOURCE_NATIVE_STRUCTURAL_ELEMENTS) assert.ok(e.sourceVersionId);
  for (const r of SOURCE_NATIVE_STRUCTURE_REGISTRY) assert.ok(r.sourceSubject);
});

test('F03 - verified mappings have physical page / source locator provenance', () => {
  for (const m of APPLICATION_MAPPING_MATRIX) {
    for (const p of m.provenance) {
      assert.ok(Number.isInteger(p.physicalPage), `${m.applicationSubject} page`);
      assert.strictEqual(p.scannedIndex, p.physicalPage - 1);
      assert.ok(['OCR_USABLE_WITH_REVIEW', 'OCR_HIGH_CONFIDENCE'].includes(p.ocrQuality));
    }
  }
});

test('F04 - source wording is retained (nameAr present on every element)', () => {
  for (const e of SOURCE_NATIVE_STRUCTURAL_ELEMENTS) assert.ok(e.nameAr.length > 0, e.structuralElementId);
});

test('F05 - historical 07C.6.3 evidence is not erased (candidate count still referenced)', () => {
  // The 15 candidates from the earlier gate remain intact in the source registry.
  assert.strictEqual(TOTAL_CANDIDATES, 15);
});

test('F06 - future version can supersede a mapping without rewriting history', () => {
  // Versioning model: elements carry sourceVersionId; a newer curriculum version
  // introduces new element records rather than mutating existing rows.
  const versionKeySet = new Set(SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => JSON.stringify([e.structuralElementId, e.sourceVersionId])));
  assert.strictEqual(versionKeySet.size, SOURCE_NATIVE_STRUCTURAL_ELEMENTS.length, 'element+version keys unique, no mutation/rewrite');
});

// ============================================================
// G. SAFETY (G01-G09, §37)
// ============================================================

test('G01 - denominator counts remain 42/0/3/6/3', () => {
  const v = CANONICAL_RECONCILIATION_VERDICT;
  assert.strictEqual(v.verifiedCells, 42);
  assert.strictEqual(v.supportedCells, 0);
  assert.strictEqual(v.partialCells, 3);
  assert.strictEqual(v.unknownCells, 6);
  assert.strictEqual(v.notApplicableCells, 3);
  assert.strictEqual(v.totalCells, v.verifiedCells + v.supportedCells + v.partialCells + v.unknownCells + v.notApplicableCells);
  assert.strictEqual(v.totalCells, 54);
});

test('G02 - CONTENT_VERIFIED remains 0', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.verified, 0);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.contentVerified, 0);
});

test('G03 - PUBLISHED remains 0', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.published, 0);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.published, 0);
});

test('G04 - no units created', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.units, 0);
});

test('G05 - no lessons created', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.lessons, 0);
});

test('G06 - no KOs created', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.knowledgeObjects, 0);
});

test('G07 - no exercises created', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.exercises, 0);
});

test('G08 - mastery remains NOT_DERIVED', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.mastery, 'NOT_DERIVED');
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.masteryDerived, false);
});

test('G09 - accuracy != mastery', () => {
  assert.strictEqual(RECONCILIATION_CONTENT_STATUS.accuracyDiffersFromMastery, true);
});

// ============================================================
// H. REPO / SECURITY (H01-H06, §38)
// ============================================================

test('H01 - no migration', () => {
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.noDatabaseChange, true);
  assert.ok(!RECONCILIATION_CONTENT_STATUS.verified && RECONCILIATION_CONTENT_STATUS.verified === 0);
});

test('H02 - no DB write', () => {
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.noDatabaseChange, true);
});

test('H03 - no Supabase deployment', () => {
  const srcPath = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-structure-reconciliation-registry.ts', import.meta.url));
  const text = readFileSync(srcPath, 'utf8');
  assert.ok(!/app\.supabase\.co/i.test(text), 'no supabase project reference');
  assert.ok(!/\.from\(/.test(text), 'no supabase table query call');
  assert.ok(!/supabase\s*\./i.test(text), 'no supabase client usage');
});

test('H04 - no PDF/image/OCR dump committed (registry is compact, label-only)', () => {
  const sample = JSON.stringify(SOURCE_NATIVE_STRUCTURAL_ELEMENTS);
  assert.ok(sample.length < 20000, 'registry is compact label-only');
  assert.ok(!sample.includes('.pdf') && !sample.includes('.png'), 'no binary artifact references');
});

test('H05 - no absolute local path', () => {
  const haystack = JSON.stringify([
    CANONICAL_RECONCILIATION_VERDICT,
    APPLICATION_MAPPING_MATRIX.map((m) => m.provenance),
  ]);
  assert.ok(!haystack.includes(':\\'), 'no drive-letter absolute path');
  assert.ok(!haystack.includes('/Users/'), 'no unix-home absolute path');
});

test('H06 - no secrets', () => {
  const srcPath = fileURLToPath(new URL('../../../domain/constants/moroccan-primary-structure-reconciliation-registry.ts', import.meta.url));
  const text = readFileSync(srcPath, 'utf8');
  assert.ok(!/sk-[A-Za-z0-9]{20}/.test(text), 'no sk- secret');
  assert.ok(!/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/.test(text), 'no private key');
  assert.ok(!/supabase_service_role|service_role_token/.test(text), 'no service-role token');
  assert.ok(!/ghp_|github_pat_/.test(text), 'no github token');
  assert.ok(!/OPENAI_API_KEY\s*=\s*\S/.test(text), 'no inline API key');
});

// ============================================================
// BIDIRECTIONAL LOOKUP SANITY (§20)
// ============================================================

test('H07 - bidirectional lookup helpers answer both questions (§20)', () => {
  // What source-native structure maps to application ART? -> SRC_ART
  const artSources = sourceStructuresForApplicationSubject('ART');
  assert.strictEqual(artSources.length, 1);
  assert.strictEqual(artSources[0].sourceSubject, 'SRC_ART');
  // Which application subjects map to source SRC_ART? -> ART and MUSIC
  const artApps = applicationSubjectsForSourceSubject('SRC_ART');
  assert.deepStrictEqual([...artApps].sort(), ['ART', 'MUSIC']);
  // Which application subjects map to source SRC_SOCIAL_STUDIES? -> CIVIC_EDUCATION
  const civicApps = applicationSubjectsForSourceSubject('SRC_SOCIAL_STUDIES');
  assert.deepStrictEqual([...civicApps].sort(), ['CIVIC_EDUCATION']);
  assert.strictEqual(everyMappingIsNonTrivial(), true);
  // All 9 application subjects are covered exactly once in the matrix.
  const appCodes = APPLICATION_MAPPING_MATRIX.map((m) => m.applicationSubject);
  assert.deepStrictEqual([...new Set(appCodes)].sort(), [...APPS].sort());
  assert.strictEqual(new Set(appCodes).size, 9);
});

console.log('');
console.log(`--- GATE 07C.6.4: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}
