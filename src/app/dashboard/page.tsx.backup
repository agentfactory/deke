import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users, CheckCircle, Plus, ArrowRight, Mail } from "lucide-react";
import { DashboardCampaignTable } from "@/components/campaigns/dashboard-campaign-table";
import { prisma } from "@/lib/db";
import { mapCampaignsToComponent } from "@/lib/mappers/campaign";

async function getDashboardData() {
  try {
    // Query 1: Campaign counts
    const [totalCampaigns, activeCampaigns] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } })
    ]);

    // Query 2: Total discovered leads
    const totalLeads = await prisma.campaignLead.count();

    // Query 3: Conversion rate (BOOKED leads / total leads * 100)
    const bookedLeads = await prisma.campaignLead.count({
      where: { status: 'BOOKED' }
    });
    const conversionRate = totalLeads > 0
      ? Math.round((bookedLeads / totalLeads) * 100)
      : 0;

    // Query 4: Recent campaigns (5 most recent)
    const recentCampaignsData = await prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { leads: true } }
      }
    });

    // Query 5: Outreach engagement (opens + clicks / sent * 100)
    const [sentOutreach, engagedOutreach] = await Promise.all([
      prisma.outreachLog.count({ where: { status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'RESPONDED'] } } }),
      prisma.outreachLog.count({ where: { status: { in: ['OPENED', 'CLICKED', 'RESPONDED'] } } })
    ]);
    const engagementRate = sentOutreach > 0
      ? Math.round((engagedOutreach / sentOutreach) * 100)
      : 0;

    // Transform to component format
    const recentCampaigns = mapCampaignsToComponent(recentCampaignsData);

    // Query 6: Bookings without campaigns (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookingsWithoutCampaigns = await prisma.booking.findMany({
      where: {
        campaigns: { none: {} }, // No related campaigns
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['CONFIRMED', 'PENDING'] }
      },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            organization: true,
          }
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    return {
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalLeads,
        conversionRate,
        engagementRate,
      },
      recentCampaigns,
      bookingsWithoutCampaigns,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return empty state on error
    return {
      stats: {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalLeads: 0,
        conversionRate: 0,
        engagementRate: 0,
      },
      recentCampaigns: [],
      bookingsWithoutCampaigns: [],
    };
  }
}

export default async function DashboardPage() {
  const { stats, recentCampaigns, bookingsWithoutCampaigns } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here is an overview of your campaign performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Discovered leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lead to booking ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outreach Engagement
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagementRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Opens and clicks rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your 5 most recent campaigns
              </p>
            </div>
            <Link href="/dashboard/campaigns">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <DashboardCampaignTable campaigns={recentCampaigns} />
        </CardContent>
      </Card>

      {/* New Bookings - Only show if there are bookings */}
      {bookingsWithoutCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  New Bookings
                  <Badge variant="secondary">{bookingsWithoutCampaigns.length}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Recent bookings ready for campaign creation
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingsWithoutCampaigns.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">
                      {booking.lead.firstName} {booking.lead.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.serviceType} • {booking.location || 'Virtual'}
                    </p>
                    {booking.lead.organization && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {booking.lead.organization}
                      </p>
                    )}
                  </div>
                  <Link href={`/dashboard/campaigns/new?bookingId=${booking.id}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/dashboard/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
          <Link href="/dashboard/campaigns">
            <Button variant="outline">
              View All Campaigns
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
