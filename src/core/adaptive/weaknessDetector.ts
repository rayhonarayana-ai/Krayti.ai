/**
 * Qarayti.ai — Weakness Diagnostics Engine
 * Performs graph traversal to identify root-cause prerequisite failures and classify learning deficits.
 */

import {
  KnowledgeNode,
  MasteryRecord,
  WeaknessDiagnostic,
  SpacedRepetitionCard,
} from '../../domain/types/adaptive.types';

export class WeaknessDetector {
  /**
   * Scans all nodes and mastery records to discover weaknesses and trace root causes.
   */
  public static detectWeaknesses(
    nodes: KnowledgeNode[],
    masteryMap: Map<string, MasteryRecord>,
    cards: SpacedRepetitionCard[]
  ): WeaknessDiagnostic[] {
    const diagnostics: WeaknessDiagnostic[] = [];

    nodes.forEach((node) => {
      const record = masteryMap.get(node.id);
      const masteryScore = record ? record.masteryScore : 0.25;

      // Check if node is weak or failing
      if (masteryScore < 0.55) {
        // Trace prerequisites
        const failingPrereqs: string[] = [];
        node.prerequisiteIds.forEach((prereqId) => {
          const prereqRecord = masteryMap.get(prereqId);
          if (!prereqRecord || prereqRecord.masteryScore < 0.60) {
            failingPrereqs.push(prereqId);
          }
        });

        // Determine gap type & severity
        let gapType: WeaknessDiagnostic['gapType'] = 'conceptual_misunderstanding';
        let severity: WeaknessDiagnostic['severity'] = 'moderate';
        let recommendation = '';

        if (failingPrereqs.length > 0) {
          gapType = 'prerequisite_deficit';
          severity = 'critical';
          const prereqNames = failingPrereqs
            .map((id) => nodes.find((n) => n.id === id)?.titleFr || id)
            .join(', ');
          recommendation = `Rétablir d'abord les prérequis manqués: [${prereqNames}] avant d'aborder ${node.titleFr}.`;
        } else {
          // Check for retention decay card
          const nodeCard = cards.find((c) => c.nodeId === node.id);
          if (nodeCard && nodeCard.retentionProbability < 0.55) {
            gapType = 'retention_decay';
            severity = 'moderate';
            recommendation = `Effectuer une session de rappel espacé (Spaced Repetition) pour réactiver la mémoire à long terme.`;
          } else if (masteryScore < 0.35) {
            gapType = 'conceptual_misunderstanding';
            severity = 'critical';
            recommendation = `Revoir les principes fondamentaux et démonstrations théoriques de ${node.titleFr}.`;
          } else {
            gapType = 'procedural_error';
            severity = 'minor';
            recommendation = `Pratiquer 3 à 5 exercices guidés de calcul direct sur ${node.titleFr}.`;
          }
        }

        const impactScore = Math.round(
          node.nationalExamWeight * (1 - masteryScore) * (severity === 'critical' ? 1.5 : 1.0)
        );

        diagnostics.push({
          id: `diag-${node.id}`,
          nodeId: node.id,
          nodeTitle: `${node.titleFr} (${node.titleAr})`,
          subjectId: node.subjectId,
          severity,
          gapType,
          impactScore,
          rootCauseNodeIds: failingPrereqs,
          remediationRecommendation: recommendation,
          detectedAt: new Date().toISOString(),
        });
      }
    });

    // Sort by impact score descending
    return diagnostics.sort((a, b) => b.impactScore - a.impactScore);
  }
}
