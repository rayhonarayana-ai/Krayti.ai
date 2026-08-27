/**
 * Qarayti.ai - Gate 07B/07C.2: Curriculum Source Governance Types
 *
 * Defines the provenance, verification, and ingestion contract
 * for canonical Moroccan curriculum content.
 *
 * SEPARATION OF CONCERNS:
 *   SourceClassification — where content came from (authority)
 *   VerificationState — has Qarayti verified it
 *   PublicationState — may production consumers use it
 *   IngestionState — where in the pipeline is it
 *
 * TRUST RULES:
 *   AI_GENERATED / INTERNAL_DRAFT / UNVERIFIED material
 *   MUST NOT become canonical PUBLISHED curriculum.
 *   PUBLISHED requires VERIFIED verification state.
 *   DB CHECK constraints enforce this invariant.
 *
 * CURRICULUM VERSIONING (Gate 07C.2 additions):
 *   - Source records support temporal applicability (effectiveFrom/To)
 *   - Source records support supersession chains (supersedesSourceId)
 *   - Claim-level provenance traces each claim to its source
 *   - Source precedence policy defines conservative authority ordering
 *   - Multiple curriculum versions are preserved (never destroyed)
 *   - Partial supersession: new docs override only their explicit scope
 */

// ============================================================
// SOURCE CLASSIFICATION
// ============================================================

export type SourceClassification =
  | 'OFFICIAL_MINISTRY'
  | 'OFFICIAL_EXAM'
  | 'OFFICIAL_CURRICULUM_DOCUMENT'
  | 'OFFICIAL_TEXTBOOK_OR_GUIDE'
  | 'OFFICIAL_PUBLIC_INSTITUTION'
  | 'AUTHORIZED_REFERENCE'
  | 'SECONDARY_REFERENCE'
  | 'INTERNAL_DRAFT'
  | 'AI_GENERATED';

// ============================================================
// VERIFICATION STATE
// ============================================================

export type VerificationState =
  | 'UNVERIFIED'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED'
  | 'REJECTED';

// ============================================================
// PUBLICATION STATE (extends PublicationStatus from 07A)
// ============================================================

export type CanonicalPublicationState =
  | 'NOT_INGESTED'
  | 'SOURCE_REQUIRED'
  | 'DRAFT'
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'RETIRED'
  | 'SUPERSEDED';

// ============================================================
// INGESTION PIPELINE STATE
// ============================================================

export type IngestionState =
  | 'SOURCE_DISCOVERED'
  | 'SOURCE_CAPTURED'
  | 'PARSED'
  | 'NORMALIZED'
  | 'MAPPED'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'QUARANTINED'
  | 'RETIRED';

// ============================================================
// CURRICULUM SOURCE RECORD
// ============================================================

export interface CurriculumSourceRecord {
  readonly id: string;
  readonly educationSystemId: string;
  readonly sourceClassification: SourceClassification;
  readonly sourceAuthority: string;
  readonly sourceTitle: string;
  readonly sourceUrl?: string;
  readonly sourceReference?: string;
  readonly publicationDate?: string;
  readonly retrievedAt: string;
  readonly academicYear?: string;
  readonly curriculumVersion?: string;
  readonly language: string;
  readonly verificationState: VerificationState;
  readonly verifiedAt?: string;
  readonly verifiedBy?: string;
  readonly contentHash?: string;
  readonly notes?: string;
  readonly createdAt: string;

  // Gate 07C.2: Temporal applicability & supersession
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly supersedesSourceId?: string;
  readonly supersededBySourceId?: string;
}

// ============================================================
// INGESTION UNIT
// ============================================================

export interface CurriculumIngestionUnit {
  readonly id: string;
  readonly sourceRecordId: string;
  readonly ingestionState: IngestionState;
  readonly targetGradeId: string;
  readonly targetSubjectId: string;
  readonly targetProgramCode?: string;
  readonly contentPayload: string;
  readonly validationErrors: string[];
  readonly createdAt: string;
  readonly processedAt?: string;
}

