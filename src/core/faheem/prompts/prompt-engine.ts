/**
 * Qarayti.ai — Faheem AI Prompt Engine
 * Constructs, formats, and optimizes prompts with multi-context injection
 */

import { FaheemContext } from '../../../domain/types/faheem.types';
import { FaheemPromptTemplates, PromptTemplateContext } from './templates';
import { logger } from '../../logging/logger';

export class FaheemPromptEngine {
  public static buildSystemPrompt(context: FaheemContext): string {
    const templateCtx: PromptTemplateContext = {
      role: context.role,
      language: context.language,
      studentName: context.student?.fullName,
      gradeLevel: context.student?.gradeLevel,
      track: context.student?.track,
      weakSubjects: context.student?.weakSubjectCodes,
      recentScoreAverage: context.student?.overallAverageScore,
      schoolName: context.school?.schoolName,
      isPrivate: context.school?.isPrivate,
    };

    let baseInstruction = FaheemPromptTemplates.getSystemInstruction(templateCtx);

    if (context.systemInstruction) {
      baseInstruction += `\n\nSPECIFIC SESSION INSTRUCTIONS:\n${context.systemInstruction}`;
    }

    if (context.adaptive) {
      baseInstruction += `\n\nADAPTIVE LEARNING ENGINE STATE:\n- IRT Mastery Level: ${(context.adaptive.currentMasteryLevel * 100).toFixed(1)}%\n- Recommended Difficulty: ${context.adaptive.recommendedDifficulty}\n- Weak Topics: ${context.adaptive.weakTopics.join(', ')}`;
    }

    logger.debug('FaheemPromptEngine', `Compiled system prompt for role [${context.role}], language [${context.language}]`);
    return baseInstruction;
  }

  public static optimizeUserQuery(query: string): string {
    // Sanitize and trim
    const clean = query.trim();
    return clean;
  }
}
