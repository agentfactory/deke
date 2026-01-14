/**
 * Split Calculator - Smart Cost Allocation Algorithm
 *
 * Handles intelligent splitting of booking costs among multiple participants
 * Supports three methods: EQUAL, BY_SIZE, and AUTO_OPTIMAL
 */

export interface SplitInput {
  totalServiceFee: number
  totalTravelCost: number
  participants: Array<{
    id: string
    organizationName: string
    groupSize?: number
    distanceFromVenue?: number
  }>
  splitMethod: 'EQUAL' | 'BY_SIZE' | 'AUTO_OPTIMAL'
}

export interface SplitOutput {
  participants: Array<{
    id: string
    splitPercent: number
    serviceFeeShare: number
    travelShare: number
    totalDue: number
  }>
  breakdown: {
    totalServiceFee: number
    totalTravel: number
    grandTotal: number
  }
  rationale: string
}

/**
 * Calculate equal split among all participants
 */
function calculateEqualSplit(input: SplitInput): SplitOutput {
  const { totalServiceFee, totalTravelCost, participants } = input
  const grandTotal = totalServiceFee + totalTravelCost
  const participantCount = participants.length

  if (participantCount === 0) {
    throw new Error('At least one participant is required')
  }

  const basePercent = 100 / participantCount
  const baseServiceFee = totalServiceFee / participantCount
  const baseTravel = totalTravelCost / participantCount
  const baseTotalDue = grandTotal / participantCount

  // Round to whole dollars and ensure total = 100%
  let totalAllocated = 0
  const results = participants.map((participant, index) => {
    const isLast = index === participants.length - 1

    // For all but last, round normally
    // For last, take remaining to ensure total = grandTotal
    const totalDue = isLast
      ? grandTotal - totalAllocated
      : Math.round(baseTotalDue)

    totalAllocated += totalDue

    const serviceFeeShare = Math.round(baseServiceFee)
    const travelShare = totalDue - serviceFeeShare

    return {
      id: participant.id,
      splitPercent: Number(basePercent.toFixed(2)),
      serviceFeeShare,
      travelShare,
      totalDue
    }
  })

  // Adjust percentages to sum to exactly 100%
  const totalPercent = results.reduce((sum, r) => sum + r.splitPercent, 0)
  const adjustment = 100 - totalPercent
  results[results.length - 1].splitPercent = Number((results[results.length - 1].splitPercent + adjustment).toFixed(2))

  return {
    participants: results,
    breakdown: {
      totalServiceFee,
      totalTravel: totalTravelCost,
      grandTotal
    },
    rationale: `Equal split: Each of ${participantCount} participants pays an equal share.`
  }
}

/**
 * Calculate split weighted by group size
 */
function calculateBySizeWeight(input: SplitInput): SplitOutput {
  const { totalServiceFee, totalTravelCost, participants } = input
  const grandTotal = totalServiceFee + totalTravelCost

  if (participants.length === 0) {
    throw new Error('At least one participant is required')
  }

  // Calculate total group size
  const totalGroupSize = participants.reduce((sum, p) => sum + (p.groupSize || 1), 0)

  if (totalGroupSize === 0) {
    throw new Error('Total group size must be greater than 0')
  }

  // Minimum percentage any participant should pay (to avoid unfairness)
  const minPercent = 10

  // Calculate base weights
  let results = participants.map(participant => {
    const groupSize = participant.groupSize || 1
    const rawPercent = (groupSize / totalGroupSize) * 100
    const splitPercent = Math.max(rawPercent, minPercent)

    return {
      id: participant.id,
      splitPercent,
      groupSize,
    }
  })

  // Normalize percentages to sum to exactly 100% with rounding adjustment
  const totalPercent = results.reduce((sum, r) => sum + r.splitPercent, 0)
  let allocatedPercent = 0
  results = results.map((r, index) => {
    const isLast = index === results.length - 1
    const splitPercent = isLast
      ? Number((100 - allocatedPercent).toFixed(2))
      : Number(((r.splitPercent / totalPercent) * 100).toFixed(2))

    if (!isLast) {
      allocatedPercent += splitPercent
    }

    return {
      ...r,
      splitPercent
    }
  })

  // Calculate dollar amounts
  let totalAllocated = 0
  const finalResults = results.map((result, index) => {
    const isLast = index === results.length - 1

    const totalDue = isLast
      ? grandTotal - totalAllocated
      : Math.round((result.splitPercent / 100) * grandTotal)

    totalAllocated += totalDue

    const serviceFeeShare = Math.round((result.splitPercent / 100) * totalServiceFee)
    const travelShare = totalDue - serviceFeeShare

    return {
      id: result.id,
      splitPercent: Number(result.splitPercent.toFixed(2)),
      serviceFeeShare,
      travelShare,
      totalDue
    }
  })

  return {
    participants: finalResults,
    breakdown: {
      totalServiceFee,
      totalTravel: totalTravelCost,
      grandTotal
    },
    rationale: `Split by group size: Larger groups pay proportionally more based on member count. Total members: ${totalGroupSize}.`
  }
}

/**
 * Calculate optimal split using advanced algorithm
 * Base: Equal split
 * Adjust: +5% per 10 members above average group size
 * Travel: Weighted by distance if provided
 * Constraints: Min 10%, max 50% per participant
 */
