/**
 * Qarayti.ai — Repository Pattern Base Abstraction
 * Abstraction layer separating Domain logic from Supabase / Persistence mechanisms
 */

import { BaseEntity, PaginatedResult, PaginationParams } from '../../domain/types/common.types';

export interface IBaseRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findMany(params?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseSupabaseRepository<T extends BaseEntity> implements IBaseRepository<T> {
  protected abstract tableName: string;

  public abstract findById(id: string): Promise<T | null>;
  public abstract findMany(params?: PaginationParams): Promise<PaginatedResult<T>>;
  public abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  public abstract update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  public abstract delete(id: string): Promise<boolean>;
}
