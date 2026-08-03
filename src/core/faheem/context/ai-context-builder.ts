/**
 * Qarayti.ai — AI Context Builder (Master Orchestrator)
 * Aggregates all role and subsystem context streams into a unified FaheemContext
 */

import { FaheemContext, FaheemRoleContext } from '../../../domain/types/faheem.types';
import { EducationLanguage, EducationLevel, HighSchoolTrack } from '../../../domain/types/education.types';
import { StudentContextBuilder } from './student-context-builder';
import { ParentContextBuilder } from './parent-context-builder';
import { TeacherContextBuilder } from './teacher-context-builder';
import { SchoolContextBuilder } from './school-context-builder';
import { CurriculumContextBuilder } from './curriculum-context-builder';
import { AdaptiveContextBuilder } from './adaptive-context-builder';
import { logger } from '../../logging/logger';

export class AIContextBuilder {
  private context: FaheemContext;

  constructor(role: FaheemRoleContext, language: EducationLanguage = EducationLanguage.ARABIC) {
    this.context = {
      role,
      language,
    };
  }

  public withStudent(studentId?: string, track: HighSchoolTrack = HighSchoolTrack.MATHEMATICS_A): this {
    const builder = new StudentContextBuilder();
    if (studentId) builder.setStudentId(studentId);
    builder.setTrack(track);
    this.context.student = builder.build();
    return this;
  }

  public withParent(parentId?: string): this {
    const builder = new ParentContextBuilder();
    if (parentId) builder.setParentId(parentId);
    this.context.parent = builder.build();
    return this;
  }

  public withTeacher(teacherId?: string): this {
    const builder = new TeacherContextBuilder();
    if (teacherId) builder.setTeacherId(teacherId);
    this.context.teacher = builder.build();
    return this;
  }

  public withSchool(schoolId?: string): this {
    const builder = new SchoolContextBuilder();
    if (schoolId) builder.setSchool(schoolId, 'Lycée Moulay Youssef', 'Rabat-Salé-Kénitra', 'Rabat', false, 1200);
    this.context.school = builder.build();
    return this;
  }

  public withCurriculum(track: HighSchoolTrack = HighSchoolTrack.MATHEMATICS_A): this {
    this.context.curriculum = CurriculumContextBuilder.getMoroccanCurriculumUnits(track);
    return this;
  }

  public withAdaptiveState(): this {
    const builder = new AdaptiveContextBuilder();
    this.context.adaptive = builder.build();
    return this;
  }

  public withSystemInstruction(instruction: string): this {
    this.context.systemInstruction = instruction;
    return this;
  }

  public build(): FaheemContext {
    // Fill default nested contexts based on role if missing
    if (this.context.role === 'student' && !this.context.student) {
      this.withStudent();
    }
    if (this.context.role === 'parent' && !this.context.parent) {
      this.withParent();
    }
    if (this.context.role === 'teacher' && !this.context.teacher) {
      this.withTeacher();
    }
    if (!this.context.school) {
      this.withSchool();
    }
    if (!this.context.curriculum) {
      this.withCurriculum(this.context.student?.track || HighSchoolTrack.MATHEMATICS_A);
    }
    if (!this.context.adaptive) {
      this.withAdaptiveState();
    }

    logger.debug('AIContextBuilder', `Constructed context for role [${this.context.role}] with language [${this.context.language}]`);
    return this.context;
  }
}
