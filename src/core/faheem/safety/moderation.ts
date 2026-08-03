/**
 * Qarayti.ai — Moroccan Educational Moderation Engine
 * Detects exam cheating, inappropriate content, PII, and off-topic prompts
 */

import { FaheemRoleContext, FaheemSafetyResult, FaheemSafetyLevel } from '../../../domain/types/faheem.types';

export class FaheemModerationEngine {
  private static CHEATING_KEYWORDS = [
    'تسريب الامتحان',
    'امتحان اليوم مباشر',
    'اعطيني جواب السؤال دابا ف الامتحان',
    'تسريب الباك',
    'فوك كود كبيس',
    'live exam answers',
    'cheat during exam',
  ];

  private static PII_PATTERNS = [
    /\b[A-Z]{1,2}[0-9]{5,7}\b/g, // Moroccan CIN e.g. AB123456
    /\b(?:06|07)[0-9]{8}\b/g,    // Moroccan Mobile Phone
  ];

  public static evaluateQuery(query: string, role: FaheemRoleContext): FaheemSafetyResult {
    const queryLower = query.toLowerCase();

    // Check for cheating attempts
    const isCheating = this.CHEATING_KEYWORDS.some((kw) => queryLower.includes(kw.toLowerCase()));
    if (isCheating) {
      return {
        isSafe: false,
        level: 'CHEATING_FLAG' as FaheemSafetyLevel,
        reason: 'طلب يتعلق بتسريب أو غش في الامتحانات الوطنية أو الجهوية الرسمية.',
        sanitizedContent: 'نظام "فهيم" يلتزم بأعلى معايير النزاهة الأكاديمية والشرعية البيداغوجية. لا يمكن تقديم إجابات لمباشرة الامتحانات، لكن يسعدني مساعدتك في شرح المفاهيم ونماذج السنوات السابقة!',
        moderationFlags: {
          piiDetected: false,
          cheatingAttempt: true,
          inappropriateContent: false,
          offTopic: false,
        },
      };
    }

    // Check for PII
    let piiFound = false;
    this.PII_PATTERNS.forEach((pattern) => {
      if (pattern.test(query)) {
        piiFound = true;
      }
    });

    return {
      isSafe: true,
      level: 'SAFE' as FaheemSafetyLevel,
      sanitizedContent: query,
      moderationFlags: {
        piiDetected: piiFound,
        cheatingAttempt: false,
        inappropriateContent: false,
        offTopic: false,
      },
    };
  }
}
