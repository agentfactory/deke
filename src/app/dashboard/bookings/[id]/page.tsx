'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import { OpportunityFinder } from '@/components/bookings/opportunity-finder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Loader2, Globe, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Booking {
  id: string;
  status: string;
  serviceType: string;
  startDate: string | null;
  endDate: string | null;
  timezone: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  amount: number | null;
  depositPaid: number | null;
  balanceDue: number | null;
  paymentStatus: string;
  internalNotes: string | null;
  clientNotes: string | null;
  isPublic: boolean;
  availabilityBefore: number | null;
  availabilityAfter: number | null;
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    organization: string | null;
  };
  inquiry?: {
    id: string;
    serviceType: string;
    status: string;
  } | null;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    _count?: {
      leads: number;
      outreachLogs: number;
    };
    leads?: Array<any>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/bookings/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }

      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Failed to load booking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!booking) return;

    try {
      setIsDeleting(true);
      setShowDeleteConfirm(false);
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete booking');
      }

      router.push('/dashboard/bookings');
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete booking.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Booking not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Count existing campaign leads
  const existingLeadCount = booking.campaigns.reduce(
    (sum, c) => sum + (c._count?.leads || 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {booking.lead.firstName} {booking.lead.lastName} - {booking.serviceType.replace('_', ' ')}
            </h1>
            <p className="text-muted-foreground">
              {booking.location && <span>{booking.location}</span>}
              {booking.startDate && (
                <span>
                  {booking.location ? ' · ' : ''}
                  {format(new Date(booking.startDate), 'MMM d, yyyy')}
                  {booking.endDate && booking.endDate !== booking.startDate && (
                    <> - {format(new Date(booking.endDate), 'MMM d, yyyy')}</>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.status as 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'} />
          <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/bookings/${booking.id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            title="Delete booking"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs: Opportunities (primary) + Details */}
      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="opportunities" className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Opportunities
            {existingLeadCount > 0 && (
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">
                {existingLeadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <OpportunityFinder
            bookingId={booking.id}
            bookingLocation={booking.location}
            availabilityBefore={booking.availabilityBefore}
            availabilityAfter={booking.availabilityAfter}
            existingCampaigns={booking.campaigns}
            onCampaignCreated={fetchBooking}
          />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                      <p className="text-base">{booking.serviceType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">
                        <BookingStatusBadge status={booking.status as 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                      <p className="text-base">
                        {booking.startDate ? format(new Date(booking.startDate), 'PPP') : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">End Date</p>
                      <p className="text-base">
                        {booking.endDate ? format(new Date(booking.endDate), 'PPP') : 'Not set'}
                      </p>
                    </div>
                    {booking.location && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="text-base">{booking.location}</p>
                      </div>
                    )}
                    {(booking.availabilityBefore || booking.availabilityAfter) && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Availability Window</p>
                        <p className="text-base">
                          {booking.availabilityBefore ? `${booking.availabilityBefore} days before` : ''}
                          {booking.availabilityBefore && booking.availabilityAfter ? ' & ' : ''}
                          {booking.availabilityAfter ? `${booking.availabilityAfter} days after` : ''}
                        </p>
                      </div>
                    )}
                    {booking.timezone && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                        <p className="text-base">{booking.timezone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">
                        {booking.amount ? `$${booking.amount.toLocaleString()}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                      <p className="text-base">{booking.paymentStatus.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Deposit Paid</p>
                      <p className="text-base">
                        {booking.depositPaid ? `$${booking.depositPaid.toLocaleString()}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Balance Due</p>
                      <p className="text-base font-semibold">
                        {booking.balanceDue ? `$${booking.balanceDue.toLocaleString()}` : '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card */}
              {(booking.internalNotes || booking.clientNotes) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {booking.internalNotes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Internal Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{booking.internalNotes}</p>
                      </div>
                    )}
                    {booking.clientNotes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Client Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{booking.clientNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lead Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base">
                      {booking.lead.firstName} {booking.lead.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{booking.lead.email}</p>
                  </div>
                  {booking.lead.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-base">{booking.lead.phone}</p>
                    </div>
                  )}
                  {booking.lead.organization && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Organization</p>
                      <p className="text-base">{booking.lead.organization}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link href={`/dashboard/leads/${booking.lead.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Lead Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Inquiry */}
              {booking.inquiry && (
                <Card>
                  <CardHeader>
                    <CardTitle>Linked Inquiry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Service:</span> {booking.inquiry.serviceType.replace('_', ' ')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> {booking.inquiry.status}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Public Event Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Show on Events Page</p>
                      <p className="text-xs text-muted-foreground">
                        Display this booking on the public /events page
                      </p>
                    </div>
                    <Switch
                      checked={booking.isPublic}
                      onCheckedChange={async (checked) => {
                        try {
                          const response = await fetch(`/api/bookings/${booking.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isPublic: checked }),
                          });
                          if (response.ok) {
                            fetchBooking();
                          }
                        } catch (err) {
                          console.error('Failed to update visibility:', err);
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {format(new Date(booking.createdAt), 'PPP p')}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>{' '}
                    {format(new Date(booking.updatedAt), 'PPP p')}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking?</DialogTitle>
            <DialogDescription>
              This will permanently delete this booking.
              {booking.campaigns.length > 0 && (
                <span className="block mt-2 font-medium text-amber-600">
                  Warning: This will also delete {booking.campaigns.length} linked campaign(s) and all their discovered leads.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
