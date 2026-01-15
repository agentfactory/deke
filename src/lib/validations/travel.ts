import { z } from 'zod'

// Ground transport type enum
export const groundTransportTypeSchema = z.enum([
  'CAR_RENTAL',
  'TAXI',
  'UBER',
  'OTHER'
])

// Payment responsibility enum
export const paymentResponsibilitySchema = z.enum([
  'CLIENT',
  'DEKE',
  'SPLIT'
])

// Base travel expense schema (without refinements)
const baseTravelExpenseSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),

  // Flight details
  flightCarrier: z.string().optional().nullable(),
  flightNumber: z.string().optional().nullable(),
  departureAirport: z.string().optional().nullable(),
  arrivalAirport: z.string().optional().nullable(),
  departureTime: z.string().datetime().optional().nullable(),
  arrivalTime: z.string().datetime().optional().nullable(),
  flightCost: z.number().min(0).optional().nullable(),

  // Hotel details
  hotelName: z.string().optional().nullable(),
  hotelAddress: z.string().optional().nullable(),
  checkInDate: z.string().datetime().optional().nullable(),
  checkOutDate: z.string().datetime().optional().nullable(),
  confirmationNumber: z.string().optional().nullable(),
  hotelCost: z.number().min(0).optional().nullable(),

  // Ground transportation
  groundTransport: groundTransportTypeSchema.optional().nullable(),
  groundTransportDetails: z.string().optional().nullable(),
  groundTransportCost: z.number().min(0).optional().nullable(),

  // Payment responsibility
  paymentResponsibility: paymentResponsibilitySchema.default('CLIENT'),
  clientPayPercent: z.number().min(0).max(100).optional().nullable(),
  dekePayPercent: z.number().min(0).max(100).optional().nullable(),
})

// Refinement function for payment responsibility validation
const validatePaymentResponsibility = (data: any) => {
  // If payment is SPLIT, percentages must sum to 100
  if (data.paymentResponsibility === 'SPLIT') {
    const clientPay = data.clientPayPercent ?? 0
    const dekePay = data.dekePayPercent ?? 0
    return clientPay + dekePay === 100
  }
  return true
}

// Create travel expense schema (with refinement)
export const createTravelExpenseSchema = baseTravelExpenseSchema.refine(
  validatePaymentResponsibility,
  {
    message: "Split percentages must sum to 100%",
    path: ["clientPayPercent"]
  }
)

// Update travel expense schema (partial of base, then add refinement)
export const updateTravelExpenseSchema = baseTravelExpenseSchema
  .partial()
  .omit({ bookingId: true })
  .refine(
    validatePaymentResponsibility,
    {
      message: "Split percentages must sum to 100%",
      path: ["clientPayPercent"]
    }
  )

// Type exports
export type CreateTravelExpenseInput = z.infer<typeof createTravelExpenseSchema>
export type UpdateTravelExpenseInput = z.infer<typeof updateTravelExpenseSchema>
