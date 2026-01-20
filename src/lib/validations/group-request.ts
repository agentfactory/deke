import { z } from 'zod'

// Experience levels
export const experienceLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'professional'
])

// Commitment levels
export const commitmentLevelSchema = z.enum([
  'casual',
  'regular',
  'intensive',
  'flexible'
])

// Group request status
export const groupRequestStatusSchema = z.enum([
  'PENDING',
  'REVIEWING',
  'MATCHED',
  'CLOSED'
])

// Create group request schema
export const createGroupRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  age: z.number().min(10).max(100).optional().nullable(),
  experience: experienceLevelSchema,
  commitment: commitmentLevelSchema,
  genres: z.array(z.string()).min(0),
  performanceInterest: z.boolean().default(false),
  message: z.string().optional().nullable(),
})

// Update group request schema (admin)
export const updateGroupRequestSchema = z.object({
  status: groupRequestStatusSchema.optional(),
  notes: z.string().optional().nullable(),
})

// Query filters
export const groupRequestFiltersSchema = z.object({
  status: groupRequestStatusSchema.optional(),
  location: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

// Type exports
export type CreateGroupRequestInput = z.infer<typeof createGroupRequestSchema>
export type UpdateGroupRequestInput = z.infer<typeof updateGroupRequestSchema>
export type GroupRequestFilters = z.infer<typeof groupRequestFiltersSchema>
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>
export type CommitmentLevel = z.infer<typeof commitmentLevelSchema>
export type GroupRequestStatus = z.infer<typeof groupRequestStatusSchema>