// ============================================================
// CURRICULUM VERSION TRACKING
// ============================================================

export interface CurriculumVersionRecord {
  readonly id: string;
  readonly educationSystemId: string;
  readonly gradeId: string;
  readonly subjectId: string;
  readonly curriculumVersion: string;
  readonly academicYear?: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly isCurrent: boolean;
  readonly supersedesSourceId?: string;
  readonly supersededBy?: string;
  readonly sourceRecordId: string;
  readonly status: CanonicalPublicationState;
  readonly createdAt: string;
}

// ============================================================
// COVERAGE STATUS
// ============================================================

export type CoverageStatus =
  | 'NOT_INGESTED'
  | 'SOURCE_REQUIRED'
  | 'SOURCE_VERIFIED'
  | 'PARTIALLY_COVERED'
  | 'FULLY_COVERED'
  | 'VERIFIED'
  | 'PUBLISHED';

export interface GradeCoverageEntry {
  readonly gradeId: string;
  readonly gradeCode: string;
  readonly stageCode: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly subjects: SubjectCoverageEntry[];
  readonly overallStatus: CoverageStatus;
  readonly examRelevance: ExamRelevanceLevel;
}

export interface SubjectCoverageEntry {
  readonly subjectId: string;
  readonly subjectCode: string;
  readonly subjectNameAr: string;
  readonly subjectNameFr: string;
  readonly status: CoverageStatus;
  readonly sourceRecordId?: string;
  readonly hasUnits: boolean;
  readonly hasLessons: boolean;
  readonly hasKO: boolean;
  readonly hasExercises: boolean;
}

export type ExamRelevanceLevel =
  | 'NONE'
  | 'LOCAL_ONLY'
  | 'REGIONAL_APPLICABLE'
  | 'NATIONAL_APPLICABLE'
  | 'BAC_APPLICABLE';

// ============================================================
// ADVERSARIAL TRUST ESCALATION ATTEMPT
// ============================================================

export interface TrustEscalationAttempt {
  readonly description: string;
  readonly shouldFail: boolean;
  readonly failureReason: string;
}

// ============================================================
// SOURCE PRECEDENCE POLICY (Gate 07C.2 — 0C)
// ============================================================
// Conservative authority ordering. "Newer" alone does NOT override "higher authority."
// A newer secondary source CANNOT override an older official document.
// A newer official document overrides an older one ONLY for its explicit scope.

export type SourcePrecedenceLevel =
  | 'OFFICIAL_AMENDMENT_REVISION'
  | 'OFFICIAL_CURRICULUM_DOCUMENT'
  | 'OFFICIAL_SUBJECT_SPECIFIC'
  | 'OFFICIAL_EXAM_REGULATORY'
  | 'OFFICIAL_PEDAGOGICAL_GUIDANCE'
  | 'OLDER_OFFICIAL_CURRICULUM'
  | 'AUTHORIZED_REFERENCE'
  | 'SECONDARY_REFERENCE';

export interface SourcePrecedenceEntry {
  readonly level: SourcePrecedenceLevel;
  readonly sourceClassification: SourceClassification;
  readonly description: string;
  readonly overridesLowerLevels: boolean;
}

// ============================================================
// CLAIM-LEVEL PROVENANCE (Gate 07C.2 — 0G)
// ============================================================
// Every canonical curricular claim must be traceable to its source(s).

export type ClaimType =
  | 'GRADE_EXISTENCE'
  | 'SUBJECT_BY_GRADE'
  | 'OFFICIAL_SUBJECT_NAMES'
  | 'CURRICULUM_DOMAINS'
  | 'DOMAIN_STRUCTURE'
  | 'SUBJECT_NAME'
  | 'SUBJECT_APPLICABILITY'
  | 'SECTION_SCOPE'
  | 'PROGRAM_ORGANIZATION'
  | 'COMPETENCIES'
  | 'UNITS_CONTENT'
  | 'EXERCISES'
  | 'ASSESSMENT_RULES'
  | 'COEFFICIENTS'
  | 'IMPLEMENTATION_DETAILS'
  | 'FRENCH_INTRODUCTION_GRADE';

