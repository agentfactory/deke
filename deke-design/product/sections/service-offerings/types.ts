// =============================================================================
// Data Types
// =============================================================================

export interface ServiceOffering {
  id: string
  title: string
  type: 'speaking' | 'coaching' | 'workshop' | 'masterclass' | 'arrangements'
  slug: string
  tagline: string
  description: string
  pricing: string
  duration: string
  featured: boolean
  imageUrl: string
  features: string[]
  idealFor: string[]
  testimonial: {
    quote: string
    author: string
    role: string
  }
}

// =============================================================================
// Component Props
// =============================================================================

export interface ServiceListProps {
  /** The list of service offerings to display */
  serviceOfferings: ServiceOffering[]

  /** Called when user wants to view service details */
  onViewService?: (serviceId: string) => void
  /** Called when user wants to request booking for a service */
  onRequestBooking?: (serviceId: string) => void
  /** Called when user wants to contact about a service */
  onContactAboutService?: (serviceId: string) => void
  /** Called when user filters by service type */
  onFilterByType?: (type: ServiceOffering['type'] | 'all') => void
}
