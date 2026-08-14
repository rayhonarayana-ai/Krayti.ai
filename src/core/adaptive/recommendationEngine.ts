/**
 * Qarayti.ai — Recommendation Engine
 * Generates prioritized learning recommendations based on BKT mastery, Spaced Repetition decay,
 * Moroccan BAC exam weightings, and weakness bottleneck analysis.
 */

import {
  KnowledgeNode,
  MasteryRecord,
  WeaknessDiagnostic,
  Recommendation,
  SpacedRepetitionCard,
} from '../../domain/types/adaptive.types';

export class RecommendationEngine {
  /**
   * Generates prioritized recommendations list.
   */
  public static generateRecommendations(
    nodes: KnowledgeNode[],
    masteryMap: Map<string, MasteryRecord>,
    diagnostics: WeaknessDiagnostic[],
    cards: SpacedRepetitionCard[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 1. Check for Prerequisite Bottlenecks from diagnostics
    const criticalGaps = diagnostics.filter((d) => d.severity === 'critical');
    criticalGaps.forEach((gap) => {
      const targetNode = nodes.find((n) => n.id === gap.nodeId);
      if (!targetNode) return;

      // If root cause prerequisite exists, recommend fixing prerequisite first
      if (gap.rootCauseNodeIds.length > 0) {
        const rootNodeId = gap.rootCauseNodeIds[0];
        const rootNode = nodes.find((n) => n.id === rootNodeId);
        if (rootNode) {
          recommendations.push({
            id: `rec-prereq-${rootNode.id}`,
            nodeId: rootNode.id,
            title: `Résoudre le goulot d'étranglement: ${rootNode.titleFr}`,
            subjectId: rootNode.subjectId,
            subjectName: rootNode.subjectName,
            reason: `Prérequis bloquant indispensable pour débloquer ${targetNode.titleFr}`,
            reasonBadge: 'Prerequisite Deficit',
            priority: 'urgent',
            priorityScore: 95,
            expectedMasteryGain: 0.25,
            estimatedTimeMinutes: rootNode.estimatedMinutes,
            exerciseType: 'concept_review',
          });
        }
      } else {
        recommendations.push({
          id: `rec-diag-${targetNode.id}`,
          nodeId: targetNode.id,
          title: `Combler la lacune majeure: ${targetNode.titleFr}`,
          subjectId: targetNode.subjectId,
          subjectName: targetNode.subjectName,
          reason: gap.remediationRecommendation,
          reasonBadge: 'Weakness Remediation',
          priority: 'urgent',
          priorityScore: 90,
          expectedMasteryGain: 0.30,
          estimatedTimeMinutes: targetNode.estimatedMinutes,
          exerciseType: 'problem_solving',
        });
      }
    });

    // 2. Check for Overdue Spaced Repetition Cards
    const overdueCards = cards.filter((c) => c.retentionProbability < 0.65);
    overdueCards.forEach((card) => {
      const node = nodes.find((n) => n.id === card.nodeId);
      if (node && !recommendations.some((r) => r.nodeId === node.id)) {
        recommendations.push({
          id: `rec-sr-${card.id}`,
          nodeId: node.id,
          title: `Rappel espacé: ${node.titleFr}`,
          subjectId: card.subjectId,
          subjectName: node.subjectName,
          reason: `Rétention estimée à ${(card.retentionProbability * 100).toFixed(0)}%. Révision rapide requise pour consolidation.`,
          reasonBadge: 'Overdue Revision',
          priority: 'high',
          priorityScore: 85,
          expectedMasteryGain: 0.15,
          estimatedTimeMinutes: 15,
          exerciseType: 'flashcards',
        });
      }
    });

    // 3. High BAC Weight Opportunities
    nodes.forEach((node) => {
      const record = masteryMap.get(node.id);
      if (!record || record.evidenceState !== 'OBSERVED' || record.masteryScore === null) {
        return;
      }
      const mastery = record.masteryScore;

      if (
        node.nationalExamWeight >= 20 &&
        mastery >= 0.50 &&
        mastery < 0.85 &&
        !recommendations.some((r) => r.nodeId === node.id)
      ) {
        recommendations.push({
          id: `rec-bac-${node.id}`,
          nodeId: node.id,
          title: `Optimisation Baccalauréat: ${node.titleFr}`,
          subjectId: node.subjectId,
          subjectName: node.subjectName,
          reason: `Pondération élevée à l'examen national (${node.nationalExamWeight}%). Pousser la maîtrise de ${(mastery * 100).toFixed(0)}% à 90%+.`,
          reasonBadge: 'BAC High Weight',
          priority: 'high',
          priorityScore: 80,
          expectedMasteryGain: 0.20,
          estimatedTimeMinutes: node.estimatedMinutes,
          exerciseType: 'quiz',
        });
      }
    });

    // Sort recommendations by priority score descending
    return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}
