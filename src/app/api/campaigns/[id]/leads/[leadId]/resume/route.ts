import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { resumeFollowUp } from '@/lib/follow-up/scheduler'

/**
 * Phase 6: Smart Follow-Up Automation
 * Resume API - Resume paused follow-ups
 */

type Params = {
  params: Promise<{
    id: string // campaignId
    leadId: string // campaignLeadId
  }>
}

/**
 * POST /api/campaigns/[id]/leads/[leadId]/resume
 * Resume follow-ups for a paused campaign lead
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id, leadId } = await params

    // Find campaign lead
    const campaignLead = await prisma.campaignLead.findFirst({
      where: {
        id: leadId,
        campaignId: id,
      },
      include: {
        lead: true,
      },
    })

    if (!campaignLead) {
      throw new ApiError(404, 'Campaign lead not found', 'LEAD_NOT_FOUND')
    }

    // Resume and re-schedule
    const scheduleResult = await resumeFollowUp(leadId)

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
      message: 'Follow-ups resumed successfully',
      campaignLead: updated,
      nextFollowUp: scheduleResult.nextDate,
      scheduled: scheduleResult.scheduled,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
