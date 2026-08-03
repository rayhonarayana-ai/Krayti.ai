/**
 * Qarayti.ai — Sub-Module 6: Daily Plan Component
 * Dynamic adaptive agenda, time-blocked micro-tasks, progress completion toggles,
 * and burn-down study time tracker.
 */

import React from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { Calendar, CheckSquare, Square, Clock, Flame, Zap, BarChart } from 'lucide-react';

export const DailyPlanView: React.FC = () => {
  const { dailyPlan, toggleDailyPlanItem, activeStudent } = useAdaptiveEngine();

  const totalMinutes = dailyPlan.reduce((acc, item) => acc + item.durationMinutes, 0);
  const completedMinutes = dailyPlan
    .filter((item) => item.completed)
    .reduce((acc, item) => acc + item.durationMinutes, 0);
  const completionPercentage = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Planning Quotidien Adaptatif (Daily Plan)</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Agenda dynamique optimisé selon la disponibilité horaire et le niveau de fatigue cognitive.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#0F1115] border border-[#2D333D] px-3 py-1.5 text-xs font-mono">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[#8E9299]">Série d'Étude:</span>
          <span className="text-[#D4AF37] font-bold">{activeStudent.streakDays} Jours Consécutifs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Task Agenda */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#161920] border border-[#2D333D] p-6 space-y-4">
            
            {/* Progress Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2D333D] pb-4 gap-2">
              <div>
                <span className="text-xs font-mono text-[#D4AF37] uppercase">Objectif du Jour</span>
                <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
                  {completedMinutes} min / {totalMinutes} min effectuées
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-[#8E9299]">Progression Agenda</span>
                <div className="text-2xl font-serif text-emerald-400 font-bold">
                  {completionPercentage}%
                </div>
              </div>
            </div>

            {/* Burn-Down Bar */}
            <div className="w-full bg-[#0F1115] border border-[#2D333D] h-3 overflow-hidden">
              <div
                className="bg-[#D4AF37] h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              {dailyPlan.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleDailyPlanItem(item.id)}
                  className={`p-4 border cursor-pointer transition-all flex items-center justify-between ${
                    item.completed
                      ? 'bg-[#0F1115]/60 border-emerald-500/40 opacity-70'
                      : 'bg-[#0F1115] border-[#2D333D] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button className="mt-0.5 text-[#D4AF37]">
                      {item.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-[#8E9299]" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-[#8E9299]">
                        <span className="text-[#D4AF37]">{item.scheduledTime}</span>
                        <span>•</span>
                        <span className="uppercase">{item.subjectName}</span>
                      </div>
                      <div
                        className={`text-sm font-serif italic font-bold mt-0.5 ${
                          item.completed ? 'line-through text-[#8E9299]' : 'text-[#EAE9E6]'
                        }`}
                      >
                        {item.taskTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-[#EAE9E6] flex items-center justify-end space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{item.durationMinutes} min</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#8E9299] uppercase">
                      {item.exerciseType}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Daily Stats & Recommendations */}
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
          <div className="border-b border-[#2D333D] pb-3">
            <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
              Métriques de la Journée
            </div>
            <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold mt-1">
              Capacité d'Assimilation
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-[#0F1115] border border-[#2D333D] p-3 space-y-1">
              <div className="flex justify-between text-[#8E9299]">
                <span>Temps Restant estimé:</span>
                <span className="text-[#EAE9E6] font-bold">{totalMinutes - completedMinutes} min</span>
              </div>
              <div className="flex justify-between text-[#8E9299]">
                <span>Tâches accomplies:</span>
                <span className="text-[#D4AF37] font-bold">
                  {dailyPlan.filter((i) => i.completed).length} / {dailyPlan.length}
                </span>
              </div>
            </div>

            <div className="bg-[#0F1115] border border-[#2D333D] p-3 space-y-2">
              <span className="text-[#D4AF37] font-bold uppercase">Conseil Pédagogique du Jour</span>
              <p className="text-[11px] text-[#8E9299] leading-relaxed">
                Alternez 25 minutes de pratique intensive (Pomodoro) avec 5 minutes de pause pour stabiliser le transfert vers la mémoire réticulaire.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
