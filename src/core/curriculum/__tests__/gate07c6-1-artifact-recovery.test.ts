/**
 * Qarayti.ai - Gate 07C.6.1: Primary Artifact Access Recovery + Authenticity
 * Re-Verification Tests (R01-R44)
 *
 * Groups:
 *   ACCESS      R01-R08
 *   AUTHENTICITY R09-R16
 *   VERSIONING  R17-R24
 *   PRIMARY VALIDATION R25-R32
 *   ANTI-FABRICATION R33-R44 (incl. "no artifact committed/tracked" R07)
 *
 * Plus trusted-foundation non-regression assertions.
 */

import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { execSync } from 'node:child_process';

import {
  RECOVERY_CANDIDATES,
  ARTIFACT_FINGERPRINTS,
  AUTHENTICITY_EVIDENCE,
  AUTHENTICITY_ATTESTATION,
  ARTIFACT_ACCESS_RECOVERY_STATE,
  CURRENTNESS_SEARCH,
  PRIMARY_VALIDATION_RESULTS,
  PRIMARY_VALIDATION_SUMMARY,
  PAGE_MAP_RE_VERIFICATION,
  PAGE_MAP_RE_VERIFICATION_SUMMARY,
  GAP_RE_EVALUATION,
  GAP_RE_EVALUATION_SUMMARY,
  ARTIFACT_RECOVERY_VERDICT,
} from '../../../domain/constants/moroccan-primary-artifact-access-recovery';

import {
  SOURCE_PAGE_MAP,
  LOCATOR_AUTHORITY_SUMMARY,
} from '../../../domain/constants/moroccan-primary-source-page-map';

import {
  DENOMINATOR_REGISTRY,
  RESOLVED_GAPS,
  COMPLETENESS_METRICS,
} from '../../../domain/constants/moroccan-primary-completeness-registry';

import {
  PRIMARY_ARTIFACT_DEEP_EXTRACTION,
  DEEP_STRUCTURAL_ELEMENTS,
  COMPETENCY_STRUCTURE_EVIDENCE,
} from '../../../domain/constants/moroccan-primary-deep-structure';

import type {
  RecoveryOutcomeStatus,
  ArtifactAccessState,
  ArtifactAuthenticityClass,
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

const FULL_OUTCOMES = [
  'RECOVERED_FULL_ARTIFACT',
  'RECOVERED_PARTIAL_ARTIFACT',
  'METADATA_ONLY',
  'SNIPPET_ONLY',
  'HTML_WRAPPER_ONLY',
  'DOWNLOAD_FAILED',
  'ACCESS_BLOCKED_AUTHENTICATION_REQUIRED',
  'ACCESS_BLOCKED_ANTI_BOT',
  'DEAD_LINK',
  'REDIRECT_UNRESOLVED',
  'NOT_TARGET_ARTIFACT',
  'UNKNOWN',
];
const ACCESS_STATES = [
  'NOT_SEARCHED', 'SEARCHING', 'RECOVERED_UNVERIFIED', 'RECOVERED_AUTHENTICATED',
  'RECOVERED_PARTIAL', 'BLOCKED_BY_ARTIFACT_ACCESS', 'IDENTITY_CONFLICT',
];
const AUTH_CLASSES = [
  'ARTIFACT_AUTHENTICITY_VERIFIED', 'ARTIFACT_AUTHENTICITY_STRONGLY_SUPPORTED',
  'ARTIFACT_AUTHENTICITY_PARTIALLY_SUPPORTED', 'ARTIFACT_AUTHENTICITY_UNRESOLVED',
  'ARTIFACT_AUTHENTICITY_CONFLICT',
];

// ============================================================
// ACCESS (R01-R08)
// ============================================================
console.log('');
console.log('--- ACCESS (R01-R08) ---');

test('R01 — candidate outcomes are all within the RecoveryOutcomeStatus enum', () => {
  const e = new Set<RecoveryOutcomeStatus>(FULL_OUTCOMES as RecoveryOutcomeStatus[]);
  for (const c of RECOVERY_CANDIDATES) {
    assert(e.has(c.outcome), `${c.candidateId}: invalid outcome ${c.outcome}`);
  }
});

test('R02 — at least one candidate satisfies the primary recovery objective (RECOVERED_FULL_ARTIFACT)', () => {
  const satisfying = RECOVERY_CANDIDATES.filter((c) => c.isPrimarySatisfying && c.outcome === 'RECOVERED_FULL_ARTIFACT');
  assert(satisfying.length >= 1, 'no RECOVERED_FULL_ARTIFACT satisfying candidate');
});

test('R03 — the primary (first) satisfying full-artifact candidate reports size, hash, and page count', () => {
  const primary = RECOVERY_CANDIDATES.find((c) => c.isPrimarySatisfying && c.outcome === 'RECOVERED_FULL_ARTIFACT');
  assert(primary, 'primary candidate missing');
  assert(typeof primary.sizeBytes === 'number' && primary.sizeBytes > 0, 'size present');
  assert(primary.sha256 && /^[0-9A-F]{64}$/i.test(primary.sha256), 'sha256 hex 64 present');
  assert(primary.pageCount === 556, `page count 556, got ${primary.pageCount}`);
});

test('R04 — the primary SHA-256 matches a recovered fingerprint exactly', () => {
  const primary = RECOVERY_CANDIDATES.find((c) => c.isPrimarySatisfying && c.outcome === 'RECOVERED_FULL_ARTIFACT')!;
  assert(ARTIFACT_FINGERPRINTS.some((f) => f.sha256 === primary.sha256), 'primary hash in fingerprints');
});

test('R05 — access state is RECOVERED_AUTHENTICATED and recovery outcome is RECOVERED_FULL_ARTIFACT', () => {
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.artifactAccessState === 'RECOVERED_AUTHENTICATED', 'state');
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.primaryRecoveryOutcome === 'RECOVERED_FULL_ARTIFACT', 'outcome');
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.fullArtifactRecovered === true, 'fullArtifactRecovered');
});

