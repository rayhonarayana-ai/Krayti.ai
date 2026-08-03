/**
 * Qarayti.ai — School Context Builder
 * Constructs school tenant profile, region (AREF), and administrative metadata
 */

import { FaheemSchoolProfile } from '../../../domain/types/faheem.types';

export class SchoolContextBuilder {
  private profile: Partial<FaheemSchoolProfile> = {
    schoolId: 'sch-001',
    schoolName: 'Lycée Moulay Youssef',
    region: 'Rabat-Salé-Kénitra (AREF RSK)',
    isPrivate: false,
    city: 'Rabat',
    studentCount: 1250,
  };

  public setSchool(id: string, name: string, region: string, city: string, isPrivate: boolean, count: number): this {
    this.profile = { schoolId: id, schoolName: name, region, city, isPrivate, studentCount: count };
    return this;
  }

  public build(): FaheemSchoolProfile {
    return {
      schoolId: this.profile.schoolId || 'sch-001',
      schoolName: this.profile.schoolName || 'Lycée Moulay Youssef',
      region: this.profile.region || 'Rabat-Salé-Kénitra',
      isPrivate: this.profile.isPrivate ?? false,
      city: this.profile.city || 'Rabat',
      studentCount: this.profile.studentCount || 1200,
    };
  }
}
