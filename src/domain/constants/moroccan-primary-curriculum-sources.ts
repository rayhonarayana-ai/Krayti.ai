/**
 * Qarayti.ai - Gate 07C.1: Moroccan Primary Curriculum Sources (Corrected)
 *
 * Machine-readable registry of sources for the Moroccan
 * primary education curriculum (P1-P6).
 *
 * PROVENANCE RULES (corrected):
 *   - Every source has traceable authority, classification, and retrieval metadata
 *   - sourceClassification reflects DOCUMENT ISSUER, not retrieval host
 *   - sourceAuthority names the original issuing institution
 *   - sourceUrl is the retrieval/mirror location (may differ from issuer)
 *   - OFFICIAL_* classifications require verifiable issuer evidence
 *   - A mirror/host cannot grant official status to a document
 *   - A framework law is not equivalent to curriculum content
 *   - A strategic vision document does not establish grade×subject coverage
 *   - No fabricated source claims
 */

import { CurriculumSourceRecord, SourceClassification } from '../types/curriculum-source-governance.types';
import { MOROCCO_EDUCATION_SYSTEM } from './curriculum-architecture.constants';

// ============================================================
// SOURCE RECORDS (corrected classifications)
// ============================================================

export const PRIMARY_CURRICULUM_SOURCES: CurriculumSourceRecord[] = [
  // SOURCE 1: Primary Curriculum Document (July 2021)
  // CORRECTION: Issuer NOT independently verified from accessible evidence.
  //   - NOT listed on MEN official documents portal (men.gov.ma/fr/documents-officiels)
  //   - Found via secondary mirrors (modarissi.com, profpress.net)
  //   - Cannot confirm MEN as issuer from document metadata alone
  //   - Downgraded from OFFICIAL_CURRICULUM_DOCUMENT to AUTHORIZED_REFERENCE
  //   - All grade×subject claims depending on this source become SOURCE_REQUIRED
  {
    id: 'src-primary-curriculum-2021',
    educationSystemId: MOROCCO_EDUCATION_SYSTEM.id,
    sourceClassification: 'AUTHORIZED_REFERENCE',
    sourceAuthority: 'Issuer unverified — attributed to MEN Direction des Curricula but not confirmed from accessible document metadata or MEN portal listing',
    sourceTitle: 'Al-Manhaj Al-Dirasi lil-Ta\'limal al-Ibtida\'i (Al-Sigha al-Nihaiya al-Kamilia) — Curricula Primaire Version Finale (Juillet 2021)',
    sourceUrl: 'https://www.profpress.net/2021/08/Curriculum-Primaire2021-Final-juillet.pdf.html',
    publicationDate: '2021-07-01',
    retrievedAt: '2026-08-26T00:00:00Z',
    academicYear: '2021-2022+',
    curriculumVersion: '2021-FINAL',
    language: 'ar',
    verificationState: 'UNVERIFIED',
    notes: '556-page curriculum document. Published July 2021. Reported to implement Loi-cadre 51.17 and Vision Strategique 2015-2030. Divided into Part 1 (General Framework) and Part 2 (Program Organization in 3 domains). RETRIEVAL HOST: profpress.net (secondary mirror). ISSUER EVIDENCE: not independently verified — not listed on MEN documents portal. Secondary references (modarissi.com, Tadrise, Tachkila) corroborate existence and grade/subject structure but none establish MEN authorship from primary evidence.',
    createdAt: '2026-08-26T00:00:00Z',
  },

  // SOURCE 2: Pedagogical Guide
  // CORRECTION: Moutamadris.ma is an INDEPENDENT teacher portal, NOT an official Ministry website.
  //   - Self-identifies as "فضاء التلاميذ والأساتذة" (student/teacher space)
  //   - Copyright 2017-2026, independent entity
  //   - Downgraded from OFFICIAL_TEXTBOOK_OR_GUIDE to SECONDARY_REFERENCE
  //   - Cannot establish official provenance from mirror/host
  {
    id: 'src-primary-pedagogical-guide',
    educationSystemId: MOROCCO_EDUCATION_SYSTEM.id,
    sourceClassification: 'SECONDARY_REFERENCE',
    sourceAuthority: 'Independent educational portal (Moutamadris.ma) — NOT an official Ministry website',
    sourceTitle: 'Al-Dalil al-Pedagogi lil-Ta\'limal al-Ibtida\'i — Guide Pedagogique pour l\'Enseignement Primaire',
    sourceUrl: 'https://moutamadris.ma/',
    retrievedAt: '2026-08-26T00:00:00Z',
    academicYear: '2025-2026',
    language: 'ar',
    verificationState: 'UNVERIFIED',
    notes: 'Moutamadris.ma explicitly identifies itself as an independent educational website (student/teacher space), NOT an official Ministry website. Documents hosted there may or may not be official — the host does not establish provenance. Original issuer of the pedagogical guide content is not independently verified from this retrieval location. CLASSIFICATION: SECONDARY_REFERENCE (retrieval host, not issuer).',
    createdAt: '2026-08-26T00:00:00Z',
  },

  // SOURCE 3: Loi-cadre 51.17 (Framework Law)
  // CORRECTION: This is a national framework law, not Ministry-authored curriculum content.
  //   - Published in the Official Bulletin (Journal Officiel)
  //   - Issuer: Moroccan state / King (promulgating authority)
  //   - Retrieved from MEN portal (as host), but MEN is not the law's author
  //   - Reclassified from OFFICIAL_MINISTRY to OFFICIAL_PUBLIC_INSTITUTION
  //   - Scope: system/governance context ONLY — NOT grade×subject evidence
  {
    id: 'src-law-51-17',
    educationSystemId: MOROCCO_EDUCATION_SYSTEM.id,
    sourceClassification: 'OFFICIAL_PUBLIC_INSTITUTION',
    sourceAuthority: 'Moroccan State — promulgated by Royal Decree, published in Journal Officiel',
    sourceTitle: 'Loi-cadre 51.17 relative au système d\'éducation, de formation et de recherche scientifique',
    sourceUrl: 'https://www.men.gov.ma/sites/default/files/2026-02/loi%20cadre.pdf',
    retrievedAt: '2026-08-26T00:00:00Z',
    language: 'fr',
    verificationState: 'UNVERIFIED',
    notes: 'National framework law governing the education system. Published in the Official Bulletin. PROMULGATING AUTHORITY: Moroccan state/King. RETRIEVAL HOST: MEN portal (men.gov.ma). SCOPE: System governance and legal framework ONLY. MUST NOT be used as evidence for specific Grade × Subject curriculum claims unless the law explicitly addresses that subject at that grade level. For Qarayti.ai: used for system/governance context, not curriculum content evidence.',
    createdAt: '2026-08-26T00:00:00Z',
  },

  // SOURCE 4: Strategic Vision 2015-2030
  // CORRECTION: Issuer is CSEFRS, not MEN.
  //   - Conseil Supérieur de l\'Éducation, de la Formation et de la Recherche Scientifique
  //   - CSEFRS is a separate institution from MEN
  //   - Reclassified from OFFICIAL_MINISTRY to OFFICIAL_PUBLIC_INSTITUTION
  //   - Scope: strategic direction ONLY — NOT grade×subject evidence
  {
    id: 'src-vision-2015-2030',
    educationSystemId: MOROCCO_EDUCATION_SYSTEM.id,
    sourceClassification: 'OFFICIAL_PUBLIC_INSTITUTION',
    sourceAuthority: 'Conseil Supérieur de l\'Éducation, de la Formation et de la Recherche Scientifique (CSEFRS) — NOT MEN',
    sourceTitle: 'Vision Stratégique de la Réforme 2015-2030',
    sourceUrl: 'https://www.men.gov.ma/sites/default/files/2026-02/Vision_strateg_CSE%20Fr.pdf',
    retrievedAt: '2026-08-26T00:00:00Z',
    language: 'fr',
    verificationState: 'UNVERIFIED',
    notes: 'Strategic reform framework 2015-2030. ISSUER: CSEFRS (Conseil Supérieur de l\'Éducation, de la Formation et de la Recherche Scientifique), which is a separate institution from MEN. RETRIEVAL HOST: MEN portal. SCOPE: Strategic direction and reform priorities ONLY. MUST NOT be used as evidence for specific Grade × Subject curriculum claims. For Qarayti.ai: used for reform context, not curriculum content evidence.',
    createdAt: '2026-08-26T00:00:00Z',
  },
];

