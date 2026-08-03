/**
 * Qarayti.ai — Knowledge Graph & Skill Tree View
 * Knowledge Graph Visualizer, Skill Tree & Weakness Diagnostics
 */

import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SkillTreeNode, WeaknessDiagnostic } from '../../../domain/types/adaptive.types';

interface KnowledgeGraphViewProps {
  skills: SkillTreeNode[];
  weaknesses: WeaknessDiagnostic[];
  onNavigateTab: (tabId: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  skills,
  weaknesses,
  onNavigateTab,
}) => {
  const [selectedSubject, setSelectedSubject] = useState('الرياضيات');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
            <Brain className="w-3.5 h-3.5" />
            <span>شجرة المهارات وخريطة المفاهيم</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            شجرة المهارات والتعثرات المرصودة (Knowledge Graph & Skill Tree)
          </h1>
          <p className="text-xs text-slate-500">
            تمثيل مهارات البكالوريا وترابط المفاهيم المسبقة مع تحديد ثغرات التعلم وتوصيات التدارك.
          </p>
        </div>
      </div>

      {/* Weakness Alert Section */}
      {weaknesses.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>التعثرات المرصودة آلياً من طرف نظام فهيم الذكي ({weaknesses.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknesses.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{w.nodeTitle}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                    تاثير البكالوريا: {w.impactScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>خطة التدارك:</strong> {w.remediationRecommendation}
                </p>
                <button
                  onClick={() => onNavigateTab('practice-exercises')}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>بدء خطة التدارك الموصى بها</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Tree Nodes */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>مسار المهارات التراكمي للبكالوريا (Skill Tree Nodes)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {skills.map((sk) => (
            <div
              key={sk.id}
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                sk.status === 'mastered'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40'
                  : sk.status === 'weak'
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">مستوى {sk.tier}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sk.status === 'mastered'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : sk.status === 'weak'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  {sk.status === 'mastered' ? 'مستوعب' : sk.status === 'weak' ? 'تعثر' : 'قيد التعلم'}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-white">{sk.titleAr}</div>
              <div className="text-xs text-slate-500">{sk.category}</div>

              <div className="pt-2 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 border-t border-slate-200/50 dark:border-slate-800">
                <span>مكافأة: +{sk.xpReward} XP</span>
                {sk.status === 'mastered' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
