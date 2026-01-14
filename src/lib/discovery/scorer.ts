/**
 * Lead Scoring Algorithm
 *
 * Calculates a relevance score (0-100) for discovered leads based on:
 * - Source quality (past client > dormant > similar org > AI research)
 * - Geographic proximity (closer = better)
 * - Recency of last contact
 * - Relationship strength (booking count)
 */

interface Lead {
  source: 'PAST_CLIENT' | 'DORMANT' | 'SIMILAR_ORG' | 'AI_RESEARCH'
  distance: number
  lastContactedAt?: Date | null
  bookings?: Array<{ id: string }> | null
  inquiries?: Array<{ id: string }> | null
}

interface Campaign {
  radius: number
}

/**
 * Calculate relevance score for a discovered lead
 *
 * @param lead - The discovered lead
 * @param campaign - The campaign context
 * @returns Score from 0-100
 */
export function calculateScore(lead: Lead, campaign: Campaign): number {
  let score = 0

  // 1. Base score by source (0-70 points)
  const baseScores = {
    PAST_CLIENT: 70, // Highest - proven relationship
    DORMANT: 50, // Medium-high - had interest before
    SIMILAR_ORG: 40, // Medium - similar profile
    AI_RESEARCH: 30, // Lowest - cold lead
  }
  score += baseScores[lead.source] || 30

  // 2. Proximity bonus (0-15 points)
  // Leads closer to the campaign center are more relevant
  const distancePercent = lead.distance / campaign.radius

  if (distancePercent <= 0.25) {
    score += 15 // Within inner 25% of radius
  } else if (distancePercent <= 0.5) {
    score += 10 // Within 50% of radius
  } else if (distancePercent <= 0.75) {
    score += 5 // Within 75% of radius
  }
  // No bonus for outer 25% of radius

  // 3. Recency bonus (0-10 points)
  // More recent contact = better memory/relationship
  if (lead.lastContactedAt) {
    const monthsAgo = (Date.now() - lead.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)

    if (monthsAgo <= 12) {
      score += 10 // Contacted within last year
    } else if (monthsAgo <= 24) {
      score += 5 // Contacted within 2 years
    }
    // No bonus if contacted more than 2 years ago
  }

  // 4. Relationship strength bonus (0-5 points)
  // Multiple bookings indicate strong relationship
  const bookingCount = lead.bookings?.length || 0

  if (bookingCount >= 2) {
    score += 5 // Multiple bookings - very strong relationship
  } else if (bookingCount === 1) {
    score += 3 // Single booking - proven relationship
  } else if (lead.inquiries?.length) {
    score += 1 // Had inquiry but no booking - some interest
  }

  // Clamp score to 0-100 range
  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate score distribution statistics for a set of leads
 *
 * @param scores - Array of lead scores
 * @returns Statistics about the score distribution
 */
export function calculateScoreStats(scores: number[]): {
  min: number
  max: number
  avg: number
  median: number
  distribution: {
    excellent: number // 80-100
    good: number // 60-79
    fair: number // 40-59
    poor: number // 0-39
  }
} {
  if (scores.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      distribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
    }
  }

  const sorted = [...scores].sort((a, b) => a - b)
  const sum = scores.reduce((acc, s) => acc + s, 0)

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / scores.length,
    median: sorted[Math.floor(sorted.length / 2)],
    distribution: {
      excellent: scores.filter((s) => s >= 80).length,
      good: scores.filter((s) => s >= 60 && s < 80).length,
      fair: scores.filter((s) => s >= 40 && s < 60).length,
      poor: scores.filter((s) => s < 40).length,
    },
  }
}