// ============================================================
// ISSUER EVIDENCE SUMMARY
// ============================================================

/**
 * Documents what provenance evidence was found for each source.
 * Used to justify classification choices.
 */
export const SOURCE_PROVENANCE_EVIDENCE = {
  'src-primary-curriculum-2021': {
    issuerEvidenceFound: false,
    evidenceDetail: 'Not listed on MEN official documents portal. Found via secondary mirrors (modarissi.com, profpress.net). Document metadata not independently accessible to confirm MEN authorship.',
    retrievalHosts: ['profpress.net', 'modarissi.com'],
    officialPortalListed: false,
    classificationRationale: 'AUTHORIZED_REFERENCE — issuer not independently verified. All grade×subject claims become SOURCE_REQUIRED.',
  },
  'src-primary-pedagogical-guide': {
    issuerEvidenceFound: false,
    evidenceDetail: 'Moutamadris.ma explicitly identifies as independent educational portal, not Ministry. Document hosted on independent site does not establish official provenance.',
    retrievalHosts: ['moutamadris.ma'],
    officialPortalListed: false,
    classificationRationale: 'SECONDARY_REFERENCE — independent mirror/host cannot grant official status.',
  },
  'src-law-51-17': {
    issuerEvidenceFound: true,
    evidenceDetail: 'Framework law published in Official Bulletin. Promulgating authority is the Moroccan state/King. Retrieved from MEN portal as host, but MEN is not the law\'s author.',
    retrievalHosts: ['men.gov.ma'],
    officialPortalListed: true,
    classificationRationale: 'OFFICIAL_PUBLIC_INSTITUTION — state law, not Ministry curriculum content. Scope: governance context only.',
  },
  'src-vision-2015-2030': {
    issuerEvidenceFound: true,
    evidenceDetail: 'CSEFRS is explicitly named as the issuing institution. CSEFRS is a separate institution from MEN.',
    retrievalHosts: ['men.gov.ma'],
    officialPortalListed: true,
    classificationRationale: 'OFFICIAL_PUBLIC_INSTITUTION — CSEFRS document, not MEN. Scope: strategic direction only.',
  },
} as const;

