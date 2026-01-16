'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingTable } from '@/components/bookings/booking-table';
import { Plus, Search } from 'lucide-react';
import type { ComponentBooking } from '@/lib/mappers/booking';

interface BookingsClientProps {
  initialBookings: ComponentBooking[];
}

const SERVICE_TYPES = [
  'ARRANGEMENT',
  'GROUP_COACHING',
  'INDIVIDUAL_COACHING',
  'WORKSHOP',
  'SPEAKING',
  'MASTERCLASS',
  'CONSULTATION'
];

const STATUSES = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED'
];

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('ALL');

  const filteredBookings = initialBookings.filter((booking) => {
    // Search across multiple fields
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      booking.leadName.toLowerCase().includes(searchLower) ||
      booking.leadEmail.toLowerCase().includes(searchLower) ||
      booking.leadOrganization?.toLowerCase().includes(searchLower) ||
      booking.location?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    const matchesServiceType = serviceTypeFilter === 'ALL' || booking.serviceType === serviceTypeFilter;

    return matchesSearch && matchesStatus && matchesServiceType;
  });

  const handleRowClick = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Manage all service bookings ({filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'})
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/bookings/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by lead name, email, organization, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Services</SelectItem>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <BookingTable bookings={filteredBookings} onRowClick={handleRowClick} />
    </div>
  );
}
