import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  version: string
  checks: {
    database: {
      status: 'ok' | 'error'
      latency?: number
      error?: string
    }
    prisma: {
      status: 'ok' | 'error'
      version?: string
      error?: string
    }
  }
  environment: string
}

export async function GET() {
  const startTime = Date.now()

  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      database: { status: 'ok' },
      prisma: { status: 'ok' }
    },
    environment: process.env.NODE_ENV || 'development'
  }

  try {
    // Test database connection with actual query
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1 as health_check`
    const dbLatency = Date.now() - dbStart

    health.checks.database = {
      status: 'ok',
      latency: dbLatency
    }

    // Verify Prisma Client works
    await prisma.lead.count()
    health.checks.prisma = {
      status: 'ok',
      version: '7.2.0'
    }

    // Flag as degraded if latency is high
    if (dbLatency > 1000) {
      health.status = 'degraded'
    }

  } catch (error) {
    health.status = 'error'
    health.checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error'
    }

    return NextResponse.json(health, { status: 503 })
  }

  return NextResponse.json(health, {
    status: health.status === 'error' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
