/**
 * Qarayti.ai — Adaptive Learning Engine Container
 * Central dashboard orchestrating all 10 core sub-modules:
 * 1. Knowledge Graph
 * 2. Skill Tree
 * 3. Mastery Tracking (BKT)
 * 4. Weakness Detection
 * 5. Recommendation Engine
 * 6. Daily Plan
 * 7. Revision Engine
 * 8. Spaced Repetition (SM-2 / FSRS)
 * 9. Difficulty Prediction (IRT)
 * 10. Learning Analytics
 */

import React, { useState } from 'react';
import { AdaptiveLearningProvider } from '../../context/AdaptiveLearningContext';
import { EngineSummaryBar } from './EngineSummaryBar';
import { KnowledgeGraphView } from './KnowledgeGraphView';
import { SkillTreeView } from './SkillTreeView';
import { MasteryTrackingView } from './MasteryTrackingView';
import { WeaknessDetectionView } from './WeaknessDetectionView';
import { RecommendationEngineView } from './RecommendationEngineView';
import { DailyPlanView } from './DailyPlanView';
import { RevisionEngineView } from './RevisionEngineView';
import { SpacedRepetitionView } from './SpacedRepetitionView';
import { DifficultyPredictionView } from './DifficultyPredictionView';
import { LearningAnalyticsView } from './LearningAnalyticsView';

import {
  Network,
  Award,
  Activity,
  ShieldAlert,
  Compass,
  Calendar,
  Repeat,
  Clock,
  Target,
  BarChart3,
  Cpu,
} from 'lucide-react';

export const AdaptiveEngineContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('graph');

  const modules = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'skills', label: 'Skill Tree', icon: Award },
    { id: 'mastery', label: 'Mastery Tracking (BKT)', icon: Activity },
    { id: 'weakness', label: 'Weakness Detection', icon: ShieldAlert },
    { id: 'recommend', label: 'Recommendation Engine', icon: Compass },
    { id: 'daily', label: 'Daily Plan', icon: Calendar },
    { id: 'revision', label: 'Revision Engine', icon: Repeat },
    { id: 'spaced', label: 'Spaced Repetition (SM-2)', icon: Clock },
    { id: 'difficulty', label: 'Difficulty Prediction (IRT)', icon: Target },
    { id: 'analytics', label: 'Learning Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Telemetry Summary Bar */}
      <EngineSummaryBar />

      {/* Module Sub-Navigation Bar */}
      <div className="bg-[#161920] border border-[#2D333D] p-2 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {modules.map((mod) => {
            const IconComponent = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono tracking-wider transition-all whitespace-nowrap border ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#0F1115] text-[#D4AF37] font-bold shadow-md'
                    : 'border-transparent text-[#8E9299] hover:text-[#EAE9E6] hover:bg-[#0F1115]/50'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#8E9299]'}`} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-Module View */}
      <div className="transition-all duration-300">
        {activeModule === 'graph' && <KnowledgeGraphView />}
        {activeModule === 'skills' && <SkillTreeView />}
        {activeModule === 'mastery' && <MasteryTrackingView />}
        {activeModule === 'weakness' && <WeaknessDetectionView />}
        {activeModule === 'recommend' && <RecommendationEngineView />}
        {activeModule === 'daily' && <DailyPlanView />}
        {activeModule === 'revision' && <RevisionEngineView />}
        {activeModule === 'spaced' && <SpacedRepetitionView />}
        {activeModule === 'difficulty' && <DifficultyPredictionView />}
        {activeModule === 'analytics' && <LearningAnalyticsView />}
      </div>
    </div>
  );
};

export const AdaptiveEngineContainer: React.FC = () => {
  return (
    <AdaptiveLearningProvider>
      <AdaptiveEngineContent />
    </AdaptiveLearningProvider>
  );
};
