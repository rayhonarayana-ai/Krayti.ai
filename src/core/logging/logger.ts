/**
 * Qarayti.ai — Centralized Logging System
 * Structured logger with live event bus for diagnostics and debugging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
}

export interface ILogger {
  debug(module: string, message: string, data?: unknown): void;
  info(module: string, message: string, data?: unknown): void;
  warn(module: string, message: string, data?: unknown): void;
  error(module: string, message: string, data?: unknown): void;
  getHistory(): LogEntry[];
  subscribe(listener: (entry: LogEntry) => void): () => void;
  clearHistory(): void;
}

class ProductionLogger implements ILogger {
  private history: LogEntry[] = [];
  private maxHistorySize = 250;
  private listeners: Set<(entry: LogEntry) => void> = new Set();

  private log(level: LogLevel, module: string, message: string, data?: unknown): void {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    this.history.unshift(entry);
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }

    // Print to console with colored labels
    const prefix = `[Qarayti:${module}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data ?? '');
        break;
      case 'info':
        console.info(prefix, message, data ?? '');
        break;
      case 'warn':
        console.warn(prefix, message, data ?? '');
        break;
      case 'error':
        console.error(prefix, message, data ?? '');
        break;
    }

    // Notify live listeners
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (err) {
        console.error('Error in logger listener:', err);
      }
    });
  }

  public debug(module: string, message: string, data?: unknown): void {
    this.log('debug', module, message, data);
  }

  public info(module: string, message: string, data?: unknown): void {
    this.log('info', module, message, data);
  }

  public warn(module: string, message: string, data?: unknown): void {
    this.log('warn', module, message, data);
  }

  public error(module: string, message: string, data?: unknown): void {
    this.log('error', module, message, data);
  }

  public getHistory(): LogEntry[] {
    return [...this.history];
  }

  public subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public clearHistory(): void {
    this.history = [];
  }
}

export const logger = new ProductionLogger();
