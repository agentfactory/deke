# Post-Demo Implementation PRD
## Deke Sharon AI Agent Ecosystem - Full Integration

**Created:** January 14, 2026
**Status:** Ready for Implementation
**Timeline:** 2-3 days after demo
**Priority:** HIGH

---

## Executive Summary

This PRD outlines the implementation plan to connect the already-built Opportunity Finder system with Claude AI-powered agents (Harmony, MAESTRO, SCOUT, etc.) for Deke Sharon's lead generation and booking management platform.

**Current State:**
- ✅ Railway deployment successful
- ✅ Frontend UI complete (dashboard, campaigns, chat widget)
- ✅ Database schema designed (Prisma models ready)
- ✅ Opportunity Finder logic implemented (4 discovery sources, scoring algorithm)
- ✅ Agent architecture defined (12 agents, base classes, types)
- ❌ Supabase database unreachable (DNS provisioning issue)
- ❌ No Claude API integration
- ❌ Harmony widget not connected to backend
- ❌ Agent coordination not live

**Goal:**
Transform the demo-ready mockup into a fully functional AI agent system that:
1. Finds profitable opportunities from existing bookings
2. Coordinates multiple specialized agents
3. Increases trip profitability by 200%+
4. Provides 24/7 intelligent chat support

---

## Phase 1: Database Connection (Priority: CRITICAL)

### Issue
Supabase database created but unreachable at `db.jlxstrcjhjsoybacowiy.supabase.co:5432`

### Solution Steps

1. **Get Actual Connection Strings**
   - Visit: https://supabase.com/dashboard/project/jlxstrcjhjsoybacowiy
   - Go to Settings → Database
   - Copy BOTH connection strings:
     - **Transaction Mode** (port 6543, pooled): For app queries
     - **Session Mode** (port 5432, direct): For migrations

2. **Update Environment Variables**

   **Local `.env`:**
   ```env
   DATABASE_URL="[TRANSACTION MODE STRING]"
   DIRECT_URL="[SESSION MODE STRING]"
   ```

   **Railway:**
   ```bash
   railway variables --set "DATABASE_URL=[TRANSACTION MODE]"
   railway variables --set "DIRECT_URL=[SESSION MODE]"
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma db push
   ```

   **Expected Result:** Creates 15+ tables (Lead, Booking, Campaign, CampaignLead, ChatSession, etc.)

4. **Verify Connection**
   ```bash
   npx prisma studio
   ```

### Success Criteria
- ✅ `npx prisma db push` succeeds
- ✅ Prisma Studio opens and shows empty tables
- ✅ Can create test lead in database
- ✅ Railway deployment connects to database

---

## Phase 2: Claude API Integration (Priority: HIGH)

### Goal
Connect Harmony agent to Claude API for intelligent responses

### Implementation Steps

#### 2.1 Install Dependencies
```bash
npm install @anthropic-ai/sdk
```

#### 2.2 Get API Key
1. Visit: https://console.anthropic.com/settings/keys
2. Create API key
3. Add to environment variables:
   ```env
   ANTHROPIC_API_KEY="sk-ant-..."
   ```

#### 2.3 Create Chat API Endpoint

**File:** `src/app/api/chat/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { HarmonyAgent } from '@/agents/harmony'
import { prisma } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    // Get or create chat session
    let session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: { messages: true }
    })

    if (!session) {
      session = await prisma.chatSession.create({
        data: { sessionId, status: 'ACTIVE' }
      })
    }

    // Build conversation history
    const conversationHistory = session.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    // Initialize Harmony agent
    const harmony = new HarmonyAgent()
    await harmony.initialize({
      sessionId,
      conversationHistory,
      metadata: {}
    })

    // Process message with Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: harmony.getSystemPrompt(),
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    })

    const assistantMessage = response.content[0].text

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

    return NextResponse.json({
      message: assistantMessage,
      sessionId
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
```

#### 2.4 Connect Widget to Backend

**File:** `src/components/chat/harmony-widget.tsx`

**Replace line 71** (the TODO comment):

```typescript
// BEFORE:
// TODO: Integrate with backend API
const assistantMessage = getSimulatedResponse(userMessage.content)

// AFTER:
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage.content,
    sessionId: sessionId
  })
})

const data = await response.json()
const assistantMessage = data.message
```

### Success Criteria
- ✅ Harmony widget sends messages to `/api/chat`
- ✅ Claude API returns intelligent responses
- ✅ Messages saved to database
- ✅ Conversation history maintained across page reloads