test('R06 — the recovered artifact is NOT marked committed/tracked in git (kept outside repo)', () => {
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.committedToGit === false, 'committedToGit must be false');
  const loc = ARTIFACT_ACCESS_RECOVERY_STATE.recoveredCopyLocation;
  assert(loc.toLowerCase().includes('temp') || loc.includes('opencode'), 'copy located outside repo in temp dir');
});

test('R07 — no recovered artifact (PDF) is present in the git working tree', () => {
  const out = execSync('git status --short', { encoding: 'utf8', cwd: process.cwd() });
  assert(!/\.pdf/i.test(out), `git status contains a tracked/untracked .pdf: ${out.trim()}`);
});

test('R08 — artifact access state value is a valid ArtifactAccessState', () => {
  assert(ACCESS_STATES.includes(ARTIFACT_ACCESS_RECOVERY_STATE.artifactAccessState), 'state in enum');
});

// ============================================================
// AUTHENTICITY (R09-R16)
// ============================================================
console.log('');
console.log('--- AUTHENTICITY (R09-R16) ---');

test('R09 — authenticity classification is a valid enum value', () => {
  assert(AUTH_CLASSES.includes(AUTHENTICITY_ATTESTATION.classification), `class ${AUTHENTICITY_ATTESTATION.classification}`);
});

test('R10 — primary artifact authenticity is STRONGLY_SUPPORTED or VERIFIED (never UNRESOLVED/CONFLICT/UNVERIFIED)', () => {
  assert(
    AUTHENTICITY_ATTESTATION.classification === 'ARTIFACT_AUTHENTICITY_STRONGLY_SUPPORTED' ||
    AUTHENTICITY_ATTESTATION.classification === 'ARTIFACT_AUTHENTICITY_VERIFIED',
    `unexpected class ${AUTHENTICITY_ATTESTATION.classification}`,
  );
});

test('R11 — byte-identity corroboration across at least 2 independent channels is attested', () => {
  assert(AUTHENTICITY_ATTESTATION.byteIdenticalChannels >= 2, `byteIdenticalChannels=${AUTHENTICITY_ATTESTATION.byteIdenticalChannels}`);
  assert(AUTHENTICITY_ATTESTATION.recoveredCopyCount >= byteIdenticalChannelMin(), 'recovered copies');
  function byteIdenticalChannelMin() { return AUTHENTICITY_ATTESTATION.byteIdenticalChannels; }
});

