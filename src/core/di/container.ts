/**
 * Qarayti.ai — Dependency Injection Container
 * Lightweight, robust DI container supporting Singleton and Transient service lifetimes
 */

import { logger } from '../logging/logger';

export enum ServiceLifetime {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
}

export type ServiceFactory<T> = (container: DIContainer) => T;

export interface ServiceDescriptor<T = unknown> {
  key: string;
  factory: ServiceFactory<T>;
  lifetime: ServiceLifetime;
  instance?: T;
}

export class DIContainer {
  private services = new Map<string, ServiceDescriptor>();

  public register<T>(
    key: string,
    factory: ServiceFactory<T>,
    lifetime: ServiceLifetime = ServiceLifetime.SINGLETON
  ): void {
    if (this.services.has(key)) {
      logger.warn('DIContainer', `Overwriting existing registration for key: ${key}`);
    }

    this.services.set(key, {
      key,
      factory,
      lifetime,
    });

    logger.debug('DIContainer', `Registered service: ${key} [${lifetime}]`);
  }

  public resolve<T>(key: string): T {
    const descriptor = this.services.get(key) as ServiceDescriptor<T> | undefined;

    if (!descriptor) {
      const errMessage = `Service '${key}' is not registered in the DI container.`;
      logger.error('DIContainer', errMessage);
      throw new Error(errMessage);
    }

    if (descriptor.lifetime === ServiceLifetime.SINGLETON) {
      if (!descriptor.instance) {
        logger.debug('DIContainer', `Instantiating Singleton service: ${key}`);
        descriptor.instance = descriptor.factory(this);
      }
      return descriptor.instance;
    }

    logger.debug('DIContainer', `Instantiating Transient service: ${key}`);
    return descriptor.factory(this);
  }

  public has(key: string): boolean {
    return this.services.has(key);
  }

  public getRegisteredServices(): Array<{ key: string; lifetime: ServiceLifetime; isInstantiated: boolean }> {
    return Array.from(this.services.values()).map((s) => ({
      key: s.key,
      lifetime: s.lifetime,
      isInstantiated: Boolean(s.instance),
    }));
  }

  public clear(): void {
    this.services.clear();
    logger.info('DIContainer', 'DI Container cleared.');
  }
}

export const container = new DIContainer();