---

## Phase 3: Opportunity Finder Integration (Priority: HIGH)

### Goal
Connect the fully-built Opportunity Finder system to live database

### Current Implementation

**Already Built:**
- ✅ Discovery engine: `src/lib/discovery/`
  - Past clients finder
  - Dormant leads finder
  - Similar organizations finder
  - AI research (stubbed for future)
- ✅ Scoring algorithm (0-100 points)
- ✅ Geographic utilities (haversine distance, bounding box)
- ✅ API endpoints: `/api/campaigns/*`
- ✅ Frontend UI: Campaign creation, lead management

### What's Missing
- Database connection (blocked by Phase 1)
- Seed data for testing
- Integration testing

### Implementation Steps

#### 3.1 Seed Test Data

**File:** `prisma/seed.ts` (UPDATE)

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample booking
  const lead = await prisma.lead.create({
    data: {
      firstName: 'Harvard',
      lastName: 'University',
      email: 'music@harvard.edu',
      organization: 'Harvard University Choir',
      source: 'website',
      status: 'WON',
      score: 85,
      latitude: 42.3736,
      longitude: -71.1097
    }
  })

  const booking = await prisma.booking.create({
    data: {
      leadId: lead.id,
      serviceType: 'WORKSHOP',
      status: 'CONFIRMED',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-15'),
      location: 'Boston, MA',
      latitude: 42.3601,
      longitude: -71.0589,
      amount: 8000,
      paymentStatus: 'PAID_IN_FULL'
    }
  })

  // Create dormant leads (not contacted in 6+ months)
  const dormantLeads = [
    {
      firstName: 'MIT',
      lastName: 'A Cappella',
      email: 'acappella@mit.edu',
      organization: 'MIT Logarhythms',
      latitude: 42.3601,
      longitude: -71.0942,
      lastContactedAt: new Date('2025-06-01'),
      status: 'QUALIFIED'
    },
    {
      firstName: 'Boston',
      lastName: 'Conservatory',
      email: 'vocal@bostonconservatory.edu',
      organization: 'Boston Conservatory',
      latitude: 42.3467,
      longitude: -71.0887,
      lastContactedAt: new Date('2025-05-15'),
      status: 'CONTACTED'
    }
  ]

  for (const leadData of dormantLeads) {
    await prisma.lead.create({ data: leadData })
  }

  console.log('✅ Seed data created')
  console.log(`- 1 booking in Boston`)
  console.log(`- 3 leads (1 won, 2 dormant)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Run seed:**
```bash
npx prisma db seed
```

#### 3.2 Test Discovery Flow

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to dashboard
http://localhost:3000/dashboard

# 3. Create campaign
- Click "New Campaign"
- Name: "Boston Workshop Expansion"
- Location: "Boston, MA"
- Radius: 100 miles
- Click "Create & Discover Leads"

# 4. Verify results
- Should find 2+ leads (Harvard, MIT, Boston Conservatory)
- Scores should be 70-95 range
- Distance should be accurate (<100 miles)
```

#### 3.3 Test Harmony Integration

```bash
# Open chat widget
# Type: "I have a workshop in Boston next month. How can I maximize revenue?"

# Expected response:
# "I analyzed your Boston workshop and found 12 potential opportunities
# within 100 miles. These include past clients like Harvard University
# and similar organizations. Would you like me to coordinate with MAESTRO
# to send personalized quotes?"
```

### Success Criteria
- ✅ Campaign creation works
- ✅ Discovery finds 10+ leads
- ✅ Leads are scored correctly (0-100)
- ✅ Geographic distance accurate
- ✅ Harmony mentions discovered opportunities
- ✅ Revenue projection shows 200%+ increase

---

## Phase 4: Agent Coordination (Priority: MEDIUM)

### Goal
Enable agents to hand off work and coordinate

### Current State
- ✅ Agent base class defined
- ✅ Event system designed
- ❌ Event bus not implemented (only console.log)
- ❌ No actual handoffs between agents

### Implementation Steps

#### 4.1 Create Event Bus

**File:** `src/lib/event-bus.ts` (NEW)

```typescript
import { PrismaClient } from '@prisma/client'
import { AgentEvent } from '@/agents/types'

const prisma = new PrismaClient()

class EventBus {
  private handlers = new Map<string, Set<Function>>()

  subscribe(eventType: string, handler: Function) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)
  }

  async emit(event: AgentEvent) {
    // Log to database
    await prisma.agentLog.create({
      data: {
        agentId: event.sourceAgent,
        actionType: event.eventType,
        input: JSON.stringify(event.payload),
        success: true
      }
    })

    // Call handlers
    const handlers = this.handlers.get(event.eventType)
    if (handlers) {
      for (const handler of handlers) {
        await handler(event)
      }
    }
  }
}

export const eventBus = new EventBus()
```

#### 4.2 Update Base Agent

**File:** `agents/base-agent.ts`

**Replace `emitEvent` method:**

```typescript
import { eventBus } from '@/lib/event-bus'

async emitEvent(
  eventType: string,
  payload: Record<string, unknown>,
  targetAgent?: string
): Promise<void> {
  const event: AgentEvent = {
    eventId: crypto.randomUUID(),
    sourceAgent: this.config.id,
    targetAgent,
    eventType,
    payload,
    timestamp: new Date()
  }

  await eventBus.emit(event)
}
```

#### 4.3 Implement Agent Handoffs

**Example: Harmony → MAESTRO handoff**

```typescript
// In Harmony agent when user asks for quote
if (intent === 'quote') {
  // Capture lead info first
  const leadId = await this.executeTool('captureLeadInfo', {
    email: extractedEmail,
    name: extractedName
  })

  // Hand off to MAESTRO for quote
  await this.emitEvent('handoff', {
    leadId,
    serviceType: 'ARRANGEMENT',
    reason: 'User requested pricing quote'
  }, 'maestro')

  return {
    message: "I've connected you with MAESTRO, our arrangement specialist...",
    handoff: 'maestro'
  }
}
```

### Success Criteria
- ✅ Events logged to database
- ✅ Harmony can hand off to MAESTRO
- ✅ Agent logs show coordination
- ✅ User sees seamless transition

---

## Phase 5: Specialized Agents (Priority: LOW)

### Goal
Implement MAESTRO, CONDUCTOR, SCOUT agents

### Agents to Build

1. **MAESTRO** - Arrangement quotes
   - Calculates pricing based on voice parts, urgency, package tier
   - Sends personalized quotes via email
   - Follows up on quote status

2. **CONDUCTOR** - Workshop/coaching bookings
   - Checks Deke's calendar availability
   - Books consultations
   - Sends confirmation emails

3. **SCOUT** - Opportunity finder coordinator
   - Monitors upcoming bookings
   - Automatically triggers opportunity discovery
   - Alerts when high-value leads found

### Implementation Template

Each agent follows same pattern as Harmony:

```typescript
// agents/maestro/index.ts
import { BaseAgent } from '../base-agent'
import { AgentConfig } from '../types'

const MAESTRO_CONFIG: AgentConfig = {
  id: 'maestro',
  name: 'MAESTRO',
  tier: 'sales-booking',
  description: 'Arrangement specialist providing instant quotes',
  systemPrompt: `You are MAESTRO, Deke Sharon's arrangement specialist...`,
  tools: ['calculateQuote', 'sendQuote', 'trackQuoteStatus'],
  triggers: [
    { type: 'event', config: { event: 'handoff_from_harmony' } }
  ]
}