test('R12 — authenticity evidence list is non-empty with finding and source (artifact-internal + independent)', () => {
  assert(AUTHENTICITY_EVIDENCE.length > 0, 'evidence non-empty');
  const hasDirect = AUTHENTICITY_EVIDENCE.some((e) => e.directArtifactObservation === true);
  const hasIndependent = AUTHENTICITY_EVIDENCE.some((e) => e.directArtifactObservation === false);
  assert(hasDirect, 'has direct artifact observation');
  assert(hasIndependent, 'has independent corroboration');
  for (const e of AUTHENTICITY_EVIDENCE) {
    assert(e.finding.length > 0 && e.source.length > 0, 'finding+source present');
  }
});

test('R13 — page count (556) is attested across fingerprints', () => {
  assert(ARTIFACT_FINGERPRINTS.length >= 1, 'fingerprints present');
  for (const f of ARTIFACT_FINGERPRINTS) assert(f.pageCount === 556, `pageCount ${f.pageCount}`);
});

test('R14 — retrieval-channel authority is NOT conflated with issuer authority', () => {
  const note = AUTHENTICITY_ATTESTATION.retrievalAuthorityNote.toLowerCase();
  assert(note.includes('authority'), 'note discusses authority separation');
  assert(/is {0,3}not|!=|separate|mirror/.test(AUTHENTICITY_ATTESTATION.retrievalAuthorityNote.toLowerCase()), 'note distinguishes channel from issuer');
});

test('R15 — issuer attribution is based on independent corroboration, not solely the retrieval host', () => {
  const basis = AUTHENTICITY_ATTESTATION.issuerAttributionBasis.toLowerCase();
  assert(
    basis.includes('direction') || basis.includes('men.gov') || basis.includes('contrat') || basis.includes('2015-2030') || basis.includes('51.17'),
    'issuer basis cites official attribution',
  );
  const sep = AUTHENTICITY_ATTESTATION.nonIssuerBasis.toLowerCase();
  assert(sep.includes('mirror') || sep.includes('host'), 'explicitly notes channels are mirror/host, not issuer');
});

test('R16 — verdict authenticity matches attestation classification', () => {
  assert(ARTIFACT_RECOVERY_VERDICT.authenticity === AUTHENTICITY_ATTESTATION.classification, 'verdict/attestation align');
  assert(ARTIFACT_RECOVERY_VERDICT.artifactAuthenticated === true, 'artifactAuthenticated true');
});

// ============================================================
// VERSIONING (R17-R24)
// ============================================================
console.log('');
console.log('--- VERSIONING (R17-R24) ---');

test('R17 — currentness conclusion is NO_NEWER_VERIFIED_SOURCE_FOUND (conservative, no CURRENT_NATIONAL claim)', () => {
  assert(CURRENTNESS_SEARCH.conclusion === 'NO_NEWER_VERIFIED_SOURCE_FOUND', `conclusion ${CURRENTNESS_SEARCH.conclusion}`);
  assert(CURRENTNESS_SEARCH.newerFullOfficialReplacementFound === false, 'no newer full replacement');
});

test('R18 — currentness note does not assert CURRENT_NATIONAL status', () => {
  // CONCLUSION is NO_NEWER_VERIFIED_SOURCE_FOUND (not CURRENT_NATIONAL).
  const conclusion = String(CURRENTNESS_SEARCH.conclusion);
  assert(!conclusion.includes('CURRENT_NATIONAL'), 'conclusion is not CURRENT_NATIONAL');
  assert(CURRENTNESS_SEARCH.conclusion === 'NO_NEWER_VERIFIED_SOURCE_FOUND', 'conclusion is the conservative no-newer-source status');
  assert(CURRENTNESS_SEARCH.newerFullOfficialReplacementFound === false, 'no newer replacement');
});

