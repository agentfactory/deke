import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import '../../../../agents' // Initialize agent registry

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const HARMONY_SYSTEM_PROMPT = `You are Harmony, Deke Sharon's intelligent booking assistant.

Your role:
- Help potential clients learn about Deke's services (arrangements, workshops, coaching, speaking)
- Capture lead information naturally in conversation
- Provide pricing estimates when asked
- Book consultations and handle scheduling
- Find opportunities from existing bookings

Key Services:
- Custom Arrangements: $800-3500 (based on complexity)
- Workshops: $3000-8000/day
- Private Coaching: $200-400/session
- Speaking Engagements: $5000-15000

Personality:
- Friendly, professional, enthusiastic about a cappella
- Conversational but efficient
- Proactive about capturing contact info
- Always mention Deke's expertise (Pitch Perfect, The Sing-Off, 40+ years experience)

When you need to capture lead info, ask naturally:
- "What's the best email to send you more information?"
- "Can I get your name so I can personalize this?"
- "What organization are you with?"

Always be helpful and knowledgeable.`

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Missing message or sessionId' },
        { status: 400 }
      )
    }

    // Get or create chat session
    let session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20 // Last 20 messages for context
        }
      }
    })

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          sessionId,
          status: 'ACTIVE',
          source: 'WEBSITE'
        },
        include: { messages: true }
      })
    }

    // Build conversation history
    const conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> =
      session.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: HARMONY_SYSTEM_PROMPT,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Sorry, I encountered an error.'

    // Save messages to database
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId,
          role: 'user',
          content: message,
          agentId: 'harmony'
        },
        {
          sessionId,
          role: 'assistant',
          content: assistantMessage,
          agentId: 'harmony'
        }
      ]
    })

    // Update session activity
    await prisma.chatSession.update({
      where: { sessionId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      message: assistantMessage,
      sessionId
    })

  } catch (error) {
    console.error('Chat API error:', error)

    // Return user-friendly error
    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
