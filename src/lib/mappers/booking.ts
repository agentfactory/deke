import type { Booking, Lead, Inquiry } from '@prisma/client';

type BookingWithRelations = Booking & {
  lead: Lead;
  inquiry?: Inquiry | null;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
  }>;
};

export type ComponentBooking = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  serviceType: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  amount: number | null;
  depositPaid: number | null;
  balanceDue: number | null;
  paymentStatus: 'UNPAID' | 'DEPOSIT_PAID' | 'PAID_IN_FULL' | 'REFUNDED' | 'OVERDUE';
  internalNotes: string | null;
  clientNotes: string | null;

  // Lead info (flattened for easy display)
  leadName: string;
  leadEmail: string;
  leadPhone: string | null;
  leadOrganization: string | null;

  // Related counts
  campaignCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
};

export function mapBookingToComponent(
  booking: BookingWithRelations
): ComponentBooking {
  return {
    id: booking.id,
    status: booking.status as ComponentBooking['status'],
    serviceType: booking.serviceType,
    startDate: booking.startDate?.toISOString() || null,
    endDate: booking.endDate?.toISOString() || null,
    location: booking.location,
    amount: booking.amount,
    depositPaid: booking.depositPaid,
    balanceDue: booking.balanceDue,
    paymentStatus: booking.paymentStatus as ComponentBooking['paymentStatus'],
    internalNotes: booking.internalNotes,
    clientNotes: booking.clientNotes,

    // Flatten lead info
    leadName: `${booking.lead.firstName} ${booking.lead.lastName}`,
    leadEmail: booking.lead.email,
    leadPhone: booking.lead.phone,
    leadOrganization: booking.lead.organization,

    // Counts
    campaignCount: booking.campaigns.length,

    // Timestamps
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function mapBookingsToComponent(
  bookings: BookingWithRelations[]
): ComponentBooking[] {
  return bookings.map(mapBookingToComponent);
}
