import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { pauseFollowUpSchema } from '@/lib/validations/follow-up'
import { manualPauseFollowUp, resumeFollowUp } from '@/lib/follow-up/scheduler'

/**
 * Phase 6: Smart Follow-Up Automation
 * Manual Pause/Resume API - Allow users to manually control follow-ups
 */

type Params = {
  params: Promise<{
    id: string // campaignId
    leadId: string // campaignLeadId
  }>
}

/**
 * POST /api/campaigns/[id]/leads/[leadId]/pause
 * Pause follow-ups for a specific campaign lead
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id, leadId } = await params
    const body = await request.json()
    const { reason } = pauseFollowUpSchema.parse(body)

    // Find campaign lead
    const campaignLead = await prisma.campaignLead.findFirst({
      where: {
        id: leadId,
        campaignId: id,
      },
    })

    if (!campaignLead) {
      throw new ApiError(404, 'Campaign lead not found', 'LEAD_NOT_FOUND')
    }

    // Pause follow-ups
    await manualPauseFollowUp(leadId, reason)

    // Fetch updated record
    const updated = await prisma.campaignLead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        followUpsPaused: true,
        followUpPauseReason: true,
        followUpPausedAt: true,
        scheduledFollowUpDate: true,
        followUpCount: true,
      },
    })

    return NextResponse.json({
      message: 'Follow-ups paused successfully',
      campaignLead: updated,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
