import { prisma } from '@/lib/db'
import { Target, Mail, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import LeadsClient from './leads-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const REQUEST_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  REVIEWING: 'bg-blue-100 text-blue-800 border-blue-200',
  MATCHED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
}

const PIPELINE_BADGE_STYLES: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  CONTACTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  QUALIFIED: 'bg-purple-50 text-purple-700 border-purple-200',
  PROPOSAL_SENT: 'bg-amber-50 text-amber-700 border-amber-200',
  NEGOTIATING: 'bg-orange-50 text-orange-700 border-orange-200',
  WON: 'bg-green-50 text-green-700 border-green-200',
  CONVERTED: 'bg-teal-50 text-teal-700 border-teal-200',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date)
}

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof fetchLeads>> = []
  let subscribers: Awaited<ReturnType<typeof fetchSubscribers>> = []
  let groupRequests: Awaited<ReturnType<typeof fetchGroupRequests>> = []
  let pipelineCounts: Record<string, number> = {}

  try {
    ;[leads, subscribers, groupRequests] = await Promise.all([
      fetchLeads(),
      fetchSubscribers(),
      fetchGroupRequests(),
    ])

    const grouped = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    })
    pipelineCounts = Object.fromEntries(grouped.map(g => [g.status, g._count]))
  } catch (error) {
    console.error('Error fetching leads:', error)
  }

  const serializedLeads = leads.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    lastContactedAt: l.lastContactedAt?.toISOString() ?? null,
    convertedAt: l.convertedAt?.toISOString() ?? null,
  }))

  const pipelineStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'CONVERTED'] as const

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Leads & Pipeline
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#666666]">
            <span className="inline-flex items-center gap-1.5">
              <Target className="h-4 w-4 text-[#C05A3C]" aria-hidden="true" />
              {leads.length} leads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-[#C05A3C]" aria-hidden="true" />
              {subscribers.length} subscribers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-[#C05A3C]" aria-hidden="true" />
              {groupRequests.length} pending requests
            </span>
          </div>
        </div>

        {/* Pipeline Summary Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {pipelineStatuses.map((status) => (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${PIPELINE_BADGE_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
            >
              {status.replace(/_/g, ' ')}:
              <span className="font-bold">{pipelineCounts[status] || 0}</span>
            </span>
          ))}
        </div>

        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="border-b border-[#E8E4DD] bg-transparent">
            <TabsTrigger
              value="leads"
              className="data-[state=active]:text-[#C05A3C] data-[state=active]:border-b-2 data-[state=active]:border-[#C05A3C] rounded-none"
            >
              All Leads
            </TabsTrigger>
            <TabsTrigger
              value="subscribers"
              className="data-[state=active]:text-[#C05A3C] data-[state=active]:border-b-2 data-[state=active]:border-[#C05A3C] rounded-none"
            >
              Subscribers
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:text-[#C05A3C] data-[state=active]:border-b-2 data-[state=active]:border-[#C05A3C] rounded-none"
            >
              Group Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-4">
            <LeadsClient initialLeads={serializedLeads} />
          </TabsContent>

          <TabsContent value="subscribers" className="mt-4">
            {subscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Mail className="h-10 w-10 text-[#999999]" aria-hidden="true" />
                <p className="mt-3 text-sm text-[#999999]">No email subscribers yet.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-[#E8E4DD] overflow-x-auto bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FAFAF8]">
                      <TableHead className="font-semibold text-[#1a1a1a]">Name</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Email</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Location</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Group Name</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a] text-center">Newsletter</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <TableCell className="font-medium text-[#1a1a1a]">{sub.firstName}</TableCell>
                        <TableCell className="text-[#666666] max-w-[200px] truncate">{sub.email}</TableCell>
                        <TableCell className="text-[#666666]">{sub.location || '\u2014'}</TableCell>
                        <TableCell className="text-[#666666]">{sub.groupName || '\u2014'}</TableCell>
                        <TableCell className="text-center">
                          {sub.newsletterOptIn ? (
                            <Badge variant="default" className="bg-green-600 text-xs">Opted in</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-[#999999]">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-[#999999] text-sm whitespace-nowrap">{formatDate(sub.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            {groupRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <UserPlus className="h-10 w-10 text-[#999999]" aria-hidden="true" />
                <p className="mt-3 text-sm text-[#999999]">No pending group requests.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-[#E8E4DD] overflow-x-auto bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FAFAF8]">
                      <TableHead className="font-semibold text-[#1a1a1a]">Name</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Email</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Location</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Experience</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Genres</TableHead>
                      <TableHead className="font-semibold text-[#1a1a1a]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupRequests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <TableCell className="font-medium text-[#1a1a1a]">{req.name}</TableCell>
                        <TableCell className="text-[#666666] max-w-[200px] truncate">{req.email}</TableCell>
                        <TableCell className="text-[#666666]">{req.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{req.experience}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {req.genres.length > 0 ? req.genres.slice(0, 3).map((genre) => (
                              <Badge key={genre} variant="secondary" className="text-xs capitalize">{genre}</Badge>
                            )) : <span className="text-[#999999]">{'\u2014'}</span>}
                            {req.genres.length > 3 && <Badge variant="outline" className="text-xs">+{req.genres.length - 3}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${REQUEST_STATUS_STYLES[req.status] || ''}`}>{req.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

async function fetchLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      organization: true,
      source: true,
      status: true,
      score: true,
      createdAt: true,
      lastContactedAt: true,
      convertedAt: true,
      _count: { select: { contacts: true, campaignLeads: true } },
    },
  })
}

async function fetchSubscribers() {
  return prisma.emailSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

async function fetchGroupRequests() {
  return prisma.groupRequest.findMany({
    where: { status: { in: ['PENDING', 'REVIEWING'] } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}
