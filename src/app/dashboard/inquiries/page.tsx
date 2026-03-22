import { prisma } from '@/lib/db'
import InquiriesClient from './inquiries-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getInquiryStats() {
  const [total, pending, quoted, accepted] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'PENDING' } }),
    prisma.inquiry.count({ where: { status: 'QUOTED' } }),
    prisma.inquiry.count({ where: { status: 'ACCEPTED' } }),
  ])
  return { total, pending, quoted, accepted }
}

async function getInquiries() {
  return prisma.inquiry.findMany({
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
      booking: {
        select: {
          id: true,
          serviceType: true,
          status: true,
        },
      },
    },
  })
}

export default async function InquiriesPage() {
  let stats = { total: 0, pending: 0, quoted: 0, accepted: 0 }
  let inquiries: Awaited<ReturnType<typeof getInquiries>> = []

  try {
    ;[stats, inquiries] = await Promise.all([
      getInquiryStats(),
      getInquiries(),
    ])
  } catch (error) {
    console.error('Error fetching inquiries:', error)
  }

  // Serialize dates for client component
  const serializedInquiries = inquiries.map((inq) => ({
    ...inq,
    createdAt: inq.createdAt.toISOString(),
    updatedAt: inq.updatedAt.toISOString(),
    quotedAt: inq.quotedAt?.toISOString() ?? null,
    quoteExpiry: inq.quoteExpiry?.toISOString() ?? null,
  }))

  return <InquiriesClient initialInquiries={serializedInquiries} stats={stats} />
}