export interface ClaimProvenance {
  readonly claimType: ClaimType;
  readonly gradeCode?: string;
  readonly subjectCode?: string;
  readonly sourceId: string;
  readonly sourceVersion?: string;
  readonly sourceLocation?: string;
  readonly verificationState: VerificationState;
  readonly effectiveScope: string;
  readonly effectivePeriodFrom?: string;
  readonly effectivePeriodTo?: string;
  readonly confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'UNVERIFIED';
  readonly notes?: string;
}

// ============================================================
// PARTIAL SUPERSESSION MODEL (Gate 07C.2 — 0D)
// ============================================================
// A new document may change only part of the older curriculum.

export interface PartialSupersession {
  readonly supersedingSourceId: string;
  readonly supersededSourceId: string;
  readonly affectedGrades: readonly string[];
  readonly affectedSubjects: readonly string[];
  readonly affectedClaimTypes: readonly ClaimType[];
  readonly effectiveFrom?: string;
  readonly scopeDescription: string;
}

// ============================================================
// TEMPORAL CLAIM PROVENANCE (Gate 07C.2 — Issue 2)
// ============================================================
// Temporal metadata itself must have provenance.
// publicationDate != effectiveFrom. Never infer one from the other.

export type TemporalConfidence =
  | 'VERIFIED'       // Stated explicitly in the source artifact or official decision
  | 'INFERRED'       // Derived from context (academic year, publication date) but not stated
  | 'REVIEW_REQUIRED' // Conflicting or ambiguous evidence
  | 'UNKNOWN';       // No evidence available

export type TemporalFieldName =
  | 'publicationDate'
  | 'effectiveFrom'
  | 'effectiveTo'
  | 'academicYearFrom'
  | 'academicYearUntil'
  | 'supersedesSourceId'
  | 'supersededBySourceId';

export interface TemporalClaimProvenance {
  readonly fieldName: TemporalFieldName;
  readonly value: string | null | undefined;
  readonly confidence: TemporalConfidence;
  readonly sourceOfAssertion: string;
  readonly evidenceDescription: string;
  readonly notes?: string;
}

// ============================================================
// CURRICULUM CURRENTNESS STATUS (Gate 07C.2 — 0F)
// ============================================================
// Conservative statuses that avoid assuming permanence.

export type CurriculumCurrentnessStatus =
  | 'LATEST_VERIFIED_ARTIFACT_FOUND'
  | 'CURRENT_WITH_EXCEPTIONS'
  | 'SUPERSEDED_IN_PART'
  | 'SUPERSEDED_FULLY'
  | 'CURRENTNESS_UNRESOLVED';

// ============================================================
// MULTI-SOURCE CLAIM ASSEMBLY (Gate 07C.2 — 0B)
// ============================================================
// Canonical truth may be assembled from multiple verified sources.

export interface AssembledCanonicalClaim {
  readonly claimType: ClaimType;
  readonly gradeCode?: string;
  readonly subjectCode?: string;
  readonly claimValue: string;
  readonly sourceProvenances: readonly ClaimProvenance[];
  readonly precedenceResolved: boolean;
  readonly latestSourceId: string;
  readonly notes?: string;
}

// ============================================================
// EXTRACTION METHOD (Gate 07C.3)
// ============================================================

export type ExtractionMethod =
  | 'DIRECT_QUOTE'
  | 'DIRECT_STRUCTURED_EXTRACTION'
  | 'NORMALIZED_FROM_SOURCE'
  | 'DERIVED_STRUCTURAL_MAPPING'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'OCR_EXTRACTED';

// ============================================================
// NORMALIZATION CLASSIFICATION (Gate 07C.3)
// ============================================================

