/**
 * Qarayti.ai — Validation System
 * Zod-backed data validation layer adhering to Domain Driven Design
 */

import { z, ZodSchema } from 'zod';
import { Result } from '../../domain/types/common.types';
import { ValidationError } from '../errors/app-error';

export class Validator {
  /**
   * Validates data against a Zod schema and returns a Result monad
   */
  public static validate<T>(schema: ZodSchema<T>, data: unknown): Result<T, ValidationError> {
    const parseResult = schema.safeParse(data);

    if (parseResult.success) {
      return Result.ok(parseResult.data);
    }

    const issues = parseResult.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    const formattedMessage = parseResult.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');

    return Result.err(new ValidationError(`Validation failed: ${formattedMessage}`, issues));
  }

  /**
   * Validates data and throws ValidationError if invalid
   */
  public static validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = this.validate(schema, data);
    if (result.ok === false) {
      throw result.error;
    }
    return result.value;
  }
}

// Re-export zod for easy schema definition across modules
export { z };
