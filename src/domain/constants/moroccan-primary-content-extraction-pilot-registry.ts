/**
 * Qarayti.ai - Gate 07C.7: Controlled Primary Curriculum Content
 * Extraction Foundation — Pilot Registry
 *
 * Implements a CONTROLLED extraction of a small, honest vertical slice from
 * the authenticated 2021 Moroccan primary curriculum artifact
 * (SHA-256 4FC71E9D...FAB0F), proving content can move safely through:
 *   PRIMARY ARTIFACT -> SOURCE-NATIVE STRUCTURE -> SOURCE CONTENT CLAIM
 *   -> PROVENANCE -> REVIEW STATE -> APPLICATION MAPPING
 *
 * PILOT (declared BEFORE extraction, §11-§13):
 *   - grade:              P1 (السنة الأولى)
 *   - source subject:     SRC_MATH (الرياضيات) — directly verified (07C.6.4, phys36/T03)
 *   - structural element: el-math-numbers (الأعداد والحساب, COMPONENT)
 *   - content structure:  مصفوفة المدى والتتابع (scope & sequence matrix)
 *   - physical pages:     332-335 (pdf-index 331-334, printed 334-337)
 *   - extraction method:  DIRECT_STRUCTURED_EXTRACTION (grid cells read from
 *                         digitally-clean text; ALL four pages are in the
 *                         artifact CLEAN digital set => DIRECT_DIGITAL, §14)
 *
 * SAFETY (§8-§10, §22-§25):
 *   - Source statements are NOT lessons/KOs/exercises; none are synthesized.
 *   - Content is EXTRACTED_UNVERIFIED / REVIEW_REQUIRED only. CONTENT_VERIFIED
 *     stays 0; PUBLISHED stays 0 (§3 content freeze).
 *   - Completeness is UNMEASURABLE because the content denominator is unknown
 *     for the whole program (§23); the pilot is a controlled slice, not a claim
 *     of full coverage.
 *   - Denominator state is FROZEN to 07C.6.3 (42/0/3/6/3).
 *   - Claims attach to the SOURCE-NATIVE structural identity FIRST (§18/§28);
 *     application mapping (MATH) is downstream metadata (§19).
 *   - Only minimal short source wording + normalized metadata + locator are
 *     committed (§26 copyright): no page dumps, no OCR dumps, no transcribed
 *     tables.
 */

import type {
  ContentClaimAttributionStatus,
  ContentClaimCategory,
  ContentClaimPilotDeclaration,
  ContentClaimLedger,
  ControlledContentExtractionVerdict,
  GateSourceTopic,
  SourceContentClaim,
  SourceContentClaimProvenance,
} from '../types/curriculum-source-governance.types';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
  DIRECT_EVIDENCE_SOURCE_ID,
  DIRECT_EVIDENCE_SOURCE_VERSION,
} from './moroccan-primary-direct-evidence-registry';

// ============================================================
// ARTIFACT BINDING — reuse the 07C.6.3/07C.6.4 authenticated binding
// ============================================================

export const CONTENT_EXTRACTION_ARTIFACT_SHA256 = DIRECT_EVIDENCE_ARTIFACT_SHA256;
export const CONTENT_EXTRACTION_SOURCE_ID = DIRECT_EVIDENCE_SOURCE_ID;
export const CONTENT_EXTRACTION_SOURCE_VERSION_ID = DIRECT_EVIDENCE_SOURCE_VERSION; // v1.0.0
export const CONTENT_EXTRACTION_EDUCATION_SYSTEM_CODE = 'MOROCCO';
export const CONTENT_EXTRACTION_STAGE_CODE = 'PRIMARY';

