import { addDays } from 'date-fns'

/**
 * Phase 6: Smart Follow-Up Automation
 * Cadence Rules Engine - Defines follow-up schedules by lead source type
 */

export interface FollowUpRule {
  source: string
  maxFollowUps: number
  schedule: number[] // Days after initial contact
  description: string
}

export interface FollowUpSchedule {
  shouldFollowUp: boolean
  nextDate: Date | null
  followUpNumber: number // 1 or 2
  daysFromNow: number
}

/**
 * Hardcoded cadence rules by lead source
 * These define how many follow-ups to send and when
 */
const CADENCE_RULES: Record<string, FollowUpRule> = {
  PAST_CLIENT: {
    source: 'PAST_CLIENT',
    maxFollowUps: 1,
    schedule: [7], // 1 follow-up @ day 7
    description: 'Warm leads: single follow-up after 1 week',
  },
  DORMANT: {
    source: 'DORMANT',
    maxFollowUps: 2,
    schedule: [5, 12], // 2 follow-ups @ days 5, 12
    description: 'Re-engagement: two follow-ups',
  },
  SIMILAR_ORG: {
    source: 'SIMILAR_ORG',
    maxFollowUps: 0,
    schedule: [], // Cold leads: no follow-ups
    description: 'Cold outreach: no automated follow-ups',
  },
  AI_RESEARCH: {
    source: 'AI_RESEARCH',
    maxFollowUps: 0,
    schedule: [],
    description: 'AI-discovered leads: no follow-ups',
  },
  MANUAL_IMPORT: {
    source: 'MANUAL_IMPORT',
    maxFollowUps: 0,
    schedule: [],
    description: 'Manual imports: no follow-ups',
  },
}

/**
 * Default rule for unknown sources - no follow-ups
 */
const DEFAULT_RULE: FollowUpRule = {
  source: 'UNKNOWN',
  maxFollowUps: 0,
  schedule: [],
  description: 'Unknown source: no follow-ups',
}

/**
 * Get cadence rule for a lead source
 * Returns default rule if source not found
 */
export function getCadenceRule(source: string): FollowUpRule {
  return CADENCE_RULES[source] || DEFAULT_RULE
}

/**
 * Calculate next follow-up date based on current count and source
 * Returns null if no more follow-ups should be sent
 */
export function calculateNextFollowUp(
  source: string,
  currentCount: number,
  lastContactedAt: Date
): FollowUpSchedule {
  const rule = getCadenceRule(source)

  // Check if we've reached max follow-ups
  if (currentCount >= rule.maxFollowUps) {
    return {
      shouldFollowUp: false,
      nextDate: null,
      followUpNumber: currentCount + 1,
      daysFromNow: 0,
    }
  }

  // Get days for this follow-up number (0-indexed array)
  const daysFromContact = rule.schedule[currentCount]

  if (daysFromContact === undefined) {
    return {
      shouldFollowUp: false,
      nextDate: null,
      followUpNumber: currentCount + 1,
      daysFromNow: 0,
    }
  }

  // Calculate next follow-up date
  const nextDate = addDays(lastContactedAt, daysFromContact)

  return {
    shouldFollowUp: true,
    nextDate,
    followUpNumber: currentCount + 1,
    daysFromNow: daysFromContact,
  }
}

/**
 * Check if a lead source should receive follow-ups
 */
export function shouldScheduleFollowUp(source: string): boolean {
  const rule = getCadenceRule(source)
  return rule.maxFollowUps > 0
}

/**
 * Get all cadence rules (for admin UI or debugging)
 */
export function getAllCadenceRules(): FollowUpRule[] {
  return Object.values(CADENCE_RULES)
}
