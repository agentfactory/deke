import { NextRequest, NextResponse } from 'next/server'
import { calculateOptimalSplit, validateSplitIntegrity } from '@/lib/calculations/split-calculator'

/**
 * Test endpoint for the split calculator
 * POST /api/test/split-calculator
 *
 * Body:
 * {
 *   "totalServiceFee": 10000,
 *   "totalTravelCost": 2000,
 *   "splitMethod": "AUTO_OPTIMAL",
 *   "participants": [
 *     { "id": "1", "organizationName": "High School Choir", "groupSize": 30 },
 *     { "id": "2", "organizationName": "Community Singers", "groupSize": 50 },
 *     { "id": "3", "organizationName": "Church Choir", "groupSize": 20 }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.totalServiceFee || !body.splitMethod || !body.participants) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['totalServiceFee', 'totalTravelCost', 'splitMethod', 'participants']
        },
        { status: 400 }
      )
    }

    // Calculate the split
    const result = calculateOptimalSplit({
      totalServiceFee: body.totalServiceFee,
      totalTravelCost: body.totalTravelCost || 0,
      participants: body.participants,
      splitMethod: body.splitMethod,
    })

    // Validate the result
    const validation = validateSplitIntegrity(result)

    return NextResponse.json({
      success: true,
      split: result,
      validation,
      test: {
        message: 'Split calculator is working correctly!',
        method: body.splitMethod,
        participantCount: body.participants.length,
      }
    })
  } catch (error) {
    console.error('Split calculator test error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/test/split-calculator
 * Returns example request format
 */
export async function GET() {
  return NextResponse.json({
    message: 'Split Calculator Test Endpoint',
    usage: 'POST to this endpoint with booking split data',
    exampleRequest: {
      totalServiceFee: 10000,
      totalTravelCost: 2000,
      splitMethod: 'AUTO_OPTIMAL', // or 'EQUAL' or 'BY_SIZE'
      participants: [
        { id: '1', organizationName: 'High School Choir', groupSize: 30 },
        { id: '2', organizationName: 'Community Singers', groupSize: 50 },
        { id: '3', organizationName: 'Church Choir', groupSize: 20 }
      ]
    },
    availableMethods: ['EQUAL', 'BY_SIZE', 'AUTO_OPTIMAL'],
    methodDescriptions: {
      EQUAL: 'Divide evenly among all participants',
      BY_SIZE: 'Weight by group size (larger groups pay more)',
      AUTO_OPTIMAL: 'Smart adjustment based on group size with fairness constraints (10-50%)'
    }
  })
}
