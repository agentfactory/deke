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
import { ArrowLeft, Globe, Loader2, Save } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO, addDays } from 'date-fns';

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
  const preselectedDate = searchParams.get('date');

  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientOrganization: '',
    clientPhone: '',
    serviceType: 'WORKSHOP',
    startDate: preselectedDate || '',
    endDate: '',
    location: '',
    amount: '',
    depositPaid: '',
    notes: '',
    tripId: preselectedTripId || '',
    isPublic: false,
    publicTitle: '',
    publicDescription: '',
  });

  useEffect(() => {
    fetch('/api/trips')
      .then(res => res.ok ? res.json() : [])
      .then(setTrips)
      .catch(() => setTrips([]));
  }, []);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const nameParts = form.clientName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const response = await fetch('/api/bookings/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          isPublic: form.isPublic,
          publicTitle: form.publicTitle || null,
          publicDescription: form.publicDescription || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      const result = await response.json();
      router.push(`/dashboard/bookings/${result.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Booking</h1>
          <p className="text-muted-foreground">Create a booking — contact is auto-created if new.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
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

            {/* Service & Scheduling */}
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
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker
                    value={form.startDate ? parseISO(form.startDate) : null}
                    onChange={(date) => {
                      const iso = date ? date.toISOString() : '';
                      handleChange('startDate', iso);
                      // Auto-fill end date to start + 1 day if empty or before start
                      if (date) {
                        const currentEnd = form.endDate;
                        if (!currentEnd || (currentEnd && parseISO(currentEnd) <= date)) {
                          handleChange('endDate', addDays(date, 1).toISOString());
                        }
                      }
                    }}
                    enableTime
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <DatePicker
                    value={form.endDate ? parseISO(form.endDate) : null}
                    onChange={(date) => handleChange('endDate', date ? date.toISOString() : '')}
                    enableTime
                    placeholder="Select end date"
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

            {/* Trip (Optional) */}
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

            {/* Public Event Toggle */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Public Event</h3>
                </div>
                <Switch
                  id="isPublic"
                  checked={form.isPublic}
                  onCheckedChange={(v) => handleChange('isPublic', v)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Show this booking on the public events page at dekesharon.com/events
              </p>
              {form.isPublic && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="publicTitle">Event Title</Label>
                    <Input
                      id="publicTitle"
                      placeholder="A Cappella Workshop at UCLA"
                      value={form.publicTitle}
                      onChange={(e) => handleChange('publicTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publicDescription">Event Description</Label>
                    <Textarea
                      id="publicDescription"
                      placeholder="Join Deke Sharon for an immersive a cappella workshop..."
                      rows={3}
                      value={form.publicDescription}
                      onChange={(e) => handleChange('publicDescription', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="mt-6">
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
                Save Booking
              </>
            )}
          </Button>
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
