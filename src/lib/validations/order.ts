import { z } from 'zod'

// Order status enum
export const orderStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'REVIEW',
  'REVISION',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
])

// Package tier enum
export const packageTierSchema = z.enum([
  'Essential',
  'Professional',
  'Premium',
])

// Create order schema
export const createOrderSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  songTitle: z.string().optional().nullable(),
  songArtist: z.string().optional().nullable(),
  voiceParts: z.number().int().min(1).max(20).optional().nullable(),
  packageTier: packageTierSchema.optional().nullable(),
  basePrice: z.number().min(0).optional().nullable(),
  rushFee: z.number().min(0).optional().nullable(),
  totalAmount: z.number().min(0).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
})

// Update order schema
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  songTitle: z.string().optional().nullable(),
  songArtist: z.string().optional().nullable(),
  voiceParts: z.number().int().min(1).max(20).optional().nullable(),
  packageTier: packageTierSchema.optional().nullable(),
  basePrice: z.number().min(0).optional().nullable(),
  rushFee: z.number().min(0).optional().nullable(),
  totalAmount: z.number().min(0).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  deliveredAt: z.string().datetime().optional().nullable(),
  downloadUrl: z.string().url().optional().nullable(),
  revisionsUsed: z.number().int().min(0).optional(),
  revisionsMax: z.number().int().min(0).optional(),
})

// Query filters for listing orders
export const orderFiltersSchema = z.object({
  status: orderStatusSchema.optional(),
  leadId: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

// Type exports
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type OrderFilters = z.infer<typeof orderFiltersSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
