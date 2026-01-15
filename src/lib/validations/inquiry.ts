import { z } from 'zod'
import { serviceTypeSchema } from './booking'

// Inquiry status enum
export const inquiryStatusSchema = z.enum([
  'PENDING',
  'QUOTED',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED'
])

// Create inquiry schema
export const createInquirySchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  serviceType: serviceTypeSchema,
  message: z.string().min(1, 'Message is required'),
  details: z.string().optional().nullable(),
  quotedAmount: z.number().min(0).optional().nullable(),
  quotedAt: z.string().datetime().optional().nullable(),
  quoteExpiry: z.string().datetime().optional().nullable(),
})

// Update inquiry schema
export const updateInquirySchema = z.object({
  status: inquiryStatusSchema.optional(),
  quotedAmount: z.number().min(0).optional().nullable(),
  quotedAt: z.string().datetime().optional().nullable(),
  quoteExpiry: z.string().datetime().optional().nullable(),
  details: z.string().optional().nullable(),
})

// Query filters for listing inquiries
export const inquiryFiltersSchema = z.object({
  status: inquiryStatusSchema.optional(),
  leadId: z.string().optional(),
  serviceType: serviceTypeSchema.optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

// Type exports
export type CreateInquiryInput = z.infer<typeof createInquirySchema>
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>
export type InquiryFilters = z.infer<typeof inquiryFiltersSchema>
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>
