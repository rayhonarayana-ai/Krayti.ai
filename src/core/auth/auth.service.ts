/**
 * Qarayti.ai — Authentication Foundation Service
 * Session lifecycle management, role verification, and JWT security foundation
 */

import { UserRole, UserProfile, AuthSession, ResourceDomain, PermissionAction } from '../../domain/types/auth.types';
import { EducationLevel, HighSchoolTrack, EducationLanguage } from '../../domain/types/education.types';
import { rbacManager } from './rbac.manager';
import { logger } from '../logging/logger';
import { UnauthorizedError } from '../errors/app-error';

export interface IAuthService {
  getCurrentSession(): AuthSession | null;
  getCurrentUser(): UserProfile | null;
  isAuthenticated(): boolean;
  hasRole(role: UserRole): boolean;
  canAccess(resource: ResourceDomain, action: PermissionAction): boolean;
  setFoundationSession(role: UserRole): AuthSession;
  clearSession(): void;
  subscribe(listener: (session: AuthSession | null) => void): () => void;
}

export class AuthService implements IAuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Set<(session: AuthSession | null) => void> = new Set();

  constructor() {
    // Default foundation user (Student role initialized for foundation verification)
    this.setFoundationSession(UserRole.STUDENT);
  }

  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentSession?.user ?? null;
  }

  public isAuthenticated(): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.expiresAt > Math.floor(Date.now() / 1000);
  }

  public hasRole(role: UserRole): boolean {
    return this.currentSession?.user.role === role;
  }

  public canAccess(resource: ResourceDomain, action: PermissionAction): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return rbacManager.hasPermission(user.role, resource, action);
  }

  public setFoundationSession(role: UserRole): AuthSession {
    const sampleUser: UserProfile = {
      id: `usr-${role.toLowerCase()}-001`,
      email: `foundation.${role.toLowerCase()}@qarayti.ai`,
      fullName: `Qarayti Foundation User (${role})`,
      role,
      preferredLanguage: EducationLanguage.ARABIC,
      educationLevel: EducationLevel.HIGH_SCHOOL,
      track: HighSchoolTrack.MATHEMATICS_A,
      academicYear: '2025/2026',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockToken = `header.${btoa(JSON.stringify({ sub: sampleUser.id, role, iss: 'qarayti-auth' }))}.signature`;

    this.currentSession = {
      accessToken: mockToken,
      refreshToken: `refresh-${Date.now()}`,
      expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      user: sampleUser,
    };

    logger.info('AuthService', `Foundation auth session updated to role: ${role}`);
    this.notifyListeners();
    return this.currentSession;
  }

  public clearSession(): void {
    this.currentSession = null;
    logger.info('AuthService', 'Auth session cleared');
    this.notifyListeners();
  }

  public subscribe(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentSession);
      } catch (err) {
        logger.error('AuthService', 'Error in auth state listener:', err);
      }
    });
  }
}

export const authService = new AuthService();