export type NormalizationClassification =
  | 'DIRECT'
  | 'LOSSLESS_NORMALIZATION'
  | 'DERIVED'
  | 'AMBIGUOUS'
  | 'UNMAPPABLE'
  | 'REVIEW_REQUIRED';

// ============================================================
// SOURCE LOCATOR PRECISION (Gate 07C.3)
// ============================================================

export type LocatorPrecision =
  | 'EXACT_PAGE'
  | 'SECTION_ONLY'
  | 'DOCUMENT_LEVEL'
  | 'UNKNOWN';

// ============================================================
// SOURCE LOCATOR (Gate 07C.3)
// ============================================================

export interface CurriculumSourceLocator {
  readonly precision: LocatorPrecision;
  readonly page?: string;
  readonly section?: string;
  readonly heading?: string;
  readonly table?: string;
  readonly paragraph?: string;
  readonly artifactAnchor?: string;
  readonly notes?: string;
}

// ============================================================
// EXTRACTION CONTENT STATUS (Gate 07C.3)
// ============================================================

export type ExtractionContentStatus =
  | 'NOT_EXTRACTED'
  | 'PARTIALLY_EXTRACTED'
  | 'EXTRACTED_UNVERIFIED'
  | 'REVIEW_REQUIRED'
  | 'CONTENT_VERIFIED'
  | 'PUBLISHED';

// ============================================================
// CURRICULUM EXTRACTION CLAIM (Gate 07C.3)
// ============================================================

export interface CurriculumExtractionClaim {
  readonly id: string;
  readonly scopeKey: string;
  readonly educationSystemCode: string;
  readonly stageCode: string;
  readonly gradeCode: string;
  readonly subjectCode: string;

  readonly claimType: ClaimType;

  readonly sourceId: string;
  readonly sourceVersionId?: string;
  readonly sourceClassification: SourceClassification;

  readonly sourceLocator: CurriculumSourceLocator;

  readonly originalTextAr?: string;
  readonly originalTextFr?: string;
  readonly normalizedValue: string;

  readonly extractionMethod: ExtractionMethod;
  readonly normalizationClassification: NormalizationClassification;

  readonly verificationState: VerificationState;
  readonly contentStatus: ExtractionContentStatus;
  readonly confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'UNVERIFIED';

  readonly temporalApplicability: {
    readonly effectiveFrom?: string;
    readonly effectiveTo?: string;
    readonly academicYearFrom?: string;
    readonly academicYearUntil?: string;
    readonly publicationDateVerified?: boolean;
    readonly effectiveDateConfidence: TemporalConfidence;
  };

  readonly supersessionState?: {
    readonly isSuperseded: boolean;
    readonly supersedingSourceId?: string;
    readonly scopeSpecific: boolean;
  };

  readonly notes?: string;
}

// ============================================================
// CURRICULUM CONTENT CONFLICT (Gate 07C.3)
// ============================================================

export type ConflictResolutionStatus =
  | 'UNRESOLVED'
  | 'HIGHER_AUTHORITY_SOURCE'
  | 'LATER_EQUAL_AUTHORITY_SOURCE'
  | 'SCOPE_SPECIFIC_OVERRIDE'
  | 'HUMAN_REVIEW_REQUIRED';

export interface CurriculumClaimConflict {
  readonly id: string;
  readonly claimScope: string;
  readonly gradeCode: string;
  readonly subjectCode: string;
  readonly candidateSourceIds: readonly string[];
  readonly conflictingValues: readonly string[];
  readonly authorityComparison: string;
  readonly temporalComparison?: string;
  readonly resolutionStatus: ConflictResolutionStatus;
  readonly resolutionReason?: string;
  readonly notes?: string;
}

// ============================================================
// EXTRACTION CONTENT METRICS (Gate 07C.3)
// ============================================================
// extractionMethod and normalizationClassification are SEPARATE DIMENSIONS,
// not mutually exclusive buckets. One claim has both an extractionMethod
// AND a normalizationClassification. The distributions below are
// independent tallies, not components of a single total.

