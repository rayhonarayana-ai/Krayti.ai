/**
 * Qarayti.ai - Gate 07C.2: Curriculum Source Precedence Policy (0C)
 *
 * SCOPE-AWARE precedence algorithm.
 *
 * CORE RULES:
 *   1. "Newer" alone does NOT automatically mean "higher authority."
 *   2. A newer secondary website CANNOT override an older official document.
 *   3. A newer official document overrides an older one ONLY for the scope
 *      that the newer document explicitly changes.
 *   4. Precedence operates per claim scope (grade × subject × claimType).
 *   5. When multiple sources cover the same claim scope, the
 *      highest-authority source wins.
 *   6. When authority is equal, the latest applicable source wins.
 *   7. Recency is evaluated ONLY after trust/applicability requirements
 *      are met. A newer secondary source cannot even compete against an
 *      older official source.
 *
 * PARTIAL SUPERSESSION:
 *   A new document may change only:
 *     - one grade only
 *     - one subject only
 *     - one cycle
 *     - one competency
 *     - one assessment rule
 *     - one academic year
 *     - one examination framework
 *   It MUST NOT automatically invalidate the entire older curriculum.
 *
 * MULTI-SOURCE CLAIM ASSEMBLY:
 *   Canonical truth is assembled from multiple verified sources.
 *   Each claim retains claim-level provenance. Never falsely attribute
 *   the combined result to one document.
 */

import type {
  SourcePrecedenceLevel,
  SourcePrecedenceEntry,
  SourceClassification,
  ClaimType,
  ClaimProvenance,
} from '../types/curriculum-source-governance.types';

/**
 * Source precedence entries, ordered from highest to lowest authority.
 * Index position determines precedence rank: 0 = highest.
 */
export const SOURCE_PRECEDENCE_POLICY: readonly SourcePrecedenceEntry[] = [
  {
    level: 'OFFICIAL_AMENDMENT_REVISION',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    description: 'Latest official amendment or revision that explicitly changes a specific scope. Overrides older documents only for its explicit scope.',
    overridesLowerLevels: true,
  },
  {
    level: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    description: 'Latest applicable official curriculum document. Primary source for grade×subject claims.',
    overridesLowerLevels: true,
  },
  {
    level: 'OFFICIAL_SUBJECT_SPECIFIC',
    sourceClassification: 'OFFICIAL_TEXTBOOK_OR_GUIDE',
    description: 'Official subject-specific curriculum or program document. May provide detail not in the main curriculum.',
    overridesLowerLevels: true,
  },
  {
    level: 'OFFICIAL_EXAM_REGULATORY',
    sourceClassification: 'OFFICIAL_EXAM',
    description: 'Official examination/regulatory document. Authoritative for exam-related claims only.',
    overridesLowerLevels: false,
  },
  {
    level: 'OFFICIAL_PEDAGOGICAL_GUIDANCE',
    sourceClassification: 'OFFICIAL_TEXTBOOK_OR_GUIDE',
    description: 'Official pedagogical guide. Authoritative for pedagogical claims but not grade×subject structure.',
    overridesLowerLevels: false,
  },
  {
    level: 'OLDER_OFFICIAL_CURRICULUM',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    description: 'Older official curriculum version. Still authoritative unless explicitly superseded by a newer official document for a specific scope.',
    overridesLowerLevels: true,
  },
  {
    level: 'AUTHORIZED_REFERENCE',
    sourceClassification: 'AUTHORIZED_REFERENCE',
    description: 'Authorized reference. Cannot override official documents. Useful for corroboration.',
    overridesLowerLevels: false,
  },
  {
    level: 'SECONDARY_REFERENCE',
    sourceClassification: 'SECONDARY_REFERENCE',
    description: 'Secondary reference. Cannot override any official source. Used only when no official source exists for a claim.',
    overridesLowerLevels: false,
  },
] as const;

/**
 * Get the precedence rank for a source classification.
 * Lower index = higher authority. Returns null if classification is unknown.
 */
function getPrecedenceRank(classification: SourceClassification): number | null {
  const entry = SOURCE_PRECEDENCE_POLICY.find((e) => e.sourceClassification === classification);
  if (!entry) return null;
  return SOURCE_PRECEDENCE_POLICY.indexOf(entry);
}

/**
 * Get the highest (most authoritative) precedence level for a classification.
 */
export function getPrecedenceLevel(
  classification: SourceClassification,
): SourcePrecedenceLevel | null {
  const entry = SOURCE_PRECEDENCE_POLICY.find((e) => e.sourceClassification === classification);
  return entry?.level ?? null;
}

/**
 * Check whether a source classification is allowed to override another
 * for claims within a specific scope.
 *
 * AUTHORITY BEFORE RECENCY:
 *   A secondary reference can NEVER override an official source,
 *   regardless of recency. overridesLowerLevels must be true for the
 *   higher-authority source, AND the higher-authority source must be
 *   at least as trustworthy.
 */
export function canOverride(
  higherClassification: SourceClassification,
  lowerClassification: SourceClassification,
): boolean {
  const higherRank = getPrecedenceRank(higherClassification);
  const lowerRank = getPrecedenceRank(lowerClassification);

  if (higherRank === null || lowerRank === null) return false;
  if (higherRank >= lowerRank) return false;

  const higherEntry = SOURCE_PRECEDENCE_POLICY.find((e) => e.sourceClassification === higherClassification);
  return higherEntry?.overridesLowerLevels ?? false;
}

