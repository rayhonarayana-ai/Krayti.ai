/**
 * Qarayti.ai — Administration Platform Domain Use Cases
 */

import { AdminPlatformService } from '../services/adminPlatform.service';
import {
  RegisterSchoolDTO,
  PlatformRole,
  SchoolStatus,
  GlobalSystemConfig,
} from '../types/adminPlatform.types';

export class AdminPlatformUseCases {
  constructor(private service: AdminPlatformService = new AdminPlatformService()) {}

  async getDashboardSummary() {
    const [health, schools, ai, metrics, config] = await Promise.all([
      this.service.fetchHealthOverview(),
      this.service.fetchSchools(),
      this.service.fetchAIMonitoring(),
      this.service.fetchPlatformMetrics(),
      this.service.fetchGlobalConfig(),
    ]);

    return { health, schools, ai, metrics, config };
  }

  async registerNewSchool(dto: RegisterSchoolDTO) {
    return this.service.registerSchool(dto);
  }

  async toggleSchoolStatus(schoolId: string, currentStatus: SchoolStatus) {
    return this.service.toggleSchoolStatus(schoolId, currentStatus);
  }

  async searchUsers(role?: PlatformRole, query?: string) {
    return this.service.fetchGlobalUsers(role, query);
  }

  async toggleUserStatus(userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') {
    return this.service.toggleUserStatus(userId, currentStatus);
  }

  async getAIMonitoringDetails() {
    return this.service.fetchAIMonitoring();
  }

  async getSystemTelemetry() {
    return this.service.fetchPlatformMetrics();
  }

  async getSecurityOverview() {
    return this.service.fetchSecurityAudit();
  }

  async resolveAlert(alertId: string) {
    return this.service.resolveSecurityAlert(alertId);
  }

  async dispatchBroadcast(title: string, message: string, targetRole: any) {
    return this.service.sendBroadcast(title, message, targetRole);
  }

  async getNotifications() {
    return this.service.fetchNotifications();
  }

  async getSubscriptionsAndBilling() {
    const [plans, invoices] = await Promise.all([
      this.service.fetchSubscriptionPlans(),
      this.service.fetchBillingInvoices(),
    ]);
    return { plans, invoices };
  }

  async getSupportTickets() {
    return this.service.fetchSupportTickets();
  }

  async changeTicketStatus(ticketId: string, status: any) {
    return this.service.updateTicketStatus(ticketId, status);
  }

  async getGlobalConfig() {
    return this.service.fetchGlobalConfig();
  }

  async saveGlobalConfig(partial: Partial<GlobalSystemConfig>) {
    return this.service.updateGlobalConfig(partial);
  }
}
