/**
 * Qarayti.ai — Governance: Circuit Breaker & Resilience Engine
 * Protects platform availability by isolating failing third-party connectors (SMS, Email, Massar Gateway, Payment)
 * States: CLOSED (Normal), OPEN (Isolated/Failing), HALF_OPEN (Canary recovery trial).
 */

import { logger } from '../../logging/logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitStatus {
  serviceName: string;
  state: CircuitState;
  consecutiveFailures: number;
  totalCalls: number;
  totalFailures: number;
  lastFailureTime?: string;
  nextAllowedRetryTime?: string;
}

export class CircuitBreakerEngine {
  private static instance: CircuitBreakerEngine;
  private circuits = new Map<string, CircuitStatus>();

  // Threshold Configuration
  private failureThreshold = 3; // 3 consecutive failures trips circuit
  private recoveryTimeoutMs = 10000; // 10 seconds before trial in HALF_OPEN

  private constructor() {
    logger.info('CircuitBreakerEngine', 'Governance Circuit Breaker & Resilience Engine initialized.');
    this.initDefaultCircuits();
  }

  public static getInstance(): CircuitBreakerEngine {
    if (!CircuitBreakerEngine.instance) {
      CircuitBreakerEngine.instance = new CircuitBreakerEngine();
    }
    return CircuitBreakerEngine.instance;
  }

  private initDefaultCircuits() {
    const services = [
      'SMS_PARENT_GATEWAY',
      'MASSAR_MINISTRY_CONNECTOR',
      'EMAIL_SMTP_RELAY',
      'WHATSAPP_BUSINESS_API',
      'PAYMENT_GATEWAY_CMI',
    ];

    services.forEach((serviceName) => {
      this.circuits.set(serviceName, {
        serviceName,
        state: 'CLOSED',
        consecutiveFailures: 0,
        totalCalls: 0,
        totalFailures: 0,
      });
    });
  }

  public getCircuit(serviceName: string): CircuitStatus {
    let circuit = this.circuits.get(serviceName);
    if (!circuit) {
      circuit = {
        serviceName,
        state: 'CLOSED',
        consecutiveFailures: 0,
        totalCalls: 0,
        totalFailures: 0,
      };
      this.circuits.set(serviceName, circuit);
    }

    // Check if OPEN circuit is ready for HALF_OPEN trial
    if (circuit.state === 'OPEN' && circuit.nextAllowedRetryTime) {
      if (Date.now() >= new Date(circuit.nextAllowedRetryTime).getTime()) {
        circuit.state = 'HALF_OPEN';
        logger.info('CircuitBreakerEngine', `Circuit '${serviceName}' shifted to HALF_OPEN for recovery test.`);
      }
    }

    return circuit;
  }

  public async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuit = this.getCircuit(serviceName);
    circuit.totalCalls++;

    if (circuit.state === 'OPEN') {
      logger.warn('CircuitBreakerEngine', `Circuit '${serviceName}' is OPEN. Executing fallback mechanism.`);
      if (fallback) {
        return await fallback();
      }
      throw new Error(`CircuitBreaker: Service '${serviceName}' is currently isolated due to repeated failures.`);
    }

    try {
      const result = await operation();

      // Successful Execution Handling
      if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'CLOSED';
        circuit.consecutiveFailures = 0;
        logger.info('CircuitBreakerEngine', `Circuit '${serviceName}' successfully recovered! State restored to CLOSED.`);
      } else {
        circuit.consecutiveFailures = 0;
      }

      return result;
    } catch (err) {
      circuit.consecutiveFailures++;
      circuit.totalFailures++;
      circuit.lastFailureTime = new Date().toISOString();

      logger.error('CircuitBreakerEngine', `Error calling service '${serviceName}' (${circuit.consecutiveFailures}/${this.failureThreshold} failures)`, err);

      if (circuit.consecutiveFailures >= this.failureThreshold) {
        circuit.state = 'OPEN';
        const nextRetry = new Date(Date.now() + this.recoveryTimeoutMs).toISOString();
        circuit.nextAllowedRetryTime = nextRetry;
        logger.error('CircuitBreakerEngine', `CRITICAL: Circuit '${serviceName}' TRIPPED TO OPEN! Next retry allowed at ${nextRetry}`);
      }

      if (fallback) {
        logger.info('CircuitBreakerEngine', `Executing fallback for service '${serviceName}'`);
        return await fallback();
      }

      throw err;
    }
  }

  public forceTrip(serviceName: string): void {
    const circuit = this.getCircuit(serviceName);
    circuit.state = 'OPEN';
    circuit.nextAllowedRetryTime = new Date(Date.now() + this.recoveryTimeoutMs).toISOString();
    logger.warn('CircuitBreakerEngine', `Manually tripped circuit for '${serviceName}'`);
  }

  public forceReset(serviceName: string): void {
    const circuit = this.getCircuit(serviceName);
    circuit.state = 'CLOSED';
    circuit.consecutiveFailures = 0;
    logger.info('CircuitBreakerEngine', `Manually reset circuit for '${serviceName}' to CLOSED`);
  }

  public getAllCircuits(): CircuitStatus[] {
    return Array.from(this.circuits.values());
  }
}

export const circuitBreakerEngine = CircuitBreakerEngine.getInstance();
