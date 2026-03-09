/**
 * Lead Scoring Algorithm
 *
 * Calculates a relevance score (0-100) for discovered leads.
 *
 * COLD LEADS (AI_RESEARCH): Scored on email quality, org relevance, contact richness,
 * proximity, Google rating, and website presence.
 *
 * WARM LEADS (PAST_CLIENT, DORMANT, SIMILAR_ORG): Scored on source quality, proximity,
 * recency, relationship strength, music relevance, and email quality.
 */

import type { OrgType } from './org-classifier'

interface Lead {
  source: 'PAST_CLIENT' | 'DORMANT' | 'SIMILAR_ORG' | 'AI_RESEARCH'
  distance: number | null
  lastContactedAt?: Date | null
  bookings?: Array<{ id: string }> | null
  inquiries?: Array<{ id: string }> | null
  organization?: string | null
  orgType?: OrgType | null
  // Enrichment fields
  emailVerified?: boolean
  needsEnrichment?: boolean
  enrichmentSource?: string | null
  website?: string | null
  phone?: string | null
  email?: string | null
  // Google Places data
  googleRating?: number | null
}

interface Campaign {
  radius: number
}

// ============================================
// HIGH-VALUE MUSIC ORG TYPES
// ============================================

const HIGH_VALUE_MUSIC_ORGS: OrgType[] = [
  'BARBERSHOP', 'A_CAPPELLA_GROUP', 'GOSPEL_CHOIR',
  'COMMUNITY_CHORUS', 'YOUTH_CHOIR', 'CHOIR',
  'MUSIC_SCHOOL', 'CONSERVATORY',
]

const MEDIUM_VALUE_ORGS: OrgType[] = [
  'UNIVERSITY', 'COLLEGE', 'HIGH_SCHOOL',
  'PERFORMING_ARTS', 'ARTS_CENTER',
]

const LOW_VALUE_ORGS: OrgType[] = [
  'CHURCH', 'SYNAGOGUE', 'COMMUNITY_CENTER',
]

// ============================================
// COLD LEAD SCORING (AI_RESEARCH)
// ============================================

/**
 * Score a cold lead discovered via AI Research (Google Places)
 *
 * | Factor           | Points | Logic                                                |
 * |------------------|--------|------------------------------------------------------|
 * | Email quality    | 0-25   | Personal verified=25, generic verified=15, scraped=10 |
 * | Org relevance    | 0-25   | Music org=25, related=15, church=10, unknown=0       |
 * | Contact richness | 0-15   | phone+email+website=15, two=10, one=5                |
 * | Proximity        | 0-15   | Inner 25%=15, 50%=10, 75%=5, outer=0                |
 * | Google rating    | 0-10   | rating * 2                                           |
 * | Has website      | 0-10   | Website with email=10, website only=5, none=0        |
 */
function scoreColdLead(lead: Lead, campaign: Campaign): number {
  let score = 0

  // 1. Email quality (0-25)
  if (lead.needsEnrichment || !lead.email || lead.email.includes('@placeholder.local')) {
    score += 0
  } else if (lead.emailVerified && lead.enrichmentSource === 'website_scrape') {
    // Check if it's a personal email (has a real first name, not "Contact")
    const isPersonal = lead.email && !lead.email.startsWith('info@') &&
      !lead.email.startsWith('contact@') && !lead.email.startsWith('admin@') &&
      !lead.email.startsWith('office@') && !lead.email.startsWith('hello@')
    score += isPersonal ? 25 : 15
  } else {
    score += 10 // Has an email but unverified
  }

  // 2. Org relevance (0-25)
  score += scoreOrgRelevance(lead)

  // 3. Contact richness (0-15)
  const hasEmail = lead.email && !lead.email.includes('@placeholder.local')
  const hasPhone = !!lead.phone
  const hasWebsite = !!lead.website
  const contactCount = [hasEmail, hasPhone, hasWebsite].filter(Boolean).length
  if (contactCount >= 3) score += 15
  else if (contactCount === 2) score += 10
  else if (contactCount === 1) score += 5

  // 4. Proximity (0-15)
  score += scoreProximity(lead.distance, campaign.radius)

  // 5. Google rating (0-10)
  if (lead.googleRating && lead.googleRating > 0) {
    score += Math.min(10, Math.round(lead.googleRating * 2))
  }

  // 6. Has website (0-10)
  if (hasWebsite && hasEmail) score += 10
  else if (hasWebsite) score += 5

  return score
}

