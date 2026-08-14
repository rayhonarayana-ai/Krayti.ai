/**
 * Qarayti.ai — API Client & Supabase Wrapper Foundation
 * Resilient HTTP & Edge Function Client with auto-authentication, retry, and trace logging
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../infrastructure/supabase/client';
import { envConfig } from '../config/env.config';
import { logger } from '../logging/logger';
import { AppError, DatabaseError, UnauthorizedError } from '../errors/app-error';
import { ApiResponse } from '../../domain/types/common.types';

export class ApiClient {
  private supabase: SupabaseClient = supabase;

  public getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  public async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 2
  ): Promise<ApiResponse<T>> {
    const config = envConfig.get();
    const traceId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const url = endpoint.startsWith('http') ? endpoint : `${config.supabase.url}/functions/v1/${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Trace-ID': traceId,
      'X-App-Version': config.appVersion,
      'X-Country-Pack': config.countryPack.code,
      ...(options.headers as Record<string, string>),
    };

    // Inject Supabase Auth Token if available
    const { data: sessionData } = await this.supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        logger.debug('ApiClient', `[Attempt ${attempt + 1}] Requesting ${url} (Trace: ${traceId})`);
        
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.status === 401) {
          throw new UnauthorizedError('Session expired or invalid authentication token.');
        }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({ message: response.statusText }));
          throw new AppError(
            errorBody.message || `API HTTP Error ${response.status}`,
            'HTTP_ERROR',
            response.status,
            true,
            errorBody
          );
        }

        const data = await response.json();
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          traceId,
        };
      } catch (err) {
        lastError = err as Error;
        attempt++;
        logger.warn('ApiClient', `Request failed (attempt ${attempt}/${maxRetries + 1}): ${lastError.message}`);
        
        if (attempt <= maxRetries) {
          // Exponential backoff delay
          await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 300));
        }
      }
    }

    logger.error('ApiClient', `Request failed after ${maxRetries + 1} attempts for ${url}`, lastError);
    
    return {
      success: false,
      error: {
        code: lastError instanceof AppError ? lastError.code : 'FETCH_FAILED',
        message: lastError?.message || 'Network request failed',
      },
      timestamp: new Date().toISOString(),
      traceId,
    };
  }

  public async queryDatabase<T>(
    table: string,
    queryBuilder: (client: SupabaseClient) => Promise<{ data: T | null; error: unknown }>
  ): Promise<T> {
    try {
      const { data, error } = await queryBuilder(this.supabase);
      if (error) {
        throw new DatabaseError(`Supabase Query error on table '${table}'`, error);
      }
      return data as T;
    } catch (err) {
      logger.error('ApiClient', `Database error on table '${table}'`, err);
      throw err instanceof AppError ? err : new DatabaseError(`Database execution failed on '${table}'`, err);
    }
  }
}

export const apiClient = new ApiClient();
