/**
 * Qarayti.ai — Student Context Builder
 * Constructs student profile, track, grades, and weakness area context
 */

import { FaheemStudentProfile } from '../../../domain/types/faheem.types';
import { EducationLevel, HighSchoolTrack, EducationLanguage } from '../../../domain/types/education.types';

export class StudentContextBuilder {
  private profile: Partial<FaheemStudentProfile> = {
    preferredLanguage: EducationLanguage.ARABIC,
    overallAverageScore: 14.5,
    weakSubjectCodes: [],
    strongSubjectCodes: [],
    isPrivateSchool: false,
  };

  public setStudentId(id: string): this {
    this.profile.studentId = id;
    return this;
  }

  public setName(name: string): this {
    this.profile.fullName = name;
    return this;
  }

  public setGradeLevel(level: EducationLevel): this {
    this.profile.gradeLevel = level;
    return this;
  }

  public setTrack(track: HighSchoolTrack): this {
    this.profile.track = track;
    return this;
  }

  public setMassarId(massarId: string): this {
    this.profile.massarId = massarId;
    return this;
  }

  public setPreferredLanguage(lang: EducationLanguage): this {
    this.profile.preferredLanguage = lang;
    return this;
  }

  public setAverageScore(score: number): this {
    this.profile.overallAverageScore = Math.max(0, Math.min(20, score));
    return this;
  }

  public setWeakSubjects(subjects: string[]): this {
    this.profile.weakSubjectCodes = subjects;
    return this;
  }

  public setStrongSubjects(subjects: string[]): this {
    this.profile.strongSubjectCodes = subjects;
    return this;
  }

  public setSchoolInfo(schoolId: string, schoolName: string, isPrivate: boolean): this {
    this.profile.schoolId = schoolId;
    this.profile.schoolName = schoolName;
    this.profile.isPrivateSchool = isPrivate;
    return this;
  }

  public build(): FaheemStudentProfile {
    return {
      studentId: this.profile.studentId || 'std-default-001',
      fullName: this.profile.fullName || 'أحمد العلمي (Youssef El Alami)',
      gradeLevel: this.profile.gradeLevel || EducationLevel.HIGH_SCHOOL,
      track: this.profile.track || HighSchoolTrack.MATHEMATICS_A,
      massarId: this.profile.massarId || 'M134567890',
      preferredLanguage: this.profile.preferredLanguage || EducationLanguage.ARABIC,
      overallAverageScore: this.profile.overallAverageScore ?? 15.2,
      weakSubjectCodes: this.profile.weakSubjectCodes || ['PHYS_CHEM', 'SVT'],
      strongSubjectCodes: this.profile.strongSubjectCodes || ['MATH', 'PHILOSOPHY'],
      schoolId: this.profile.schoolId || 'sch-001',
      schoolName: this.profile.schoolName || 'Lycée Moulay Youssef (Rabat)',
      isPrivateSchool: this.profile.isPrivateSchool ?? false,
    };
  }
}
