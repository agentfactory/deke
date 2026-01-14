# Prisma 7.2.0 Configuration Research Summary

_Generated: 2025-01-14 | Sources: 8 official docs | Confidence: High_

## Executive Summary

<key-findings>
- **Primary recommendation**: Prisma 7 requires `prisma.config.ts` file at project root for ALL CLI commands (db push, migrate, generate)
- **Critical change**: Database URLs moved from `schema.prisma` to `prisma.config.ts` for CLI operations
- **Runtime separation**: CLI uses `prisma.config.ts`, but PrismaClient at runtime still needs URL via adapter
- **Key trade-off**: Dual configuration needed - one for CLI (prisma.config.ts), one for runtime (adapter with connection string)
- **Breaking change**: `--url` and `--schema` flags removed from most commands; must use config file
</key-findings>

## Detailed Analysis

<overview>
Prisma ORM 7 represents a major architectural shift from version 6. The primary change is the introduction of **driver adapters as the default** for all database connections and the **migration of CLI configuration** from schema.prisma to a TypeScript-based configuration file (prisma.config.ts).

### What Changed in Prisma 7

**Configuration Architecture:**
- Database URLs no longer go in `schema.prisma` datasource block
- New `prisma.config.ts` file required at project root for CLI commands
- Generator provider changed from `prisma-client-js` to `prisma-client`
- All database connections now require explicit driver adapters at runtime

