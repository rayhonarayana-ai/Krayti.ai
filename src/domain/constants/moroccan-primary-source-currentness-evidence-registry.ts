/** Gate 07C.13 production evidence recovered during Phase A; no unseen content. */
import type { SourceCurrentnessEvidenceRecord } from '../types/curriculum-source-governance.types';

export const CURRENTNESS_EVIDENCE_GATE = '07C.13';
export const CURRENTNESS_EVIDENCE_RETRIEVED_AT = '2026-08-29';
export const P1_MATH_CURRENTNESS_SCOPE = {
  kind: 'GRADE' as const,
  system: 'MOROCCO',
  educationLevel: 'PRIMARY',
  subject: 'MATH',
  grade: 'P1',
};

export const SOURCE_CURRENTNESS_EVIDENCE_REGISTRY: readonly SourceCurrentnessEvidenceRecord[] = [
  {
    evidenceId: 'E-2021-PRIMARY-CURRICULUM-LATEST', sourceId: 'src-primary-curriculum-2021', sourceVersionId: 'v1.0.0',
    evidenceClass: 'LATEST_OFFICIAL_SOURCE_ONLY', authorityTier: 'TIER_1_COMPETENT_AUTHORITY', issuer: 'Moroccan Ministry of National Education', documentType: 'Official primary curriculum document',
    publicationDate: '2021-07', publicationDatePrecision: 'MONTH', targetScope: { kind: 'EDUCATION_LEVEL', system: 'MOROCCO', educationLevel: 'PRIMARY' },
    relationshipToTargetSource: 'Historical target source', relationshipToTargetScope: 'Primary curriculum baseline',
    applicabilityStatement: 'Recovered July 2021 artifact is authoritative historical curriculum evidence, not a timeless operative statement.',
    evidenceLocator: 'Artifact SHA-256 4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F', retrievedAt: CURRENTNESS_EVIDENCE_RETRIEVED_AT,
    supportRole: 'QUALIFYING', artifactHash: '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F', recoveryState: 'RECOVERED_AUTHENTICATED',
    applicabilityPrecision: 'UNKNOWN', applicabilityBasis: 'Historical artifact provenance only.',
  },
  {
    evidenceId: 'E-2026-MEN-CURRICULA', sourceId: 'men-standing-committee-2026',
    evidenceClass: 'REFORM_WITHOUT_CURRICULUM_SUPERSESSION', authorityTier: 'TIER_1_COMPETENT_AUTHORITY', issuer: 'Moroccan Ministry of National Education', documentType: 'Official announcement',
    publicationDate: '2026-07-27', publicationDatePrecision: 'DAY', targetScope: { kind: 'SYSTEM', system: 'MOROCCO' },
    relationshipToTargetSource: 'Qualifies currentness; no replacement stated', relationshipToTargetScope: 'System-wide future curriculum renewal work',
    applicabilityStatement: 'Initial reference framework for future curriculum construction; no completed replacement or P1 Mathematics continuity stated.',
    evidenceLocator: 'https://www.men.gov.ma/السيد-الوزير-يشارك-في-اجتماع-اللجنة-الدائمة-لتجديد-وملاءمة-المناهج-والبرامج/المستجدات', retrievedAt: CURRENTNESS_EVIDENCE_RETRIEVED_AT,
    supportRole: 'QUALIFYING', recoveryState: 'OFFICIAL_PAGE_RECORDED', applicabilityPrecision: 'UNKNOWN', applicabilityBasis: 'Official announcement only.',
  },
  {
    evidenceId: 'E-2026-MEN-PIONEER', sourceId: 'men-pioneer-schools',
    evidenceClass: 'REFORM_WITHOUT_CURRICULUM_SUPERSESSION', authorityTier: 'TIER_1_COMPETENT_AUTHORITY', issuer: 'Moroccan Ministry of National Education', documentType: 'Official programme page',
    publicationDatePrecision: 'UNKNOWN', targetScope: { kind: 'EDUCATION_LEVEL', system: 'MOROCCO', educationLevel: 'PRIMARY' },
    relationshipToTargetSource: 'Implementation evidence only', relationshipToTargetScope: 'Primary pedagogical programme',
    applicabilityStatement: 'Pedagogy, remediation, assessment, and training programme; no curriculum-content continuity or supersession statement.',
    evidenceLocator: 'https://www.men.gov.ma/مؤسسات-الريادة', retrievedAt: CURRENTNESS_EVIDENCE_RETRIEVED_AT,
    supportRole: 'QUALIFYING', recoveryState: 'OFFICIAL_PAGE_RECORDED', applicabilityPrecision: 'UNKNOWN', applicabilityBasis: 'Official programme description only.',
  },
  {
    evidenceId: 'E-2026-CSEFRS-HOME', sourceId: 'csefrs-home-2026',
    evidenceClass: 'OFFICIAL_INSTITUTIONAL_CORROBORATION_ONLY', authorityTier: 'TIER_2_OFFICIAL_INSTITUTION', issuer: 'CSEFRS', documentType: 'Official institutional site',
    publicationDatePrecision: 'UNKNOWN', targetScope: { kind: 'SYSTEM', system: 'MOROCCO' },
    relationshipToTargetSource: 'Institutional corroboration only', relationshipToTargetScope: 'System monitoring/evaluation',
    applicabilityStatement: 'Does not establish P1 Mathematics continuity, replacement, or claim currentness.', evidenceLocator: 'https://www.csefrs.ma/',
    retrievedAt: CURRENTNESS_EVIDENCE_RETRIEVED_AT, supportRole: 'QUALIFYING', recoveryState: 'OFFICIAL_PAGE_RECORDED', applicabilityPrecision: 'UNKNOWN', applicabilityBasis: 'Institutional role only.',
  },
  {
    evidenceId: 'C-2026-REFERENCE-FRAMEWORK', sourceId: 'men-reference-framework-2026',
    evidenceClass: 'OFFICIAL_SOURCE_DISCOVERED_NOT_RECOVERED', authorityTier: 'TIER_1_COMPETENT_AUTHORITY', issuer: 'Moroccan Ministry of National Education', documentType: 'Initial reference framework',
    publicationDate: '2026', publicationDatePrecision: 'YEAR', targetScope: { kind: 'SYSTEM', system: 'MOROCCO' },
    relationshipToTargetSource: 'Possible future successor; artifact unrecovered', relationshipToTargetScope: 'Unknown until authenticated recovery',
    applicabilityStatement: 'No unseen framework content, effective date, or supersession is encoded.', evidenceLocator: 'https://www.men.gov.ma/السيد-الوزير-يشارك-في-اجتماع-اللجنة-الدائمة-لتجديد-وملاءمة-المناهج-والبرامج/المستجدات',
    retrievedAt: CURRENTNESS_EVIDENCE_RETRIEVED_AT, supportRole: 'DISCOVERY_ONLY', recoveryState: 'OFFICIAL_SOURCE_DISCOVERED_NOT_RECOVERED', applicabilityPrecision: 'UNKNOWN', applicabilityBasis: 'Discovery record only.',
  },
] as const;
