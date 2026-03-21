import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // -----------------------------------------------------------
  // 1. Boston Workshop (confirmed, public)
  // -----------------------------------------------------------
  const harvardLead = await prisma.lead.upsert({
    where: { email: 'music@harvard.edu' },
    update: {},
    create: {
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
    },
  })

  await prisma.booking.upsert({
    where: { id: 'seed-boston-workshop' },
    update: {
      startDate: new Date('2026-04-12'),
      endDate: new Date('2026-04-12'),
      isPublic: true,
      publicTitle: 'A Cappella Workshop at Harvard',
      publicDescription:
        'Full-day intensive workshop for 40 singers covering arranging, blend, tuning, and performance.',
    },
    create: {
      id: 'seed-boston-workshop',
      leadId: harvardLead.id,
      serviceType: 'WORKSHOP',
      status: 'CONFIRMED',
      startDate: new Date('2026-04-12'),
      endDate: new Date('2026-04-12'),
      location: 'Cambridge, MA',
      latitude: 42.3736,
      longitude: -71.1097,
      amount: 8000,
      paymentStatus: 'PAID_IN_FULL',
      internalNotes: 'Full-day workshop for 40 singers',
      isPublic: true,
      publicTitle: 'A Cappella Workshop at Harvard',
      publicDescription:
        'Full-day intensive workshop for 40 singers covering arranging, blend, tuning, and performance.',
    },
  })

  // -----------------------------------------------------------
  // 2. LA Masterclass (confirmed, public)
  // -----------------------------------------------------------
  const uscLead = await prisma.lead.upsert({
    where: { email: 'music@usc.edu' },
    update: {},
    create: {
      firstName: 'USC',
      lastName: 'Thornton',
      email: 'music@usc.edu',
      organization: 'USC Thornton School of Music',
      source: 'referral',
      status: 'WON',
      score: 90,
      latitude: 34.0224,
      longitude: -118.2851,
    },
  })

  await prisma.booking.upsert({
    where: { id: 'seed-la-masterclass' },
    update: {
      startDate: new Date('2026-05-08'),
      endDate: new Date('2026-05-09'),
      isPublic: true,
      publicTitle: 'Vocal Arranging Masterclass',
      publicDescription:
        'Two-day deep-dive into contemporary a cappella arranging with the Music Director of Pitch Perfect.',
    },
    create: {
      id: 'seed-la-masterclass',
      leadId: uscLead.id,
      serviceType: 'MASTERCLASS',
      status: 'CONFIRMED',
      startDate: new Date('2026-05-08'),
      endDate: new Date('2026-05-09'),
      location: 'Los Angeles, CA',
      latitude: 34.0224,
      longitude: -118.2851,
      amount: 12000,
      paymentStatus: 'DEPOSIT_PAID',
      internalNotes: '2-day masterclass, 25 participants max',
      isPublic: true,
      publicTitle: 'Vocal Arranging Masterclass',
      publicDescription:
        'Two-day deep-dive into contemporary a cappella arranging with the Music Director of Pitch Perfect.',
    },
  })

  // -----------------------------------------------------------
  // 3. NYC Speaking Engagement (confirmed, public)
  // -----------------------------------------------------------
  const aheadLead = await prisma.lead.upsert({
    where: { email: 'events@acappella.org' },
    update: {},
    create: {
      firstName: 'AHEAD',
      lastName: 'Conference',
      email: 'events@acappella.org',
      organization: 'A Cappella Education Association',
      source: 'website',
      status: 'WON',
      score: 88,
      latitude: 40.7580,
      longitude: -73.9855,
    },
  })

  await prisma.booking.upsert({
    where: { id: 'seed-nyc-speaking' },
    update: {
      startDate: new Date('2026-06-14'),
      endDate: new Date('2026-06-14'),
      isPublic: true,
      publicTitle: 'Keynote: The Future of A Cappella',
      publicDescription:
        'Keynote address at the annual A Cappella Education Conference in New York City.',
    },
    create: {
      id: 'seed-nyc-speaking',
      leadId: aheadLead.id,
      serviceType: 'SPEAKING',
      status: 'CONFIRMED',
      startDate: new Date('2026-06-14'),
      endDate: new Date('2026-06-14'),
      location: 'New York, NY',
      latitude: 40.7580,
      longitude: -73.9855,
      amount: 5000,
      paymentStatus: 'PENDING',
      internalNotes: 'Keynote + Q&A, 500-person audience',
      isPublic: true,
      publicTitle: 'Keynote: The Future of A Cappella',
      publicDescription:
        'Keynote address at the annual A Cappella Education Conference in New York City.',
    },
  })

  // -----------------------------------------------------------
  // 4. Chicago Workshop (confirmed, public)
  // -----------------------------------------------------------
  const northwesternLead = await prisma.lead.upsert({
    where: { email: 'acappella@northwestern.edu' },
    update: {},
    create: {
      firstName: 'Northwestern',
      lastName: 'University',
      email: 'acappella@northwestern.edu',
      organization: 'Northwestern Purple Haze',
      source: 'social',
      status: 'WON',
      score: 75,
      latitude: 42.0565,
      longitude: -87.6753,
    },
  })

  await prisma.booking.upsert({
    where: { id: 'seed-chicago-workshop' },
    update: {
      startDate: new Date('2026-07-20'),
      endDate: new Date('2026-07-21'),
      isPublic: true,
      publicTitle: 'Summer A Cappella Intensive',
      publicDescription:
        'Two-day summer intensive covering vocal percussion, beatboxing, and contemporary arranging.',
    },
    create: {
      id: 'seed-chicago-workshop',
      leadId: northwesternLead.id,
      serviceType: 'WORKSHOP',
      status: 'CONFIRMED',
      startDate: new Date('2026-07-20'),
      endDate: new Date('2026-07-21'),
      location: 'Chicago, IL',
      latitude: 42.0565,
      longitude: -87.6753,
      amount: 10000,
      paymentStatus: 'DEPOSIT_PAID',
      internalNotes: 'Multi-group intensive, up to 60 singers',
      isPublic: true,
      publicTitle: 'Summer A Cappella Intensive',
      publicDescription:
        'Two-day summer intensive covering vocal percussion, beatboxing, and contemporary arranging.',
    },
  })

  // -----------------------------------------------------------
  // 5. Private coaching (confirmed but NOT public)
  // -----------------------------------------------------------
  const privateLead = await prisma.lead.upsert({
    where: { email: 'manager@pentatonix.com' },
    update: {},
    create: {
      firstName: 'Private',
      lastName: 'Client',
      email: 'manager@pentatonix.com',
      organization: 'Private Group',
      source: 'referral',
      status: 'WON',
      score: 95,
      latitude: 36.1627,
      longitude: -86.7816,
    },
  })

  await prisma.booking.upsert({
    where: { id: 'seed-private-coaching' },
    update: {},
    create: {
      id: 'seed-private-coaching',
      leadId: privateLead.id,
      serviceType: 'INDIVIDUAL_COACHING',
      status: 'CONFIRMED',
      startDate: new Date('2026-04-25'),
      endDate: new Date('2026-04-25'),
      location: 'Nashville, TN',
      latitude: 36.1627,
      longitude: -86.7816,
      amount: 3000,
      paymentStatus: 'PAID_IN_FULL',
      internalNotes: 'Private session - do not publicize',
      isPublic: false,
    },
  })

  // -----------------------------------------------------------
  // Dormant leads for campaign discovery
  // -----------------------------------------------------------
  const dormantLeads = [
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
      longitude: -71.119,
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
    },
    {
      firstName: 'UCLA',
      lastName: 'Scattertones',
      email: 'scatter@ucla.edu',
      organization: 'UCLA Scattertones',
      source: 'website',
      status: 'NEW',
      score: 50,
      latitude: 34.0689,
      longitude: -118.4452,
    },
    {
      firstName: 'Columbia',
      lastName: 'Nonsequitur',
      email: 'nonseq@columbia.edu',
      organization: 'Columbia Nonsequitur',
      source: 'social',
      status: 'QUALIFIED',
      score: 60,
      latitude: 40.8075,
      longitude: -73.9626,
      lastContactedAt: new Date('2025-03-01'),
    },
    {
      firstName: 'UChicago',
      lastName: 'Voices',
      email: 'voices@uchicago.edu',
      organization: 'UChicago Voices in Your Head',
      source: 'website',
      status: 'NEW',
      score: 55,
      latitude: 41.7886,
      longitude: -87.5987,
    },
  ]

  for (const lead of dormantLeads) {
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: {},
      create: lead,
    })
  }

  // -----------------------------------------------------------
  // Message templates
  // -----------------------------------------------------------
  await prisma.messageTemplate.upsert({
    where: { id: 'seed-template-university' },
    update: {},
    create: {
      id: 'seed-template-university',
      name: 'Workshop Inquiry - University',
      serviceType: 'WORKSHOP',
      channel: 'EMAIL',
      subject: 'A Cappella Workshop Opportunity Near Your Area',
      body: 'Hi {{firstName}},\n\nI noticed {{organization}} might be interested in elevating your a cappella program. Deke Sharon (Music Director of Pitch Perfect, The Sing-Off) will be in {{location}} on {{dates}} and has availability for a workshop.\n\nTopics can include:\n- Arranging techniques\n- Vocal percussion\n- Blend and tuning\n- Performance skills\n\nInvestment: $3,500-6,000 depending on group size and duration.\n\nWould you be interested in learning more?\n\nBest regards,\nHarmony',
    },
  })

  await prisma.messageTemplate.upsert({
    where: { id: 'seed-template-highschool' },
    update: {},
    create: {
      id: 'seed-template-highschool',
      name: 'Workshop Inquiry - High School',
      serviceType: 'WORKSHOP',
      channel: 'EMAIL',
      subject: 'Special Workshop Opportunity for {{organization}}',
      body: "Hi {{firstName}},\n\nDeke Sharon, the \"father of contemporary a cappella,\" will be in {{location}} on {{dates}}.\n\nWe're offering a limited number of high school workshops at a special rate: $2,500 for a half-day session.\n\nYour singers will learn directly from the Music Director of Pitch Perfect and The Sing-Off.\n\nInterested in reserving a spot?\n\nBest,\nHarmony",
    },
  })

  console.log('Seed data created:')
  console.log('  - 4 public bookings (Boston, LA, NYC, Chicago)')
  console.log('  - 1 private booking (Nashville)')
  console.log('  - 12 leads (5 won clients + 7 dormant prospects)')
  console.log('  - 2 message templates')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
