import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Target, TrendingUp, Users } from 'lucide-react'
import { prisma } from '@/lib/db'
import { mapCampaignsToComponent } from '@/lib/mappers/campaign'
import { DashboardCampaignTable } from '@/components/campaigns/dashboard-campaign-table'

async function getCampaignsData() {
  try {
    const [totalCampaigns, activeCampaigns, totalLeads] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.campaignLead.count()
    ])

    const recentCampaignsData = await prisma.campaign.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { leads: true } }
      }
    })

    const recentCampaigns = mapCampaignsToComponent(recentCampaignsData)

    return {
      stats: { totalCampaigns, activeCampaigns, totalLeads },
      recentCampaigns
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return {
      stats: { totalCampaigns: 0, activeCampaigns: 0, totalLeads: 0 },
      recentCampaigns: []
    }
  }
}

export default async function CampaignsPage() {
  const { stats, recentCampaigns } = await getCampaignsData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-cyan-950/10">
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-violet-500/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Campaign & Lead Discovery
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Discover and score potential booking opportunities
              </p>
            </div>

            <Link href="/dashboard/campaigns/new">
              <Button className="bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800">
                Create Campaign
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Campaigns</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your most recent lead discovery campaigns
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
      </div>
    </div>
  )
}
