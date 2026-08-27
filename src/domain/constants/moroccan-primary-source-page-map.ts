/**
 * Qarayti.ai - Gate 07C.6: Moroccan Primary Curriculum Source Page Map
 *
 * Page/section map for deep extraction regions.
 * Built from publicly available forensic evidence, Calaméo part titles,
 * Scribd snippets, and teacher-summary cross-references.
 *
 * EVIDENCE LEVELS:
 *   CONFIRMED — directly from artifact metadata or publicly visible extracts
 *   INFERRED — reconstructed from multiple corroborating sources
 *   UNCERTAIN — partial evidence, requires PDF verification
 *
 * DO NOT reproduce page content. This is a structural locator map only.
 */

import type {
  CurriculumSourceLocator,
  PageMapLocatorAuthority,
  PrimaryArtifactAccessState,
} from '../types/curriculum-source-governance.types';

// ── SOURCE CONSTANTS ─────────────────────────────────────────

const SRC = 'src-primary-curriculum-2021';
const SRC_VERSION = 'v1.0.0';

// ── PAGE MAP ENTRIES ─────────────────────────────────────────

export interface PageMapEntry {
  readonly pageRange: string;
  readonly sectionTitle: string;
  readonly sectionTitleAr?: string;
  readonly gradeScope: string;
  readonly subjectScope: string;
  readonly structuralRelevance: string;
  readonly extractionStatus: 'CONFIRMED' | 'INFERRED' | 'UNCERTAIN' | 'NOT_ACCESSED';
  readonly evidenceSource: string;
  readonly locatorAuthority: PageMapLocatorAuthority;
  readonly notes?: string;
}