export interface ExtractionContentMetrics {
  readonly totalClaims: number;

  // Source-level coverage (separate from extracted claims)
  readonly gradeSubjectCellsSourceVerified: number;

  // Distribution by extractionMethod (dimension 1)
  readonly byExtractionMethod: {
    readonly DIRECT_QUOTE: number;
    readonly DIRECT_STRUCTURED_EXTRACTION: number;
    readonly NORMALIZED_FROM_SOURCE: number;
    readonly DERIVED_STRUCTURAL_MAPPING: number;
    readonly HUMAN_REVIEW_REQUIRED: number;
    readonly OCR_EXTRACTED: number;
  };

  // Distribution by normalizationClassification (dimension 2)
  readonly byNormalizationClassification: {
    readonly DIRECT: number;
    readonly LOSSLESS_NORMALIZATION: number;
    readonly DERIVED: number;
    readonly AMBIGUOUS: number;
    readonly UNMAPPABLE: number;
    readonly REVIEW_REQUIRED: number;
  };

  // Distribution by verificationState (dimension 3)
  readonly byVerificationState: {
    readonly UNVERIFIED: number;
    readonly REVIEW_REQUIRED: number;
    readonly VERIFIED: number;
    readonly REJECTED: number;
  };

  // Distribution by contentStatus (dimension 4)
  readonly byContentStatus: {
    readonly NOT_EXTRACTED: number;
    readonly PARTIALLY_EXTRACTED: number;
    readonly EXTRACTED_UNVERIFIED: number;
    readonly REVIEW_REQUIRED: number;
    readonly CONTENT_VERIFIED: number;
    readonly PUBLISHED: number;
  };
}

// ============================================================
// HISTORICAL APPLICABILITY CONFIDENCE (Gate 07C.3)
// ============================================================

export type ApplicabilityConfidence =
  | 'APPLICABLE_VERIFIED'       // Source explicitly states effective period
  | 'APPLICABLE_INFERRED'       // Inferred from publication date + context
  | 'APPLICABILITY_UNKNOWN'     // No evidence for or against applicability
  | 'NOT_APPLICABLE_VERIFIED';  // Source explicitly does not apply to this period

// ============================================================
// STRUCTURAL ELEMENT TYPES (Gate 07C.4)
// ============================================================

export type SourceStructuralType =
  | 'DOCUMENT_PART'
  | 'DOMAIN'
  | 'SUBJECT'
  | 'GRADE_SECTION'
  | 'OTHER_SOURCE_STRUCTURE';

export type NormalizedStructuralType =
  | 'DOCUMENT_PART'
  | 'DOMAIN'
  | 'SUBJECT'
  | 'GRADE_SECTION'
  | 'REVIEW_REQUIRED';

export type GradeExtractionStatus =
  | 'NOT_SCANNED'
  | 'STRUCTURE_DISCOVERED'
  | 'PARTIALLY_EXTRACTED'
  | 'STRUCTURE_EXTRACTED'
  | 'REVIEW_REQUIRED'
  | 'BLOCKED_BY_SOURCE';

// ============================================================
// CURRICULUM STRUCTURAL ELEMENT (Gate 07C.4)
// ============================================================

export interface CurriculumStructuralElement {
  readonly id: string;
  readonly scopeKey: string;
  readonly sourceId: string;
  readonly sourceVersionId?: string;

  readonly educationSystemCode: string;
  readonly stageCode: string;
  readonly gradeCode: string;
  readonly subjectCode: string;

  readonly sourceStructuralType: SourceStructuralType;
  readonly sourceTerm: string;
  readonly sourceTermAr?: string;
  readonly sourceTermFr?: string;
  readonly normalizedStructuralType: NormalizedStructuralType;

  readonly parentElementId?: string;
  readonly orderInSource?: number;

