import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MapPin, Music, Clock, CheckCircle, Mail, Search } from 'lucide-react'
import { prisma } from '@/lib/db'

// This page shows "Find a Singing Group" requests from the Inquiry table
// Requests with serviceType "OTHER" and message containing "find" or "group" are group requests

interface GroupRequest {
  id: string
  name: string
  email: string
  location: string
  message: string
  status: string
  createdAt: Date
}

async function getGroupRequests(): Promise<{
  requests: GroupRequest[]
  stats: { total: number; pending: number; responded: number }
}> {
  try {
    // Use inquiries with serviceType OTHER as group requests
    const inquiries = await prisma.inquiry.findMany({
      where: {
        OR: [
          { serviceType: 'OTHER' },
          { message: { contains: 'group', mode: 'insensitive' } },
          { message: { contains: 'sing', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const requests: GroupRequest[] = inquiries.map((i) => ({
      id: i.id,
      name: `${i.firstName} ${i.lastName}`,
      email: i.email,
      location: 'Location pending', // We'll add location to inquiries later
      message: i.message || '',
      status: i.status,
      createdAt: i.createdAt,
    }))

    const total = requests.length
    const pending = requests.filter((r) => r.status === 'NEW' || r.status === 'PENDING').length
    const responded = requests.filter((r) => r.status === 'RESPONDED' || r.status === 'COMPLETED').length

    return {
      requests,
      stats: { total, pending, responded },
    }
  } catch (error) {
    console.error('Error fetching group requests:', error)
    return {
      requests: [],
      stats: { total: 0, pending: 0, responded: 0 },
    }
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'NEW':
      return <Badge variant="default" className="bg-blue-500">New</Badge>
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'IN_PROGRESS':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">In Progress</Badge>
    case 'RESPONDED':
    case 'COMPLETED':
      return <Badge variant="outline" className="border-green-500 text-green-600">Responded</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function GroupsPage() {
  const { requests, stats } = await getGroupRequests()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-lime-50/30 to-stone-50/20 dark:from-stone-950 dark:via-lime-950/20 dark:to-stone-950/10">
      <div className="relative overflow-hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 via-stone-500/5 to-lime-500/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
                Find a Singing Group
              </h1>
              <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-400">
                Help singers find local groups - building community one voice at a time
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-stone-200 dark:border-stone-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Users className="h-4 w-4 text-stone-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stone-900 dark:text-white">{stats.total}</div>
                <p className="text-xs text-stone-500 mt-1">People looking for groups</p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 dark:border-stone-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-stone-500 mt-1">Awaiting your response</p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 dark:border-stone-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Helped</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
                <p className="text-xs text-stone-500 mt-1">Successfully matched</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="border-stone-200 dark:border-stone-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-stone-900 dark:text-white">Recent Requests</CardTitle>
              <p className="text-sm text-stone-500 mt-1">
                People looking for singing groups in their area
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-stone-300">
                <Search className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
                  No requests yet
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  When visitors use the "Find a Singing Group" form on your website,
                  their requests will appear here for you to review and respond to.
                </p>
                <div className="mt-6 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    <strong>Tip:</strong> Share the group finder link with your audience to start receiving requests.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-stone-900 dark:text-white truncate">
                          {request.name}
                        </h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-stone-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.location}
                        </span>
                      </div>
                      {request.message && (
                        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                          {request.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="text-xs text-stone-400">
                        {formatDate(request.createdAt)}
                      </span>
                      <Button variant="outline" size="sm" className="border-stone-300">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
