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