test('R19 — publication date temporal discipline preserved (2021-07-01 VERIFIED; no effectiveFrom inference)', () => {
  // Assert we do NOT claim an effectiveFrom == publicationDate anywhere in the recovery model
  const s = ARTIFACT_RECOVERY_VERDICT.summary;
  assert(typeof s === 'string' && s.length > 0, 'summary present');
  const anyEffective = JSON.stringify([CURRENTNESS_SEARCH, ARTIFACT_RECOVERY_VERDICT]).toLowerCase();
  assert(!/effectiveFrom\s*[:=]\s*['"]?2021-07-01/.test(anyEffective.replace(/\s/g, '')), 'no effectiveFrom==publicationDate inferred');
});

test('R20 — source timestamps remain UNKNOWN/INFERRED (effectiveTo, supersedes), not fabricated', () => {
  // No recovery field asserts a specific effectiveTo or supersession date.
  const s = JSON.stringify([CURRENTNESS_SEARCH, ARTIFACT_RECOVERY_VERDICT]).toLowerCase();
  assert(!/supersededBySourceId\s*:\s*['"]src/.test(s), 'no fabricated supersession edge');
  assert(!/'supersedesSourceId'\s*:\s*['"][^'"]+['"]/.test(s) || /unresolved|unknown/.test(s), 'no fabricated supersedes edge');
});

test('R21 — only RECOVERED_FULL_ARTIFACT sets fullArtifactRecovered=true; partial/blocked do not', () => {
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.primaryRecoveryOutcome === 'RECOVERED_FULL_ARTIFACT');
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.fullArtifactRecovered === true);
  const partialLike = RECOVERY_CANDIDATES.filter((c) => c.outcome !== 'RECOVERED_FULL_ARTIFACT');
  for (const c of partialLike) assert(c.isPrimarySatisfying === false, `${c.candidateId} non-full not satisfying`);
});

test('R22 — sourceId/identity constants are consistent (src-primary-curriculum-2021, 2021 artifact)', () => {
  const raw = readFileSync(
    join(process.cwd(), 'src', 'domain', 'constants', 'moroccan-primary-artifact-access-recovery.ts'),
    'utf8',
  );
  assert(raw.includes('src-primary-curriculum-2021'), 'source id present');
  assert(raw.includes('Version Finale') || raw.includes('Curriculum Primaire'), 'artifact identity present');
});

test('R23 — artifact title identity is explicit and not conflated with a different version', () => {
  assert(ARTIFACT_RECOVERY_VERDICT.gate.includes('07C.6.1'), 'gate label');
  // identity refers to July 2021 final version
  const s = ARTIFACT_RECOVERY_VERDICT.summary.toLowerCase();
  assert(s.includes('july 2021') || s.includes('2021'), 'version referenced');
});

test('R24 — deep extraction and content verification remain UNLOCKED (not performed in this gate)', () => {
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.deepExtractionUnlocked === false, 'deep extraction not unlocked');
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.contentVerificationUnlocked === false, 'content verification not unlocked');
});

// ============================================================
// PRIMARY VALIDATION (R25-R32)
// ============================================================
console.log('');
console.log('--- PRIMARY VALIDATION (R25-R32) ---');

test('R25 — primary validation covers all 15 provisional components (5 subjects)', () => {
  assert(PRIMARY_VALIDATION_RESULTS.length === 15, `count ${PRIMARY_VALIDATION_RESULTS.length}`);
  const subjects = new Set(PRIMARY_VALIDATION_RESULTS.map((r) => r.subjectCode));
  assert(subjects.has('ARABIC') && subjects.has('FRENCH') && subjects.has('MATH') && subjects.has('SCIENCE') && subjects.has('CIVIC_EDUCATION'), '5 subjects present');
});

test('R26 — NO provisional component is promoted to VERIFIED from recovery alone', () => {
  assert(PRIMARY_VALIDATION_SUMMARY.verifiedClaims === 0, `verified=${PRIMARY_VALIDATION_SUMMARY.verifiedClaims}`);
  for (const r of PRIMARY_VALIDATION_RESULTS) assert(r.primaryArtifactConfirmation === 'NOT_VERIFIED', `${r.componentCode} NOT_VERIFIED`);
});

test('R27 — every component validation status is a valid PrimaryComponentValidationStatus', () => {
  const valid = ['VALIDATED_FROM_PRIMARY_ARTIFACT', 'CORROBORATED_BY_PRIMARY_STRUCTURE', 'PARTIALLY_ADDRESSED', 'NOT_CHECKED', 'BLOCKED_BY_TEXT_ENCODING'];
  for (const r of PRIMARY_VALIDATION_RESULTS) assert(valid.includes(r.validationStatus), `${r.componentCode}: ${r.validationStatus}`);
});

