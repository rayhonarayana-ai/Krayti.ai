/**
 * Qarayti.ai - Gate 07C.6: Moroccan Primary Curriculum Deep Structure
 *
 * Deep structural elements confirmed by PUBLICLY AVAILABLE sources:
 *   - Teacher-education portals (Hespress, Kech24, Modarissi, Atarbawi, Educaprof)
 *   - Calaméo document parts and Scribd page snippets
 *   - Academic papers (Boukhrissa 2025, Idrissi 2022, PIRLS 2021)
 *   - Ministry-announced curriculum updates (Kech24 2019)
 *   - Teacher-summary PDFs (Cariatmaaref, Moualimi)
 *
 * EXTRACTION METHOD:
 *   PUBLIC_SOURCE_CROSS_REFERENCE — not direct PDF extraction.
 *   Each element cites its evidence source.
 *   Confidence reflects evidence strength, not extraction depth.
 *
 * ANTI-FABRICATION:
 *   - Components listed only when confirmed by 2+ independent public sources
 *   - Competency structure described at organizational level, not content level
 *   - No specific competency text copied
 *   - No invented components beyond what sources confirm
 *   - Counts reflect confirmed components, not assumed completeness
 */

import type {
  CurriculumStructuralElement,
  CurriculumSourceLocator,
  DenominatorType,
  EvidenceClass,
} from '../types/curriculum-source-governance.types';

import { PRIMARY_GRADE_CODES } from './curriculum-architecture.constants';

// ── SOURCE CONSTANTS ─────────────────────────────────────────

const SRC = 'src-primary-curriculum-2021';
const SRC_VERSION = 'v1.0.0';
const SYS = 'MOROCCO';
const STAGE = 'PRIMARY';

// ── EVIDENCE CLASSIFICATION ──────────────────────────────────

type EvidenceLevel = 'CONFIRMED' | 'STRONGLY_SUPPORTED' | 'INFERRED' | 'UNCERTAIN';

// ── DEEP STRUCTURAL ELEMENT ──────────────────────────────────

export interface DeepCurriculumElement {
  readonly id: string;
  readonly sourceId: string;
  readonly sourceVersionId: string;
  readonly educationSystemCode: string;
  readonly stageCode: string;
  readonly gradeCode: string;
  readonly subjectCode: string;

  readonly sourceStructuralType: string;
  readonly sourceTerm: string;
  readonly sourceTermAr?: string;
  readonly sourceTermFr?: string;

  readonly parentElementId?: string;
  readonly sourceOrder?: number;

  readonly sourceLocator: CurriculumSourceLocator;
  readonly extractionMethod: string;
  readonly normalizationClassification: string;
  readonly evidenceClass: EvidenceClass;

  readonly verificationState: 'UNVERIFIED' | 'REVIEW_REQUIRED' | 'VERIFIED';
  readonly contentStatus: string;
  readonly primaryArtifactConfirmation: 'NOT_VERIFIED' | 'VERIFIED';

  readonly denominatorMembership?: string;
  readonly evidenceLevel: EvidenceLevel;
  readonly evidenceSources: readonly string[];
  readonly publisherOrIssuer: string;
  readonly retrievalHost: string;
  readonly reviewNotes?: string;
}

// ── COMPONENT DEFINITIONS ────────────────────────────────────
// Subject components confirmed by public sources.

interface SubjectComponentDef {
  readonly subjectCode: string;
  readonly componentCode: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly evidenceLevel: EvidenceLevel;
  readonly evidenceSources: readonly string[];
  readonly publisherOrIssuer: string;
  readonly retrievalHost: string;
  readonly evidenceClass: Exclude<EvidenceClass, 'PRIMARY_ARTIFACT'>;
  readonly primaryArtifactConfirmation: 'NOT_VERIFIED' | 'VERIFIED';
  readonly denominatorType: DenominatorType;
  readonly confirmedGrades: readonly string[];
}

