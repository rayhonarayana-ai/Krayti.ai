/**
 * Qarayti.ai — Multi-Channel Notification Engine
 * Centralized dispatcher for In-App, Push, Email, SMS (MEN Gateway simulation), and WebSocket alerts.
 */

import { logger } from '../logging/logger';
import { realtimeEngine } from '../realtime/realtime-engine';
import { circuitBreakerEngine } from './governance/circuit-breaker';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'WEBSOCKET';

export interface QaraytiNotification {
  id: string;
  recipientId: string;
  recipientRole: 'STUDENT' | 'TEACHER' | 'PARENT' | 'SCHOOL_MANAGER' | 'SUPER_ADMIN';
  title: string;
  body: string;
  channels: NotificationChannel[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export class QaraytiNotificationEngine {
  private static instance: QaraytiNotificationEngine;
  private notificationsStore: QaraytiNotification[] = [
    {
      id: 'ntf-101',
      recipientId: 'student-youssef',
      recipientRole: 'STUDENT',
      title: '📚 Nouveau Devoir de Mathématiques',
      body: 'M. Alami a publié un devoir sur les Limites & Continuité (Échéance: Vendredi 18h).',
      channels: ['IN_APP', 'PUSH', 'WEBSOCKET'],
      priority: 'HIGH',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'ntf-102',
      recipientId: 'parent-benali',
      recipientRole: 'PARENT',
      title: '📊 Bulletin Trimestriel Disponible',
      body: 'Le bulletin du 1er Semestre de Youssef Benali est validé par la direction.',
      channels: ['IN_APP', 'SMS', 'EMAIL'],
      priority: 'NORMAL',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'ntf-103',
      recipientId: 'teacher-alami',
      recipientRole: 'TEACHER',
      title: '📝 Devoir Soumis par 18 Élèves',
      body: '18 élèves sur 24 ont rendu le devoir de Physique-Chimie.',
      channels: ['IN_APP', 'WEBSOCKET'],
      priority: 'NORMAL',
      isRead: true,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  private constructor() {
    logger.info('QaraytiNotificationEngine', 'Multi-Channel Notification Dispatcher online.');
  }

  public static getInstance(): QaraytiNotificationEngine {
    if (!QaraytiNotificationEngine.instance) {
      QaraytiNotificationEngine.instance = new QaraytiNotificationEngine();
    }
    return QaraytiNotificationEngine.instance;
  }

  /**
   * Dispatch a multi-channel notification to a target user or role group.
   */
  public async dispatch(
    recipientId: string,
    recipientRole: QaraytiNotification['recipientRole'],
    title: string,
    body: string,
    channels: NotificationChannel[] = ['IN_APP', 'WEBSOCKET'],
    priority: QaraytiNotification['priority'] = 'NORMAL',
    metadata?: Record<string, unknown>
  ): Promise<QaraytiNotification> {
    const notification: QaraytiNotification = {
      id: `ntf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientId,
      recipientRole,
      title,
      body,
      channels,
      priority,
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata,
    };

    this.notificationsStore.unshift(notification);

    // Simulated multi-channel delivery with Circuit Breaker Protection
    for (const ch of channels) {
      switch (ch) {
        case 'WEBSOCKET':
        case 'IN_APP':
          realtimeEngine.publish(`notifications:${recipientId}`, 'NEW_NOTIFICATION', notification);
          break;
        case 'SMS':
          await circuitBreakerEngine.execute(
            'SMS_PARENT_GATEWAY',
            async () => {
              logger.info('QaraytiNotificationEngine', `[SMS GATEWAY MEN] Sent SMS to ${recipientId}: ${title}`);
            },
            async () => {
              logger.warn('QaraytiNotificationEngine', `[SMS GATEWAY FALLBACK] Circuit open! Fallback to Push & In-App notification for ${recipientId}`);
              realtimeEngine.publish(`notifications:${recipientId}`, 'NEW_NOTIFICATION', {
                ...notification,
                body: `[SMS Failover Alert] ${notification.body}`,
              });
            }
          );
          break;
        case 'EMAIL':
          await circuitBreakerEngine.execute(
            'EMAIL_SMTP_RELAY',
            async () => {
              logger.info('QaraytiNotificationEngine', `[EMAIL GATEWAY] Sent Email to ${recipientId}: ${title}`);
            },
            async () => {
              logger.warn('QaraytiNotificationEngine', `[EMAIL FALLBACK] Circuit open! Logging email dispatch to backup queue.`);
            }
          );
          break;
        case 'PUSH':
          logger.info('QaraytiNotificationEngine', `[FCM PUSH] Sent Push to ${recipientId}: ${title}`);
          break;
      }
    }

    return notification;
  }

  /**
   * Get notifications for a recipient or role.
   */
  public getNotificationsForUser(recipientId: string, role?: QaraytiNotification['recipientRole']): QaraytiNotification[] {
    return this.notificationsStore.filter(
      (n) => n.recipientId === recipientId || (role && n.recipientRole === role)
    );
  }

  /**
   * Mark notification as read.
   */
  public markAsRead(notificationId: string): void {
    const item = this.notificationsStore.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = true;
    }
  }

  public getUnreadCount(recipientId: string): number {
    return this.notificationsStore.filter((n) => n.recipientId === recipientId && !n.isRead).length;
  }
}

export const qaraytiNotificationEngine = QaraytiNotificationEngine.getInstance();
