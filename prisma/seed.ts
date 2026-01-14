import { PrismaClient } from '@prisma/client';
import { addWeeks, addMonths, subMonths, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.outreachLog.deleteMany();
  await prisma.campaignLead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.suppression.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.geoPreference.deleteMany();
  await prisma.contentPiece.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.revenueMetric.deleteMany();
  await prisma.agentLog.deleteMany();
  await prisma.agentMemory.deleteMany();

  console.log('✅ Existing data cleared');

  // ============================================
  // GEO PREFERENCES (10 countries)
  // ============================================
  console.log('🌍 Creating geo preferences...');

  const geoPreferences = await prisma.geoPreference.createMany({
    data: [
      { country: 'USA', defaultRadius: 100, unit: 'miles', enabled: true },
      { country: 'Japan', defaultRadius: 50, unit: 'km', enabled: true },
      { country: 'UK', defaultRadius: 80, unit: 'km', enabled: true },
      { country: 'Canada', defaultRadius: 150, unit: 'km', enabled: true },
      { country: 'Australia', defaultRadius: 200, unit: 'km', enabled: true },
      { country: 'Germany', defaultRadius: 100, unit: 'km', enabled: true },
      { country: 'France', defaultRadius: 100, unit: 'km', enabled: true },
      { country: 'Italy', defaultRadius: 80, unit: 'km', enabled: true },
      { country: 'Spain', defaultRadius: 100, unit: 'km', enabled: true },
      { country: 'Netherlands', defaultRadius: 60, unit: 'km', enabled: true },
    ],
  });

  console.log(`✅ Created ${geoPreferences.count} geo preferences`);

  // ============================================
  // MESSAGE TEMPLATES (10+ templates)
  // ============================================
  console.log('📧 Creating message templates...');

  const templates = await prisma.messageTemplate.createMany({
    data: [
      // Workshop Templates
      {
        name: 'Workshop Follow-up - Past Client',
        serviceType: 'WORKSHOP',
        channel: 'EMAIL',
        subject: 'Transform Your Group\'s Sound Again - Workshop Opportunity',
        body: `Hi {{firstName}},

Hope this finds you and the team at {{organization}} doing great! I wanted to reach out because I'll be in the {{location}} area on {{dates}}.

Since we last worked together, I've developed some powerful new techniques for vocal harmony that I think your group would absolutely love. Would you be interested in scheduling a workshop while I'm in town?

This would be a great opportunity to take your sound to the next level and work on some fresh material together.

Let me know if you'd like to chat about making this happen!

Best,
Deke Sharon`,
        variables: JSON.stringify(['firstName', 'organization', 'location', 'dates']),
      },
      {
        name: 'Workshop - Cold Outreach',
        serviceType: 'WORKSHOP',
        channel: 'EMAIL',
        subject: 'Elevate Your Vocal Group - Workshop with Deke Sharon',
        body: `Hi {{firstName}},

I'm Deke Sharon, and I'll be conducting vocal workshops in {{location}} during {{dates}}. I specialize in helping a cappella and vocal groups develop tight harmonies, improve blend, and create arrangements that showcase their unique sound.

I've worked with groups ranging from college a cappella to professional ensembles (you might know me from Pitch Perfect or The Sing-Off), and I'd love to explore whether a workshop would be valuable for {{organization}}.

Would you be open to a quick call to discuss what I could bring to your group?

Best regards,
Deke Sharon`,
        variables: JSON.stringify(['firstName', 'location', 'dates', 'organization']),
      },

      // Speaking Templates
      {
        name: 'Speaking Engagement - University',
        serviceType: 'SPEAKING',
        channel: 'EMAIL',
        subject: 'Inspiring Your Students - Speaking Opportunity',
        body: `Dear {{firstName}},

I hope this message finds you well. I'm reaching out because I'll be in {{location}} on {{dates}} and would love to speak to your students at {{organization}}.

My presentations blend entertainment, education, and inspiration - drawing from my work with Pitch Perfect, The Sing-Off, and 30+ years in the vocal music world. Topics can range from building creative careers to the business of music to the art of collaboration.

Would your students benefit from this kind of session? I'd be happy to tailor the content to what would resonate most with your program.

Looking forward to connecting,
Deke`,
        variables: JSON.stringify(['firstName', 'location', 'dates', 'organization']),
      },

      // Coaching Templates
      {
        name: 'Group Coaching - Competition Prep',
        serviceType: 'GROUP_COACHING',
        channel: 'EMAIL',
        subject: 'Ready for Competition Season? Let\'s Work Together',
        body: `Hi {{firstName}},

Competition season is approaching fast! I wanted to see if {{organization}} would be interested in some focused group coaching sessions to get you performance-ready.

We can work on:
- Arrangement refinement and vocal production
- Stage presence and choreography integration
- Competition strategy and song selection
- Blend, intonation, and rhythmic precision

I have availability {{dates}} for virtual or in-person sessions. Let's give your group the competitive edge they deserve!

Best,
Deke Sharon`,
        variables: JSON.stringify(['firstName', 'organization', 'dates']),
      },
      {
        name: 'Coaching - SMS Quick Check-in',
        serviceType: 'COACHING',
        channel: 'SMS',
        body: `Hi {{firstName}}! Deke here. I'll be near {{location}} next month and thought of your group. Would love to do a coaching session if you're interested. Let me know!`,
        variables: JSON.stringify(['firstName', 'location']),
      },

      // Arrangement Templates
      {
        name: 'Arrangement - Custom Quote',
        serviceType: 'ARRANGEMENT',
        channel: 'EMAIL',
        subject: 'Your Custom Arrangement from Deke Sharon',
        body: `Hi {{firstName}},

Thanks for reaching out about a custom arrangement! I'd love to create something special for {{organization}}.

Based on what you've shared, I can deliver a professional {{voiceParts}}-part arrangement of "{{songTitle}}" that will showcase your group's strengths and sound amazing on stage.

Timeline: {{deliveryTime}}
Investment: {{price}}

This includes one round of revisions to make sure it's absolutely perfect for your group. Ready to move forward?

Let me know if you have any questions!

Musically,
Deke`,
        variables: JSON.stringify(['firstName', 'organization', 'voiceParts', 'songTitle', 'deliveryTime', 'price']),
      },

      // Masterclass Templates
      {
        name: 'Masterclass - Festival Opportunity',
        serviceType: 'MASTERCLASS',
        channel: 'EMAIL',
        subject: 'Masterclass Opportunity - Vocal Harmony Deep Dive',
        body: `Dear {{firstName}},

I'm planning a series of masterclasses for serious vocal musicians, and {{organization}} immediately came to mind as an ideal host location.

This intensive masterclass goes deep into:
- Advanced arrangement techniques
- Vocal production and style
- Building sustainable vocal careers
- The art and business of modern a cappella

Date Options: {{dates}}
Location: {{location}}

These sessions typically attract 50-100 participants and create incredible networking opportunities for your community. Would this be of interest?

Best regards,
Deke Sharon`,
        variables: JSON.stringify(['firstName', 'organization', 'dates', 'location']),
      },

      // General Follow-ups
      {
        name: 'General Follow-up - Post Inquiry',
        serviceType: 'SPEAKING',
        channel: 'EMAIL',
        subject: 'Following up on your inquiry',
        body: `Hi {{firstName}},

Just wanted to follow up on your recent inquiry about {{serviceType}} for {{organization}}. I'd love to help make this happen!

Do you have time for a quick call this week to discuss the details and see if we're a good fit?

Looking forward to connecting,
Deke`,
        variables: JSON.stringify(['firstName', 'serviceType', 'organization']),
      },
      {
        name: 'Thank You - Post Booking',
        serviceType: 'WORKSHOP',
        channel: 'EMAIL',
        subject: 'Excited to work with {{organization}}!',
        body: `Hi {{firstName}},

I'm thrilled we're making this happen! Your group at {{organization}} is going to have an amazing experience.

I'll send over the final details and prep materials about a week before {{dates}}. In the meantime, if any questions come up, just let me know.

Can't wait to work together!

Best,
Deke Sharon`,
        variables: JSON.stringify(['firstName', 'organization', 'dates']),
      },

      // LinkedIn Templates
      {
        name: 'LinkedIn Connection - Music Director',
        serviceType: 'WORKSHOP',
        channel: 'LINKEDIN',
        body: `Hi {{firstName}}, I noticed you're the director at {{organization}}. I'll be in the {{location}} area soon and thought we might explore a workshop collaboration. Would love to connect!`,
        variables: JSON.stringify(['firstName', 'organization', 'location']),
      },
      {
        name: 'LinkedIn - Speaking Follow-up',
        serviceType: 'SPEAKING',
        channel: 'LINKEDIN',
        body: `{{firstName}}, thanks for connecting! I see you're involved with {{organization}}. I do speaking engagements on creative careers and the music business - let me know if that would ever be valuable for your students or community.`,
        variables: JSON.stringify(['firstName', 'organization']),
      },
    ],
  });

  console.log(`✅ Created ${templates.count} message templates`);

  // ============================================
  // LEADS (30+ with proper geocoding)
  // ============================================
  console.log('👥 Creating leads...');

  // 10 PAST CLIENTS (WON status, with completed bookings)
  const pastClientLeads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@stanford.edu',
        phone: '+1-650-555-0101',
        organization: 'Stanford University - Mendicants',
        source: 'referral',
        status: 'WON',
        score: 95,
        latitude: 37.4275,
        longitude: -122.1697,
        lastContactedAt: subMonths(new Date(), 2),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Martinez',
        email: 'smartinez@ucla.edu',
        phone: '+1-310-555-0102',
        organization: 'UCLA ScatterTones',
        source: 'website',
        status: 'WON',
        score: 92,
        latitude: 34.0689,
        longitude: -118.4452,
        lastContactedAt: subMonths(new Date(), 1),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'David',
        lastName: 'Kim',
        email: 'dkim@usc.edu',
        phone: '+1-213-555-0103',
        organization: 'USC SoCal VoCals',
        source: 'referral',
        status: 'WON',
        score: 90,
        latitude: 34.0224,
        longitude: -118.2851,
        lastContactedAt: subMonths(new Date(), 3),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Jennifer',
        lastName: 'Williams',
        email: 'jwilliams@northwestern.edu',
        phone: '+1-847-555-0104',
        organization: 'Northwestern University - ShireiNU',
        source: 'social',
        status: 'WON',
        score: 88,
        latitude: 42.0565,
        longitude: -87.6753,
        lastContactedAt: subMonths(new Date(), 4),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'rjohnson@berklee.edu',
        phone: '+1-617-555-0105',
        organization: 'Berklee College of Music',
        source: 'website',
        status: 'WON',
        score: 94,
        latitude: 42.3467,
        longitude: -71.0873,
        lastContactedAt: subMonths(new Date(), 2),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Amanda',
        lastName: 'Brown',
        email: 'abrown@nyu.edu',
        phone: '+1-212-555-0106',
        organization: 'NYU N\'Harmonics',
        source: 'referral',
        status: 'WON',
        score: 87,
        latitude: 40.7295,
        longitude: -73.9965,
        lastContactedAt: subMonths(new Date(), 1),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'James',
        lastName: 'Anderson',
        email: 'janderson@sfconservatory.edu',
        phone: '+1-415-555-0107',
        organization: 'San Francisco Conservatory',
        source: 'website',
        status: 'WON',
        score: 91,
        latitude: 37.7849,
        longitude: -122.4194,
        lastContactedAt: subMonths(new Date(), 3),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Lisa',
        lastName: 'Taylor',
        email: 'ltaylor@uchicago.edu',
        phone: '+1-773-555-0108',
        organization: 'University of Chicago Voices',
        source: 'referral',
        status: 'WON',
        score: 89,
        latitude: 41.7886,
        longitude: -87.5987,
        lastContactedAt: subMonths(new Date(), 2),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Thomas',
        lastName: 'Garcia',
        email: 'tgarcia@bu.edu',
        phone: '+1-617-555-0109',
        organization: 'Boston University Dear Abbeys',
        source: 'social',
        status: 'WON',
        score: 86,
        latitude: 42.3505,
        longitude: -71.1054,
        lastContactedAt: subMonths(new Date(), 4),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'erodriguez@calarts.edu',
        phone: '+1-661-555-0110',
        organization: 'CalArts Vocal Jazz Ensemble',
        source: 'website',
        status: 'WON',
        score: 88,
        latitude: 34.4133,
        longitude: -118.5664,
        lastContactedAt: subMonths(new Date(), 3),
      },
    }),
  ]);

  console.log(`✅ Created ${pastClientLeads.length} past client leads`);

  // 10 DORMANT LEADS (6+ months no contact)
  const dormantLeads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Rachel',
        lastName: 'Thompson',
        email: 'rthompson@sdhs.edu',
        phone: '+1-619-555-0201',
        organization: 'San Diego High School Chorus',
        source: 'website',
        status: 'DORMANT',
        score: 45,
        latitude: 32.7157,
        longitude: -117.1611,
        lastContactedAt: subMonths(new Date(), 8),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Kevin',
        lastName: 'Lee',
        email: 'klee@austincc.edu',
        phone: '+1-512-555-0202',
        organization: 'Austin Community College Music Dept',
        source: 'referral',
        status: 'DORMANT',
        score: 52,
        latitude: 30.2672,
        longitude: -97.7431,
        lastContactedAt: subMonths(new Date(), 10),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Nicole',
        lastName: 'White',
        email: 'nwhite@seattletheater.org',
        phone: '+1-206-555-0203',
        organization: 'Seattle Repertory Theatre',
        source: 'social',
        status: 'DORMANT',
        score: 38,
        latitude: 47.6062,
        longitude: -122.3321,
        lastContactedAt: subMonths(new Date(), 7),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Daniel',
        lastName: 'Martinez',
        email: 'dmartinez@portlandstate.edu',
        phone: '+1-503-555-0204',
        organization: 'Portland State Chamber Choir',
        source: 'website',
        status: 'DORMANT',
        score: 48,
        latitude: 45.5122,
        longitude: -122.6587,
        lastContactedAt: subMonths(new Date(), 9),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Melissa',
        lastName: 'Jackson',
        email: 'mjackson@denverarts.org',
        phone: '+1-303-555-0205',
        organization: 'Denver School of the Arts',
        source: 'referral',
        status: 'DORMANT',
        score: 41,
        latitude: 39.7392,
        longitude: -104.9903,
        lastContactedAt: subMonths(new Date(), 11),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Christopher',
        lastName: 'Davis',
        email: 'cdavis@phoenixcollege.edu',
        phone: '+1-602-555-0206',
        organization: 'Phoenix College Vocal Ensemble',
        source: 'website',
        status: 'DORMANT',
        score: 44,
        latitude: 33.4484,
        longitude: -112.0740,
        lastContactedAt: subMonths(new Date(), 12),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Angela',
        lastName: 'Wilson',
        email: 'awilson@vegashs.edu',
        phone: '+1-702-555-0207',
        organization: 'Las Vegas Academy Show Choir',
        source: 'social',
        status: 'DORMANT',
        score: 39,
        latitude: 36.1699,
        longitude: -115.1398,
        lastContactedAt: subMonths(new Date(), 8),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Brian',
        lastName: 'Moore',
        email: 'bmoore@saltlakecity.edu',
        phone: '+1-801-555-0208',
        organization: 'Salt Lake Community College',
        source: 'referral',
        status: 'DORMANT',
        score: 46,
        latitude: 40.7608,
        longitude: -111.8910,
        lastContactedAt: subMonths(new Date(), 10),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Stephanie',
        lastName: 'Taylor',
        email: 'staylor@boisehs.edu',
        phone: '+1-208-555-0209',
        organization: 'Boise High School Vocal Music',
        source: 'website',
        status: 'DORMANT',
        score: 42,
        latitude: 43.6150,
        longitude: -116.2023,
        lastContactedAt: subMonths(new Date(), 7),
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Matthew',
        lastName: 'Anderson',
        email: 'manderson@tucsontheater.org',
        phone: '+1-520-555-0210',
        organization: 'Tucson Music Hall',
        source: 'social',
        status: 'DORMANT',
        score: 37,
        latitude: 32.2226,
        longitude: -110.9747,
        lastContactedAt: subMonths(new Date(), 9),
      },
    }),
  ]);

  console.log(`✅ Created ${dormantLeads.length} dormant leads`);

  // 10+ NEW/COLD LEADS (various vocal groups and universities)
  const newLeads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Jessica',
        lastName: 'Harris',
        email: 'jharris@duke.edu',
        phone: '+1-919-555-0301',
        organization: 'Duke University Pitchforks',
        source: 'website',
        status: 'NEW',
        score: 65,
        latitude: 36.0014,
        longitude: -78.9382,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Andrew',
        lastName: 'Clark',
        email: 'aclark@emory.edu',
        phone: '+1-404-555-0302',
        organization: 'Emory University Dooley Noted',
        source: 'referral',
        status: 'NEW',
        score: 62,
        latitude: 33.7920,
        longitude: -84.3240,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Lauren',
        lastName: 'Lewis',
        email: 'llewis@vanderbilt.edu',
        phone: '+1-615-555-0303',
        organization: 'Vanderbilt Melodores',
        source: 'social',
        status: 'NEW',
        score: 68,
        latitude: 36.1447,
        longitude: -86.8027,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Ryan',
        lastName: 'Walker',
        email: 'rwalker@rice.edu',
        phone: '+1-713-555-0304',
        organization: 'Rice University Owls',
        source: 'website',
        status: 'NEW',
        score: 59,
        latitude: 29.7174,
        longitude: -95.4018,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Samantha',
        lastName: 'Hall',
        email: 'shall@washington.edu',
        phone: '+1-206-555-0305',
        organization: 'University of Washington Dynamics',
        source: 'referral',
        status: 'NEW',
        score: 71,
        latitude: 47.6553,
        longitude: -122.3035,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Jonathan',
        lastName: 'Young',
        email: 'jyoung@uoregon.edu',
        phone: '+1-541-555-0306',
        organization: 'University of Oregon On The Rocks',
        source: 'social',
        status: 'NEW',
        score: 64,
        latitude: 44.0448,
        longitude: -123.0748,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Kimberly',
        lastName: 'King',
        email: 'kking@colorado.edu',
        phone: '+1-303-555-0307',
        organization: 'CU Boulder Buffoons',
        source: 'website',
        status: 'NEW',
        score: 66,
        latitude: 40.0076,
        longitude: -105.2659,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Eric',
        lastName: 'Wright',
        email: 'ewright@arizona.edu',
        phone: '+1-520-555-0308',
        organization: 'University of Arizona Vocal Arts',
        source: 'referral',
        status: 'NEW',
        score: 58,
        latitude: 32.2319,
        longitude: -110.9501,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Michelle',
        lastName: 'Lopez',
        email: 'mlopez@sandiego.edu',
        phone: '+1-619-555-0309',
        organization: 'University of San Diego Troubadours',
        source: 'social',
        status: 'NEW',
        score: 63,
        latitude: 32.7716,
        longitude: -117.1919,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Steven',
        lastName: 'Hill',
        email: 'shill@pepperdine.edu',
        phone: '+1-310-555-0310',
        organization: 'Pepperdine Wavelengths',
        source: 'website',
        status: 'NEW',
        score: 67,
        latitude: 34.0389,
        longitude: -118.7108,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Rebecca',
        lastName: 'Scott',
        email: 'rscott@chapman.edu',
        phone: '+1-714-555-0311',
        organization: 'Chapman University Unaccompanied Minors',
        source: 'referral',
        status: 'NEW',
        score: 69,
        latitude: 33.7955,
        longitude: -117.8540,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Timothy',
        lastName: 'Green',
        email: 'tgreen@loyolamarymount.edu',
        phone: '+1-310-555-0312',
        organization: 'LMU Vocal Point',
        source: 'social',
        status: 'NEW',
        score: 61,
        latitude: 33.9686,
        longitude: -118.4183,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Victoria',
        lastName: 'Adams',
        email: 'vadams@ucsantabarbara.edu',
        phone: '+1-805-555-0313',
        organization: 'UCSB Vocal Motion',
        source: 'website',
        status: 'NEW',
        score: 70,
        latitude: 34.4140,
        longitude: -119.8489,
      },
    }),
  ]);

  console.log(`✅ Created ${newLeads.length} new leads`);

  // ============================================
  // INQUIRIES & BOOKINGS FOR PAST CLIENTS
  // ============================================
  console.log('📋 Creating past inquiries and completed bookings...');

  // Create completed bookings for past clients
  const pastBookings = await Promise.all([
    // Stanford Workshop (completed 2 months ago)
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[0].id,
        serviceType: 'WORKSHOP',
        status: 'ACCEPTED',
        details: JSON.stringify({ duration: '2 days', participants: 25 }),
        message: 'We would love to have you back for our annual workshop!',
        quotedAmount: 8500,
        quotedAt: subMonths(new Date(), 3),
        booking: {
          create: {
            leadId: pastClientLeads[0].id,
            serviceType: 'WORKSHOP',
            status: 'COMPLETED',
            startDate: subMonths(new Date(), 2),
            endDate: subMonths(new Date(), 2),
            timezone: 'America/Los_Angeles',
            location: 'Stanford University, Palo Alto, CA',
            latitude: 37.4275,
            longitude: -122.1697,
            amount: 8500,
            depositPaid: 8500,
            balanceDue: 0,
            paymentStatus: 'PAID_IN_FULL',
            internalNotes: 'Great workshop, group was very engaged',
          },
        },
      },
    }),
    // UCLA Speaking (completed 1 month ago)
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[1].id,
        serviceType: 'SPEAKING',
        status: 'ACCEPTED',
        details: JSON.stringify({ duration: '90 minutes', audience: 150 }),
        message: 'Would you speak at our Music Business seminar?',
        quotedAmount: 5000,
        quotedAt: subMonths(new Date(), 2),
        booking: {
          create: {
            leadId: pastClientLeads[1].id,
            serviceType: 'SPEAKING',
            status: 'COMPLETED',
            startDate: subMonths(new Date(), 1),
            endDate: subMonths(new Date(), 1),
            timezone: 'America/Los_Angeles',
            location: 'UCLA Schoenberg Music Building, Los Angeles, CA',
            latitude: 34.0689,
            longitude: -118.4452,
            amount: 5000,
            depositPaid: 5000,
            balanceDue: 0,
            paymentStatus: 'PAID_IN_FULL',
            internalNotes: 'Students loved it, may book again',
          },
        },
      },
    }),
    // USC Group Coaching (completed 3 months ago)
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[2].id,
        serviceType: 'GROUP_COACHING',
        status: 'ACCEPTED',
        details: JSON.stringify({ sessions: 4, groupSize: 15 }),
        message: 'Competition prep coaching for ICCA',
        quotedAmount: 6000,
        quotedAt: subMonths(new Date(), 4),
        booking: {
          create: {
            leadId: pastClientLeads[2].id,
            serviceType: 'GROUP_COACHING',
            status: 'COMPLETED',
            startDate: subMonths(new Date(), 3),
            endDate: subMonths(new Date(), 3),
            timezone: 'America/Los_Angeles',
            location: 'USC School of Music, Los Angeles, CA',
            latitude: 34.0224,
            longitude: -118.2851,
            amount: 6000,
            depositPaid: 6000,
            balanceDue: 0,
            paymentStatus: 'PAID_IN_FULL',
            internalNotes: 'Group placed 2nd at regionals!',
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${pastBookings.length} completed bookings`);

  // ============================================
  // DECLINED/EXPIRED INQUIRIES FOR DORMANT LEADS
  // ============================================
  console.log('❌ Creating declined/expired inquiries...');

  const dormantInquiries = await Promise.all([
    prisma.inquiry.create({
      data: {
        leadId: dormantLeads[0].id,
        serviceType: 'WORKSHOP',
        status: 'DECLINED',
        details: JSON.stringify({ duration: '1 day' }),
        message: 'Budget constraints this year',
        quotedAmount: 4500,
        quotedAt: subMonths(new Date(), 8),
      },
    }),
    prisma.inquiry.create({
      data: {
        leadId: dormantLeads[1].id,
        serviceType: 'SPEAKING',
        status: 'EXPIRED',
        details: JSON.stringify({ duration: '60 minutes' }),
        message: 'Interested in spring speaker',
        quotedAmount: 3500,
        quotedAt: subMonths(new Date(), 10),
        quoteExpiry: subMonths(new Date(), 9),
      },
    }),
    prisma.inquiry.create({
      data: {
        leadId: dormantLeads[2].id,
        serviceType: 'GROUP_COACHING',
        status: 'DECLINED',
        details: JSON.stringify({ sessions: 2 }),
        message: 'Timing didn\'t work out',
        quotedAmount: 3000,
        quotedAt: subMonths(new Date(), 7),
      },
    }),
  ]);

  console.log(`✅ Created ${dormantInquiries.length} dormant inquiries`);

  // ============================================
  // FUTURE CONFIRMED BOOKINGS (5 bookings)
  // ============================================
  console.log('📅 Creating future confirmed bookings...');

  const futureBookings = await Promise.all([
    // Workshop in 2 weeks - Northwestern
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[3].id,
        serviceType: 'WORKSHOP',
        status: 'ACCEPTED',
        details: JSON.stringify({ duration: '2 days', participants: 30 }),
        message: 'Excited to work with you again!',
        quotedAmount: 9000,
        quotedAt: subMonths(new Date(), 1),
        booking: {
          create: {
            leadId: pastClientLeads[3].id,
            serviceType: 'WORKSHOP',
            status: 'CONFIRMED',
            startDate: addWeeks(new Date(), 2),
            endDate: addDays(addWeeks(new Date(), 2), 1),
            timezone: 'America/Chicago',
            location: 'Northwestern University, Evanston, IL',
            latitude: 42.0565,
            longitude: -87.6753,
            amount: 9000,
            depositPaid: 4500,
            balanceDue: 4500,
            paymentStatus: 'DEPOSIT_PAID',
            internalNotes: 'Confirmed via email, contract signed',
          },
        },
      },
    }),
    // Speaking in 3 weeks - Berklee
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[4].id,
        serviceType: 'SPEAKING',
        status: 'ACCEPTED',
        details: JSON.stringify({ duration: '2 hours', audience: 200 }),
        message: 'Guest lecture on contemporary a cappella',
        quotedAmount: 6500,
        quotedAt: subMonths(new Date(), 1),
        booking: {
          create: {
            leadId: pastClientLeads[4].id,
            serviceType: 'SPEAKING',
            status: 'CONFIRMED',
            startDate: addWeeks(new Date(), 3),
            endDate: addWeeks(new Date(), 3),
            timezone: 'America/New_York',
            location: 'Berklee Performance Center, Boston, MA',
            latitude: 42.3467,
            longitude: -71.0873,
            amount: 6500,
            depositPaid: 6500,
            balanceDue: 0,
            paymentStatus: 'PAID_IN_FULL',
            internalNotes: 'Annual guest lecture series',
          },
        },
      },
    }),
    // Group Coaching in 3 weeks - NYU
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[5].id,
        serviceType: 'GROUP_COACHING',
        status: 'ACCEPTED',
        details: JSON.stringify({ sessions: 3, groupSize: 20 }),
        message: 'Pre-competition intensive coaching',
        quotedAmount: 7500,
        quotedAt: addWeeks(new Date(), -2),
        booking: {
          create: {
            leadId: pastClientLeads[5].id,
            serviceType: 'GROUP_COACHING',
            status: 'CONFIRMED',
            startDate: addWeeks(new Date(), 3),
            endDate: addWeeks(new Date(), 4),
            timezone: 'America/New_York',
            location: 'NYU Tisch School, New York, NY',
            latitude: 40.7295,
            longitude: -73.9965,
            amount: 7500,
            depositPaid: 3750,
            balanceDue: 3750,
            paymentStatus: 'DEPOSIT_PAID',
            internalNotes: 'Virtual + 1 in-person session',
          },
        },
      },
    }),
    // Workshop in 4 weeks - SF Conservatory
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[6].id,
        serviceType: 'WORKSHOP',
        status: 'ACCEPTED',
        details: JSON.stringify({ duration: '1 day', participants: 40 }),
        message: 'Masterclass for advanced students',
        quotedAmount: 12000,
        quotedAt: addWeeks(new Date(), -1),
        booking: {
          create: {
            leadId: pastClientLeads[6].id,
            serviceType: 'WORKSHOP',
            status: 'CONFIRMED',
            startDate: addWeeks(new Date(), 4),
            endDate: addWeeks(new Date(), 4),
            timezone: 'America/Los_Angeles',
            location: 'SF Conservatory of Music, San Francisco, CA',
            latitude: 37.7849,
            longitude: -122.4194,
            amount: 12000,
            depositPaid: 12000,
            balanceDue: 0,
            paymentStatus: 'PAID_IN_FULL',
            internalNotes: 'Premium workshop package',
          },
        },
      },
    }),
    // Speaking in 4 weeks - U Chicago
    prisma.inquiry.create({
      data: {
        leadId: pastClientLeads[7].id,
        serviceType: 'SPEAKING',
        status: 'ACCEPTED',
        details: JSON.stringify({ duration: '90 minutes', audience: 100 }),
        message: 'Career development series for music students',
        quotedAmount: 5500,
        quotedAt: addWeeks(new Date(), -3),
        booking: {
          create: {
            leadId: pastClientLeads[7].id,
            serviceType: 'SPEAKING',
            status: 'CONFIRMED',
            startDate: addWeeks(new Date(), 4),
            endDate: addWeeks(new Date(), 4),
            timezone: 'America/Chicago',
            location: 'University of Chicago, Chicago, IL',
            latitude: 41.7886,
            longitude: -87.5987,
            amount: 5500,
            depositPaid: 2750,
            balanceDue: 2750,
            paymentStatus: 'DEPOSIT_PAID',
            internalNotes: 'Part of semester speaker series',
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${futureBookings.length} future confirmed bookings`);

  // ============================================
  // SAMPLE CAMPAIGN DATA
  // ============================================
  console.log('🎯 Creating sample campaign...');

  // Get one of the future bookings to base a campaign on
  const stanfordBooking = await prisma.booking.findFirst({
    where: { leadId: pastClientLeads[3].id },
    orderBy: { createdAt: 'desc' },
  });

  if (stanfordBooking) {
    const campaign = await prisma.campaign.create({
      data: {
        name: 'Chicago Area Workshop Tour - Winter 2026',
        baseLocation: 'Chicago, IL',
        latitude: 41.8781,
        longitude: -87.6298,
        radius: 100,
        status: 'DRAFT',
        startDate: addWeeks(new Date(), 2),
        endDate: addWeeks(new Date(), 3),
        bookingId: stanfordBooking.id,
      },
    });

    // Add some nearby leads to the campaign
    const chicagoAreaLeads = [pastClientLeads[3], pastClientLeads[7]];

    for (const lead of chicagoAreaLeads) {
      await prisma.campaignLead.create({
        data: {
          campaignId: campaign.id,
          leadId: lead.id,
          score: 85,
          distance: 15.5,
          source: 'PAST_CLIENT',
          status: 'PENDING',
        },
      });
    }

    console.log(`✅ Created campaign with ${chicagoAreaLeads.length} leads`);
  }

  // ============================================
  // SAMPLE ANALYTICS DATA
  // ============================================
  console.log('📊 Creating sample analytics...');

  const analyticsEvents = await prisma.analyticsEvent.createMany({
    data: [
      {
        eventType: 'page_view',
        eventData: JSON.stringify({ page: '/workshop', source: 'organic' }),
        leadId: newLeads[0].id,
      },
      {
        eventType: 'chat_started',
        eventData: JSON.stringify({ page: '/coaching' }),
        leadId: newLeads[1].id,
      },
      {
        eventType: 'booking_completed',
        eventData: JSON.stringify({ serviceType: 'WORKSHOP', amount: 9000 }),
        leadId: pastClientLeads[3].id,
      },
    ],
  });

  console.log(`✅ Created ${analyticsEvents.count} analytics events`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 SEED COMPLETE!\n');
  console.log('Summary:');
  console.log(`  - ${pastClientLeads.length} past client leads (WON status)`);
  console.log(`  - ${dormantLeads.length} dormant leads (6+ months inactive)`);
  console.log(`  - ${newLeads.length} new/cold leads`);
  console.log(`  - ${futureBookings.length} confirmed future bookings`);
  console.log(`  - ${templates.count} message templates`);
  console.log(`  - ${geoPreferences.count} geo preferences`);
  console.log('');
  console.log('All leads have proper geographic coordinates!');
  console.log('Ready for Opportunity Finder MVP testing.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