const SUBJECT_COMPONENTS: readonly SubjectComponentDef[] = [

  // ── ARABIC COMPONENTS ────────────────────────────────────
  // Confirmed by: Hespress 2018, Cariatmaaref, teacher guides
  // Arabic is organized into components (مكونات): listening/speaking, reading, writing
  {
    subjectCode: 'ARABIC',
    componentCode: 'ARABIC_LISTENING_SPEAKING',
    nameAr: 'الاستماع والتحدث',
    nameFr: 'Écoute et Expression Orale',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Hespress 2018 update', 'Cariatmaaref summary', 'Teacher مستجدات PDFs'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Hespress reporting); Cariatmaaref (teacher portal)',
    retrievalHost: 'Hespress (hespress.com); cariatmaaref.com',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'ARABIC',
    componentCode: 'ARABIC_READING',
    nameAr: 'القراءة',
    nameFr: 'Lecture',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Hespress 2018 update', 'Cariatmaaref summary', 'PIRLS alignment noted'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Hespress reporting); Cariatmaaref (teacher portal)',
    retrievalHost: 'Hespress (hespress.com); cariatmaaref.com',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'ARABIC',
    componentCode: 'ARABIC_WRITING',
    nameAr: 'الكتابة',
    nameFr: 'Écriture',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Hespress 2018 update', 'Cariatmaaref summary', 'Includes handwriting, spelling, written expression'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Hespress reporting); Cariatmaaref (teacher portal)',
    retrievalHost: 'Hespress (hespress.com); cariatmaaref.com',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },

  // ── FRENCH COMPONENTS ────────────────────────────────────
  // Confirmed by: Cariatmaaref, Modarissi مستجدات الفرنسية
  {
    subjectCode: 'FRENCH',
    componentCode: 'FRENCH_READING',
    nameAr: 'القراءة',
    nameFr: 'La Lecture',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Cariatmaaref summary', 'Modarissi مستجدات الفرنسية'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via teacher portals); Modarissi (teacher portal)',
    retrievalHost: 'cariatmaaref.com; modarissi.net',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'FRENCH',
    componentCode: 'FRENCH_WRITTEN_PRODUCTION',
    nameAr: 'الإنتاج الكتابي',
    nameFr: 'La Production Écrite',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Cariatmaaref summary', 'Modarissi مستجدات الفرنسية'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via teacher portals); Modarissi (teacher portal)',
    retrievalHost: 'cariatmaaref.com; modarissi.net',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },

  // ── MATH COMPONENTS ──────────────────────────────────────
  // Confirmed by: Kech24 (2019 ministry announcement), Scribd summaries, Moualimi
  {
    subjectCode: 'MATH',
    componentCode: 'MATH_NUMBERS_ARITHMETIC',
    nameAr: 'الأعداد والحساب',
    nameFr: 'Nombres et Calcul',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24 2019 ministry announcement', 'Scribd math summaries', 'Moualimi'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (announcement reported by Kech24); Moualimi (teacher portal); Scribd uploader (secondary)',
    retrievalHost: 'kech24.com; moualimi.press; scribd.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'MATH',
    componentCode: 'MATH_GEOMETRY_MEASUREMENT',
    nameAr: 'الهندسة والقياس',
    nameFr: 'Géométrie et Mesure',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24 2019 ministry announcement', 'Scribd math summaries', 'Moualimi'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (announcement reported by Kech24); Moualimi (teacher portal); Scribd uploader (secondary)',
    retrievalHost: 'kech24.com; moualimi.press; scribd.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'MATH',
    componentCode: 'MATH_DATA_PROCESSING',
    nameAr: 'تنظيم ومعالجة البيانات',
    nameFr: 'Organisation et Traitement des Données',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24 2019 ministry announcement (added component)', 'Scribd summaries'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (announcement reported by Kech24); Scribd uploader (secondary)',
    retrievalHost: 'kech24.com; scribd.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },

  // ── SCIENCE COMPONENTS ───────────────────────────────────
  // Confirmed by: Kech24, Scribd summaries, LeadingEducation PDF
  {
    subjectCode: 'SCIENCE',
    componentCode: 'SCIENCE_LIFE_EARTH',
    nameAr: 'علوم الحياة والأرض',
    nameFr: 'Sciences de la Vie et de la Terre',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24', 'Scribd النشاط العلمي summaries', 'LeadingEducation PDF'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Kech24 reporting); LeadingEducation (education portal); Scribd uploader (secondary)',
    retrievalHost: 'kech24.com; leadingeducation.org; scribd.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'SCIENCE',
    componentCode: 'SCIENCE_PHYSICAL',
    nameAr: 'العلوم الفيزيائية',
    nameFr: 'Sciences Physiques',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24', 'Scribd النشاط العلمي summaries'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Kech24 reporting); Scribd uploader (secondary)',
    retrievalHost: 'kech24.com; scribd.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'SCIENCE',
    componentCode: 'SCIENCE_SPACE',
    nameAr: 'الفضاء',
    nameFr: 'L\'Espace',
    evidenceLevel: 'STRONGLY_SUPPORTED',
    evidenceSources: ['Scribd summaries', 'Teacher guides'],
    publisherOrIssuer: 'Teacher guides (unattributed); Scribd uploader (secondary)',
    retrievalHost: 'scribd.com; teacher-guide PDFs',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'SCIENCE',
    componentCode: 'SCIENCE_TECHNOLOGY',
    nameAr: 'التكنولوجيا',
    nameFr: 'Technologie',
    evidenceLevel: 'STRONGLY_SUPPORTED',
    evidenceSources: ['Scribd summaries', 'Teacher guides'],
    publisherOrIssuer: 'Teacher guides (unattributed); Scribd uploader (secondary)',
    retrievalHost: 'scribd.com; teacher-guide PDFs',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  },

  // ── SOCIAL STUDIES COMPONENTS ────────────────────────────
  // Confirmed by: Kech24, Atarbawi, Moualimi
  // NOTE: Social studies (الاجتماعيات) begins at Grade 4
  {
    subjectCode: 'CIVIC_EDUCATION',
    componentCode: 'SOCIAL_HISTORY',
    nameAr: 'التاريخ',
    nameFr: 'Histoire',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24', 'Moualimi', 'Atarbawi مستجدات الاجتماعيات'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Kech24 reporting); Atarbawi (teacher portal); Moualimi (teacher portal)',
    retrievalHost: 'kech24.com; moualimi.press; atarbawi.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'CIVIC_EDUCATION',
    componentCode: 'SOCIAL_GEOGRAPHY',
    nameAr: 'الجغرافيا',
    nameFr: 'Géographie',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24', 'Moualimi', 'Atarbawi مستجدات الاجتماعيات'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Kech24 reporting); Atarbawi (teacher portal); Moualimi (teacher portal)',
    retrievalHost: 'kech24.com; moualimi.press; atarbawi.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P4', 'P5', 'P6'],
  },
  {
    subjectCode: 'CIVIC_EDUCATION',
    componentCode: 'SOCIAL_CITIZENSHIP',
    nameAr: 'التربية على المواطنة',
    nameFr: 'Éducation à la Citoyenneté',
    evidenceLevel: 'CONFIRMED',
    evidenceSources: ['Kech24', 'Moualimi', 'Atarbawi مستجدات الاجتماعيات'],
    publisherOrIssuer: 'Ministère de l\'Éducation Nationale (via Kech24 reporting); Atarbawi (teacher portal); Moualimi (teacher portal)',
    retrievalHost: 'kech24.com; moualimi.press; atarbawi.com',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    denominatorType: 'COMPONENT',
    confirmedGrades: ['P4', 'P5', 'P6'],
  },
];

