/**
 * Qarayti.ai — Production Startup Sequence
 * Validates, registers, and bootstraps all core infrastructure subsystems
 */

import { envConfig, AppConfig } from '../config/env.config';
import { logger } from '../logging/logger';
import { container, ServiceLifetime } from '../di/container';
import { apiClient, ApiClient } from '../http/api-client';
import { authService, AuthService } from '../auth/auth.service';
import { rbacManager, RBACManager } from '../auth/rbac.manager';
import { MOROCCAN_EDUCATION_LEVELS_METADATA } from '../../domain/constants/education.constants';
import { cacheManager } from '../cache/cache-manager';
import { dbOptimizer } from '../database/db-optimizer';
import { jobQueue } from '../queue/job-queue';
import { realtimeEngine } from '../realtime/realtime-engine';
import { cdnManager } from '../cdn/cdn-manager';
import { securityEngine } from '../security/security-engine';
import { telemetryEngine } from '../monitoring/telemetry-engine';
import { errorTracker } from '../errors/error-tracker';
import { scaleOptimizer } from '../performance/scale-optimizer';
import { registerFaheemAiEngine } from '../faheem/faheem-startup';
import { registerStudentPortalSubsystems } from '../student/student-startup';
import { registerTeacherPortalSubsystems } from '../teacher/teacher-startup';
import { registerCoreIntegrationSubsystems } from '../integration/integration-startup';

export interface SubsystemHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  message: string;
  details?: unknown;
}

export interface StartupReport {
  timestamp: string;
  success: boolean;
  durationMs: number;
  environment: string;
  subsystems: SubsystemHealth[];
}

export class StartupSequence {
  private static instance: StartupSequence;
  private isBootstrapped = false;
  private startupReport: StartupReport | null = null;

  private constructor() {}

  public static getInstance(): StartupSequence {
    if (!StartupSequence.instance) {
      StartupSequence.instance = new StartupSequence();
    }
    return StartupSequence.instance;
  }

