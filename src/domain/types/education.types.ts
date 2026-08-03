/**
 * Qarayti.ai — Moroccan Education Domain Types
 * Precise domain representation for the Moroccan Educational System
 */

export enum EducationLevel {
  PRIMARY = 'PRIMARY',             // الابتدائي (Elementary 1-6)
  MIDDLE_SCHOOL = 'MIDDLE_SCHOOL', // الإعدادي (College 1-3)
  HIGH_SCHOOL = 'HIGH_SCHOOL',     // التأهيلي (Lycée 1-3: Common Core, 1BAC, 2BAC)
}

export enum HighSchoolTrack {
  COMMON_CORE_ARTS = 'TC_LSH',         // الجذع المشترك الأدبي والتعليم الأصيل
  COMMON_CORE_SCIENCE = 'TC_SCI',      // الجذع المشترك العلمي
  COMMON_CORE_TECH = 'TC_TECH',        // الجذع المشترك التكنولوجي
  COMMON_CORE_ORIGINAL = 'TC_ORIGINAL',// الجذع المشترك للتعليم الأصيل

  ARTS_HUMANITIES = 'ARTS_HUM',        // آداب وعلوم إنسانية
  PHYSICS_CHEMISTRY = 'PHYS_CHEM',     // علوم فيزيائية
  LIFE_EARTH_SCIENCES = 'LIFE_EARTH',  // علوم الحياة والأرض
  MATHEMATICS_A = 'MATH_A',            // علوم رياضية أ
  MATHEMATICS_B = 'MATH_B',            // علوم رياضية ب
  ECONOMIC_SCIENCES = 'ECONOMICS',     // علوم اقتصادية وتدبير
  TECHNICAL_MECHANICAL = 'TECH_MECH',  // علوم وتكنولوجيات ميكانيكية
  TECHNICAL_ELECTRICAL = 'TECH_ELEC',  // علوم وتكنولوجيات كهربائية
  ORIGINAL_ISLAMIC = 'ORIGINAL_ISL',   // علوم شرعية
}

export enum EducationLanguage {
  ARABIC = 'ar',
  FRENCH = 'fr',
  DARIJA = 'ary', // Moroccan Arabic / Darija for explanations
  ENGLISH = 'en',
  AMAZIGH = 'zgh',
}

export enum ExamType {
  CONTINUOUS_ASSESSMENT = 'CONTINUOUS_ASSESSMENT', // المراقبة المستمرة
  LOCAL_EXAM = 'LOCAL_EXAM',                       // الامتحان المحلي (6ème Primaire / 3ème Collège)
  REGIONAL_EXAM = 'REGIONAL_EXAM',                 // الامتحان الجهوي (1BAC)
  NATIONAL_EXAM = 'NATIONAL_EXAM',                 // الامتحان الوطني (2BAC - البكالوريا)
}

export interface Subject {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
  coefficient: number;
  level: EducationLevel;
  track?: HighSchoolTrack;
  isOptionLanguage?: boolean;
}

export interface AcademicGrade {
  score: number; // 0 to 20 scale in Morocco
  maxScore: number; // usually 20
  coefficient: number;
  subjectId: string;
  examType: ExamType;
  date: Date;
}
