import { prisma } from '@/lib/db'
import { Users, Mail, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import ContactsClient from './contacts-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const REQUEST_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  REVIEWING: 'bg-blue-100 text-blue-800 border-blue-200',
  MATCHED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date)
}

export default async function ContactsPage() {
  let leads: Awaited<ReturnType<typeof fetchLeads>> = []
  let subscribers: Awaited<ReturnType<typeof fetchSubscribers>> = []
  let groupRequests: Awaited<ReturnType<typeof fetchGroupRequests>> = []

  try {
    ;[leads, subscribers, groupRequests] = await Promise.all([
      fetchLeads(),
      fetchSubscribers(),
      fetchGroupRequests(),
    ])
  } catch (error) {
    console.error('Error fetching contacts:', error)
  }

  // Serialize dates for client component
  const serializedLeads = leads.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    lastContactedAt: l.lastContactedAt?.toISOString() ?? null,
  }))

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            Contacts
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden="true" />
              {leads.length} leads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {subscribers.length} subscribers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {groupRequests.length} pending requests
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leads" className="w-full">
          <TabsList>
            <TabsTrigger value="leads">All Leads</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="requests">Group Requests</TabsTrigger>
          </TabsList>

          {/* All Leads Tab - now uses client component */}
          <TabsContent value="leads" className="mt-4">
            <ContactsClient initialLeads={serializedLeads} />
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="mt-4">
            {subscribers.length === 0 ? (
              <EmptyState
                icon={<Mail className="h-10 w-10 text-stone-300" aria-hidden="true" />}
                message="No email subscribers yet."
              />
            ) : (
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-stone-50 dark:bg-stone-900">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Group Name</TableHead>
                      <TableHead className="font-semibold text-center">Newsletter</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow
                        key={sub.id}
                        className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                      >
                        <TableCell className="font-medium text-stone-900 dark:text-white">
                          {sub.firstName}
                        </TableCell>
                        <TableCell className="text-stone-600 dark:text-stone-400 max-w-[200px] truncate">
                          {sub.email}
                        </TableCell>
                        <TableCell className="text-stone-600 dark:text-stone-400">
                          {sub.location || '\u2014'}
                        </TableCell>
                        <TableCell className="text-stone-600 dark:text-stone-400">
                          {sub.groupName || '\u2014'}
                        </TableCell>
                        <TableCell className="text-center">
                          {sub.newsletterOptIn ? (
                            <Badge variant="default" className="bg-green-600 text-xs">
                              Opted in
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-stone-400">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-stone-500 dark:text-stone-400 text-sm whitespace-nowrap">
                          {formatDate(sub.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Group Requests Tab */}
          <TabsContent value="requests" className="mt-4">
            {groupRequests.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="h-10 w-10 text-stone-300" aria-hidden="true" />}
                message="No pending group requests."
              />
            ) : (
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-stone-50 dark:bg-stone-900">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Experience</TableHead>
                      <TableHead className="font-semibold">Genres</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupRequests.map((req) => (
                      <TableRow
                        key={req.id}
                        className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                      >
                        <TableCell className="font-medium text-stone-900 dark:text-white">
                          {req.name}
                        </TableCell>
                        <TableCell className="text-stone-600 dark:text-stone-400 max-w-[200px] truncate">
                          {req.email}
                        </TableCell>
                        <TableCell className="text-stone-600 dark:text-stone-400">
                          {req.location}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {req.experience}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {req.genres.length > 0 ? (
                              req.genres.slice(0, 3).map((genre) => (
                                <Badge key={genre} variant="secondary" className="text-xs capitalize">
                                  {genre}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-stone-400">{'\u2014'}</span>
                            )}
                            {req.genres.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{req.genres.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${REQUEST_STATUS_STYLES[req.status] || ''}`}
                          >
                            {req.status}
                          </Badge>
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

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">{message}</p>
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
      _count: { select: { bookings: true, campaignLeads: true } },
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
