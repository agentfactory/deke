'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Rocket, Save } from 'lucide-react';
import { AvailabilityWindow } from '@/components/bookings/availability-window';

const SERVICE_TYPES = [
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'GROUP_COACHING', label: 'Group Coaching' },
  { value: 'INDIVIDUAL_COACHING', label: 'Individual Coaching' },
  { value: 'MASTERCLASS', label: 'Masterclass' },
  { value: 'ARRANGEMENT', label: 'Arrangement' },
  { value: 'CONSULTATION', label: 'Consultation' },
];

interface Trip {
  id: string;
  name: string;
  location: string;
}

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTripId = searchParams.get('tripId');

  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoLaunch, setAutoLaunch] = useState(false);

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientOrganization: '',
    clientPhone: '',
    serviceType: 'WORKSHOP',
    startDate: '',
    endDate: '',
    location: '',
    amount: '',
    depositPaid: '',
    notes: '',
    tripId: preselectedTripId || '',
    availabilityBefore: 3,
    availabilityAfter: 3,
    campaignRadius: 100,
  });

  useEffect(() => {
    fetch('/api/trips')
      .then(res => res.ok ? res.json() : [])
      .then(setTrips)
      .catch(() => setTrips([]));
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, launch: boolean) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const nameParts = form.clientName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const endpoint = launch ? '/api/bookings/quick-launch' : '/api/bookings/quick';

      const payload: Record<string, unknown> = {
        client: {
          firstName,
          lastName,
          email: form.clientEmail,
          organization: form.clientOrganization || null,
          phone: form.clientPhone || null,
        },
        serviceType: form.serviceType,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        location: form.location || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        depositPaid: form.depositPaid ? parseFloat(form.depositPaid) : null,
        notes: form.notes || null,
        tripId: form.tripId || null,
        availabilityBefore: form.availabilityBefore,
        availabilityAfter: form.availabilityAfter,
      };

      if (launch) {
        payload.campaignRadius = form.campaignRadius;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      const result = await response.json();

      if (launch && result.campaign) {
        router.push(`/dashboard/campaigns/${result.campaign.id}`);
      } else {
        router.push(`/dashboard/bookings/${result.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Booking</h1>
          <p className="text-muted-foreground">Enter client and booking details</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, autoLaunch)}>
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - Booking Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Lead will be auto-created if this is a new client email.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Client</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="clientName">Name *</Label>
                      <Input
                        id="clientName"
                        placeholder="John Smith"
                        value={form.clientName}
                        onChange={(e) => handleChange('clientName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={form.clientEmail}
                        onChange={(e) => handleChange('clientEmail', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientOrganization">Organization</Label>
                      <Input
                        id="clientOrganization"
                        placeholder="Harmony Singers"
                        value={form.clientOrganization}
                        onChange={(e) => handleChange('clientOrganization', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Phone</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={form.clientPhone}
                        onChange={(e) => handleChange('clientPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Service & Location */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Service</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Select value={form.serviceType} onValueChange={(v) => handleChange('serviceType', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="San Francisco, CA"
                        value={form.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="2500"
                        value={form.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="depositPaid">Deposit ($)</Label>
                      <Input
                        id="depositPaid"
                        type="number"
                        step="0.01"
                        placeholder="500"
                        value={form.depositPaid}
                        onChange={(e) => handleChange('depositPaid', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any details about this booking..."
                      rows={3}
                      value={form.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>
                </div>

                {/* Trip Section */}
                {trips.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Trip (Optional)</h3>
                    <div>
                      <Label htmlFor="tripId">Associate with Trip</Label>
                      <Select value={form.tripId || "none"} onValueChange={(v) => handleChange('tripId', v === "none" ? "" : v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="No trip - standalone booking" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No trip - standalone booking</SelectItem>
                          {trips.map((trip) => (
                            <SelectItem key={trip.id} value={trip.id}>
                              {trip.name} ({trip.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Campaign Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure nearby gig discovery for this booking.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Availability Window */}
                <AvailabilityWindow
                  daysBefore={form.availabilityBefore}
                  daysAfter={form.availabilityAfter}
                  bookingDate={form.startDate || null}
                  onDaysBeforeChange={(v) => handleChange('availabilityBefore', v)}
                  onDaysAfterChange={(v) => handleChange('availabilityAfter', v)}
                />

                {/* Campaign Radius */}
                <div>
                  <Label htmlFor="campaignRadius">Campaign Radius (miles)</Label>
                  <Input
                    id="campaignRadius"
                    type="number"
                    min={1}
                    max={1000}
                    value={form.campaignRadius}
                    onChange={(e) => handleChange('campaignRadius', parseInt(e.target.value) || 100)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Search for leads within this distance of the booking location.
                  </p>
                </div>

                {/* Auto-Launch Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoLaunch" className="text-base font-medium">Auto-Launch Campaign</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create campaign and discover leads on save.
                    </p>
                  </div>
                  <Switch
                    id="autoLaunch"
                    checked={autoLaunch}
                    onCheckedChange={setAutoLaunch}
                  />
                </div>

                {/* Campaign Summary */}
                {autoLaunch && (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm space-y-2">
                    <p className="font-medium text-blue-400">Campaign will be created with:</p>
                    <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>{form.campaignRadius} mile radius from {form.location || 'booking location'}</li>
                      <li>
                        {form.availabilityBefore + form.availabilityAfter + 1} day availability window
                        ({form.availabilityBefore} before + booking + {form.availabilityAfter} after)
                      </li>
                      <li>Lead discovery will run automatically</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {autoLaunch ? (
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating & Launching...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Save & Launch Campaign
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </>
                  )}
                </Button>
              )}
              {!autoLaunch && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !form.location || !form.startDate || !form.endDate}
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Save & Launch Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <NewBookingForm />
    </Suspense>
  );
}
