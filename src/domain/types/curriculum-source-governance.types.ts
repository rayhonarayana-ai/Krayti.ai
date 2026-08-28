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
