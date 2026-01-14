/**
 * Script to seed recommendation rules into the database
 *
 * Run with: npx tsx scripts/seed-recommendations.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RuleDefinition {
  name: string
  triggerServiceType?: string
  recommendedService: string
  orgTypes?: string[]
  weight: number
  priority: number
  pitchPoints: string[]
}

const SERVICE_TO_SERVICE_RULES: RuleDefinition[] = [
  {
    name: 'Workshop → Masterclass',
    triggerServiceType: 'WORKSHOP',
    recommendedService: 'MASTERCLASS',
    weight: 1.5,
    priority: 8,
    pitchPoints: ['Deeper dive into advanced techniques', 'Certification opportunity', 'Intensive learning experience', 'Perfect for ensemble leaders'],
  },
  {
    name: 'Speaking → Workshop',
    triggerServiceType: 'SPEAKING',
    recommendedService: 'WORKSHOP',
    weight: 1.3,
    priority: 7,
    pitchPoints: ['Hands-on learning for your team', 'Team building opportunity', 'Practical skills development', 'Interactive follow-up'],
  },
  {
    name: 'Masterclass → Individual Coaching',
    triggerServiceType: 'MASTERCLASS',
    recommendedService: 'INDIVIDUAL_COACHING',
    weight: 1.2,
    priority: 6,
    pitchPoints: ['Personalized guidance', 'One-on-one attention', 'Tailored to your specific needs', 'Accelerated skill development'],
  },
  {
    name: 'Workshop → Group Coaching',
    triggerServiceType: 'WORKSHOP',
    recommendedService: 'GROUP_COACHING',
    weight: 1.2,
    priority: 7,
    pitchPoints: ['Ongoing support for your ensemble', 'Regular progress check-ins', 'Long-term skill building', 'Ensemble cohesion'],
  },
  {
    name: 'Group Coaching → Speaking',
    triggerServiceType: 'GROUP_COACHING',
    recommendedService: 'SPEAKING',
    weight: 1.1,
    priority: 5,
    pitchPoints: ['Inspire your broader community', 'Share success stories', 'Motivational presentation', 'Event centerpiece'],
  },
  {
    name: 'Consultation → Workshop',
    triggerServiceType: 'CONSULTATION',
    recommendedService: 'WORKSHOP',
    weight: 1.3,
    priority: 7,
    pitchPoints: ['Put consultation insights into action', 'Team implementation support', 'Practical skill-building', 'Natural next step'],
  },
  {
    name: 'Speaking → Consultation',
    triggerServiceType: 'SPEAKING',
    recommendedService: 'CONSULTATION',
    weight: 1.0,
    priority: 5,
    pitchPoints: ['Strategic planning session', 'Customized roadmap', 'Expert guidance', 'Organizational assessment'],
  },
  {
    name: 'Arrangement → Workshop',
    triggerServiceType: 'ARRANGEMENT',
    recommendedService: 'WORKSHOP',
    weight: 1.0,
    priority: 5,
    pitchPoints: ['Learn arrangement techniques', 'Bring arrangements to life', 'Performance preparation', 'Vocal skill development'],
  },
]

const ORG_BASED_RULES: RuleDefinition[] = [
  {
    name: 'University/College → Group Coaching',
    recommendedService: 'GROUP_COACHING',
    orgTypes: ['UNIVERSITY', 'COLLEGE'],
    weight: 1.2,
    priority: 6,
    pitchPoints: ['Student ensemble development', 'Semester-long support', 'Performance preparation', 'Competition readiness'],
  },
  {
    name: 'University/College → Masterclass',
    recommendedService: 'MASTERCLASS',
    orgTypes: ['UNIVERSITY', 'COLLEGE'],
    weight: 1.3,
    priority: 7,
    pitchPoints: ['Advanced vocal techniques', 'Student enrichment', 'Guest artist experience', 'Educational excellence'],
  },
  {
    name: 'High School → Workshop',
    recommendedService: 'WORKSHOP',
    orgTypes: ['HIGH_SCHOOL'],
    weight: 1.3,
    priority: 7,
    pitchPoints: ['Student engagement', 'Curriculum alignment', 'Fun and educational', 'Performance skills'],
  },
  {
    name: 'Church → Arrangement',
    recommendedService: 'ARRANGEMENT',
    orgTypes: ['CHURCH', 'SYNAGOGUE', 'TEMPLE', 'MOSQUE'],
    weight: 1.1,
    priority: 6,
    pitchPoints: ['Custom sacred music', 'Perfect for your choir', 'Worship enhancement', 'Congregation engagement'],
  },
  {
    name: 'Corporate → Speaking',
    recommendedService: 'SPEAKING',
    orgTypes: ['CORPORATE'],
    weight: 1.2,
    priority: 7,
    pitchPoints: ['Team inspiration', 'Leadership insights', 'Conference highlight', 'Professional development'],
  },
  {
    name: 'Conservatory → Individual Coaching',
    recommendedService: 'INDIVIDUAL_COACHING',
    orgTypes: ['CONSERVATORY', 'MUSIC_SCHOOL'],
    weight: 1.2,
    priority: 6,
    pitchPoints: ['Professional development', 'Career guidance', 'Technical mastery', 'Industry insights'],
  },
  {
    name: 'Community Group → Workshop',
    recommendedService: 'WORKSHOP',
    orgTypes: ['COMMUNITY_CENTER', 'CHOIR', 'NONPROFIT'],
    weight: 1.0,
    priority: 5,
    pitchPoints: ['Community building', 'Accessible learning', 'Group bonding', 'Fun for all levels'],
  },
  {
    name: 'Theatre → Speaking',
    recommendedService: 'SPEAKING',
    orgTypes: ['THEATRE', 'THEATER', 'PERFORMING_ARTS'],
    weight: 1.1,
    priority: 6,
    pitchPoints: ['Vocal performance insights', 'Industry expertise', 'Artistic inspiration', 'Professional perspective'],
  },
  {
    name: 'Festival/Conference → Speaking',
    recommendedService: 'SPEAKING',
    orgTypes: ['FESTIVAL', 'CONFERENCE', 'CONVENTION'],
    weight: 1.3,
    priority: 8,
    pitchPoints: ['Keynote presentation', 'Event highlight', 'Attendee engagement', 'Industry thought leadership'],
  },
  {
    name: 'Arts Center → Workshop',
    recommendedService: 'WORKSHOP',
    orgTypes: ['ARTS_CENTER', 'PERFORMING_ARTS'],
    weight: 1.1,
    priority: 6,
    pitchPoints: ['Community engagement', 'Arts education', 'Public programming', 'Artist development'],
  },
]

async function main() {
  console.log('🌱 Seeding recommendation rules...\n')

  const allRules = [...SERVICE_TO_SERVICE_RULES, ...ORG_BASED_RULES]
  let createdCount = 0

  for (const rule of allRules) {
    const existing = await prisma.serviceRecommendation.findFirst({
      where: { name: rule.name },
    })

    if (existing) {
      console.log(`Skipping existing rule: ${rule.name}`)
      continue
    }

    await prisma.serviceRecommendation.create({
      data: {
        name: rule.name,
        triggerServiceType: rule.triggerServiceType || null,
        recommendedService: rule.recommendedService,
        orgTypes: rule.orgTypes ? JSON.stringify(rule.orgTypes) : null,
        weight: rule.weight,
        priority: rule.priority,
        pitchPoints: JSON.stringify(rule.pitchPoints),
        active: true,
      },
    })

    createdCount++
    console.log(`Created rule: ${rule.name}`)
  }

  const rules = await prisma.serviceRecommendation.findMany({ where: { active: true } })
  const serviceToService = rules.filter((r) => r.triggerServiceType !== null)
  const orgBased = rules.filter((r) => r.triggerServiceType === null)

  console.log(`\n✅ Successfully seeded ${createdCount} recommendation rules (${allRules.length - createdCount} already existed)`)
  console.log('\n📊 Rule Summary:')
  console.log(`   Total active rules: ${rules.length}`)
  console.log(`   Service-to-service: ${serviceToService.length}`)
  console.log(`   Organization-based: ${orgBased.length}`)
  console.log('\n   By Priority:')
  console.log(`   High (8-10): ${rules.filter((r) => r.priority >= 8).length}`)
  console.log(`   Medium (5-7): ${rules.filter((r) => r.priority >= 5 && r.priority < 8).length}`)
  console.log(`   Low (1-4): ${rules.filter((r) => r.priority < 5).length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
