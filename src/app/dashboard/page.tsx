import { TripList } from '@/components/trips/trip-list'
import { prisma } from '@/lib/db'
import { mapTripsToComponent, mapBookingToTripBooking } from '@/lib/mappers/trip'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardData() {
  try {
    // Fetch all trips with their bookings and expenses
    const tripsData = await prisma.trip.findMany({
      include: {
        bookings: {
          include: {
            lead: {
              select: {
                firstName: true,
                lastName: true,
                organization: true
              }
            },
            travelExpenses: true,
            participants: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    // Transform to component format
    const trips = mapTripsToComponent(tripsData)

    // Flatten all bookings
    const bookings = tripsData.flatMap(trip =>
      trip.bookings.map(booking => mapBookingToTripBooking(booking))
    )

    return {
      trips,
      bookings
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      trips: [],
      bookings: []
    }
  }
}

export default async function DashboardPage() {
  const { trips, bookings } = await getDashboardData()

  return <TripList trips={trips} bookings={bookings} />
}