// ── COMPETENCY MODEL ────────────────────────────────────────
// Per-grade competency structure confirmed by Scribd snippets and academic sources.

export interface CompetencyModelEntry {
  readonly gradeCode: string;
  readonly modelElement: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly evidenceLevel: EvidenceLevel;
  readonly evidenceSources: readonly string[];
}

export const COMPETENCY_MODEL_ENTRIES: readonly CompetencyModelEntry[] = PRIMARY_GRADE_CODES.map((gradeCode) => ({
  gradeCode,
  modelElement: 'ANNUAL_COMPETENCY',
  nameAr: 'الكفاية السنوية',
  nameFr: 'La Compétence Annuelle',
  evidenceLevel: 'CONFIRMED' as EvidenceLevel,
  evidenceSources: ['Scribd page snippets (section 7)', 'PIRLS 2021 Morocco entry', 'Academic papers (Boukhrissa 2025, Idrissi 2022)'],
}));

export const COMPETENCY_SUB_ELEMENTS = [
  {
    code: 'ENTRY_PROFILE',
    nameAr: 'ال profil d\'entrée',
    nameFr: 'Profil d\'Entrée',
    evidenceLevel: 'CONFIRMED' as EvidenceLevel,
    evidenceSources: ['Scribd snippet: "7.6.1 profil d\'entrée et de sortie … p264"'],
  },
  {
    code: 'EXIT_PROFILE',
    nameAr: 'ال profil de sortie',
    nameFr: 'Profil de Sortie',
    evidenceLevel: 'CONFIRMED' as EvidenceLevel,
    evidenceSources: ['Scribd snippet: "7.6.1 profil d\'entrée et de sortie … p264"'],
  },
  {
    code: 'SUB_COMPETENCIES',
    nameAr: 'الكفايات الفرعية',
    nameFr: 'Sous-Compétences à Développer',
    evidenceLevel: 'CONFIRMED' as EvidenceLevel,
    evidenceSources: ['Scribd snippet: "7.6.2 la compétence annuelle et les sous-compétences … p265"'],
  },
] as const;

