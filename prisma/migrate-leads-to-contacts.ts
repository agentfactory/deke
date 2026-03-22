/**
 * Data Migration: Convert booked leads to contacts
 *
 * Two-phase migration for Railway deploy:
 *
 * Phase 1 (--save-mapping): Runs BEFORE prisma db push
 *   - Saves booking→lead mappings to a temp table before leadId column is dropped
 *
 * Phase 2 (--apply-mapping): Runs AFTER prisma db push
 *   - Creates Contact records from leads that had bookings
 *   - Updates bookings with new contactId using saved mappings
 *   - Marks leads as CONVERTED
 *   - Cleans up temp table
 *
 * Build command order:
 *   prisma generate → save-mapping → db push → apply-mapping → next build
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!connectionString) {
  console.error('DATABASE_URL not set. Cannot run migration.')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  max: 5,
  ssl: { rejectUnauthorized: false },
})

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function saveMapping() {
  console.log('=== Phase 1: Save booking→lead mappings before schema push ===\n')

  try {
    // Check if leadId column still exists on Booking
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Booking' AND column_name = 'leadId'
    `

    if (columns.length === 0) {
      console.log('leadId column already removed from Booking table. Skipping save-mapping.')
      return
    }

    // Create temp table to store mappings (drop if exists from previous failed run)
    await prisma.$executeRawUnsafe(`
      DROP TABLE IF EXISTS "_booking_lead_migration";
      CREATE TABLE "_booking_lead_migration" (
        "bookingId" TEXT NOT NULL,
        "leadId" TEXT NOT NULL,
        PRIMARY KEY ("bookingId")
      )
    `)

    // Save all booking→lead mappings
    const saved = await prisma.$executeRaw`
      INSERT INTO "_booking_lead_migration" ("bookingId", "leadId")
      SELECT "id", "leadId" FROM "Booking" WHERE "leadId" IS NOT NULL
      ON CONFLICT ("bookingId") DO NOTHING
    `

    console.log(`Saved ${saved} booking→lead mappings to temp table.`)
  } catch (error) {
    // If the table or column doesn't exist, that's fine - migration may have already run
    console.log('Note: Could not save mappings (may already be migrated):', (error as Error).message)
  }
}

async function applyMapping() {
  console.log('=== Phase 2: Create contacts and apply mappings after schema push ===\n')

  // Check if temp table exists
  const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = '_booking_lead_migration'
    ) as exists
  `

  if (!tableExists[0]?.exists) {
    console.log('No migration temp table found. Checking if bookings need contacts...\n')

    // Check if there are bookings without contactId
    const orphanedBookings = await prisma.booking.count({
      where: { contactId: null }
    })

    if (orphanedBookings === 0) {
      console.log('All bookings have contactId assigned. Nothing to do.')
      return
    }

    console.log(`WARNING: ${orphanedBookings} bookings have no contactId and no migration data available.`)
    console.log('These bookings may need manual attention.')
    return
  }

  // Get all mappings from temp table
  const mappings = await prisma.$queryRaw<Array<{ bookingId: string; leadId: string }>>`
    SELECT "bookingId", "leadId" FROM "_booking_lead_migration"
  `

  console.log(`Found ${mappings.length} booking→lead mappings to process.\n`)

  if (mappings.length === 0) {
    // Clean up temp table
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "_booking_lead_migration"')
    console.log('No mappings to process. Cleaned up temp table.')
    return
  }

  // Get unique leadIds
  const uniqueLeadIds = [...new Set(mappings.map(m => m.leadId))]
  let contactsCreated = 0
  let bookingsUpdated = 0

  for (const leadId of uniqueLeadIds) {
    // Get the lead
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      console.log(`  SKIP: Lead ${leadId} not found in database`)
      continue
    }

    // Find or create contact
    let contact = await prisma.contact.findUnique({ where: { email: lead.email } })

    if (!contact) {
      contact = await prisma.contact.create({
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
      contactsCreated++
      console.log(`  CREATE: ${lead.firstName} ${lead.lastName} (${lead.email}) → Contact ${contact.id}`)
    } else {
      // Link to lead if not already
      if (!contact.leadId) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { leadId: lead.id }
        })
      }
      console.log(`  EXIST: ${lead.firstName} ${lead.lastName} (${lead.email}) → Contact ${contact.id}`)
    }

    // Update all bookings for this lead
    const leadBookingIds = mappings.filter(m => m.leadId === leadId).map(m => m.bookingId)
    const updated = await prisma.booking.updateMany({
      where: { id: { in: leadBookingIds } },
      data: { contactId: contact.id }
    })
    bookingsUpdated += updated.count

    // Mark lead as converted
    if (lead.status !== 'CONVERTED') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'CONVERTED', convertedAt: new Date() }
      })
    }
  }

  // Clean up temp table
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "_booking_lead_migration"')

  console.log(`\nMigration complete: ${contactsCreated} contacts created, ${bookingsUpdated} bookings updated.`)
  console.log('Temp table cleaned up.')
}

// Parse args
const args = process.argv.slice(2)
const mode = args[0]

let runner: () => Promise<void>

if (mode === '--save-mapping') {
  runner = saveMapping
} else if (mode === '--apply-mapping') {
  runner = applyMapping
} else {
  console.log('Usage:')
  console.log('  npx tsx prisma/migrate-leads-to-contacts.ts --save-mapping   (before db push)')
  console.log('  npx tsx prisma/migrate-leads-to-contacts.ts --apply-mapping  (after db push)')
  process.exit(0)
}

runner()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
