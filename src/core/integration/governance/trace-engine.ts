/**
 * Qarayti.ai — Governance: Distributed Trace Engine
 * End-to-End Tracing across multi-portal domain event hops.
 * Captures waterfall timelines: Student Portal -> Event Bus -> Adaptive Engine -> Faheem AI -> Notification -> Parent Portal -> Super Admin.
 */

import { logger } from '../../logging/logger';

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTimeMs: number;
  endTimeMs?: number;
  durationMs?: number;
  status: 'OK' | 'ERROR';
  metadata?: Record<string, any>;
}

export interface TraceGraph {
  traceId: string;
  rootOperation: string;
  totalDurationMs: number;
  spans: TraceSpan[];
  status: 'OK' | 'ERROR';
  startedAt: string;
}

export class DistributedTraceEngine {
  private static instance: DistributedTraceEngine;
  private traces = new Map<string, TraceSpan[]>();
  private traceRoots = new Map<string, { rootOperation: string; startedAt: string }>();

  private constructor() {
    logger.info('DistributedTraceEngine', 'Governance Distributed Trace Engine initialized.');
  }

  public static getInstance(): DistributedTraceEngine {
    if (!DistributedTraceEngine.instance) {
      DistributedTraceEngine.instance = new DistributedTraceEngine();
    }
    return DistributedTraceEngine.instance;
  }

  public createTrace(rootOperation: string, traceId?: string): string {
    const tid = traceId || `trace-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    this.traces.set(tid, []);
    this.traceRoots.set(tid, {
      rootOperation,
      startedAt: new Date().toISOString(),
    });
    return tid;
  }

  public startSpan(
    traceId: string,
    serviceName: string,
    operationName: string,
    parentSpanId?: string,
    metadata?: Record<string, any>
  ): TraceSpan {
    if (!this.traces.has(traceId)) {
      this.createTrace(operationName, traceId);
    }

    const spanId = `span-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const span: TraceSpan = {
      spanId,
      traceId,
      parentSpanId,
      serviceName,
      operationName,
      startTimeMs: performance.now(),
      status: 'OK',
      metadata,
    };

    this.traces.get(traceId)!.push(span);
    return span;
  }

  public endSpan(traceId: string, spanId: string, status: 'OK' | 'ERROR' = 'OK', metadata?: Record<string, any>): void {
    const spanList = this.traces.get(traceId);
    if (!spanList) return;

    const span = spanList.find((s) => s.spanId === spanId);
    if (span) {
      span.endTimeMs = performance.now();
      span.durationMs = Math.round(span.endTimeMs - span.startTimeMs);
      span.status = status;
      if (metadata) {
        span.metadata = { ...span.metadata, ...metadata };
      }
    }
  }

  public getTraceGraph(traceId: string): TraceGraph | null {
    const spans = this.traces.get(traceId);
    const rootInfo = this.traceRoots.get(traceId);
    if (!spans || !rootInfo) return null;

    let minStart = Infinity;
    let maxEnd = -Infinity;
    let hasError = false;

    spans.forEach((s) => {
      if (s.startTimeMs < minStart) minStart = s.startTimeMs;
      const end = s.endTimeMs || s.startTimeMs;
      if (end > maxEnd) maxEnd = end;
      if (s.status === 'ERROR') hasError = true;
    });

    const totalDuration = minStart === Infinity ? 0 : Math.round(maxEnd - minStart);

    return {
      traceId,
      rootOperation: rootInfo.rootOperation,
      totalDurationMs: totalDuration,
      spans,
      status: hasError ? 'ERROR' : 'OK',
      startedAt: rootInfo.startedAt,
    };
  }

  public getAllTraceGraphs(): TraceGraph[] {
    const graphs: TraceGraph[] = [];
    for (const traceId of this.traces.keys()) {
      const g = this.getTraceGraph(traceId);
      if (g) graphs.push(g);
    }
    return graphs.reverse();
  }
}

export const traceEngine = DistributedTraceEngine.getInstance();
