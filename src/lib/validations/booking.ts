import { z } from 'zod'

// Service type enum
export const serviceTypeSchema = z.enum([
  'ARRANGEMENT',
  'GROUP_COACHING',
  'INDIVIDUAL_COACHING',
  'WORKSHOP',
  'SPEAKING',
  'MASTERCLASS',
  'CONSULTATION'
])

// Booking status enum
export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED'
])

// Payment status enum
export const paymentStatusSchema = z.enum([
  'UNPAID',
  'DEPOSIT_PAID',
  'PAID_IN_FULL',
  'REFUNDED',
  'OVERDUE'
])

// Create booking schema
export const createBookingSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  inquiryId: z.string().optional().nullable(),
  serviceType: serviceTypeSchema,
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  timezone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  amount: z.number().min(0).optional().nullable(),
  depositPaid: z.number().min(0).optional().nullable(),
  balanceDue: z.number().min(0).optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  clientNotes: z.string().optional().nullable(),
})

// Query filters for listing bookings
export const bookingFiltersSchema = z.object({
  status: bookingStatusSchema.optional(),
  serviceType: serviceTypeSchema.optional(),
  leadId: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

// Type exports
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type BookingFilters = z.infer<typeof bookingFiltersSchema>
