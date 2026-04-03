import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const leads = await prisma.lead.count()
  const campaigns = await prisma.campaign.findMany({
    select: { id: true, name: true, discoveryStatus: true },
  })
  const contacts = await prisma.contact.count()
  console.log('Leads:', leads)
  console.log('Contacts:', contacts)
  console.log('Campaigns:', JSON.stringify(campaigns, null, 2))
  await prisma.$disconnect()
  pool.end()
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
