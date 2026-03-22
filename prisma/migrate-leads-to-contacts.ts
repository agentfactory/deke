/**
 * Data Migration: Convert booked leads to contacts
 *
 * IMPORTANT: This must run AFTER `prisma db push` applies the new schema.
 * The new schema adds the Contact model and changes Booking.leadId to Booking.contactId.
 *
 * Since prisma db push is destructive for the leadId→contactId rename, we need to:
 * 1. First run the SQL migration (step 1) to copy leadId data before schema push
 * 2. Then run prisma db push to apply the new schema
 * 3. Then run this script (step 2) to create contact records and update bookings
 *
 * Run with:
 *   npx tsx prisma/migrate-leads-to-contacts.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Lead-to-Contact Data Migration ===\n')

  // Step 1: Find leads that should be converted
  // We identify leads that have bookings by checking if any booking's contactId
  // matches a known pattern, OR we use raw SQL to check historical data

  // First, let's see if there are any bookings with empty contactId (needs migration)
  const bookingsNeedingMigration = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "Booking" WHERE "contactId" IS NULL OR "contactId" = ''
  `

  const needsMigration = Number(bookingsNeedingMigration[0]?.count || 0)

  if (needsMigration === 0) {
    // Check if there are bookings at all
    const totalBookings = await prisma.booking.count()
    if (totalBookings === 0) {
      console.log('No bookings found. Nothing to migrate.')
      return
    }

    // All bookings already have contactId — verify contacts exist
    console.log(`All ${totalBookings} bookings already have contactId assigned.`)
    console.log('Verifying contacts exist...\n')

    // Find unique contactIds from bookings and verify they exist
    const bookings = await prisma.booking.findMany({
      select: { contactId: true },
      distinct: ['contactId'],
    })

    for (const b of bookings) {
      const contact = await prisma.contact.findUnique({ where: { id: b.contactId } })
      if (!contact) {
        console.log(`  WARNING: Booking references contact ${b.contactId} which doesn't exist!`)
      }
    }

    console.log('Verification complete.')
    return
  }

  console.log(`Found ${needsMigration} bookings needing migration.\n`)
  console.log('ERROR: Bookings with NULL contactId detected.')
  console.log('This means the schema was pushed before data was migrated.')
  console.log('')
  console.log('To fix this, you need to run the pre-migration SQL first:')
  console.log('  npx tsx prisma/migrate-leads-to-contacts.ts --pre-push')
  console.log('')
  console.log('Then re-run prisma db push, then run this script again.')
}

async function prePush() {
  console.log('=== Pre-Push Migration: Create contacts from leads with bookings ===\n')

  // This runs BEFORE prisma db push, while the old schema (with leadId on Booking) is still active
  // We use raw SQL to work with the current schema

  // Find all unique leadIds from bookings
  const bookingLeads = await prisma.$queryRaw<Array<{ leadId: string }>>`
    SELECT DISTINCT "leadId" FROM "Booking" WHERE "leadId" IS NOT NULL
  `

  console.log(`Found ${bookingLeads.length} leads with bookings to convert.\n`)

  let created = 0
  let skipped = 0

  for (const { leadId } of bookingLeads) {
    // Get the lead data
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      console.log(`  SKIP: Lead ${leadId} not found`)
      skipped++
      continue
    }

    // Check if contact already exists for this lead
    const existingContact = await prisma.contact.findFirst({
      where: { leadId: lead.id }
    })

    if (existingContact) {
      // Update bookings to point to existing contact
      await prisma.$executeRaw`
        UPDATE "Booking" SET "contactId" = ${existingContact.id} WHERE "leadId" = ${leadId}
      `
      console.log(`  SKIP: ${lead.firstName} ${lead.lastName} - contact exists, updated bookings`)
      skipped++
      continue
    }

    // Check if contact with same email exists
    const contactByEmail = await prisma.contact.findUnique({
      where: { email: lead.email }
    })

    let contactId: string

    if (contactByEmail) {
      contactId = contactByEmail.id
      // Link it to this lead if not already linked
      if (!contactByEmail.leadId) {
        await prisma.contact.update({
          where: { id: contactByEmail.id },
          data: { leadId: lead.id }
        })
      }
      console.log(`  LINK: ${lead.firstName} ${lead.lastName} → existing contact ${contactId}`)
    } else {
      // Create new contact
      const contact = await prisma.contact.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          organization: lead.organization,
          source: lead.source,
          contactTitle: lead.contactTitle,
          latitude: lead.latitude,
          longitude: lead.longitude,
          website: lead.website,
          emailVerified: lead.emailVerified,
          editorialSummary: lead.editorialSummary,
          googleRating: lead.googleRating,
          leadId: lead.id,
        }
      })
      contactId = contact.id
      console.log(`  CREATE: ${lead.firstName} ${lead.lastName} → Contact ${contactId}`)
      created++
    }

    // Update bookings to point to new contact
    await prisma.$executeRaw`
      UPDATE "Booking" SET "contactId" = ${contactId} WHERE "leadId" = ${leadId}
    `

    // Mark lead as converted
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
      }
    })
  }

  console.log(`\nPre-push migration complete: ${created} contacts created, ${skipped} skipped.`)
  console.log('\nNext steps:')
  console.log('  1. Run `npx prisma db push` to apply the schema changes')
  console.log('  2. Verify the deployment is working')
}

// Parse args
const args = process.argv.slice(2)
const isPrePush = args.includes('--pre-push')

const runner = isPrePush ? prePush : main

runner()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
