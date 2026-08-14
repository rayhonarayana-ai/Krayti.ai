/**
 * Qarayti.ai — Administration Platform Domain Repository
 */

import {
  PlatformHealthOverview,
  ManagedSchoolItem,
  RegisterSchoolDTO,
  GlobalUserRecord,
  AIMonitoringSummary,
  PlatformMetricsSummary,
  SecurityAuditEntry,
  SecurityAlert,
  GlobalNotificationBroadcast,
  SubscriptionPlanDef,
  PlatformBillingInvoice,
  SupportTicketItem,
  GlobalSystemConfig,
  PlatformRole,
  SchoolStatus,
} from '../types/adminPlatform.types';

import {
  INITIAL_PLATFORM_HEALTH,
  INITIAL_MANAGED_SCHOOLS,
  INITIAL_GLOBAL_USERS,
  INITIAL_AI_MONITORING,
  INITIAL_PLATFORM_METRICS,
  INITIAL_SECURITY_AUDIT,
  INITIAL_SECURITY_ALERTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_BILLING_INVOICES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_GLOBAL_CONFIG,
} from '../data/adminPlatformData';

export interface IAdminPlatformRepository {
  getHealthOverview(): Promise<PlatformHealthOverview>;
  getSchools(): Promise<ManagedSchoolItem[]>;
  registerSchool(schoolDto: RegisterSchoolDTO): Promise<ManagedSchoolItem>;
  updateSchoolStatus(schoolId: string, status: SchoolStatus): Promise<ManagedSchoolItem>;
  getGlobalUsers(roleFilter?: PlatformRole, search?: string): Promise<GlobalUserRecord[]>;
  updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<GlobalUserRecord>;
  getAIMonitoring(): Promise<AIMonitoringSummary>;
  getPlatformMetrics(): Promise<PlatformMetricsSummary>;
  getSecurityAuditLogs(): Promise<SecurityAuditEntry[]>;
  getSecurityAlerts(): Promise<SecurityAlert[]>;
  resolveSecurityAlert(alertId: string): Promise<SecurityAlert>;
  getNotifications(): Promise<GlobalNotificationBroadcast[]>;
  broadcastNotification(title: string, message: string, targetRole: any): Promise<GlobalNotificationBroadcast>;
  getSubscriptionPlans(): Promise<SubscriptionPlanDef[]>;
  getBillingInvoices(): Promise<PlatformBillingInvoice[]>;
  getSupportTickets(): Promise<SupportTicketItem[]>;
  updateTicketStatus(ticketId: string, status: any): Promise<SupportTicketItem>;
  getGlobalConfig(): Promise<GlobalSystemConfig>;
  updateGlobalConfig(partial: Partial<GlobalSystemConfig>): Promise<GlobalSystemConfig>;
}

export class AdminPlatformRepository implements IAdminPlatformRepository {
  private health: PlatformHealthOverview = { ...INITIAL_PLATFORM_HEALTH };
  private schools: ManagedSchoolItem[] = [...INITIAL_MANAGED_SCHOOLS];
  private users: GlobalUserRecord[] = [...INITIAL_GLOBAL_USERS];
  private aiSummary: AIMonitoringSummary = { ...INITIAL_AI_MONITORING };
  private platformMetrics: PlatformMetricsSummary = { ...INITIAL_PLATFORM_METRICS };
  private auditLogs: SecurityAuditEntry[] = [...INITIAL_SECURITY_AUDIT];
  private securityAlerts: SecurityAlert[] = [...INITIAL_SECURITY_ALERTS];
  private notifications: GlobalNotificationBroadcast[] = [...INITIAL_NOTIFICATIONS];
  private subscriptionPlans: SubscriptionPlanDef[] = [...INITIAL_SUBSCRIPTION_PLANS];
  private billingInvoices: PlatformBillingInvoice[] = [...INITIAL_BILLING_INVOICES];
  private supportTickets: SupportTicketItem[] = [...INITIAL_SUPPORT_TICKETS];
  private globalConfig: GlobalSystemConfig = { ...INITIAL_GLOBAL_CONFIG };

