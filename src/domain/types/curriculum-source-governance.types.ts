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

// ============================================================
// DENOMINATOR CONFIDENCE (Gate 07C.5)
// ============================================================

export type DenominatorConfidence =
  | 'VERIFIED'    // Source explicitly establishes complete enumerable set
  | 'SUPPORTED'   // Strong structural evidence, minor ambiguity remains
  | 'PARTIAL'     // Some expected structure known but complete set not proven
  | 'UNKNOWN';    // No defensible denominator

// ============================================================
// DENOMINATOR TYPE (Gate 07C.5)
// ============================================================
// The structural entity that serves as the completeness unit for a
// given grade × subject cell. Different subjects may use different
// denominator types — forced uniformity is forbidden.

export type DenominatorType =
  | 'GRADE_SECTION'           // Only grade-level section exists (no finer structure found)
  | 'DOMAIN_COMPONENT'        // Subject organizes around domain components
  | 'COMPONENT'               // Gate 07C.6: subject-level components (écoute, lecture, écriture, etc.)
  | 'COMPETENCY_GROUP'        // Competency-based organization
  | 'AXE'                     // Mathematical/scientific axes
  | 'ACTIVITY'                // Activity-based (e.g., scientific activities)
  | 'STRAND'                  // Skill strand organization
  | 'COMPOSANTE'              // French composante structure
  | 'NONE_IDENTIFIED'         // Source examined, no denominator found
  | 'NOT_APPLICABLE';         // Denominator concept not applicable

// ============================================================
// COMPLETENESS STATUS (Gate 07C.5)
// ============================================================

export type CompletenessStatus =
  | 'DENOMINATOR_UNKNOWN'
  | 'DENOMINATOR_PARTIAL'
  | 'EXTRACTION_NOT_STARTED'
  | 'EXTRACTION_PARTIAL'
  | 'EXTRACTION_MATCHES_DENOMINATOR'
  | 'REVIEW_REQUIRED'
  | 'STRUCTURE_COMPLETE_VERIFIED';

// ============================================================
// CELL SCAN STATUS (Gate 07C.5)
// ============================================================
// Distinguishes document scanning from curriculum completeness.

export type CellScanStatus =
  | 'NOT_SCANNED'
  | 'SECTION_LOCATED'
  | 'SECTION_SCANNED'
  | 'STRUCTURE_MAPPED'
  | 'STRUCTURE_EXTRACTED';

// ============================================================
// CURRICULUM EXTRACTION DENOMINATOR (Gate 07C.5)
// ============================================================
// Source-derived denominator for a specific grade × subject cell.

export interface CurriculumExtractionDenominator {
  readonly id: string;
  readonly educationSystemCode: string;
  readonly stageCode: string;
  readonly gradeCode: string;
  readonly subjectCode: string;

  readonly denominatorType: DenominatorType;
  readonly expectedCount: number | undefined;

  readonly sourceId: string;
  readonly sourceVersionId: string;
  readonly sourceLocator: CurriculumSourceLocator;

  readonly evidenceMethod: string;
  readonly confidence: DenominatorConfidence;

  // Gate 07C.6: explicit evidence authority separation
  readonly evidenceClass: EvidenceClass;
  readonly primaryArtifactConfirmation: 'NOT_VERIFIED' | 'VERIFIED';

  readonly completenessLevel: CompletenessStatus;

  readonly verificationState: VerificationState;
  readonly notes: string;
}

// ============================================================
// GRADE × SUBJECT COMPLETENESS CELL (Gate 07C.5)
// ============================================================

export interface GradeSubjectCompletenessCell {
  readonly gradeCode: string;
  readonly subjectCode: string;

  readonly sourcePresence: 'PRESENT' | 'ABSENT' | 'UNCERTAIN';
  readonly sourceSectionLocated: boolean;
  readonly sourceSectionScanned: CellScanStatus;

  readonly denominatorType: DenominatorType;
  readonly denominatorConfidence: DenominatorConfidence;
  readonly expectedCount: number | undefined;
  readonly extractedCount: number;
  readonly reviewRequiredCount: number;
  readonly knownGapCount: number;

  readonly completenessRatio: number | undefined;
  readonly completenessStatus: CompletenessStatus;

  readonly denominatorId: string | undefined;
  readonly notes: string;
}

// ============================================================
// SUBJECT STRUCTURAL PROFILE (Gate 07C.5)
// ============================================================

export type HierarchyDepth = 'SURFACE' | 'PARTIAL' | 'MODERATE' | 'DEEP';

export interface SubjectStructuralProfile {
  readonly subjectCode: string;
  readonly subjectNameAr: string;
  readonly subjectNameFr: string;
  readonly domainCode: string;

  readonly sourceOrganization: string;
  readonly sourceStructuralTerminology: string;
  readonly gradeDifferentiation: string;
  readonly denominatorCandidateType: DenominatorType;
  readonly locatorRange: string;
  readonly hierarchyDepth: HierarchyDepth;
  readonly reviewStatus: string;
}

// ============================================================
// GRADE COMPLETENESS PROFILE (Gate 07C.5)
// ============================================================

export type CellCompletenessCategory =
  | 'VERIFIED' | 'SUPPORTED' | 'PARTIAL' | 'UNKNOWN' | 'NOT_APPLICABLE';

export interface GradeCompletenessProfile {
  readonly gradeCode: string;
  readonly subjects: readonly string[];
  readonly totalCells: number;
  readonly denominatorReadyCells: number;
  readonly partialCells: number;
  readonly blockedCells: number;
  readonly reviewQueueCount: number;
  readonly cellStatuses: Record<string, CellCompletenessCategory>;
  readonly notes: string;
}

// ============================================================
// EVIDENCE CLASS & AUTHORITY SEPARATION (Gate 07C.6)
// ============================================================
// Every curricular claim must identify its evidence class explicitly.
// Authority separation invariant:
//   ORIGINAL CURRICULUM ARTIFACT != PUBLIC CROSS-REFERENCE != RETRIEVAL HOST
// A public cross-reference supports investigation but CANNOT silently
// inherit OFFICIAL_CURRICULUM_DOCUMENT authority from the 2021 artifact.

export type PrimaryArtifactAccessState =
  | 'AVAILABLE'                       // Direct artifact access obtained
  | 'BLOCKED_BY_ARTIFACT_ACCESS'      // No PDF; Calaméo 404; Scribd auth wall
  | 'NOT_REQUIRED';

export type EvidenceClass =
  | 'PRIMARY_ARTIFACT'                // Directly from the authenticated 2021 curriculum artifact
  | 'OFFICIAL_CROSS_REFERENCE'        // Government/institutional source (issuer is the authority)
  | 'SECONDARY_CROSS_REFERENCE'       // Teacher portals, academic papers, summaries
  | 'RETRIEVAL_HOST';                 // The delivery mechanism only (Calaméo, Scribd, Drive)

export type PageMapLocatorAuthority =
  | 'PRIMARY_ARTIFACT_PAGE_VERIFIED'  // Direct artifact access confirmed the page
  | 'CROSS_REFERENCE_LOCATOR'         // From secondary descriptions (no direct artifact access)
  | 'SECTION_REFERENCE'               // Section-level reference, not exact page
  | 'EXTERNAL_PAGE_REFERENCE';        // Page stated by an external host/source

export type DeepExtractionStatus =
  | 'DEEP_EXTRACTION_COMPLETE'        // Direct artifact deep extraction finished
  | 'BLOCKED_BY_ARTIFACT_ACCESS'      // Evidence-access limitation, NOT a code failure
  | 'CROSS_REFERENCE_SUPPORTED'       // Structure supported by public cross-reference only
  | 'NOT_STARTED';

// Structure observed via public sources; NOT a direct-artifact-denominated count.
export interface CrossReferenceComponentEvidence {
  readonly subjectCode: string;
  readonly componentCode: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly scope: string;
  readonly publicSource: string;
  readonly publisherOrIssuer: string;
  readonly retrievalHost: string;
  readonly evidenceClass: Exclude<EvidenceClass, 'PRIMARY_ARTIFACT'>;
  readonly confidence: 'CONFIRMED' | 'STRONGLY_SUPPORTED' | 'INFERRED' | 'UNCERTAIN';
  readonly primaryArtifactConfirmation: 'NOT_VERIFIED' | 'VERIFIED';
  readonly classification: string;
}

// ============================================================
// PRIMARY ARTIFACT ACCESS RECOVERY + AUTHENTICITY (Gate 07C.6.1)
// ============================================================
// Forensic evidence handling for recovering and authenticating the
// machine-readable copy of the 2021 primary curriculum artifact.
//
// RECOVERY != VERIFICATION. A recovered artifact is identified and
// authenticated before ANY content claim may inherit its authority.
// Authenticity of the recovered copy is separate from retrieval-channel
// authority: a mirror host can deliver a genuine artifact WITHOUT being
// the issuer. Issuer identity must come from artifact-internal and
// independent corroboration, never solely from the retrieval host.

export type ArtifactAccessState =
  | 'NOT_SEARCHED'
  | 'SEARCHING'
  | 'RECOVERED_UNVERIFIED'
  | 'RECOVERED_AUTHENTICATED'
  | 'RECOVERED_PARTIAL'
  | 'BLOCKED_BY_ARTIFACT_ACCESS'
  | 'IDENTITY_CONFLICT';

export type RecoveryOutcomeStatus =
  | 'RECOVERED_FULL_ARTIFACT'
  | 'RECOVERED_PARTIAL_ARTIFACT'
  | 'METADATA_ONLY'
  | 'SNIPPET_ONLY'
  | 'HTML_WRAPPER_ONLY'
  | 'DOWNLOAD_FAILED'
  | 'ACCESS_BLOCKED_AUTHENTICATION_REQUIRED'
  | 'ACCESS_BLOCKED_ANTI_BOT'
  | 'DEAD_LINK'
  | 'REDIRECT_UNRESOLVED'
  | 'NOT_TARGET_ARTIFACT'
  | 'UNKNOWN';

export type RecoveryChannelType =
  | 'OFFICIAL_ISSUER_DIRECT'
  | 'MIRROR_HOST'
  | 'FILE_HOSTING'
  | 'DOCUMENT_SHARING_PLATFORM'
  | 'AUTH_KEYWORD_REFERENCE'
  | 'SEARCH_INDEX';

export type RecoveryChannelAuthority =
  | 'ISSUER'
  | 'AUTHORIZED_REPOSITORY'
  | 'HOST_OR_MIRROR'
  | 'SECONDARY_PLATFORM'
  | 'UNKNOWN';

export interface ArtifactRecoveryCandidate {
  readonly candidateId: string;
  readonly label: string;
  readonly channelType: RecoveryChannelType;
  readonly channelAuthority: RecoveryChannelAuthority;
  readonly url: string;
  readonly outcome: RecoveryOutcomeStatus;
  readonly sizeBytes?: number;
  readonly sha256?: string;
  readonly pageCount?: number;
  readonly evidenceDescription: string;
  readonly isPrimarySatisfying: boolean;
}

export type ArtifactAuthenticityClass =
  | 'ARTIFACT_AUTHENTICITY_VERIFIED'
  | 'ARTIFACT_AUTHENTICITY_STRONGLY_SUPPORTED'
  | 'ARTIFACT_AUTHENTICITY_PARTIALLY_SUPPORTED'
  | 'ARTIFACT_AUTHENTICITY_UNRESOLVED'
  | 'ARTIFACT_AUTHENTICITY_CONFLICT';

export interface AuthenticityEvidence {
  readonly factor: string;
  readonly finding: string;
  readonly source: string;
  readonly directArtifactObservation: boolean;
}

export interface ArtifactFingerprint {
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly pageCount: number;
  readonly pdfHeader: string;
  readonly producer: string;
  readonly creator: string;
  readonly titleMetadata: string | undefined;
  readonly coverPageIsImage: boolean;
  readonly lastPageIsImage: boolean;
  readonly bodyHasNativeTextLayer: boolean;
  readonly arabicTextEncoding: 'CID_HEX_UNMAPPED' | 'DECODABLE' | 'NOT_ASSESSED';
  readonly frenchTextDecodable: boolean;
}

export interface AuthenticityAttestation {
  readonly artifactId: string;
  readonly classification: ArtifactAuthenticityClass;
  readonly recoveredCopyCount: number;
  readonly byteIdenticalChannels: number;
  readonly primarySha256: string;
  readonly fingerprints: readonly ArtifactFingerprint[];
  readonly evidenceItems: readonly AuthenticityEvidence[];
  readonly issuerAttributionBasis: string;
  readonly nonIssuerBasis: string;
  readonly retrievalAuthorityNote: string;
  readonly verdictNote: string;
}

export type CurrentnessConclusion =
  | 'NO_NEWER_VERIFIED_SOURCE_FOUND'
  | 'NEWER_VERIFIED_SOURCE_FOUND'
  | 'NEWER_REPORTED_NOT_VERIFIED'
  | 'CURRENTNESS_UNRESOLVED';

export interface CurrentnessSearchResult {
  readonly conclusion: CurrentnessConclusion;
  readonly searchYearSpan: string;
  readonly newerFullOfficialReplacementFound: boolean;
  readonly basis: string;
  readonly notes: string;
}

export type PrimaryComponentValidationStatus =
  | 'VALIDATED_FROM_PRIMARY_ARTIFACT'
  | 'CORROBORATED_BY_PRIMARY_STRUCTURE'
  | 'PARTIALLY_ADDRESSED'
  | 'NOT_CHECKED'
  | 'BLOCKED_BY_TEXT_ENCODING';

export interface PrimaryComponentValidationResult {
  readonly subjectCode: string;
  readonly componentCode: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly validationStatus: PrimaryComponentValidationStatus;
  readonly primaryArtifactConfirmation: 'NOT_VERIFIED' | 'VERIFIED';
  readonly evidenceDescription: string;
}

export interface PageMapPrimaryReVerification {
  readonly entryIndex: number;
  readonly pageRange: string;
  readonly sectionTitle: string;
  readonly priorLocatorAuthority: PageMapLocatorAuthority;
  readonly reVerificationStatus: 'PRIMARY_ARTIFACT_CORROBORATED' | 'PRIMARY_ARTIFACT_REFINED' | 'NOT_RE_VERIFIED' | 'CONFLICT';
  readonly directObservedPrintedRange?: string;
  readonly note: string;
}

export interface GapReEvaluation {
  readonly gapId: string;
  readonly priorStatus: string;
  readonly afterStatus: string;
  readonly evidenceDescription: string;
  readonly unchanged: boolean;
}

