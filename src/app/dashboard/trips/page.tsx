import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plane, MapPin, Calendar, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STATUS_STYLES: Record<string, string> = {
  upcoming: 'text-blue-700 bg-blue-50 border-blue-200',
  'in-progress': 'text-green-700 bg-green-50 border-green-200',
  completed: 'text-gray-600 bg-gray-100 border-gray-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date)
}

function formatDateRange(start: Date, end: Date): string {
  const s = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start)
  const e = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(end)
  return `${s} – ${e}`
}

async function getTrips() {
  return prisma.trip.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { bookings: true } },
    },
  })
}

export default async function TripsPage() {
  let trips: Awaited<ReturnType<typeof getTrips>> = []

  try {
    trips = await getTrips()
  } catch (error) {
    console.error('Error fetching trips:', error)
  }

  const upcoming = trips.filter(t => t.status === 'upcoming')
  const past = trips.filter(t => t.status !== 'upcoming')

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-3">
            <Plane className="h-7 w-7 text-stone-400" />
            Trips
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {trips.length} total trips &middot; {upcoming.length} upcoming
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Plane className="h-10 w-10 text-stone-300" />
            <p className="mt-3 text-sm text-stone-500">No trips scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Upcoming</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">Past & Other</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TripCard({ trip }: {
  trip: {
    id: string
    name: string
    location: string
    startDate: Date
    endDate: Date
    status: string
    notes: string | null
    _count: { bookings: number }
  }
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">{trip.name}</CardTitle>
          <Badge variant="outline" className={`text-xs ${STATUS_STYLES[trip.status] || ''}`}>
            {trip.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{trip.location}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
          <Users className="h-4 w-4 shrink-0" />
          <span>{trip._count.bookings} booking{trip._count.bookings !== 1 ? 's' : ''}</span>
        </div>
        {trip.notes && (
          <p className="text-xs text-stone-400 mt-2 line-clamp-2">{trip.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
