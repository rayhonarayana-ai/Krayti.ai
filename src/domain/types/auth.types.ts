/**
 * Qarayti.ai — Domain Authentication & RBAC Types
 * Security, Roles, and Permission Matrix Specifications
 */

import { BaseEntity } from './common.types';
import { EducationLevel, HighSchoolTrack, EducationLanguage } from './education.types';

export enum UserRole {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
  MANAGE = 'MANAGE',
}

export enum ResourceDomain {
  STUDENT_PORTAL = 'STUDENT_PORTAL',
  PARENT_PORTAL = 'PARENT_PORTAL',
  TEACHER_PORTAL = 'TEACHER_PORTAL',
  SCHOOL_PORTAL = 'SCHOOL_PORTAL',
  ADMIN_PORTAL = 'ADMIN_PORTAL',
  AI_TUTOR_FAHEEM = 'AI_TUTOR_FAHEEM',
  ANALYTICS = 'ANALYTICS',
  CURRICULUM_CONTENT = 'CURRICULUM_CONTENT',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
}

export interface Permission {
  resource: ResourceDomain;
  action: PermissionAction;
}

export interface UserProfile extends BaseEntity {
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  preferredLanguage: EducationLanguage;
  
  // Moroccan Academic Context
  educationLevel?: EducationLevel;
  track?: HighSchoolTrack;
  academicYear?: string; // e.g. "2025/2026"
  schoolId?: string;
  
  // Parental Link (if role is Student or Parent)
  linkedStudentIds?: string[]; // For Parent
  parentId?: string; // For Student

  isVerified: boolean;
  isActive: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  user: UserProfile;
}

export interface JWTClaims {
  sub: string; // User ID
  email: string;
  role: UserRole;
  schoolId?: string;
  iat: number;
  exp: number;
  iss: string;
}