export class MaestroAgent extends BaseAgent {
  constructor() {
    super(MAESTRO_CONFIG)
    this.registerTools()
  }

  private registerTools() {
    this.registerTool({
      name: 'calculateQuote',
      description: 'Calculate arrangement pricing',
      parameters: { /* ... */ },
      execute: async (params) => { /* ... */ }
    })
  }

  async processMessage(message: string) {
    // MAESTRO-specific logic
  }
}
```

---

## Technical Architecture

### System Diagram

```
┌─────────────────┐
│   User/Widget   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  /api/chat      │
│  (Next.js API)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Harmony Agent  │──────│  Claude API      │
│  (Coordinator)  │      │  (Intelligence)  │
└────────┬────────┘      └──────────────────┘
         │
         ├───[handoff]───▶ MAESTRO (quotes)
         ├───[handoff]───▶ CONDUCTOR (bookings)
         └───[trigger]───▶ SCOUT (opportunities)
```

### Database Schema (Already Built)

**Core Models:**
- Lead (customers)
- Booking (confirmed bookings)
- Campaign (opportunity campaigns)
- CampaignLead (discovered opportunities)
- ChatSession (widget conversations)
- ChatMessage (individual messages)
- AgentLog (agent action tracking)
- AgentMemory (persistent context)

### Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui components

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)

**AI:**
- Claude 3.5 Sonnet (Anthropic)
- Custom agent orchestration

**Infrastructure:**
- Railway (hosting)
- Supabase (database)
- Resend (email)
- Twilio (SMS)

---

## Testing Plan

### Unit Tests
```bash
# Test discovery algorithms
npm test src/lib/discovery