// ============================================================
// SUBJECT SOURCE MAPPINGS
// ============================================================

/**
 * Subjects with source mappings.
 *
 * IMPORTANT CORRECTION: All mappings previously cited src-primary-curriculum-2021
 * which has been downgraded to AUTHORIZED_REFERENCE / UNVERIFIED.
 * Therefore verifiedAtGradeLevel is now FALSE for all subjects.
 * The grade/subject structure is corroborated by multiple secondary references
 * but the primary source itself is unverified.
 */

export interface SubjectSourceMapping {
  readonly subjectCode: string;
  readonly officialNameAr: string;
  readonly officialNameFr: string;
  readonly confirmedGrades: readonly string[];
  readonly sourceIds: readonly string[];
  readonly mappingNotes: string;
  readonly verifiedAtGradeLevel: boolean;
}

export const PRIMARY_SUBJECT_SOURCE_MAPPINGS: SubjectSourceMapping[] = [
  {
    subjectCode: 'ARABIC',
    officialNameAr: 'اللغة العربية',
    officialNameFr: 'Arabe',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Corroborated by multiple secondary references. Primary source (src-primary-curriculum-2021) is AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'FRENCH',
    officialNameAr: 'اللغة الفرنسية',
    officialNameFr: 'Français',
    confirmedGrades: ['P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'P3-P6 corroborated by secondary references. P1/P2: REVIEW_REQUIRED (source conflict). Primary source AUTHORIZED_REFERENCE / UNVERIFIED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'MATH',
    officialNameAr: 'الرياضيات',
    officialNameFr: 'Mathématiques',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Corroborated by multiple secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'ISLAMIC_EDUCATION',
    officialNameAr: 'التربية الإسلامية',
    officialNameFr: 'Enseignement Islamique',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Corroborated by multiple secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'CIVIC_EDUCATION',
    officialNameAr: 'التربية المدنية',
    officialNameFr: 'Éducation Civique',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Corroborated by secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'SCIENCE',
    officialNameAr: 'النشاط العلمي',
    officialNameFr: 'Activité Scientifique',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Official primary name "النشاط العلمي" corroborated by multiple secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'SPORT',
    officialNameAr: 'التربية البدنية',
    officialNameFr: 'Éducation Physique',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Corroborated by secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'ART',
    officialNameAr: 'التربية التشكيلية',
    officialNameFr: 'Arts Plastiques',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Corroborated by secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
  {
    subjectCode: 'MUSIC',
    officialNameAr: 'التربية الموسيقية',
    officialNameFr: 'Musique',
    confirmedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    sourceIds: ['src-primary-curriculum-2021'],
    mappingNotes: 'Corroborated by secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED.',
    verifiedAtGradeLevel: false,
  },
];

// ============================================================
// FRENCH INTRODUCTION GRADE — SOURCE CONFLICT (corrected)
// ============================================================

export const FRENCH_INTRODUCTION_CONFLICT = {
  sourceA: {
    id: 'src-primary-curriculum-2021',
    classification: 'AUTHORIZED_REFERENCE' as SourceClassification,
    claim: 'French is in Language Domain, introduction grade unclear from structural summary. Source itself is UNVERIFIED.',
  },
  sourceB: {
    id: 'src-primary-pedagogical-guide',
    classification: 'SECONDARY_REFERENCE' as SourceClassification,
    claim: 'French introduced at P3 nationally, some experimental regions at P1/P2. Source is independent portal, NOT official.',
  },
  claim: 'Grade at which French language instruction begins in primary',
  difference: 'P3 (national standard) vs P1/P2 (experimental regions)',
  likelyExplanation: 'Multiple secondary references agree P3 is standard; some regions may differ under experimental programs',
  resolutionStatus: 'REVIEW_REQUIRED' as const,
  affectedGrades: ['P1', 'P2', 'P3'],
};
