/**
 * Qarayti.ai — Daily Plan Generator Engine
 * Builds an optimized adaptive daily study agenda tailored to student target study hours.
 */

import { Recommendation, DailyPlanItem } from '../../domain/types/adaptive.types';

export class DailyPlanGenerator {
  /**
   * Generates daily plan items from recommendations.
   * @param recommendations Priority-sorted recommendation items
   * @param targetDailyMinutes Total study goal in minutes (e.g. 120 mins)
   */
  public static generateDailyPlan(
    recommendations: Recommendation[],
    targetDailyMinutes: number = 120
  ): DailyPlanItem[] {
    const items: DailyPlanItem[] = [];
    let accumulatedMinutes = 0;

    const timeSlots = ['08:30 AM', '10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '06:00 PM', '08:00 PM'];
    let slotIndex = 0;

    recommendations.forEach((rec, idx) => {
      if (accumulatedMinutes < targetDailyMinutes) {
        items.push({
          id: `plan-${idx + 1}`,
          recommendationId: rec.id,
          nodeId: rec.nodeId,
          taskTitle: rec.title,
          subjectName: rec.subjectName,
          durationMinutes: rec.estimatedTimeMinutes,
          completed: idx === 1, // Second task completed for demonstration state
          priorityScore: rec.priorityScore,
          exerciseType: rec.exerciseType,
          scheduledTime: timeSlots[slotIndex % timeSlots.length],
        });
        accumulatedMinutes += rec.estimatedTimeMinutes;
        slotIndex++;
      }
    });

    return items;
  }
}
