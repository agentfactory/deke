import { prisma } from '@/lib/db';
import { BookingsClient } from './bookings-client';
import { mapBookingsToComponent } from '@/lib/mappers/booking';
import type { ComponentBooking } from '@/lib/mappers/booking';

// Disable cache for real-time updates
export const revalidate = 0;

export default async function BookingsPage() {
  let bookings: ComponentBooking[] = [];

  try {
    const bookingsData = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lead: true,
        inquiry: true,
        campaigns: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    bookings = mapBookingsToComponent(bookingsData);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    // bookings remains empty array
  }

  return <BookingsClient initialBookings={bookings} />;
}
