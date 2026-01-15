import { prisma } from '@/lib/db'
import { calculateNextFollowUp, getCadenceRule } from './cadence'

/**
 * Phase 6: Smart Follow-Up Automation
 * Scheduler - Manages follow-up scheduling and auto-pause logic
 */

export interface ScheduleFollowUpParams {
  campaignLeadId: string
  currentFollowUpCount: number // 0 for initial, 1 after first, etc.
}

export interface ScheduleFollowUpResult {
  scheduled: boolean
  nextDate: Date | null
  followUpNumber: number
  reason?: string // Why not scheduled
}

/**
 * Schedule next follow-up for a campaign lead
 * Called after initial send or after each follow-up send
 */
export async function scheduleFollowUp(
  params: ScheduleFollowUpParams
): Promise<ScheduleFollowUpResult> {
  const { campaignLeadId, currentFollowUpCount } = params

  // Fetch campaign lead with related data
  const campaignLead = await prisma.campaignLead.findUnique({
    where: { id: campaignLeadId },
    include: {
      lead: true,
      campaign: true,
    },
  })

  if (!campaignLead) {
    return {
      scheduled: false,
      nextDate: null,
      followUpNumber: currentFollowUpCount + 1,
      reason: 'campaign_lead_not_found',
    }
  }

  // Check if paused
  if (campaignLead.followUpsPaused) {
    return {
      scheduled: false,
      nextDate: null,
      followUpNumber: currentFollowUpCount + 1,
      reason: 'follow_ups_paused',
    }
  }

  // Check if in terminal status
  const terminalStatuses = ['REMOVED', 'DECLINED', 'BOOKED']
  if (terminalStatuses.includes(campaignLead.status)) {
    return {
      scheduled: false,
      nextDate: null,
      followUpNumber: currentFollowUpCount + 1,
      reason: `terminal_status_${campaignLead.status.toLowerCase()}`,
    }
  }

  // Get cadence rule for this lead's source
  const rule = getCadenceRule(campaignLead.source)

  // Calculate next follow-up date
  const schedule = calculateNextFollowUp(
    campaignLead.source,
    currentFollowUpCount,
    campaignLead.updatedAt // Use last updated time as reference
  )

  // If should follow up, update database
  if (schedule.shouldFollowUp && schedule.nextDate) {
    await prisma.campaignLead.update({
      where: { id: campaignLeadId },
      data: {
        scheduledFollowUpDate: schedule.nextDate,
        followUpCount: currentFollowUpCount,
      },
    })

    return {
      scheduled: true,
      nextDate: schedule.nextDate,
      followUpNumber: schedule.followUpNumber,
    }
  }

  // No more follow-ups for this lead
  return {
    scheduled: false,
    nextDate: null,
    followUpNumber: schedule.followUpNumber,
    reason: `max_follow_ups_reached_${rule.maxFollowUps}`,
  }
}

/**
 * Auto-pause follow-ups when lead engages
 * Called by webhook handlers when engagement detected
 */
export async function autoPauseFollowUp(
  campaignLeadId: string,
  reason: 'clicked' | 'responded' | 'booked'
): Promise<void> {
  await prisma.campaignLead.update({
    where: { id: campaignLeadId },
    data: {
      followUpsPaused: true,
      followUpPauseReason: reason,
      followUpPausedAt: new Date(),
      scheduledFollowUpDate: null, // Clear to prevent accidental sends
    },
  })
}

/**
 * Check if a status should trigger auto-pause
 * Used by webhook handlers to determine if they should pause
 */
export function shouldAutoPause(status: string): boolean {
  const autoPauseStatuses = ['CLICKED', 'RESPONDED', 'BOOKED']
  return autoPauseStatuses.includes(status)
}

/**
 * Manually pause follow-ups for a lead
 * Called by API endpoint
 */
export async function manualPauseFollowUp(
  campaignLeadId: string,
  reason: string
): Promise<void> {
  await prisma.campaignLead.update({
    where: { id: campaignLeadId },
    data: {
      followUpsPaused: true,
      followUpPauseReason: reason,
      followUpPausedAt: new Date(),
      scheduledFollowUpDate: null,
    },
  })
}

/**
 * Resume follow-ups for a lead
 * Re-calculates next follow-up date based on current state
 */
export async function resumeFollowUp(
  campaignLeadId: string
): Promise<ScheduleFollowUpResult> {
  // Get current state
  const campaignLead = await prisma.campaignLead.findUnique({
    where: { id: campaignLeadId },
  })

  if (!campaignLead) {
    return {
      scheduled: false,
      nextDate: null,
      followUpNumber: 0,
      reason: 'campaign_lead_not_found',
    }
  }

  // Re-schedule based on current follow-up count
  const scheduleResult = await scheduleFollowUp({
    campaignLeadId,
    currentFollowUpCount: campaignLead.followUpCount,
  })

  // Update pause state
  await prisma.campaignLead.update({
    where: { id: campaignLeadId },
    data: {
      followUpsPaused: false,
      followUpPauseReason: null,
      followUpPausedAt: null,
      scheduledFollowUpDate: scheduleResult.nextDate,
    },
  })

  return scheduleResult
}
