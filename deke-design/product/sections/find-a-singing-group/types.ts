// =============================================================================
// Data Types
// =============================================================================

export interface GroupRequest {
  id: string
  name: string
  email: string
  phone: string
  age: number
  location: string
  zipCode: string
  preferences: {
    genres: string[]
    experience: 'beginner' | 'intermediate' | 'advanced'
    commitment: 'monthly-gatherings' | 'weekly-rehearsals' | 'twice-weekly'
    performanceInterest: boolean
  }
  message: string
  status: 'new' | 'in-progress' | 'matched' | 'responded'
  matchScore: number
  suggestedVenues: string[]
  submittedDate: string
  lastUpdated: string
}

export interface Venue {
  id: string
  name: string
  type: 'chorus' | 'a-cappella-group' | 'barbershop' | 'other'
  city: string
  state: string
  zipCode: string
  website: string
  memberCount: number
  genre: string
  acceptsBeginners: boolean
  rehearsalSchedule: 'monthly-gatherings' | 'weekly-rehearsals' | 'twice-weekly'
}

// =============================================================================
// Component Props
// =============================================================================

export interface RequestListProps {
  /** The list of group requests to display */
  groupRequests: GroupRequest[]
  /** The list of all venues for matching */
  venues: Venue[]

  /** Called when user wants to view a request's full details */
  onViewRequest?: (requestId: string) => void
  /** Called when user wants to mark a request as in-progress */
  onMarkInProgress?: (requestId: string) => void
  /** Called when user wants to mark a request as matched */
  onMarkMatched?: (requestId: string) => void
  /** Called when user wants to mark a request as responded */
  onMarkResponded?: (requestId: string) => void
  /** Called when user wants to respond to a request */
  onRespond?: (requestId: string) => void
  /** Called when user wants to view suggested venues for a request */
  onViewSuggestedVenues?: (requestId: string) => void
  /** Called when user wants to archive a request */
  onArchive?: (requestId: string) => void
}
