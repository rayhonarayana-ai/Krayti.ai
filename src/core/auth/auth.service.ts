/**
 * Qarayti.ai — Authentication Foundation Service
 * Session lifecycle management, trusted role resolution, and JWT security foundation
 *
 * GATE 06A: Role resolution from trusted DB sources (platform_roles, school_memberships).
 * user_metadata.role is NO LONGER used as production authorization authority.
 */

import { UserRole, UserProfile, AuthSession, ResourceDomain, PermissionAction, SchoolMembershipState } from '../../domain/types/auth.types';
import { EducationLevel, HighSchoolTrack, EducationLanguage } from '../../domain/types/education.types';
import { rbacManager } from './rbac.manager';
import { logger } from '../logging/logger';
import { supabase } from '../../infrastructure/supabase/client';
import { envConfig } from '../config/env.config';

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

  /**
   * GATE 06A: Resolve trusted role from database, NOT from user_metadata.
   * The DB function uses auth.uid() — no parameters passed from client.
   * Priority: platform_roles (SUPER_ADMIN) > school_memberships > STUDENT default.
   */
  private async resolveTrustedRole(): Promise<UserRole> {
    try {
      const { data, error } = await supabase.rpc('get_user_trusted_role');

      if (error) {
        logger.warn('AuthService', `Trusted role resolution failed: ${error.message}. Defaulting to STUDENT.`);
        return UserRole.STUDENT;
      }

      const roleValue = (data as string) || 'STUDENT';
      const validRoles = Object.values(UserRole);
      if (validRoles.includes(roleValue as UserRole)) {
        return roleValue as UserRole;
      }

      logger.warn('AuthService', `Invalid role value from DB: ${roleValue}. Defaulting to STUDENT.`);
      return UserRole.STUDENT;
    } catch (err) {
      logger.error('AuthService', `Trusted role resolution exception: ${(err as Error).message}. Defaulting to STUDENT.`);
      return UserRole.STUDENT;
    }
  }

  /**
   * Resolve a user's school_id from school_memberships.
   * The DB function uses auth.uid() — no parameters passed from client.
   */
  private async resolveSchoolId(): Promise<string | undefined> {
    try {
      const { data, error } = await supabase.rpc('get_user_school_id');

      if (error || !data) {
        return undefined;
      }

      return data as string;
    } catch {
      return undefined;
    }
  }

  /**
   * GATE 06B.1.1: Resolve school membership state for institutional evidence.
   * Returns NONE / RESOLVED (exactly one) / AMBIGUOUS (multiple).
   * This is the minimum domain behavior to enforce fail-closed multi-school.
   *
   * RLS on school_memberships scopes to auth.uid() — no user_id filter needed.
   */
  public async resolveSchoolContext(): Promise<SchoolMembershipState> {
    try {
      const { data, error } = await supabase
        .from('school_memberships')
        .select('school_id')
        .eq('role', 'STUDENT');

      if (error || !data || data.length === 0) {
        return { status: 'NONE' };
      }

      const schoolIds = data.map((m: { school_id: string }) => m.school_id);

      if (schoolIds.length === 1) {
        return { status: 'RESOLVED', schoolId: schoolIds[0] };
      } else {
        return { status: 'AMBIGUOUS', schoolIds };
      }
    } catch {
      return { status: 'NONE' };
    }
  }

  private async updateSessionFromSupabase(session: any): Promise<void> {
    if (!session || !session.user) {
      this.currentSession = null;
      this.notifyListeners();
      return;
    }

    const user = session.user;

    // GATE 06A: Resolve trusted role from DB, NOT from user_metadata
    const trustedRole = await this.resolveTrustedRole();
    const schoolId = await this.resolveSchoolId();

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email || '',
      // Gate 06D.3: display name is SELF_ASSERTED_PROFILE_DISPLAY_DATA from user_metadata
      fullName: user.user_metadata?.full_name || user.email || 'Qarayti User',
      role: trustedRole,
      preferredLanguage: EducationLanguage.ARABIC,
      // Gate 06D.3: educationLevel and track are NOT inferred — absent when no trusted persisted source
      educationLevel: undefined,
      track: undefined,
      academicYear: undefined,
      schoolId,
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

    logger.info('AuthService', `Session resolved for user: ${user.id} | Trusted role: ${trustedRole} | School: ${schoolId || 'none'}`);
    this.notifyListeners();
  }

  public async signUp(email: string, password: string): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.session) {
      await this.updateSessionFromSupabase(data.session);
    }
    return this.currentSession;
  }

  public async signInWithPassword(email: string, password: string): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      await this.updateSessionFromSupabase(data.session);
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

  /**
   * GATE 06A.1: Production-safe foundation session.
   * Blocked in production. Only available in development/staging environments.
   * Creates a synthetic session for development/foundation testing only.
   */
  public setFoundationSession(role: UserRole): AuthSession {
    const appEnv = envConfig.get().environment;

    if (appEnv === 'production') {
      const errorMsg = 'setFoundationSession is blocked in production. Use real Supabase authentication.';
      logger.error('AuthService', errorMsg);
      throw new Error(errorMsg);
    }

    logger.warn('AuthService', `setFoundationSession called with role: ${role} in ${appEnv} mode. Foundation-only — NOT production authorization.`);

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

    logger.info('AuthService', `Foundation auth session set to role: ${role} (not backed by DB — development only)`);
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
