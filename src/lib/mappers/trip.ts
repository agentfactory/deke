// Map Prisma models to Trip types for UI components

import type { Trip as PrismaTrip, Booking as PrismaBooking, TravelExpense, BookingParticipant } from '@prisma/client'
import type { Trip, TripBooking } from '@/types/trips'

type TripWithRelations = PrismaTrip & {
  bookings: (PrismaBooking & {
    lead: { firstName: string; lastName: string; organization: string | null }
    travelExpenses: TravelExpense[]
    participants: BookingParticipant[]
  })[]
}

export function mapTripToComponent(trip: TripWithRelations): Trip {
  // Calculate totals from bookings
  const totalRevenue = trip.bookings.reduce((sum: number, booking) => sum + (booking.amount || 0), 0)
  const totalExpenses = trip.bookings.reduce((sum: number, booking) => {
    const bookingExpenses = booking.travelExpenses.reduce((expSum: number, exp) => {
      return expSum + (exp.flightCost || 0) + (exp.hotelCost || 0) + (exp.groundTransportCost || 0)
    }, 0)
    return sum + bookingExpenses
  }, 0)

  return {
    id: trip.id,
    name: trip.name,
    location: trip.location,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    status: trip.status as Trip['status'],
    bookingsCount: trip.bookings.length,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
  }
}

export function mapTripsToComponent(trips: TripWithRelations[]): Trip[] {
  return trips.map(mapTripToComponent)
}

export function mapBookingToTripBooking(booking: PrismaBooking & {
  lead: { firstName: string; lastName: string; organization: string | null }
  participants: BookingParticipant[]
}): TripBooking {
  return {
    id: booking.id,
    tripId: booking.tripId || '',
    venueName: booking.lead.organization || `${booking.lead.firstName} ${booking.lead.lastName}`,
    date: booking.startDate?.toISOString() || '',
    time: booking.startDate?.toLocaleTimeString() || '',
    duration: booking.endDate && booking.startDate
      ? `${Math.round((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60))}h`
      : '2h',
    fee: booking.amount || 0,
    status: booking.status.toLowerCase() as TripBooking['status'],
    type: booking.serviceType.toLowerCase().replace('_', '-') as TripBooking['type'],
    notes: booking.internalNotes || '',
    participantsCount: booking.participants.length
  }
}