export interface ArtifactRecoveryVerdict {
  readonly gate: string;
  readonly artifactAccessState: ArtifactAccessState;
  readonly primaryRecoveryOutcome: RecoveryOutcomeStatus;
  readonly authenticity: ArtifactAuthenticityClass;
  readonly fullArtifactRecovered: boolean;
  readonly artifactAuthenticated: boolean;
  readonly deepExtractionUnlocked: boolean;
  readonly contentVerificationUnlocked: boolean;
  readonly primaryValidatedComponents: number;
  readonly notCheckedComponents: number;
  readonly verdict: 'PASS' | 'PARTIAL' | 'FAIL';
  readonly summary: string;
}

// ============================================================
// GATE 07C.6.2 — PRIMARY ARTIFACT TEXT DECODING + EXTRACTION READINESS
// ============================================================

// Extraction method identifiers evaluated for decoding the recovered
// 556-page primary curriculum artifact. A method is only ever classified
// RELIABLE / USABLE_WITH_LIMITATIONS / UNRELIABLE when it was actually
// available and tested; unavailable methods remain UNAVAILABLE.
export type ArtifactTextExtractionMethod =
  | 'NODE_PDF_LIB_RAW'          // METHOD_A - existing Node/pdf-lib path
  | 'POPPLER_PDFTOTEXT'         // METHOD_B - not installed on this host
  | 'MUPDF_MUTOOL'              // METHOD_C - not installed on this host
  | 'PDFBOX'                    // METHOD_D - JVM tool, not installed
  | 'PDFJS_DIST'                // METHOD_E - alternative Node PDF parser (installed)
  | 'DIRECT_CMAP_FONT_MAPPING'  // METHOD_F - hand-rolled CID/ToUnicode/font mapping
  | 'RENDER_OCR';               // METHOD_G - render + OCR (last resort)

export type ArtifactMethodAvailability =
  | 'AVAILABLE'
  | 'UNAVAILABLE';

export type ArtifactMethodClassification =
  | 'RELIABLE'
  | 'USABLE_WITH_LIMITATIONS'
  | 'UNRELIABLE'
  | 'UNAVAILABLE';

export type ArtifactScriptReadability =
  | 'UNICODE_CORRECT_ORDER_CORRECT'
  | 'UNICODE_CORRECT_ORDER_BROKEN'
  | 'PARTIAL'
  | 'UNREADABLE';

export type ArtifactTextExtractionStatus =
  | 'CLEAN'
  | 'PARTIAL'
  | 'PUA_BLOCKED'
  | 'FRENCH_ONLY'
  | 'EMPTY';

export type ArtifactToUnicodeClassification =
  | 'TOUNICODE_PRESENT_VALID'
  | 'TOUNICODE_PRESENT_PARTIAL'
  | 'TOUNICODE_PRESENT_BROKEN'
  | 'TOUNICODE_ABSENT'
  | 'UNKNOWN';

export type ArtifactFontMappingStatus =
  | 'MAPPED_CLEAN'
  | 'MAPPED_PARTIAL'
  | 'PUA_GLYPH_CODE'
  | 'UNMAPPED'
  | 'UNKNOWN';

export type ArtifactTableExtractionReadiness =
  | 'READY'
  | 'PARTIAL'
  | 'NOT_READY';

export type ArtifactTextReadiness =
  | 'READY'
  | 'PARTIAL'
  | 'NOT_READY';

export interface ArtifactTextQualityMetrics {
  readonly arabicCount: number;
  readonly puaGlyphCount: number;
  readonly replacementCharCount: number;
  readonly latinCount: number;
  readonly tifinaghCount: number;
  readonly cidHexResidueCount: number;
  readonly unresolvedCidResidue: boolean;
  readonly hasPrivateUseGlyphCode: boolean;
}

export interface ArtifactMethodEvaluation {
  readonly method: ArtifactTextExtractionMethod;
  readonly available: ArtifactMethodAvailability;
  readonly commandOrLibrary: string;
  readonly arabicDecodeQuality: string;
  readonly frenchDecodeQuality: string;
  readonly tablePreservation: string;
  readonly pageBoundaryPreservation: string;
  readonly readingOrderQuality: string;
  readonly diacriticsHandling: string;
  readonly digitsHandling: string;
  readonly punctuationHandling: string;
  readonly performance: string;
  readonly failureMode: string;
  readonly classification: ArtifactMethodClassification;
}

export interface ArtifactPageExtractionResult {
  readonly artifactId: string;
  readonly artifactHash: string;
  readonly pdflibPageIndex: number;
  readonly printedPage?: string;
  readonly category: string;
  readonly method: ArtifactTextExtractionMethod;
  readonly textStatus: ArtifactTextExtractionStatus;
  readonly scriptReadability: ArtifactScriptReadability;
  readonly tableStatus: ArtifactTableExtractionReadiness;
  readonly fontMappingStatus: ArtifactFontMappingStatus;
  readonly qualityMetrics: ArtifactTextQualityMetrics;
  readonly shortVerifiedLabels: readonly string[];
  readonly issues: readonly string[];
}

export interface ArtifactFontAuidenceEntry {
  readonly pageContext: string;
  readonly fontKey: string;
  readonly subtype: string;
  readonly toUnicodePresent: boolean;
  readonly toUnicodeClassification: ArtifactToUnicodeClassification;
  readonly encoding: string;
  readonly cidSystemInfo?: string;
  readonly embeddedFont: boolean;
  readonly note: string;
}

export interface ArtifactPageIndexPolicy {
  readonly pdflibPageCount: number;
  readonly pdfjsPageCount: number;
  readonly pdflibIsCanonical: boolean;
  readonly printedOffsetRegion1: string;
  readonly printedOffsetRegion2: string;
  readonly blankUnprintedPageIndex: number;
  readonly offsetNote: string;
}

export interface ArtifactPageDistribution {
  readonly clean: number;
  readonly partial: number;
  readonly puaBlocked: number;
  readonly frenchOnly: number;
  readonly empty: number;
  readonly totalPages: number;
}

export interface ArtifactExtractionReadiness {
  readonly textReadiness: ArtifactTextReadiness;
  readonly tableReadiness: ArtifactTableExtractionReadiness;
  readonly textDecodingBlocker: 'RESOLVED' | 'PARTIALLY_RESOLVED' | 'BLOCKED' | 'FALLBACK_OCR_REQUIRED';
  readonly tableExtractionBlocker: 'RESOLVED' | 'PARTIAL' | 'BLOCKED';
  readonly selectedMethod: ArtifactTextExtractionMethod;
  readonly fallbackMethod: ArtifactTextExtractionMethod;
  readonly ocrRequired: boolean;
  readonly ocrMethodUsed: boolean;
  readonly hashBound: boolean;
  readonly acknowledgement: string;
}

// ============================================================
// GATE 07C.6.2A — SELECTIVE ARABIC TEXT RECOVERY PIPELINE
// (PARTIAL + PUA-BLOCKED PRIMARY CURRICULUM PAGES)
// ============================================================

// Classification of a U+FFFD / PUA glyph-loss root cause. Determined from
// artifact structure, never from guessing at expected words.
export type ArtifactLossRootCause =
  | 'EXPLICIT_TOUNICODE_FFFD'   // ToUnicode CMap explicitly maps CID -> U+FFFD
  | 'EXPLICIT_TOUNICODE_PUA'    // ToUnicode CMap explicitly maps CID -> PUA codepoint
  | 'MISSING_BFCHAR_ENTRY'      // ToUnicode present but no entry for a used CID
  | 'MALFORMED_CMAP'
  | 'UNSUPPORTED_GLYPH'
  | 'FONT_FALLBACK'
  | 'ENGINE_BEHAVIOR'
  | 'CHARACTER_COMPOSITION';

export type ArtifactGlyphRecoveryClass =
  | 'RECOVERABLE'
  | 'UNRECOVERABLE_DOC_DECLARED_LOSS'
  | 'UNRECOVERABLE_NO_FONT_EVIDENCE'
  | 'RECOVERABLE_VIA_ALTERNATE'
  | 'NOT_ASSESSED';

export type ArtifactFontProgramKind =
  | 'TRUETYPE_WITH_CMAP'
  | 'TRUETYPE_NO_CMAP'
  | 'CFF_TYPEC'
  | 'NON_EMBEDDED'
  | 'UNKNOWN';

export type ArtifactTableGeometryClass =
  | 'TABLE_STRUCTURED_DIGITAL'
  | 'TABLE_TEXT_ONLY'
  | 'TABLE_PARTIAL'
  | 'TABLE_UNREADABLE';

export type ArtifactRecoveryPageClass =
  | 'DIGITAL_CLEAN'
  | 'DIGITAL_RECOVERED'
  | 'DIGITAL_PARTIAL'
  | 'PUA_UNRESOLVED'
  | 'OCR_RECOVERED'
  | 'MIXED_RECOVERY'
  | 'FRENCH_ONLY'
  | 'EMPTY'
  | 'UNREADABLE'
  | 'RESIDUAL_BLOCKED';

export interface ArtifactFontRecoveryEntry {
  readonly fontResource: string;
  readonly baseFont: string;
  readonly subtype: string;
  readonly toUnicodePresent: boolean;
  readonly roseCause: ArtifactLossRootCause;
  readonly affectedCidsOrCodepoints: readonly string[];
  readonly programKind: ArtifactFontProgramKind;
  readonly programBytes: number;
  readonly hasCmapTable: boolean;
  readonly hasPostTable: boolean;
  readonly fontLevelUnicodeEvidence: boolean;
  readonly recoveryClass: ArtifactGlyphRecoveryClass;
  readonly note: string;
}

export interface ArtifactAlternateCopy {
  readonly alias: string;
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly pageCount: number;
  readonly isByteIdenticalToPrimary: boolean;
  readonly contentEquivalentVerified: boolean;
  readonly mappingImprovement: boolean;
  readonly transferPerformed: boolean;
  readonly note: string;
}

export interface ResidualBlockerRecord {
  readonly pageLabel: string;
  readonly pageCategory: string;
  readonly fontOrCmap: string;
  readonly failureClass: ArtifactLossRootCause;
  readonly recovery: ArtifactGlyphRecoveryClass;
  readonly contentEquivalence: boolean;
  readonly curriculumRelevant: boolean;
  readonly nextAction: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly status: 'BLOCKED' | 'RESOLVED' | 'DEGRADED_READABLE';
}

export interface ArtifactRecoveryReadinessMetrics {
  readonly digitalClean: number;
  readonly digitalRecovered: number;
  readonly digitalPartial: number;
  readonly puaUnresolved: number;
  readonly ocrRecovered: number;
  readonly mixedRecovered: number;
  readonly frenchOnly: number;
  readonly empty: number;
  readonly unreadable: number;
  readonly residualBlocked: number;
  readonly curriculumRelevantReadyPages: number;
  readonly curriculumRelevantBlockedPages: number;
  readonly hashBound: boolean;
}