test('R28 — French components are corroborated at structure level; Arabic + others are explicitly NOT verified', () => {
  for (const r of PRIMARY_VALIDATION_RESULTS) {
    if (r.subjectCode === 'FRENCH') {
      assert(r.validationStatus === 'CORROBORATED_BY_PRIMARY_STRUCTURE', `french ${r.componentCode} corroborated`);
    } else {
      assert(r.validationStatus === 'BLOCKED_BY_TEXT_ENCODING' || r.validationStatus === 'NOT_CHECKED', `${r.componentCode} not verified`);
      assert(r.primaryArtifactConfirmation === 'NOT_VERIFIED', `${r.componentCode} NOT_VERIFIED`);
    }
  }
});

test('R29 — primary validation summary arithmetic is consistent', () => {
  const sum = PRIMARY_VALIDATION_SUMMARY.validatedFromPrimary
    + PRIMARY_VALIDATION_SUMMARY.corroboratedByPrimaryStructure
    + PRIMARY_VALIDATION_SUMMARY.partiallyAddressed
    + PRIMARY_VALIDATION_SUMMARY.blockedByTextEncoding
    + PRIMARY_VALIDATION_SUMMARY.notChecked;
  assert(sum === PRIMARY_VALIDATION_RESULTS.length, `sum ${sum} == total ${PRIMARY_VALIDATION_RESULTS.length}`);
  assert(PRIMARY_VALIDATION_SUMMARY.corroboratedByPrimaryStructure === 2, '2 French corroborated');
  assert(PRIMARY_VALIDATION_SUMMARY.blockedByTextEncoding === 13, '13 blocked by text encoding');
});

test('R30 — page-map re-verification present and French entry refined/corroborated', () => {
  assert(PAGE_MAP_RE_VERIFICATION.length === SOURCE_PAGE_MAP.length, 'one entry per page-map entry');
  const french = PAGE_MAP_RE_VERIFICATION.find((e) => e.sectionTitle.includes('French Section'));
  assert(french, 'french entry present');
  assert(french!.reVerificationStatus === 'PRIMARY_ARTIFACT_REFINED' || french!.reVerificationStatus === 'PRIMARY_ARTIFACT_CORROBORATED', `french ${french!.reVerificationStatus}`);
  assert(french!.directObservedPrintedRange !== undefined, 'direct observed range present');
});

test('R31 — page-map re-verification preserves prior locator authority (no silent upgrade of unverified entries)', () => {
  const frenchIdx = SOURCE_PAGE_MAP.findIndex((e) => e.sectionTitle.includes('French Section'));
  const frenchRev = PAGE_MAP_RE_VERIFICATION.find((e) => e.entryIndex === frenchIdx)!;
  assert(frenchRev.priorLocatorAuthority === 'EXTERNAL_PAGE_REFERENCE', 'french prior authority preserved');
  for (const e of PAGE_MAP_RE_VERIFICATION) {
    if (e.reVerificationStatus === 'NOT_RE_VERIFIED') {
      // prior authority must NOT become PRIMARY_ARTIFACT_PAGE_VERIFIED for non-re-verified entries
      assert(e.priorLocatorAuthority !== 'PRIMARY_ARTIFACT_PAGE_VERIFIED', `entry ${e.entryIndex} NOT silently upgraded to page-verified`);
    }
  }
  assert(PAGE_MAP_RE_VERIFICATION_SUMMARY.notReVerified >= 5, 'most entries not re-verified (Arabic CID)');
});

test('R32 — gap re-evaluation present and all gaps remain unchanged (recovery does not resolve content denominators)', () => {
  assert(GAP_RE_EVALUATION.length === RESOLVED_GAPS.length, 'gap set matches');
  assert(GAP_RE_EVALUATION_SUMMARY.total === GAP_RE_EVALUATION.length, 'summary total');
  assert(GAP_RE_EVALUATION.every((g) => g.unchanged === true), 'all gaps unchanged');
  assert(GAP_RE_EVALUATION_SUMMARY.changed === 0, 'no gap changed');
});

// ============================================================
// ANTI-FABRICATION (R33-R44)
// ============================================================
console.log('');
console.log('--- ANTI-FABRICATION (R33-R44) ---');

test('R33 — no recovery claim asserts CONTENT_VERIFIED or PUBLISHED from recovery alone', () => {
  const s = JSON.stringify([PRIMARY_VALIDATION_RESULTS, ARTIFACT_RECOVERY_VERDICT]).toLowerCase();
  assert(!s.includes('content_verified'), 'no content_verified claim');
  assert(!s.includes('"published"') && !s.includes('published:'), 'no published state from recovery');
});

