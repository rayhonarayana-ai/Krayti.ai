/**
 * Qarayti.ai — Sub-Module 1: Knowledge Graph Component
 * Interactive visual directed graph depicting concept nodes, prerequisite links,
 * bloom taxonomy levels, and real-time BKT mastery states.
 */

import React, { useState } from 'react';
import { useAdaptiveEngine } from '../../context/AdaptiveLearningContext';
import { KnowledgeNode } from '../../../domain/types/adaptive.types';
import { Network, Info, ArrowRight, ShieldAlert, CheckCircle2, Clock, BookOpen, ChevronRight } from 'lucide-react';

export const KnowledgeGraphView: React.FC = () => {
  const { nodes, edges, masteryMap, diagnostics } = useAdaptiveEngine();
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(nodes[0]);

  const filteredNodes = selectedSubject === 'ALL' ? nodes : nodes.filter((n) => n.subjectId === selectedSubject);

  // Layout positioning algorithm for SVG canvas
  const nodePositions = React.useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const subjectList = ['MATH', 'PHYS', 'SVT', 'PHIL'];
    
    filteredNodes.forEach((node, index) => {
      const subjIndex = subjectList.indexOf(node.subjectId);
      const row = subjIndex >= 0 ? subjIndex : 0;
      const col = index % 3;
      
      const x = 120 + col * 260 + (row % 2) * 40;
      const y = 90 + row * 150;
      positions[node.id] = { x, y };
    });

    return positions;
  }, [filteredNodes]);

  const getNodeColor = (nodeId: string) => {
    const record = masteryMap.get(nodeId);
    
    // Case 1: NO_EVIDENCE or record missing or masteryScore is null
    if (!record || record.evidenceState === 'NO_EVIDENCE' || record.masteryScore === null) {
      return { border: 'border-[#2D333D]', bg: 'bg-[#161920]', text: 'text-[#8E9299]', badge: 'NON ÉVALUÉ' };
    }

    // Case 2: INSUFFICIENT_EVIDENCE (1 observation)
    if (record.evidenceState === 'INSUFFICIENT_EVIDENCE') {
      return { border: 'border-sky-500/60', bg: 'bg-sky-950/30', text: 'text-sky-400', badge: 'EN ÉVALUATION' };
    }

    // Case 3: OBSERVED with numeric masteryScore
    const score = record.masteryScore;
    if (score >= 0.85) {
      return { border: 'border-emerald-500', bg: 'bg-emerald-950/40', text: 'text-emerald-400', badge: 'MAÎTRISÉ' };
    }
    if (score < 0.35) {
      return { border: 'border-rose-500', bg: 'bg-rose-950/40', text: 'text-rose-400', badge: 'LACUNE' };
    }
    return { border: 'border-amber-500', bg: 'bg-amber-950/40', text: 'text-amber-400', badge: 'EN COURS' };
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161920] border border-[#2D333D] p-4">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Graphe d'Apprentissage Connaissances</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Visualisation des dépendances directes, prérequis conceptuels et niveaux de maîtrise BKT.
          </p>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto bg-[#0F1115] p-1 border border-[#2D333D]">
          {['ALL', 'MATH', 'PHYS', 'SVT', 'PHIL'].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all uppercase ${
                selectedSubject === subj
                  ? 'bg-[#D4AF37] text-[#0F1115] font-bold'
                  : 'text-[#8E9299] hover:text-[#EAE9E6]'
              }`}
            >
              {subj === 'ALL' ? 'Tous Sujets' : subj}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Graph Canvas (SVG + HTML overlay) */}
        <div className="lg:col-span-2 bg-[#161920] border border-[#2D333D] p-4 relative min-h-[480px] overflow-auto">
          
          {/* Legend */}
          <div className="absolute top-4 right-4 z-10 bg-[#0F1115]/90 border border-[#2D333D] p-3 backdrop-blur text-[11px] font-mono space-y-1.5">
            <div className="text-[#8E9299] uppercase tracking-wider text-[10px] mb-1">Légende de Maîtrise</div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              <span className="text-emerald-400">Maîtrisé (&gt; 85%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              <span className="text-amber-400">En cours (35-85%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
              <span className="text-rose-400">Lacune / Alerte (&lt; 35%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-[#8E9299] rounded-full"></span>
              <span className="text-[#8E9299]">Non évalué (0 obs.)</span>
            </div>
          </div>

          <div className="relative w-full h-[450px]">
            {/* SVG Connecting Lines for Prerequisite Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="16"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#D4AF37" opacity="0.6" />
                </marker>
              </defs>
              {edges.map((edge) => {
                const sourcePos = nodePositions[edge.sourceId];
                const targetPos = nodePositions[edge.targetId];
                if (!sourcePos || !targetPos) return null;
                return (
                  <line
                    key={edge.id}
                    x1={sourcePos.x + 80}
                    y1={sourcePos.y + 25}
                    x2={targetPos.x + 80}
                    y2={targetPos.y + 25}
                    stroke="#2D333D"
                    strokeWidth="2"
                    strokeDasharray={edge.relationType === 'builds_on' ? '4 4' : undefined}
                    markerEnd="url(#arrow)"
                  />
                );
              })}
            </svg>

            {/* Node UI Cards */}
            {filteredNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 50, y: 50 };
              const colorInfo = getNodeColor(node.id);
              const record = masteryMap.get(node.id);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                  className={`absolute w-44 p-3 bg-[#0F1115] border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                    colorInfo.border
                  } ${isSelected ? 'ring-2 ring-[#D4AF37] scale-105 z-20' : 'hover:scale-102 z-10'}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8E9299]">
                    <span>{node.code}</span>
                    <span className={`px-1.5 py-0.2 font-bold ${colorInfo.text} ${colorInfo.bg}`}>
                      {colorInfo.badge}
                    </span>
                  </div>
                  <div className="text-xs font-serif italic text-[#EAE9E6] mt-1 line-clamp-1 font-bold">
                    {node.titleFr}
                  </div>
                  <div className="text-[11px] font-sans text-[#8E9299] dir-rtl text-right font-semibold">
                    {node.titleAr}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-[#2D333D] h-1.5 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        !record || record.evidenceState === 'NO_EVIDENCE' || record.masteryScore === null
                          ? 'bg-transparent'
                          : record.evidenceState === 'INSUFFICIENT_EVIDENCE'
                          ? 'bg-sky-400'
                          : record.masteryScore >= 0.85
                          ? 'bg-emerald-400'
                          : record.masteryScore < 0.35
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                      }`}
                      style={{
                        width:
                          record && record.masteryScore !== null && (record.evidenceState === 'OBSERVED' || record.evidenceState === 'INSUFFICIENT_EVIDENCE')
                            ? `${Math.round(record.masteryScore * 100)}%`
                            : '0%',
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-[#8E9299] mt-1">
                    <span>BAC: {node.nationalExamWeight}%</span>
                    <span className="text-[#D4AF37]">
                      {record && record.masteryScore !== null && (record.evidenceState === 'OBSERVED' || record.evidenceState === 'INSUFFICIENT_EVIDENCE')
                        ? `${Math.round(record.masteryScore * 100)}%`
                        : '--%'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="border-b border-[#2D333D] pb-3">
                <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
                  Fiche Technique du Nœud
                </span>
                <h3 className="text-xl font-serif italic text-[#EAE9E6] mt-1 font-bold">
                  {selectedNode.titleFr}
                </h3>
                <p className="text-sm font-sans text-[#8E9299] dir-rtl text-right mt-1 font-medium">
                  {selectedNode.titleAr}
                </p>
              </div>

              <div className="text-xs font-mono text-[#8E9299] space-y-2">
                <div className="flex justify-between border-b border-[#2D333D]/60 pb-1">
                  <span>Domaine / Sujet:</span>
                  <span className="text-[#EAE9E6] font-bold">{selectedNode.subjectName}</span>
                </div>
                <div className="flex justify-between border-b border-[#2D333D]/60 pb-1">
                  <span>Taxonomie de Bloom:</span>
                  <span className="text-[#D4AF37] font-bold">{selectedNode.bloomLevel}</span>
                </div>
                <div className="flex justify-between border-b border-[#2D333D]/60 pb-1">
                  <span>Pondération BAC:</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.nationalExamWeight}%</span>
                </div>
                <div className="flex justify-between border-b border-[#2D333D]/60 pb-1">
                  <span>Temps Estimé:</span>
                  <span className="text-[#EAE9E6]">{selectedNode.estimatedMinutes} min</span>
                </div>
                <div className="flex justify-between border-b border-[#2D333D]/60 pb-1">
                  <span>Niveau Complexité:</span>
                  <span className="text-[#D4AF37]">{'★'.repeat(selectedNode.complexity)}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-[#8E9299] uppercase">Description du Programme</span>
                <p className="text-xs text-[#EAE9E6] mt-1 bg-[#0F1115] p-3 border border-[#2D333D] leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Prerequisites Chain */}
              <div>
                <span className="text-xs font-mono text-[#8E9299] uppercase">Prérequis Directs</span>
                <div className="mt-1 space-y-1">
                  {selectedNode.prerequisiteIds.length === 0 ? (
                    <p className="text-xs font-mono text-[#8E9299] italic">Aucun prérequis requis (Nœud Racinaire)</p>
                  ) : (
                    selectedNode.prerequisiteIds.map((pId) => {
                      const pNode = nodes.find((n) => n.id === pId);
                      return (
                        <div key={pId} className="flex items-center justify-between bg-[#0F1115] p-2 border border-[#2D333D] text-xs">
                          <span className="font-mono text-[#D4AF37]">{pId}</span>
                          <span className="text-[#EAE9E6] font-serif italic">{pNode?.titleFr || pId}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-xs font-mono text-[#8E9299]">
              Cliquez sur un nœud du graphe pour inspecter ses métriques.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
