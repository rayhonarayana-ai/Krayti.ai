/**
 * Qarayti.ai — Teacher Context Builder
 * Constructs teacher profile, classes taught, and MEN subjects context
 */

import { FaheemTeacherProfile } from '../../../domain/types/faheem.types';
import { EducationLanguage } from '../../../domain/types/education.types';

export class TeacherContextBuilder {
  private profile: Partial<FaheemTeacherProfile> = {
    preferredLanguage: EducationLanguage.FRENCH,
    subjectsTaught: ['Mathematics', 'Physics-Chemistry'],
    classesTaught: ['2BAC-MathA', '1BAC-Physique'],
  };

  public setTeacherId(id: string): this {
    this.profile.teacherId = id;
    return this;
  }

  public setName(name: string): this {
    this.profile.fullName = name;
    return this;
  }

  public setSubjects(subjects: string[]): this {
    this.profile.subjectsTaught = subjects;
    return this;
  }

  public setClasses(classes: string[]): this {
    this.profile.classesTaught = classes;
    return this;
  }

  public build(): FaheemTeacherProfile {
    return {
      teacherId: this.profile.teacherId || 'tch-001',
      fullName: this.profile.fullName || 'Prof. Mohamed Alami',
      subjectsTaught: this.profile.subjectsTaught || ['Mathematics'],
      classesTaught: this.profile.classesTaught || ['2BAC Science Math A'],
      schoolId: this.profile.schoolId || 'sch-001',
      preferredLanguage: this.profile.preferredLanguage || EducationLanguage.FRENCH,
    };
  }
}
