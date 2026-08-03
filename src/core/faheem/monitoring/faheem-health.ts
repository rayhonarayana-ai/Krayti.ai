/**
 * Qarayti.ai — Faheem AI Health Check
 * Verifies operational readiness of the AI Engine subsystems
 */

import { envConfig } from '../../config/env.config';
import { FaheemToolRegistry } from '../tools/tool-registry';

export interface FaheemHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  version: string;
  geminiConfigured: boolean;
  registeredToolsCount: number;
  timestamp: string;
  details: Record<string, unknown>;
}

export class FaheemHealthCheck {
  private toolRegistry: FaheemToolRegistry;

  constructor(toolRegistry: FaheemToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  public check(): FaheemHealthStatus {
    const config = envConfig.get();
    const isGeminiReady = config.gemini.isConfigured;
    const toolsCount = this.toolRegistry.getDeclarations().length;

    return {
      status: isGeminiReady ? 'HEALTHY' : 'DEGRADED',
      version: '1.0.0-faheem-ai-engine',
      geminiConfigured: isGeminiReady,
      registeredToolsCount: toolsCount,
      timestamp: new Date().toISOString(),
      details: {
        modelAlias: 'gemini-3.6-flash',
        userAgent: 'aistudio-build',
        supportedLanguages: ['ar', 'ary', 'fr', 'en'],
        moroccanCurriculumAligned: true,
      },
    };
  }
}
