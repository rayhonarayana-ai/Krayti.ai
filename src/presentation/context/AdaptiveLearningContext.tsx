/**
 * Qarayti.ai — Adaptive Learning Engine State Context
 * State management for real-time BKT updates, Spaced Repetition reviews, IRT difficulty calculations,
 * weakness diagnostics, recommendations, and daily study plan.
 */

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  KnowledgeNode,
  KnowledgeEdge,
  SkillTreeNode,
  MasteryRecord,
  WeaknessDiagnostic,
  Recommendation,
  DailyPlanItem,
  SpacedRepetitionCard,
  IRTItemParameters,
  DifficultyPrediction,
  LearningAnalytics,
  StudentProfile,
} from '../../domain/types/adaptive.types';

import {
  INITIAL_STUDENT_PROFILES,
  KNOWLEDGE_NODES,
  KNOWLEDGE_EDGES,
  SKILL_TREE_NODES,
  SPACED_REPETITION_CARDS,
  IRT_ITEM_DATABASE,
} from '../../domain/data/adaptiveCurriculumData';

import { BKTEngine, DEFAULT_BKT_PARAMS } from '../../core/adaptive/bktEngine';
import { SpacedRepetitionEngine } from '../../core/adaptive/spacedRepetitionEngine';
import { IRTEngine } from '../../core/adaptive/irtEngine';
import { WeaknessDetector } from '../../core/adaptive/weaknessDetector';
import { RecommendationEngine } from '../../core/adaptive/recommendationEngine';
import { DailyPlanGenerator } from '../../core/adaptive/dailyPlanGenerator';

interface AdaptiveLearningContextType {
  activeStudent: StudentProfile;
  allProfiles: StudentProfile[];
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  skillTree: SkillTreeNode[];
  cards: SpacedRepetitionCard[];
  masteryMap: Map<string, MasteryRecord>;
  diagnostics: WeaknessDiagnostic[];
  recommendations: Recommendation[];
  dailyPlan: DailyPlanItem[];
  analytics: LearningAnalytics;
  irtDatabase: IRTItemParameters[];
  
  // Interactive Operations
  selectStudentProfile: (profileId: string) => void;
  submitCardReview: (cardId: string, qualityScore: number) => void;
  submitNodeQuizAnswer: (nodeId: string, questionId: string, isCorrect: boolean, responseTimeSeconds: number) => void;
  toggleDailyPlanItem: (itemId: string) => void;
  getDifficultyPredictionForNode: (nodeId: string) => DifficultyPrediction;
  resetEngineState: () => void;
}

const AdaptiveLearningContext = createContext<AdaptiveLearningContextType | undefined>(undefined);