// ── BUILD DEEP ELEMENTS ─────────────────────────────────────

function deepElementId(
  sourceId: string,
  sourceVersionId: string,
  gradeCode: string,
  subjectCode: string,
  componentCode: string,
): string {
  return [sourceId, sourceVersionId, gradeCode, subjectCode, 'COMPONENT', componentCode].join('::');
}

const deepElements: DeepCurriculumElement[] = [];

for (const comp of SUBJECT_COMPONENTS) {
  for (const gradeCode of comp.confirmedGrades) {
    deepElements.push({
      id: deepElementId(SRC, SRC_VERSION, gradeCode, comp.subjectCode, comp.componentCode),
      sourceId: SRC,
      sourceVersionId: SRC_VERSION,
      educationSystemCode: SYS,
      stageCode: STAGE,
      gradeCode,
      subjectCode: comp.subjectCode,
      sourceStructuralType: 'COMPONENT',
      sourceTerm: comp.nameFr,
      sourceTermAr: comp.nameAr,
      sourceTermFr: comp.nameFr,
      sourceLocator: {
        precision: 'SECTION_ONLY',
        section: `${comp.nameFr} — ${gradeCode}`,
        heading: comp.nameAr,
      },
      extractionMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE',
      normalizationClassification: 'DERIVED',
      evidenceClass: comp.evidenceClass,
      verificationState: 'UNVERIFIED',
      contentStatus: 'EXTRACTED_UNVERIFIED',
      primaryArtifactConfirmation: comp.primaryArtifactConfirmation,
      denominatorMembership: comp.componentCode,
      evidenceLevel: comp.evidenceLevel,
      evidenceSources: comp.evidenceSources,
      publisherOrIssuer: comp.publisherOrIssuer,
      retrievalHost: comp.retrievalHost,
      reviewNotes: `Component confirmed by: ${comp.evidenceSources.join('; ')}. Evidence class: ${comp.evidenceClass}. Primary artifact confirmation: ${comp.primaryArtifactConfirmation}. Requires PDF verification for exact locator.`,
    });
  }
}

export const DEEP_STRUCTURAL_ELEMENTS: readonly DeepCurriculumElement[] = deepElements;

// ── COMPONENT COUNTS BY SUBJECT ──────────────────────────────

function countComponentsBySubject(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const comp of SUBJECT_COMPONENTS) {
    result[comp.subjectCode] = (result[comp.subjectCode] ?? 0) + 1;
  }
  return result;
}

