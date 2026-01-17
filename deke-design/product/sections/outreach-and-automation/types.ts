// =============================================================================
// Data Types
// =============================================================================

export interface EmailSequence {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft' | 'archived'
  stageCount: number
  totalContacts: number
  sentCount: number
  openedCount: number
  repliedCount: number
  convertedCount: number
  conversionRate: number
  createdAt: string
  lastRunAt: string
}

export interface Message {
  id: string
  sequenceId: string
  templateId: string
  contactId: string
  leadId: string | null
  subject: string
  status: 'sent' | 'opened' | 'replied' | 'bounced' | 'failed'
  sentAt: string
  openedAt?: string
  repliedAt?: string
  type: 'email' | 'sms'
}

export interface Template {
  id: string
  name: string
  category: 'cold-outreach' | 'nurture' | 'confirmation' | 'follow-up' | 're-engagement'
  subject: string
  preview: string
  usageCount: number
  averageOpenRate: number
  lastUsed: string
}

export interface Contact {
  id: string
  name: string
  email: string
  venueId: string
  venueName: string
  role: string
  lastContactedAt: string
}

export interface Lead {
  id: string
  venueName: string
  city: string
  state: string
  status: 'new' | 'contacted' | 'interested' | 'not-interested' | 'converted'
  source: 'ChoralNet' | 'CASA' | 'Facebook' | 'Instagram' | 'Google API' | 'CSV Import' | 'Manual'
  discoveredAt: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface OutreachProps {
  /** The list of email sequences to display */
  emailSequences: EmailSequence[]
  /** The list of all messages across sequences */
  messages: Message[]
  /** The list of message templates */
  templates: Template[]
  /** The list of contacts */
  contacts: Contact[]
  /** The list of leads */
  leads: Lead[]

  /** Called when user wants to view a sequence's full details */
  onViewSequence?: (sequenceId: string) => void
  /** Called when user wants to create a new sequence */
  onCreateSequence?: () => void
  /** Called when user wants to edit an existing sequence */
  onEditSequence?: (sequenceId: string) => void
  /** Called when user wants to delete a sequence */
  onDeleteSequence?: (sequenceId: string) => void
  /** Called when user wants to pause/resume a sequence */
  onToggleSequence?: (sequenceId: string) => void

  /** Called when user wants to view a template */
  onViewTemplate?: (templateId: string) => void
  /** Called when user wants to create a new template */
  onCreateTemplate?: () => void
  /** Called when user wants to edit a template */
  onEditTemplate?: (templateId: string) => void
  /** Called when user wants to delete a template */
  onDeleteTemplate?: (templateId: string) => void

  /** Called when user wants to view message details */
  onViewMessage?: (messageId: string) => void
  /** Called when user wants to view analytics for a sequence */
  onViewAnalytics?: (sequenceId: string) => void
}
