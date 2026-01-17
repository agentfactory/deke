// Trip types adapted from Design OS to match Prisma schema

export interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
  bookingsCount: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
}

export interface TripBooking {
  id: string
  tripId: string
  venueName: string
  date: string
  time: string
  duration: string
  fee: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  type: 'workshop' | 'coaching' | 'masterclass' | 'speaking' | 'other'
  notes: string
  participantsCount: number
}
