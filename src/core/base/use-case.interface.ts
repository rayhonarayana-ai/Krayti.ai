/**
 * Qarayti.ai — Clean Architecture Use Case Pattern
 * Single responsibility application business logic boundary
 */

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