export interface ArtifactRecoveryModel {
  readonly gate: string;
  readonly artifactHash: string;
  readonly targetClasses: readonly ArtifactTextExtractionStatus[];
  readonly selectedMethod: ArtifactTextExtractionMethod;
  readonly ocrEngineAvailable: boolean;
  readonly ocrUsed: boolean;
  readonly imageRenderingAvailable: boolean;
  readonly alternateTransferUsed: boolean;
  readonly digitalEvidenceExhausted: boolean;
  readonly policy: string;
  readonly verdict: 'PASS_DIGITAL' | 'PASS_HYBRID_OCR' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.6.2B — TARGETED OCR / PAGE RECOVERY
// ============================================================

/** Per-page residual classification bucket (Gate 07C.6.2B Section 3). */
export type ArtifactResidualPageCategory =
  | 'CURRICULUM_RELEVANT_BLOCKED'
  | 'NON_CURRICULUM_BLOCKED'
  | 'GLOSSARY_REFERENCE_BLOCKED'
  | 'DECORATIVE_ADMIN_BLOCKED'
  | 'EMPTY';

/** OCR quality state (Gate 07C.6.2B Section 11). */
export type ArtifactOcrQuality =
  | 'OCR_HIGH_CONFIDENCE'
  | 'OCR_USABLE_WITH_REVIEW'
  | 'OCR_PARTIAL'
  | 'OCR_UNRELIABLE'
  | 'OCR_FAILED';

/** OCR vs digital classification (Gate 07C.6.2B Section 7). */
export type ArtifactOcrClassification =
  | 'OCR_EXTRACTED'          // only OCR produced text (no digital text)
  | 'DIGITAL_WITH_OCR_RECOVERY' // digital kept; OCR complements the lost spans
  | 'DIRECT_DIGITAL';        // never used for an OCR-routed page

/** Table OCR status (Gate 07C.6.2B Section 12). */
export type ArtifactTableOcrStatus =
  | 'TABLE_OCR_STRUCTURED'
  | 'TABLE_OCR_PARTIAL'
  | 'TABLE_OCR_TEXT_ONLY'
  | 'TABLE_OCR_UNRELIABLE';

/** Per-subject extraction readiness (Gate 07C.6.2B Section 17). */
export type ArtifactSubjectReadinessState =
  | 'READY_DIGITAL'
  | 'READY_HYBRID'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'NOT_YET_INDEXED';

export interface ArtifactResidualPageRecord {
  readonly pdfIndex: number;
  readonly printedPage?: number;
  readonly section: string;
  readonly subject?: string;
  readonly grade?: string;
  readonly failureClass: ArtifactLossRootCause | 'NONE';
  readonly fontCmapCluster: string;
  readonly curriculumRelevance: 'CURRICULUM' | 'REFERENCE' | 'NON_CURRICULUM' | 'EMPTY';
  readonly whyOcrRequired: string;
  readonly ocrQuality: ArtifactOcrQuality;
  readonly ocrClassification: ArtifactOcrClassification;
  readonly ocrRecovered: boolean;
  readonly blocking: boolean;
  readonly ocrTextAvailable: boolean;
}

export interface ArtifactOcrProvenance {
  readonly artifactHash: string;
  readonly pdfIndex: number;
  readonly printedPage?: number;
  readonly renderResolutionWidth: number;
  readonly renderMethod: string;
  readonly ocrEngine: string;
  readonly ocrEngineVersion: string;
  readonly language: string;
  readonly classification: ArtifactOcrClassification;
  readonly reviewed: boolean;
}

export interface ArtifactSubjectReadiness {
  readonly subject: string;
  readonly state: ArtifactSubjectReadinessState;
  readonly extractionPath: string;
  readonly note: string;
}

export interface ArtifactOcrRecoveryEvidence {
  readonly gate: '07C.6.2B';
  readonly artifactHash: string;
  readonly rendererAvailable: boolean;
  readonly renderer: string;
  readonly ocrEnginesAvailable: readonly string[];
  readonly ocrUsed: boolean;
  readonly ocrPageCount: number;
  readonly processedPages: readonly number[];
  readonly representativeSamples: readonly ArtifactOcrProvenance[];
  readonly qualityCounts: Readonly<Record<ArtifactOcrQuality, number>>;
  readonly noLlmRepair: boolean;
  readonly glossaryBlocking: 'REQUIRED_FOR_CURRICULUM_EXTRACTION' | 'NON_BLOCKING_REFERENCE_SECTION';
  readonly preambleBlocking: 'REQUIRED_FOR_CURRICULUM_EXTRACTION' | 'NON_BLOCKING_FOR_DEEP_EXTRACTION';
  readonly tableOcrStatus: ArtifactTableOcrStatus;
  readonly policy: string;
  readonly verdict: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.6.2C — FINAL CURRICULUM-RELEVANT READINESS COVERAGE AUDIT
// ============================================================

/** Top-level relevance class assigned to every physical page (exactly one per page; gate sum = 556). */
export type ArtifactRelevanceClass =
  | 'CURRICULUM_REQUIRED'
  | 'CURRICULUM_SUPPORTING'
  | 'REFERENCE_NON_BLOCKING'
  | 'ADMINISTRATIVE_NON_BLOCKING'
  | 'EMPTY'
  | 'UNKNOWN_RELEVANCE';

export interface ArtifactPageUniverse {
  readonly gate: '07C.6.2C';
  readonly physicalPages: number;
  readonly pdfjsPages: number;
  readonly pdfLibPages: number;
  readonly windowsPages: number;
  readonly unaccounted: number;
  readonly tiers: Readonly<Record<ArtifactRelevanceClass, number>>;
  readonly ninePage6dot3SetName: string;
  readonly ninePage6dot3Set: readonly number[];
  readonly idx0Status: string;
  readonly idx555Status: string;
  readonly idx215Status: string;
}

export type ArtifactOcrCoverageStatus =
  | 'PAGE_OCR_RECOVERED'
  | 'PAGE_OCR_PIPELINE_VALIDATED_ON_SAMPLE'
  | 'PAGE_NOT_PROCESSED';

export interface ArtifactPageOcrCoverageRecord {
  readonly physicalPage: number;
  readonly pdfIndex: number;
  readonly printedPage?: number;
  readonly section: string;
  readonly subject?: string;
  readonly classification: ArtifactOcrClassification;
  readonly ocrRecovered: boolean;
  readonly ocrQuality: ArtifactOcrQuality;
  readonly coverageStatus: ArtifactOcrCoverageStatus;
}

export interface ArtifactRequiredPageMetrics {
  readonly pagesRequired: number;
  readonly pagesReady: number;
  readonly pagesBlocked: number;
  readonly pagesUnknown: number;
  readonly requiredPages: readonly number[];
  readonly blockedPages: readonly number[];
  readonly unknownPages: readonly number[];
}

export interface ArtifactSubjectReadinessAudit {
  readonly subject: string;
  readonly state: ArtifactSubjectReadinessState;
  readonly location: string;
  readonly digitalClean: boolean;
  readonly note: string;
}

export interface ArtifactRequiredTableRecord {
  readonly tableId: string;
  readonly description: string;
  readonly physicalPages: readonly number[];
  readonly inspection: 'TABLE_READY_WITH_REVIEW' | 'TABLE_EXTRACTION_PARTIAL' | 'TABLE_NOT_SAFELY_INSPECTABLE';
  readonly geometryAvailable: boolean;
  readonly note: string;
}

export interface ArtifactCoverageVerdict {
  readonly gate: '07C.6.2C';
  readonly musicResolved: boolean;
  readonly pagesRequiredBlocked: number;
  readonly pagesRequiredUnknown: number;
  readonly requiredTablesSafe: boolean;
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.6.3 — DIRECT PRIMARY ARTIFACT EVIDENCE VERIFICATION
// ============================================================
// Verifies direct primary source evidence for component candidates,
// denominator cells, subject/component/program structure, and
// source-page provenance — all against the authenticated 2021 primary
// curriculum artifact (hash-bound), using the OCR-recovered required pages.
//
// EVIDENCE DISCIPLINE (§4/§10/§18):
//   - No guessing / no reconstruction from expected curriculum knowledge.
//   - A cell resolves to VERIFIED only with DIRECT primary source evidence
//     and a clearly-visible enumerable structure (oracle labels).
//   - Ambiguous row/column/cell association -> HUMAN_REVIEW_REQUIRED,
//     never VERIFIED.
//   - Catalog is NOT redesigned this gate: the pre-existing 9-subject grid
//     is retained and source-model mismatches are recorded explicitly.

/** Cross-reference comparison outcome for each provisional candidate (§16). */
export type CrossReferenceComparisonStatus =
  | 'MATCH'                                  // candidate aligns 1:1 with a direct source structure
  | 'SEMANTIC_MATCH'                         // same referent, source uses equivalent terminology
  | 'PARTIAL_MATCH'                          // candidate partially reflected by the source structure
  | 'NO_MATCH'                               // no direct source evidence for the candidate
  | 'PRIMARY_SOURCE_USES_DIFFERENT_STRUCTURE'; // catalog/structure mismatch recorded, not silently corrected

/** Direct evidence verification verdict for a candidate or cell. */
export type DirectEvidenceVerdict =
  | 'DIRECTLY_VERIFIED'                      // direct, clearly-visible source evidence
  | 'DIRECTLY_VERIFIED_EQUIVALENT'           // verified via a source-equivalent label
  | 'PARTIALLY_CONFIRMED'                    // source reflects part of the candidate only
  | 'NOT_APPLICABLE'                         // no such structure/subject in the source for this scope
  | 'HUMAN_REVIEW_REQUIRED'                  // ambiguous association / OCR not clean enough
  | 'NOT_VERIFIED';                          // no direct primary evidence reached

/** Denoted structural category type observed directly in the artifact. */
export type DirectStructuralCategoryType =
  | 'UNIFIED_SKILL'
  | 'COMPONENT'
  | 'APPROACH'
  | 'SUB_AREA'
  | 'SUBJECT_GROUP'
  | 'NONE_IDENTIFIED';

/** Per-grade denominator cell state after direct primary verification. */
export type DirectDenominatorCellState =
  | 'VERIFIED'                               // direct source-denominated count, clearly enumerable
  | 'PARTIAL'                                // structure partially identified; complete set not proven
  | 'UNKNOWN'                                // no defensible direct denominator
  | 'NOT_APPLICABLE';                        // subject/component not present in this grade scope

/** Direct primary provenance for a verified structural claim. */
export interface PrimaryDirectProvenance {
  readonly physicalPage: number;
  readonly scannedIndex?: number;            // pdfjs/scan basis (physical n = scan n-1)
  readonly printedPage?: string;
  readonly tableId?: string;                 // T01..T07
  readonly blockLabel: string;               // short, non-content locator label
  readonly sourceWordingAr?: string;         // short verified label only (never full-page text)
  readonly rowColumnNote: string;            // how header/row/column/cell association was confirmed
  readonly ocrQuality: 'OCR_USABLE_WITH_REVIEW' | 'OCR_HIGH_CONFIDENCE';
}

/** A verified structural category directly observed in the artifact. */
export interface PrimaryDirectComponent {
  readonly componentCode: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly categoryType: DirectStructuralCategoryType;
  readonly grades: readonly string[];
  readonly evidenceStatus: DirectEvidenceVerdict;
  readonly provenance: readonly PrimaryDirectProvenance[];
}

/** 15-candidate cross-reference reconciliation record. */
export interface DirectCandidateVerification {
  readonly candidateCode: string;            // from SUBJECT_COMPONENTS
  readonly subjectCode: string;
  readonly candidateNameAr: string;
  readonly comparisonStatus: CrossReferenceComparisonStatus;
  readonly verdict: DirectEvidenceVerdict;
  readonly sourceEquivalentCode?: string;    // artifact-level equivalent code when different
  readonly sourceEquivalentNameAr?: string;
  readonly evidencePage: number | undefined;
  readonly evidenceNote: string;
}

/** A single grade × subject denominator cell (54 total). */
export interface DirectDenominatorCell {
  readonly gradeCode: string;
  readonly subjectCode: string;
  readonly state: DirectDenominatorCellState;
  readonly denominatorType: DenominatorType;
  readonly sourceCount: number | undefined;
  readonly sourceCountDescription: string;   // e.g. "4 unified skills (استماع، تحدث، قراءة، كتابة)"
  readonly provable: boolean;
  readonly provenancePages: readonly number[];
  readonly mismatchRecorded: boolean;
  readonly note: string;
}

/** Required-table inspection outcome (T01..T07). */
export interface RequiredTableInspection {
  readonly tableId: string;
  readonly description: string;
  readonly physicalPages: readonly number[];
  readonly evidenceRead: boolean;
  readonly associationClear: 'CLEAR' | 'AMBIGUOUS' | 'NOT_REQUIRED';
  readonly usableForDenominators: boolean;
  readonly note: string;
}

/** Gap-state bookkeeping re-evaluated with direct evidence (§25). */
export interface DirectGapEvaluation {
  readonly gapId: string;
  readonly afterState: 'RESOLVED' | 'PARTIALLY_RESOLVED' | 'UNCHANGED' | 'NOT_APPLICABLE';
  readonly directEvidenceDescription: string;
  readonly unchangedFromPrior: boolean;
}

/** Overall Gate 07C.6.3 verdict. */
export interface DirectEvidenceGateVerdict {
  readonly gate: '07C.6.3';
  readonly verifiedCells: number;
  readonly partialCells: number;
  readonly unknownCells: number;
  readonly notApplicableCells: number;
  readonly totalCells: number;               // 54
  readonly verifiedCandidates: number;
  readonly totalCandidates: number;          // 15
  readonly contentVerified: number;          // 0
  readonly published: number;                // 0
  readonly structureCompleteVerified: number; // 0
  readonly masteryDerived: boolean;          // false
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.6.4 — CANONICAL PRIMARY CURRICULUM STRUCTURE RECONCILIATION
// ============================================================
// Reconciles the APPLICATION curriculum catalog with the SOURCE-NATIVE
// structure directly proven by the authenticated 2021 primary artifact
// (see 07C.6.3 evidence). The primary artifact structure is authoritative:
// application-catalog convenience must NOT overwrite source truth.
//
// This gate creates DOMAIN TRUTH / MODELING ONLY (§21). It does not change
// UI/routing/learner-state/exercises, does not write to a database, and does
// NOT redesign or delete the existing application catalog (§4). Subject codes
// such as MUSIC / CIVIC_EDUCATION / ART remain valid application identifiers;
// a reconciliation/mapping layer exposes how each maps to the source-native
// structure — even when the mapping is not 1:1 (§6/§8/§9/§20).

// --- Subject namespaces (explicitly separated, §6) ---------------------
// SOURCE_SUBJECT (source-native, artifact authority) vs
// APPLICATION_SUBJECT (retained app catalog code).

export type SourceNativeSubjectCode =
  | 'SRC_LANGUAGES'        // Languages domain (العربية/الأمازيغية/الفرنسية) — 4-skill model
  | 'SRC_ARABIC'
  | 'SRC_FRENCH'
  | 'SRC_MATH'             // الرياضيات
  | 'SRC_SCIENCE'          // النشاط العلمي
  | 'SRC_ISLAMIC'          // التربية الإسلامية
  | 'SRC_ART'              // التربية الفنية
  | 'SRC_SPORT'            // التربية البدنية
  | 'SRC_SOCIAL_STUDIES';  // الاجتماعيات (ت.ج تاريخ وجغرافيا + ت.م تربية مدنية)

export type ApplicationSubjectCode =
  | 'ARABIC'
  | 'FRENCH'
  | 'MATH'
  | 'SCIENCE'
  | 'ISLAMIC_EDUCATION'
  | 'CIVIC_EDUCATION'
  | 'SPORT'
  | 'ART'
  | 'MUSIC';

// --- Source-native structural forms (§5/§12) ---------------------------
// Different subjects use different structural forms. There is NO universal
// UNIT abstraction forced on every subject.

export type SourceNativeStructuralForm =
  | 'SKILL'                  // Languages 4-skill model (الاستماع، التحدث، القراءة، الكتابة)
  | 'COMPONENT'              // Math (3), Science (4) components
  | 'APPROACH'               // Islamic Education مداخل (entry/مدخل forms)
  | 'SUB_AREA'               // Art (5) and Sport (2) sub-areas
  | 'GROUPED_SUBJECT_AREA'   // Social Studies grouping (تاريخ وجغرافيا / تربية مدنية)
  | 'NONE_IDENTIFIED';

// --- Mapping relationship between source and application subject (§7) ---
// A source subject may map to application subjects 1:1, 1:many, many:1,
// component-of, replacement-of, semantic-equivalent, or no-direct-match.
// Mappings are NOT assumed to be 1:1.

export type SourceApplicationMappingRelationship =
  | 'DIRECT_MATCH'           // application code aligns 1:1 with a source subject
  | 'SEMANTIC_EQUIVALENT'    // same referent, differing terminology (e.g. الكتابة == written production)
  | 'COMPONENT_OF'           // application subject maps to a component of a source subject (MUSIC ⊂ التربية الفنية)
  | 'GROUPED_UNDER'          // source groups elements (ت.ج history+geography) — app exposes them separately
  | 'REPLACED_BY'            // app term reflects a source-model transition (التربية على المواطنة → التربية المدنية)
  | 'APPLICATION_SPLIT'      // one source element exposed through multiple app views
  | 'SOURCE_SPLIT'           // app combines what source splits (e.g. ARABIC_LISTENING_SPEAKING vs الاستماع+التحدث)
  | 'NO_DIRECT_MATCH'        // no direct application counterpart in the reviewed evidence
  | 'NOT_APPLICABLE';        // subject/scope not present in the source for this scope

// --- Mapping / reconciliation status (§18) -----------------------------
export type ReconciliationMappingStatus =
  | 'VERIFIED_DIRECT'
  | 'VERIFIED_SEMANTIC'
  | 'PARTIAL'
  | 'MISMATCH'
  | 'NOT_APPLICABLE'
  | 'UNRESOLVED';

// --- Source-native structural element (§16 canonical identity) ---------
// A stable identity derived from SEMANTIC SOURCE SCOPE, not display wording
// alone. Page number is provenance, NOT the primary identity.

export interface SourceNativeStructureElement {
  readonly structuralElementId: string;      // stable semantic identity
  readonly educationSystemCode: string;      // e.g. 'MOROCCO'
  readonly stageCode: string;                // e.g. 'PRIMARY'
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly sourceSubjectNameAr: string;      // artifact wording (authoritative)
  readonly sourceSubjectNameFr: string;
  readonly structuralForm: SourceNativeStructuralForm;
  readonly sourceElementKey: string;         // canonical semantic key within the source subject
  readonly nameAr: string;                   // source wording (authoritative)
  readonly nameFr: string;                   // source wording / internal alias may differ (English internal names remain aliases, §15)
  readonly internalName?: string;            // optional English/internal alias — NOT authority
  readonly gradeScope: readonly string[];    // P1..P6 as applicable
  readonly sourceVersionId: string;
  readonly comments?: string;
}

// --- A reconciliation mapping row (application subject ↔ source) --------
export interface SourceApplicationMapping {
  readonly applicationSubject: ApplicationSubjectCode;
  readonly applicationSubjectNameAr: string;
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly sourceSubjectNameAr: string;      // artifact wording (authoritative)
  readonly mappingRelationship: SourceApplicationMappingRelationship;
  readonly mappingStatus: ReconciliationMappingStatus;
  readonly sourceStructuralForm: SourceNativeStructuralForm;
  readonly sourceComponents: readonly string[]; // source-native component keys for this mapping
  readonly gradeScope: readonly string[];    // grades this mapping applies to
  readonly denominatorState: DirectDenominatorCellState; // VERIFIED/PARTIAL/UNKNOWN/NOT_APPLICABLE (frozen, §23)
  readonly mismatch: string;                 // explicit mismatch description (empty if none)
  readonly provenance: readonly PrimaryDirectProvenance[];
  readonly futureAction: string;
}

// --- A source-native structure registry entry (§27) ---------------------
export interface SourceNativeStructureRecord {
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly structureNameAr: string;
  readonly structuralForm: SourceNativeStructuralForm;
  readonly componentKeys: readonly string[]; // keys of the elements covered by this structure
  readonly gradeScope: readonly string[];
  readonly comment: string;
}

// --- Future extraction contract (§28/§29) ------------------------------
// Specifies how the NEXT extraction stage must consume this layer.
// Content MUST attach to the source-native structural identity FIRST;
// application-catalog mapping is SECONDARY.
export interface FutureExtractionContractRules {
  readonly attachContentToSourceNativeIdentityFirst: boolean;
  readonly applicationMappingIsSecondary: boolean;
  readonly neverFlattenSourceHierarchyDuringExtraction: boolean;
  readonly noSourceElementDuplicationAcrossApplicationViews: boolean;
  readonly ruleDescription: string;
}

// --- Structural mismatch issue (§25) ------------------------------------
// This gate may record a new explicit modeling issue without reopening the
// already-justified gap states GAP-001..004.
export type StructuralMismatchIssueType =
  | 'SOURCE_APPLICATION_STRUCTURE_MISMATCH'
  | 'FUTURE_PERSISTENCE_REQUIREMENT';

export interface StructuralMismatchIssue {
  readonly issueType: StructuralMismatchIssueType;
  readonly subject: string;
  readonly description: string;
  readonly resolutionConstraint: string;
}

// --- Overall Gate 07C.6.4 verdict --------------------------------------
export interface CanonicalReconciliationVerdict {
  readonly gate: '07C.6.4';
  readonly sourceSubjects: number;
  readonly applicationSubjects: number;
  readonly directlyReconciled: number;        // VERIFIED_DIRECT / VERIFIED_SEMANTIC mappings
  readonly partialOrMismatch: number;         // PARTIAL / MISMATCH mappings
  readonly noDirectMatch: number;             // NO_DIRECT_MATCH / NOT_APPLICABLE mappings
  readonly verifiedCells: number;             // 42 (frozen, §23)
  readonly supportedCells: number;            // 0
  readonly partialCells: number;              // 3
  readonly unknownCells: number;              // 6
  readonly notApplicableCells: number;        // 3
  readonly totalCells: number;                // 54
  readonly contentVerified: number;           // 0
  readonly published: number;                 // 0
  readonly structureCompleteVerified: number; // 0
  readonly masteryDerived: boolean;           // false
  readonly noRuntimeBehaviorChange: boolean;  // true (§21)
  readonly noDatabaseChange: boolean;         // true (§22)
  readonly sourceNativeFirst: boolean;        // true (§28)
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.7 — CONTROLLED PRIMARY CURRICULUM
// CONTENT EXTRACTION FOUNDATION
// ============================================================
// Establishes the trusted foundation for moving PRIMARY ARTIFACT content
// through: PRIMARY ARTIFACT -> SOURCE-NATIVE STRUCTURE -> SOURCE CONTENT
// CLAIM -> PROVENANCE -> REVIEW STATE -> APPLICATION MAPPING.
//
// The controlled pilot extracts a SMALL, honest vertical slice (one grade,
// one source-native subject, one structural component). It does NOT
// fabricate lessons/KOs/exercises/units and does NOT publish unverified
// content (CONTENT_VERIFIED stays 0, §3 content freeze).
//
// CONTENTS ARE ATTACHED TO THE SOURCE-NATIVE STRUCTURAL IDENTITY FIRST
// (§4/§18/§28); application-catalog mapping is downstream metadata (§19).
// No duplicate source truth is created from tables/prose/multi-app-mapping
// (§24). No synthetic knowledge objects are generated (§8).

export type ContentClaimCategory =
  | 'OBJECTIVE'                 // what the learner is to acquire/do
  | 'LEARNING_OUTCOME'          // expected demonstrable outcome
  | 'COMPETENCY_STATEMENT'      // statement framed as a competency
  | 'CONTENT_THEME'             // thematic subject-matter organization
  | 'CONTENT_ELEMENT'           // a specific content item/notion
  | 'METHODOLOGICAL_GUIDANCE'   // how the teaching/learning is conducted
  | 'ACTIVITY_TYPE'             // a named/described classroom activity kind
  | 'ASSESSMENT_GUIDANCE'       // how understanding is verified/assessed
  | 'TEMPORAL_ALLOCATION'       // time/schedule allocation guidance
  | 'STRUCTURAL_DESCRIPTION';   // structural organization description

// Content-claim provenance. `extractionClass` is the artifact-level routing
// classification (DIRECT_DIGITAL / DIGITAL_WITH_OCR_RECOVERY / OCR_EXTRACTED,
// §14). DIRECT_DIGITAL must never be used for an OCR-routed page.
export interface SourceContentClaimProvenance {
  readonly physicalPage: number;             // physical page (index+1)
  readonly scannedIndex: number;             // pdfjs/scan basis (physical - 1)
  readonly printedPage: string;              // printed footer page
  readonly tableId?: string;                 // T-code when the cell is in a table
  readonly blockLabel: string;               // short, non-content locator label
  readonly cellLabel: string;                // row/column cell label (e.g. "الأعداد الصحيحة الطبيعية — P1")
  readonly rowColumnNote: string;            // how the cell association was confirmed
  readonly extractionClass: ArtifactOcrClassification; // DIRECT_DIGITAL for the pilot pages
}

// Closed Gate-07C.7 source-topic discriminator — a FINER pilot provenance
// locator within the el-math-numbers structural component. It is NOT the
// structural identity (that remains structuralElementId) and NOT an
// application taxonomy. Each topic resolves to ONE authorized page triple in
// the matrix.
export type GateSourceTopic =
  | 'NUMBERS'                   // الأعداد            — 331 / 332 / 334
  | 'ADDITION_SUBTRACTION'      // الجمع والطرح        — 332 / 333 / 335
  | 'MULTIPLICATION'            // الضرب              — 333 / 334 / 336
  | 'DIVISION';                 // القسمة             — 334 / 335 / 337


// A single source-native content claim extracted from the authenticated
// primary artifact. Reuses existing VERIFICATION / PROVENANCE / PUBLICATION
// primitives; only the content-category identity is new (§6/§7).
export interface SourceContentClaim {
  readonly claimId: string;                  // stable content-claim identity (E-group)
  readonly category: ContentClaimCategory;
  readonly sourceTopic: GateSourceTopic;        // NUMBERS / ADDITION_SUBTRACTION / MULTIPLICATION / DIVISION
  readonly educationSystemCode: string;      // MOROCCO
  readonly stageCode: string;                // PRIMARY
  readonly gradeCode: string;                // P1 (pilot is ONE grade)
  readonly structuralElementId: string;      // -> el-math-numbers (source-native, §18/§28)
  readonly sourceSubject: SourceNativeSubjectCode; // SRC_MATH
  readonly applicationSubjectCode: ApplicationSubjectCode; // downstream/secondary (§19)
  readonly sourceVersionId: string;          // v1.0.0
  readonly sourceClassification: SourceClassification; // OFFICIAL_CURRICULUM_DOCUMENT

