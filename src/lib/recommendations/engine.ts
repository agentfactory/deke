/**
 * Recommendation Engine
 *
 * Core logic for matching leads to recommended services based on:
 * - Service-to-service rules (e.g., WORKSHOP → MASTERCLASS)
 * - Organization-based rules (e.g., UNIVERSITY → GROUP_COACHING)
 * - Past booking patterns
 */

import { prisma } from '@/lib/db'
import type { OrgType } from '@/lib/discovery/org-classifier'

export interface RecommendationMatch {
  serviceType: string
  reason: string
  weight: number
  priority: number
  pitchPoints: string[]
  templateId?: string
}

export interface RecommendationInput {
  lead: {
    id: string
    organization?: string | null
    bookings?: Array<{ serviceType: string }>
  }
  organizationType: OrgType
  campaignBooking?: {
    serviceType: string
  } | null
}

// In-memory cache for recommendation rules with 1-hour TTL
const recommendationCache = new Map<string, { rules: any[]; timestamp: number }>()
const CACHE_TTL = 3600000 // 1 hour in milliseconds

/**
 * Get cached recommendation rules from database
 *
 * @returns Active recommendation rules
 */
async function getCachedRules() {
  const now = Date.now()
  const cached = recommendationCache.get('active')

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.rules
  }

  const rules = await prisma.serviceRecommendation.findMany({
    where: { active: true },
    orderBy: [{ priority: 'desc' }, { weight: 'desc' }],
  })

  recommendationCache.set('active', { rules, timestamp: now })

  return rules
}

/**
 * Clear the recommendation rules cache
 * Call this when rules are modified
 */
export function clearRecommendationCache() {
  recommendationCache.clear()
}

/**
 * Get service recommendations for a lead
 *
 * @param input - Lead data and context
 * @returns Array of recommendation matches, ranked by relevance
 */
export async function getRecommendations(
  input: RecommendationInput
): Promise<RecommendationMatch[]> {
  const rules = await getCachedRules()

  if (rules.length === 0) {
    return []
  }

  const matches: RecommendationMatch[] = []

  // 1. Service-to-Service Matching
  if (input.campaignBooking?.serviceType) {
    const serviceRules = rules.filter(
      (rule) => rule.triggerServiceType === input.campaignBooking?.serviceType
    )

    for (const rule of serviceRules) {
      matches.push({
        serviceType: rule.recommendedService,
        reason: `Since you booked ${formatServiceType(input.campaignBooking.serviceType)}`,
        weight: rule.weight,
        priority: rule.priority,
        pitchPoints: rule.pitchPoints ? JSON.parse(rule.pitchPoints) : [],
        templateId: rule.messageTemplate || undefined,
      })
    }
  }

  // 2. Past Booking Pattern Matching
  if (input.lead.bookings && input.lead.bookings.length > 0) {
    const pastServices = input.lead.bookings.map((b) => b.serviceType)
    const uniquePastServices = [...new Set(pastServices)]

    for (const pastService of uniquePastServices) {
      const serviceRules = rules.filter((rule) => rule.triggerServiceType === pastService)

      for (const rule of serviceRules) {
        // Skip if already recommended from campaign booking
        const alreadyRecommended = matches.some(
          (m) => m.serviceType === rule.recommendedService
        )
        if (alreadyRecommended) continue

        matches.push({
          serviceType: rule.recommendedService,
          reason: `Based on your past ${formatServiceType(pastService)} booking`,
          weight: rule.weight * 0.8, // Slightly lower weight than campaign trigger
          priority: rule.priority,
          pitchPoints: rule.pitchPoints ? JSON.parse(rule.pitchPoints) : [],
          templateId: rule.messageTemplate || undefined,
        })
      }
    }
  }

  // 3. Organization-Based Matching
  if (input.organizationType !== 'UNKNOWN') {
    const orgRules = rules.filter((rule) => {
      if (!rule.orgTypes) return false

      const orgTypes = JSON.parse(rule.orgTypes) as string[]
      return orgTypes.includes(input.organizationType)
    })

    for (const rule of orgRules) {
      // Skip if already recommended
      const alreadyRecommended = matches.some((m) => m.serviceType === rule.recommendedService)
      if (alreadyRecommended) continue

      matches.push({
        serviceType: rule.recommendedService,
        reason: `Organizations like ${input.lead.organization || 'yours'} often benefit from ${formatServiceType(rule.recommendedService)}`,
        weight: rule.weight * 0.9, // Slightly lower than service-based
        priority: rule.priority,
        pitchPoints: rule.pitchPoints ? JSON.parse(rule.pitchPoints) : [],
        templateId: rule.messageTemplate || undefined,
      })
    }
  }

  // 4. Score and rank matches
  const rankedMatches = matches
    .map((match) => ({
      ...match,
      score: match.weight * match.priority, // Combined score for ranking
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Return top 5 recommendations

  // Remove the score property before returning
  return rankedMatches.map(({ score, ...match }) => match)
}

/**
 * Format service type for human-readable display
 *
 * @param serviceType - Service type string
 * @returns Formatted service type
 */
function formatServiceType(serviceType: string): string {
  const formatted = serviceType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return formatted
}

/**
 * Build a concise recommendation reason for template variables
 *
 * @param recommendations - Array of recommendation matches
 * @returns A single sentence explaining the recommendations
 */
export function buildRecommendationReason(recommendations: RecommendationMatch[]): string {
  if (recommendations.length === 0) return ''

  // Use the first (highest priority) recommendation's reason
  return recommendations[0].reason
}

/**
 * Format recommendations for template variables
 *
 * @param recommendations - Array of recommendation matches
 * @returns Object with template-ready variables
 */
export function formatRecommendationsForTemplate(recommendations: RecommendationMatch[]): {
  recommendedServices: string[]
  recommendationReason: string
  pitchPoints: string[]
  topRecommendation: string
} {
  if (recommendations.length === 0) {
    return {
      recommendedServices: [],
      recommendationReason: '',
      pitchPoints: [],
      topRecommendation: '',
    }
  }

  // Collect all unique pitch points
  const allPitchPoints = recommendations.flatMap((r) => r.pitchPoints)
  const uniquePitchPoints = [...new Set(allPitchPoints)]

  return {
    recommendedServices: recommendations.map((r) => formatServiceType(r.serviceType)),
    recommendationReason: buildRecommendationReason(recommendations),
    pitchPoints: uniquePitchPoints.slice(0, 5), // Max 5 pitch points
    topRecommendation: formatServiceType(recommendations[0].serviceType),
  }
}
