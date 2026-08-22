/**
 * Qarayti.ai - Gate 07A: Curriculum Architecture Constants
 *
 * Structural registry values necessary to represent launch grade levels.
 * These are STRUCTURAL, not curriculum content.
 *
 * ALLOWED: stage definitions, grade structural codes, ordering
 * NOT ALLOWED: lesson lists, competencies, coefficients, exam rules
 */

import {
  EducationSystem,
  EducationStage,
  GradeLevel,
  CurriculumTrack,
  StageCode,
  GradeCode,
  CurriculumProvenance,
  PublicationStatus,
  ProvenanceType,
} from '../types/curriculum-architecture.types';

// ============================================================
// EDUCATION SYSTEMS (structural only)
// ============================================================

export const MOROCCO_EDUCATION_SYSTEM: EducationSystem = {
  id: 'esys-morocco',
  code: 'MOROCCO',
  countryTerritoryCode: 'MA',
  nameAr: 'النظام التعليمي المغربي',
  nameFr: 'Système Éducatif Marocain',
  status: 'PUBLISHED',
  provenance: 'OFFICIAL_SOURCE',
  isActive: true,
  createdAt: '2026-08-20T00:00:00Z',
};

export const LAUNCH_EDUCATION_SYSTEMS: EducationSystem[] = [
  MOROCCO_EDUCATION_SYSTEM,
];

// ============================================================
// EDUCATION STAGES (structural only)
// ============================================================

export const LAUNCH_STAGES: EducationStage[] = [
  {
    id: 'stage-primary',
    educationSystemId: 'esys-morocco',
    code: 'PRIMARY',
    nameAr: 'التعليم الابتدائي',
    nameFr: 'Enseignement Primaire',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'stage-middle',
    educationSystemId: 'esys-morocco',
    code: 'MIDDLE_SCHOOL',
    nameAr: 'التعليم الثانوي الإعدادي',
    nameFr: 'Enseignement Secondaire Collégial',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'stage-secondary',
    educationSystemId: 'esys-morocco',
    code: 'QUALIFYING_SECONDARY',
    nameAr: 'التعليم الثانوي التأهيلي',
    nameFr: 'Enseignement Secondaire Qualifiant',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-08-20T00:00:00Z',
  },
];

// Future-expansion stages (architecture-compatible, not active)
export const FUTURE_STAGES: EducationStage[] = [
  {
    id: 'stage-preschool',
    educationSystemId: 'esys-morocco',
    code: 'PRESCHOOL',
    nameAr: 'التعليم قبل المدرسي',
    nameFr: 'Enseignement Préscolaire',
    sortOrder: 0,
    isActive: false,
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'stage-cpge',
    educationSystemId: 'esys-morocco',
    code: 'CPGE',
    nameAr: 'المراكز الجامعية للتحضير',
    nameFr: 'Classes Préparatoires aux Grandes Écoles',
    sortOrder: 4,
    isActive: false,
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'stage-bts',
    educationSystemId: 'esys-morocco',
    code: 'BTS',
    nameAr: 'التعليم التقني',
    nameFr: 'Brevet de Technicien Supérieur',
    sortOrder: 5,
    isActive: false,
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'stage-vocational',
    educationSystemId: 'esys-morocco',
    code: 'VOCATIONAL',
    nameAr: 'التعليم المهني',
    nameFr: 'Enseignement Professionnel',
    sortOrder: 6,
    isActive: false,
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'stage-higher',
    educationSystemId: 'esys-morocco',
    code: 'HIGHER_EDUCATION',
    nameAr: 'التعليم العالي',
    nameFr: 'Enseignement Supérieur',
    sortOrder: 7,
    isActive: false,
    createdAt: '2026-08-20T00:00:00Z',
  },
];

// ============================================================
// GRADE LEVELS (structural only - launch grades)
// ============================================================

const stageId = (code: StageCode): string => {
  const found = LAUNCH_STAGES.find((s) => s.code === code);
  if (!found) throw new Error(`Stage not found: ${code}`);
  return found.id;
};

