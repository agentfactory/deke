import { NextResponse } from 'next/server'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'starting'
  timestamp: string
  version: string
  checks: {
    database: {
      status: 'ok' | 'starting' | 'error'
      latency?: number
      error?: string
    }
  }
  environment: string
}

export async function GET() {
  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      database: { status: 'ok' }
    },
    environment: process.env.NODE_ENV || 'development'
  }

  try {
    // Lazy import prisma to avoid blocking health check if DB module fails to load
    const { prisma } = await import('@/lib/db')

    // Test database connection with actual query
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1 as health_check`
    const dbLatency = Date.now() - dbStart

    health.checks.database = {
      status: 'ok',
      latency: dbLatency
    }

    // Flag as degraded if latency is high
    if (dbLatency > 1000) {
      health.status = 'degraded'
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Database not yet available'
    console.error('[HEALTH] Database check failed:', errorMessage)

    // Return 200 with "starting" status so Railway healthcheck passes
    // while the database is still warming up
    health.status = 'starting'
    health.checks.database = {
      status: 'starting',
      error: errorMessage,
    }
  }

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
