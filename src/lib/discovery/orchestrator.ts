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

  // Fetch campaign details
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      booking: true,
    },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // Run all discovery sources in parallel for performance
  const [pastClients, dormant, similar, aiResearch] = await Promise.all([
    discoverPastClients(campaign),
    discoverDormantLeads(campaign),
    discoverSimilarOrgs(campaign),
    discoverAIResearch(campaign),
  ])

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
          distance: lead.distance,
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

  return {
    total: scored.length,
    bySource,
    avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
    scoreStats,
    deduplicationStats,
    duration,
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
