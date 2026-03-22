import { prisma } from '@/lib/db'
import AnalyticsClient from './analytics-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAnalyticsData() {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    totalLeads, totalBookings, totalOrders, totalInquiries,
    wonLeads, acceptedInquiries,
    bookings, orders, campaigns,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.booking.count(),
    prisma.order.count(),
    prisma.inquiry.count(),
    prisma.lead.count({ where: { status: 'WON' } }),
    prisma.inquiry.count({ where: { status: 'ACCEPTED' } }),
    prisma.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, serviceType: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, status: true, createdAt: true },
    }),
    prisma.campaign.findMany({
      select: {
        id: true, name: true, status: true,
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  // Revenue by month
  const revenueByMonth: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    revenueByMonth[key] = 0
  }

  for (const b of bookings) {
    if (b.amount) {
      const d = new Date(b.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in revenueByMonth) revenueByMonth[key] += b.amount
    }
  }
  for (const o of orders) {
    if (o.totalAmount) {
      const d = new Date(o.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in revenueByMonth) revenueByMonth[key] += o.totalAmount
    }
  }

  // Bookings by service type
  const byServiceType: Record<string, number> = {}
  for (const b of bookings) {
    byServiceType[b.serviceType] = (byServiceType[b.serviceType] || 0) + 1
  }

  // Conversion rate
  const conversionRate = totalInquiries > 0
    ? Math.round((acceptedInquiries / totalInquiries) * 100)
    : 0
  const leadWinRate = totalLeads > 0
    ? Math.round((wonLeads / totalLeads) * 100)
    : 0

  // Total revenue
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    + orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  return {
    totals: { leads: totalLeads, bookings: totalBookings, orders: totalOrders, inquiries: totalInquiries },
    totalRevenue,
    conversionRate,
    leadWinRate,
    revenueByMonth,
    byServiceType,
    campaigns: campaigns.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      leads: c._count.leads,
    })),
  }
}

export default async function AnalyticsPage() {
  let data: Awaited<ReturnType<typeof getAnalyticsData>> | null = null

  try {
    data = await getAnalyticsData()
  } catch (error) {
    console.error('Error fetching analytics:', error)
  }

  if (!data) {
    return <div className="p-8 text-center text-stone-500">Failed to load analytics data.</div>
  }

  return <AnalyticsClient data={data} />
}
