import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { processOutreachQueue } from '@/lib/outreach/queue'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { channel, leadIds } = await request.json()

    // Fetch campaign leads
    const campaignLeads = await prisma.campaignLead.findMany({
      where: {
        campaignId: id,
        id: { in: leadIds },
      },
      include: {
        lead: true,
        campaign: true,
      },
    })

    if (campaignLeads.length === 0) {
      return NextResponse.json({ error: 'No leads found' }, { status: 404 })
    }

    // Create outreach jobs (reuse launch logic)
    const results = await processOutreachQueue(
      campaignLeads.map(cl => ({
        campaignLeadId: cl.id,
        channel: channel as 'EMAIL' | 'SMS',
        template: channel === 'EMAIL'
          ? 'Hey {{firstName}}, just reaching out about {{serviceType}}!'
          : 'Hi {{firstName}}! Interested in {{serviceType}}? Reply for details.',
        variables: {
          firstName: cl.lead.firstName,
          lastName: cl.lead.lastName,
          organization: cl.lead.organization || '',
          serviceType: cl.campaign.booking?.serviceType || 'our services',
        },
      }))
    )

    return NextResponse.json({
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    })
  } catch (error) {
    console.error('Bulk send error:', error)
    return NextResponse.json(
      { error: 'Failed to send messages' },
      { status: 500 }
    )
  }
}
