import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

const commentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  body: z.string().min(1, 'Comment is required').max(2000),
})

// GET — public, returns approved comments for an issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const comments = await prisma.newsletterComment.findMany({
      where: { issueId: id, approved: true },
      select: { id: true, name: true, body: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST — public, submit a new comment (pending approval)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = commentSchema.parse(body)

    // Verify issue exists and is sent
    const issue = await prisma.newsletterIssue.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!issue || issue.status !== 'SENT') {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    await prisma.newsletterComment.create({
      data: {
        issueId: id,
        name: data.name,
        email: data.email,
        body: data.body,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Comment submitted! It will appear after approval.' },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
