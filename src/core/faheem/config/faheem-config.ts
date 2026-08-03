/**
 * Qarayti.ai — Faheem AI Engine Configuration & Feature Flags
 */

import { FaheemFeatureFlags } from '../../../domain/types/faheem.types';

export interface FaheemEngineConfig {
  defaultModel: string;
  fallbackModel: string;
  maxTokensPerTurn: number;
  temperature: number;
  featureFlags: FaheemFeatureFlags;
}

export const defaultFaheemConfig: FaheemEngineConfig = {
  defaultModel: 'gemini-3.6-flash',
  fallbackModel: 'gemini-3.1-pro-preview',
  maxTokensPerTurn: 4096,
  temperature: 0.7,
  featureFlags: {
    enableDarijaResponse: true,
    enableToolCalling: true,
    enableLongTermMemory: true,
    enableAdaptiveContext: true,
    enableCheatingDetection: true,
    enablePromptOptimization: true,
    enableStreaming: true,
  },
};
