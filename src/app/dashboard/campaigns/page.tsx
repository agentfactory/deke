import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Rocket, ArrowRight, MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CampaignsClient } from './campaigns-client'
import { mapCampaignsToComponent } from '@/lib/mappers/campaign'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'DRAFT': return 'bg-stone-100 text-stone-700 border-stone-200'
    case 'PAUSED': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'COMPLETED': return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'APPROVED': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-stone-100 text-stone-600 border-stone-200'
  }
}

async function getCampaignsData() {
  try {
    const [totalCampaigns, activeCampaigns, totalLeads, campaignsData] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.campaignLead.count(),
      prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { leads: true } },
          booking: {
            select: {
              id: true,
              serviceType: true,
              location: true,
              lead: { select: { firstName: true, lastName: true } }
            }
          }
        }
      })
    ])

    const campaigns = mapCampaignsToComponent(campaignsData)

    return {
      stats: { totalCampaigns, activeCampaigns, totalLeads },
      campaigns
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return {
      stats: { totalCampaigns: 0, activeCampaigns: 0, totalLeads: 0 },
      campaigns: []
    }
  }
}

export default async function CampaignsPage() {
  const { stats, campaigns } = await getCampaignsData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1a1a1a]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-[#888]">
            Discover and reach potential booking opportunities
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button
            className="text-white hover:opacity-90"
            style={{ backgroundColor: '#C05A3C' }}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E8E4DD] bg-white">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C05A3C]/10">
              <Rocket className="h-5 w-5 text-[#C05A3C]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalCampaigns}</p>
              <p className="text-xs font-medium text-[#888]">Total Campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E8E4DD] bg-white">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <Rocket className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.activeCampaigns}</p>
              <p className="text-xs font-medium text-[#888]">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E8E4DD] bg-white">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalLeads}</p>
              <p className="text-xs font-medium text-[#888]">Total Leads Discovered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <CampaignsClient initialCampaigns={campaigns} />
    </div>
  )
}
