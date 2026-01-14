import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma 7: CLI configuration for migrations and db push
// This is separate from runtime PrismaClient configuration
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Use DIRECT_URL for migrations (direct connection, not pooled)
    // Falls back to DATABASE_URL if DIRECT_URL not available
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
})
