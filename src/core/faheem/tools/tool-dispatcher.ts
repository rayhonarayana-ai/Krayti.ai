/**
 * Qarayti.ai — Tool Dispatcher
 * Safely executes tool calls, measures latency, and handles exceptions
 */

import { FaheemToolRegistry } from './tool-registry';
import { FaheemToolCall, FaheemToolResult } from '../../../domain/types/faheem.types';
import { logger } from '../../logging/logger';

export class FaheemToolDispatcher {
  private registry: FaheemToolRegistry;

  constructor(registry: FaheemToolRegistry) {
    this.registry = registry;
  }

  public async dispatch(toolCall: FaheemToolCall): Promise<FaheemToolResult> {
    const startTime = performance.now();
    logger.info('FaheemToolDispatcher', `Executing tool call [${toolCall.name}] (ID: ${toolCall.id})`);

    const handler = this.registry.getHandler(toolCall.name);
    if (!handler) {
      const durationMs = Math.round(performance.now() - startTime);
      logger.error('FaheemToolDispatcher', `Unknown tool: ${toolCall.name}`);
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        result: null,
        success: false,
        error: `Tool '${toolCall.name}' is not registered in Faheem Tool Registry.`,
      };
    }

    try {
      const result = await handler.execute(toolCall.args);
      const durationMs = Math.round(performance.now() - startTime);
      logger.info('FaheemToolDispatcher', `Tool [${toolCall.name}] completed in ${durationMs}ms`);

      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        result,
        success: true,
      };
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMsg = (err as Error).message;
      logger.error('FaheemToolDispatcher', `Tool [${toolCall.name}] failed after ${durationMs}ms: ${errorMsg}`);

      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        result: null,
        success: false,
        error: errorMsg,
      };
    }
  }
}
