/**
 * Recommendation Rules API
 *
 * GET /api/recommendations/rules - List all rules
 * POST /api/recommendations/rules - Create a new rule
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateServiceRecommendationSchema } from '@/lib/validations/recommendation'
import { ApiError } from '@/lib/api-error'
import { clearRecommendationCache } from '@/lib/recommendations/engine'

/**
 * GET /api/recommendations/rules
 * List all recommendation rules
 */
export async function GET() {
  try {
    const rules = await prisma.serviceRecommendation.findMany({
      where: { active: true },
      orderBy: [{ priority: 'desc' }, { weight: 'desc' }],
    })

    return NextResponse.json({
      rules: rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        triggerServiceType: rule.triggerServiceType,
        recommendedService: rule.recommendedService,
        orgTypes: rule.orgTypes ? JSON.parse(rule.orgTypes) : null,
        minOrgSize: rule.minOrgSize,
        maxOrgSize: rule.maxOrgSize,
        weight: rule.weight,
        priority: rule.priority,
        pitchPoints: rule.pitchPoints ? JSON.parse(rule.pitchPoints) : [],
        messageTemplate: rule.messageTemplate,
        active: rule.active,
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
      })),
    })
  } catch (error) {
    console.error('List rules error:', error)
    return ApiError.internal('Failed to list rules')
  }
}

/**
 * POST /api/recommendations/rules
 * Create a new recommendation rule
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = CreateServiceRecommendationSchema.safeParse(body)

    if (!validation.success) {
      return ApiError.badRequest(validation.error.issues[0].message)
    }

    const data = validation.data

    // Check for duplicate rule name
    const existing = await prisma.serviceRecommendation.findFirst({
      where: { name: data.name },
    })

    if (existing) {
      return ApiError.badRequest('A rule with this name already exists')
    }

    // Create the rule
    const rule = await prisma.serviceRecommendation.create({
      data: {
        name: data.name,
        triggerServiceType: data.triggerServiceType || null,
        recommendedService: data.recommendedService,
        orgTypes: data.orgTypes ? JSON.stringify(data.orgTypes) : null,
        minOrgSize: data.minOrgSize || null,
        maxOrgSize: data.maxOrgSize || null,
        weight: data.weight,
        priority: data.priority,
        pitchPoints: data.pitchPoints ? JSON.stringify(data.pitchPoints) : null,
        messageTemplate: data.messageTemplate || null,
        active: data.active,
      },
    })

    // Clear recommendation cache
    clearRecommendationCache()

    return NextResponse.json(
      {
        rule: {
          id: rule.id,
          name: rule.name,
          triggerServiceType: rule.triggerServiceType,
          recommendedService: rule.recommendedService,
          orgTypes: rule.orgTypes ? JSON.parse(rule.orgTypes) : null,
          weight: rule.weight,
          priority: rule.priority,
          pitchPoints: rule.pitchPoints ? JSON.parse(rule.pitchPoints) : [],
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create rule error:', error)
    return ApiError.internal('Failed to create rule')
  }
}
