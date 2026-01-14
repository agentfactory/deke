# How Deke Interacts with Harmony (Current vs. Planned)

---

## 🎯 Current Reality (Phase 4)

### **Harmony is Customer-Facing Only**

**What Exists:**
- ✅ **Harmony Chat Widget** on public website (bottom-right corner)
- ✅ **Customers** chat with Harmony to ask questions, get quotes, book consultations
- ✅ **Database** logs all conversations (ChatSession, ChatMessage tables)
- ✅ **Agent Coordination** working (Harmony → MAESTRO → CONDUCTOR → SCOUT)

**What's Missing:**
- ❌ **No interface for Deke to see Harmony's conversations**
- ❌ **No way for Deke to monitor what Harmony is saying**
- ❌ **No way for Deke to take over a conversation**
- ❌ **No notifications when Harmony captures a hot lead**

### **Current Workflow (Customer Side):**

```
Customer visits website
    ↓
Opens Harmony chat widget
    ↓
"I need a custom arrangement for my choir"
    ↓
Harmony responds (via Claude API)
    ↓
Harmony captures lead info
    ↓
Harmony hands off to MAESTRO
    ↓
Conversation saved to database
    ↓
[Deke has no visibility into this] ❌
```

---

## 🏗️ What SHOULD Exist (Missing Features)

### **1. Conversation Monitoring Dashboard**

