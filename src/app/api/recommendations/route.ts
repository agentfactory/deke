/**
 * Recommendations API
 *
 * GET /api/recommendations?serviceType=WORKSHOP&orgType=UNIVERSITY
 * Returns service recommendations for a given context
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRecommendations } from '@/lib/recommendations/engine'
import { GetRecommendationsQuerySchema } from '@/lib/validations/recommendation'
import { ApiError } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const queryResult = GetRecommendationsQuerySchema.safeParse({
      serviceType: searchParams.get('serviceType'),
      orgType: searchParams.get('orgType'),
      leadId: searchParams.get('leadId'),
    })

    if (!queryResult.success) {
      return ApiError.badRequest(queryResult.error.issues[0].message)
    }

    const { serviceType, orgType, leadId } = queryResult.data

    // If leadId provided, fetch full lead data
    let lead = null
    if (leadId) {
      lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          bookings: {
            select: { serviceType: true },
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          },
        },
      })

      if (!lead) {
        return ApiError.notFound('Lead not found')
      }
    }

    // Get recommendations
    const recommendations = await getRecommendations({
      lead: lead || { id: 'temp', bookings: [] },
      organizationType: orgType || 'UNKNOWN',
      campaignBooking: serviceType ? { serviceType } : null,
    })

    return NextResponse.json({
      recommendations: recommendations.map((rec) => ({
        serviceType: rec.serviceType,
        priority: rec.priority,
        reason: rec.reason,
        pitchPoints: rec.pitchPoints,
        templateId: rec.templateId,
      })),
    })
  } catch (error) {
    console.error('Recommendations API error:', error)
    return ApiError.internal('Failed to get recommendations')
  }
}
