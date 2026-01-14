import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { discoverLeads } from '@/lib/discovery'

type Params = {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/campaigns/[id]/discover
 *
 * Discover leads for a campaign using all available sources:
 * - Past clients with completed bookings
 * - Dormant leads (no contact in 6+ months)
 * - Similar organizations (based on booking location)
 * - AI research (future feature, currently stubbed)
 *
 * Leads are scored, deduplicated, and inserted into the campaign.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        baseLocation: true,
        latitude: true,
        longitude: true,
        radius: true,
        status: true,
      },
    })

    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND')
    }

    // Run discovery engine
    const result = await discoverLeads(id)

    return NextResponse.json(
      {
        message: 'Lead discovery completed successfully',
        campaignId: campaign.id,
        campaignName: campaign.name,
        discovered: {
          total: result.total,
          bySource: {
            pastClients: result.bySource.PAST_CLIENT,
            dormantLeads: result.bySource.DORMANT,
            similarOrgs: result.bySource.SIMILAR_ORG,
            aiResearch: result.bySource.AI_RESEARCH,
          },
        },
        scoring: {
          avgScore: result.avgScore,
          scoreDistribution: result.scoreStats.distribution,
          min: result.scoreStats.min,
          max: result.scoreStats.max,
          median: result.scoreStats.median,
        },
        deduplication: {
          originalCount: result.deduplicationStats.original,
          duplicatesRemoved: result.deduplicationStats.duplicatesRemoved,
          deduplicationRate: result.deduplicationStats.deduplicationRate,
        },
        performance: {
          duration: result.duration,
          leadsPerSecond: Math.round((result.total / result.duration) * 1000),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