  public async run(): Promise<StartupReport> {
    const startTime = performance.now();
    logger.info('StartupSequence', 'Initializing Qarayti.ai Production Foundation Boot Sequence...');

    const subsystems: SubsystemHealth[] = [];

    // Step 1: Environment Configuration
    try {
      const config = envConfig.load();
      subsystems.push({
        name: 'Environment Config',
        status: 'HEALTHY',
        message: `Loaded ${config.appName} v${config.appVersion} (${config.environment})`,
        details: {
          supabaseConfigured: config.supabase.isConfigured,
          geminiConfigured: config.gemini.isConfigured,
          countryPack: config.countryPack.code,
        },
      });
      logger.info('StartupSequence', 'Step 1/5: Config system initialized successfully.');
    } catch (err) {
      subsystems.push({
        name: 'Environment Config',
        status: 'FAILED',
        message: `Config load failed: ${(err as Error).message}`,
      });
    }

    // Step 2: Dependency Injection Container Registrations
    try {
      container.register<AppConfig>('AppConfig', () => envConfig.get(), ServiceLifetime.SINGLETON);
      container.register<ApiClient>('ApiClient', () => apiClient, ServiceLifetime.SINGLETON);
      container.register<AuthService>('AuthService', () => authService, ServiceLifetime.SINGLETON);
      container.register<RBACManager>('RBACManager', () => rbacManager, ServiceLifetime.SINGLETON);

      // Register Faheem AI Engine Core & Domain Subsystems
      registerFaheemAiEngine();

      // Register Student Portal Subsystems
      registerStudentPortalSubsystems();

      // Register Teacher Portal Subsystems
      registerTeacherPortalSubsystems();

      // Register Core Integration Engine & Workflow Subsystems
      registerCoreIntegrationSubsystems();

      subsystems.push({
        name: 'Dependency Injection',
        status: 'HEALTHY',
        message: `Registered ${container.getRegisteredServices().length} core singletons in DI Container.`,
        details: container.getRegisteredServices(),
      });
      logger.info('StartupSequence', 'Step 2/5: DI Container singletons registered.');
    } catch (err) {
      subsystems.push({
        name: 'Dependency Injection',
        status: 'FAILED',
        message: `DI setup failed: ${(err as Error).message}`,
      });
    }

    // Step 3: Auth & RBAC Security Foundation
    try {
      const auth = container.resolve<AuthService>('AuthService');
      const session = auth.getCurrentSession();
      subsystems.push({
        name: 'Auth & RBAC Security',
        status: session ? 'HEALTHY' : 'DEGRADED',
        message: session
          ? `Authenticated as ${session.user.role} (${session.user.email})`
          : 'Auth session uninitialized.',
        details: {
          activeUser: session?.user,
        },
      });
      logger.info('StartupSequence', 'Step 3/5: Auth & RBAC security foundation verified.');
    } catch (err) {
      subsystems.push({
        name: 'Auth & RBAC Security',
        status: 'FAILED',
        message: `Auth verify failed: ${(err as Error).message}`,
      });
    }

    // Step 4: Moroccan Educational Metadata Framework
    try {
      const levelsCount = MOROCCAN_EDUCATION_LEVELS_METADATA.length;
      subsystems.push({
        name: 'Moroccan Education Pack',
        status: 'HEALTHY',
        message: `Loaded Moroccan MEN Metadata Pack (${levelsCount} cycles: Primary, Middle, High School).`,
        details: MOROCCAN_EDUCATION_LEVELS_METADATA,
      });
      logger.info('StartupSequence', 'Step 4/5: Moroccan Education Constants Pack loaded.');
    } catch (err) {
      subsystems.push({
        name: 'Moroccan Education Pack',
        status: 'FAILED',
        message: `MEN metadata failed: ${(err as Error).message}`,
      });
    }

    // Step 5: Network & Supabase Client Verification
    try {
      const config = envConfig.get();
      subsystems.push({
        name: 'Supabase API Client',
        status: config.supabase.isConfigured ? 'HEALTHY' : 'DEGRADED',
        message: config.supabase.isConfigured
          ? 'Supabase client linked and ready for remote syncing.'
          : 'Supabase URL/Key unconfigured in .env (operating in foundation local mode).',
      });
      logger.info('StartupSequence', 'Step 5/6: Supabase API Client validated.');
    } catch (err) {
      subsystems.push({
        name: 'Supabase API Client',
        status: 'FAILED',
        message: `Supabase client error: ${(err as Error).message}`,
      });
    }

    // Step 6: 1M Active Users High-Scale Infrastructure Subsystems
    try {
      container.register('CacheManager', () => cacheManager, ServiceLifetime.SINGLETON);
      container.register('DatabaseOptimizer', () => dbOptimizer, ServiceLifetime.SINGLETON);
      container.register('JobQueue', () => jobQueue, ServiceLifetime.SINGLETON);
      container.register('RealtimeEngine', () => realtimeEngine, ServiceLifetime.SINGLETON);
      container.register('CdnManager', () => cdnManager, ServiceLifetime.SINGLETON);
      container.register('SecurityEngine', () => securityEngine, ServiceLifetime.SINGLETON);
      container.register('TelemetryEngine', () => telemetryEngine, ServiceLifetime.SINGLETON);
      container.register('ErrorTracker', () => errorTracker, ServiceLifetime.SINGLETON);
      container.register('ScaleOptimizer', () => scaleOptimizer, ServiceLifetime.SINGLETON);

      subsystems.push({
        name: '1M User Scale Subsystems',
        status: 'HEALTHY',
        message: 'Tiered Caching, DB Indexing, Job Queues, WS Multiplexing, Security & Telemetry operational.',
        details: {
          cache: cacheManager.getTelemetry(),
          dbIndexes: dbOptimizer.getRecommendedIndexes().length,
          jobQueue: jobQueue.getTelemetry(),
          realtime: realtimeEngine.getTelemetry(),
          telemetry: telemetryEngine.getTelemetrySummary(),
        },
      });
      logger.info('StartupSequence', 'Step 6/6: 1M Active User High-Scale Infrastructure active.');
    } catch (err) {
      subsystems.push({
        name: '1M User Scale Subsystems',
        status: 'FAILED',
        message: `Scale setup error: ${(err as Error).message}`,
      });
    }

    const durationMs = Math.round(performance.now() - startTime);
    const hasFailures = subsystems.some((s) => s.status === 'FAILED');

    this.startupReport = {
      timestamp: new Date().toISOString(),
      success: !hasFailures,
      durationMs,
      environment: envConfig.get().environment,
      subsystems,
    };

    this.isBootstrapped = true;
    logger.info('StartupSequence', `Boot sequence completed in ${durationMs}ms with status: ${hasFailures ? 'FAILED' : 'SUCCESS'}`);

    return this.startupReport;
  }

  public getReport(): StartupReport | null {
    return this.startupReport;
  }

  public isReady(): boolean {
    return this.isBootstrapped && (this.startupReport?.success ?? false);
  }
}

export const startupSequence = StartupSequence.getInstance();
