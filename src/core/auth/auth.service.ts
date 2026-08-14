/**
 * Qarayti.ai — Authentication Foundation Service
 * Session lifecycle management, role verification, and JWT security foundation
 */

import { UserRole, UserProfile, AuthSession, ResourceDomain, PermissionAction } from '../../domain/types/auth.types';
import { EducationLevel, HighSchoolTrack, EducationLanguage } from '../../domain/types/education.types';
import { rbacManager } from './rbac.manager';
import { logger } from '../logging/logger';
import { supabase } from '../../infrastructure/supabase/client';

export interface IAuthService {
  getCurrentSession(): AuthSession | null;
  getCurrentUser(): UserProfile | null;
  isAuthenticated(): boolean;
  hasRole(role: UserRole): boolean;
  canAccess(resource: ResourceDomain, action: PermissionAction): boolean;
  setFoundationSession(role: UserRole): AuthSession;
  clearSession(): void;
  subscribe(listener: (session: AuthSession | null) => void): () => void;
  signUp(email: string, password: string): Promise<AuthSession | null>;
  signInWithPassword(email: string, password: string): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}

export class AuthService implements IAuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Set<(session: AuthSession | null) => void> = new Set();

  constructor() {
    // 1. Recover existing Supabase session upon startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.updateSessionFromSupabase(session);
    }).catch((err) => {
      logger.error('AuthService', 'Failed to recover Supabase session:', err);
      this.updateSessionFromSupabase(null);
    });

    // 2. Register real Supabase auth state listener
    supabase.auth.onAuthStateChange((_event, session) => {
      this.updateSessionFromSupabase(session);
    });
  }

  private updateSessionFromSupabase(session: any): void {
    if (!session || !session.user) {
      this.currentSession = null;
    } else {
      const user = session.user;
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || user.email || 'Qarayti User',
        role: (user.user_metadata?.role as UserRole) || UserRole.STUDENT,
        preferredLanguage: EducationLanguage.ARABIC,
        educationLevel: EducationLevel.HIGH_SCHOOL,
        track: HighSchoolTrack.MATHEMATICS_A,
        academicYear: '2025/2026',
        isVerified: true,
        isActive: true,
        createdAt: new Date(user.created_at || Date.now()),
        updatedAt: new Date(),
      };

      this.currentSession = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token || '',
        expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
        user: userProfile,
      };
    }
    logger.info('AuthService', `Supabase session updated for user: ${this.currentSession?.user.id || 'Anonymous'}`);
    this.notifyListeners();
  }

  public async signUp(email: string, password: string): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.session) {
      this.updateSessionFromSupabase(data.session);
    }
    return this.currentSession;
  }

  public async signInWithPassword(email: string, password: string): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      this.updateSessionFromSupabase(data.session);
    }
    return this.currentSession;
  }

  public async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.clearSession();
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
