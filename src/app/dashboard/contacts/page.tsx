import { prisma } from '@/lib/db'
import { Users } from 'lucide-react'
import ContactsClient from './contacts-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ContactsPage() {
  let contacts: Awaited<ReturnType<typeof fetchContacts>> = []

  try {
    contacts = await fetchContacts()
  } catch (error) {
    console.error('Error fetching contacts:', error)
  }

  const serializedContacts = contacts.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Contacts
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#666666]">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#C05A3C]" aria-hidden="true" />
              {contacts.length} contacts
            </span>
          </div>
        </div>

        <ContactsClient initialContacts={serializedContacts} />
      </div>
    </div>
  )
}

async function fetchContacts() {
  return prisma.contact.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      organization: true,
      source: true,
      contactTitle: true,
      leadId: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { bookings: true } },
    },
  })
}
