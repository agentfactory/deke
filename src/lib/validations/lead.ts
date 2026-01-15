import { z } from 'zod'

// Lead status enum
export const leadStatusSchema = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATING',
  'WON',
  'LOST',
  'DORMANT'
])

// Lead source enum
export const leadSourceSchema = z.enum([
  'website',
  'website_booking_form',
  'website_chat',
  'referral',
  'social',
  'event',
  'campaign',
  'other'
])

// Create/Update lead schema
export const createLeadSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  source: leadSourceSchema.optional().nullable(),
  status: leadStatusSchema.optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
})

// Query filters for listing leads
export const leadFiltersSchema = z.object({
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.optional(),
  email: z.string().optional(),
  organization: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

// Update lead schema (email cannot be changed)
export const updateLeadSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  source: leadSourceSchema.optional(),
  status: leadStatusSchema.optional(),
  score: z.number().min(0).max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
})

// Type exports
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type LeadFilters = z.infer<typeof leadFiltersSchema>
export type LeadStatus = z.infer<typeof leadStatusSchema>
export type LeadSource = z.infer<typeof leadSourceSchema>
