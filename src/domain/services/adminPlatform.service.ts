/**
 * Qarayti.ai — Administration Platform Domain Service
 */

import {
  IAdminPlatformRepository,
  AdminPlatformRepository,
} from '../repositories/adminPlatform.repository';
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

export class AdminPlatformService {
  constructor(private repo: IAdminPlatformRepository = new AdminPlatformRepository()) {}

  async fetchHealthOverview(): Promise<PlatformHealthOverview> {
    return this.repo.getHealthOverview();
  }

  async fetchSchools(): Promise<ManagedSchoolItem[]> {
    return this.repo.getSchools();
  }

  async registerSchool(schoolDto: RegisterSchoolDTO): Promise<ManagedSchoolItem> {
    if (!schoolDto.name || !schoolDto.city || !schoolDto.directorEmail) {
      throw new Error('Les informations obligatoires de l\'école sont manquantes.');
    }
    return this.repo.registerSchool(schoolDto);
  }

  async toggleSchoolStatus(schoolId: string, currentStatus: SchoolStatus): Promise<ManagedSchoolItem> {
    const nextStatus: SchoolStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return this.repo.updateSchoolStatus(schoolId, nextStatus);
  }

  async fetchGlobalUsers(roleFilter?: PlatformRole, search?: string): Promise<GlobalUserRecord[]> {
    return this.repo.getGlobalUsers(roleFilter, search);
  }

  async toggleUserStatus(userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED'): Promise<GlobalUserRecord> {
    const next = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return this.repo.updateUserStatus(userId, next);
  }

  async fetchAIMonitoring(): Promise<AIMonitoringSummary> {
    return this.repo.getAIMonitoring();
  }

  async fetchPlatformMetrics(): Promise<PlatformMetricsSummary> {
    return this.repo.getPlatformMetrics();
  }

  async fetchSecurityAudit(): Promise<{ logs: SecurityAuditEntry[]; alerts: SecurityAlert[] }> {
    const [logs, alerts] = await Promise.all([
      this.repo.getSecurityAuditLogs(),
      this.repo.getSecurityAlerts(),
    ]);
    return { logs, alerts };
  }

  async resolveSecurityAlert(alertId: string): Promise<SecurityAlert> {
    return this.repo.resolveSecurityAlert(alertId);
  }

  async fetchNotifications(): Promise<GlobalNotificationBroadcast[]> {
    return this.repo.getNotifications();
  }

  async sendBroadcast(title: string, message: string, targetRole: any): Promise<GlobalNotificationBroadcast> {
    if (!title || !message) throw new Error('Titre et message obligatoires.');
    return this.repo.broadcastNotification(title, message, targetRole);
  }

  async fetchSubscriptionPlans(): Promise<SubscriptionPlanDef[]> {
    return this.repo.getSubscriptionPlans();
  }

  async fetchBillingInvoices(): Promise<PlatformBillingInvoice[]> {
    return this.repo.getBillingInvoices();
  }

  async fetchSupportTickets(): Promise<SupportTicketItem[]> {
    return this.repo.getSupportTickets();
  }

  async updateTicketStatus(ticketId: string, status: any): Promise<SupportTicketItem> {
    return this.repo.updateTicketStatus(ticketId, status);
  }

  async fetchGlobalConfig(): Promise<GlobalSystemConfig> {
    return this.repo.getGlobalConfig();
  }

  async updateGlobalConfig(partial: Partial<GlobalSystemConfig>): Promise<GlobalSystemConfig> {
    return this.repo.updateGlobalConfig(partial);
  }
}
