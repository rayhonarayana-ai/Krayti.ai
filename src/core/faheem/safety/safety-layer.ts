/**
 * Qarayti.ai — Faheem Safety Layer
 * Executes pre-execution evaluation and post-execution response sanitization
 */

import { FaheemModerationEngine } from './moderation';
import { FaheemRoleContext, FaheemSafetyResult } from '../../../domain/types/faheem.types';

export class FaheemSafetyLayer {
  public evaluate(query: string, role: FaheemRoleContext): FaheemSafetyResult {
    return FaheemModerationEngine.evaluateQuery(query, role);
  }

  public sanitizeResponse(response: string): string {
    // Sanitize any accidentally leaked internal system tokens or API keys
    let clean = response.replace(/GEMINI_[A-Z0-9_]+/gi, '[REDACTED_KEY]');
    clean = clean.replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_SECRET]');
    return clean;
  }
}