  readonly sourceWordingAr: string;          // minimal short wording only (§26)
  readonly normalizedValueAr: string;        // normalized claim value
  readonly normalizationClassification: NormalizationClassification;

  readonly extractionMethod: ExtractionMethod; // DIRECT_STRUCTURED_EXTRACTION
  readonly provenance: SourceContentClaimProvenance;

  // GRADE-CELL ATTRIBUTION: whether the artifact geometry confirms that this
  // cell belongs to the gradeCode candidate (P1). This is SEPARATE from page
  // provenance (correct page != confirmed cell grade). gradeCode always states
  // the PILOT CANDIDATE SCOPE; attributionStatus records whether the source
  // evidence has actually confirmed that grade assignment as curriculum truth.
  readonly attributionStatus: ContentClaimAttributionStatus;

  readonly verificationState: VerificationState; // UNVERIFIED / REVIEW_REQUIRED / REJECTED
  readonly contentStatus: ExtractionContentStatus; // EXTRACTED_UNVERIFIED / REVIEW_REQUIRED
  readonly confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'UNVERIFIED';
  readonly notes?: string;
}

// Closed grade-cell attribution classification (Gate 07C.7 pilot).
//   CLEAR_P1_ATTRIBUTION -> the source cell is geometrically attributable to the
//                           P1 (السنة الأولى) column; candidate grade assignment
//                           is SUPPORTED (still not CONTENT_VERIFIED).
//   REVIEW_REQUIRED       -> the candidate P1 grade assignment is NOT established
//                           as curriculum truth by the source evidence; kept only
//                           as a review candidate.
//   REJECTED              -> cannot remain as a retained P1 extraction claim.
export type ContentClaimAttributionStatus =
  | 'CLEAR_P1_ATTRIBUTION'
  | 'REVIEW_REQUIRED'
  | 'REJECTED';

// Controlled-pilot declaration (§11-§13). Declared BEFORE extraction.
export interface ContentClaimPilotDeclaration {
  readonly pilotId: string;
  readonly gate: '07C.7';
  readonly gradeCode: 'P1';
  readonly sourceSubject: 'SRC_MATH';
  readonly structuralElementId: 'el-math-numbers';
  readonly structuralElementNameAr: string;
  readonly extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION';
  readonly extractionClass: 'DIRECT_DIGITAL';
  readonly physicalPageRange: string;
  readonly printedPageRange: string;
  readonly scannedIndexRange: string;
  readonly expectedClaimCategories: readonly ContentClaimCategory[];
  readonly why: string;
  readonly ocrState: string;
}

// Ledger of a controlled extraction: claims + safety counters (§24).
export interface ContentClaimLedger {
  readonly pilotId: string;
  readonly claims: readonly SourceContentClaim[];
  readonly claimCount: number;
  // Attribution state derived from the claim registry (step 11-F): these MUST
  // mirror the claims array, so report counts and registry state cannot diverge.
  readonly clearP1AttributionCount: number;   // attributionStatus === CLEAR_P1_ATTRIBUTION
  readonly reviewRequiredAttributionCount: number; // attributionStatus === REVIEW_REQUIRED
  readonly rejectedAttributionCount: number;  // attributionStatus === REJECTED
  readonly extractedUnverifiedCount: number; // contentStatus === EXTRACTED_UNVERIFIED
  readonly reviewRequiredContentCount: number; // contentStatus === REVIEW_REQUIRED
  readonly directSourceConfirmedCount: number; // must stay 0 unless separately proven
  readonly contentVerifiedCount: number;     // MUST stay 0 (§3)
  readonly publishedCount: number;           // MUST stay 0 (§3)
  readonly contentDenominatorKnown: boolean; // false => completeness UNMEASURABLE (§23)
  readonly completenessStatus: 'MEASURABLE' | 'UNMEASURABLE';
  readonly syntheticLessons: number;         // MUST stay 0 (§8)
  readonly syntheticKnowledgeObjects: number; // MUST stay 0 (§8)
  readonly syntheticExercises: number;       // MUST stay 0 (§8)
}

// Overall Gate 07C.7 verdict.
export interface ControlledContentExtractionVerdict {
  readonly gate: '07C.7';
  readonly pilotId: string;
  readonly claimCount: number;
  readonly contentVerified: number;          // 0
  readonly published: number;                // 0
  readonly structureCompleteVerified: number; // 0
  readonly masteryDerived: boolean;          // false
  readonly sourceNativeFirst: boolean;       // true
  readonly applicationMappingIsSecondary: boolean; // true (§19)
  readonly exactlyOneGrade: boolean;
  readonly exactlyOneSubject: boolean;
  readonly noSyntheticUnitsLessonsKOsOrExercises: boolean;
  readonly completenessUnmeasurable: boolean; // true (§23)
  readonly denominatorFrozenVerbatim: boolean; // 42/0/3/6/3 preserved (§2)
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.8 — PRIMARY CURRICULUM CELL ATTRIBUTION & REVIEW RESOLUTION
// ============================================================
// Purpose: resolve the six Gate-07C.7 REVIEW_REQUIRED cell-attribution claims
// (3 MULTIPLICATION + 3 DIVISION) from the PRIMARY ARTIFACT'S TABLE GEOMETRY
// ONLY. Grade truth comes from table headings/ranges/row alignment, NOT from
// semantic plausibility, claimId, wording, application taxonomy, or curriculum
// knowledge (§13 forensic core).
//
// The pilot claims array (Gate 07C.7) is NOT mutated here. Gate 07C.8 is an
// ADDITIVE review layer: it records a resolved attribution decision for each
// such review claim while preserving the 07C.7 freeze (§1/§55: 07C.7 stays
// 92/92, REVIEW=6/REJECTED=0, claim count 16, §23).
//
// GRADE-SCOPE DISTINCTION (§16): `gradeCode` on the pilot claim is the PILOT
// CANDIDATE SCOPE (P1). `sourceConfirmedGrade` here records what the source
// geometry ACTUALLY establishes (which may be another grade). These remain
// explicitly distinct and are NEVER conflated.

// Closed attribution decision model (§15).
export type ContentCellAttributionDecision =
  | 'CONFIRMED_P1'
  | 'CONFIRMED_OTHER_GRADE'
  | 'STILL_AMBIGUOUS'
  | 'SOURCE_STRUCTURE_INSUFFICIENT'
  | 'REJECTED_AS_P1';

// Closed decision bases (§39). NO arbitrary numeric confidence is used.
export type AttributionDecisionBasis =
  | 'DIRECT_CELL_HEADER_ALIGNMENT'
  | 'MERGED_CELL_GRADE_SPAN'
  | 'TABLE_ROW_COLUMN_ALIGNMENT'
  | 'CONTINUATION_FROM_LABELED_HEADER'
  | 'VISUAL_BOUNDARY_CONFIRMATION'
  | 'DIGITAL_GEOMETRY_CONFIRMATION'
  | 'OCR_ASSISTED_GEOMETRY_REVIEW'
  | 'SOURCE_STRUCTURE_INSUFFICIENT';

// Closed review-state for a resolved attribution review.
export type CellAttributionReviewState = 'RESOLVED';

// Closed primary-grade scope shared by the review semantic fields.
export type CellSourceConfirmedGrade = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

// P1 OWNERSHIP RESULT — a NEGATIVE attribution question (§2-A/§6):
// whether the source geometry establishes that the claim is NOT owned by the
// P1 cell/band. This is SEPARATE from any positive exact-grade claim (§2).
//   CONFIRMED_FALSE   -> geometry establishes the claim is NOT P1.
//   NOT_PROVEN_FALSE  -> NOT-P1 is NOT yet established as a fact.
export type CellP1OwnershipState = 'CONFIRMED_FALSE' | 'NOT_PROVEN_FALSE';

// EXACT-GRADE EVIDENCE STATE (§3/§13) — closed epistemic level of any positive
// exact grade (P3/P4) attribution, distinct from the negative NOT-P1 result:
//   DIRECTLY_ESTABLISHED      -> an explicit per-row grade header directly
//                                governs the cell (artifact-printed grade).
//   STRUCTURALLY_CALIBRATED   -> exact grade derived by deterministic cross-page
//                                structural calibration from an explicit anchor
//                                grade (NOT semantic plausibility).
//   UNRESOLVED                -> no deterministic exact grade can be established.
// NO numeric confidence is used.
export type ExactGradeEvidenceState = 'DIRECTLY_ESTABLISHED' | 'STRUCTURALLY_CALIBRATED' | 'UNRESOLVED';

// Cross-page calibration contract evidence (§7). Present only when
// exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED'. Each requirement is
// surfaced as an explicit, machine-readable field so the calibration is
// auditable and never rests on curriculum plausibility.
export interface CrossPageCalibrationEvidence {
  readonly anchorGrade: CellSourceConfirmedGrade; // explicit anchor grade in the structure
  readonly anchorLocator: string;      // where the anchor grade is printed (e.g. P1 bottom band)
  readonly tableContinuityNote: string; // same source-native table / demonstrable continuity
  readonly bandOrderingStableNote: string; // stable row/band ordering
  readonly deterministicOffsetNote: string; // deterministic positional offset
  readonly noContradictoryBoundaryNote: string; // no contradictory header/boundary found
}

// Geometry evidence (short locator notes only — §26 copyright). NO page dumps,
// OCR dumps, or transcribed tables. Only minimal coordinates/labels.
export interface CellAttributionGeometryEvidence {
  readonly elementLabel: string;      // e.g. "مصفوفة المدى والتتابع — مجال الأعداد والحساب"
  readonly headerOrRangeNote: string; // short note, e.g. "range 'من 0 إلى 9999' present"
  readonly rowColumnAlignmentNote: string; // short row/band alignment note
  readonly continuationNote?: string; // only when a labelled header continuation is used
  readonly crossPageCalibration?: CrossPageCalibrationEvidence; // only when STRUCTURALLY_CALIBRATED
}

// A single resolved cell-attribution review record (§14 fields + exact-grade
// epistemic reconciliation).
export interface CellAttributionReview {
  readonly reviewId: string;
  readonly claimId: string;              // references the 07C.7 pilot claim (stable, E02)
  readonly sourceTopic: GateSourceTopic;
  readonly artifactId: string;
  readonly sourceVersionId: string;
  readonly physicalPage: number;
  readonly printedPage: string;
  readonly structuralElementId: string;  // el-math-numbers (source-native)
  readonly candidateGrade: 'P1';         // pilot candidate scope (the registry is P1-scoped)
  readonly p1Ownership: CellP1OwnershipState; // NEGATIVE attribution result (§2-A/§6)
  readonly exactGradeCandidate: 'P3' | 'P4' | 'UNKNOWN'; // positive exact-grade candidate (§6)
  readonly exactGradeEvidenceState: ExactGradeEvidenceState; // closed epistemic level (§3)
  // `sourceConfirmedGrade` is populated ONLY when the artifact DIRECTLY
  // establishes the exact grade (exactGradeEvidenceState === 'DIRECTLY_ESTABLISHED').
  // It is `null` for STRUCTURALLY_CALIBRATED / UNRESOLVED so the field name never
  // overstates the evidence (§4: source-confirmed must mean source-confirmed).
  readonly sourceConfirmedGrade: CellSourceConfirmedGrade | null;
  // The exact grade carried WITHOUT the "directly source-confirmed" claim, used
  // whenever exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED' (§4).
  readonly structurallyCalibratedGrade: CellSourceConfirmedGrade | null;
  readonly tableLocator: string;
  readonly cellLocator: string;
  readonly gradeHeaderLocator: string;
  readonly geometryEvidence: CellAttributionGeometryEvidence;
  readonly attributionDecision: ContentCellAttributionDecision;
  readonly decisionBasis: readonly AttributionDecisionBasis[];
  readonly reviewState: CellAttributionReviewState;
  readonly reviewRequirement: 'REVIEW_REQUIRED'; // mirrors the pilot claim it resolves
  readonly reviewedAt: string;           // static review date (ISO)
  readonly reviewMethod: 'DIRECT_DIGITAL' | 'DIGITAL_WITH_OCR_RECOVERY';
}

// Additive Gate 07C.8 ledger: counts derived from the review records so the
// report and the registry can never diverge. Pilot claim state is untouched.
//
// NOT-P1 (negative attribution) and EXACT-GRADE (positive attribution) are kept
// as distinct count dimensions (§12): `confirmedNotP1Count` answers "is it NOT
// P1?"; the exact-grade evidence counts answer "how is a specific other grade
// (P3/P4) established?".
export interface CellAttributionReviewLedger {
  readonly gate: '07C.8';
  readonly reviewRequestCount: number;        // 6 (one per 07C.7 REVIEW_REQUIRED claim)
  readonly resolvedReviewCount: number;       // == reviewed records
  // Negative attribution (P1 ownership) — §2-A/§6.
  readonly confirmedNotP1Count: number;       // reviews with p1Ownership === CONFIRMED_FALSE
  readonly notProvenNotP1Count: number;       // reviews with p1Ownership === NOT_PROVEN_FALSE
  // Decision model (§15).
  readonly confirmedP1Count: number;          // 0
  readonly confirmedOtherGradeCount: number;  // 6 (== confirmedNotP1Count here)
  readonly stillAmbiguousCount: number;       // 0
  readonly sourceStructureInsufficientCount: number; // 0
  readonly rejectedAsP1Count: number;         // 0
  // Positive exact-grade evidence level (derived from exactGradeEvidenceState).
  readonly directlyEstablishedGradeCount: number;    // 0
  readonly structurallyCalibratedGradeCount: number; // 6
  readonly unresolvedExactGradeCount: number;        // 0
  // Directly source-confirmed exact grades (only non-null sourceConfirmedGrade).
  readonly distinctSourceConfirmedGrades: readonly CellSourceConfirmedGrade[];
  // Calibrated exact grades (only non-null structurallyCalibratedGrade).
  readonly distinctStructurallyCalibratedGrades: readonly CellSourceConfirmedGrade[];
  readonly sourceTopicsReviewed: readonly GateSourceTopic[];
  readonly frozenPilotReviewCount: number;    // 6 (freeze surface, §55)
}

// Overall Gate 07C.8 verdict.
export interface CellAttributionReviewVerdict {
  readonly gate: '07C.8';
  readonly pilotId: string;
  readonly artifactSha256: string;
  readonly sourceVersionId: string;
  readonly reviewRequestCount: number;        // 6
  readonly resolvedReviewCount: number;       // 6
  readonly confirmedP1Count: number;          // 0
  readonly confirmedOtherGradeCount: number;  // 6
  readonly confirmedNotP1Count: number;       // 6 (negative attribution, §12)
  readonly directlyEstablishedGradeCount: number;    // 0
  readonly structurallyCalibratedGradeCount: number; // 6
  readonly unresolvedExactGradeCount: number;        // 0
  readonly claimsMasqueradingAsP1: boolean;   // false
  readonly sourceConfirmedOnlyDirect: boolean;// true (sourceConfirmedGrade null unless directly established)
  readonly pilotClaimCountFrozen: boolean;    // true (16, §23)
  readonly contentVerifiedStaysZero: boolean; // true (§3/§22/§43)
  readonly publishedStaysZero: boolean;       // true (§3)
  readonly gradeScopeDistinct: boolean;       // true (§16 candidate vs source grade)
  readonly sevenC7SuitePreserved: boolean;    // true (§55, 92/92)
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.9 — CONTROLLED MULTI-CELL CONTENT EXPANSION READINESS
// ============================================================
// Purpose: safely expand the trusted extraction/attribution architecture from
// the ONE Gate-07C.7 pilot cell (P1 × SRC_MATH × el-math-numbers) to a SMALL
// set (2-4 cells, ~10-30 claims) of additional source-native cells in the SAME
// proven DIRECT_DIGITAL region of the authenticated 2021 primary curriculum
// artifact — WITHOUT fabricating grade ownership, duplicating source truth,
// weakening provenance, or creating lessons/KOs/exercises (§1/§5).
//
// FROZEN BOUNDARY (additive only): the 07C.7 pilot registry (16 claims) and
// 07C.8 review registry (6 records) are NOT mutated. This gate is a NEW,
// separate expansion layer. CONTENT_VERIFIED stays 0, PUBLISHED stays 0,
// masteryDerived stays false, completeness stays UNMEASURABLE (§3/§32).
//
// GRADE ATTRIBUTION (§10/§11): reuses the 07C.8 epistemic distinction. The
// pilot/candidate cell is declared by its candidate grade; the ACTUAL grade the
// source geometry establishes is recorded separately. Grade is NEVER inferred
// from sourceTopic, claimId, normalized wording, or curriculum plausibility.
// Cell attribution modes (closed):
//   DIRECTLY_ESTABLISHED_GRADE         -> an explicit per-row grade header
//                                         directly governs the cell.
//   STRUCTURALLY_CALIBRATED_GRADE      -> exact grade derived by deterministic
//                                         cross-page calibration from an anchor.
//   REVIEW_REQUIRED                    -> exact grade NOT deterministically
//                                         established; kept as a review candidate.
//   SOURCE_STRUCTURE_INSUFFICIENT      -> the source structure cannot establish
//                                         a grade (retained, non-masquerading).

/** Closed cell-attribution mode for an expansion cell (§11). */
export type ExpansionCellAttributionMode =
  | 'DIRECTLY_ESTABLISHED_GRADE'
  | 'STRUCTURALLY_CALIBRATED_GRADE'
  | 'REVIEW_REQUIRED'
  | 'SOURCE_STRUCTURE_INSUFFICIENT';

/** Digital/OCR state of the expansion cell's matrix page (§16). */
export type ExpansionDigitalState = 'DIRECT_DIGITAL' | 'DIGITAL_WITH_OCR_RECOVERY' | 'OCR_EXTRACTED';

/** Geometry-safety state of the expansion cell's grid association. */
export type ExpansionGeometryState =
  | 'GEOMETRY_CONFIRMED'     // cell/grade association confirmed from clean geometry
  | 'GEOMETRY_AMBIGUOUS'     // association not fully resolvable from geometry
  | 'GEOMETRY_INSUFFICIENT'; // source structure cannot resolve the association

/** A single source-native expansion cell (the §22 additive boundary unit). */
export interface ControlledContentExpansionCell {
  readonly cellId: string;                  // stable expansion cell identity
  readonly gate: '07C.9';
  readonly sourceTopic: GateSourceTopic;    // NUMBERS / ADD_SUB / MULT / DIV
  readonly candidateGrade: CellSourceConfirmedGrade; // declared candidate grade
  readonly physicalPage: number;            // physical page (index+1)
  readonly scannedIndex: number;            // pdfjs/scan basis
  readonly printedPage: string;             // printed footer page
  readonly structuralElementId: string;     // el-math-numbers (source-native)
  readonly sourceSubject: SourceNativeSubjectCode; // SRC_MATH
  readonly applicationSubjectCode: ApplicationSubjectCode; // downstream (§19)
  readonly cellLabelAr: string;             // short non-content cell label
  readonly digitalState: ExpansionDigitalState;
  readonly geometryState: ExpansionGeometryState;
  readonly attributionMode: ExpansionCellAttributionMode;
  readonly exactGradeEvidenceState: ExactGradeEvidenceState; // epistemic level (§10)
  readonly notes: string;
}

/** A Gate-07C.9 expansion content claim (additive; does NOT touch the pilot). */
export interface ExpansionContentClaim {
  readonly claimId: string;                 // stable content-claim identity
  readonly cellId: string;                  // -> ControlledContentExpansionCell.cellId
  readonly category: ContentClaimCategory;
  readonly sourceTopic: GateSourceTopic;
  readonly educationSystemCode: string;     // MOROCCO
  readonly stageCode: string;               // PRIMARY
  readonly candidateGrade: CellSourceConfirmedGrade; // declared candidate scope
  readonly sourceConfirmedGrade: CellSourceConfirmedGrade | null; // only when DIRECTLY_ESTABLISHED
  readonly structuralElementId: string;     // -> el-math-numbers
  readonly sourceSubject: SourceNativeSubjectCode; // SRC_MATH
  readonly applicationSubjectCode: ApplicationSubjectCode;
  readonly sourceVersionId: string;         // v1.0.0
  readonly sourceClassification: SourceClassification; // OFFICIAL_CURRICULUM_DOCUMENT

