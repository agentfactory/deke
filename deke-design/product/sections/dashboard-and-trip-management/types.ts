// =============================================================================
// Data Types
// =============================================================================

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

export interface Booking {
  id: string
  tripId: string
  venueId: string
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

export interface Expense {
  id: string
  tripId: string
  category: 'flight' | 'lodging' | 'meals' | 'transportation' | 'other'
  description: string
  amount: number
  date: string
  vendor: string
  reimbursable: boolean
  status: 'pending' | 'approved' | 'paid' | 'rejected'
}

export interface Participant {
  id: string
  bookingId: string
  name: string
  email: string
  role: string
  attending: boolean
  notes: string
}

export interface Venue {
  id: string
  name: string
  type: 'chorus' | 'a-cappella-group' | 'barbershop' | 'other'
  city: string
  state: string
  website: string
  memberCount: number
  genre: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardProps {
  /** The list of trips to display */
  trips: Trip[]
  /** The list of all bookings across trips */
  bookings: Booking[]
  /** The list of all expenses across trips */
  expenses: Expense[]
  /** The list of all participants across bookings */
  participants: Participant[]
  /** The list of all venues */
  venues: Venue[]

  /** Called when user wants to view a trip's full details */
  onViewTrip?: (tripId: string) => void
  /** Called when user wants to create a new trip */
  onCreateTrip?: () => void
  /** Called when user wants to edit an existing trip */
  onEditTrip?: (tripId: string) => void
  /** Called when user wants to delete a trip */
  onDeleteTrip?: (tripId: string) => void

  /** Called when user wants to add a booking to a trip */
  onAddBooking?: (tripId: string) => void
  /** Called when user wants to edit a booking */
  onEditBooking?: (bookingId: string) => void
  /** Called when user wants to delete a booking */
  onDeleteBooking?: (bookingId: string) => void

  /** Called when user wants to add an expense to a trip */
  onAddExpense?: (tripId: string) => void
  /** Called when user wants to edit an expense */
  onEditExpense?: (expenseId: string) => void
  /** Called when user wants to delete an expense */
  onDeleteExpense?: (expenseId: string) => void

  /** Called when user wants to view profitability breakdown for a trip */
  onViewProfitability?: (tripId: string) => void
}
