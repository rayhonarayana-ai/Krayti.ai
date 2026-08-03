/**
 * Qarayti.ai — Sub-Module 2: Skill Tree Component
 * Progressive tier-by-tier skill tree showing skill activation, XP rewards,
 * locked/unlocked state transitions, and mastery progress.
 */

import React, { useState } from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { SkillTreeNode } from '../../../domain/types/adaptive.types';
import { Lock, Unlock, CheckCircle2, Star, Zap, ChevronRight, Award, Compass, TrendingUp, Activity, Maximize2, Radio, Cpu, Layers } from 'lucide-react';

export const SkillTreeView: React.FC = () => {
  const { skillTree, masteryMap } = useAdaptiveEngine();
  const [selectedSkill, setSelectedSkill] = useState<SkillTreeNode | null>(skillTree[0]);

  const tiers = [1, 2, 3, 4, 5];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return TrendingUp;
      case 'Activity': return Activity;
      case 'Maximize2': return Maximize2;
      case 'Zap': return Zap;
      case 'Layers': return Layers;
      case 'Compass': return Compass;
      case 'Radio': return Radio;
      case 'Cpu': return Cpu;
      default: return Star;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Arbre des Compétences (Skill Tree)</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Déblocage séquentiel par palier (Tiers 1-5) avec récompenses XP et prérequis obligatoires.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tier-by-Tier Skill Tree */}
        <div className="lg:col-span-2 space-y-6 bg-[#161920] border border-[#2D333D] p-6">
          {tiers.map((tier) => {
            const tierSkills = skillTree.filter((s) => s.tier === tier);
            if (tierSkills.length === 0) return null;

            return (
              <div key={tier} className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase">
                    Palier Tier 0{tier}
                  </span>
                  <div className="flex-1 h-[1px] bg-[#2D333D]"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tierSkills.map((skill) => {
                    const IconComponent = getIcon(skill.iconName);
                    const record = masteryMap.get(skill.nodeId);
                    const masteryScore = record ? record.masteryScore : 0.25;
                    const isSelected = selectedSkill?.id === skill.id;

                    let statusBadge = { border: 'border-[#2D333D]', bg: 'bg-[#0F1115]', text: 'text-[#8E9299]', label: 'VERROUILLÉ' };

                    if (skill.status === 'mastered') {
                      statusBadge = { border: 'border-emerald-500', bg: 'bg-emerald-950/20', text: 'text-emerald-400', label: 'MAÎTRISÉ' };
                    } else if (skill.status === 'in_progress') {
                      statusBadge = { border: 'border-amber-500', bg: 'bg-amber-950/20', text: 'text-amber-400', label: 'EN COURS' };
                    } else if (skill.status === 'available') {
                      statusBadge = { border: 'border-sky-500', bg: 'bg-sky-950/20', text: 'text-sky-400', label: 'DISPONIBLE' };
                    } else if (skill.status === 'weak') {
                      statusBadge = { border: 'border-rose-500', bg: 'bg-rose-950/20', text: 'text-rose-400', label: 'A RENFORCER' };
                    }

                    return (
                      <div
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill)}
                        className={`p-4 border cursor-pointer transition-all ${statusBadge.bg} ${statusBadge.border} ${
                          isSelected ? 'ring-2 ring-[#D4AF37] scale-102' : 'hover:border-[#D4AF37]/60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 border ${statusBadge.border} bg-[#0F1115]`}>
                              <IconComponent className={`w-5 h-5 ${statusBadge.text}`} />
                            </div>
                            <div>
                              <div className="text-xs font-mono text-[#8E9299] uppercase">{skill.category}</div>
                              <div className="text-sm font-serif italic text-[#EAE9E6] font-bold">{skill.title}</div>
                            </div>
                          </div>
                          {skill.status === 'mastered' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : skill.status === 'locked' ? (
                            <Lock className="w-4 h-4 text-[#8E9299]" />
                          ) : (
                            <Unlock className="w-4 h-4 text-sky-400" />
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs font-mono">
                          <span className={statusBadge.text}>{statusBadge.label}</span>
                          <span className="text-[#D4AF37] font-bold">+{skill.xpReward} XP</span>
                        </div>

                        <div className="mt-2 w-full bg-[#2D333D] h-1.5 overflow-hidden">
                          <div
                            className="bg-[#D4AF37] h-full transition-all duration-300"
                            style={{ width: `${Math.round(masteryScore * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Skill Details */}
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
          {selectedSkill ? (
            <div className="space-y-4">
              <div className="border-b border-[#2D333D] pb-3">
                <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">Compétence Sélectionnée</div>
                <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold mt-1">{selectedSkill.title}</h3>
                <p className="text-sm font-sans text-[#8E9299] dir-rtl text-right mt-1 font-semibold">{selectedSkill.titleAr}</p>
              </div>

              <div className="bg-[#0F1115] border border-[#2D333D] p-4 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#8E9299]">Palier (Tier):</span>
                  <span className="text-[#EAE9E6] font-bold">Palier 0{selectedSkill.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E9299]">Statut Actuel:</span>
                  <span className="text-[#D4AF37] font-bold uppercase">{selectedSkill.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E9299]">Récompense XP:</span>
                  <span className="text-[#D4AF37] font-bold">+{selectedSkill.xpReward} XP</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-[#8E9299] uppercase">Prérequis de Déblocage</span>
                <div className="mt-2 space-y-1">
                  {selectedSkill.prerequisiteSkillIds.length === 0 ? (
                    <div className="text-xs font-mono text-emerald-400 bg-emerald-950/20 p-2 border border-emerald-500/30">
                      ✓ Compétence de départ (Aucun prérequis)
                    </div>
                  ) : (
                    selectedSkill.prerequisiteSkillIds.map((pId) => {
                      const pSkill = skillTree.find((s) => s.id === pId);
                      return (
                        <div key={pId} className="flex items-center justify-between bg-[#0F1115] p-2 border border-[#2D333D] text-xs font-mono">
                          <span className="text-[#D4AF37]">{pSkill?.title || pId}</span>
                          <span className="text-emerald-400">MAÎTRISÉ</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-xs font-mono text-[#8E9299]">
              Sélectionnez une compétence dans l'arbre.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
