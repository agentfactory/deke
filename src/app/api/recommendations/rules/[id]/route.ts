/**
 * Recommendation Rule Management API
 *
 * PATCH /api/recommendations/rules/[id] - Update a rule
 * DELETE /api/recommendations/rules/[id] - Deactivate a rule
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateServiceRecommendationSchema } from '@/lib/validations/recommendation'
import { ApiError } from '@/lib/api-error'
import { clearRecommendationCache } from '@/lib/recommendations/engine'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/recommendations/rules/[id]
 * Update an existing recommendation rule
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validation = UpdateServiceRecommendationSchema.safeParse(body)

    if (!validation.success) {
      return ApiError.badRequest(validation.error.issues[0].message)
    }

    const data = validation.data

    // Check if rule exists
    const existing = await prisma.serviceRecommendation.findUnique({
      where: { id },
    })

    if (!existing) {
      return ApiError.notFound('Rule not found')
    }

    // Update the rule
    const rule = await prisma.serviceRecommendation.update({
      where: { id },
      data: {
        name: data.name,
        triggerServiceType: data.triggerServiceType || undefined,
        recommendedService: data.recommendedService,
        orgTypes: data.orgTypes ? JSON.stringify(data.orgTypes) : undefined,
        minOrgSize: data.minOrgSize,
        maxOrgSize: data.maxOrgSize,
        weight: data.weight,
        priority: data.priority,
        pitchPoints: data.pitchPoints ? JSON.stringify(data.pitchPoints) : undefined,
        messageTemplate: data.messageTemplate,
        active: data.active,
      },
    })

    // Clear recommendation cache
    clearRecommendationCache()

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Update rule error:', error)
    return ApiError.internal('Failed to update rule')
  }
}

/**
 * DELETE /api/recommendations/rules/[id]
 * Deactivate a recommendation rule (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if rule exists
    const existing = await prisma.serviceRecommendation.findUnique({
      where: { id },
    })

    if (!existing) {
      return ApiError.notFound('Rule not found')
    }

    // Deactivate the rule (soft delete)
    await prisma.serviceRecommendation.update({
      where: { id },
      data: { active: false },
    })

    // Clear recommendation cache
    clearRecommendationCache()

    return NextResponse.json({
      success: true,
      message: 'Rule deactivated successfully',
    })
  } catch (error) {
    console.error('Delete rule error:', error)
    return ApiError.internal('Failed to delete rule')
  }
}