// ============================================================
// AUTHORITATIVE SOURCE-TOPIC -> PAGE-COORDINATE REGISTRY (P-group)
// ============================================================
// The ONE source of truth mapping each closed Gate-07C.7 source topic to its
// authorized matrix page triple. Claims select their sourceTopic explicitly;
// P03-P10 validate page provenance against this registry. NO claimId parsing,
// source-text matching, comments, or heuristics are ever used to derive page
// coordinates.
export interface SourceTopicPageCoordinates {
  readonly sourceTopic: GateSourceTopic;
  readonly scannedIndex: number;      // 0-based pdf/extraction index
  readonly physicalPage: number;      // scannedIndex + 1
  readonly printedPage: string;       // printed footer page
  readonly topicLabelAr: string;      // arabic topic label (non-content short name)
}

export const SOURCE_TOPIC_PAGE_REGISTRY: readonly SourceTopicPageCoordinates[] = [
  { sourceTopic: 'NUMBERS',              scannedIndex: 331, physicalPage: 332, printedPage: '334', topicLabelAr: 'الأعداد' },
  { sourceTopic: 'ADDITION_SUBTRACTION', scannedIndex: 332, physicalPage: 333, printedPage: '335', topicLabelAr: 'الجمع والطرح' },
  { sourceTopic: 'MULTIPLICATION',       scannedIndex: 333, physicalPage: 334, printedPage: '336', topicLabelAr: 'الضرب' },
  { sourceTopic: 'DIVISION',             scannedIndex: 334, physicalPage: 335, printedPage: '337', topicLabelAr: 'القسمة' },
];

// ============================================================
// PILOT DECLARATION (§11-§13) — recorded before extraction
// ============================================================

export const CONTENT_PILOT_DECLARATION: ContentClaimPilotDeclaration = {
  pilotId: '07C7-pilot-p1-math-numbers',
  gate: '07C.7',
  gradeCode: 'P1',
  sourceSubject: 'SRC_MATH',
  structuralElementId: 'el-math-numbers',
  structuralElementNameAr: 'الأعداد والحساب',
  extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
  extractionClass: 'DIRECT_DIGITAL',
  physicalPageRange: '332-335',
  printedPageRange: '334-337',
  scannedIndexRange: '331-334',
  expectedClaimCategories: ['OBJECTIVE', 'CONTENT_ELEMENT', 'ACTIVITY_TYPE', 'ASSESSMENT_GUIDANCE'],
  why:
    'MATHEMATICS is a directly verified source-native subject (SRC_MATH, phys36/T03). ' +
    'The scope-and-sequence matrix (مصفوفة المدى والتتابع) provides a per-grade column ' +
    'structure, so the P1 column under مجال الأعداد والحساب (el-math-numbers) is a clean, ' +
    'self-contained, single-grade vertical slice. All four pages are in the artifact CLEAN ' +
    'digital set (DIRECT_DIGITAL), so no OCR is required.',
  ocrState: 'NONE_REQUIRED — pages 332-335 are digitally clean (DIRECT_DIGITAL); no OCR used.',
};

// ============================================================
// PROVENANCE HELPER — DIRECT_DIGITAL pages (no OCR label)
// ============================================================

const P1_MATRIX = 'مصفوفة المدى والتتابع';

function matrixProvenance(physical: number, printed: string, cell: string, note: string): SourceContentClaimProvenance {
  return {
    physicalPage: physical,
    scannedIndex: physical - 1,
    printedPage: printed,
    blockLabel: `${P1_MATRIX} (printed ${printed}, phys ${physical})`,
    cellLabel: cell,
    rowColumnNote: note,
    extractionClass: 'DIRECT_DIGITAL',
  };
}

// ============================================================
// CONTROLLED EXTRACTION — P1 × SRC_MATH × el-math-numbers (§15-§17)
// ============================================================
// Each claim carries a stable claimId (E-group identity) and provenance.
// `contentStatus` = EXTRACTED_UNVERIFIED for clearly-attributed cells, or
// REVIEW_REQUIRED where the grid cell attribution merits human review.
// None reach CONTENT_VERIFIED (§3).