export const LAUNCH_GRADES: GradeLevel[] = [
  // Primary (P1-P6)
  { id: 'grade-p1', code: 'P1', stageId: stageId('PRIMARY'), sortOrder: 1, nameAr: 'الأولى ابتدائي', nameFr: '1ère Année Primaire', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-p2', code: 'P2', stageId: stageId('PRIMARY'), sortOrder: 2, nameAr: 'الثانية ابتدائي', nameFr: '2ème Année Primaire', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-p3', code: 'P3', stageId: stageId('PRIMARY'), sortOrder: 3, nameAr: 'الثالثة ابتدائي', nameFr: '3ème Année Primaire', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-p4', code: 'P4', stageId: stageId('PRIMARY'), sortOrder: 4, nameAr: 'الرابعة ابتدائي', nameFr: '4ème Année Primaire', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-p5', code: 'P5', stageId: stageId('PRIMARY'), sortOrder: 5, nameAr: 'الخامسة ابتدائي', nameFr: '5ème Année Primaire', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-p6', code: 'P6', stageId: stageId('PRIMARY'), sortOrder: 6, nameAr: 'السادسة ابتدائي', nameFr: '6ème Année Primaire', isActive: true, createdAt: '2026-08-20T00:00:00Z' },

  // Middle School (M1-M3)
  { id: 'grade-m1', code: 'M1', stageId: stageId('MIDDLE_SCHOOL'), sortOrder: 7, nameAr: 'الأولى إعدادي', nameFr: '1ère Année Collège', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-m2', code: 'M2', stageId: stageId('MIDDLE_SCHOOL'), sortOrder: 8, nameAr: 'الثانية إعدادي', nameFr: '2ème Année Collège', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-m3', code: 'M3', stageId: stageId('MIDDLE_SCHOOL'), sortOrder: 9, nameAr: 'الثالثة إعدادي', nameFr: '3ème Année Collège', isActive: true, createdAt: '2026-08-20T00:00:00Z' },

  // Qualifying Secondary (S1-S3)
  { id: 'grade-s1', code: 'S1', stageId: stageId('QUALIFYING_SECONDARY'), sortOrder: 10, nameAr: 'الجذع المشترك', nameFr: 'Tronc Commun', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-s2', code: 'S2', stageId: stageId('QUALIFYING_SECONDARY'), sortOrder: 11, nameAr: 'الأولى بكالوريا', nameFr: '1ère Année Bac', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
  { id: 'grade-s3', code: 'S3', stageId: stageId('QUALIFYING_SECONDARY'), sortOrder: 12, nameAr: 'الثانية بكالوريا', nameFr: '2ème Année Bac', isActive: true, createdAt: '2026-08-20T00:00:00Z' },
];

// ============================================================
// STRUCTURAL CONSTANTS
// ============================================================

export const ALL_ACTIVE_STAGES = LAUNCH_STAGES.filter((s) => s.isActive);
export const ALL_ACTIVE_GRADES = LAUNCH_GRADES.filter((g) => g.isActive);

export const PRIMARY_GRADE_CODES: GradeCode[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
export const MIDDLE_GRADE_CODES: GradeCode[] = ['M1', 'M2', 'M3'];
export const SECONDARY_GRADE_CODES: GradeCode[] = ['S1', 'S2', 'S3'];

// Default provenance for structurally-seeded data
export const STRUCTURAL_PROVENANCE: ProvenanceType = 'INTERNAL_CURATED';
export const STRUCTURAL_STATUS: PublicationStatus = 'VERIFIED';

// ============================================================
// EXAM TYPES (structural - do NOT fabricate exam rules)
// ============================================================

export const EXAM_TYPE_CODES = {
  CONTINUOUS_ASSESSMENT: 'CONTINUOUS_ASSESSMENT',
  LOCAL_EXAM: 'LOCAL_EXAM',
  REGIONAL_EXAM: 'REGIONAL_EXAM',
  NATIONAL_EXAM: 'NATIONAL_EXAM',
} as const;
