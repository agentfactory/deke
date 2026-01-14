/**
 * Template Context Enrichment
 *
 * Enriches template variables with recommendation data for personalized messaging
 */

import type { RecommendationMatch } from './engine'

export interface EnrichedTemplateContext {
  // Standard variables
  firstName: string
  lastName: string
  organization: string
  email: string
  phone: string

  // Recommendation variables
  recommendedServices: string[]
  recommendationReason: string
  pitchPoints: string[]
  topRecommendation: string
  hasRecommendations: boolean
}

/**
 * Build enriched template context with recommendation data
 *
 * @param lead - The lead data
 * @param recommendations - Array of recommendation matches
 * @returns Enriched context for template rendering
 */
export function buildTemplateContext(
  lead: {
    firstName: string
    lastName: string
    organization?: string | null
    email: string
    phone?: string | null
  },
  recommendations: RecommendationMatch[]
): EnrichedTemplateContext {
  // Format service types for display
  const formatServiceType = (serviceType: string): string => {
    return serviceType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Collect all unique pitch points from recommendations
  const allPitchPoints = recommendations.flatMap((r) => r.pitchPoints)
  const uniquePitchPoints = [...new Set(allPitchPoints)]

  return {
    // Standard variables
    firstName: lead.firstName,
    lastName: lead.lastName,
    organization: lead.organization || `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    phone: lead.phone || '',

    // Recommendation variables
    recommendedServices: recommendations.map((r) => formatServiceType(r.serviceType)),
    recommendationReason: recommendations.length > 0 ? recommendations[0].reason : '',
    pitchPoints: uniquePitchPoints.slice(0, 5), // Max 5 pitch points
    topRecommendation: recommendations.length > 0 ? formatServiceType(recommendations[0].serviceType) : '',
    hasRecommendations: recommendations.length > 0,
  }
}

/**
 * Build template context from CampaignLead data
 *
 * @param campaignLead - Campaign lead with recommendations stored
 * @returns Enriched context for template rendering
 */
export function buildTemplateContextFromCampaignLead(campaignLead: {
  lead: {
    firstName: string
    lastName: string
    organization?: string | null
    email: string
    phone?: string | null
  }
  recommendedServices?: string | null
  recommendationReason?: string | null
}): Partial<EnrichedTemplateContext> {
  const lead = campaignLead.lead

  // Parse recommended services from JSON
  const recommendedServices: string[] = campaignLead.recommendedServices
    ? JSON.parse(campaignLead.recommendedServices)
    : []

  // Format service types for display
  const formatServiceType = (serviceType: string): string => {
    return serviceType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formattedServices = recommendedServices.map(formatServiceType)

  return {
    // Standard variables
    firstName: lead.firstName,
    lastName: lead.lastName,
    organization: lead.organization || `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    phone: lead.phone || '',

    // Recommendation variables
    recommendedServices: formattedServices,
    recommendationReason: campaignLead.recommendationReason || '',
    topRecommendation: formattedServices.length > 0 ? formattedServices[0] : '',
    hasRecommendations: recommendedServices.length > 0,
  }
}

/**
 * Substitute template variables with actual values
 *
 * Supports both {{variable}} and {{#array}}...{{/array}} syntax
 *
 * @param template - Template string with variables
 * @param context - Context object with variable values
 * @returns Rendered template string
 */
export function renderTemplate(template: string, context: Record<string, any>): string {
  let rendered = template

  // Handle array loops: {{#pitchPoints}}...{{/pitchPoints}}
  const arrayLoopRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g
  rendered = rendered.replace(arrayLoopRegex, (_, arrayName, loopContent) => {
    const arrayValue = context[arrayName]

    if (!Array.isArray(arrayValue) || arrayValue.length === 0) {
      return ''
    }

    return arrayValue
      .map((item) => {
        // Replace {{.}} with array item value
        return loopContent.replace(/\{\{\.\}\}/g, String(item))
      })
      .join('')
  })

  // Handle conditional blocks: {{#hasRecommendations}}...{{/hasRecommendations}}
  const conditionalRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g
  rendered = rendered.replace(conditionalRegex, (_, conditionName, content) => {
    const conditionValue = context[conditionName]

    if (conditionValue) {
      return content
    }

    return ''
  })

  // Handle simple variable substitution: {{variable}}
  const variableRegex = /\{\{(\w+)\}\}/g
  rendered = rendered.replace(variableRegex, (_, varName) => {
    const value = context[varName]

    if (value === undefined || value === null) {
      return ''
    }

    if (Array.isArray(value)) {
      return value.join(', ')
    }

    return String(value)
  })

  return rendered
}
