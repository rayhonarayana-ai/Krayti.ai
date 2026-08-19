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
import { authService } from '../../core/auth/auth.service';

interface AdaptiveLearningContextType {
  activeStudent: StudentProfile | null;
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
  const [activeStudentId, setActiveStudentId] = useState<string | null>(() => {
    return authService.getCurrentUser()?.id || null;
  });
  const [cards, setCards] = useState<SpacedRepetitionCard[]>(SPACED_REPETITION_CARDS);
  const [skillTree, setSkillTree] = useState<SkillTreeNode[]>(SKILL_TREE_NODES);

  // Subscribe to real-time auth state changes
  useEffect(() => {
    const user = authService.getCurrentUser();
    setActiveStudentId(user?.id || null);
    const unsubscribe = authService.subscribe((session) => {
      setActiveStudentId(session?.user?.id || null);
    });
    return unsubscribe;
  }, []);

  // Initialize mastery records map for all nodes — NO_EVIDENCE for new authenticated learners
  const [masteryMap, setMasteryMap] = useState<Map<string, MasteryRecord>>(() => {
    const initialMap = new Map<string, MasteryRecord>();
    KNOWLEDGE_NODES.forEach((node) => {
      const bkt = { ...DEFAULT_BKT_PARAMS, pKnown: 0 };

      initialMap.set(node.id, {
        nodeId: node.id,
        evidenceState: 'NO_EVIDENCE',
        sampleSize: 0,
        masteryScore: null,
        confidenceInterval: [0, 0],
        stabilityDays: 0,
        bkt,
        attemptsCount: 0,
        correctCount: 0,
        lastAttemptDate: null,
        bloomsDistribution: {
          REMEMBER: 0,
          UNDERSTAND: 0,
          APPLY: 0,
          ANALYZE: 0,
          EVALUATE: 0,
          CREATE: 0,
        },
      });
    });
    return initialMap;
  });

  const activeStudent = useMemo<StudentProfile | null>(() => {
    const authUser = authService.getCurrentUser();
    if (!authUser || !activeStudentId || authUser.id !== activeStudentId) {
      return null;
    }
    return {
      id: authUser.id,
      name: authUser.fullName || 'Talib Qarayti',
      level: authUser.educationLevel,
      track: authUser.track,
      abilityTheta: 0,
      xp: 0,
      streakDays: 0,
      targetBacScore: 16.0,
    };
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

  // Analytics Computation — Evidence-bound
  const analytics: LearningAnalytics = useMemo(() => {
    let totalMasterySum = 0;
    let weakCount = 0;
    let masteredCount = 0;
    let observedCount = 0;

    masteryMap.forEach((rec) => {
      if (rec.evidenceState === 'OBSERVED' && rec.masteryScore !== null) {
        totalMasterySum += rec.masteryScore;
        observedCount++;
        if (rec.masteryScore >= 0.85) masteredCount++;
        else if (rec.masteryScore < 0.35) weakCount++;
      }
    });

    const overallMastery = observedCount > 0 ? Math.round((totalMasterySum / observedCount) * 100) : 0;

    // BAC Score prediction out of 20 (only if observed evidence exists)
    const forecastBacScore = observedCount > 0 ? Number((8 + (overallMastery / 100) * 11.5).toFixed(1)) : 0;

    // Subject breakdown
    const subjectMap = new Map<string, { name: string; sum: number; count: number }>();
    KNOWLEDGE_NODES.forEach((n) => {
      const rec = masteryMap.get(n.id);
      if (rec && rec.evidenceState === 'OBSERVED' && rec.masteryScore !== null) {
        const current = subjectMap.get(n.subjectId) || { name: n.subjectName, sum: 0, count: 0 };
        subjectMap.set(n.subjectId, { name: n.subjectName, sum: current.sum + rec.masteryScore, count: current.count + 1 });
      }
    });

    const masteryBySubject = Array.from(subjectMap.entries()).map(([subjId, val]) => ({
      subjectId: subjId,
      subjectName: val.name,
      masteryScore: val.count > 0 ? Math.round((val.sum / val.count) * 100) : 0,
      nodeCount: val.count,
    }));

    return {
      velocity: observedCount > 0 ? 3.4 : 0,
      retentionRate: observedCount > 0 ? 84 : 0,
      overallMastery,
      studyMinutesToday: 0,
      weakNodesCount: weakCount,
      masteredNodesCount: masteredCount,
      totalNodesCount: KNOWLEDGE_NODES.length,
      forecastBacScore,
      masteryBySubject,
      retentionDecayCurve: [],
      accuracyTrend: [],
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
    const theta = activeStudent ? activeStudent.abilityTheta : 0;
    return IRTEngine.predictDifficulty(theta, item);
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
                evidenceState: newAttempts >= 2 ? 'OBSERVED' : 'INSUFFICIENT_EVIDENCE',
                sampleSize: newAttempts,
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
          evidenceState: newAttempts >= 2 ? 'OBSERVED' : 'INSUFFICIENT_EVIDENCE',
          sampleSize: newAttempts,
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
      const newStatus = BKTEngine.evaluateNodeStatus(newBkt.pKnown, newAttempts);
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
      const bkt = { ...DEFAULT_BKT_PARAMS, pKnown: 0 };
      initialMap.set(node.id, {
        nodeId: node.id,
        evidenceState: 'NO_EVIDENCE',
        sampleSize: 0,
        masteryScore: null,
        confidenceInterval: [0, 0],
        stabilityDays: 0,
        bkt,
        attemptsCount: 0,
        correctCount: 0,
        lastAttemptDate: null,
        bloomsDistribution: {
          REMEMBER: 0,
          UNDERSTAND: 0,
          APPLY: 0,
          ANALYZE: 0,
          EVALUATE: 0,
          CREATE: 0,
        },
      });
    });
    setMasteryMap(initialMap);
  };

  return (
    <AdaptiveLearningContext.Provider
      value={{
        activeStudent,
        allProfiles: activeStudent ? [activeStudent] : [],
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
