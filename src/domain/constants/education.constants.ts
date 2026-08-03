/**
 * Qarayti.ai — Moroccan Education System Constants
 * Official Ministry of National Education (MEN) Metadata Framework
 */

import { EducationLevel, HighSchoolTrack, Subject, ExamType } from '../types/education.types';

export const MOROCCAN_GRADING_SCALE = {
  MIN_SCORE: 0,
  MAX_SCORE: 20,
  PASSING_SCORE: 10,
  EXCELLENCE_THRESHOLD: 16,
  VERY_GOOD_THRESHOLD: 14,
  GOOD_THRESHOLD: 12,
  FAIR_THRESHOLD: 10,
};

export const MOROCCAN_EDUCATION_LEVELS_METADATA = [
  {
    code: EducationLevel.PRIMARY,
    nameAr: 'التعليم الابتدائي',
    nameFr: 'Enseignement Primaire',
    yearsCount: 6,
    grades: ['1AP', '2AP', '3AP', '4AP', '5AP', '6AP'],
    keyExam: 'الامتحان الموحد الإقليمي لنييل شهادة الدروس الابتدائية (6AP)',
  },
  {
    code: EducationLevel.MIDDLE_SCHOOL,
    nameAr: 'التعليم الثانوي الإعدادي',
    nameFr: 'Enseignement Secondaire Collégial',
    yearsCount: 3,
    grades: ['1AC', '2AC', '3AC'],
    keyExam: 'الامتحان الجهوي الموحد لنيل شهادة السلك الإعدادي (3AC)',
  },
  {
    code: EducationLevel.HIGH_SCHOOL,
    nameAr: 'التعليم الثانوي التأهيلي',
    nameFr: 'Enseignement Secondaire Qualifiant',
    yearsCount: 3,
    grades: ['Tronc Commun', '1ère Année Bac (1BAC)', '2ème Année Bac (2BAC)'],
    keyExam: 'الامتحان الجهوي الموحد (1BAC) والامتحان الوطني الموحد للبكالوريا (2BAC)',
  },
];

export const MOROCCAN_SUBJECTS_CATALOG: Subject[] = [
  { id: 'subj-math', code: 'MATH', nameAr: 'الرياضيات', nameFr: 'Mathématiques', coefficient: 7, level: EducationLevel.HIGH_SCHOOL, track: HighSchoolTrack.MATHEMATICS_A },
  { id: 'subj-phys', code: 'PHYS', nameAr: 'العلوم الفيزيائية', nameFr: 'Physique-Chimie', coefficient: 7, level: EducationLevel.HIGH_SCHOOL, track: HighSchoolTrack.PHYSICS_CHEMISTRY },
  { id: 'subj-svt', code: 'SVT', nameAr: 'علوم الحياة والأرض', nameFr: 'Sciences de la Vie et de la Terre', coefficient: 7, level: EducationLevel.HIGH_SCHOOL, track: HighSchoolTrack.LIFE_EARTH_SCIENCES },
  { id: 'subj-ar', code: 'ARABIC', nameAr: 'اللغة العربية', nameFr: 'Langue Arabe', coefficient: 4, level: EducationLevel.HIGH_SCHOOL, track: HighSchoolTrack.ARTS_HUMANITIES },
  { id: 'subj-fr', code: 'FRENCH', nameAr: 'اللغة الفرنسية', nameFr: 'Langue Française', coefficient: 4, level: EducationLevel.HIGH_SCHOOL },
  { id: 'subj-eng', code: 'ENGLISH', nameAr: 'اللغة الإنجليزية', nameFr: 'Langue Anglaise', coefficient: 3, level: EducationLevel.HIGH_SCHOOL },
  { id: 'subj-phil', code: 'PHILOSOPHY', nameAr: 'الفلسفة', nameFr: 'Philosophie', coefficient: 2, level: EducationLevel.HIGH_SCHOOL },
  { id: 'subj-isl', code: 'ISLAMIC_ED', nameAr: 'التربية الإسلامية', nameFr: 'Éducation Islamique', coefficient: 2, level: EducationLevel.HIGH_SCHOOL },
  { id: 'subj-hist', code: 'HIST_GEO', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géographie', coefficient: 4, level: EducationLevel.HIGH_SCHOOL, track: HighSchoolTrack.ARTS_HUMANITIES },
];

export const BAC_EXAM_WEIGHTS = {
  [ExamType.CONTINUOUS_ASSESSMENT]: { percentage: 25, labelAr: 'المراقبة المستمرة (25%)' },
  [ExamType.REGIONAL_EXAM]: { percentage: 25, labelAr: 'الامتحان الجهوي (25%)' },
  [ExamType.NATIONAL_EXAM]: { percentage: 50, labelAr: 'الامتحان الوطني (50%)' },
};
