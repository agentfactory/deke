// =============================================================================
// Data Types
// =============================================================================

export interface Campaign {
  id: string
  name: string
  location: string
  radius: number
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  createdDate: string
  completedDate: string | null
  sources: ('choralnet' | 'casa' | 'facebook' | 'instagram' | 'google')[]
  totalLeads: number
  highScoreLeads: number
  mediumScoreLeads: number
  lowScoreLeads: number
}

export interface Lead {
  id: string
  campaignId: string
  venueId: string
  venueName: string
  score: number
  source: 'choralnet' | 'casa' | 'facebook' | 'instagram' | 'google'
  status: 'qualified' | 'review' | 'disqualified'
  contactStatus: 'not-contacted' | 'contacted' | 'interested' | 'not-interested'
  city: string
  state: string
  venueType: 'chorus' | 'a-cappella-group' | 'barbershop' | 'other'
  memberCount: number
  website: string | null
  notes: string
  discoveredDate: string
}

export interface Venue {
  id: string
  name: string
  type: 'chorus' | 'a-cappella-group' | 'barbershop' | 'other'
  city: string
  state: string
  website: string | null
  memberCount: number
  genre: string
}

export interface Contact {
  id: string
  venueId: string
  name: string
  email: string
  role: string
  phone: string
  notes: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface CampaignListProps {
  /** The list of campaigns to display */
  campaigns: Campaign[]
  /** The list of all leads across campaigns */
  leads: Lead[]
  /** The list of all venues */
  venues: Venue[]
  /** The list of all contacts */
  contacts: Contact[]

  /** Called when user wants to view a campaign's leads */
  onViewCampaign?: (campaignId: string) => void
  /** Called when user wants to create a new campaign */
  onCreateCampaign?: () => void
  /** Called when user wants to edit an existing campaign */
  onEditCampaign?: (campaignId: string) => void
  /** Called when user wants to delete a campaign */
  onDeleteCampaign?: (campaignId: string) => void

  /** Called when user wants to view lead details */
  onViewLead?: (leadId: string) => void
  /** Called when user wants to contact a lead */
  onContactLead?: (leadId: string) => void
  /** Called when user wants to convert a lead to booking */
  onConvertLead?: (leadId: string) => void
  /** Called when user wants to disqualify a lead */
  onDisqualifyLead?: (leadId: string) => void

  /** Called when user wants to filter leads by score range */
  onFilterByScore?: (minScore: number, maxScore: number) => void
  /** Called when user wants to filter leads by source */
  onFilterBySource?: (source: Lead['source']) => void
  /** Called when user wants to filter leads by status */
  onFilterByStatus?: (status: Lead['status']) => void
}
