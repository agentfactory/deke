import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, CheckCircle, Plus, ArrowRight } from "lucide-react";
import { DashboardCampaignTable } from "@/components/campaigns/dashboard-campaign-table";

async function getDashboardData() {
  // Mock data - replace with actual API call
  return {
    stats: {
      totalCampaigns: 12,
      activeCampaigns: 4,
      totalLeads: 248,
      conversionRate: 32,
    },
    recentCampaigns: [
      {
        id: "1",
        name: "Spring 2025 Workshop Tour",
        location: "San Francisco, CA",
        radiusMiles: 100,
        status: "ACTIVE" as const,
        leadCount: 45,
        createdAt: new Date("2025-01-10").toISOString(),
      },
      {
        id: "2",
        name: "Summer Masterclass Series",
        location: "New York, NY",
        radiusMiles: 150,
        status: "APPROVED" as const,
        leadCount: 32,
        createdAt: new Date("2025-01-08").toISOString(),
      },
      {
        id: "3",
        name: "Fall Coaching Program",
        location: "Los Angeles, CA",
        radiusMiles: 120,
        status: "DRAFT" as const,
        leadCount: 0,
        createdAt: new Date("2025-01-05").toISOString(),
      },
    ],
  };
}

export default async function DashboardPage() {
  const { stats, recentCampaigns } = await getDashboardData();

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