  readonly sourceWordingAr: string;         // minimal short wording only (§26)
  readonly normalizedValueAr: string;
  readonly normalizationClassification: NormalizationClassification;
  readonly extractionMethod: ExtractionMethod;
  readonly provenance: SourceContentClaimProvenance;

  readonly attributionMode: ExpansionCellAttributionMode; // grade-cell attribution (§11)
  readonly verificationState: VerificationState; // UNVERIFIED / REVIEW_REQUIRED / REJECTED
  readonly contentStatus: ExtractionContentStatus; // EXTRACTED_UNVERIFIED / REVIEW_REQUIRED
  readonly confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'UNVERIFIED';
  readonly notes?: string;
}

/** Expansion scope declaration (declared BEFORE extraction, §9/§22). */
export interface ControlledContentExpansionDeclaration {
  readonly gate: '07C.9';
  readonly expansionId: string;
  readonly sourceSubject: 'SRC_MATH';
  readonly structuralElementId: 'el-math-numbers';
  readonly extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION';
  readonly extractionClass: 'DIRECT_DIGITAL';
  readonly physicalPageRange: string;
  readonly printedPageRange: string;
  readonly scannedIndexRange: string;
  readonly cellCount: number;
  readonly expectedClaimCategories: readonly ContentClaimCategory[];
  readonly why: string;
  readonly ocrState: string;
}

/** Gate-07C.9 expansion ledger — safety counters (§22/§47). */
export interface ControlledContentExpansionLedger {
  readonly gate: '07C.9';
  readonly expansionId: string;
  readonly cells: readonly ControlledContentExpansionCell[];
  readonly cellCount: number;
  readonly claims: readonly ExpansionContentClaim[];
  readonly claimCount: number;
  // Attribution-mode counts (derived from the expansion claims).
  readonly directlyEstablishedGradeCount: number;
  readonly structurallyCalibratedGradeCount: number;
  readonly reviewRequiredGradeCount: number;
  readonly sourceStructureInsufficientGradeCount: number;
  // State counts.
  readonly extractedUnverifiedCount: number;
  readonly reviewRequiredContentCount: number;
  // FROZEN safety counters (§3/§32).
  readonly contentVerifiedCount: number;    // MUST stay 0
  readonly publishedCount: number;          // MUST stay 0
  readonly directSourceConfirmedCount: number; // MUST stay 0 unless proven directly
  readonly contentDenominatorKnown: boolean; // false => completeness UNMEASURABLE
  readonly completenessStatus: 'MEASURABLE' | 'UNMEASURABLE';
  readonly syntheticLessons: number;        // MUST stay 0
  readonly syntheticKnowledgeObjects: number; // MUST stay 0
  readonly syntheticExercises: number;      // MUST stay 0
  // Distinctness markers (diversity, §6).
  readonly distinctCandidateGrades: readonly CellSourceConfirmedGrade[];
  readonly distinctSourceTopics: readonly GateSourceTopic[];
}

/** Overall Gate 07C.9 verdict. */
export interface ControlledContentExpansionVerdict {
  readonly gate: '07C.9';
  readonly expansionId: string;
  readonly artifactSha256: string;
  readonly sourceVersionId: string;
  readonly cellCount: number;
  readonly claimCount: number;
  readonly contentVerified: number;         // 0
  readonly published: number;               // 0
  readonly structureCompleteVerified: number; // 0
  readonly masteryDerived: boolean;         // false
  readonly contentDenominatorKnown: boolean; // false
  readonly completenessUnmeasurable: boolean; // true
  readonly sourceNativeFirst: boolean;      // true
  readonly applicationMappingIsSecondary: boolean; // true
  readonly noSyntheticUnitsLessonsKOsOrExercises: boolean; // true
  readonly noFabricatedGradeOwnership: boolean; // true
  readonly noSourceTruthDuplication: boolean; // true
  readonly diversitySatisfied: boolean;     // true (≥2 of grade/subject/structure/category, §6)
  readonly pilotRegistryFrozen: boolean;    // true (07C.7 16 claims untouched)
  readonly reviewRegistryFrozen: boolean;   // true (07C.8 6 records untouched)
  readonly denominatorFrozenVerbatim: boolean; // true (structural denominator preserved)
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.10 — CONTROLLED BATCH EXTRACTION PROTOCOL
// ============================================================
// Purpose: prove that the trusted 07C.7/07C.8/07C.9 architecture generalizes
// to CONTROLLED BATCHES — frozen, bounded, additively-frozen extractions with
// a full lifecycle, per-batch manifests, claim->cell binding, cross-batch and
// cross-gate dedup, derived ledgers, and honest closure semantics.
//
// Phase A (CLOSED/PASS) declared and froze exactly TWO batches:
//   Batch A  BATCH-A-07C10-MATH-P3-NUMBERS        (SRC_MATH, 3 add/sub cells,
//                                  band 0-9999, phys 333, printed 335)
//   Batch B  BATCH-B-07C10-FR-LECTURE-ECRITURE    (SRC_FRENCH, 2 cells,
//                                  reading+writing, phys 219-221, printed 221-223)
//
// FROZEN BOUNDARY (additive only): the 07C.7 pilot registry (16 claims), the
// 07C.8 review registry (6 records), and the 07C.9 expansion registry (3 cells
// / claims) are NOT mutated. This gate is a NEW, separate batch layer.
// CONTENT_VERIFIED stays 0, PUBLISHED stays 0, mastery stays NOT_DERIVED,
// completeness stays UNMEASURABLE — globally and per batch.
//
// BATCH LIFECYCLE (closed): CANDIDATE -> SCOPE_FROZEN -> EXTRACTED ->
// ATTRIBUTION_REVIEWED -> DEDUP_CHECKED -> BATCH_CLOSED. A negative candidate
// (deferred/excluded/rejected) is BLOCKED / REVIEW_REQUIRED / REJECTED and
// MUST NEVER become a content claim.
//
// GRADE ATTRIBUTION (§Phase B protocol): reuses the 07C.8/07C.9 epistemic
// distinction. Batch A stays STRUCTURALLY_CALIBRATED (deterministic cross-page
// calibration from the accepted P2 0-999 band one step below 0-9999). Batch B
// (French) keeps grade-band context (P1-3 / P2-3 / P4-6) REVIEW_REQUIRED and is
// NEVER promoted to a fabricated single exact grade. Cell attribution and child
// claim attribution are independent evidence layers — no silent propagation.
//
// DEDUP (§Phase B protocol): canonical semantic comparison within each batch,
// A<->B, and against 07C.7 + 07C.9 canonical claims. Page/claimId/batch/grade/
// subject differences alone are NOT dedup identity. Prevented duplicates MUST
// be recorded machine-readably and MUST NOT create a second canonical claim.
//
// LEDGERS (§Phase B protocol): per-batch and global ledgers are DERIVED from
// the canonical records (no hardcoded totals). BATCH_CLOSED != VERIFIED !=
// PUBLISHED; a batch may close while carrying REVIEW_REQUIRED claims.
//
// Copyright (§26): only minimal short wording + coordinates + locator notes are
// committed. NO page dumps, OCR dumps, or transcribed tables.

/** Closed batch source subject (only the two frozen batches are admitted). */
export type BatchSourceSubject = 'SRC_MATH' | 'SRC_FRENCH';

/** Closed batch lifecycle state (§Phase B protocol). */
export type BatchLifecycleState =
  | 'CANDIDATE'
  | 'SCOPE_FROZEN'
  | 'EXTRACTED'
  | 'ATTRIBUTION_REVIEWED'
  | 'DEDUP_CHECKED'
  | 'BATCH_CLOSED';

/** Closed negative-candidate state — never becomes a content claim. */
export type BatchNegativeState = 'BLOCKED' | 'REVIEW_REQUIRED' | 'REJECTED';

/** A single controlled batch cell (§ additively-bounded cell unit). */
export interface ControlledBatchCell {
  readonly cellId: string;
  readonly batchId: string;
  readonly gate: '07C.10';
  /** Math: NUMBERS / ADD_SUB / MULT / DIV. French: null (no matrix topic). */
  readonly sourceTopic: GateSourceTopic | null;
  /** DECLARED candidate grade; null when the artifact only establishes a band. */
  readonly candidateGrade: CellSourceConfirmedGrade | null;
  /** Artifact scope: single grade (['P3']) or honest grade band (['P1','P2','P3']). */
  readonly gradeBandScope: readonly string[];
  readonly physicalPage: number;
  readonly scannedIndex: number;
  readonly printedPage: string;
  readonly structuralElementId: string;
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly applicationSubjectCode: ApplicationSubjectCode;
  readonly cellLabelAr: string;
  readonly digitalState: ExpansionDigitalState;
  readonly attributionMode: ExpansionCellAttributionMode;
  readonly exactGradeEvidenceState: ExactGradeEvidenceState;
  readonly notes: string;
}

/** Batch manifest — frozen declaration of one controlled batch (§9/§22). */
export interface ControlledBatchManifest {
  readonly gate: '07C.10';
  readonly batchId: string;
  readonly batchName: string;
  readonly sourceSubject: BatchSourceSubject;
  readonly applicationSubjectCode: ApplicationSubjectCode;
  readonly structuralElementIds: readonly string[];
  readonly extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION';
  readonly extractionClass: ArtifactOcrClassification; // DIRECT_DIGITAL for both frozen batches
  /** Physical pages authorized for EXTRACTION (frozen; context pages excluded). */
  readonly authorizedExtractionPages: readonly number[];
  /** Physical pages that provide ATTRIBUTION CONTEXT ONLY — never extraction. */
  readonly attributionContextPagesOnly: readonly number[];
  readonly sourceVersionId: string;
  readonly artifactSha256: string;
  readonly maximumClaims: number;             // CEILING, not quota
  readonly deathValue: string;                // why this exact batch scope
  readonly declaredAt: string;                // static freeze date (ISO)
  readonly status: 'FROZEN';
}

/** A negative (deferred/excluded/rejected) candidate for a batch. */
export interface BatchNegativeCandidate {
  readonly negativeId: string;
  /** Set when tied to a specific frozen batch; omitted for gate-level rejections. */
  readonly batchId?: string;
  readonly negativeReason: string;
  readonly negativeState: BatchNegativeState;
  readonly neverBecomesClaim: boolean;        // MUST stay true
}

/** A single batch content claim bound to its cell + manifest. */
export interface BatchContentClaim {
  readonly claimId: string;
  readonly batchId: string;
  readonly cellId: string;
  readonly category: ContentClaimCategory;
  /** Math only; null for French (no matrix topic). */
  readonly sourceTopic: GateSourceTopic | null;
  readonly educationSystemCode: string;       // MOROCCO
  readonly stageCode: string;                 // PRIMARY
  /** DECLARED candidate grade; null when the artifact only establishes a band. */
  readonly candidateGrade: CellSourceConfirmedGrade | null;
  /** Artifact scope: single grade (['P3']) or honest grade band (['P1','P2','P3']). */
  readonly gradeBandScope: readonly string[];
  readonly sourceConfirmedGrade: CellSourceConfirmedGrade | null; // only when DIRECTLY_ESTABLISHED
  readonly structuralElementId: string;
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly applicationSubjectCode: ApplicationSubjectCode;
  readonly sourceVersionId: string;
  readonly sourceClassification: SourceClassification; // OFFICIAL_CURRICULUM_DOCUMENT
  /** Arabic source wording (SRC_ARABIC/SRC_MATH claims). Exactly one of Ar/Fr. */
  readonly sourceWordingAr?: string;
  /** Normalized Arabic claim value (Arabic-medium claims). Exactly one of Ar/Fr. */
  readonly normalizedValueAr?: string;
  /** Authoritative French source wording for SRC_FRENCH claims (never a translation). */
  readonly sourceWordingFr?: string;
  /** Normalized French claim value; carries source truth for SRC_FRENCH claims. */
  readonly normalizedValueFr?: string;
  readonly normalizationClassification: NormalizationClassification;
  readonly extractionMethod: ExtractionMethod;
  readonly provenance: SourceContentClaimProvenance;
  readonly attributionMode: ExpansionCellAttributionMode;
  readonly exactGradeEvidenceState: ExactGradeEvidenceState;
  readonly verificationState: VerificationState;
  readonly contentStatus: ExtractionContentStatus;
  readonly confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'UNVERIFIED';
  readonly notes?: string;
}

/** Which canonical scope a dedup comparison ran against. */
export type BatchDedupAgainst =
  | 'WITHIN_BATCH'
  | 'OTHER_BATCH'
  | 'GATE_07C.7'
  | 'GATE_07C.9';

/** Machine-readable record of a prevented duplicate (never a second claim). */
export interface BatchDedupPreventionRecord {
  readonly against: BatchDedupAgainst;
  readonly preventedClaimCanonicalKey: string; // the semantic source scope that was refused
  readonly retainedCanonicalKey: string;       // the already-existing canonical claim it would duplicate
  readonly retainedClaimId: string;            // exact retained claim identity (e.g. clm-...)
  readonly note: string;
}

/** Executed dedup comparison summary — derived, auditable (§G). */
export interface BatchDedupCheckResult {
  readonly comparisons: readonly {
    readonly against: BatchDedupAgainst;
    readonly comparedKeyCount: number;
    readonly collisions: number;
  }[];
  readonly duplicatesPrevented: readonly BatchDedupPreventionRecord[];
  readonly totalDuplicatesPrevented: number;
  readonly twentySevenC7SuiteFrozen: boolean;  // 92/92 untouched
  readonly sevenC7PilotFrozen: boolean;        // 16 claims untouched
  readonly sevenC8ReviewsFrozen: boolean;      // 6 records untouched
  readonly sevenC9ExpansionFrozen: boolean;    // 3 cells untouched
}

/** Per-batch ledger — every count DERIVED from the canonical records. */
export interface ControlledBatchLedger {
  readonly gate: '07C.10';
  readonly batchId: string;
  readonly manifest: ControlledBatchManifest;
  readonly cells: readonly ControlledBatchCell[];
  readonly cellCount: number;
  readonly claims: readonly BatchContentClaim[];
  readonly claimCount: number;
  readonly maximumClaims: number;              // == manifest.maximumClaims (ceiling)
  // Attribution-mode counts (derived).
  readonly directlyEstablishedGradeCount: number;
  readonly structurallyCalibratedGradeCount: number;
  readonly reviewRequiredGradeCount: number;
  readonly sourceStructureInsufficientGradeCount: number;
  // State counts (derived).
  readonly extractedUnverifiedCount: number;
  readonly reviewRequiredContentCount: number;
  // FROZEN safety counters (§Phase B): MUST stay 0.
  readonly contentVerifiedCount: number;
  readonly publishedCount: number;
  readonly directSourceConfirmedCount: number; // 0 unless separately proven directly
  readonly syntheticLessons: number;
  readonly syntheticKnowledgeObjects: number;
  readonly syntheticExercises: number;
  readonly contentDenominatorKnown: boolean;
  readonly completenessStatus: 'MEASURABLE' | 'UNMEASURABLE';
  readonly lifecycleState: BatchLifecycleState;
  readonly closedAt?: string;                  // ISO when BATCH_CLOSED
  readonly dedup: BatchDedupCheckResult;
}

/** Global 07C.10 ledger — derived aggregates across the two batches. */
export interface ControlledBatchGlobalLedger {
  readonly gate: '07C.10';
  readonly batchIds: readonly string[];
  readonly batchCount: number;
  readonly totalCellCount: number;
  readonly totalClaimCount: number;
  readonly totalMaximumClaims: number;
  readonly claimsBySourceSubject: readonly { sourceSubject: SourceNativeSubjectCode; count: number }[];
  readonly claimsByGradeEvidenceState: readonly { exactGradeEvidenceState: ExactGradeEvidenceState; count: number }[];
  readonly claimsByContentStatus: readonly { contentStatus: ExtractionContentStatus; count: number }[];
  readonly claimsByVerificationState: readonly { verificationState: VerificationState; count: number }[];
  readonly duplicateClaimsPreventedTotal: number;
  readonly negativeCandidateCount: number;
  readonly contentVerifiedCount: number;       // MUST stay 0 (§3)
  readonly publishedCount: number;             // MUST stay 0 (§3)
  readonly completenessStatus: 'MEASURABLE' | 'UNMEASURABLE';
  readonly contentDenominatorKnown: boolean;   // false
  readonly allBatchesClosed: boolean;          // true only when both are BATCH_CLOSED
}

/** Overall Gate 07C.10 verdict. */
export interface ControlledBatchExtractionVerdict {
  readonly gate: '07C.10';
  readonly artifactSha256: string;
  readonly sourceVersionId: string;
  readonly batchIds: readonly string[];
  readonly batchCount: number;
  readonly cellCount: number;
  readonly claimCount: number;
  readonly contentVerified: number;            // 0
  readonly published: number;                  // 0
  readonly structureCompleteVerified: number;  // 0
  readonly masteryDerived: boolean;            // false
  readonly contentDenominatorKnown: boolean;   // false
  readonly completenessUnmeasurable: boolean;  // true
  readonly sourceNativeFirst: boolean;         // true
  readonly applicationMappingIsSecondary: boolean; // true
  readonly noSyntheticUnitsLessonsKOsOrExercises: boolean; // true
  readonly noFabricatedGradeOwnership: boolean;// true (Batch B stays REVIEW_REQUIRED)
  readonly noSourceTruthDuplication: boolean;  // true (dedup executed, 0 duplicates created)
  readonly lifecycleProven: boolean;           // both batches reached BATCH_CLOSED
  readonly closureSemantics: boolean;          // BATCH_CLOSED != VERIFIED != PUBLISHED
  readonly pilotRegistryFrozen: boolean;       // true (07C.7 16 claims untouched)
  readonly reviewRegistryFrozen: boolean;      // true (07C.8 6 records untouched)
  readonly expansionRegistryFrozen: boolean;   // true (07C.9 3 cells untouched)
  readonly denominatorFrozenVerbatim: boolean; // true (global freezes preserved)
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.11 — CONTROLLED CURRICULUM CONTENT VERIFICATION
// ============================================================
// Purpose: prove a controlled VERIFICATION protocol over the frozen 6-claim
// pilot (clm-p1-math-numbers-natural-numbers-0-9, clm-p1-math-numbers-add-concept,
// clm-p2-math-numbers-add-999, cl-aA-math-p3-add-9999,
// cl-bA-fr-write-p23-ecriture-cursive, clm-p1-math-numbers-multiply-repeated-addition).
// The verification layer is ADDITIVE: the 07C.7 pilot registry (16 claims), the
// 07C.8 review registry (6 records), the 07C.9 expansion registry (3 cells), and
// the 07C.10 batch registry (2 batches / 11 claims) are NOT mutated. Effective
// verification state is DERIVED from the canonical claim + its additive
// verification record.
//
// VERIFICATION DECISIONS (§protocol):
//   VERIFIED          -> every evidence dimension satisfies the verification
//                        contract AND the review mode is satisfied (SINGLE_REVIEW
//                        only when all single-review criteria pass;
//                        DUAL_CONFIRMATION otherwise).
//   REVIEW_REQUIRED   -> evidence is not conclusive; retained for review.
//   REJECTED          -> a closed rejection reason applies (see
//                        VerificationRejectionReason); the claim is not
//                        curriculum truth as extracted.
//
// STATE MACHINE (§protocol): UNVERIFIED -> REVIEW_REQUIRED / VERIFIED / REJECTED;
// REVIEW_REQUIRED -> REVIEW_REQUIRED / VERIFIED / REJECTED; REJECTED ->
// REVIEW_REQUIRED only with NEW evidence. VERIFIED is IMMUTABLE within the
// artifact/source version. No silent VERIFIED -> REJECTED transition.
//
// PATHS (§protocol): only DIRECT_PRIMARY_DIGITAL and
// DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION can VERIFY.
// CROSS_REFERENCE_SUPPORTED_BUT_NOT_VERIFIED NEVER yields VERIFIED. The OCR
// verification path is NOT implemented in 07C.11 (FUTURE_OCR_VERIFICATION_PATH_REQUIRED);
// no claim is VERIFIED from OCR-derived evidence.
//
// Persistence is NOT implemented in 07C.11 (FUTURE_PERSISTENCE_REQUIREMENT); the
// records live in the additive registry only.

/** Closed verification extraction path (§protocol). */
export type VerificationExtractionPath =
  | 'DIRECT_PRIMARY_DIGITAL'                            // cleanly-digital primary text directly supports the claim in place
  | 'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION'  // direct digital text + table geometry attribution
  | 'CROSS_REFERENCE_SUPPORTED_BUT_NOT_VERIFIED';       // cross-reference support ONLY — NEVER yields VERIFIED

/** Source-text fidelity of the evidence (§D fidelity). */
export type VerificationSourceTextFidelity = 'CONFIRMED' | 'PARTIAL' | 'FAIL';

/** Semantic (claim-vs-source) fidelity (§D). OVERSTATED/CONFLICT forbid VERIFIED. */
export type VerificationSemanticFidelity = 'CONFIRMED' | 'OVERSTATED' | 'CONFLICT';

/** Grade attribution assessment (§E). UNRESOLVED forbids VERIFIED. */
export type VerificationGradeAttribution =
  | 'DIRECT_EXACT'
  | 'STRUCTURALLY_CALIBRATED'
  | 'BAND_SUPPORTED'
  | 'UNRESOLVED';

/** Structural-parent association assessment. */
export type VerificationStructuralParentAssessment =
  | 'PARENT_CONFIRMED'
  | 'PARENT_MISMATCH'
  | 'PARENT_UNRESOLVED';

/** Contradiction assessment (§L). FLAGGED forbids VERIFIED. */
export type VerificationContradictionAssessment = 'CLEAR' | 'FLAGGED';

/** Dedup assessment (§M). Non-CLEAR forbids VERIFIED until a collision is resolved. */
export type VerificationDedupAssessment =
  | 'CLEAR'
  | 'COLLISION_RESOLVED'
  | 'COLLISION_UNRESOLVED';

/** Closed review modes (§F). */
export type VerificationReviewMode = 'SINGLE_REVIEW' | 'DUAL_CONFIRMATION';

/** Non-PII reviewer slots (never a human name/identity). */
export type VerificationReviewerSlot = 'REVIEWER_A' | 'REVIEWER_B';

/** Result of one verification review record (§protocol). */
export type VerificationDecision = 'VERIFIED' | 'REVIEW_REQUIRED' | 'REJECTED';

/** Closed rejection reasons (§K). Free-form notes NEVER replace the reason. */
export type VerificationRejectionReason =
  | 'SOURCE_TEXT_DOES_NOT_SUPPORT_CLAIM'
  | 'GRADE_ATTRIBUTION_UNRESOLVED'
  | 'CLAIM_SCOPE_REFUTED_BY_ATTRIBUTION_EVIDENCE'
  | 'STRUCTURAL_PARENT_MISMATCH'
  | 'SEMANTIC_OVERSTATEMENT'
  | 'DUPLICATE_CANONICAL_TRUTH'
  | 'SOURCE_CONTRADICTION'
  | 'INSUFFICIENT_TEXT_FIDELITY'
  | 'OCR_QUALITY_INSUFFICIENT'
  | 'OUT_OF_SCOPE'
  | 'SUPERSEDED_SOURCE_VERSION';

/** Evidence package binding a review record to its canonical claim + source. */
export interface ContentVerificationEvidencePackage {
  readonly verificationReviewId: string;
  readonly claimId: string;
  readonly artifactSha256: string;
  readonly sourceVersionId: string;
  readonly physicalPage: number;
  readonly printedPage: string;
  readonly structuralElementId: string;
  /** Stable canonical content identity (dedup key, §M). */
  readonly semanticIdentity: string;
  /** Human-readable stable key of the semantic identity. */
  readonly stableKey: string;
  readonly extractionMethod: ExtractionMethod;
  readonly extractionPath: VerificationExtractionPath;
  readonly sourceTextEvidence: VerificationSourceTextFidelity;
  readonly normalizationAssessment: NormalizationClassification;
  readonly gradeAttributionAssessment: VerificationGradeAttribution;
  readonly structuralParentAssessment: VerificationStructuralParentAssessment;
  readonly semanticFidelityAssessment: VerificationSemanticFidelity;
  readonly contradictionAssessment: VerificationContradictionAssessment;
  readonly dedupAssessment: VerificationDedupAssessment;
  readonly reviewMode: VerificationReviewMode;
  readonly reviewDecision: VerificationDecision;
  readonly decisionReason: string;
  readonly reviewedAt: string;               // static ISO review date
  readonly verificationVersion: string;      // logical verification-layer version (v1.0.0)
}

/** Reviewer confirmations (non-PII slots only, §F). */
export interface VerificationReviewerConfirmation {
  readonly reviewer: VerificationReviewerSlot;
  readonly confirmedAt: string;              // static ISO date
}

/** Additive Gate-07C.11 verification review record (never a claim body). */
export interface ContentVerificationReviewRecord {
  readonly reviewRecordId: string;
  /** Declared candidate scope from the frozen claim — NEVER rewritten. */
  readonly candidateGrade: CellSourceConfirmedGrade | null;
  /** Artifact scope: ['P1'] / ['P2'] / ['P3'] (exact) or honest band (['P2','P3']). */
  readonly gradeBandScope: readonly string[];
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly applicationSubjectCode: ApplicationSubjectCode;
  readonly normalizedValueAr?: string;
  readonly normalizedValueFr?: string;
  /** Present ONLY when reviewDecision === 'REJECTED'. */
  readonly rejectionReason?: VerificationRejectionReason;
  /** true when the record carries a FUTURE_OCR_VERIFICATION_PATH_REQUIRED note. */
  readonly futureOcrVerificationPathRequired: boolean;
  readonly reviewerConfirmations: readonly VerificationReviewerConfirmation[];
  readonly reviewNotes?: string;
  readonly evidence: ContentVerificationEvidencePackage;
}

/** Gate-07C.11 verification ledger — every count DERIVED from the records. */
export interface ContentVerificationLedger {
  readonly gate: '07C.11';
  readonly pilotClaimCount: number;                       // 6 (frozen pilot)
  readonly reviewRecordCount: number;                     // == records
  readonly verifiedClaimCount: number;
  readonly reviewRequiredClaimCount: number;
  readonly rejectedClaimCount: number;
  readonly singleReviewCount: number;
  readonly dualConfirmationCount: number;
  readonly claimsByExtractionPath: readonly { extractionPath: VerificationExtractionPath; count: number }[];
  readonly claimsBySourceSubject: readonly { sourceSubject: SourceNativeSubjectCode; count: number }[];
  readonly claimsByGradeAttribution: readonly { gradeAttributionAssessment: VerificationGradeAttribution; count: number }[];
  readonly claimsByDecisionReason: readonly { decisionReason: string; count: number }[];
  readonly contradictionFlaggedCount: number;
  readonly dedupCollisionCount: number;
  readonly ocrVerifiedCount: number;                      // MUST stay 0
  readonly publishedCount: number;                        // MUST stay 0
  readonly contentVerifiedCount: number;                  // DERIVED (== verifiedClaimCount)
}

/** Overall Gate 07C.11 verdict. */
export interface ControlledContentVerificationVerdict {
  readonly gate: '07C.11';
  readonly artifactSha256: string;
  readonly sourceVersionId: string;
  readonly pilotClaimCount: number;               // 6
  readonly reviewRecordCount: number;             // 6
  readonly contentVerified: number;               // DERIVED (count of genuinely VERIFIED pilot claims)
  readonly published: number;                     // 0
  readonly structureCompleteVerified: number;     // 0
  readonly masteryDerived: boolean;               // false
  readonly contentDenominatorKnown: boolean;      // false
  readonly completenessUnmeasurable: boolean;     // true
  readonly sourceNativeFirst: boolean;            // true
  readonly applicationMappingIsSecondary: boolean; // true
  readonly noSyntheticUnitsLessonsKOsOrExercises: boolean; // true
  readonly noFabricatedGradeOwnership: boolean;   // true
  readonly noSourceTruthDuplication: boolean;     // true
  readonly noOcrVerifiedClaims: boolean;          // true (OCR path not implemented in 07C.11)
  readonly ocrPathNote: string;                   // FUTURE_OCR_VERIFICATION_PATH_REQUIRED
  readonly persistenceRequirementNote: string;    // FUTURE_PERSISTENCE_REQUIREMENT
  readonly verifiedClaimsImmutableWithinVersion: boolean; // true (VERIFIED immutable)
  readonly pilotRegistryFrozen: boolean;          // true (07C.7 16 claims untouched)
  readonly reviewRegistryFrozen: boolean;         // true (07C.8 6 records untouched)
  readonly expansionRegistryFrozen: boolean;      // true (07C.9 3 cells untouched)
  readonly batchRegistryFrozen: boolean;          // true (07C.10 2 batches untouched)
  readonly historicalClaimsUnmutated: boolean;    // true
  readonly denominatorFrozenVerbatim: boolean;    // true
  readonly recommendation: 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================
// GATE 07C.12 — CANONICAL EFFECTIVE VERIFIED CONTENT
// ============================================================

/** Authority remains independent from source recency/currentness. */
export type CanonicalSourceAuthorityState =
  | 'AUTHORITATIVE_FOR_SCOPE'
  | 'NOT_AUTHORITATIVE_FOR_SCOPE'
  | 'AUTHORITY_UNRESOLVED';

/** Conservative currentness assessment for an asserted source version. */
export type CanonicalSourceCurrentnessState =
  | 'CURRENT_CONFIRMED'
  | 'LATEST_VERIFIED_ARTIFACT_FOUND'
  | 'SUPERSEDED_IN_SCOPE'
  | 'CURRENTNESS_UNRESOLVED';

/** Effective-truth state never overwrites historical verification state. */
export type CanonicalEffectiveTruthState =
  | 'EFFECTIVE'
  | 'SUPERSEDED'
  | 'REVIEW_REQUIRED_FOR_CURRENTNESS'
  | 'HISTORICAL_ONLY';

/** Closed, additive explanation for a scoped supersession decision. */
export type CanonicalSupersessionReason =
  | 'SOURCE_VERSION_SUPERSESSION'
  | 'SEMANTIC_CORRECTION'
  | 'SCOPE_REPLACEMENT'
  | 'DUPLICATE_CONSOLIDATION';

/** Universal semantic tuple. Source version is deliberately outside this identity. */
export interface CanonicalCurriculumIdentity {
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly structuralElementId: string;
  readonly category: ContentClaimCategory;
  readonly gradeOrBandScope: readonly string[];
  readonly normalizedSemanticValue: string;
  readonly canonicalIdentity: string;
}

/** Additive scoped supersession; no effective date is invented when unknown. */
export interface CanonicalClaimSupersession {
  readonly supersessionId: string;
  readonly canonicalIdentity: string;
  readonly supersededSourceVersionId: string;
  readonly supersedingSourceVersionId: string;
  readonly reason: CanonicalSupersessionReason;
  readonly effectiveFrom?: string;
}

/** Read-only projection over a historical claim plus its applicable verification. */
export interface EffectiveCanonicalVerifiedClaim {
  readonly claimId: string;
  readonly canonicalIdentity: string;
  readonly sourceVersionId: string;
  readonly verificationReviewId: string;
  readonly verificationVersion: string;
  readonly effectiveVerificationState: 'VERIFIED';
  readonly effectiveTruthState: CanonicalEffectiveTruthState;
  readonly sourceAuthorityState: CanonicalSourceAuthorityState;
  readonly sourceCurrentnessState: CanonicalSourceCurrentnessState;
  readonly sourceSubject: SourceNativeSubjectCode;
  readonly structuralElementId: string;
  readonly gradeOrBandScope: readonly string[];
  readonly physicalPage: number;
  readonly printedPage: string;
  readonly artifactSha256: string;
  readonly verificationPath: VerificationExtractionPath;
  readonly attributionAssessment: VerificationGradeAttribution;
}

/** Publication readiness is downstream from verification and never publishes. */
export type PublicationReadinessState =
  | 'NOT_EVALUATED'
  | 'REVIEW_REQUIRED'
  | 'BLOCKED'
  | 'READY';

export type PublicationReadinessAssessment =
  | 'CONFIRMED'
  | 'REVIEW_REQUIRED'
  | 'BLOCKED';

/** Additive readiness record; it references verified truth and never copies wording. */
export interface PublicationReadinessRecord {
  readonly readinessAssessmentId: string;
  readonly claimId: string;
  readonly canonicalIdentity: string;
  readonly verificationReviewId: string;
  readonly sourceVersionId: string;
  readonly authorityAssessment: CanonicalSourceAuthorityState;
  readonly currentnessAssessment: CanonicalSourceCurrentnessState;
  readonly structuralParentAssessment: PublicationReadinessAssessment;
  readonly scopeAssessment: PublicationReadinessAssessment;
  readonly semanticSafetyAssessment: PublicationReadinessAssessment;
  readonly provenanceAssessment: PublicationReadinessAssessment;
  readonly contradictionAssessment: PublicationReadinessAssessment;
  readonly dedupAssessment: PublicationReadinessAssessment;
  readonly editorialSafetyAssessment: PublicationReadinessAssessment;
  readonly decision: PublicationReadinessState;
  readonly decisionReason: string;
}

/** Derived Gate-07C.12 counters. */
export interface CanonicalEffectiveVerificationLedger {
  readonly gate: '07C.12';
  readonly historicalVerifiedReviewRecordCount: number;
  readonly effectiveCanonicalVerifiedClaimCount: number;
  readonly effectiveRejectedCount: number;
  readonly canonicalIdentityCollisionCount: number;
  readonly supersededExcludedCount: number;
  readonly publishedCount: number;
}

export interface PublicationReadinessLedger {
  readonly gate: '07C.12';
  readonly positiveReadinessPilotCount: number;
  readonly publicationReadyCount: number;
  readonly publicationReviewRequiredCount: number;
  readonly publicationBlockedCount: number;
  readonly negativeControlExcludedCount: number;
  readonly publishedCount: number;
}

// ============================================================
// GATE 07C.13 — AUTHORITATIVE CURRENTNESS EVIDENCE
// ============================================================

export type SourceCurrentnessEvidenceClass =
  | 'EXPLICIT_CURRENTNESS_CONFIRMATION'
  | 'EXPLICIT_SUPERSESSION'
  | 'SCOPE_SPECIFIC_CONTINUITY'
  | 'SCOPE_SPECIFIC_REPLACEMENT'
  | 'SUCCESSOR_EQUIVALENCE_CONFIRMED'
  | 'REFORM_WITHOUT_CURRICULUM_SUPERSESSION'
  | 'LATEST_OFFICIAL_SOURCE_ONLY'
  | 'OFFICIAL_INSTITUTIONAL_CORROBORATION_ONLY'
  | 'SECONDARY_CORROBORATION_ONLY'
  | 'CONTRADICTORY_EVIDENCE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'OFFICIAL_SOURCE_DISCOVERED_NOT_RECOVERED';

export type CurrentnessAuthorityTier =
  | 'TIER_1_COMPETENT_AUTHORITY'
  | 'TIER_2_OFFICIAL_INSTITUTION'
  | 'TIER_3_SECONDARY_DISCOVERY';

export type CurrentnessScopeKind =
  | 'SYSTEM'
  | 'EDUCATION_LEVEL'
  | 'SUBJECT'
  | 'GRADE'
  | 'GRADE_BAND'
  | 'STRUCTURAL_ELEMENT'
  | 'CANONICAL_CLAIM';

export interface CurrentnessScope {
  readonly kind: CurrentnessScopeKind;
  readonly system?: string;
  readonly educationLevel?: string;
  readonly subject?: string;
  readonly grade?: string;
  readonly gradeBand?: readonly string[];
  readonly structuralElementId?: string;
  readonly canonicalIdentity?: string;
}

export type TemporalPrecision = 'DAY' | 'MONTH' | 'YEAR' | 'ACADEMIC_YEAR' | 'UNKNOWN';
export type CurrentnessRecoveryState = 'RECOVERED_AUTHENTICATED' | 'OFFICIAL_PAGE_RECORDED' | 'OFFICIAL_SOURCE_DISCOVERED_NOT_RECOVERED';
export type CurrentnessSupportRole = 'SUPPORTING' | 'QUALIFYING' | 'CONTRADICTING' | 'DISCOVERY_ONLY';

export interface SourceCurrentnessEvidenceRecord {
  readonly evidenceId: string;
  readonly sourceId: string;
  readonly sourceVersionId?: string;
  readonly evidenceClass: SourceCurrentnessEvidenceClass;
  readonly authorityTier: CurrentnessAuthorityTier;
  readonly issuer: string;
  readonly documentType: string;
  readonly publicationDate?: string;
  readonly publicationDatePrecision: TemporalPrecision;
  readonly targetScope: CurrentnessScope;
  readonly relationshipToTargetSource: string;
  readonly relationshipToTargetScope: string;
  readonly applicabilityStatement: string;
  readonly evidenceLocator: string;
  readonly retrievedAt: string;
  readonly currentnessAsOf?: string;
  readonly supportRole: CurrentnessSupportRole;
  readonly artifactHash?: string;
  readonly recoveryState: CurrentnessRecoveryState;
  readonly applicabilityStart?: string;
  readonly applicabilityEnd?: string;
  readonly applicabilityPrecision: TemporalPrecision;
  readonly academicYearRange?: string;
  readonly applicabilityBasis: string;
}

export type DerivedCurrentnessState =
  | 'CURRENT_CONFIRMED'
  | 'CURRENT_FOR_SCOPE'
  | 'CURRENT_WITH_QUALIFICATIONS'
  | 'LATEST_VERIFIED_ARTIFACT_FOUND'
  | 'CURRENTNESS_UNRESOLVED'
  | 'SUPERSEDED_IN_SCOPE'
  | 'HISTORICAL_ONLY';

export type CurrentnessApplicabilityState = 'APPLICABLE' | 'UNRESOLVED' | 'SUPERSEDED' | 'NOT_APPLICABLE';
export type CurrentnessRevalidationTrigger =
  | 'NEW_OFFICIAL_SOURCE_DISCOVERED'
  | 'EXPLICIT_AMENDMENT_OR_REPLACEMENT'
  | 'ACADEMIC_YEAR_BOUNDARY'
  | 'PRE_PUBLICATION_RELEASE'
  | 'CONTRADICTORY_AUTHORITY_EVIDENCE';

export interface CurrentnessDecisionRecord {
  readonly currentnessDecisionId: string;
  readonly targetSourceId: string;
  readonly targetSourceVersionId: string;
  readonly targetScope: CurrentnessScope;
  readonly authorityState: CanonicalSourceAuthorityState;
  readonly currentnessState: DerivedCurrentnessState;
  readonly applicabilityState: CurrentnessApplicabilityState;
  readonly currentnessAsOf: string;
  readonly supportingEvidenceIds: readonly string[];
  readonly contradictingEvidenceIds: readonly string[];
  readonly decisionReason: string;
  readonly revalidationTriggers: readonly CurrentnessRevalidationTrigger[];
}

export interface DerivedCurrentnessReadiness {
  readonly claimId: string;
  readonly sourceVersionId: string;
  readonly currentnessState: DerivedCurrentnessState;
  readonly decision: PublicationReadinessState;
  readonly decisionReason: string;
}

// ============================================================
// GATE 07C.14 — IMMUTABLE PUBLICATION AND RELEASE BOUNDARY
// ============================================================

export type PublicationPolicyVersion = string;
export type PublicationManifestStatus = 'DRAFT' | 'VALIDATED' | 'SEALED' | 'REJECTED';
export type CurriculumReleaseStatus = 'DRAFT' | 'VALIDATED' | 'SEALED' | 'ACTIVE' | 'SUPERSEDED' | 'WITHDRAWN' | 'REJECTED';

export interface PublicationReleaseScope {
  readonly educationSystem: string;
  readonly educationLevel?: string;
  readonly subject?: string;
  readonly gradeOrBand?: readonly string[];
}

export interface PublicationCandidate {
  readonly candidateId: string;
  readonly canonicalIdentity: string;
  readonly claimId: string;
  readonly sourceId: string;
  readonly sourceVersionId: string;
  readonly artifactHash: string;
  readonly verificationRecordId: string;
  readonly verificationVersion: string;
  readonly currentnessDecisionId: string;
  readonly currentnessAsOf: string;
  readonly currentnessState: DerivedCurrentnessState;
  readonly readinessDecisionId: string;
  readonly readinessState: PublicationReadinessState;
  readonly scope: PublicationReleaseScope;
  readonly semanticIdentity: string;
  readonly semanticDigest: string;
  readonly provenanceDigest: string;
  readonly publicationPolicyVersion: PublicationPolicyVersion;
}

export interface PublicationManifestEntry extends PublicationCandidate {
  readonly manifestEntryId: string;
}

export interface PublicationManifest {
  readonly manifestId: string;
  readonly manifestVersion: string;
  readonly createdAt: string;
  readonly publicationPolicyVersion: PublicationPolicyVersion;
  readonly entries: readonly PublicationManifestEntry[];
  readonly entryCount: number;
  readonly manifestDigest: string;
  readonly previousManifestId?: string;
  readonly status: PublicationManifestStatus;
}

export interface CurriculumRelease {
  readonly releaseId: string;
  readonly releaseVersion: string;
  readonly releaseScope: PublicationReleaseScope;
  readonly manifestId: string;
  readonly manifestDigest: string;
  readonly publicationPolicyVersion: PublicationPolicyVersion;
  readonly createdAt: string;
  readonly sealedAt?: string;
  readonly activatedAt?: string;
  readonly status: CurriculumReleaseStatus;
  readonly previousReleaseId?: string;
}

export type PublicationWithdrawalReason =
  | 'SOURCE_SUPERSEDED'
  | 'CURRENTNESS_INVALIDATED'
  | 'VERIFICATION_REOPENED'
  | 'CLAIM_REJECTED'
  | 'PROVENANCE_INVALIDATED'
  | 'EDITORIAL_ERROR'
  | 'LEGAL_OR_POLICY_BLOCK'
  | 'DUPLICATE_CANONICAL_IDENTITY'
  | 'OTHER_REVIEW_REQUIRED';

export interface PublicationWithdrawalRecord {
  readonly withdrawalId: string;
  readonly targetReleaseId: string;
  readonly targetManifestEntryIds: readonly string[];
  readonly scope: PublicationReleaseScope;
  readonly reasonCode: PublicationWithdrawalReason;
  readonly reasonText?: string;
  readonly createdAt: string;
  readonly authorityReference: string;
  readonly replacementReleaseId?: string;
}

export interface PublicationSupersessionRecord {
  readonly supersessionId: string;
  readonly predecessorReleaseId: string;
  readonly successorReleaseId: string;
  readonly targetCanonicalIdentities: readonly string[];
  readonly scope: PublicationReleaseScope;
  readonly createdAt: string;
  readonly reason: string;
}

export type PublicationLifecycleEventType =
  | 'MANIFEST_CREATED' | 'MANIFEST_VALIDATED' | 'RELEASE_SEALED' | 'RELEASE_ACTIVATED'
  | 'RELEASE_SUPERSEDED' | 'ENTRY_WITHDRAWN' | 'RELEASE_WITHDRAWN' | 'VALIDATION_FAILED'
  | 'CURRENTNESS_REOPENED' | 'VERIFICATION_REOPENED';

export interface PublicationLifecycleEvent {
  readonly eventId: string;
  readonly eventType: PublicationLifecycleEventType;
  readonly releaseId?: string;
  readonly manifestId?: string;
  readonly createdAt: string;
  readonly authorityReference: string;
  readonly idempotencyKey: string;
}

export interface ActivePublishedCurriculumEntry {
  readonly publishedCurriculumId: string;
  readonly releaseId: string;
  readonly manifestId: string;
  readonly manifestEntryId: string;
  readonly canonicalIdentity: string;
  readonly scope: PublicationReleaseScope;
  readonly semanticIdentity: string;
  readonly semanticDigest: string;
  readonly sourceId: string;
  readonly sourceVersionId: string;
  readonly artifactHash: string;
  readonly publicationPolicyVersion: PublicationPolicyVersion;
  readonly effectivePublicationState: 'ACTIVE';
}
