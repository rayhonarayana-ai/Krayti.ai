/**
 * Qarayti.ai — Administration Platform Context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
} from '../../domain/types/adminPlatform.types';
import { AdminPlatformUseCases } from '../../domain/usecases/adminPlatform.usecases';

interface AdminPlatformContextType {
  health: PlatformHealthOverview | null;
  schools: ManagedSchoolItem[];
  users: GlobalUserRecord[];
  aiMonitoring: AIMonitoringSummary | null;
  platformMetrics: PlatformMetricsSummary | null;
  securityLogs: SecurityAuditEntry[];
  securityAlerts: SecurityAlert[];
  notifications: GlobalNotificationBroadcast[];
  plans: SubscriptionPlanDef[];
  invoices: PlatformBillingInvoice[];
  tickets: SupportTicketItem[];
  config: GlobalSystemConfig | null;
  isLoading: boolean;
  registerSchool: (dto: RegisterSchoolDTO) => Promise<void>;
  toggleSchoolStatus: (schoolId: string, currentStatus: SchoolStatus) => Promise<void>;
  searchUsers: (role?: PlatformRole, query?: string) => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  resolveSecurityAlert: (alertId: string) => Promise<void>;
  broadcastNotification: (title: string, message: string, targetRole: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: any) => Promise<void>;
  updateGlobalConfig: (partial: Partial<GlobalSystemConfig>) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AdminPlatformContext = createContext<AdminPlatformContextType | undefined>(undefined);

export const AdminPlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useCases] = useState(() => new AdminPlatformUseCases());
  const [health, setHealth] = useState<PlatformHealthOverview | null>(null);
  const [schools, setSchools] = useState<ManagedSchoolItem[]>([]);
  const [users, setUsers] = useState<GlobalUserRecord[]>([]);
  const [aiMonitoring, setAiMonitoring] = useState<AIMonitoringSummary | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetricsSummary | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEntry[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [notifications, setNotifications] = useState<GlobalNotificationBroadcast[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanDef[]>([]);
  const [invoices, setInvoices] = useState<PlatformBillingInvoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [config, setConfig] = useState<GlobalSystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const summary = await useCases.getDashboardSummary();
      setHealth(summary.health);
      setSchools(summary.schools);
      setAiMonitoring(summary.ai);
      setPlatformMetrics(summary.metrics);
      setConfig(summary.config);

      const [sec, uList, notifs, subBill, tkts] = await Promise.all([
        useCases.getSecurityOverview(),
        useCases.searchUsers(),
        useCases.getNotifications(),
        useCases.getSubscriptionsAndBilling(),
        useCases.getSupportTickets(),
      ]);

      setSecurityLogs(sec.logs);
      setSecurityAlerts(sec.alerts);
      setUsers(uList);
      setNotifications(notifs);
      setPlans(subBill.plans);
      setInvoices(subBill.invoices);
      setTickets(tkts);
    } catch (err) {
      console.error('Error initializing Admin Platform Context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const registerSchool = async (dto: RegisterSchoolDTO) => {
    const created = await useCases.registerNewSchool(dto);
    setSchools((prev) => [created, ...prev]);
  };

  const toggleSchoolStatus = async (schoolId: string, currentStatus: SchoolStatus) => {
    const updated = await useCases.toggleSchoolStatus(schoolId, currentStatus);
    setSchools((prev) => prev.map((s) => (s.id === schoolId ? updated : s)));
  };

  const searchUsers = async (role?: PlatformRole, query?: string) => {
    const res = await useCases.searchUsers(role, query);
    setUsers(res);
  };

  const toggleUserStatus = async (userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
    const updated = await useCases.toggleUserStatus(userId, currentStatus);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  const resolveSecurityAlert = async (alertId: string) => {
    const updated = await useCases.resolveAlert(alertId);
    setSecurityAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
  };

  const broadcastNotification = async (title: string, message: string, targetRole: any) => {
    const newNotif = await useCases.dispatchBroadcast(title, message, targetRole);
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateTicketStatus = async (ticketId: string, status: any) => {
    const updated = await useCases.changeTicketStatus(ticketId, status);
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
  };

  const updateGlobalConfig = async (partial: Partial<GlobalSystemConfig>) => {
    const updated = await useCases.saveGlobalConfig(partial);
    setConfig(updated);
  };

  return (
    <AdminPlatformContext.Provider
      value={{
        health,
        schools,
        users,
        aiMonitoring,
        platformMetrics,
        securityLogs,
        securityAlerts,
        notifications,
        plans,
        invoices,
        tickets,
        config,
        isLoading,
        registerSchool,
        toggleSchoolStatus,
        searchUsers,
        toggleUserStatus,
        resolveSecurityAlert,
        broadcastNotification,
        updateTicketStatus,
        updateGlobalConfig,
        refreshAll: loadData,
      }}
    >
      {children}
    </AdminPlatformContext.Provider>
  );
};

export const useAdminPlatform = () => {
  const context = useContext(AdminPlatformContext);
  if (!context) {
    throw new Error('useAdminPlatform must be used within an AdminPlatformProvider');
  }
  return context;
};