# Test scoring algorithm
npm test src/lib/discovery/score-leads.test.ts

# Test agent base class
npm test agents/base-agent.test.ts
```

### Integration Tests
```bash
# Test full opportunity finder flow
npm test src/app/api/campaigns

# Test chat endpoint
npm test src/app/api/chat

# Test agent coordination
npm test agents/integration.test.ts
```

### Manual Testing Checklist
- [ ] Create campaign → Discover leads → Verify results
- [ ] Chat with Harmony → Get intelligent response
- [ ] Ask about opportunities → See coordination with SCOUT
- [ ] Request quote → Verify handoff to MAESTRO
- [ ] Book consultation → Verify handoff to CONDUCTOR
- [ ] Check AgentLog → See all actions logged

---

## Deployment Checklist

### Before Deploying
- [ ] Fix Supabase connection
- [ ] Run database migrations (`npx prisma db push`)
- [ ] Seed test data (`npx prisma db seed`)
- [ ] Add Claude API key to Railway
- [ ] Test locally (`npm run dev`)
- [ ] Run tests (`npm test`)

### Deploy to Railway
```bash
git add .
git commit -m "feat: Complete Claude agent integration"
git push origin main
```

### Verify Production
- [ ] Visit Railway URL
- [ ] Test chat widget
- [ ] Create test campaign
- [ ] Verify database connection
- [ ] Check error logs

---

## Success Metrics

### Demo Success
- ✅ Shows 10+ discovered opportunities
- ✅ Displays 200%+ revenue increase
- ✅ Harmony responds intelligently
- ✅ Visual agent coordination
- ✅ Professional UI/UX

### Production Success
- ✅ <2s response time for chat
- ✅ >30 leads discovered per campaign
- ✅ 70+ average lead score
- ✅ Zero crashes or errors
- ✅ All agents logging properly

---

## Timeline

**Phase 1 (Database):** 2-4 hours
**Phase 2 (Claude API):** 3-4 hours
**Phase 3 (Opportunity Finder):** 2-3 hours
**Phase 4 (Agent Coordination):** 4-6 hours
**Phase 5 (Specialized Agents):** 8-12 hours per agent

**Total MVP (Phases 1-3):** 1-2 days
**Full System (Phases 1-5):** 5-7 days

---

## Open Questions

1. **Supabase Connection:** Why is DNS not resolving? Need to check actual hostname from dashboard.
2. **Claude API Limits:** What's the budget for API calls? Need rate limiting?
3. **Agent Personalities:** Final approval on system prompts for each agent?
4. **Email Provider:** Confirmed Resend for production? API key available?
5. **Calendar Integration:** Need access to Deke's real calendar for CONDUCTOR?

---

## Resources

**Documentation:**
- Prisma: https://www.prisma.io/docs
- Claude API: https://docs.anthropic.com
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

**Project Files:**
- Database schema: `prisma/schema.prisma`
- Agent system: `agents/`
- Discovery engine: `src/lib/discovery/`
- Chat widget: `src/components/chat/harmony-widget.tsx`

**Deployment:**
- Railway: https://railway.app/project/[your-project]
- Supabase: https://supabase.com/dashboard/project/jlxstrcjhjsoybacowiy
- GitHub: https://github.com/agentfactory/deke

---

## Next Actions (After Demo)

1. **Immediate (Day 1):**
   - Fix Supabase connection string
   - Run migrations
   - Test basic CRUD operations

2. **Short-term (Days 2-3):**
   - Install Claude SDK
   - Create /api/chat endpoint
   - Connect Harmony widget
   - Test full chat flow

3. **Medium-term (Week 1):**
   - Seed production data
   - Deploy to Railway
   - Build MAESTRO agent
   - Test opportunity finder

4. **Long-term (Weeks 2-4):**
   - Build remaining agents
   - Add analytics dashboard
   - Optimize performance
   - Launch to users

---

**Last Updated:** January 14, 2026
**Status:** Ready for Implementation
**Owner:** Development Team
**Reviewer:** Product Team
