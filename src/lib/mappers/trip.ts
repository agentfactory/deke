// Map Prisma models to Trip types for UI components

import type { Trip as PrismaTrip, Booking as PrismaBooking } from '@prisma/client'
import type { Trip, TripBooking } from '@/types/trips'

type TripWithRelations = PrismaTrip & {
  bookings: (PrismaBooking & {
    contact: { firstName: string; lastName: string; organization: string | null }
  })[]
}

export function mapTripToComponent(trip: TripWithRelations): Trip {
  const totalRevenue = trip.bookings.reduce((sum: number, booking) => sum + (booking.amount || 0), 0)

  return {
    id: trip.id,
    name: trip.name,
    location: trip.location,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    status: trip.status as Trip['status'],
    bookingsCount: trip.bookings.length,
    totalRevenue,
  }
}

export function mapTripsToComponent(trips: TripWithRelations[]): Trip[] {
  return trips.map(mapTripToComponent)
}

export function mapBookingToTripBooking(booking: PrismaBooking & {
  contact: { firstName: string; lastName: string; organization: string | null }
}): TripBooking {
  return {
    id: booking.id,
    tripId: booking.tripId || '',
    venueName: booking.contact?.organization || (booking.contact ? `${booking.contact.firstName} ${booking.contact.lastName}` : 'Unknown Contact'),
    date: booking.startDate?.toISOString() || '',
    time: booking.startDate?.toLocaleTimeString() || '',
    duration: booking.endDate && booking.startDate
      ? `${Math.round((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60))}h`
      : '2h',
    fee: booking.amount || 0,
    status: booking.status.toLowerCase() as TripBooking['status'],
    type: booking.serviceType.toLowerCase().replace('_', '-') as TripBooking['type'],
    notes: booking.internalNotes || '',
  }
}
