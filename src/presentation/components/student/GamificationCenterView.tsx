/**
 * Qarayti.ai — Gamification Center View
 * Study Streak, XP System, Coins, Levels, Badges, Achievements & Leaderboards
 */

import React from 'react';
import {
  Flame,
  Award,
  Trophy,
  Zap,
  Target,
  Sparkles,
  Crown,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { StudentAchievement, LeaderboardUser } from '../../../domain/types/studentPortal.types';

interface GamificationCenterViewProps {
  achievements: StudentAchievement[];
  leaderboard: LeaderboardUser[];
}

export const GamificationCenterView: React.FC<GamificationCenterViewProps> = ({
  achievements,
  leaderboard,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>نظام الأوسمة ولوحة التنافس الوطني</span>
          </div>
          <h1 className="text-2xl font-black">
            مركز التميز والإنجازات (Gamification & Achievements Hub)
          </h1>
          <p className="text-xs text-purple-200/90">
            اكسب النقاط (XP) والعملات (Coins)، حافظ على السلسلة اليومية، وتصدار قائمة تلاميذ مسلك العلوم الرياضية على المستوى الوطني.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Achievements list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>قائمة الأوسمة والإنجازات (Achievements & Badges)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  ach.isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-purple-500/40 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl font-bold text-lg ${
                        ach.isUnlocked
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ach.isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ach.titleAr}</h3>
                      <div className="text-[11px] text-slate-500">{ach.titleFr}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                    +{ach.xpReward} XP
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ach.descriptionAr}
                </p>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>نسبة التقدم</span>
                    <span>{ach.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${ach.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>ترتيب التلاميذ الوطني</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
              مسلك العلوم الرياضية
            </span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.studentId}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  user.isCurrentUser
                    ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-500 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {user.rank}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-[10px] text-slate-500">هدف البكالوريا: {user.bacTarget}/20</div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs font-black text-purple-600 dark:text-purple-400">
                    {user.xp} XP
                  </div>
                  <div className="text-[10px] text-amber-500 font-medium">{user.streakDays} أيام streak</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