export const CONTENT_EXTRACTION_PILOT_CLAIMS: readonly SourceContentClaim[] = [
  // ---- مصفوفة المدى والتتابع — مجال الأعداد والحساب — الأعداد (phys 332, printed 334) ----
  {
    claimId: 'clm-p1-math-numbers-pre-numeral-activities',
    category: 'ACTIVITY_TYPE',
    sourceTopic: 'NUMBERS',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'أنشطة ما قبل عددية: التواصل حداً بحد؛ يوجد بقدر؛ التبديل...',
    normalizedValueAr: 'أنشطة ما قبل عددية للتعامل مع الأعداد قبل العد الرسمي.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(332, '334', 'الأعداد الصحيحة الطبيعية — P1',
      'P1 column cell under مجال الأعداد والحساب — أنشطة ما قبل عددية; read from the digitally-clean matrix text in reading order.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p1-math-numbers-natural-numbers-0-9',
    category: 'OBJECTIVE',
    sourceTopic: 'NUMBERS',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الأعداد الصحيحة الطبيعية: تمثيلاً، قراءة وكتابة (بالحروف وبالأرقام)، من 0 إلى 9، تفكيكاً، مقارنة وترتيباً',
    normalizedValueAr: 'إدراك وتمثيل وقراءة وكتابة الأعداد الصحيحة الطبيعية من 0 إلى 9، وتفكيكها ومقارنتها وترتيبها.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(332, '334', 'الأعداد الصحيحة الطبيعية — P1',
      'P1 column cell; the "من 0 إلى 9" range is the first column (السنة الأولى) in the grade progression.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p1-math-numbers-decimal-system',
    category: 'CONTENT_ELEMENT',
    sourceTopic: 'NUMBERS',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'نظمة العد العشري',
    normalizedValueAr: 'التعرف على نظامة العد العشري وترسيخه.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(332, '334', 'الأعداد الصحيحة الطبيعية — P1',
      'P1 column cell under الأعداد الصحيحة الطبيعية; noted in the same cell as the 0-9 objective.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },

  // ---- مصفوفة المدى والتتابع — مجال الأعداد والحساب — العمليات: الجمع (phys 333, printed 335) ----
  {
    claimId: 'clm-p1-math-numbers-add-concept',
    category: 'CONTENT_ELEMENT',
    sourceTopic: 'ADDITION_SUBTRACTION',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الجمع: مفهوم الجمع',
    normalizedValueAr: 'تحصيل مفهوم الجمع.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(333, '335', 'الحساب — الجمع — P1',
      'P1 column cell under الحساب — الجمع; read from the digitally-clean matrix text.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p1-math-numbers-add-additive-writing',
    category: 'CONTENT_ELEMENT',
    sourceTopic: 'ADDITION_SUBTRACTION',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الكتابة الجمعية (في إطار مجال الأعداد المقدمة)',
    normalizedValueAr: 'توظيف الكتابة الجمعية في إطار الأعداد المقدمة.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(333, '335', 'الحساب — الجمع — P1',
      'P1 column cell under الجمع; the phrase "في نطاق 0 إلى 99" appears in the adjacent حل وضعيات cell on the same column.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'MODERATE',
  },
  {
    claimId: 'clm-p1-math-numbers-add-usual-technique',
    category: 'METHODOLOGICAL_GUIDANCE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الجمع: التقنية الاعتيادية (بدون احتفاظ)',
    normalizedValueAr: 'استعمال التقنية الاعتيادية للجمع دون احتفاظ.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(333, '335', 'الحساب — الجمع — P1',
      'P1 column cell under الجمع — التقنية الاعتيادية (بدون احتفاظ).'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p1-math-numbers-add-solve-problems-0-99',
    category: 'ASSESSMENT_GUIDANCE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حل وضعيات مسائل بتوظيف جمع الأعداد الصحيحة الطبيعية (في نطاق 0 إلى 99)',
    normalizedValueAr: 'حل وضعيات مسائل بتوظيف جمع الأعداد الصحيحة الطبيعية في نطاق 0 إلى 99.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(333, '335', 'الحساب — الجمع — P1',
      'P1 column cell; the 0-99 range is the السنة الأولى column (seen on the same page footer band).'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'MODERATE',
  },

  // ---- مصفوفة المدى والتتابع — مجال الأعداد والحساب — العمليات: الطرح (phys 333, printed 335) ----
  {
    claimId: 'clm-p1-math-numbers-subtract-introduce',
    category: 'OBJECTIVE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'تقريب مفهوم الطرح انطلاقاً من أنشطة جمعية وغيرها',
    normalizedValueAr: 'تقريب مفهوم الطرح انطلاقاً من أنشطة جمعية وغيرها.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(333, '335', 'الحساب — الطرح — P1',
      'P1 column cell under الطرح.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p1-math-numbers-subtract-no-carry',
    category: 'OBJECTIVE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الطرح دون احتفاظ: التقنية الاعتيادية؛ حساب فرق عددين دون احتفاظ بتوظيف التقنية الاعتيادية',
    normalizedValueAr: 'حساب فرق عددين دون احتفاظ بتوظيف التقنية الاعتيادية.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(333, '335', 'الحساب — الطرح — P1',
      'P1 column cell under الطرح; two closely-related fragments read as one cell.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'MODERATE',
  },
  {
    claimId: 'clm-p1-math-numbers-subtract-solve-problems',
    category: 'ASSESSMENT_GUIDANCE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    attributionStatus: 'CLEAR_P1_ATTRIBUTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حل وضعيات مسائل بتوظيف الطرح',
    normalizedValueAr: 'حل وضعيات مسائل بتوظيف الطرح.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(333, '335', 'الحساب — الطرح — P1',
      'P1 column cell under الطرح.'),
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },

  // ---- مصفوفة المدى والتتابع — مجال الأعداد والحساب — العمليات: الضرب (phys 334, printed 336) ----
  {
    claimId: 'clm-p1-math-numbers-multiply-repeated-addition',
    category: 'OBJECTIVE',
    sourceTopic: 'MULTIPLICATION',
    attributionStatus: 'REVIEW_REQUIRED',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'تعرف الضرب: الجمع المتكرر، الكتابة الضربية',
    normalizedValueAr: 'تعرف الضرب من خلال الجمع المتكرر والكتابة الضربية.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(334, '336', 'الحساب — الضرب — P1',
      'Multiplication cells on this matrix page stop at y~320 (upper-grade band); a verified P1 (bottom) column cell below the topic label was not established. Marked REVIEW_REQUIRED.'),
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
  },
  {
    claimId: 'clm-p1-math-numbers-multiply-techniques',
    category: 'OBJECTIVE',
    sourceTopic: 'MULTIPLICATION',
    attributionStatus: 'REVIEW_REQUIRED',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الضرب دون احتفاظ، الضرب بالاحتفاظ: التقنية الاعتيادية؛ حساب جداء عددين صحيحين طبيعيين',
    normalizedValueAr: 'حساب جداء عددين صحيحين طبيعيين بتوظيف تقنيتي الضرب الاعتياديتين (بالاحتفاظ وبدونه).',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(334, '336', 'الحساب — الضرب — P1',
      'P1 (bottom) column cell under الضرب; recorded REVIEW_REQUIRED because the exact number-range attribution to P1 within the rotated grid merits human review.'),
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
  },
  {
    claimId: 'clm-p1-math-numbers-multiply-tables',
    category: 'CONTENT_ELEMENT',
    sourceTopic: 'MULTIPLICATION',
    attributionStatus: 'REVIEW_REQUIRED',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'جدول الضرب، وخاصيات 2,3,4,5,6,7,8,9',
    normalizedValueAr: 'جدول الضرب من 2 إلى 9 وخاصياته.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(334, '336', 'الحساب — الضرب — P1',
      'P1 (bottom) column cell under الضرب; recorded REVIEW_REQUIRED for the same rotated-grid attribution reason.'),
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
  },

  // ---- مصفوفة المدى والتتابع — مجال الأعداد والحساب — العمليات: القسمة (phys 335, printed 337) ----
  {
    claimId: 'clm-p1-math-numbers-divide-concept',
    category: 'OBJECTIVE',
    sourceTopic: 'DIVISION',
    attributionStatus: 'REVIEW_REQUIRED',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'تعرف مفهوم القسمة (التوزيع بالتساوي وغيرها)؛ استنتاج علاقة القسمة بالضرب',
    normalizedValueAr: 'تعرف مفهوم القسمة (مثل التوزيع بالتساوي) واستنتاج علاقة القسمة بالضرب.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(335, '337', 'الحساب — القسمة — P1',
      'Division cells on this matrix page sit in the upper-grade band (y~399-457), not a verified P1 (bottom) column cell; P1 attribution is NOT established. Marked REVIEW_REQUIRED.'),
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
  },
  {
    claimId: 'clm-p1-math-numbers-divide-2-digit-by-1-digit',
    category: 'OBJECTIVE',
    sourceTopic: 'DIVISION',
    attributionStatus: 'REVIEW_REQUIRED',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حساب خارج قسمة عدد مكون من رقمين على عدد مكون من رقم واحد، بتوظيف تقنيات وسيطية',
    normalizedValueAr: 'حساب خارج قسمة عدد مكوّن من رقمين على عدد مكوّن من رقم واحد بتقنيات وسيطية (الجمع أو الطرح المتكرر، المستقيم العددي).',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(335, '337', 'الحساب — القسمة — P1',
      'Division 2-digit by 1-digit techniques noted in the upper-grade band (y~399-457), not a verified P1 column cell; P1 attribution is NOT established. Marked REVIEW_REQUIRED.'),
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
  },
  {
    claimId: 'clm-p1-math-numbers-divide-solve-problems',
    category: 'ASSESSMENT_GUIDANCE',
    sourceTopic: 'DIVISION',
    attributionStatus: 'REVIEW_REQUIRED',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY', gradeCode: 'P1',
    structuralElementId: 'el-math-numbers', sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حل وضعية مشكلة بتوظيف القسمة',
    normalizedValueAr: 'حل وضعية مشكلة بتوظيف القسمة.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: matrixProvenance(335, '337', 'الحساب — القسمة — P1',
      'Division "solve problems" objective noted in the upper-grade band (y~399-457); P1 attribution is NOT established. Marked REVIEW_REQUIRED.'),
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
  },
];

