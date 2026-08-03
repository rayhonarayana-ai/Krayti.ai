/**
 * Qarayti.ai — Base Service Pattern
 * Domain Service layer bridging Use Cases with Repositories
 */

import { BaseEntity, PaginatedResult, PaginationParams } from '../../domain/types/common.types';
import { IBaseRepository } from './base.repository';
import { logger } from '../logging/logger';

export abstract class BaseService<T extends BaseEntity> {
  protected constructor(
    protected readonly repository: IBaseRepository<T>,
    protected readonly serviceName: string
  ) {}

  public async getById(id: string): Promise<T | null> {
    logger.debug(this.serviceName, `Fetching entity by ID: ${id}`);
    return this.repository.findById(id);
  }

  public async getPaginated(params?: PaginationParams): Promise<PaginatedResult<T>> {
    logger.debug(this.serviceName, 'Fetching paginated entities', params);
    return this.repository.findMany(params);
  }

  public async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    logger.info(this.serviceName, 'Creating new entity record');
    return this.repository.create(data);
  }

  public async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    logger.info(this.serviceName, `Updating entity record ID: ${id}`);
    return this.repository.update(id, data);
  }

  public async delete(id: string): Promise<boolean> {
    logger.warn(this.serviceName, `Deleting entity record ID: ${id}`);
    return this.repository.delete(id);
  }
}
