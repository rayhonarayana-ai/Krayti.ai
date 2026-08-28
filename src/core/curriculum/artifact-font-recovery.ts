/**
 * Qarayti.ai - Gate 07C.6.2A: Font/CMap Recovery Model
 *
 * Forensic model for the PARITAL (U+FFFD) and PUA_BLOCKED pages of the
 * recovered 556-page primary curriculum artifact. Captures, per font, the
 * observed root cause and whether an evidence-backed glyph->Unicode recovery
 * exists in the artifact itself.
 *
 * DECISIVE FORENSIC FINDING (recomputed from the artifact):
 *   The U+FFFD and PUA characters on the problem pages are EXPLICIT
 *   declarations inside the PDF's own ToUnicode CMaps, NOT an engine or
 *   tooling deficiency. The embedded fonts are CID-keyed Type0 TrueType
 *   SUBSETS that carry NO 'cmap' and NO 'post' table (only OS/2,cvt,fpgm,
 *   glyf,head,hhea,hmtx,loca,maxp,name,prep). Without a cmap/post table
 *   there is no font-level Unicode evidence, so these specific CID/codepoint
 *   glyphs CANNOT be recovered from artifact structure; mapping them from
 *   expected Arabic words would be GUESSING and is explicitly forbidden.
 *
 * Recovery hierarchy honoured (never inverted):
 *   1. pdfjs direct digital extraction
 *   2. improved CMap/font recovery      (exhausted: no cmap/post evidence)
 *   3. alternative font/glyph recovery  (exhausted: no alternate mapping)
 *   4. selective rendering + OCR        (no renderer/OCR engine on this host)
 */

import type {
  ArtifactFontRecoveryEntry,
  ArtifactLossRootCause,
  ArtifactGlyphRecoveryClass,
  ArtifactFontProgramKind,
} from '../../domain/types/curriculum-source-governance.types';

// Per-font forensic inventory. Observed font names, ToUnicode decisions and
// embedded-font table presence are RECORDED FACTS from the artifact scan;
// they are not inferred.
export const PDFJS_METHOD = 'PDFJS_DIST';

