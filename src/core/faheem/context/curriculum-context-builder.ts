/**
 * Qarayti.ai — Curriculum Context Builder
 * Constructs official MEN curriculum units, competencies, and exam weighting
 */

import { FaheemCurriculumUnit } from '../../../domain/types/faheem.types';
import { EducationLevel, HighSchoolTrack, ExamType } from '../../../domain/types/education.types';

export class CurriculumContextBuilder {
  public static getMoroccanCurriculumUnits(track: HighSchoolTrack = HighSchoolTrack.MATHEMATICS_A): FaheemCurriculumUnit[] {
    return [
      {
        code: 'MATH-2BAC-COMPLEX',
        subjectCode: 'MATH',
        titleAr: 'الأعداد العقدية (Nombres Complexes)',
        titleFr: 'Nombres Complexes - Partie 1 et 2',
        level: EducationLevel.HIGH_SCHOOL,
        track,
        competencies: ['Représentation géométrique', 'Forme trigonométrique', 'Résolution d\'équations dans C', 'Transformations du plan'],
        examWeighting: ExamType.NATIONAL_EXAM,
      },
      {
        code: 'MATH-2BAC-ANALYSIS',
        subjectCode: 'MATH',
        titleAr: 'التحليل والحساب التكاملي (Analyse et Calcul Intégral)',
        titleFr: 'Limites, Continuité, Dérivabilité et Intégration',
        level: EducationLevel.HIGH_SCHOOL,
        track,
        competencies: ['Étude de fonctions exponentielles et logarithmiques', 'Calcul de surfaces et volumes par intégrales', 'Équations différentielles'],
        examWeighting: ExamType.NATIONAL_EXAM,
      },
      {
        code: 'PHYS-2BAC-WAVES',
        subjectCode: 'PHYS_CHEM',
        titleAr: 'الفيزياء: الموجات الميكانيكية والضوئية',
        titleFr: 'Ondes mécaniques progressives et Ondes lumineuses',
        level: EducationLevel.HIGH_SCHOOL,
        track,
        competencies: ['Diffraction de la lumière', 'Calcul de célérité et longueur d\'onde'],
        examWeighting: ExamType.NATIONAL_EXAM,
      },
      {
        code: 'SVT-2BAC-GENETICS',
        subjectCode: 'SVT',
        titleAr: 'علوم الحياة والأرض: الخبر الوراثي والهندسة الوراثية',
        titleFr: 'L\'information génétique et Génie génétique',
        level: EducationLevel.HIGH_SCHOOL,
        track,
        competencies: ['Mitose et Méiose', 'Synthèse des protéines', 'Arbres généalogiques et génétique humaine'],
        examWeighting: ExamType.NATIONAL_EXAM,
      },
    ];
  }
}