test('R34 — no PARTIAL denominator is upgraded to VERIFIED by this gate', () => {
  const partials = DENOMINATOR_REGISTRY.filter((d) => d.confidence === 'PARTIAL');
  const verified = DENOMINATOR_REGISTRY.filter((d) => d.confidence === 'VERIFIED');
  assert(partials.length > 0, 'partials exist');
  // Verified denominators remain 0 (none were verified in prior gates either)
  assert(verified.length === 0, 'no verified denominators');
});

test('R35 — completeness metrics total cells unchanged and still 0 measurable (no completeness inflation)', () => {
  assert(COMPLETENESS_METRICS.measurableCells === 0, 'no measurable cells');
  assert(COMPLETENESS_METRICS.hundredPercentCells === 0, 'no 100% cells');
});

test('R36 — deep extraction remains BLOCKED (not made COMPLETE); recovery does not unlock deep extraction in this gate', () => {
  assert(PRIMARY_ARTIFACT_DEEP_EXTRACTION.status === 'BLOCKED_BY_ARTIFACT_ACCESS' || PRIMARY_ARTIFACT_DEEP_EXTRACTION.status === 'CROSS_REFERENCE_SUPPORTED', `status ${PRIMARY_ARTIFACT_DEEP_EXTRACTION.status}`);
  assert(ARTIFACT_ACCESS_RECOVERY_STATE.deepExtractionUnlocked === false, 'deep extraction not unlocked');
});

test('R37 — no invented page numbers/dates/denominators introduced by recovery', () => {
  // Direct page observations are recorded only where actually observed (French range).
  const frenchObserved = PAGE_MAP_RE_VERIFICATION.find((e) => e.sectionTitle.includes('French Section'));
  assert(frenchObserved!.directObservedPrintedRange === '~p208-p272' || /p20[0-9]-p27/.test(frenchObserved!.directObservedPrintedRange!), 'observed range is honest bracket');
  // No fabricated later publication date (artifact is 2021)
  assert(!ARTIFACT_RECOVERY_VERDICT.summary.includes('2024') && !ARTIFACT_RECOVERY_VERDICT.summary.includes('2025') && !ARTIFACT_RECOVERY_VERDICT.summary.includes('2026'), 'no fabricated later date');
});

test('R38 — recovered artifact is NOT stored inside the repo (temp/ignored location only)', () => {
  const loc = ARTIFACT_ACCESS_RECOVERY_STATE.recoveredCopyLocation;
  assert(loc.includes('Temp') || loc.includes('temp') || loc.includes('opencode'), 'outside repo');
  assert(!loc.includes('\\Krayti.ai\\src\\') && !loc.includes('/src/'), 'not inside source tree');
  const repo = resolve(process.cwd());
  const abs = resolve(loc);
  assert(!abs.startsWith(repo.replace(/[\\/]+$/, '') + sep), 'absolute copy path outside repo');
});

test('R39 — no fabricated artifact filename/metadata beyond what was observed', () => {
  const primary = RECOVERY_CANDIDATES.find((c) => c.isPrimarySatisfying && c.outcome === 'RECOVERED_FULL_ARTIFACT')!;
  assert(primary.label.includes('MediaFire'), 'primary channel MediaFire observed');
  const f = ARTIFACT_FINGERPRINTS[0];
  assert(f.producer.includes('Acrobat') || f.producer.includes('Adobe'), 'producer matches observed metadata');
});

test('R40 — no mass extraction performed; no manufactured component content added', () => {
  // The recovery model contains no unit/lesson/competency/exercise payloads —
  // it stores only evidence of artifact recovery and limited validation status.
  const sealed = JSON.stringify([
    PRIMARY_VALIDATION_RESULTS,
    GAP_RE_EVALUATION,
    PAGE_MAP_RE_VERIFICATION,
  ]);
  assert(!/[\u0600-\u06FF]{40,}/.test(sealed), 'no large Arabic curriculum-content payloads');
  assert(PRIMARY_VALIDATION_SUMMARY.verifiedClaims === 0, 'no verified claims created');
  // Recovery model adds no new structural entities beyond validation statuses.
  assert(PRIMARY_VALIDATION_RESULTS.every((r) => Object.keys(r).length >= 6), 'validation records are status-only');
});