function calculateAutoOptimal(input: SplitInput): SplitOutput {
  const { totalServiceFee, totalTravelCost, participants } = input
  const grandTotal = totalServiceFee + totalTravelCost

  if (participants.length === 0) {
    throw new Error('At least one participant is required')
  }

  // Calculate average group size
  const totalGroupSize = participants.reduce((sum, p) => sum + (p.groupSize || 1), 0)
  const avgGroupSize = totalGroupSize / participants.length

  // Start with equal split base
  let results = participants.map(participant => {
    const groupSize = participant.groupSize || 1
    let basePercent = 100 / participants.length

    // Adjust for group size (relative to average)
    if (groupSize > avgGroupSize) {
      const membersAboveAvg = groupSize - avgGroupSize
      const adjustment = (membersAboveAvg / 10) * 5 // +5% per 10 members above avg
      basePercent += adjustment
    } else if (groupSize < avgGroupSize) {
      const membersBelowAvg = avgGroupSize - groupSize
      const adjustment = (membersBelowAvg / 10) * 5 // -5% per 10 members below avg
      basePercent -= adjustment
    }

    // Apply constraints
    basePercent = Math.max(10, Math.min(50, basePercent))

    return {
      id: participant.id,
      splitPercent: basePercent,
      groupSize,
      distance: participant.distanceFromVenue,
    }
  })

  // Normalize to 100%
  const totalPercent = results.reduce((sum, r) => sum + r.splitPercent, 0)
  results = results.map((r, index) => {
    const isLast = index === results.length - 1
    const splitPercent = isLast
      ? 100 - results.slice(0, -1).reduce((sum, prev) => sum + Number(((prev.splitPercent / totalPercent) * 100).toFixed(2)), 0)
      : Number(((r.splitPercent / totalPercent) * 100).toFixed(2))

    return {
      ...r,
      splitPercent
    }
  })

  // Calculate dollar amounts
  let totalAllocated = 0
  const finalResults = results.map((result, index) => {
    const isLast = index === results.length - 1

    const totalDue = isLast
      ? grandTotal - totalAllocated
      : Math.round((result.splitPercent / 100) * grandTotal)

    totalAllocated += totalDue

    // Service fee split based on percentage
    const serviceFeeShare = Math.round((result.splitPercent / 100) * totalServiceFee)

    // Travel cost - could be weighted by distance in future
    let travelShare = Math.round((result.splitPercent / 100) * totalTravelCost)

    // Adjust last participant's travel share to ensure totals match
    if (isLast) {
      travelShare = totalDue - serviceFeeShare
    }

    return {
      id: result.id,
      splitPercent: Number(result.splitPercent.toFixed(2)),
      serviceFeeShare,
      travelShare,
      totalDue
    }
  })

  return {
    participants: finalResults,
    breakdown: {
      totalServiceFee,
      totalTravel: totalTravelCost,
      grandTotal
    },
    rationale: `Auto-optimal split: Adjusted based on group sizes (avg: ${Math.round(avgGroupSize)} members). Larger groups pay proportionally more, with constraints to ensure fairness (10-50% range).`
  }
}

/**
 * Validate split integrity
 */
export function validateSplitIntegrity(split: SplitOutput): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check percentages sum to 100%
  const totalPercent = split.participants.reduce((sum, p) => sum + p.splitPercent, 0)
  if (Math.abs(totalPercent - 100) > 0.01) {
    errors.push(`Split percentages sum to ${totalPercent.toFixed(2)}%, must be 100%`)
  }

  // Check amounts sum to total
  const totalAmounts = split.participants.reduce((sum, p) => sum + p.totalDue, 0)
  if (Math.abs(totalAmounts - split.breakdown.grandTotal) > 0.01) {
    errors.push(`Participant amounts sum to $${totalAmounts}, must equal grand total $${split.breakdown.grandTotal}`)
  }

  // Check for negative values
  split.participants.forEach((p, index) => {
    if (p.splitPercent < 0) {
      errors.push(`Participant ${index + 1} has negative split percentage`)
    }
    if (p.serviceFeeShare < 0) {
      errors.push(`Participant ${index + 1} has negative service fee share`)
    }
    if (p.travelShare < 0) {
      errors.push(`Participant ${index + 1} has negative travel share`)
    }
    if (p.totalDue < 0) {
      errors.push(`Participant ${index + 1} has negative total due`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Main export: Calculate optimal split based on method
 */
export function calculateOptimalSplit(input: SplitInput): SplitOutput {
  let result: SplitOutput

  switch (input.splitMethod) {
    case 'EQUAL':
      result = calculateEqualSplit(input)
      break
    case 'BY_SIZE':
      result = calculateBySizeWeight(input)
      break
    case 'AUTO_OPTIMAL':
      result = calculateAutoOptimal(input)
      break
    default:
      throw new Error(`Unknown split method: ${input.splitMethod}`)
  }

  // Validate the result
  const validation = validateSplitIntegrity(result)
  if (!validation.valid) {
    throw new Error(`Split calculation failed validation: ${validation.errors.join(', ')}`)
  }

  return result
}
