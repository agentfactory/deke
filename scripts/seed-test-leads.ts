/**
 * Seed Test Leads Script
 *
 * Populates the database with sample leads for testing campaign discovery.
 *
 * Run with: npx tsx scripts/seed-test-leads.ts
 */

import 'dotenv/config'
import { prisma } from '../src/lib/db'

// Sample locations with coordinates
const LOCATIONS = [
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
  { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
  { city: 'Berkeley', state: 'CA', lat: 37.8715, lng: -122.2730 },
  { city: 'Palo Alto', state: 'CA', lat: 37.4419, lng: -122.1430 },
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Brooklyn', state: 'NY', lat: 40.6782, lng: -73.9442 },
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
]

// Sample organizations
const ORGANIZATIONS = [
  'Google Inc',
  'Microsoft Corporation',
  'Apple Inc',
  'Tesla Motors',
  'SpaceX',
  'Amazon Web Services',
  'Stanford University',
  'UC Berkeley',
  'Facebook (Meta)',
  'Salesforce',
  'Airbnb',
  'Uber Technologies',
  'Lyft Inc',
  'Twitter (X Corp)',
  'LinkedIn Corporation',
]

// Sample first/last names
const FIRST_NAMES = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Jessica', 'Richard', 'Michelle', 'Thomas', 'Ashley']
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas']

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com']
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(domains)}`
}

function generatePhone(): string {
  return `+1${randomInt(200, 999)}${randomInt(200, 999)}${randomInt(1000, 9999)}`
}

// Generate date in the past (for dormant leads)
function pastDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

async function seedLeads() {
  console.log('🌱 Starting lead seed...\n')

  const leads = []

  // Create 20 leads with various statuses
  for (let i = 0; i < 20; i++) {
    const firstName = randomItem(FIRST_NAMES)
    const lastName = randomItem(LAST_NAMES)
    const location = randomItem(LOCATIONS)
    const organization = Math.random() > 0.3 ? randomItem(ORGANIZATIONS) : null

    // Vary the lead status and last contact
    const statusOptions: Array<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATING' | 'WON' | 'LOST'> = [
      'NEW',
      'CONTACTED',
      'QUALIFIED',
      'NEGOTIATING',
      'WON',
      'LOST',
    ]
    const status = randomItem(statusOptions)

    // Make some leads dormant (not contacted in 6+ months)
    const isDormant = i < 8 // First 8 leads are dormant
    const lastContactedAt = isDormant
      ? pastDate(randomInt(180, 365)) // 6-12 months ago
      : pastDate(randomInt(1, 30)) // 1-30 days ago

    const lead = {
      firstName,
      lastName,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      organization,
      source: randomItem(['WEBSITE', 'REFERRAL', 'MARKETING', 'COLD_OUTREACH']),
      status,
      score: randomInt(50, 95),
      latitude: location.lat,
      longitude: location.lng,
      lastContactedAt,
      createdAt: pastDate(randomInt(30, 365)),
    }

    leads.push(lead)
  }

  // Insert leads
  console.log(`📝 Creating ${leads.length} leads...`)
  let created = 0
  for (const lead of leads) {
    try {
      await prisma.lead.upsert({
        where: { email: lead.email },
        update: lead,
        create: lead,
      })
      created++
    } catch (error) {
      console.error(`❌ Failed to create lead ${lead.email}:`, error)
    }
  }

  console.log(`✅ Created ${created} leads\n`)

  // Summary by status
  const leadsByStatus = await prisma.lead.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('📊 Leads by status:')
  leadsByStatus.forEach(({ status, _count }) => {
    console.log(`   ${status}: ${_count}`)
  })

  // Count dormant leads (not contacted in 6+ months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const dormantCount = await prisma.lead.count({
    where: {
      lastContactedAt: {
        lt: sixMonthsAgo,
      },
      status: {
        notIn: ['WON', 'LOST'],
      },
    },
  })

  console.log(`\n💤 Dormant leads (6+ months): ${dormantCount}`)

  // Summary by location
  console.log('\n📍 Leads by location (top 5):')
  const leadsByLocation = await prisma.$queryRaw<
    Array<{ latitude: number; longitude: number; count: bigint }>
  >`
    SELECT latitude, longitude, COUNT(*)::int as count
    FROM "Lead"
    GROUP BY latitude, longitude
    ORDER BY count DESC
    LIMIT 5
  `

  leadsByLocation.forEach(({ latitude, longitude, count }) => {
    const location = LOCATIONS.find(
      (loc) => Math.abs(loc.lat - latitude) < 0.1 && Math.abs(loc.lng - longitude) < 0.1
    )
    console.log(`   ${location?.city || 'Unknown'}: ${count}`)
  })

  console.log('\n✨ Seed complete! You can now create campaigns and discover leads.\n')
}

async function main() {
  try {
    await seedLeads()
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
