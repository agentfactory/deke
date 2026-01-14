/**
 * Recommendation Scorer
 *
 * Calculates score bonus (0-15 points) based on recommendation quality and strength
 */

import type { RecommendationMatch } from './engine'

/**
 * Calculate recommendation bonus for lead scoring
 *
 * Adds 0-15 points to the lead score based on:
 * - Priority of recommendations (1-10 scale)
 * - Number of strong recommendations
 * - Recommendation weight multipliers
 *
 * @param recommendations - Array of recommendation matches
 * @returns Score bonus (0-15 points)
 */
export function calculateRecommendationBonus(
  recommendations: RecommendationMatch[]
): number {
  if (recommendations.length === 0) {
    return 0
  }

  let bonus = 0

  // Calculate bonus based on priority levels
  for (const rec of recommendations) {
    const { priority, weight } = rec

    // High priority (8-10): 10-15 points (scaled by weight)
    if (priority >= 8) {
      bonus += 15 * weight
    }
    // Medium priority (5-7): 5-10 points (scaled by weight)
    else if (priority >= 5) {
      bonus += 10 * weight
    }
    // Low priority (1-4): 0-5 points (scaled by weight)
    else {
      bonus += 5 * weight
    }
  }

  // Apply multiplier for multiple strong recommendations
  if (recommendations.length >= 3) {
    bonus *= 1.2 // 20% bonus for having 3+ recommendations
  } else if (recommendations.length >= 2) {
    bonus *= 1.1 // 10% bonus for having 2+ recommendations
  }

  // Cap at maximum 15 points
  return Math.min(15, Math.round(bonus))
}

/**
 * Get recommendation quality tier based on bonus score
 *
 * @param bonus - The calculated recommendation bonus
 * @returns Quality tier: 'excellent', 'good', 'fair', or 'none'
 */
export function getRecommendationQuality(bonus: number): 'excellent' | 'good' | 'fair' | 'none' {
  if (bonus >= 12) return 'excellent'
  if (bonus >= 8) return 'good'
  if (bonus >= 4) return 'fair'
  return 'none'
}

/**
 * Calculate the weighted priority score for a single recommendation
 * Used for ranking and comparing recommendations
 *
 * @param recommendation - A recommendation match
 * @returns Weighted priority score
 */
export function calculateWeightedPriority(recommendation: RecommendationMatch): number {
  return recommendation.priority * recommendation.weight
}
