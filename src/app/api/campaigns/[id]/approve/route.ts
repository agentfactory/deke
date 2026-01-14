import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'

type Params = {
  params: Promise<{
    id: string
  }>
}

// POST /api/campaigns/[id]/approve - Approve campaign (Phase 2 stub)
export async function POST(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        _count: {
          select: {
            leads: true
          }
        }
      }
    })

    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND')
    }

    // Validate campaign can be approved
    if (campaign.status !== 'DRAFT') {
      throw new ApiError(
        400,
        'Only draft campaigns can be approved',
        'INVALID_STATUS'
      )
    }

    if (campaign._count.leads === 0) {
      throw new ApiError(
        400,
        'Cannot approve campaign with no leads',
        'NO_LEADS'
      )
    }

    // Update campaign status to APPROVED
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            leads: true,
            outreachLogs: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Campaign approved successfully',
      campaign: updatedCampaign
    })
  } catch (error) {
    return handleApiError(error)
  }
}
