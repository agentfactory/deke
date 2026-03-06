import { z } from 'zod'

export const createSubscriberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Valid email is required'),
  location: z.string().min(1, 'Location is required'),
  groupName: z.string().optional().nullable(),
  newsletterOptIn: z.boolean().default(false),
})

export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>