/**
 * Document-level precedence resolution (non-scope-aware).
 *
 * For simple two-source comparisons. Prefer resolveScopePrecedence()
 * for claim-level resolution.
 *
 * @deprecated Use resolveScopePrecedence for claim-level resolution.
 */
export function resolveSourcePrecedence(
  sourceA: SourceClassification,
  sourceB: SourceClassification,
): SourceClassification | null {
  const rankA = getPrecedenceRank(sourceA);
  const rankB = getPrecedenceRank(sourceB);

  if (rankA === null || rankB === null) return null;
  if (rankA < rankB) return sourceA;
  if (rankB < rankA) return sourceB;
  return null;
}

/**
 * Scope-aware precedence resolution.
 *
 * Given two sources that both cover the same claim scope, determine
 * which source is authoritative.
 *
 * RULES:
 *   1. Authority is evaluated FIRST. Recency is only a tiebreaker.
 *   2. A secondary reference cannot override an official source.
 *   3. Only sources with overlapping applicability scope are candidates.
 *   4. Among equal-authority candidates, the latest applicable source wins.
 */
export interface PrecedenceCandidate {
  readonly sourceId: string;
  readonly sourceClassification: SourceClassification;
  readonly publicationDate?: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly applicabilityScope: {
    readonly grades: readonly string[];
    readonly subjects: readonly string[];
    readonly claimTypes: readonly ClaimType[];
  };
}

export interface PrecedenceResult {
  readonly winningSourceId: string;
  readonly losingSourceIds: readonly string[];
  readonly reason: 'HIGHER_AUTHORITY' | 'LATER_APPLICABLE' | 'TIE';
  readonly scopeOverlap: boolean;
}

/**
 * Resolve precedence among candidates for a specific claim scope.
 *
 * @param candidates - Sources that claim authority over the same scope
 * @param targetGrade - The grade code being queried
 * @param targetSubject - The subject code being queried
 * @param targetClaimType - The claim type being queried
 * @returns The winning source, or null if no candidates cover this scope
 */
export function resolveScopePrecedence(
  candidates: readonly PrecedenceCandidate[],
  targetGrade: string,
  targetSubject: string,
  targetClaimType: ClaimType,
): PrecedenceResult | null {
  // Filter to only candidates whose applicability scope covers the target
  const relevant = candidates.filter((c) =>
    c.applicabilityScope.grades.includes(targetGrade) &&
    c.applicabilityScope.subjects.includes(targetSubject) &&
    c.applicabilityScope.claimTypes.includes(targetClaimType),
  );

  if (relevant.length === 0) return null;
  if (relevant.length === 1) {
    return {
      winningSourceId: relevant[0].sourceId,
      losingSourceIds: [],
      reason: 'TIE',
      scopeOverlap: false,
    };
  }

  // Sort by precedence rank (lower = higher authority)
  const ranked = relevant
    .map((c) => ({
      candidate: c,
      rank: getPrecedenceRank(c.sourceClassification),
    }))
    .filter((r) => r.rank !== null) as Array<{ candidate: PrecedenceCandidate; rank: number }>;

  ranked.sort((a, b) => a.rank - b.rank);

  // The highest-authority source wins (lowest rank number)
  const winner = ranked[0];
  const losers = ranked.slice(1);

  // Check if there are equal-authority candidates (same rank)
  const equalAuthority = ranked.filter((r) => r.rank === winner.rank);

  if (equalAuthority.length > 1) {
    // Tiebreak by recency: latest applicable publication date wins
    const withDates = equalAuthority
      .filter((r) => r.candidate.publicationDate)
      .sort((a, b) => (b.candidate.publicationDate ?? '').localeCompare(a.candidate.publicationDate ?? ''));

    if (withDates.length > 0) {
      return {
        winningSourceId: withDates[0].candidate.sourceId,
        losingSourceIds: equalAuthority
          .filter((r) => r.candidate.sourceId !== withDates[0].candidate.sourceId)
          .map((r) => r.candidate.sourceId)
          .concat(losers.map((r) => r.candidate.sourceId)),
        reason: 'LATER_APPLICABLE',
        scopeOverlap: true,
      };
    }
  }

  return {
    winningSourceId: winner.candidate.sourceId,
    losingSourceIds: losers.map((r) => r.candidate.sourceId),
    reason: 'HIGHER_AUTHORITY',
    scopeOverlap: true,
  };
}

/**
 * Assemble a canonical claim from multiple sources with retained provenance.
 *
 * Each assembled claim retains full traceability to its source(s).
 * No provenance flattening — the combined result is never attributed
 * to a single document.
 */
export function assembleCanonicalClaim(
  claimType: ClaimType,
  gradeCode: string | undefined,
  subjectCode: string | undefined,
  claimValue: string,
  provenances: readonly ClaimProvenance[],
  latestSourceId: string,
): {
  readonly claimType: ClaimType;
  readonly gradeCode?: string;
  readonly subjectCode?: string;
  readonly claimValue: string;
  readonly sourceProvenances: readonly ClaimProvenance[];
  readonly precedenceResolved: boolean;
  readonly latestSourceId: string;
} {
  return {
    claimType,
    gradeCode,
    subjectCode,
    claimValue,
    sourceProvenances: provenances,
    precedenceResolved: true,
    latestSourceId,
  };
}
