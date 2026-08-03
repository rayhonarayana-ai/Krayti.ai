/**
 * Qarayti.ai — Parent Portal: Sub-Module 7: Notifications & Alerts
 * Centralized Feed for School Notifications, Teacher Messages, AI Alerts, Exam/Homework Reminders.
 */

import React, { useState } from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  Calendar,
  BookOpen,
  MessageSquare,
  CreditCard,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { activeChild, notifications, markNotificationRead, markAllNotificationsRead } = useParentPortal();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const childNotifications = notifications.filter((n) => n.childId === activeChild.id);
  const filteredNotifications = filterCategory === 'ALL'
    ? childNotifications
    : childNotifications.filter((n) => n.category === filterCategory);

  const unreadCount = childNotifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Centre de Notifications & Alertes Parentales
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Mises à jour Massar, alertes de présence, convocations d'examens et notifications des professeurs.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="flex items-center space-x-2 px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold text-xs font-mono uppercase hover:bg-amber-400 self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tout Marquer Comme Lu ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {['ALL', 'GRADE', 'ATTENDANCE', 'PAYMENT', 'ANNOUNCEMENT', 'TEACHER'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 text-xs font-mono border whitespace-nowrap uppercase ${
              filterCategory === cat
                ? 'bg-[#D4AF37] text-[#0F1115] font-bold border-[#D4AF37]'
                : 'bg-[#161920] text-[#8E9299] border-[#2D333D] hover:text-[#EAE9E6]'
            }`}
          >
            {cat === 'ALL' ? 'Toutes' : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#161920] border border-[#2D333D] p-8 text-center text-xs font-mono text-[#8E9299]">
            Aucune notification trouvée pour cette catégorie.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`bg-[#161920] border p-4 flex items-start justify-between gap-4 cursor-pointer transition-all ${
                n.read
                  ? 'border-[#2D333D] opacity-75'
                  : 'border-[#D4AF37] bg-[#161920] shadow-md'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30 uppercase">
                    {n.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#EAE9E6]">{n.title}</span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block animate-pulse" />
                  )}
                </div>
                <p className="text-xs font-serif text-[#8E9299] leading-relaxed">{n.message}</p>
                <span className="text-[10px] font-mono text-[#8E9299] block pt-1">{n.timestamp}</span>
              </div>

              <span
                className={`text-[9px] font-mono uppercase px-2 py-0.5 border shrink-0 ${
                  n.severity === 'ALERT'
                    ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                    : n.severity === 'WARNING'
                    ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {n.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