// ============================================
// WARM LEAD SCORING (PAST_CLIENT, DORMANT, SIMILAR_ORG)
// ============================================

/**
 * Score a warm lead (known relationship)
 */
function scoreWarmLead(lead: Lead, campaign: Campaign): number {
  let score = 0

  // 1. Base score by source (0-40)
  const baseScores = {
    PAST_CLIENT: 40,
    DORMANT: 25,
    SIMILAR_ORG: 20,
    AI_RESEARCH: 0, // Should never hit this path
  }
  score += baseScores[lead.source] || 0

  // 2. Proximity (0-15)
  score += scoreProximity(lead.distance, campaign.radius)

  // 3. Recency (0-10)
  if (lead.lastContactedAt) {
    const monthsAgo = (Date.now() - lead.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsAgo <= 12) score += 10
    else if (monthsAgo <= 24) score += 5
  }

  // 4. Relationship strength (0-10)
  const bookingCount = lead.bookings?.length || 0
  if (bookingCount >= 3) score += 10
  else if (bookingCount >= 2) score += 7
  else if (bookingCount === 1) score += 5
  else if (lead.inquiries?.length) score += 2

  // 5. Music relevance (0-15)
  score += scoreOrgRelevance(lead) > 15 ? 15 : scoreOrgRelevance(lead)

  // 6. Email quality (0-10) - even warm leads benefit from verified emails
  if (lead.emailVerified) score += 10
  else if (lead.email && !lead.email.includes('@placeholder.local')) score += 5

  return score
}

// ============================================
// SHARED SCORING HELPERS
// ============================================

function scoreProximity(distance: number | null, radius: number): number {
  if (distance === null || distance === undefined) return 0
  const percentage = distance / radius
  if (percentage <= 0.25) return 15
  if (percentage <= 0.50) return 10
  if (percentage <= 0.75) return 5
  return 0
}

function scoreOrgRelevance(lead: Lead): number {
  // Check by classified org type first
  if (lead.orgType) {
    if (HIGH_VALUE_MUSIC_ORGS.includes(lead.orgType)) return 25
    if (MEDIUM_VALUE_ORGS.includes(lead.orgType)) return 15
    if (LOW_VALUE_ORGS.includes(lead.orgType)) return 10
  }

  // Fallback: keyword matching on organization name
  if (lead.organization) {
    const name = lead.organization.toLowerCase()
    if (/choir|chorus|barbershop|a\s?cappella|harmony|vocal|singers/i.test(name)) return 25
    if (/music|conservatory|school of music/i.test(name)) return 20
    if (/university|college|high school/i.test(name)) return 15
    if (/church|temple|synagogue/i.test(name)) return 10
  }

  return 0
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Calculate relevance score for a discovered lead
 *
 * Routes to cold or warm scoring based on source type.
 *
 * @param lead - The discovered lead
 * @param campaign - The campaign context
 * @returns Score from 0-100
 */
export function calculateScore(lead: Lead, campaign: Campaign): number {
  let score: number

  if (lead.source === 'AI_RESEARCH') {
    score = scoreColdLead(lead, campaign)
  } else {
    score = scoreWarmLead(lead, campaign)
  }

  // Clamp to 0-100
  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate score distribution statistics for a set of leads
 */
export function calculateScoreStats(scores: number[]): {
  min: number
  max: number
  avg: number
  median: number
  distribution: {
    excellent: number
    good: number
    fair: number
    poor: number
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
