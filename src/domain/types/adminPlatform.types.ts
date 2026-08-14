/**
 * Qarayti.ai — Administration Platform (Super Admin Portal) Domain Types
 */

export type PlatformRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'SCHOOL_MANAGER' | 'SUPER_ADMIN';

export type SchoolSubscriptionTier = 'FREE_STARTER' | 'PRO_EXCELLENCE' | 'ENTERPRISE_ACADEMY';

export type SchoolStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_ONBOARDING' | 'MAINTENANCE';

export interface PlatformHealthOverview {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  uptimePercentage: number; // e.g. 99.98
  activeSchoolsCount: number;
  activeTeachersCount: number;
  activeStudentsCount: number;
  activeParentsCount: number;
  dailyActiveUsersCount: number;
  aiRequestsToday: number;
  monthlyRecurringRevenueMAD: number;
  arrGrowthRatePercent: number;
  systemLoadAverage: number;
}

export interface ManagedSchoolItem {
  id: string;
  code: string; // e.g. SCH-CAS-001
  name: string; // e.g. Lycée d'Excellence Casablanca
  city: string;
  region: string;
  directorName: string;
  directorEmail: string;
  phone: string;
  tier: SchoolSubscriptionTier;
  status: SchoolStatus;
  studentCapacity: number;
  currentStudentCount: number;
  teacherCount: number;
  storageUsedGb: number;
  storageLimitGb: number;
  monthlyFeeMAD: number;
  renewalDate: string;
  healthScorePercent: number;
}

export interface RegisterSchoolDTO {
  name: string;
  city: string;
  region: string;
  directorName: string;
  directorEmail: string;
  phone: string;
  tier: SchoolSubscriptionTier;
  studentCapacity: number;
  monthlyFeeMAD: number;
}

export interface GlobalUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: PlatformRole;
  schoolName: string;
  city: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  lastLogin: string;
  createdAt: string;
  massarOrCinId?: string;
}

export interface AIMonitoringSummary {
  totalRequestsToday: number;
  avgResponseTimeMs: number;
  totalTokensUsedToday: number;
  costTodayMAD: number;
  errorRatePercent: number;
  activeAiSessions: number;
  modelBreakdown: {
    geminiFlashRequests: number;
    geminiProRequests: number;
    faheemRagQueries: number;
  };
  recentAiErrors: Array<{
    id: string;
    timestamp: string;
    errorType: string;
    userRole: string;
    promptSnippet: string;
  }>;
}

export interface PlatformMetricsSummary {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  queuePendingJobs: number;
  queueProcessedJobs: number;
  cacheHitRatioPercent: number;
  databaseConnectionsActive: number;
  databaseConnectionsMax: number;
  apiHealthLatencyMs: number;
  storageBucketUsageGb: number;
  activeWebsockets: number;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: PlatformRole;
  action: string;
  ipAddress: string;
  location: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceIp: string;
  isResolved: boolean;
}

export interface GlobalNotificationBroadcast {
  id: string;
  title: string;
  message: string;
  targetRole: 'ALL' | 'SCHOOL_MANAGERS' | 'TEACHERS' | 'STUDENTS' | 'PARENTS';
  senderAdmin: string;
  dispatchTime: string;
  deliveryStatus: 'DELIVERED' | 'DISPATCHING' | 'SCHEDULED';
  readCount: number;
}

export interface SubscriptionPlanDef {
  id: SchoolSubscriptionTier;
  title: string;
  priceMonthlyMAD: number;
  maxStudents: number;
  maxStorageGb: number;
  features: string[];
  activeSubscribersCount: number;
}

export interface PlatformBillingInvoice {
  id: string;
  schoolName: string;
  amountMAD: number;
  dueDate: string;
  paidDate?: string;
  status: 'PAID' | 'OVERDUE' | 'PENDING';
  planTier: SchoolSubscriptionTier;
  pdfUrl?: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  schoolName: string;
  requesterName: string;
  requesterRole: PlatformRole;
  subject: string;
  category: 'MASSAR_SYNC' | 'BILLING' | 'AI_FAHEEM' | 'ACCOUNT_ACCESS' | 'TECHNICAL';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  lastUpdated: string;
  messagesCount: number;
}

export interface GlobalSystemConfig {
  maintenanceMode: boolean;
  allowPublicRegistrations: boolean;
  faheemAiRateLimitPerMin: number;
  maxConcurrentSessionsPerUser: number;
  requireMfaForAdmins: boolean;
  autoBackupIntervalHours: number;
  debugTelemetryLogs: boolean;
  announcementBannerMessage?: string;
}