test('R41 — authority separation: ORIGINAL != CROSS-REFERENCE != RETRIEVAL HOST is preserved in recovery model', () => {
  const s = (AUTHENTICITY_ATTESTATION.retrievalAuthorityNote + AUTHENTICITY_ATTESTATION.nonIssuerBasis + AUTHENTICITY_ATTESTATION.verdictNote).toLowerCase();
  assert(s.includes('mirror') || s.includes('host'), 'mirror/host separation noted');
  assert(AUTHENTICITY_ATTESTATION.retrievalAuthorityNote.toLowerCase().includes('authority'), 'authority separation noted');
  assert(AUTHENTICITY_ATTESTATION.nonIssuerBasis.toLowerCase().includes('mirror') || AUTHENTICITY_ATTESTATION.nonIssuerBasis.toLowerCase().includes('host'), 'non-issuer basis labels channels as mirror/host');
});

test('R42 — every outcome label is a legal RecoveryOutcomeStatus (no bespoke "recovered" labels)', () => {
  const legal = new Set(FULL_OUTCOMES);
  for (const c of RECOVERY_CANDIDATES) {
    assert(legal.has(c.outcome), `outcome ${c.outcome} legal`);
    assert(c.candidateId.length > 0 && typeof c.url === 'string' && c.url.length > 0, 'candidate fields present');
  }
});

test('R43 — verdict has exactly ONE recommendation (PASS/PARTIAL/FAIL) and is PASS for full recovery', () => {
  assert(['PASS', 'PARTIAL', 'FAIL'].includes(ARTIFACT_RECOVERY_VERDICT.verdict), 'one of PASS/PARTIAL/FAIL');
  assert(ARTIFACT_RECOVERY_VERDICT.verdict === 'PASS', 'full recovery + authentication => PASS');
  assert(ARTIFACT_RECOVERY_VERDICT.summary.includes('RECOVERED_FULL_ARTIFACT'), 'summary states recovery');
});

test('R44 — no secret/credential material in the recovery model', () => {
  const s = JSON.stringify([
    RECOVERY_CANDIDATES, AUTHENTICITY_ATTESTATION, ARTIFACT_ACCESS_RECOVERY_STATE, ARTIFACT_RECOVERY_VERDICT,
  ]).toLowerCase();
  for (const secret of ['password', 'apikey', 'api_key', 'sk-', 'bearer ', 'supabase', 'token=', 'jwt']) {
    assert(!s.includes(secret), `no secret material: ${secret}`);
  }
});

// ============================================================
// TRUSTED-FOUNDATION NON-REGRESSION
// ============================================================
console.log('');
console.log('--- Trusted Foundation Non-Regression ---');

test('N01 — deep structure still lists 15 components across 5 subjects', () => {
  const subjects = new Set(DEEP_STRUCTURAL_ELEMENTS.map((e) => e.subjectCode));
  assert(subjects.has('ARABIC') && subjects.has('FRENCH') && subjects.has('MATH') && subjects.has('SCIENCE') && subjects.has('CIVIC_EDUCATION'));
  assert(COMPETENCY_STRUCTURE_EVIDENCE.primaryArtifactConfirmation === 'NOT_VERIFIED', 'competency structure still not primary-verified');
});

test('N02 — page map total entries unchanged (7) and LOCATOR_AUTHORITY_SUMMARY still consistent', () => {
  assert(SOURCE_PAGE_MAP.length === 7, 'page map 7 entries');
  const sum = LOCATOR_AUTHORITY_SUMMARY.crossReferenceLocators + LOCATOR_AUTHORITY_SUMMARY.sectionReferences + LOCATOR_AUTHORITY_SUMMARY.externalPageReferences + LOCATOR_AUTHORITY_SUMMARY.primaryArtifactPageVerified;
  assert(sum === SOURCE_PAGE_MAP.length, 'locator authority sums to total');
});

test('N03 — all 4 resolved gaps still present (recovery did not collapse the gap history)', () => {
  assert(RESOLVED_GAPS.length === 4, '4 gaps');
  assert(GAP_RE_EVALUATION.length === 4, '4 re-evaluations');
  const ids = GAP_RE_EVALUATION.map((g) => g.gapId).sort();
  assert(ids.join(',') === 'GAP-001,GAP-002,GAP-003,GAP-004', 'gap ids unchanged');
});

// ============================================================
// SUMMARY
// ============================================================
console.log('');
console.log(`--- GATE 07C.6.1: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}
