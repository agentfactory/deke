import { z } from 'zod'

export const generateDraftsSchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1, 'At least one lead ID is required'),
  templateId: z.string().min(1).optional(),
})

export const updateDraftSchema = z.object({
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
})

export const sendDraftsSchema = z.object({
  draftIds: z.array(z.string().min(1)).optional(),
})

export type GenerateDraftsInput = z.infer<typeof generateDraftsSchema>
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>
export type SendDraftsInput = z.infer<typeof sendDraftsSchema>
