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
      const state = context.adaptive;
      if (state.evidenceState === 'NO_EVIDENCE' || state.currentMasteryLevel === null) {
        baseInstruction += `\n\nADAPTIVE LEARNING ENGINE STATE:\n- Evidence State: NO_EVIDENCE (Student has 0 recorded learning observations. Do not assume or invent mastery or weakness.)`;
      } else if (state.evidenceState === 'INSUFFICIENT_EVIDENCE') {
        baseInstruction += `\n\nADAPTIVE LEARNING ENGINE STATE:\n- Evidence State: INSUFFICIENT_EVIDENCE (Only 1 observation recorded. Sample size insufficient to draw definitive mastery conclusions.)`;
      } else {
        baseInstruction += `\n\nADAPTIVE LEARNING ENGINE STATE:\n- Evidence State: OBSERVED (Based on ${state.sampleSize ?? 2}+ observations)\n- IRT Mastery Level: ${(state.currentMasteryLevel * 100).toFixed(1)}%\n- Recommended Difficulty: ${state.recommendedDifficulty}\n- Weak Topics: ${state.weakTopics.length > 0 ? state.weakTopics.join(', ') : 'None identified'}`;
      }
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
