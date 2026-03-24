import { z } from 'zod'

export const NEWSLETTER_SECTIONS = ['STORY', 'CRAFT', 'COMMUNITY', 'NOTE', 'UNCATEGORIZED'] as const
export type NewsletterSection = (typeof NEWSLETTER_SECTIONS)[number]

export const NEWSLETTER_STATUSES = ['DRAFT', 'READY', 'SENDING', 'SENT'] as const
export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number]

export const IDEA_STATUSES = ['IDEA', 'USED'] as const

// Ideas
export const createIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().max(5000).optional(),
  section: z.enum(NEWSLETTER_SECTIONS).default('UNCATEGORIZED'),
})

export const updateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(5000).nullable().optional(),
  section: z.enum(NEWSLETTER_SECTIONS).optional(),
  status: z.enum(IDEA_STATUSES).optional(),
  issueId: z.string().nullable().optional(),
})

// Issues
export const createIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subject: z.string().max(200).optional(),
})

export const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subject: z.string().max(200).nullable().optional(),
  storyContent: z.string().nullable().optional(),
  craftContent: z.string().nullable().optional(),
  communityContent: z.string().nullable().optional(),
  noteContent: z.string().nullable().optional(),
  status: z.enum(NEWSLETTER_STATUSES).optional(),
})
