import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { runDiscoveryInBackground } from '@/lib/discovery/background-runner'

type Params = {
  params: Promise<{
    id: string
  }>
}

// Stale job timeout: 10 minutes
const STALE_JOB_TIMEOUT_MS = 10 * 60 * 1000

/**
 * POST /api/campaigns/[id]/discover
 *
 * Starts discovery as a background job. Returns 202 Accepted immediately.
 * Poll GET /api/campaigns/[id]/discover for status.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        discoveryStatus: true,
        discoveryStartedAt: true,
      },
    })

    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND')
    }

    // Check if discovery is already running
    if (campaign.discoveryStatus === 'RUNNING') {
      // Check for stale job
      const startedAt = campaign.discoveryStartedAt?.getTime() || 0
      const isStale = Date.now() - startedAt > STALE_JOB_TIMEOUT_MS

      if (!isStale) {
        return NextResponse.json(
          { message: 'Discovery is already running', status: 'running' },
          { status: 409 }
        )
      }

      // Stale job — mark it failed and allow restart
      console.warn(`[Discover] Stale discovery job detected for campaign ${id}, allowing restart`)
      await prisma.campaign.update({
        where: { id },
        data: {
          discoveryStatus: 'FAILED',
          discoveryError: 'Discovery timed out (server may have restarted)',
        },
      })
    }

    // Mark as running
    await prisma.campaign.update({
      where: { id },
      data: {
        discoveryStatus: 'RUNNING',
        discoveryStartedAt: new Date(),
        discoveryError: null,
      },
    })

    // Fire and forget — do NOT await
    runDiscoveryInBackground(id)

    return NextResponse.json(
      {
        message: 'Discovery started',
        status: 'started',
        campaignId: id,
        campaignName: campaign.name,
      },
      { status: 202 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/campaigns/[id]/discover
 *
 * Returns current discovery status. Frontend polls this every few seconds.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        discoveryStatus: true,
        discoveryStartedAt: true,
        discoveryError: true,
        _count: {
          select: {
            leads: true,
            emailDrafts: true,
          },
        },
      },
    })

    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND')
    }

    // Check for stale running job
    if (campaign.discoveryStatus === 'RUNNING') {
      const startedAt = campaign.discoveryStartedAt?.getTime() || 0
      const isStale = Date.now() - startedAt > STALE_JOB_TIMEOUT_MS

      if (isStale) {
        await prisma.campaign.update({
          where: { id },
          data: {
            discoveryStatus: 'FAILED',
            discoveryError: 'Discovery timed out (server may have restarted)',
          },
        })

        return NextResponse.json({
          status: 'failed',
          error: 'Discovery timed out (server may have restarted). Try again.',
          campaignId: id,
        })
      }

      const elapsedMs = Date.now() - startedAt
      return NextResponse.json({
        status: 'running',
        campaignId: id,
        startedAt: campaign.discoveryStartedAt,
        elapsedMs,
      })
    }

    if (campaign.discoveryStatus === 'COMPLETED') {
      // Get source breakdown
      const sourceBreakdown = await prisma.campaignLead.groupBy({
        by: ['source'],
        where: { campaignId: id },
        _count: true,
      })

      const bySource: Record<string, number> = {}
      for (const s of sourceBreakdown) {
        bySource[s.source] = s._count
      }

      // Get draft counts
      const draftCount = await prisma.emailDraft.count({
        where: { campaignId: id },
      })

      return NextResponse.json({
        status: 'completed',
        campaignId: id,
        campaignName: campaign.name,
        discovered: {
          total: campaign._count.leads,
          bySource,
        },
        drafts: {
          generated: draftCount,
        },
      })
    }

    if (campaign.discoveryStatus === 'FAILED') {
      return NextResponse.json({
        status: 'failed',
        campaignId: id,
        error: campaign.discoveryError || 'Discovery failed (unknown error)',
      })
    }

    // No discovery has been run yet
    return NextResponse.json({
      status: 'idle',
      campaignId: id,
      leadsCount: campaign._count.leads,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
