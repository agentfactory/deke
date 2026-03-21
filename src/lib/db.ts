import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 runtime configuration with adapter
// Note: This is separate from prisma.config.ts (used by CLI)
// Use pooled DATABASE_URL for application queries (Supabase transaction mode)
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('[DB] DATABASE_URL environment variable is not set. All database operations will fail.')
  console.error('[DB] Set DATABASE_URL in your .env file or deployment environment variables.')
}

function createPrismaClient(): PrismaClient {
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Set it in your .env file (see .env.example) or in your deployment platform environment variables.'
    )
  }

  // Create connection pool with error handling
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message)
  })

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Configure Prisma client with adapter
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
