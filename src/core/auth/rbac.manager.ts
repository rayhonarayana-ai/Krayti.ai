/**
 * Qarayti.ai — Role-Based Access Control (RBAC) Engine
 * Strict permission matrix enforcement across all platform portals
 */

import { UserRole, ResourceDomain, PermissionAction } from '../../domain/types/auth.types';
import { logger } from '../logging/logger';

export class RBACManager {
  // Permission rules map: Role -> Map<ResourceDomain, Set<PermissionAction>>
  private permissionMatrix: Map<UserRole, Map<ResourceDomain, Set<PermissionAction>>>;

  constructor() {
    this.permissionMatrix = new Map();
    this.initializeDefaultMatrix();
  }

  private initializeDefaultMatrix(): void {
    // 1. STUDENT PERMISSIONS
    this.grant(UserRole.STUDENT, ResourceDomain.STUDENT_PORTAL, [PermissionAction.READ, PermissionAction.UPDATE]);
    this.grant(UserRole.STUDENT, ResourceDomain.AI_TUTOR_FAHEEM, [PermissionAction.READ, PermissionAction.EXECUTE]);
    this.grant(UserRole.STUDENT, ResourceDomain.CURRICULUM_CONTENT, [PermissionAction.READ]);

    // 2. PARENT PERMISSIONS
    this.grant(UserRole.PARENT, ResourceDomain.PARENT_PORTAL, [PermissionAction.READ, PermissionAction.UPDATE]);
    this.grant(UserRole.PARENT, ResourceDomain.ANALYTICS, [PermissionAction.READ]);
    this.grant(UserRole.PARENT, ResourceDomain.CURRICULUM_CONTENT, [PermissionAction.READ]);

    // 3. TEACHER PERMISSIONS
    this.grant(UserRole.TEACHER, ResourceDomain.TEACHER_PORTAL, [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.MANAGE]);
    this.grant(UserRole.TEACHER, ResourceDomain.STUDENT_PORTAL, [PermissionAction.READ]);
    this.grant(UserRole.TEACHER, ResourceDomain.CURRICULUM_CONTENT, [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE]);
    this.grant(UserRole.TEACHER, ResourceDomain.AI_TUTOR_FAHEEM, [PermissionAction.READ, PermissionAction.EXECUTE]);
    this.grant(UserRole.TEACHER, ResourceDomain.ANALYTICS, [PermissionAction.READ]);

    // 4. SCHOOL ADMIN PERMISSIONS
    this.grant(UserRole.SCHOOL_ADMIN, ResourceDomain.SCHOOL_PORTAL, [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.MANAGE]);
    this.grant(UserRole.SCHOOL_ADMIN, ResourceDomain.TEACHER_PORTAL, [PermissionAction.READ, PermissionAction.MANAGE]);
    this.grant(UserRole.SCHOOL_ADMIN, ResourceDomain.STUDENT_PORTAL, [PermissionAction.READ]);
    this.grant(UserRole.SCHOOL_ADMIN, ResourceDomain.ANALYTICS, [PermissionAction.READ, PermissionAction.EXECUTE]);

    // 5. SUPER ADMIN PERMISSIONS (Full Access to all domains)
    Object.values(ResourceDomain).forEach((resource) => {
      this.grant(UserRole.SUPER_ADMIN, resource, Object.values(PermissionAction));
    });

    logger.debug('RBACManager', 'RBAC matrix initialized for all 5 roles and 9 resource domains.');
  }

  private grant(role: UserRole, resource: ResourceDomain, actions: PermissionAction[]): void {
    if (!this.permissionMatrix.has(role)) {
      this.permissionMatrix.set(role, new Map());
    }
    const roleResources = this.permissionMatrix.get(role)!;
    
    if (!roleResources.has(resource)) {
      roleResources.set(resource, new Set());
    }
    const actionSet = roleResources.get(resource)!;

    actions.forEach((a) => actionSet.add(a));
  }

  public hasPermission(role: UserRole, resource: ResourceDomain, action: PermissionAction): boolean {
    const roleResources = this.permissionMatrix.get(role);
    if (!roleResources) return false;

    const actions = roleResources.get(resource);
    if (!actions) return false;

    const isAllowed = actions.has(action) || actions.has(PermissionAction.MANAGE);
    logger.debug('RBACManager', `Permission check: Role '${role}' on '${resource}:${action}' => ${isAllowed}`);
    return isAllowed;
  }

  public getRolePermissions(role: UserRole): Array<{ resource: ResourceDomain; actions: PermissionAction[] }> {
    const roleResources = this.permissionMatrix.get(role);
    if (!roleResources) return [];

    return Array.from(roleResources.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions),
    }));
  }
}

export const rbacManager = new RBACManager();