**Location:** `/dashboard/conversations` (doesn't exist yet)

**Features Needed:**
- 📊 **Live feed** of all Harmony conversations
- 🔴 **Real-time indicator** when someone is chatting
- 📝 **Full transcript** of each conversation
- 🏷️ **Lead tags** (hot, warm, cold)
- 🚨 **Priority alerts** for high-value leads
- 💬 **Take over** button to jump into a conversation

**UI Mockup:**
```
┌─────────────────────────────────────────┐
│  Active Conversations (2)                │
├─────────────────────────────────────────┤
│ 🔴 Sarah Johnson (Harvard Choir)         │
│    "I need an arrangement for..."        │
│    [View] [Take Over]                    │
├─────────────────────────────────────────┤
│ 🟡 Mike Chen (Stanford A Cappella)       │
│    "What's your coaching rate?"          │
│    [View] [Take Over]                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Recent Conversations (23 today)         │
├─────────────────────────────────────────┤
│ ✅ Emily Davis - Quote sent              │
│ ✅ John Smith - Booked consultation      │
│ ⏸️ Alex Wong - Needs follow-up           │
└─────────────────────────────────────────┘
```

---

### **2. Agent Activity Dashboard**

**Location:** `/dashboard/agents` (doesn't exist yet)

**Features Needed:**
- 🤖 **Status of each agent** (harmony, maestro, conductor, scout)
- 📈 **Activity metrics** (handoffs, responses, quotes sent)
- 📊 **Performance stats** (response time, success rate)
- 🔔 **Recent actions** feed from AgentLog table

**UI Mockup:**
```
┌────────────────────────────────────────┐
│  Agent Status                           │
├────────────────────────────────────────┤
│ 🟢 Harmony    Active | 12 chats today  │
│ 🟢 MAESTRO    Active | 5 quotes sent   │
│ 🟢 CONDUCTOR  Active | 3 bookings      │
│ 🟡 SCOUT      Idle   | 0 discoveries   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Recent Agent Activity (AgentLog)       │
├────────────────────────────────────────┤
│ 2 min ago: Harmony → MAESTRO handoff   │
│ 5 min ago: MAESTRO sent quote          │
│ 12 min ago: CONDUCTOR booked session   │
└────────────────────────────────────────┘
```

---

### **3. Lead Notification System**

**Features Needed:**
- 📧 **Email alerts** when hot lead captured
- 📱 **SMS alerts** for urgent opportunities
- 🔔 **Dashboard notifications** badge
- ⚡ **Slack integration** (optional)

**Example Alert:**
```
🔥 HOT LEAD CAPTURED

Sarah Johnson
Harvard University Choir
sarah@harvard.edu

Interested in: Custom arrangement ($1,500-$3,000)
Timeline: Urgent (2 weeks)
Budget: Confirmed

[View Conversation] [Contact Now]
```

---

### **4. Manual Override System**

**Features Needed:**
- 🎛️ **Pause Harmony** (stop auto-responses)
- 💬 **Take over conversation** (Deke responds directly)
- 🔄 **Resume Harmony** (hand back to AI)
- 📝 **Leave notes** for Harmony's context

**Use Case:**
> "A VIP client messages. Deke sees the alert, clicks 'Take Over', and responds personally. Harmony pauses and waits. When done, Deke clicks 'Resume' and Harmony continues with full context of what happened."

---

## 📋 Current Dashboard (What Deke CAN Do)

### **Existing Dashboard Features:**

**1. Campaign Management** ✅
- **Location:** `/dashboard/campaigns`
- **Purpose:** Create and manage lead discovery campaigns
- **Features:**
  - Create new campaigns (location + radius)
  - View discovered leads on map
  - Send bulk emails/SMS to leads
  - Approve campaigns before launch

**2. Campaign Details** ✅
- **Location:** `/dashboard/campaigns/[id]`
- **Purpose:** Manage individual campaign
- **Features:**
  - Interactive map with leads
  - Lead table with sorting/filtering
  - Message templates (11 pre-written)
  - Bulk actions (select all, filter by score)
  - Launch outreach campaigns

**3. Analytics Dashboard** ✅
- **Location:** `/dashboard/analytics`
- **Purpose:** View performance metrics
- **Features:**
  - Revenue projections
  - Lead conversion rates
  - Campaign performance
  - Geographic distribution

**4. Main Dashboard** ✅
- **Location:** `/dashboard`
- **Purpose:** Overview of all activity
- **Features:**
  - Campaign stats
  - Recent campaigns
  - Quick actions
  - Lead counts

---

## 🔄 How It SHOULD Work (Ideal Workflow)

### **Scenario: Customer Asks for Quote**

```
1. Customer: "I need a custom arrangement"
   → Harmony captures request
   → Shows in Deke's dashboard immediately

2. Harmony: Qualifies the lead
   → Asks about voice parts, timeline, budget
   → Scores the lead (85/100 = Hot)

3. Harmony: Hands off to MAESTRO
   → MAESTRO calculates quote
   → Deke gets notification: "Quote ready for approval"

4. Deke: Reviews the quote in dashboard
   → Sees conversation transcript
   → Sees MAESTRO's recommended price: $1,800
   → Options:
     ✅ Approve quote (MAESTRO sends it)
     ✏️ Edit quote (adjust price/terms)
     💬 Take over (respond personally)

5. Customer: Receives quote
   → Can continue chatting with Harmony
   → Or wait for Deke's personal follow-up
```

---

## 🚀 Implementation Roadmap

### **Phase 5: Full Agent Logic**
- MAESTRO generates real quotes
- CONDUCTOR books real consultations
- SCOUT auto-discovers opportunities
- **Still no Deke interface** ❌

### **Phase 6: Deke Dashboard (Recommended Next)**
**Priority 1: Conversation Monitoring**
- [ ] Create `/dashboard/conversations` page
- [ ] Show live chat sessions
- [ ] Display full transcripts
- [ ] Add "View" button for each conversation

**Priority 2: Agent Activity Feed**
- [ ] Create `/dashboard/agents` page
- [ ] Pull from AgentLog table
- [ ] Show real-time agent actions
- [ ] Display handoff flows

**Priority 3: Notifications**
- [ ] Email alerts for hot leads
- [ ] Dashboard notification badge
- [ ] SMS alerts (optional)
- [ ] Slack integration (optional)

**Priority 4: Manual Override**
- [ ] "Take over" button on conversations
- [ ] Pause/resume Harmony
- [ ] Deke can respond directly
- [ ] Context preservation

**Priority 5: Approval Workflows**
- [ ] Quote approval system
- [ ] Campaign approval (already exists ✅)
- [ ] Agent action review
- [ ] Bulk action controls

---

## 💡 Quick Wins (What Deke Can Do NOW)

### **1. Check Database Directly**
```bash
# Open Prisma Studio
npx prisma studio

# View tables:
- ChatSession: All conversations
- ChatMessage: Individual messages
- Lead: Captured contact info
- AgentLog: Agent coordination events
```

**What Deke sees:**
- Every conversation Harmony has
- Lead info captured
- Agent handoffs
- Timestamps and metadata

**Downside:** Not user-friendly, requires technical knowledge

---

### **2. Check Railway Logs**
1. Go to Railway dashboard
2. Click "Logs" tab
3. Search for: `[HARMONY]` or `[MAESTRO]`

**What Deke sees:**
- Real-time agent activity
- Handoff events
- Error messages
- Performance metrics

**Downside:** Just console logs, no structured view

---

### **3. Use Campaign Dashboard**
**What Deke CAN do:**
- Create lead discovery campaigns
- View discovered leads on map
- Send outreach emails/SMS
- Track campaign performance

**What Deke CAN'T do:**
- See Harmony conversations
- Monitor agent activity
- Take over chats
- Get real-time alerts

---

## 🎯 Summary

### **Current State:**

| Feature | Status | Deke Access |
|---------|--------|-------------|
| Harmony chat widget | ✅ Working | ❌ No visibility |
| Agent coordination | ✅ Working | ❌ No monitoring |
| Lead capture | ✅ Working | ✅ Via database/campaigns |
| Campaign management | ✅ Working | ✅ Full dashboard |
| Conversation monitoring | ❌ Missing | ❌ Not built yet |
| Agent dashboard | ❌ Missing | ❌ Not built yet |
| Take over chats | ❌ Missing | ❌ Not built yet |
| Real-time alerts | ❌ Missing | ❌ Not built yet |

### **Bottom Line:**

**Harmony works perfectly for customers, but Deke is flying blind.**

Deke can:
- ✅ Manage campaigns and leads
- ✅ Check database for past conversations
- ❌ **Can't see live conversations**
- ❌ **Can't monitor agent activity**
- ❌ **Can't take over chats**
- ❌ **Can't get alerts**

---

## 🛠️ Recommended Next Steps

### **Option 1: Quick Fix (1 day)**
Build basic conversation viewer:
- Show list of ChatSessions
- Click to see full transcript
- Display lead info
- No real-time updates, just browse past chats

### **Option 2: Full Dashboard (3-5 days)**
Build comprehensive monitoring:
- Live conversation feed
- Agent activity dashboard
- Take over capability
- Email/SMS alerts

### **Option 3: Use Existing Tools (Now)**
Deke can use:
- Prisma Studio to browse conversations
- Railway logs to see agent activity
- Campaign dashboard to manage outreach
- Direct database queries for analytics

---

## 📊 Technical Implementation Notes

### **Database Tables Already Exist:**

```sql
-- All conversations
ChatSession (sessionId, status, createdAt, lead)

-- Every message
ChatMessage (role, content, agentId, createdAt)

-- Lead info
Lead (email, firstName, lastName, organization, score)

-- Agent activity
AgentLog (agentId, actionType, success, durationMs)
```

**The data is there, just needs a UI to display it.**

---

## 🎬 Demo Script (For Now)

**"Let me show you what Harmony does for customers:"**

1. Open website → Show chat widget
2. Type message → Show Harmony responding
3. Open Railway logs → Show agent coordination
4. Open Prisma Studio → Show conversation saved

**"Here's what I CAN'T show you yet:"**

1. Live dashboard of who's chatting
2. Real-time agent activity feed
3. Alerts when hot leads captured
4. Taking over a conversation

**"But the infrastructure is ready - just needs the UI."**

---

**Last Updated:** January 14, 2026
**Status:** Phase 4 complete, Deke interface not yet built
**Recommended:** Build conversation monitoring dashboard (Phase 6)