export const COMPONENT_COUNTS = countComponentsBySubject();

// ── PER-SUBJECT COMPONENT LIST ───────────────────────────────

export function getSubjectComponents(subjectCode: string): readonly SubjectComponentDef[] {
  return SUBJECT_COMPONENTS.filter((c) => c.subjectCode === subjectCode);
}

// ── DEEP EXTRACTION STATUS ────────────────────────────────
// Truthful status of direct primary-artifact deep extraction.

export const PRIMARY_ARTIFACT_DEEP_EXTRACTION = {
  status: 'BLOCKED_BY_ARTIFACT_ACCESS' as const,
  primaryPdfAvailable: false,
  deepPrimaryExtractionPerformed: false,
  blockingReason: 'No local PDF. Calameo extract 404. Scribd behind authentication. Google Drive PDFs not downloadable via webfetch. Direct page-level extraction impossible without local PDF access.',
  componentEvidenceClass: 'CROSS_REFERENCE' as const,
  isCodeFailure: false,
  isEvidenceAccessLimitation: true,
};

// ── COMPETENCY STRUCTURE EVIDENCE ─────────────────────────
// Conservative: cross-reference supported, NOT direct-artifact verified.

export const COMPETENCY_STRUCTURE_EVIDENCE = {
  classification: 'CROSS_REFERENCE_SUPPORTED_COMPETENCY_STRUCTURE' as const,
  evidenceLevel: 'CONFIRMED' as const,
  primaryArtifactConfirmation: 'NOT_VERIFIED' as const,
  evidenceSources: [
    'Scribd page snippets (section 7, p264-p265)',
    'PIRLS 2021 Morocco entry',
    'Academic papers (Boukhrissa 2025, Idrissi 2022)',
  ],
  note: 'Competency organizational model (annual competency + entry/exit profiles + sub-competencies) is supported by public cross-reference. The primary 2021 artifact has NOT been directly parsed for this structure. No specific competency text is created.',
} as const;

// ── DEEP EXTRACTION NOTES ───────────────────────────────────

export const DEEP_STRUCTURE_NOTES = {
  summary: `${deepElements.length} deep structural elements extracted from PUBLIC SOURCES (cross-reference evidence, NOT direct artifact extraction). ${SUBJECT_COMPONENTS.length} subject components supported by public cross-reference across 5 subjects. All primary-artifact deep extraction is BLOCKED_BY_ARTIFACT_ACCESS.`,
  extractionMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE — not direct PDF extraction. Each element cites public evidence sources with explicit evidence class.',
  evidenceLevel: 'Components confirmed by 2+ independent public sources (teacher portals, academic papers, ministry announcements). Evidence class is SECONDARY_CROSS_REFERENCE or OFFICIAL_CROSS_REFERENCE — never PRIMARY_ARTIFACT.',
  limitations: 'No local PDF available. Exact page locators not confirmed. Component counts reflect what public sources confirm, not necessarily the complete set. Primary artifact confirmation = NOT_VERIFIED for all components.',
  antiFabrication: 'No components invented. Only structures supported by public cross-reference are included. Missing subjects (Islamic Education, Sport, Art, Music) remain at SURFACE extraction — their internal structure was not confirmed by the public sources found.',
  competencyModel: 'CROSS_REFERENCE_SUPPORTED_COMPETENCY_STRUCTURE — per-grade annual competency + sub-competencies organizational model is supported by public cross-reference, NOT direct-artifact verified. Specific competency text not created.',
  denominatorImpact: 'Arabic (3 components), French (2 components), Math (3 components), Science (4 components), Civic/Social Studies (3 components from P4). These are CROSS-REFERENCE candidate counts, NOT verified official denominators. Islamic Education, Sport, Art, Music: no components confirmed by public sources.',
  authoritySeparation: 'ORIGINAL CURRICULUM ARTIFACT != PUBLIC CROSS-REFERENCE != RETRIEVAL HOST. Cross-reference supports investigation but does NOT inherit OFFICIAL_CURRICULUM_DOCUMENT authority from the 2021 artifact.',
} as const;
