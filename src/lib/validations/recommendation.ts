/**
 * Validation schemas for recommendation system
 */

import { z } from 'zod'

/**
 * Service types supported by the system
 */
export const ServiceTypeSchema = z.enum([
  'ARRANGEMENT',
  'GROUP_COACHING',
  'INDIVIDUAL_COACHING',
  'WORKSHOP',
  'SPEAKING',
  'MASTERCLASS',
  'CONSULTATION',
])

/**
 * Organization types
 */
export const OrgTypeSchema = z.enum([
  'UNIVERSITY',
  'COLLEGE',
  'HIGH_SCHOOL',
  'MIDDLE_SCHOOL',
  'ELEMENTARY_SCHOOL',
  'THEATRE',
  'THEATER',
  'CHOIR',
  'CHURCH',
  'SYNAGOGUE',
  'TEMPLE',
  'MOSQUE',
  'COMMUNITY_CENTER',
  'ARTS_CENTER',
  'MUSIC_SCHOOL',
  'CONSERVATORY',
  'PERFORMING_ARTS',
  'FESTIVAL',
  'CONFERENCE',
  'CONVENTION',
  'CORPORATE',
  'NONPROFIT',
  'UNKNOWN',
])

/**
 * Schema for creating a new service recommendation rule
 */
export const CreateServiceRecommendationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  triggerServiceType: ServiceTypeSchema.optional(),
  recommendedService: ServiceTypeSchema,
  orgTypes: z.array(OrgTypeSchema).optional(),
  minOrgSize: z.number().int().positive().optional(),
  maxOrgSize: z.number().int().positive().optional(),
  weight: z.number().min(0.5).max(2.0).default(1.0),
  priority: z.number().int().min(1).max(10).default(5),
  pitchPoints: z.array(z.string()).optional(),
  messageTemplate: z.string().optional(),
  active: z.boolean().default(true),
})

/**
 * Schema for updating an existing service recommendation rule
 */
export const UpdateServiceRecommendationSchema = CreateServiceRecommendationSchema.partial()

/**
 * Schema for getting recommendations query parameters
 */
export const GetRecommendationsQuerySchema = z.object({
  serviceType: ServiceTypeSchema.optional(),
  orgType: OrgTypeSchema.optional(),
  leadId: z.string().optional(),
})

/**
 * Schema for recommendation match response
 */
export const RecommendationMatchSchema = z.object({
  serviceType: z.string(),
  reason: z.string(),
  weight: z.number(),
  priority: z.number(),
  pitchPoints: z.array(z.string()),
  templateId: z.string().optional(),
})

/**
 * Schema for recommendations response
 */
export const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationMatchSchema),
})

// Type exports
export type ServiceType = z.infer<typeof ServiceTypeSchema>
export type OrgType = z.infer<typeof OrgTypeSchema>
export type CreateServiceRecommendation = z.infer<typeof CreateServiceRecommendationSchema>
export type UpdateServiceRecommendation = z.infer<typeof UpdateServiceRecommendationSchema>
export type GetRecommendationsQuery = z.infer<typeof GetRecommendationsQuerySchema>
export type RecommendationMatch = z.infer<typeof RecommendationMatchSchema>
export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>
