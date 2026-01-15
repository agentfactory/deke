import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { processOutreachQueue, type OutreachJob } from '@/lib/outreach/queue'
import { scheduleFollowUp } from '@/lib/follow-up/scheduler'

/**
 * Phase 6: Smart Follow-Up Automation
 * Cron Job - Daily job to process due follow-ups
 *
 * Secured with CRON_SECRET environment variable
 * Configured in vercel.json to run daily at 9:00 AM UTC
 */

/**
 * GET /api/cron/follow-up
 * Process all due follow-ups
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify authorization (Vercel Cron or manual with secret)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const startTime = Date.now()

    // 2. Find all leads with due follow-ups
    const dueLeads = await prisma.campaignLead.findMany({
      where: {
        scheduledFollowUpDate: {
          lte: new Date(), // Due now or past due
        },
        followUpsPaused: false, // Not paused
        status: {
          in: ['CONTACTED', 'OPENED', 'CLICKED'], // Valid states
        },
      },
      include: {
        lead: true,
        campaign: true,
      },
      orderBy: {
        scheduledFollowUpDate: 'asc', // Oldest first
      },
    })

    console.log(`Found ${dueLeads.length} due follow-ups`)

    if (dueLeads.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        sent: 0,
        failed: 0,
        message: 'No due follow-ups found',
        timestamp: new Date().toISOString(),
      })
    }

    // 3. Create outreach jobs for each due lead
    const jobs: OutreachJob[] = []

    for (const campaignLead of dueLeads) {
      // Get follow-up template
      const template = await getFollowUpTemplate(
        campaignLead.followUpCount + 1, // Next follow-up number
        'EMAIL' // Default channel
      )

      if (template) {
        jobs.push({
          campaignLeadId: campaignLead.id,
          channel: 'EMAIL',
          template: template.body,
          variables: {
            subject: template.subject || 'Following up',
            baseLocation: campaignLead.campaign.baseLocation,
          },
        })
      } else {
        console.warn(
          `No template found for follow-up ${campaignLead.followUpCount + 1}, campaign lead ${campaignLead.id}`
        )
      }
    }

    // 4. Process outreach queue (reuse Phase 5 infrastructure)
    const results = await processOutreachQueue(jobs)

    // 5. Schedule next follow-ups for successful sends
    let nextScheduled = 0
    for (const result of results) {
      if (result.success) {
        const campaignLead = dueLeads.find(cl => cl.id === result.jobId)
        if (campaignLead) {
          const scheduleResult = await scheduleFollowUp({
            campaignLeadId: result.jobId,
            currentFollowUpCount: campaignLead.followUpCount + 1,
          })
          if (scheduleResult.scheduled) {
            nextScheduled++
          }
        }
      }
    }

    // 6. Return summary
    const sent = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const duration = Date.now() - startTime

    console.log(
      `Follow-up cron completed: ${sent} sent, ${failed} failed, ${nextScheduled} next scheduled (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      processed: dueLeads.length,
      sent,
      failed,
      nextScheduled,
      duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Follow-up cron error:', error)
    return handleApiError(error)
  }
}

/**
 * Helper: Get follow-up template by number
 * Looks for follow-up-1, follow-up-2, or falls back to follow-up-generic
 */
async function getFollowUpTemplate(
  followUpNumber: number,
  channel: string
): Promise<{ body: string; subject?: string } | null> {
  // Try specific follow-up number
  let template = await prisma.messageTemplate.findFirst({
    where: {
      name: `follow-up-${followUpNumber}`,
      channel,
    },
  })

  // Fallback to generic follow-up template
  if (!template) {
    template = await prisma.messageTemplate.findFirst({
      where: {
        name: 'follow-up-generic',
        channel,
      },
    })
  }

  // Last resort: use a hardcoded default
  if (!template) {
    console.warn(
      `No follow-up template found for number ${followUpNumber}, using default`
    )
    return {
      body: 'Hi {{firstName}}, following up on my previous message. Still interested in discussing opportunities? Best, Deke Sharon',
      subject: 'Following up',
    }
  }

  return {
    body: template.body,
    subject: template.subject || undefined,
  }
}
