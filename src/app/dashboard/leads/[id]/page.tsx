'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Loader2, Mail, Phone, Building2, MapPin, Calendar, Star, Plus, Package, MessageSquare, UserCheck, Users } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  source: string | null;
  status: string;
  score: number;
  latitude: number | null;
  longitude: number | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  }>;
  inquiries: Array<{
    id: string;
    serviceType: string;
    status: string;
    message: string | null;
    quotedAmount: number | null;
    createdAt: string;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    songTitle: string;
    songArtist: string | null;
    voiceParts: string[];
    packageTier: string;
    status: string;
    basePrice: number;
    rushFee: number | null;
    totalAmount: number;
    dueDate: string | null;
    deliveredAt: string | null;
    revisionsUsed: number;
    revisionsMax: number;
    createdAt: string;
  }>;
  campaignLeads: Array<{
    id: string;
    campaignId: string;
    score: number;
    distance: number | null;
    source: string | null;
    status: string;
    campaign: {
      id: string;
      name: string;
      status: string;
      baseLocation: string;
    };
  }>;
  _count: {
    contacts: number;
    inquiries: number;
    orders: number;
    campaignLeads: number;
  };
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  NEW: 'secondary',
  CONTACTED: 'outline',
  QUALIFIED: 'default',
  PROPOSAL_SENT: 'default',
  NEGOTIATING: 'default',
  WON: 'default',
  LOST: 'destructive',
  DORMANT: 'secondary',
};

export default function LeadProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const fetchLead = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/leads/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }

      const data = await response.json();
      setLead(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      alert('Failed to load lead');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!lead) return;

    if (
      !confirm(
        'Are you sure you want to delete this lead? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete lead');
      }

      router.push('/dashboard/campaigns');
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete lead. It may have linked bookings or orders.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConvert = async () => {
    if (!lead) return;
    try {
      setIsConverting(true);
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to convert lead');
      }
      // Refresh lead data to show updated status and contacts
      await fetchLead();
    } catch (err) {
      console.error('Error converting lead:', err);
      alert(err instanceof Error ? err.message : 'Failed to convert lead');
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Lead not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenue = lead.orders
    .map(o => o.totalAmount || 0)
    .reduce((sum, val) => sum + val, 0);

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {lead.firstName} {lead.lastName}
              </h1>
              <Badge variant={statusColors[lead.status] || 'default'}>
                {lead.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">Lead Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.status !== 'CONVERTED' && (
            <Button
              variant="default"
              size="sm"
              onClick={handleConvert}
              disabled={isConverting}
            >
              {isConverting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-1" />
              )}
              Convert to Contact
            </Button>
          )}
          <Link href={`/dashboard/orders?leadId=${lead.id}`}>
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-1" /> New Order
            </Button>
          </Link>
          <Link href={`/dashboard/inquiries?leadId=${lead.id}`}>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" /> New Inquiry
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting || lead._count.contacts > 0 || lead._count.orders > 0}
            title={
              lead._count.contacts > 0 || lead._count.orders > 0
                ? 'Cannot delete: has linked contacts or orders'
                : 'Delete lead'
            }
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                  </div>
                )}
                {lead.organization && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Organization</p>
                      <p>{lead.organization}</p>
                    </div>
                  </div>
                )}
                {lead.source && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Source</p>
                      <p>{lead.source}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contacts Card */}
          {lead.contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contacts ({lead.contacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.contacts.map((contact) => (
                    <Link key={contact.id} href={`/dashboard/contacts/${contact.id}`}>
                      <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                          </div>
                          <Badge variant="default">Contact</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Card */}
          {lead.orders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Orders ({lead.orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.orders.map((order) => (
                    <Link key={order.id} href="/dashboard/orders">
                      <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.songTitle || 'Untitled'}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.orderNumber} {order.packageTier && `• ${order.packageTier}`}
                              {order.songArtist && ` • ${order.songArtist}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{order.status}</Badge>
                            {order.totalAmount != null && (
                              <p className="text-sm font-medium mt-1">
                                ${order.totalAmount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inquiries Card */}
          {lead.inquiries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Inquiries ({lead.inquiries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.inquiries.map((inquiry) => (
                    <Link key={inquiry.id} href="/dashboard/inquiries">
                      <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{inquiry.serviceType.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(inquiry.createdAt), 'PPP')}
                            </p>
                            {inquiry.message && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {inquiry.message}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{inquiry.status}</Badge>
                            {inquiry.quotedAmount && (
                              <p className="text-sm font-medium mt-1">
                                ${inquiry.quotedAmount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-3xl font-bold">{lead.score}</span>
                <span className="text-muted-foreground">/ 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(lead.score, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contacts</span>
                <span className="font-medium">{lead._count.contacts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">{lead._count.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Inquiries</span>
                <span className="font-medium">{lead._count.inquiries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaigns</span>
                <span className="font-medium">{lead._count.campaignLeads}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-bold text-lg">
                    ${totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Card */}
          {lead.campaignLeads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Linked Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lead.campaignLeads.map((cl) => (
                    <Link key={cl.id} href={`/dashboard/campaigns/${cl.campaign.id}`}>
                      <div className="p-2 rounded border hover:bg-muted/50 cursor-pointer transition-colors">
                        <p className="font-medium text-sm">{cl.campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cl.campaign.baseLocation} • {cl.campaign.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created:</span>{' '}
                {format(new Date(lead.createdAt), 'PPP')}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Updated:</span>{' '}
                {format(new Date(lead.updatedAt), 'PPP')}
              </div>
              {lead.lastContactedAt && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Last Contact:</span>{' '}
                  {format(new Date(lead.lastContactedAt), 'PPP')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
