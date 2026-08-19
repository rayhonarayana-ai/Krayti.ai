/**
 * Qarayti.ai — Faheem AI Response Pipeline
 * Manages the complete lifecycle: Safety Pre-check -> Gemini Adapter -> Tool Dispatch -> Safety Post-check -> DTO Assembly
 */

import { GeminiApiAdapter } from './gemini-adapter';
import { FaheemToolRegistry } from '../tools/tool-registry';
import { FaheemToolDispatcher } from '../tools/tool-dispatcher';
import { FaheemSafetyLayer } from '../safety/safety-layer';
import { FaheemContext, FaheemQueryResponseDTO, FaheemSafetyResult, FaheemMessage } from '../../../domain/types/faheem.types';
import { FaheemPromptEngine } from '../prompts/prompt-engine';
import { FaheemPromptTemplates } from '../prompts/templates';
import { logger } from '../../logging/logger';

export class FaheemResponsePipeline {
  private adapter: GeminiApiAdapter;
  private toolRegistry: FaheemToolRegistry;
  private toolDispatcher: FaheemToolDispatcher;
  private safetyLayer: FaheemSafetyLayer;

  constructor(
    adapter: GeminiApiAdapter,
    toolRegistry: FaheemToolRegistry,
    toolDispatcher: FaheemToolDispatcher,
    safetyLayer: FaheemSafetyLayer
  ) {
    this.adapter = adapter;
    this.toolRegistry = toolRegistry;
    this.toolDispatcher = toolDispatcher;
    this.safetyLayer = safetyLayer;
  }

  public async process(
    query: string,
    context: FaheemContext,
    sessionId: string,
    messageId: string,
    conversationHistory?: FaheemMessage[]
  ): Promise<FaheemQueryResponseDTO> {
    const startTime = performance.now();

    // 1. Safety Pre-check
    const safetyResult: FaheemSafetyResult = this.safetyLayer.evaluate(query, context.role);
    if (!safetyResult.isSafe && safetyResult.level === 'UNSAFE') {
      const latencyMs = Math.round(performance.now() - startTime);
      logger.warn('FaheemResponsePipeline', `Query blocked by safety layer: ${safetyResult.reason}`);
      return {
        messageId,
        sessionId,
        content: safetyResult.sanitizedContent,
        language: context.language,
        toolExecutions: [],
        tokensUsed: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        safety: safetyResult,
        latencyMs,
        suggestedFollowUps: FaheemPromptTemplates.getSuggestedFollowUps(context.role, context.language),
      };
    }

    // 2. Build System Prompt
    const systemPrompt = FaheemPromptEngine.buildSystemPrompt(context);
    const cleanQuery = FaheemPromptEngine.optimizeUserQuery(query);

    // 3. Gemini Generation
    const generationResult = await this.adapter.generateResponse(cleanQuery, systemPrompt, this.toolRegistry, context.language, conversationHistory);

    // 4. Tool Execution Loop
    const toolExecutions: Array<{
      toolName: string;
      result: unknown;
      durationMs: number;
      success: boolean;
    }> = [];

    let finalContent = generationResult.content;

    if (generationResult.toolCalls.length > 0) {
      for (const call of generationResult.toolCalls) {
        const toolStart = performance.now();
        const execResult = await this.toolDispatcher.dispatch(call);
        const durationMs = Math.round(performance.now() - toolStart);

        toolExecutions.push({
          toolName: call.name,
          result: execResult.result,
          durationMs,
          success: execResult.success,
        });
      }
    }

    // 5. Post-process Safety Check on generated response
    const postSafety = this.safetyLayer.sanitizeResponse(finalContent);

    const latencyMs = Math.round(performance.now() - startTime);
    logger.info('FaheemResponsePipeline', `Completed pipeline process in ${latencyMs}ms with ${toolExecutions.length} tool executions.`);

    return {
      messageId,
      sessionId,
      content: postSafety,
      language: context.language,
      toolExecutions,
      tokensUsed: generationResult.tokensUsed,
      safety: safetyResult,
      latencyMs,
      suggestedFollowUps: FaheemPromptTemplates.getSuggestedFollowUps(context.role, context.language),
    };
  }
}
