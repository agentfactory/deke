# Deployment Fix Plan — Deke on Railway + Supabase

## Problem
Railway build fails at `prisma db push` with:
```
Error: P1000: Authentication failed against database server,
the provided database credentials for `postgres` are not valid.
```
Database: `aws-1-us-east-1.pooler.supabase.com:5432`

## Root Cause
The build script in `package.json` is:
```
"build": "prisma generate && prisma db push && next build"
```
`prisma db push` requires a live database connection during build. The `DIRECT_URL` or `DATABASE_URL` secret in Railway has invalid/stale Supabase credentials.

## Fix Plan (in order)

### 1. Fix the build command — remove `prisma db push` from build
**File:** `package.json` line 11

Change:
```json
"build": "prisma generate && prisma db push && next build"
```
To:
```json
"build": "prisma generate && next build"
```

**Why:** `prisma db push` modifies the database schema. It should NOT run on every deploy. It should be run manually or as a one-time migration step, not during the build phase. Railway builds happen in a sandboxed environment where DB access may be restricted anyway.

### 2. Verify/update Supabase credentials in Railway
In the Railway dashboard, check these environment variables:

- **`DATABASE_URL`** — Should be the **pooled** connection string from Supabase:
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
  (Note: port `6543`, with `?pgbouncer=true`)

- **`DIRECT_URL`** — Should be the **direct** (session mode) connection string:
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
  ```
  (Note: port `5432`, no pgbouncer param)

**Where to find these in Supabase:**
1. Go to Supabase Dashboard → Project → Settings → Database
2. Under "Connection string", copy both the "Transaction" (pooled) and "Session" (direct) URLs
3. Make sure the password is the database password you set when creating the project (NOT the Supabase account password)

### 3. Run `prisma db push` manually (one-time)
After updating credentials, run this locally or via Railway CLI:
```bash
DIRECT_URL="postgresql://..." npx prisma db push
```
This syncs the schema to Supabase once. After that, the build only needs `prisma generate`.

### 4. Add a release command for future schema changes (optional)
In `Procfile`, add:
```
web: npm run start
release: npx prisma db push
```
Railway runs `release` commands before starting the service. This way schema changes deploy automatically but separately from the build step.

**Alternative:** Use `prisma migrate deploy` instead of `db push` for production (requires switching from `db push` to proper migrations).

### 5. Verify all required Railway env vars
From the build logs, these secrets are expected:
- `DATABASE_URL` ← Supabase pooled connection
- `DIRECT_URL` ← Supabase direct connection
- `ANTHROPIC_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `NODE_ENV` (should be "production")
- `RESEND` API key (if email sending is used)
- Other optional: `CF_NOTIFICATION_SECRET`, `CF_NOTIFICATION_WORKER_URL`, `PERPLEXITY_API_KEY` (removed but still listed)

## Key Files
- `package.json:11` — build script
- `prisma.config.ts` — CLI datasource config (uses DIRECT_URL → DATABASE_URL fallback)
- `prisma/schema.prisma` — schema, datasource block has no URL (Prisma 7 style)
- `src/lib/db.ts` — runtime PrismaClient with pg adapter (uses DATABASE_URL)
- `Procfile` — Railway start command

## Quick Fix (minimum to unblock deploy)
Just change the build script and ensure DATABASE_URL is valid in Railway. That's it.
