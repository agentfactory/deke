import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { curatorAgent } from '../../../../../agents/curator'

/**
 * POST /api/campaigns/[id]/evaluate-quality
 *
 * Triggers CURATOR agent to evaluate lead quality for a campaign.
 * Can be called manually before generating drafts to ensure
 * only quality leads receive outreach.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'NOT_FOUND')
    }

    // Check if there are leads to evaluate
    const unevaluatedCount = await prisma.campaignLead.count({
      where: {
        campaignId,
        qualityEvaluatedAt: null,
      },
    })

    if (unevaluatedCount === 0) {
      // Check total leads to give helpful message
      const totalLeads = await prisma.campaignLead.count({
        where: { campaignId },
      })

      if (totalLeads === 0) {
        throw new ApiError(
          400,
          'No leads found — run discovery first',
          'NO_LEADS'
        )
      }

      return NextResponse.json({
        message: 'All leads have already been evaluated',
        evaluated: 0,
        passed: 0,
        failed: 0,
      })
    }

    // Run CURATOR evaluation
    const result = await curatorAgent.evaluateCampaignLeads(campaignId)

    return NextResponse.json({
      message: `Quality evaluation complete: ${result.passed} passed, ${result.failed} failed out of ${result.evaluated} leads`,
      ...result,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
