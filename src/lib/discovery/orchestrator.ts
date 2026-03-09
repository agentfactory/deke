/**
 * Discovery Orchestrator
 *
 * Coordinates all discovery sources, deduplication, scoring, and database insertion.
 * This is the main entry point for the lead discovery process.
 */

import { prisma } from '@/lib/db'
import { discoverPastClients } from './past-clients'
import { discoverDormantLeads } from './dormant-leads'
import { discoverSimilarOrgs } from './similar-orgs'
import { discoverAIResearch } from './ai-research'
import { calculateScore, calculateScoreStats } from './scorer'
import { deduplicate, getDeduplicationStats } from './deduplicator'
import { classifyOrganization } from './org-classifier'
import { getRecommendations, buildRecommendationReason } from '@/lib/recommendations/engine'
import { calculateRecommendationBonus } from '@/lib/recommendations/scorer'

export interface DiscoveryResult {
  total: number
  bySource: {
    PAST_CLIENT: number
    DORMANT: number
    SIMILAR_ORG: number
    AI_RESEARCH: number
  }
  avgScore: number
  scoreStats: ReturnType<typeof calculateScoreStats>
  deduplicationStats: ReturnType<typeof getDeduplicationStats>
  duration: number
  warnings: string[]
}

/**
 * Discover leads for a campaign
 *
 * Runs all discovery sources in parallel, deduplicates, scores, and inserts into database.
 *
 * @param campaignId - The campaign ID to discover leads for
 * @returns Discovery statistics
 * @throws Error if campaign not found or discovery fails
 */
export async function discoverLeads(campaignId: string): Promise<DiscoveryResult> {
  const startTime = Date.now()

  const warnings: string[] = []

  // Fetch campaign details (include booking.lead for similar-orgs classification fallback)
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      booking: {
        include: {
          lead: {
            select: { organization: true },
          },
        },
      },
    },
    // Also get targetOrgTypes for prospect mode
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  console.log('[Discovery:Orchestrator] Campaign details', {
    id: campaign.id,
    name: campaign.name,
    lat: campaign.latitude,
    lng: campaign.longitude,
    radius: campaign.radius,
    hasBooking: !!campaign.booking,
    bookingLocation: campaign.booking?.location,
    bookingLeadOrg: campaign.booking?.lead?.organization,
  })

  // Pre-flight validation
  if (!campaign.latitude || !campaign.longitude) {
    warnings.push('Campaign has no coordinates — all geo-based sources will return empty')
  } else if (
    campaign.latitude < -90 || campaign.latitude > 90 ||
    campaign.longitude < -180 || campaign.longitude > 180
  ) {
    warnings.push(`Campaign has invalid coordinates (${campaign.latitude}, ${campaign.longitude})`)
  }

  if (!campaign.radius || campaign.radius <= 0) {
    warnings.push('Campaign has no radius set — geo-based sources will return empty')
  }

  if (!campaign.booking && !campaign.targetOrgTypes) {
    warnings.push('Campaign has no linked booking or target org types — Similar Orgs source will be skipped')
  }

  // Check how many leads in DB have coordinates vs total
  const [totalLeads, leadsWithCoords] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { latitude: { not: null }, longitude: { not: null } } }),
  ])
  console.log(`[Discovery:Orchestrator] Lead coverage: ${leadsWithCoords}/${totalLeads} leads have coordinates`)
  if (totalLeads > 0 && leadsWithCoords < totalLeads) {
    warnings.push(`${totalLeads - leadsWithCoords} of ${totalLeads} leads have no coordinates — run backfill at /api/admin/leads/backfill-coords`)
  }

  // Check Google Places API key
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    warnings.push('GOOGLE_PLACES_API_KEY not configured — AI Research source will be skipped')
  }

  // Run all discovery sources in parallel for performance
  const [pastClients, dormant, similar, aiResearch] = await Promise.all([
    discoverPastClients(campaign),
    discoverDormantLeads(campaign),
    discoverSimilarOrgs(campaign),
    discoverAIResearch(campaign),
  ])

  console.log('[Discovery:Orchestrator] Source results', {
    pastClients: pastClients.length,
    dormant: dormant.length,
    similar: similar.length,
    aiResearch: aiResearch.length,
  })

  // Track counts by source before deduplication
  const bySource = {
    PAST_CLIENT: pastClients.length,
    DORMANT: dormant.length,
    SIMILAR_ORG: similar.length,
    AI_RESEARCH: aiResearch.length,
  }

  // Merge all leads
  const allLeads = [...pastClients, ...dormant, ...similar, ...aiResearch]
  const originalCount = allLeads.length

  // Deduplicate by email (keeping highest score per email)
  const deduped = deduplicate(allLeads as any[])

  // Calculate deduplication statistics
  const deduplicationStats = getDeduplicationStats(originalCount, deduped.length)

  // Phase 3: Add recommendations to leads
  // Fetch full lead data with bookings for recommendation matching
  const leadsWithRecommendations = await Promise.all(
    deduped.map(async (lead) => {
      // Fetch full lead data including bookings
      const fullLead = await prisma.lead.findUnique({
        where: { id: lead.id },
        include: {
          bookings: {
            select: { serviceType: true },
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          },
        },
      })

      if (!fullLead) {
        return { ...lead, recommendations: [], recommendationBonus: 0 }
      }

      // Classify organization type
      const orgType = classifyOrganization(fullLead.organization || '')

      // Get service recommendations
      const recommendations = await getRecommendations({
        lead: fullLead,
        organizationType: orgType,
        campaignBooking: campaign.booking,
      })

      // Calculate recommendation score bonus
      const recommendationBonus = calculateRecommendationBonus(recommendations)

      return {
        ...lead,
        recommendations,
        recommendationBonus,
      }
    })
  )

  // Score all leads (now includes recommendation bonus)
  const scored = leadsWithRecommendations.map((lead) => ({
    ...lead,
    score: calculateScore(lead, campaign) + (lead.recommendationBonus || 0),
  }))

  // Calculate score statistics
  const scores = scored.map((lead) => lead.score)
  const scoreStats = calculateScoreStats(scores)
  const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0

  // Insert CampaignLead records in database
  // For SQLite compatibility, filter out existing campaign-lead pairs before inserting
  if (scored.length > 0) {
    // Get existing campaign-lead pairs to avoid duplicates
    const existingPairs = await prisma.campaignLead.findMany({
      where: {
        campaignId: campaign.id,
        leadId: { in: scored.map((lead) => lead.id) },
      },
      select: {
        leadId: true,
      },
    })

    const existingLeadIds = new Set(existingPairs.map((pair) => pair.leadId))

    // Filter out leads that are already in the campaign
    const newLeads = scored.filter((lead) => !existingLeadIds.has(lead.id))

    // Insert only new leads
    if (newLeads.length > 0) {
      await prisma.campaignLead.createMany({
        data: newLeads.map((lead) => ({
          campaignId: campaign.id,
          leadId: lead.id,
          score: lead.score,
          distance: lead.distance ?? null, // null for leads without coordinates
          source: lead.source,
          status: 'PENDING',
          // Phase 3: Store recommendations
          recommendedServices: lead.recommendations && lead.recommendations.length > 0
            ? JSON.stringify(lead.recommendations.map((r: any) => r.serviceType))
            : null,
          recommendationReason: lead.recommendations && lead.recommendations.length > 0
            ? buildRecommendationReason(lead.recommendations)
            : null,
          recommendationScore: lead.recommendationBonus || null,
        })),
      })
    }
  }

  const duration = Date.now() - startTime

  if (warnings.length > 0) {
    console.warn('[Discovery:Orchestrator] Warnings:', warnings)
  }

  console.log(`[Discovery:Orchestrator] Complete: ${scored.length} leads in ${duration}ms`)

  return {
    total: scored.length,
    bySource,
    avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
    scoreStats,
    deduplicationStats,
    duration,
    warnings,
  }
}

