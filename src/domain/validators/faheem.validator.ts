/**
 * Qarayti.ai — Faheem AI Engine Input & Domain Validators
 * Strict validation routines ensuring input integrity and safety constraints
 */

import { z } from 'zod';
import { ProcessFaheemQueryDTO, FaheemRoleContext } from '../types/faheem.types';
import { EducationLanguage } from '../types/education.types';

export const ProcessFaheemQuerySchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string().min(1, 'userId is required'),
  query: z.string().min(1, 'Query cannot be empty').max(4000, 'Query exceeds maximum length of 4000 characters'),
  role: z.enum(['student', 'parent', 'teacher', 'school_admin', 'curriculum'] as const),
  language: z.enum(['ar', 'fr', 'ary', 'en', 'zgh'] as const).optional(),
  studentId: z.string().optional(),
  schoolId: z.string().optional(),
  customContext: z.record(z.string(), z.unknown()).optional(),
  enableTools: z.boolean().optional(),
});

export class FaheemValidator {
  public static validateQueryInput(dto: ProcessFaheemQueryDTO): { valid: boolean; errors: string[] } {
    const result = ProcessFaheemQuerySchema.safeParse(dto);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      };
    }

    // Additional custom checks
    const queryTrimmed = dto.query.trim();
    if (queryTrimmed.length === 0) {
      return { valid: false, errors: ['Query contains only whitespace'] };
    }

    return { valid: true, errors: [] };
  }

  public static sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  public static isValidLanguage(lang: string): boolean {
    return Object.values(EducationLanguage).includes(lang as EducationLanguage);
  }

  public static isValidRole(role: string): boolean {
    return ['student', 'parent', 'teacher', 'school_admin', 'curriculum'].includes(role);
  }
}