  async getHealthOverview(): Promise<PlatformHealthOverview> {
    return {
      ...this.health,
      activeSchoolsCount: this.schools.filter((s) => s.status === 'ACTIVE').length,
    };
  }

  async getSchools(): Promise<ManagedSchoolItem[]> {
    return this.schools;
  }

  async registerSchool(schoolDto: RegisterSchoolDTO): Promise<ManagedSchoolItem> {
    const newSchool: ManagedSchoolItem = {
      id: `sch-${Date.now()}`,
      code: `SCH-${schoolDto.city.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: schoolDto.name,
      city: schoolDto.city,
      region: schoolDto.region,
      directorName: schoolDto.directorName,
      directorEmail: schoolDto.directorEmail,
      phone: schoolDto.phone,
      tier: schoolDto.tier,
      status: 'ACTIVE',
      studentCapacity: schoolDto.studentCapacity,
      currentStudentCount: 0,
      teacherCount: 0,
      storageUsedGb: 0.1,
      storageLimitGb: schoolDto.tier === 'ENTERPRISE_ACADEMY' ? 1000 : 250,
      monthlyFeeMAD: schoolDto.monthlyFeeMAD,
      renewalDate: '2027-08-31',
      healthScorePercent: 100,
    };
    this.schools.unshift(newSchool);
    return newSchool;
  }

  async updateSchoolStatus(schoolId: string, status: SchoolStatus): Promise<ManagedSchoolItem> {
    const school = this.schools.find((s) => s.id === schoolId);
    if (!school) throw new Error('School not found');
    school.status = status;
    return school;
  }

  async getGlobalUsers(roleFilter?: PlatformRole, search?: string): Promise<GlobalUserRecord[]> {
    let result = [...this.users];
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return result;
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<GlobalUserRecord> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.status = status;
    return user;
  }

  async getAIMonitoring(): Promise<AIMonitoringSummary> {
    return this.aiSummary;
  }

  async getPlatformMetrics(): Promise<PlatformMetricsSummary> {
    return this.platformMetrics;
  }

  async getSecurityAuditLogs(): Promise<SecurityAuditEntry[]> {
    return this.auditLogs;
  }

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    return this.securityAlerts;
  }

  async resolveSecurityAlert(alertId: string): Promise<SecurityAlert> {
    const alert = this.securityAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.isResolved = true;
    return alert;
  }

  async getNotifications(): Promise<GlobalNotificationBroadcast[]> {
    return this.notifications;
  }

  async broadcastNotification(title: string, message: string, targetRole: any): Promise<GlobalNotificationBroadcast> {
    const newBroadcast: GlobalNotificationBroadcast = {
      id: `ntf-${Date.now()}`,
      title,
      message,
      targetRole,
      senderAdmin: 'Super Admin Qarayti',
      dispatchTime: 'À l\'instant',
      deliveryStatus: 'DELIVERED',
      readCount: 1,
    };
    this.notifications.unshift(newBroadcast);
    return newBroadcast;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlanDef[]> {
    return this.subscriptionPlans;
  }

  async getBillingInvoices(): Promise<PlatformBillingInvoice[]> {
    return this.billingInvoices;
  }

  async getSupportTickets(): Promise<SupportTicketItem[]> {
    return this.supportTickets;
  }

  async updateTicketStatus(ticketId: string, status: any): Promise<SupportTicketItem> {
    const ticket = this.supportTickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = status;
    ticket.lastUpdated = 'À l\'instant';
    return ticket;
  }

  async getGlobalConfig(): Promise<GlobalSystemConfig> {
    return this.globalConfig;
  }

  async updateGlobalConfig(partial: Partial<GlobalSystemConfig>): Promise<GlobalSystemConfig> {
    this.globalConfig = {
      ...this.globalConfig,
      ...partial,
    };
    return this.globalConfig;
  }
}
