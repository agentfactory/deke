import { prisma } from '@/lib/db'
import OutreachClient from './outreach-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getOutreachData() {
  try {
    const [totalSent, totalOpened, totalClicked, messageTemplates] = await Promise.all([
      prisma.outreachLog.count({ where: { status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'RESPONDED'] } } }),
      prisma.outreachLog.count({ where: { status: 'OPENED' } }),
      prisma.outreachLog.count({ where: { status: 'CLICKED' } }),
      prisma.messageTemplate.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0

    return {
      stats: { totalSent, openRate, clickRate },
      messageTemplates,
    }
  } catch (error) {
    console.error('Error fetching outreach data:', error)
    return {
      stats: { totalSent: 0, openRate: 0, clickRate: 0 },
      messageTemplates: [],
    }
  }
}

export default async function OutreachPage() {
  const { stats, messageTemplates } = await getOutreachData()

  const serializedTemplates = messageTemplates.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  return <OutreachClient initialTemplates={serializedTemplates} stats={stats} />
}
