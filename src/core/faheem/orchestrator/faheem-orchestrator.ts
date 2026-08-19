/**
 * Qarayti.ai — Faheem AI Orchestrator
 * Master coordinator unifying Context Builders, Session, Pipeline, Tools, Safety, and Telemetry
 */

import { FaheemSessionManager } from '../session/session-manager';
import { FaheemConversationManager } from '../session/conversation-manager';
import { FaheemResponsePipeline } from '../pipeline/response-pipeline';
import { FaheemTelemetry } from '../monitoring/faheem-telemetry';
import { FaheemRateLimiter } from '../governance/rate-limiter';
import { FaheemRetryPolicy } from '../governance/retry-policy';
import { FaheemValidator } from '../../../domain/validators/faheem.validator';
import {
  ProcessFaheemQueryDTO,
  FaheemQueryResponseDTO,
  FaheemSession,
  FaheemMetrics,
} from '../../../domain/types/faheem.types';
import { logger } from '../../logging/logger';

export class FaheemOrchestrator {
  private sessionManager: FaheemSessionManager;
  private conversationManager: FaheemConversationManager;
  private pipeline: FaheemResponsePipeline;
  private telemetry: FaheemTelemetry;
  private rateLimiter: FaheemRateLimiter;

  constructor(
    sessionManager: FaheemSessionManager,
    conversationManager: FaheemConversationManager,
    pipeline: FaheemResponsePipeline,
    telemetry: FaheemTelemetry,
    rateLimiter: FaheemRateLimiter
  ) {
    this.sessionManager = sessionManager;
    this.conversationManager = conversationManager;
    this.pipeline = pipeline;
    this.telemetry = telemetry;
    this.rateLimiter = rateLimiter;
  }

  public async processQuery(dto: ProcessFaheemQueryDTO): Promise<FaheemQueryResponseDTO> {
    const startTime = performance.now();

    // 1. Input Validation
    const validation = FaheemValidator.validateQueryInput(dto);
    if (!validation.valid) {
      throw new Error(`Invalid Query DTO: ${validation.errors.join(', ')}`);
    }

    // 2. Rate Limiting Check
    if (!this.rateLimiter.isAllowed(dto.userId)) {
      throw new Error('Rate limit exceeded for Faheem AI Engine requests. Please wait a moment.');
    }

    // 3. Resolve or Create Session
    let session: FaheemSession | undefined;
    if (dto.sessionId) {
      session = this.sessionManager.getSession(dto.sessionId);
    }
    if (!session) {
      session = this.sessionManager.createSession(
        dto.userId,
        dto.role,
        dto.language,
        dto.customContext
      );
    }

    // 4. Record User Message
    const userMsg = this.conversationManager.appendMessage(
      session.id,
      'user',
      dto.query,
      session.language
    );

    // 5. Retrieve conversation history for multi-turn context
    const history = this.conversationManager.getHistory(session.id);

    // 6. Execute Response Pipeline with Retry Policy
    const responseDTO = await FaheemRetryPolicy.executeWithRetry(async () => {
      return this.pipeline.process(dto.query, session!.context, session!.id, userMsg.id, history);
    });

    // 7. Record Assistant Message
    this.conversationManager.appendMessage(
      session.id,
      'assistant',
      responseDTO.content,
      responseDTO.language
    );

    // 8. Update Session State
    session.messageCount += 2;
    this.sessionManager.updateSession(session);

    // 9. Record Telemetry
    this.telemetry.recordQuery(
      responseDTO.latencyMs,
      responseDTO.tokensUsed.inputTokens,
      responseDTO.tokensUsed.outputTokens,
      !responseDTO.safety.isSafe,
      session.id
    );

    const totalDurationMs = Math.round(performance.now() - startTime);
    logger.info('FaheemOrchestrator', `Query processed in ${totalDurationMs}ms (Pipeline: ${responseDTO.latencyMs}ms)`);

    return responseDTO;
  }

  public getSession(sessionId: string): FaheemSession | undefined {
    return this.sessionManager.getSession(sessionId);
  }

  public getHistory(sessionId: string) {
    return this.conversationManager.getHistory(sessionId);
  }

  public getMetrics(): FaheemMetrics {
    return this.telemetry.getMetrics();
  }
}
