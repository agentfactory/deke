import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Mail, Clock, CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getOutreachData() {
  try {
    const [totalSent, totalOpened, totalClicked, messageTemplates] = await Promise.all([
      prisma.outreachLog.count({ where: { status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'RESPONDED'] } } }),
      prisma.outreachLog.count({ where: { status: 'OPENED' } }),
      prisma.outreachLog.count({ where: { status: 'CLICKED' } }),
      prisma.messageTemplate.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ])

    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0

    return {
      stats: { totalSent, openRate, clickRate },
      messageTemplates
    }
  } catch (error) {
    console.error('Error fetching outreach data:', error)
    return {
      stats: { totalSent: 0, openRate: 0, clickRate: 0 },
      messageTemplates: []
    }
  }
}

export default async function OutreachPage() {
  const { stats, messageTemplates } = await getOutreachData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-cyan-950/10">
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-violet-500/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Outreach & Automation
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Manage email sequences and message templates
              </p>
            </div>

            <Button className="bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSent}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openRate}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.clickRate}%</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Pre-configured email and SMS templates for outreach
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messageTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No message templates yet. Create your first template to get started.
                </p>
              ) : (
                messageTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.channel} • {template.serviceType || 'General'}
                      </p>
                    </div>
                    <Badge variant="secondary">{template.channel}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
