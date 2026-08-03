/**
 * Qarayti.ai — Adaptive Engine Summary Bar
 * High-level engine telemetry displaying active student, BAC target, overall mastery,
 * weakness count, and spaced repetition queue.
 */

import React from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { UserCheck, Target, Zap, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

export const EngineSummaryBar: React.FC = () => {
  const { activeStudent, allProfiles, selectStudentProfile, analytics, diagnostics, cards, resetEngineState } =
    useAdaptiveEngine();

  const overdueCardsCount = cards.filter((c) => c.retentionProbability < 0.65).length;

  return (
    <div className="bg-[#161920] border border-[#2D333D] p-4 md:p-6 mb-6 rounded-none shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Student Selector & Avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 border border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center font-serif text-[#D4AF37] font-bold text-xl">
            {activeStudent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
                Etudiant BAC Active
              </span>
              <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 font-mono border border-[#D4AF37]/40">
                {activeStudent.track}
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <select
                value={activeStudent.id}
                onChange={(e) => selectStudentProfile(e.target.value)}
                className="bg-[#0F1115] border border-[#2D333D] text-[#EAE9E6] font-serif text-lg font-medium px-2 py-1 focus:outline-none focus:border-[#D4AF37]"
              >
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.track})
                  </option>
                ))}
              </select>
              <div className="text-xs font-mono text-[#8E9299]">
                Streak: <span className="text-[#EAE9E6] font-bold">{activeStudent.streakDays}j</span> • XP: <span className="text-[#D4AF37] font-bold">{activeStudent.xp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t lg:border-t-0 lg:border-l border-[#2D333D] pt-4 lg:pt-0 lg:pl-6">
          
          {/* BAC Target Forecast */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-[#8E9299] text-xs font-mono">
              <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>PREDICTION BAC</span>
            </div>
            <div className="text-xl md:text-2xl font-serif text-[#D4AF37] font-bold mt-1">
              {analytics.forecastBacScore} <span className="text-xs font-mono text-[#8E9299]">/ 20</span>
            </div>
            <div className="text-[10px] text-[#8E9299] font-mono">
              Cible: {activeStudent.targetBacScore}/20
            </div>
          </div>

          {/* Overall Knowledge Mastery */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-[#8E9299] text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>MAÎTRISE GLOBALE</span>
            </div>
            <div className="text-xl md:text-2xl font-serif text-[#EAE9E6] font-bold mt-1">
              {analytics.overallMastery}%
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              {analytics.masteredNodesCount}/{analytics.totalNodesCount} modules acquis
            </div>
          </div>

          {/* Weakness Count */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-[#8E9299] text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>LACUNES ACTIVES</span>
            </div>
            <div className="text-xl md:text-2xl font-serif text-rose-400 font-bold mt-1">
              {diagnostics.length}
            </div>
            <div className="text-[10px] text-[#8E9299] font-mono">
              {diagnostics.filter((d) => d.severity === 'critical').length} critiques
            </div>
          </div>

          {/* Overdue Revision Cards */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-[#8E9299] text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>RÉVISIONS SM-2</span>
            </div>
            <div className="text-xl md:text-2xl font-serif text-amber-400 font-bold mt-1">
              {overdueCardsCount}
            </div>
            <div className="text-[10px] text-[#8E9299] font-mono">
              Rétention &lt; 65%
            </div>
          </div>
        </div>

        {/* Reset / Refresh Engine */}
        <div className="flex items-center justify-end">
          <button
            onClick={resetEngineState}
            className="flex items-center space-x-2 border border-[#2D333D] hover:border-[#D4AF37] px-3 py-2 text-xs font-mono text-[#8E9299] hover:text-[#D4AF37] transition-all bg-[#0F1115]"
            title="Reinitialiser les métriques de l'étudiant"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser État</span>
          </button>
        </div>

      </div>
    </div>
  );
};
