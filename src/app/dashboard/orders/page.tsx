import { prisma } from '@/lib/db'
import OrdersClient from './orders-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getOrderStats() {
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.order.count({ where: { status: { in: ['COMPLETED', 'DELIVERED'] } } }),
  ])
  return { total, pending, inProgress, completed }
}

async function getOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lead: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          organization: true,
        },
      },
    },
  })
}

export default async function OrdersPage() {
  let stats = { total: 0, pending: 0, inProgress: 0, completed: 0 }
  let orders: Awaited<ReturnType<typeof getOrders>> = []

  try {
    ;[stats, orders] = await Promise.all([getOrderStats(), getOrders()])
  } catch (error) {
    console.error('Error fetching orders:', error)
  }

  const serializedOrders = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    dueDate: o.dueDate?.toISOString() ?? null,
    deliveredAt: o.deliveredAt?.toISOString() ?? null,
  }))

  return <OrdersClient initialOrders={serializedOrders} stats={stats} />
}
