import { z } from 'zod'

// Payment status enum
export const participantPaymentStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'PARTIAL',
  'OVERDUE'
])

// Create participant schema
export const createParticipantSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email('Invalid email format').optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  groupSize: z.number().int().positive('Group size must be positive').optional().nullable(),
  splitPercent: z.number().min(0).max(100).default(0),
  amountDue: z.number().min(0).default(0),
  travelShareDue: z.number().min(0).default(0),
  paymentStatus: participantPaymentStatusSchema.default('PENDING'),
})

// Update participant schema (partial, without bookingId)
export const updateParticipantSchema = createParticipantSchema
  .partial()
  .omit({ bookingId: true })

// Validation for split calculation
export const validateParticipantSplitsSchema = z.object({
  participants: z.array(z.object({
    id: z.string(),
    splitPercent: z.number().min(0).max(100),
    amountDue: z.number().min(0),
  })),
  totalAmount: z.number().min(0),
}).refine((data) => {
  // Check that all split percentages sum to 100%
  const totalPercent = data.participants.reduce((sum, p) => sum + p.splitPercent, 0)
  return Math.abs(totalPercent - 100) < 0.01 // Allow for small floating point errors
}, {
  message: "Participant split percentages must sum to 100%",
  path: ["participants"]
}).refine((data) => {
  // Check that all amounts sum to total
  const totalAmounts = data.participants.reduce((sum, p) => sum + p.amountDue, 0)
  return Math.abs(totalAmounts - data.totalAmount) < 0.01 // Allow for small floating point errors
}, {
  message: "Participant amounts must sum to total amount",
  path: ["participants"]
})

// Type exports
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>
export type ValidateParticipantSplitsInput = z.infer<typeof validateParticipantSplitsSchema>