// ============================================================
// DERIVED STATE COUNTS — computed from the ACTUAL claims (§24)
// ============================================================
// These are the single source of truth for all pilot claim-state counts that
// are reported in the ledger/tests. They are derived from
// `claim.attributionStatus` / `claim.contentStatus` / `claim.verificationState`
// — NOT from sourceTopic, claimId, wording, or hardcoded literals.

export const CONTENT_ATTRIBUTION_COUNTS = {
  clearP1Attribution: CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.attributionStatus === 'CLEAR_P1_ATTRIBUTION',
  ).length,
  reviewRequired: CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.attributionStatus === 'REVIEW_REQUIRED',
  ).length,
  rejected: CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.attributionStatus === 'REJECTED',
  ).length,
} as const;

export const CONTENT_STATE_COUNTS = {
  extractedUnverified: CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.contentStatus === 'EXTRACTED_UNVERIFIED',
  ).length,
  reviewRequired: CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.contentStatus === 'REVIEW_REQUIRED',
  ).length,
} as const;

export const CONTENT_VERIFICATION_COUNTS = {
  // REVIEW_REQUIRED is the only per-claim verification state that signals the
  // attribution review band; no claim reaches a "confirmed" verification state
  // in this pilot (VerificationState has no DIRECT_SOURCE_CONFIRMED member).
  reviewRequired: CONTENT_EXTRACTION_PILOT_CLAIMS.filter(
    (c) => c.verificationState === 'REVIEW_REQUIRED',
  ).length,
} as const;

