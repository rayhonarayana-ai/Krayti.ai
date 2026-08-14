/**
 * Qarayti.ai — Super Admin Notifications Center View
 */

import React, { useState } from 'react';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
} from 'lucide-react';
import { useAdminPlatform } from '../../context/AdminPlatformContext';

export const AdminNotificationsCenterView: React.FC = () => {
  const { notifications, broadcastNotification } = useAdminPlatform();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'SCHOOL_MANAGERS' | 'TEACHERS' | 'STUDENTS' | 'PARENTS'>('ALL');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSending(true);
    await broadcastNotification(title, message, targetRole);
    setIsSending(false);
    setTitle('');
    setMessage('');
    setSuccessMessage('Diffusion envoyée avec succès à tous les destinataires cibles!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Broadcast Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Diffuser une Notification Globale
            </h3>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Audience Cible</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="ALL">📢 Tous les Utilisateurs (Écoles, Profs, Élèves, Parents)</option>
                <option value="SCHOOL_MANAGERS">🏢 Directeurs et Administrateurs d'Écoles</option>
                <option value="TEACHERS">👨‍🏫 Corps Enseignant Uniquement</option>
                <option value="STUDENTS">🎓 Élèves Uniquement</option>
                <option value="PARENTS">👪 Parents d'Élèves Uniquement</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Titre de l'Annonce</label>
              <input
                type="text"
                required
                placeholder="ex: Mise à jour du Barème National BAC..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Message / Corps de la Notification</label>
              <textarea
                required
                rows={4}
                placeholder="Rédigez l'annonce officielle qui sera affichée dans le centre de notifications des utilisateurs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Envoi en cours...' : 'Envoyer la Diffusion Instantanée'}</span>
            </button>
          </form>
        </div>

        {/* Right Column (2 cols): Broadcast History */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Historique des Diffusions Générales</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">{notifications.length} Diffusions</span>
          </div>

          <div className="space-y-3">
            {notifications.map((ntf) => (
              <div
                key={ntf.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{ntf.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {ntf.targetRole}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ntf.message}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span>Expéditeur: {ntf.senderAdmin}</span>
                  <span>Date: {ntf.dispatchTime}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Lectures: {ntf.readCount.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
