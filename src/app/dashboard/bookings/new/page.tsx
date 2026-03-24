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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ArrowLeft, Check, ChevronsUpDown, Globe, Loader2, Save, UserPlus } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const SERVICE_TYPES = [
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'GROUP_COACHING', label: 'Group Coaching' },
  { value: 'INDIVIDUAL_COACHING', label: 'Individual Coaching' },
  { value: 'MASTERCLASS', label: 'Masterclass' },
  { value: 'ARRANGEMENT', label: 'Arrangement' },
  { value: 'SINGALONG', label: 'Singalong' },
  { value: 'CONCERT', label: 'Concert' },
  { value: 'CONSULTATION', label: 'Consultation' },
];

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string | null;
  phone: string | null;
}

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isNewContact, setIsNewContact] = useState(false);
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
    Promise.all([
      fetch('/api/trips').then(res => res.ok ? res.json() : []),
      fetch('/api/contacts?limit=500').then(res => res.ok ? res.json() : { contacts: [] }),
    ]).then(([tripsData, contactsData]) => {
      setTrips(tripsData);
      setContacts(Array.isArray(contactsData) ? contactsData : contactsData.contacts || []);
    }).catch(() => {
      setTrips([]);
      setContacts([]);
    }).finally(() => {
      setLoadingContacts(false);
    });
  }, []);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setIsNewContact(false);
    setForm(prev => ({
      ...prev,
      clientName: `${contact.firstName} ${contact.lastName}`.trim(),
      clientEmail: contact.email,
      clientOrganization: contact.organization || '',
      clientPhone: contact.phone || '',
    }));
    setContactOpen(false);
  };

  const handleNewContact = () => {
    setSelectedContactId(null);
    setIsNewContact(true);
    setForm(prev => ({
      ...prev,
      clientName: '',
      clientEmail: '',
      clientOrganization: '',
      clientPhone: '',
    }));
    setContactOpen(false);
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // If existing contact selected, use the direct booking API
      if (selectedContactId) {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: selectedContactId,
            serviceType: form.serviceType,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
            location: form.location || null,
            amount: form.amount ? parseFloat(form.amount) : null,
            depositPaid: form.depositPaid ? parseFloat(form.depositPaid) : null,
            internalNotes: form.notes || null,
            isPublic: form.isPublic,
            publicTitle: form.publicTitle || null,
            publicDescription: form.publicDescription || null,
            organization: form.clientOrganization || null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || data.message || 'Failed to create booking');
        }

        const result = await response.json();
        router.push(`/dashboard/bookings/${result.id}`);
        router.refresh();
        return;
      }

      // New contact — use the quick endpoint which auto-creates
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
          <p className="text-muted-foreground">Pick an existing contact or create a new one.</p>
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
            {/* Contact Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Contact</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleNewContact}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  New Contact
                </Button>
              </div>

              {/* Contact Picker */}
              {!isNewContact && (
                <div>
                  <Label>Select Existing Contact</Label>
                  {loadingContacts ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading contacts...
                    </div>
                  ) : (
                    <Popover open={contactOpen} onOpenChange={setContactOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={contactOpen}
                          className={cn(
                            'w-full justify-between font-normal mt-1',
                            !selectedContactId && 'text-muted-foreground'
                          )}
                        >
                          <span className="truncate">
                            {selectedContact
                              ? `${selectedContact.firstName} ${selectedContact.lastName} — ${selectedContact.email}`
                              : 'Search contacts...'}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command filter={(value, search) => {
                          const contact = contacts.find((c) => c.id === value);
                          if (!contact) return 0;
                          const haystack = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.organization || ''}`.toLowerCase();
                          return haystack.includes(search.toLowerCase()) ? 1 : 0;
                        }}>
                          <CommandInput placeholder="Type a name or email..." />
                          <CommandList>
                            <CommandEmpty>No contact found.</CommandEmpty>
                            <CommandGroup>
                              {contacts.map((contact) => (
                                <CommandItem
                                  key={contact.id}
                                  value={contact.id}
                                  onSelect={() => handleSelectContact(contact)}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedContactId === contact.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{contact.firstName} {contact.lastName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {contact.email}{contact.organization ? ` · ${contact.organization}` : ''}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}

              {/* Contact Details (shown when selected or creating new) */}
              {(selectedContactId || isNewContact) && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {isNewContact ? 'New Contact Details' : 'Contact Details'}
                    </p>
                    {selectedContactId && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Existing contact
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="clientName">Name *</Label>
                      <Input
                        id="clientName"
                        placeholder="John Smith"
                        value={form.clientName}
                        onChange={(e) => handleChange('clientName', e.target.value)}
                        required
                        readOnly={!!selectedContactId}
                        className={selectedContactId ? 'bg-muted' : ''}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={form.clientEmail}
                        onChange={(e) => handleChange('clientEmail', e.target.value)}
                        readOnly={!!selectedContactId}
                        className={selectedContactId ? 'bg-muted' : ''}
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
              )}
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
            disabled={isLoading || (!selectedContactId && !isNewContact)}
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
          {!selectedContactId && !isNewContact && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Select an existing contact or click &quot;New Contact&quot; to get started
            </p>
          )}
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