// ============================================================
// STABLE CONTENT-CLAIM IDENTITY HELPER (§16 E-group)
// ============================================================
// A claim's stable identity derives from SEMANTIC SOURCE SCOPE (structural
// element + grade + category + normalized value + source version), NOT from
// page number or wording. Page is provenance, not identity.

export function contentClaimStableKey(c: {
  readonly structuralElementId: string;
  readonly gradeCode: string;
  readonly category: ContentClaimCategory;
  readonly normalizedValueAr: string;
  readonly sourceVersionId: string;
}): string {
  const norm = c.normalizedValueAr.trim().replace(/\s+/g, ' ');
  return `[${c.structuralElementId}|${c.gradeCode}|${c.category}|${norm}|${c.sourceVersionId}]`;
}

export function contentClaimId(c: {
  readonly structuralElementId: string;
  readonly gradeCode: string;
  readonly category: ContentClaimCategory;
  readonly normalizedValueAr: string;
  readonly sourceVersionId: string;
}): string {
  // deterministic, whitespace-normalized semantic identity
  return `clm-${c.gradeCode.toLowerCase()}-${contentClaimStableKey(c).replace(/[^\w\u0600-\u06FF]+/g, '-')}`;
}

// ============================================================
// LEDGER — safety counters (§24)
// ============================================================

