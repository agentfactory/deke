import { z } from 'zod'

// Outreach channel enum
export const outreachChannelSchema = z.enum([
  'EMAIL',
  'SMS',
  'LINKEDIN'
])

// Service type enum (reuse from booking)
export const serviceTypeSchema = z.enum([
  'ARRANGEMENT',
  'CONCERT',
  'FESTIVAL',
  'GROUP_COACHING',
  'INDIVIDUAL_COACHING',
  'MASTERCLASS',
  'SINGALONG',
  'SPEAKING',
  'WORKSHOP',
  'CONSULTATION'
])

// Query filters for templates
export const templateFiltersSchema = z.object({
  serviceType: serviceTypeSchema.optional(),
  channel: outreachChannelSchema.optional(),
})

// Type exports
export type TemplateFilters = z.infer<typeof templateFiltersSchema>
