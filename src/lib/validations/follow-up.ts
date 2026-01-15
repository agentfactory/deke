import { z } from 'zod'

/**
 * Phase 6: Smart Follow-Up Automation
 * Validation Schemas - Zod schemas for follow-up APIs
 */

/**
 * Valid reasons for pausing follow-ups
 */
export const followUpPauseReasonSchema = z.enum([
  'manual', // User manually paused
  'opened', // Auto-pause trigger (optional)
  'clicked', // Auto-pause trigger
  'responded', // Auto-pause trigger
  'booked', // Auto-pause trigger
  'uninterested', // Manual pause - lead not interested
  'wrong_contact', // Manual pause - wrong contact info
  'other', // Manual pause - other reason
])

/**
 * Schema for pausing follow-ups
 */
export const pauseFollowUpSchema = z.object({
  reason: followUpPauseReasonSchema,
  notes: z.string().max(500).optional(),
})

/**
 * Schema for resuming follow-ups
 */
export const resumeFollowUpSchema = z.object({
  recalculateSchedule: z.boolean().default(true),
})

/**
 * Type exports
 */
export type FollowUpPauseReason = z.infer<typeof followUpPauseReasonSchema>
export type PauseFollowUpInput = z.infer<typeof pauseFollowUpSchema>
export type ResumeFollowUpInput = z.infer<typeof resumeFollowUpSchema>