export const AdaptiveLearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeStudentId, setActiveStudentId] = useState<string>('student-1');
  const [cards, setCards] = useState<SpacedRepetitionCard[]>(SPACED_REPETITION_CARDS);
  const [skillTree, setSkillTree] = useState<SkillTreeNode[]>(SKILL_TREE_NODES);

  // Initialize mastery records map for all nodes
  const [masteryMap, setMasteryMap] = useState<Map<string, MasteryRecord>>(() => {
    const initialMap = new Map<string, MasteryRecord>();
    KNOWLEDGE_NODES.forEach((node) => {
      // Custom initial mastery scores for demonstration
      let pKnown = 0.45;
      let attempts = 3;
      let correct = 2;

      if (node.id === 'MATH-01' || node.id === 'PHYS-01') {
        pKnown = 0.92;
        attempts = 10;
        correct = 9;
      } else if (node.id === 'PHYS-03' || node.id === 'MATH-06') {
        pKnown = 0.28;
        attempts = 4;
        correct = 1;
      } else if (node.id === 'MATH-03') {
        pKnown = 0.62;
        attempts = 6;
        correct = 4;
      }

      const bkt = { ...DEFAULT_BKT_PARAMS, pKnown };
      const confidence = BKTEngine.calculateConfidenceInterval(pKnown, attempts);

      initialMap.set(node.id, {
        nodeId: node.id,
        masteryScore: pKnown,
        confidenceInterval: confidence,
        stabilityDays: Math.round(pKnown * 14) + 1,
        bkt,
        attemptsCount: attempts,
        correctCount: correct,
        lastAttemptDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        bloomsDistribution: {
          REMEMBER: Math.min(1, pKnown + 0.1),
          UNDERSTAND: Math.min(1, pKnown),
          APPLY: Math.max(0.1, pKnown - 0.1),
          ANALYZE: Math.max(0.05, pKnown - 0.2),
          EVALUATE: Math.max(0.0, pKnown - 0.3),
          CREATE: Math.max(0.0, pKnown - 0.4),
        },
      });
    });
    return initialMap;
  });

  const activeStudent = useMemo(() => {
    return INITIAL_STUDENT_PROFILES.find((p) => p.id === activeStudentId) || INITIAL_STUDENT_PROFILES[0];
  }, [activeStudentId]);

  // Computed Weakness Diagnostics
  const diagnostics = useMemo(() => {
    return WeaknessDetector.detectWeaknesses(KNOWLEDGE_NODES, masteryMap, cards);
  }, [masteryMap, cards]);

  // Computed Recommendations
  const recommendations = useMemo(() => {
    return RecommendationEngine.generateRecommendations(KNOWLEDGE_NODES, masteryMap, diagnostics, cards);
  }, [masteryMap, diagnostics, cards]);

  // Daily Plan State
  const [dailyPlan, setDailyPlan] = useState<DailyPlanItem[]>(() => {
    const initialRecs = RecommendationEngine.generateRecommendations(
      KNOWLEDGE_NODES,
      masteryMap,
      WeaknessDetector.detectWeaknesses(KNOWLEDGE_NODES, masteryMap, cards),
      cards
    );
    return DailyPlanGenerator.generateDailyPlan(initialRecs, 120);
  });

  // Re-sync daily plan when recommendations change significantly
  useEffect(() => {
    setDailyPlan((prev) => {
      const generated = DailyPlanGenerator.generateDailyPlan(recommendations, 120);
      // Preserve completion status if item ID matches
      return generated.map((gen) => {
        const existing = prev.find((p) => p.nodeId === gen.nodeId);
        return existing ? { ...gen, completed: existing.completed } : gen;
      });
    });
  }, [recommendations]);

  // Analytics Computation
  const analytics: LearningAnalytics = useMemo(() => {
    let totalMasterySum = 0;
    let weakCount = 0;
    let masteredCount = 0;

    masteryMap.forEach((rec) => {
      totalMasterySum += rec.masteryScore;
      if (rec.masteryScore >= 0.85) masteredCount++;
      else if (rec.masteryScore < 0.35) weakCount++;
    });

    const overallMastery = Math.round((totalMasterySum / KNOWLEDGE_NODES.length) * 100);

    // BAC Score prediction out of 20
    const forecastBacScore = Number((8 + (overallMastery / 100) * 11.5).toFixed(1));

    // Subject breakdown
    const subjectMap = new Map<string, { name: string; sum: number; count: number }>();
    KNOWLEDGE_NODES.forEach((n) => {
      const rec = masteryMap.get(n.id);
      const score = rec ? rec.masteryScore : 0.25;
      const current = subjectMap.get(n.subjectId) || { name: n.subjectName, sum: 0, count: 0 };
      subjectMap.set(n.subjectId, { name: n.subjectName, sum: current.sum + score, count: current.count + 1 });
    });

    const masteryBySubject = Array.from(subjectMap.entries()).map(([subjId, val]) => ({
      subjectId: subjId,
      subjectName: val.name,
      masteryScore: Math.round((val.sum / val.count) * 100),
      nodeCount: val.count,
    }));

    // Retention Decay Curve (Last 7 Days)
    const retentionDecayCurve = [
      { daysAgo: 0, retentionRate: 98, predictedRetention: 98 },
      { daysAgo: 1, retentionRate: 91, predictedRetention: 92 },
      { daysAgo: 2, retentionRate: 84, predictedRetention: 85 },
      { daysAgo: 3, retentionRate: 77, predictedRetention: 78 },
      { daysAgo: 4, retentionRate: 72, predictedRetention: 71 },
      { daysAgo: 5, retentionRate: 68, predictedRetention: 65 },
      { daysAgo: 6, retentionRate: 63, predictedRetention: 60 },
    ];

    const accuracyTrend = [
      { date: 'Mon', accuracy: 65, attempts: 12 },
      { date: 'Tue', accuracy: 72, attempts: 15 },
      { date: 'Wed', accuracy: 68, attempts: 10 },
      { date: 'Thu', accuracy: 80, attempts: 18 },
      { date: 'Fri', accuracy: 85, attempts: 22 },
      { date: 'Sat', accuracy: 88, attempts: 25 },
      { date: 'Sun', accuracy: 91, attempts: 20 },
    ];

    return {
      velocity: 3.4,
      retentionRate: 84,
      overallMastery,
      studyMinutesToday: 75,
      weakNodesCount: weakCount,
      masteredNodesCount: masteredCount,
      totalNodesCount: KNOWLEDGE_NODES.length,
      forecastBacScore,
      masteryBySubject,
      retentionDecayCurve,
      accuracyTrend,
    };
  }, [masteryMap]);

  // Helper to get IRT difficulty prediction
  const getDifficultyPredictionForNode = (nodeId: string): DifficultyPrediction => {
    const item = IRT_ITEM_DATABASE.find((i) => i.nodeId === nodeId) || {
      nodeId,
      questionId: `q-${nodeId}`,
      difficultyBeta: 0.2,
      discriminationAlpha: 1.3,
      pseudoguessingGamma: 0.05,
    };
    return IRTEngine.predictDifficulty(activeStudent.abilityTheta, item);
  };

  // Actions
  const selectStudentProfile = (profileId: string) => {
    setActiveStudentId(profileId);
  };

  const submitCardReview = (cardId: string, qualityScore: number) => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id === cardId) {
          const updatedCard = SpacedRepetitionEngine.updateCardReview(card, qualityScore);
          
          // Also update BKT for the node linked to card
          const isCorrect = qualityScore >= 3;
          const currentRecord = masteryMap.get(card.nodeId);
          if (currentRecord) {
            const newBkt = BKTEngine.updateMastery(currentRecord.bkt, isCorrect);
            const newAttempts = currentRecord.attemptsCount + 1;
            const newCorrect = currentRecord.correctCount + (isCorrect ? 1 : 0);
            const newConfidence = BKTEngine.calculateConfidenceInterval(newBkt.pKnown, newAttempts);

            setMasteryMap((prevMap) => {
              const nextMap = new Map(prevMap);
              nextMap.set(card.nodeId, {
                ...currentRecord,
                masteryScore: newBkt.pKnown,
                confidenceInterval: newConfidence,
                bkt: newBkt,
                attemptsCount: newAttempts,
                correctCount: newCorrect,
                lastAttemptDate: new Date().toISOString(),
              });
              return nextMap;
            });
          }

          return updatedCard;
        }
        return card;
      })
    );
  };

  const submitNodeQuizAnswer = (
    nodeId: string,
    questionId: string,
    isCorrect: boolean,
    responseTimeSeconds: number
  ) => {
    // 1. Update BKT
    const currentRecord = masteryMap.get(nodeId);
    if (currentRecord) {
      const newBkt = BKTEngine.updateMastery(currentRecord.bkt, isCorrect, responseTimeSeconds);
      const newAttempts = currentRecord.attemptsCount + 1;
      const newCorrect = currentRecord.correctCount + (isCorrect ? 1 : 0);
      const newConfidence = BKTEngine.calculateConfidenceInterval(newBkt.pKnown, newAttempts);

      setMasteryMap((prevMap) => {
        const nextMap = new Map(prevMap);
        nextMap.set(nodeId, {
          ...currentRecord,
          masteryScore: newBkt.pKnown,
          confidenceInterval: newConfidence,
          bkt: newBkt,
          attemptsCount: newAttempts,
          correctCount: newCorrect,
          lastAttemptDate: new Date().toISOString(),
        });
        return nextMap;
      });

      // 2. Update Skill Tree Node status if needed
      const newStatus = BKTEngine.evaluateNodeStatus(newBkt.pKnown);
      setSkillTree((prevTree) =>
        prevTree.map((stNode) => {
          if (stNode.nodeId === nodeId) {
            return { ...stNode, status: newStatus };
          }
          return stNode;
        })
      );
    }
  };

  const toggleDailyPlanItem = (itemId: string) => {
    setDailyPlan((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const resetEngineState = () => {
    setCards(SPACED_REPETITION_CARDS);
    setSkillTree(SKILL_TREE_NODES);
    const initialMap = new Map<string, MasteryRecord>();
    KNOWLEDGE_NODES.forEach((node) => {
      const pKnown = 0.45;
      initialMap.set(node.id, {
        nodeId: node.id,
        masteryScore: pKnown,
        confidenceInterval: [0.35, 0.55],
        stabilityDays: 5,
        bkt: { ...DEFAULT_BKT_PARAMS, pKnown },
        attemptsCount: 3,
        correctCount: 2,
        lastAttemptDate: new Date().toISOString(),
        bloomsDistribution: {
          REMEMBER: 0.6,
          UNDERSTAND: 0.5,
          APPLY: 0.4,
          ANALYZE: 0.2,
          EVALUATE: 0.1,
          CREATE: 0.05,
        },
      });
    });
    setMasteryMap(initialMap);
  };

  return (
    <AdaptiveLearningContext.Provider
      value={{
        activeStudent,
        allProfiles: INITIAL_STUDENT_PROFILES,
        nodes: KNOWLEDGE_NODES,
        edges: KNOWLEDGE_EDGES,
        skillTree,
        cards,
        masteryMap,
        diagnostics,
        recommendations,
        dailyPlan,
        analytics,
        irtDatabase: IRT_ITEM_DATABASE,
        selectStudentProfile,
        submitCardReview,
        submitNodeQuizAnswer,
        toggleDailyPlanItem,
        getDifficultyPredictionForNode,
        resetEngineState,
      }}
    >
      {children}
    </AdaptiveLearningContext.Provider>
  );
};

export const useAdaptiveEngine = () => {
  const context = useContext(AdaptiveLearningContext);
  if (!context) {
    throw new Error('useAdaptiveEngine must be used within an AdaptiveLearningProvider');
  }
  return context;
};
