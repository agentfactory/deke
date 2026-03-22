import { z } from 'zod'

// Create contact schema
export const createContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  contactTitle: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  website: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
})

// Update contact schema
export const updateContactSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  contactTitle: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  website: z.string().optional().nullable(),
})

// Query filters for listing contacts
export const contactFiltersSchema = z.object({
  email: z.string().optional(),
  organization: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(500)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

// Type exports
export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type ContactFilters = z.infer<typeof contactFiltersSchema>
