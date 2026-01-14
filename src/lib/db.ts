import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 with PostgreSQL adapter for production
// Uses connection pooling via pg Pool for optimal performance
const connectionString = process.env.DATABASE_URL
const pool = connectionString ? new Pool({ connectionString }) : undefined

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: pool ? new PrismaPg(pool) : undefined,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