export const SOURCE_PAGE_MAP: readonly PageMapEntry[] = [

  // ── PART 1: GENERAL FRAMEWORK ────────────────────────────

  {
    pageRange: 'p1-p53',
    sectionTitle: 'Part 1: General Framework',
    sectionTitleAr: 'القسم الأول: الإطار التوجيهي العام',
    gradeScope: 'ALL_PRIMARY',
    subjectScope: 'ALL',
    structuralRelevance: 'Pedagogical framework, learner entry/exit profiles, competency model, evaluation principles. Contains competency definitions (كفايات) referenced by all subjects.',
    extractionStatus: 'CONFIRMED',
    evidenceSource: 'Calameo Part 1 title: "1/8 – Cadre Général, p1–p53". Confirmed by multiple teacher-summary sites.',
    locatorAuthority: 'EXTERNAL_PAGE_REFERENCE',
    notes: 'Page range stated by Calameo host metadata and secondary summaries. NOT verified by direct primary-artifact page access. Calameo extract returned 404.',
  },

  // ── PART 2: PROGRAM ORGANIZATION ─────────────────────────

  {
    pageRange: 'p54-p150 (approx)',
    sectionTitle: 'Part 2: Program Organization — Languages Domain',
    sectionTitleAr: 'القسم الثاني: تنظيم البرامج — مجال اللغات',
    gradeScope: 'ALL_PRIMARY',
    subjectScope: 'ARABIC,FRENCH',
    structuralRelevance: 'Arabic and French subject sections organized by grade with components. Arabic: listening/speaking, reading, writing. French: reading, written production.',
    extractionStatus: 'INFERRED',
    evidenceSource: 'Calameo Parts 2-3 range inferred from Part 1 ending p53 and Part 8 starting p503. Subject component structure confirmed by Hespress, Cariatmaaref, teacher guides.',
    locatorAuthority: 'SECTION_REFERENCE',
    notes: 'Approximate range reconstructed from host metadata. No direct primary-artifact page access.',
  },

  {
    pageRange: 'p150-p350 (approx)',
    sectionTitle: 'Part 2: Program Organization — Math/Science/Tech Domain',
    sectionTitleAr: 'القسم الثاني: تنظيم البرامج — مجال الرياضيات والعلوم والتكنولوجيا',
    gradeScope: 'ALL_PRIMARY',
    subjectScope: 'MATH,SCIENCE',
    structuralRelevance: 'Math: numbers/arithmetic, geometry/measurement, data. Science: life/earth, physical, space, technology. Grade-by-grade competency structure.',
    extractionStatus: 'INFERRED',
    evidenceSource: 'Page range inferred. Component structure confirmed by Kech24, Scribd math summaries, Moualimi. Grade 6 starts ~p264.',
    locatorAuthority: 'SECTION_REFERENCE',
    notes: 'Approximate range reconstructed from secondary sources. No direct primary-artifact page access.',
  },

  {
    pageRange: 'p350-p502 (approx)',
    sectionTitle: 'Part 2: Program Organization — Socialization Domain',
    sectionTitleAr: 'القسم الثاني: تنظيم البرامج — مجال التنشئة الاجتماعية والتفتح',
    gradeScope: 'ALL_PRIMARY',
    subjectScope: 'ISLAMIC_EDUCATION,CIVIC_EDUCATION,SPORT,ART,MUSIC',
    structuralRelevance: 'Social studies begins at Grade 4 with history/geography/citizenship components. Islamic Education, PE, Arts, Music sections.',
    extractionStatus: 'INFERRED',
    evidenceSource: 'Page range inferred. Social studies structure confirmed by Kech24, Atarbawi, Moualimi.',
    locatorAuthority: 'SECTION_REFERENCE',
    notes: 'Approximate range reconstructed from secondary sources. No direct primary-artifact page access.',
  },

  // ── FRENCH SECTION (precise locator) ──────────────────────

  {
    pageRange: 'p216-p271',
    sectionTitle: 'French Section — All Primary Grades',
    sectionTitleAr: 'القسم الفرنسي — جميع مستويات التعليم الابتدائي',
    gradeScope: 'P1-P6',
    subjectScope: 'FRENCH',
    structuralRelevance: 'Dedicated French section spanning all 6 years. Contains "Orientations Pédagogiques" and grade-by-grade French program. Operational approach (المقاربة العملياتية).',
    extractionStatus: 'CONFIRMED',
    evidenceSource: 'Calameo title: "Curriculum Primaire 2021 -4- Français Extrait P216 P271 V Finale". Also confirmed by artifact-internal evidence.',
    locatorAuthority: 'EXTERNAL_PAGE_REFERENCE',
    notes: 'Page range stated in Calameo artifact file title. NOT verified by direct primary-artifact page access. French section page range is an EXTERNAL_PAGE_REFERENCE from the host file name.',
  },

  // ── GRADE 6 ANCHOR ───────────────────────────────────────

  {
    pageRange: '~p264-p265',
    sectionTitle: 'Grade 6 Program Start',
    sectionTitleAr: 'بداية برنامج السنة السادسة',
    gradeScope: 'P6',
    subjectScope: 'ALL',
    structuralRelevance: 'Grade 6 section begins. Contains profil d\'entrée/sortie, compétence annuelle, sous-compétences. Section 7 of the document.',
    extractionStatus: 'CONFIRMED',
    evidenceSource: 'Scribd snippet: "7.6.1 profil d\'entrée et de sortie … p264; 7.6.2 la compétence annuelle et les sous-compétences … p265".',
    locatorAuthority: 'CROSS_REFERENCE_LOCATOR',
    notes: 'Page numbers quoted from Scribd snippet (secondary retrieval host). NOT verified by direct primary-artifact page access.',
  },

  // ── LIFE SKILLS SECTION ───────────────────────────────────

  {
    pageRange: 'p503-p556',
    sectionTitle: 'Part 8: Life Skills Development',
    sectionTitleAr: 'القسم الثامن: تطوير مهارات الحياة',
    gradeScope: 'ALL_PRIMARY',
    subjectScope: 'ALL',
    structuralRelevance: 'Cross-cutting life skills (développement des compétences de vie). Final section of the document.',
    extractionStatus: 'CONFIRMED',
    evidenceSource: 'Calameo Part 8 title: "8/8 – Compétences de vie, p503–p556".',
    locatorAuthority: 'EXTERNAL_PAGE_REFERENCE',
    notes: 'Page range stated by Calameo host metadata. NOT verified by direct primary-artifact page access. Calameo extract returned 404.',
  },
];