/**
 * Clear all discovered leads for a campaign
 *
 * Useful for re-running discovery with updated parameters.
 *
 * @param campaignId - The campaign ID to clear leads for
 * @returns Number of leads removed
 */
export async function clearDiscoveredLeads(campaignId: string): Promise<number> {
  const result = await prisma.campaignLead.deleteMany({
    where: { campaignId },
  })

  return result.count
}

/**
 * Get discovery statistics for a campaign
 *
 * @param campaignId - The campaign ID
 * @returns Current statistics for discovered leads
 */
export async function getDiscoveryStats(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      leads: {
        include: {
          lead: true,
        },
      },
    },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  const leads = campaign.leads

  const bySource = {
    PAST_CLIENT: leads.filter((l) => l.source === 'PAST_CLIENT').length,
    DORMANT: leads.filter((l) => l.source === 'DORMANT').length,
    SIMILAR_ORG: leads.filter((l) => l.source === 'SIMILAR_ORG').length,
    AI_RESEARCH: leads.filter((l) => l.source === 'AI_RESEARCH').length,
  }

  const byStatus = {
    PENDING: leads.filter((l) => l.status === 'PENDING').length,
    CONTACTED: leads.filter((l) => l.status === 'CONTACTED').length,
    OPENED: leads.filter((l) => l.status === 'OPENED').length,
    CLICKED: leads.filter((l) => l.status === 'CLICKED').length,
    RESPONDED: leads.filter((l) => l.status === 'RESPONDED').length,
    BOOKED: leads.filter((l) => l.status === 'BOOKED').length,
    DECLINED: leads.filter((l) => l.status === 'DECLINED').length,
    REMOVED: leads.filter((l) => l.status === 'REMOVED').length,
  }

  const scores = leads.map((l) => l.score)
  const scoreStats = calculateScoreStats(scores)
  const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0

  return {
    total: leads.length,
    bySource,
    byStatus,
    avgScore: Math.round(avgScore * 10) / 10,
    scoreStats,
  }
}