**CLI Behavior:**
- `prisma generate` no longer auto-runs after `db push` or `migrate dev`
- `--url` and `--schema` flags removed from most commands
- Environment variables must be explicitly loaded (Prisma doesn't auto-load .env)
- Prisma Config is now the single source of truth for CLI operations
</overview>

## Implementation Guide

<implementation>
### Complete Setup - Step by Step

#### 1. Project Structure
```
your-project/
├── package.json
├── .env                          # Environment variables
├── prisma.config.ts              # NEW in v7 - CLI configuration
├── prisma/
│   ├── schema.prisma             # Schema only, NO url field
│   └── migrations/
└── src/
    └── lib/
        └── db.ts                 # Runtime PrismaClient with adapter
```

#### 2. Environment Variables (.env)
```env
# Direct database connection (for CLI commands and runtime)
DATABASE_URL="postgresql://user:password@host:5432/database"

# For connection pooling (optional)
DATABASE_URL_POOLED="postgresql://user:password@pooler:6543/database"
```

#### 3. Prisma Config File (prisma.config.ts)
**Location**: Project root (where package.json is)

```typescript
// prisma.config.ts
import 'dotenv/config'  // REQUIRED - Prisma doesn't auto-load .env
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // Schema location
  schema: 'prisma/schema.prisma',

  // Migration settings
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',  // Optional seed script
  },

  // Database URL for CLI commands (db push, migrate, generate)
  datasource: {
    url: env('DATABASE_URL'),

    // Optional: shadow database for dev
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
```

**Critical Notes:**
- This file is ONLY used by CLI commands (migrate, db push, generate, studio)
- You must import 'dotenv/config' at the top - Prisma 7 doesn't auto-load .env files
- The `env()` helper reads from process.env
- CLI commands like `npx prisma db push` read this file to find your database

#### 4. Schema File (prisma/schema.prisma)
**NO url field in datasource block anymore**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"  // Changed from "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  // NO url field here in v7!
  // url = env("DATABASE_URL")  // ❌ Remove this
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

**Note**: Some users report issues with Next.js 16 Turbopack when using `prisma-client` provider. If you encounter module resolution errors, you can temporarily use `prisma-client-js` as a workaround.

#### 5. Runtime Configuration (src/lib/db.ts)
**This is separate from CLI configuration**

```typescript
// src/lib/db.ts
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Create connection pool with custom settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Match Prisma v6 behavior (optional)
  connectionTimeoutMillis: 5_000,   // v6 default was 5s
  idleTimeoutMillis: 300_000,       // v6 default was 300s

  // Production settings
  max: 10,                          // Maximum pool size
})

// Create adapter
const adapter = new PrismaPg(pool)

// Create Prisma Client with adapter
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
})

// Singleton pattern for Next.js
declare global {
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}
```

**Key Points:**
- Runtime configuration is SEPARATE from CLI configuration
- You must pass connection string to adapter at runtime
- PrismaPg adapter wraps the pg Pool for connection management
- Custom pool settings allow fine-tuning for production

#### 6. Package.json Scripts
```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push && npm run db:generate",
    "db:migrate:dev": "prisma migrate dev && npm run db:generate",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "pg": "^8.13.1"
  },
  "devDependencies": {
    "dotenv": "^16.4.7",
    "prisma": "^7.2.0"
  }
}
```

**Important Changes:**
- Must explicitly call `prisma generate` after db push/migrate (no longer automatic)
- `postinstall` script ensures Prisma Client is generated on deployment (Vercel/Railway)
- `dotenv` package required for loading .env files

### Advanced Integration

#### Connection Pooling for Production

**Standard Setup (Direct Connection):**
```typescript
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})
```

**With Connection Pooling (PgBouncer/Supabase):**
```typescript
import { Pool } from 'pg'

// Use pooled connection for queries
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
  max: 10,
})

// Use direct connection for migrations
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

**Vercel/Serverless Optimization:**
```typescript
// Disable connection pooling for serverless (each invocation creates new connection)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
  // Prevent connection exhaustion
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
```

#### Custom Schema Support
```typescript
const adapter = new PrismaPg(pool, {
  schema: 'myCustomSchema'
})
```

#### Railway Production Deployment

**Environment Variables:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
```

**Build Command:**
```bash
npm install && prisma generate
```

**Start Command:**
```bash
npm run start
```

**Important**: Do NOT run `prisma db push` in build command on Railway. Deploy database schema separately or use `prisma migrate deploy`.

#### Vercel Production Deployment

**Environment Variables (Vercel Dashboard):**
- `DATABASE_URL` (production database)
- `DATABASE_URL` (preview - use separate database)

**Build Settings:**
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

**Key Notes:**
- Vercel caches dependencies; `postinstall` script ensures fresh Prisma Client
- Use separate preview database to prevent preview deployments affecting production
- Edge Functions require `@prisma/adapter-pg` for connection management
</implementation>

## Critical Considerations

<considerations>
### Security Implications
- **Connection strings in runtime code**: Adapters require connection string at runtime, ensure proper secret management
- **Environment variable exposure**: Don't commit .env files, use platform secret management
- **Connection pooling limits**: Set max pool size to prevent database connection exhaustion
- **Prisma Accelerate users**: Do NOT pass Accelerate URL (prisma://) to PrismaPg adapter - it expects direct database URL

### Performance Characteristics
- **Connection pool defaults changed**: pg driver defaults to 0ms connection timeout (was 5s in v6)
- **Idle timeout reduced**: Now 10s (was 300s in v6) - may cause more reconnections
- **Serverless cold starts**: Each serverless invocation may create new connection - consider connection pooling service
- **Generate performance**: `prisma generate` now separate command, add to CI/CD pipelines

### Version Compatibility
- **Prisma 7 requires Node.js 18+**
- **@prisma/adapter-pg requires pg ^8.12.0**
- **Breaking change**: Cannot mix Prisma 6 and 7 in same project
- **Migration path**: Must upgrade all @prisma/* packages together

### Common Pitfalls
1. **Forgetting prisma.config.ts**: All CLI commands will fail with "datasource property required" error
2. **Missing dotenv import**: Environment variables won't load, causing "invalid DATABASE_URL" errors
3. **Not running generate after migrations**: Prisma Client will be out of sync with schema
4. **Using Accelerate URL with adapter**: PrismaPg expects direct connection, not prisma:// URL
5. **Forgetting postinstall script**: Vercel/Railway deployments will fail without generated client
6. **Using old --url flag**: Removed in v7, must configure in prisma.config.ts
7. **Assuming schema.prisma url works**: CLI ignores datasource.url in schema, only reads prisma.config.ts

### Migration Pain Points
- **Enum @map directive**: Breaking change if using @map on enum values
- **Client middleware API removed**: Must migrate to Client Extensions
- **Automatic seeding removed**: Must explicitly run seed scripts
- **--skip-generate flag removed**: Update CI/CD scripts to explicitly call generate
</considerations>

## Relationship Between Configuration Files

<diagram>
```
┌─────────────────────────────────────────────────────────────────┐
│                         PRISMA 7 ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

CLI COMMANDS (prisma db push, migrate, generate, studio)
    │
    ├──> Reads: prisma.config.ts
    │           ├── datasource.url: env('DATABASE_URL')
    │           ├── schema: 'prisma/schema.prisma'
    │           └── migrations.path: 'prisma/migrations'
    │
    └──> Reads: prisma/schema.prisma
                └── Models, relations, indexes (NO url field)

RUNTIME (Your application code)
    │
    ├──> Uses: src/lib/db.ts
    │           ├── PrismaPg adapter with connection string
    │           ├── Pool configuration (timeouts, max connections)
    │           └── PrismaClient({ adapter })
    │
    └──> Reads: @/generated/prisma/client
                └── Generated by CLI (prisma generate command)

┌─────────────────────────────────────────────────────────────────┐
│  KEY INSIGHT: Two separate configuration systems                 │
│  • CLI uses prisma.config.ts + schema.prisma                    │
│  • Runtime uses adapter + connection string                     │
│  • They both need DATABASE_URL, but access it differently       │
└─────────────────────────────────────────────────────────────────┘
```
</diagram>

### How CLI Commands Find Database URL

1. **prisma generate**: Reads `prisma.config.ts` to find schema location, but doesn't need valid DATABASE_URL (as of 7.2.0)
2. **prisma db push**: Reads `prisma.config.ts` → datasource.url → env('DATABASE_URL') from process.env
3. **prisma migrate dev**: Same as db push, also creates migration files at migrations.path
4. **prisma migrate deploy**: Production migration - reads prisma.config.ts for URL and migrations path
5. **prisma studio**: Reads prisma.config.ts for database connection

### How Runtime Finds Database URL

1. Application code imports PrismaClient
2. Code creates adapter with connection string: `new PrismaPg({ connectionString: process.env.DATABASE_URL })`
3. Code passes adapter to PrismaClient: `new PrismaClient({ adapter })`
4. At runtime, pg driver uses the connection string from the adapter

**Critical Distinction**: The CLI and runtime use DATABASE_URL independently. They don't share configuration beyond the environment variable name.

## Alternatives Comparison

<alternatives>
| Configuration Approach | Pros | Cons | Use Case |
|----------------------|------|------|----------|
| **prisma.config.ts with env()** | Type-safe, official v7 approach, supports all CLI commands | Requires dotenv import, dual config (CLI + runtime) | Production apps, team projects |
| **Direct URL in prisma.config.ts** | Simple, no env() wrapper needed | Hardcoded secrets (security risk), not flexible | Quick prototypes, local dev only |
| **--url flag (removed in v7)** | Quick overrides without config changes | No longer supported in Prisma 7 | N/A - migrate to config file |
| **schema.prisma url field (v6 style)** | Single source of truth, simpler | Deprecated in v7, CLI ignores it | Legacy projects not yet migrated |
| **Prisma Accelerate** | Global CDN, connection pooling, caching | Additional cost, separate service | High-traffic serverless apps |
</alternatives>

## Complete Working Example

<example>
### Full Prisma 7 + PostgreSQL + Next.js Setup

**1. Install dependencies:**
```bash
npm install @prisma/client@7.2.0 @prisma/adapter-pg pg
npm install -D prisma@7.2.0 dotenv
```

**2. Create prisma.config.ts:**
```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

**3. Create schema.prisma:**
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
}
```

**4. Create database client:**
```typescript
// src/lib/db.ts
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

const adapter = new PrismaPg(pool)
export const db = new PrismaClient({ adapter })
```

**5. Set up environment:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
```

**6. Initialize database:**
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

**7. Use in your app:**
```typescript
// app/api/users/route.ts
import { db } from '@/lib/db'

export async function GET() {
  const users = await db.user.findMany()
  return Response.json(users)
}
```

**8. Deploy to Railway:**
- Set DATABASE_URL environment variable
- Ensure `postinstall: "prisma generate"` in package.json
- Build command: `npm install && npm run build`
- Deploy will auto-run postinstall

This is a complete, production-ready setup for Prisma 7 with PostgreSQL.
</example>

## Resources

<references>
- [Prisma ORM 7.2.0 Release Announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-2-0) - Official release notes with CLI improvements
- [Prisma Config Reference (Official Docs)](https://www.prisma.io/docs/orm/reference/prisma-config-reference) - Complete prisma.config.ts API reference
- [Upgrade to Prisma ORM 7 Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) - Official migration guide from v6
- [Data Sources Reference](https://www.prisma.io/docs/orm/prisma-schema/overview/data-sources) - Datasource configuration documentation
- [PostgreSQL Database Connector](https://www.prisma.io/docs/orm/overview/databases/postgresql) - PostgreSQL-specific configuration
- [Connection Pool Documentation](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) - Connection pooling guide
- [Deploy to Vercel Guide](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel) - Serverless deployment best practices
- [Deploy to Railway Guide](https://www.prisma.io/docs/orm/prisma-client/deployment/traditional/deploy-to-railway) - Traditional deployment patterns
- [GitHub Issue #28585](https://github.com/prisma/prisma/issues/28585) - Community discussion on datasource property requirement
- [GitHub Issue #28573](https://github.com/prisma/prisma/issues/28573) - Breaking changes discussion for config file
</references>

## Research Metadata

<meta>
research-date: 2025-01-14
confidence-level: high
sources-validated: 8 official docs + 2 GitHub issues
version-current: 7.2.0 (latest as of Jan 2025)
key-breaking-changes: prisma.config.ts required, adapter-based architecture, URL moved from schema
migration-difficulty: medium (requires config file changes + adapter setup)
</meta>

---

## Quick Reference Card

### Checklist for Prisma 7 Setup

- [ ] Create `prisma.config.ts` at project root
- [ ] Add `import 'dotenv/config'` at top of config file
- [ ] Configure datasource.url with `env('DATABASE_URL')`
- [ ] Remove `url` field from schema.prisma datasource block
- [ ] Change generator provider to `"prisma-client"`
- [ ] Install `@prisma/adapter-pg` and `pg` packages
- [ ] Create runtime db.ts with PrismaPg adapter
- [ ] Add `postinstall: "prisma generate"` to package.json
- [ ] Update scripts to explicitly run `prisma generate`
- [ ] Test: `npx prisma db push` (should work without --url flag)
- [ ] Test: `npx prisma generate` (should work without valid DATABASE_URL)
- [ ] Test: Runtime query (should connect via adapter)

### Common Error Solutions

**Error**: "The datasource property is required in your Prisma config file"
- **Solution**: Create prisma.config.ts with datasource.url configuration

**Error**: "Invalid DATABASE_URL"
- **Solution**: Add `import 'dotenv/config'` to top of prisma.config.ts

**Error**: "Cannot find module '@prisma/client'"
- **Solution**: Run `npx prisma generate` to generate Prisma Client

**Error**: "PrismaPg expects a direct database connection string"
- **Solution**: Don't use Accelerate URL (prisma://) with adapter, use direct postgres:// URL

**Error**: Module resolution errors with Next.js 16 Turbopack
- **Solution**: Use `prisma-client-js` instead of `prisma-client` in generator provider (temporary workaround)