export const FONT_RECOVERY_EVIDENCE: readonly ArtifactFontRecoveryEntry[] = [
  {
    fontResource: 'C2_0',
    baseFont: 'Arabic subset (CID-keyed Type0)',
    subtype: 'Type0',
    toUnicodePresent: true,
    roseCause: 'EXPLICIT_TOUNICODE_FFFD',
    affectedCidsOrCodepoints: ['0x0035'],
    programKind: 'TRUETYPE_NO_CMAP',
    programBytes: 8224,
    hasCmapTable: false,
    hasPostTable: false,
    fontLevelUnicodeEvidence: false,
    recoveryClass: 'UNRECOVERABLE_DOC_DECLARED_LOSS',
    note: 'ToUnicode explicitly maps CID 0x0035 -> U+FFFD; embedded sfnt has no cmap/post.',
  },
  {
    fontResource: 'C2_1',
    baseFont: 'Arabic subset (CID-keyed Type0)',
    subtype: 'Type0',
    toUnicodePresent: true,
    roseCause: 'EXPLICIT_TOUNICODE_FFFD',
    affectedCidsOrCodepoints: ['0x0054','0x0055','0x0056','0x0057','0x007E','0x007F','0x0080','0x0081'],
    programKind: 'TRUETYPE_NO_CMAP',
    programBytes: 36904,
    hasCmapTable: false,
    hasPostTable: false,
    fontLevelUnicodeEvidence: false,
    recoveryClass: 'UNRECOVERABLE_DOC_DECLARED_LOSS',
    note: 'Base-alphabet CIDs (0x54-0x57 = saad/shiin/sad/dad range; 0x7e-0x81) explicitly -> U+FFFD; absent from font cmap.',
  },
  {
    fontResource: 'C2_2',
    baseFont: 'Arabic subset (CID-keyed Type0)',
    subtype: 'Type0',
    toUnicodePresent: true,
    roseCause: 'EXPLICIT_TOUNICODE_FFFD',
    affectedCidsOrCodepoints: ['0x0054','0x0055','0x0056','0x0057','0x007E','0x007F','0x0080','0x0081'],
    programKind: 'TRUETYPE_NO_CMAP',
    programBytes: 42704,
    hasCmapTable: false,
    hasPostTable: false,
    fontLevelUnicodeEvidence: false,
    recoveryClass: 'UNRECOVERABLE_DOC_DECLARED_LOSS',
    note: 'Mirrors C2_1 loss pattern.',
  },
  {
    fontResource: 'C2_3',
    baseFont: 'Arabic table-glyph subset (CID-keyed Type0)',
    subtype: 'Type0',
    toUnicodePresent: true,
    roseCause: 'EXPLICIT_TOUNICODE_PUA',
    affectedCidsOrCodepoints: ['U+F001','U+F004','U+F016','U+F037','U+F04D','U+FC60','U+FC61','U+F018'],
    programKind: 'TRUETYPE_NO_CMAP',
    programBytes: 44252,
    hasCmapTable: false,
    hasPostTable: false,
    fontLevelUnicodeEvidence: false,
    recoveryClass: 'UNRECOVERABLE_NO_FONT_EVIDENCE',
    note: 'Glossary-table font: ToUnicode maps CIDs to Private Use Area; used for Arabic column of tri-lingual tables.',
  },
  {
    fontResource: 'C2_4',
    baseFont: 'Arabic table-glyph subset (CID-keyed Type0)',
    subtype: 'Type0',
    toUnicodePresent: true,
    roseCause: 'EXPLICIT_TOUNICODE_PUA',
    affectedCidsOrCodepoints: ['U+F001'],
    programKind: 'TRUETYPE_NO_CMAP',
    programBytes: 6212,
    hasCmapTable: false,
    hasPostTable: false,
    fontLevelUnicodeEvidence: false,
    recoveryClass: 'UNRECOVERABLE_NO_FONT_EVIDENCE',
    note: 'PUA table font subset.',
  },
  {
    fontResource: 'C2_5',
    baseFont: 'Arabic table-glyph subset (CID-keyed Type0)',
    subtype: 'Type0',
    toUnicodePresent: true,
    roseCause: 'EXPLICIT_TOUNICODE_PUA',
    affectedCidsOrCodepoints: ['U+F007','U+F014','U+F015','U+F016','U+F018'],
    programKind: 'TRUETYPE_NO_CMAP',
    programBytes: 30780,
    hasCmapTable: false,
    hasPostTable: false,
    fontLevelUnicodeEvidence: false,
    recoveryClass: 'UNRECOVERABLE_NO_FONT_EVIDENCE',
    note: 'PUA table font subset.',
  },
  {
    fontResource: 'C2_2 (Berber role)',
    baseFont: 'Tifinagh subset (CID-keyed Type0)',
    subtype: 'Type0',
    toUnicodePresent: true,
    roseCause: 'MISSING_BFCHAR_ENTRY',
    affectedCidsOrCodepoints: [],
    programKind: 'TRUETYPE_NO_CMAP',
    programBytes: 15904,
    hasCmapTable: false,
    hasPostTable: false,
    fontLevelUnicodeEvidence: false,
    recoveryClass: 'NOT_ASSESSED',
    note: 'Maps to Tifinagh U+2D30-2D7F (decodes cleanly); listed for completeness.',
  },
];

export const FFFD_ROOT_CAUSE: ArtifactLossRootCause = 'EXPLICIT_TOUNICODE_FFFD';
export const PUA_ROOT_CAUSE: ArtifactLossRootCause = 'EXPLICIT_TOUNICODE_PUA';

/** True when an embedded font program still carries a Unicode cmap table. */
export function fontCarriesUnicodeEvidence(entry: ArtifactFontRecoveryEntry): boolean {
  return entry.hasCmapTable || entry.hasPostTable;
}

/** True when mapping a glyph would require guessing at expected words (forbidden). */
export function requiresWordGuess(entry: ArtifactFontRecoveryEntry): boolean {
  return (
    entry.programKind === 'TRUETYPE_NO_CMAP' &&
    !entry.hasCmapTable &&
    !entry.hasPostTable &&
    !entry.fontLevelUnicodeEvidence
  );
}

/** Deterministic recovery-class decision: an explicit doc-declared loss with no
 *  font-level Unicode evidence is not digitally recoverable and RETAINS its
 *  declared class (a doc-declared FFFD loss stays DOC_DECLARED_LOSS, a PUA
 *  loss stays NO_FONT_EVIDENCE). Only real font-level Unicode evidence can
 *  upgrade a glyph to RECOVERABLE. */
export function classifyRecovery(entry: ArtifactFontRecoveryEntry): ArtifactGlyphRecoveryClass {
  if (fontCarriesUnicodeEvidence(entry)) return 'RECOVERABLE';
  return entry.recoveryClass;
}