export const CONTENT_EXTRACTION_PILOT_LEDGER: ContentClaimLedger = {
  pilotId: CONTENT_PILOT_DECLARATION.pilotId,
  claims: CONTENT_EXTRACTION_PILOT_CLAIMS,
  claimCount: CONTENT_EXTRACTION_PILOT_CLAIMS.length,
  clearP1AttributionCount: CONTENT_ATTRIBUTION_COUNTS.clearP1Attribution,
  reviewRequiredAttributionCount: CONTENT_ATTRIBUTION_COUNTS.reviewRequired,
  rejectedAttributionCount: CONTENT_ATTRIBUTION_COUNTS.rejected,
  extractedUnverifiedCount: CONTENT_STATE_COUNTS.extractedUnverified,
  reviewRequiredContentCount: CONTENT_STATE_COUNTS.reviewRequired,
  // No claim is direct-source-confirmed in this pilot: DIRECT_SOURCE_CONFIRMED
  // is not a member of the closed VerificationState type, so this is a Gate
  // freeze (0 unless separately proven), exactly like contentVerifiedCount.
  directSourceConfirmedCount: 0,
  contentVerifiedCount: 0,
  publishedCount: 0,
  contentDenominatorKnown: false,
  completenessStatus: 'UNMEASURABLE',
  syntheticLessons: 0,
  syntheticKnowledgeObjects: 0,
  syntheticExercises: 0,
};

// ============================================================
// GATE 07C.7 VERDICT
// ============================================================

export const CONTROLLED_CONTENT_EXTRACTION_VERDICT: ControlledContentExtractionVerdict = {
  gate: '07C.7',
  pilotId: CONTENT_PILOT_DECLARATION.pilotId,
  claimCount: CONTENT_EXTRACTION_PILOT_CLAIMS.length,
  contentVerified: 0,
  published: 0,
  structureCompleteVerified: 0,
  masteryDerived: false,
  sourceNativeFirst: true,
  applicationMappingIsSecondary: true,
  exactlyOneGrade: true,
  exactlyOneSubject: true,
  noSyntheticUnitsLessonsKOsOrExercises: true,
  completenessUnmeasurable: true,
  denominatorFrozenVerbatim: true,
  recommendation: 'PASS',
};
