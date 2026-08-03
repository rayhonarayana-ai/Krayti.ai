/**
 * Qarayti.ai — Parent Context Builder
 * Constructs parent profile and child monitoring context
 */

import { FaheemParentProfile } from '../../../domain/types/faheem.types';
import { EducationLanguage } from '../../../domain/types/education.types';

export class ParentContextBuilder {
  private profile: Partial<FaheemParentProfile> = {
    preferredLanguage: EducationLanguage.ARABIC,
    childrenIds: [],
    notificationPreferences: { absences: true, grades: true, examAlerts: true },
  };

  public setParentId(id: string): this {
    this.profile.parentId = id;
    return this;
  }

  public setName(name: string): this {
    this.profile.fullName = name;
    return this;
  }

  public setChildren(ids: string[]): this {
    this.profile.childrenIds = ids;
    return this;
  }

  public setPreferredLanguage(lang: EducationLanguage): this {
    this.profile.preferredLanguage = lang;
    return this;
  }

  public build(): FaheemParentProfile {
    return {
      parentId: this.profile.parentId || 'par-001',
      fullName: this.profile.fullName || 'السيد رشيد العلمي (M. Rachid El Alami)',
      childrenIds: this.profile.childrenIds?.length ? this.profile.childrenIds : ['std-default-001'],
      preferredLanguage: this.profile.preferredLanguage || EducationLanguage.ARABIC,
      notificationPreferences: this.profile.notificationPreferences || {
        absences: true,
        grades: true,
        examAlerts: true,
      },
    };
  }
}
