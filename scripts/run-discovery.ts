/**
 * Run discovery directly (bypass API route / background runner)
 * Usage: npx tsx scripts/run-discovery.ts [campaignId]
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Set up Prisma with adapter (same as db.ts but standalone)
const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
})

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: ['error', 'warn'],
})

// Patch global prisma for modules that import from @/lib/db
;(globalThis as any).__prisma_instance = prisma

async function main() {
  const campaignId = process.argv[2] || 'c13511be-9021-475f-b11f-d4345528b37e'

  console.log(`\n=== Running discovery for campaign: ${campaignId} ===\n`)

  // Verify campaign exists
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, name: true, baseLocation: true, latitude: true, longitude: true, radius: true, targetOrgTypes: true },
  })

  if (!campaign) {
    console.error(`Campaign ${campaignId} not found`)
    process.exit(1)
  }

  console.log(`Campaign: ${campaign.name}`)
  console.log(`Location: ${campaign.baseLocation} (${campaign.latitude}, ${campaign.longitude})`)
  console.log(`Radius: ${campaign.radius} miles`)
  console.log(`Target org types: ${campaign.targetOrgTypes || 'none (booking-based)'}`)
  console.log()

  // Mark as running
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { discoveryStatus: 'RUNNING', discoveryStartedAt: new Date(), discoveryError: null },
  })

  try {
    // Dynamic import to work with path aliases
    const { discoverLeads } = await import('../src/lib/discovery/orchestrator')

    console.log('Starting discovery pipeline...\n')
    const result = await discoverLeads(campaignId)

    console.log('\n=== DISCOVERY RESULTS ===')
    console.log(`Total leads discovered: ${result.total}`)
    console.log(`Filtered out: ${result.filteredOut}`)
    console.log(`Duration: ${(result.duration / 1000).toFixed(1)}s`)
    console.log(`\nBy source:`)
    console.log(`  Past Clients:  ${result.bySource.PAST_CLIENT || 0}`)
    console.log(`  Dormant:       ${result.bySource.DORMANT || 0}`)
    console.log(`  Similar Orgs:  ${result.bySource.SIMILAR_ORG || 0}`)
    console.log(`  AI Research:   ${result.bySource.AI_RESEARCH || 0}`)
    console.log(`\nScore stats:`)
    console.log(`  Min: ${result.scoreStats.min}, Max: ${result.scoreStats.max}, Avg: ${result.scoreStats.avg.toFixed(1)}`)
    console.log(`  Distribution: ${JSON.stringify(result.scoreStats.distribution)}`)

    if (result.deduplicationStats) {
      console.log(`\nDeduplication: ${result.deduplicationStats.original} → ${result.deduplicationStats.unique} (${result.deduplicationStats.duplicates} dupes removed)`)
    }

    if (result.warnings.length > 0) {
      console.log(`\nWarnings:`)
      result.warnings.forEach(w => console.log(`  ⚠ ${w}`))
    }

    if (result.errors.length > 0) {
      console.log(`\nErrors:`)
      result.errors.forEach(e => console.log(`  ❌ ${e}`))
    }

    // Mark completed
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { discoveryStatus: 'COMPLETED', discoveryError: null },
    })

    console.log('\n✓ Discovery completed successfully')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`\n❌ Discovery FAILED: ${msg}`)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { discoveryStatus: 'FAILED', discoveryError: msg.substring(0, 1000) },
    })
  } finally {
    await prisma.$disconnect()
    pool.end()
  }
}

main()
