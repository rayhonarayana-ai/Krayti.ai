/**
 * Qarayti.ai - Gate 07C.4: Moroccan Primary Curriculum Extraction Manifest
 *
 * Source-derived structural inventory for the 2021 Primary Curriculum.
 * Denominator comes from actual artifact structure, not invented counts.
 */

import type {
  ExtractionGap,
  GradeExtractionEntry,
  SubjectExtractionEntry,
  StructuralExtractionMetrics,
} from '../types/curriculum-source-governance.types';

import {
  STRUCTURAL_ELEMENTS,
  STRUCTURAL_EXTRACTION_METRICS,
  GRADE_EXTRACTION_ENTRIES,
  SUBJECT_EXTRACTION_ENTRIES,
  EXTRACTION_GAPS,
} from './moroccan-primary-structural-extraction';

// ── EXTRACTION MANIFEST ──────────────────────────────────────

export const EXTRACTION_MANIFEST = {
  sourceId: 'src-primary-curriculum-2021',
  sourceVersionId: 'v1.0.0',
  stageCode: 'PRIMARY' as const,
  expectedGrades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  expectedSubjects: [
    'ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'ISLAMIC_EDUCATION',
    'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC',
  ],
  discoveredSections: 2,
  discoveredStructuralBlocks: 3,
  extractionStatus: 'PARTIALLY_EXTRACTED' as const,
  denominatorConfidence: 'UNKNOWN' as const,
  notes: 'Document structure mapped at document-part, domain, subject, and grade-section levels. Detailed unit/lesson structure not yet extracted.',
} as const;

// ── SUMMARY ──────────────────────────────────────────────────

export const MANIFEST_SUMMARY = {
  totalStructuralElements: STRUCTURAL_ELEMENTS.length,
  totalGaps: EXTRACTION_GAPS.length,
  openGaps: EXTRACTION_GAPS.filter((g) => g.status === 'OPEN').length,
  deferredGaps: EXTRACTION_GAPS.filter((g) => g.status === 'DEFERRED').length,
  gradesFullyExtracted: GRADE_EXTRACTION_ENTRIES.filter((g) => g.status === 'STRUCTURE_EXTRACTED').length,
  gradesTotal: GRADE_EXTRACTION_ENTRIES.length,
  completenessNote: 'Denominator unknown for all cells. CompletenessRatio undefined. STRUCTURE_EXTRACTED means grade-level structure is mapped, not that all content is extracted.',
} as const;
