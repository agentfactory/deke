import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a confirmed booking in Boston
  const bostonLead = await prisma.lead.create({
    data: {
      firstName: 'Harvard',
      lastName: 'University',
      email: 'music@harvard.edu',
      phone: '+1-617-495-1000',
      organization: 'Harvard University Glee Club',
      source: 'referral',
      status: 'WON',
      score: 85,
      latitude: 42.3736,
      longitude: -71.1097,
      lastContactedAt: new Date('2025-10-15'),
    }
  })

  const bostonBooking = await prisma.booking.create({
    data: {
      leadId: bostonLead.id,
      serviceType: 'WORKSHOP',
      status: 'CONFIRMED',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-15'),
      location: 'Cambridge, MA',
      latitude: 42.3736,
      longitude: -71.1097,
      amount: 8000,
      paymentStatus: 'PAID_IN_FULL',
      internalNotes: 'Full-day workshop for 40 singers'
    }
  })

  // Create dormant leads nearby
  await prisma.lead.createMany({
    data: [
      {
        firstName: 'MIT',
        lastName: 'A Cappella',
        email: 'logs@mit.edu',
        organization: 'MIT Logarhythms',
        source: 'website',
        status: 'QUALIFIED',
        score: 65,
        latitude: 42.3601,
        longitude: -71.0942,
        lastContactedAt: new Date('2025-06-01'),
      },
      {
        firstName: 'Boston',
        lastName: 'Conservatory',
        email: 'vocal@bostonconservatory.edu',
        organization: 'Boston Conservatory at Berklee',
        source: 'referral',
        status: 'CONTACTED',
        score: 58,
        latitude: 42.3467,
        longitude: -71.0887,
        lastContactedAt: new Date('2025-05-15'),
      },
      {
        firstName: 'Tufts',
        lastName: 'Beelzebubs',
        email: 'bubs@tufts.edu',
        organization: 'Tufts Beelzebubs',
        source: 'social',
        status: 'NEW',
        score: 45,
        latitude: 42.4075,
        longitude: -71.1190,
      },
      {
        firstName: 'Yale',
        lastName: 'Whiffenpoofs',
        email: 'whiffs@yale.edu',
        organization: 'Yale Whiffenpoofs',
        source: 'referral',
        status: 'QUALIFIED',
        score: 72,
        latitude: 41.3163,
        longitude: -72.9223,
        lastContactedAt: new Date('2024-12-10'),
      }
    ]
  })

  // Create message templates
  await prisma.messageTemplate.createMany({
    data: [
      {
        name: 'Workshop Inquiry - University',
        serviceType: 'WORKSHOP',
        channel: 'EMAIL',
        subject: 'A Cappella Workshop Opportunity Near Your Area',
        body: 'Hi {{firstName}},\n\nI noticed {{organization}} might be interested in elevating your a cappella program. Deke Sharon (Music Director of Pitch Perfect, The Sing-Off) will be in {{location}} on {{dates}} and has availability for a workshop.\n\nTopics can include:\n- Arranging techniques\n- Vocal percussion\n- Blend and tuning\n- Performance skills\n\nInvestment: $3,500-6,000 depending on group size and duration.\n\nWould you be interested in learning more?\n\nBest regards,\nHarmony',
      },
      {
        name: 'Workshop Inquiry - High School',
        serviceType: 'WORKSHOP',
        channel: 'EMAIL',
        subject: 'Special Workshop Opportunity for {{organization}}',
        body: 'Hi {{firstName}},\n\nDeke Sharon, the "father of contemporary a cappella," will be in {{location}} on {{dates}}.\n\nWe\'re offering a limited number of high school workshops at a special rate: $2,500 for a half-day session.\n\nYour singers will learn directly from the Music Director of Pitch Perfect and The Sing-Off.\n\nInterested in reserving a spot?\n\nBest,\nHarmony',
      }
    ]
  })

  console.log('✅ Seed data created:')
  console.log('  - 1 booking in Boston (March 15, 2026)')
  console.log('  - 1 past client (Harvard)')
  console.log('  - 4 leads (MIT, Boston Conservatory, Tufts, Yale)')
  console.log('  - 2 message templates')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
