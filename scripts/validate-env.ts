#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env') })
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

function validateEnv(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required variables
  const required = ['DATABASE_URL', 'DIRECT_URL', 'ANTHROPIC_API_KEY']

  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  }

  // Validate DATABASE_URL format (Session Pooler)
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL

    if (!dbUrl.includes('pooler.supabase.com:5432')) {
      errors.push('DATABASE_URL must use Session Pooler: aws-1-[region].pooler.supabase.com:5432')
    }

    if (dbUrl.includes('db.') && !dbUrl.includes('pooler')) {
      errors.push('DATABASE_URL uses OLD infrastructure. Use LATEST: aws-1-[region].pooler.supabase.com')
    }

    if (dbUrl.includes('aws-0-')) {
      errors.push('DATABASE_URL uses outdated hostname (aws-0). Update to aws-1')
    }

    if (!dbUrl.includes('postgres.') || !dbUrl.match(/postgres\.[a-z]+:/)) {
      errors.push('DATABASE_URL username must be project-qualified: postgres.[PROJECT_REF]')
    }
  }

  // Validate DIRECT_URL format (Session Pooler)
  if (process.env.DIRECT_URL) {
    const directUrl = process.env.DIRECT_URL

    if (!directUrl.includes('pooler.supabase.com:5432')) {
      errors.push('DIRECT_URL must use Session Pooler: aws-1-[region].pooler.supabase.com:5432')
    }

    if (!directUrl.includes('postgres.') || !directUrl.match(/postgres\.[a-z]+:/)) {
      errors.push('DIRECT_URL username must be project-qualified: postgres.[PROJECT_REF]')
    }

    if (directUrl.includes('aws-0-')) {
      errors.push('DIRECT_URL uses outdated hostname (aws-0). Update to aws-1')
    }
  }

  // Validate API key format
  if (process.env.ANTHROPIC_API_KEY) {
    if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
      errors.push('ANTHROPIC_API_KEY appears invalid (should start with sk-ant-)')
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

const result = validateEnv()

console.log('\n🔍 Environment Validation\n')

if (result.errors.length > 0) {
  console.error('❌ ERRORS:\n')
  result.errors.forEach(err => console.error(`  • ${err}`))
}

if (result.warnings.length > 0) {
  console.warn('\n⚠️  WARNINGS:\n')
  result.warnings.forEach(warn => console.warn(`  • ${warn}`))
}

if (result.valid) {
  console.log('✅ Environment validation passed!\n')
  process.exit(0)
} else {
  console.error('\n❌ Environment validation failed!\n')
  process.exit(1)
}