  readonly sourceLocator: CurriculumSourceLocator;
  readonly extractionMethod: ExtractionMethod;
  readonly normalizationClassification: NormalizationClassification;

  readonly verificationState: VerificationState;
  readonly contentStatus: ExtractionContentStatus;

  readonly temporalApplicability: {
    readonly effectiveFrom?: string;
    readonly effectiveTo?: string;
    readonly academicYearFrom?: string;
    readonly academicYearUntil?: string;
    readonly publicationDateVerified?: boolean;
    readonly effectiveDateConfidence: TemporalConfidence;
  };

  readonly claimRecordId?: string;
  readonly reviewNotes?: string;
}

// ============================================================
// EXTRACTION GAP (Gate 07C.4)
// ============================================================

export type ExtractionGapType =
  | 'SOURCE_SECTION_UNREADABLE'
  | 'LOCATOR_UNCERTAIN'
  | 'STRUCTURAL_TYPE_AMBIGUOUS'
  | 'PARENT_RELATIONSHIP_AMBIGUOUS'
  | 'GRADE_SCOPE_UNCERTAIN'
  | 'SUBJECT_SCOPE_UNCERTAIN'
  | 'POSSIBLE_SUPERSESSION'
  | 'OCR_REVIEW_REQUIRED'
  | 'TRANSLATION_REVIEW_REQUIRED'
  | 'SOURCE_CONFLICT';

export type ExtractionGapSeverity = 'BLOCKING' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ExtractionGapStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DEFERRED';

export interface ExtractionGap {
  readonly gapId: string;
  readonly scope: string;
  readonly sourceId: string;
  readonly locator?: CurriculumSourceLocator;
  readonly severity: ExtractionGapSeverity;
  readonly reason: string;
  readonly requiredAction: string;
  readonly status: ExtractionGapStatus;
  readonly notes?: string;
}

// ============================================================
// GRADE EXTRACTION STATUS (Gate 07C.4)
// ============================================================

export interface GradeExtractionEntry {
  readonly gradeCode: string;
  readonly status: GradeExtractionStatus;
  readonly subjectsExtracted: number;
  readonly totalSubjectsExpected: number;
  readonly structuralElementCount: number;
  readonly verifiedClaimCount: number;
  readonly reviewRequiredCount: number;
  readonly notes?: string;
}

// ============================================================
// SUBJECT EXTRACTION STATUS (Gate 07C.4)
// ============================================================

export interface SubjectExtractionEntry {
  readonly gradeCode: string;
  readonly subjectCode: string;
  readonly sourcePresence: 'PRESENT' | 'ABSENT' | 'UNCERTAIN';
  readonly structureDiscovered: boolean;
  readonly structureExtracted: boolean;
  readonly claimCount: number;
  readonly verifiedClaimCount: number;
  readonly reviewRequiredClaimCount: number;
  readonly denominatorKnown: boolean;
  readonly expectedStructuralElementCount?: number;
  readonly extractedStructuralElementCount: number;
  readonly completenessRatio?: number;
  readonly completenessConfidence: 'VERIFIED' | 'SUPPORTED' | 'PARTIAL' | 'UNKNOWN';
  readonly notes?: string;
}

// ============================================================
// COMPLETENESS METRICS (Gate 07C.4)
// ============================================================

export interface StructuralExtractionMetrics {
  readonly totalStructuralElements: number;
  readonly byGrade: Record<string, number>;
  readonly bySubject: Record<string, number>;
  readonly byStructuralType: Record<string, number>;
  readonly byExtractionMethod: Record<string, number>;
  readonly byNormalizationClassification: Record<string, number>;
  readonly byVerificationState: Record<string, number>;
  readonly byContentStatus: Record<string, number>;
  readonly reviewRequiredCount: number;
  readonly unknownLocatorCount: number;
  readonly exactPageLocatorCount: number;
  readonly sectionLocatorCount: number;
  readonly denominatorKnownCount: number;
  readonly denominatorUnknownCount: number;
}