// ── LOCATOR AUTHORITY SUMMARY ────────────────────────────────
// No locator may claim PRIMARY_ARTIFACT_PAGE_VERIFIED without
// direct artifact access, which is not available.

export const LOCATOR_AUTHORITY_SUMMARY = {
  primaryArtifactPageVerified: SOURCE_PAGE_MAP.filter((e) => e.locatorAuthority === 'PRIMARY_ARTIFACT_PAGE_VERIFIED').length,
  crossReferenceLocators: SOURCE_PAGE_MAP.filter((e) => e.locatorAuthority === 'CROSS_REFERENCE_LOCATOR').length,
  sectionReferences: SOURCE_PAGE_MAP.filter((e) => e.locatorAuthority === 'SECTION_REFERENCE').length,
  externalPageReferences: SOURCE_PAGE_MAP.filter((e) => e.locatorAuthority === 'EXTERNAL_PAGE_REFERENCE').length,
  totalEntries: SOURCE_PAGE_MAP.length,
} as const;

// ── PAGE MAP SUMMARY ────────────────────────────────────────

export const PAGE_MAP_SUMMARY = {
  totalEntries: SOURCE_PAGE_MAP.length,
  confirmedEntries: SOURCE_PAGE_MAP.filter((e) => e.extractionStatus === 'CONFIRMED').length,
  inferredEntries: SOURCE_PAGE_MAP.filter((e) => e.extractionStatus === 'INFERRED').length,
  uncertainEntries: SOURCE_PAGE_MAP.filter((e) => e.extractionStatus === 'UNCERTAIN').length,
  notAccessedEntries: SOURCE_PAGE_MAP.filter((e) => e.extractionStatus === 'NOT_ACCESSED').length,
  confirmedPageRanges: SOURCE_PAGE_MAP.filter((e) => e.extractionStatus === 'CONFIRMED').map((e) => e.pageRange),
  notes: 'Page map built from Calaméo part titles, Scribd snippets, and teacher-summary cross-references. NO page is PRIMARY_ARTIFACT_PAGE_VERIFIED — direct artifact access was NOT available. All page ranges are CROSS_REFERENCE/EXTERNAL/SECTION locators, not verified primary pages.',
} as const;

// ── ARTIFACT ACCESS REQUIREMENTS ────────────────────────────
// What is needed for full deep extraction.

export const ARTIFACT_ACCESS_REQUIREMENTS = {
  localPdfAvailable: false,
  machineReadableTextAvailable: false,
  pageBoundariesAvailable: 'PARTIAL — anchors only from external/cross-reference (p1-p53, p216-p271, ~p264, p503-p556). NONE PRIMARY_ARTIFACT_PAGE_VERIFIED.',
  sectionBoundariesAvailable: 'PARTIAL — two main parts confirmed via external metadata, internal parts approximate',
  tablesExtractable: false,
  textQuality: 'NOT_ASSESSED — no local PDF',
  ocrRequired: true,
  exactPageCount: 556,
  artifactHash: 'NOT_AVAILABLE — no local file',
  extractionMechanism: 'PUBLIC_SOURCE_FORENSICS — metadata from Calaméo, Scribd, teacher portals, academic citations. Evidence class: CROSS_REFERENCE (never PRIMARY_ARTIFACT).',
  blockingLimitation: 'No local PDF. Calameo extract 404. Scribd behind authentication. Google Drive PDFs not downloadable via webfetch. Deep page-level extraction not possible without local PDF access.',
  primaryArtifactDeepExtraction: 'BLOCKED_BY_ARTIFACT_ACCESS',
  recommendation: 'Download the PDF from one of the verified mirrors (Google Drive, MediaFire) and place in a local data/ directory for deep extraction in Gate 07C.7.',
} as const;
