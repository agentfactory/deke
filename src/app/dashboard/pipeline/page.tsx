import { prisma } from '@/lib/db'
import PipelineClient from './pipeline-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPipelineData() {
  const [
    inquiryPending, inquiryQuoted, inquiryAccepted, inquiryDeclined, inquiryExpired,
    bookingPending, bookingConfirmed, bookingInProgress, bookingCompleted, bookingCancelled,
    orderPending, orderInProgress, orderReview, orderCompleted, orderDelivered,
  ] = await Promise.all([
    prisma.inquiry.count({ where: { status: 'PENDING' } }),
    prisma.inquiry.count({ where: { status: 'QUOTED' } }),
    prisma.inquiry.count({ where: { status: 'ACCEPTED' } }),
    prisma.inquiry.count({ where: { status: 'DECLINED' } }),
    prisma.inquiry.count({ where: { status: 'EXPIRED' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.order.count({ where: { status: 'REVIEW' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
  ])

  // Get recent items for each pipeline stage
  const [recentInquiries, recentBookings, recentOrders] = await Promise.all([
    prisma.inquiry.findMany({
      where: { status: { in: ['PENDING', 'QUOTED'] } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { lead: { select: { firstName: true, lastName: true } } },
    }),
    prisma.booking.findMany({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { contact: { select: { firstName: true, lastName: true } } },
    }),
    prisma.order.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS', 'REVIEW'] } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { lead: { select: { firstName: true, lastName: true } } },
    }),
  ])

  return {
    inquiries: {
      PENDING: inquiryPending,
      QUOTED: inquiryQuoted,
      ACCEPTED: inquiryAccepted,
      DECLINED: inquiryDeclined,
      EXPIRED: inquiryExpired,
    },
    bookings: {
      PENDING: bookingPending,
      CONFIRMED: bookingConfirmed,
      IN_PROGRESS: bookingInProgress,
      COMPLETED: bookingCompleted,
      CANCELLED: bookingCancelled,
    },
    orders: {
      PENDING: orderPending,
      IN_PROGRESS: orderInProgress,
      REVIEW: orderReview,
      COMPLETED: orderCompleted,
      DELIVERED: orderDelivered,
    },
    recentInquiries: recentInquiries.map(i => ({
      id: i.id,
      name: `${i.lead.firstName} ${i.lead.lastName}`,
      serviceType: i.serviceType,
      status: i.status,
      amount: i.quotedAmount,
      date: i.createdAt.toISOString(),
    })),
    recentBookings: recentBookings.map(b => ({
      id: b.id,
      name: `${b.contact?.firstName ?? 'Unknown'} ${b.contact?.lastName ?? ''}`,
      serviceType: b.serviceType,
      status: b.status,
      amount: b.amount,
      date: b.createdAt.toISOString(),
    })),
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      name: `${o.lead.firstName} ${o.lead.lastName}`,
      orderNumber: o.orderNumber,
      status: o.status,
      amount: o.totalAmount,
      date: o.createdAt.toISOString(),
    })),
  }
}

export default async function PipelinePage() {
  let data: Awaited<ReturnType<typeof getPipelineData>> | null = null

  try {
    data = await getPipelineData()
  } catch (error) {
    console.error('Error fetching pipeline data:', error)
  }

  if (!data) {
    return <div className="p-8 text-center text-stone-500">Failed to load pipeline data.</div>
  }

  return <PipelineClient data={data} />
}
