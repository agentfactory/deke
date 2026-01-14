/**
 * Seed recommendation rules via API
 * Usage: node scripts/seed-via-api.js <API_URL>
 */

const API_URL = process.argv[2] || 'http://localhost:3000'

const SERVICE_RULES = [
  { name: 'Workshop → Masterclass', triggerServiceType: 'WORKSHOP', recommendedService: 'MASTERCLASS', weight: 1.5, priority: 8, pitchPoints: ['Deeper dive into advanced techniques', 'Certification opportunity', 'Intensive learning experience', 'Perfect for ensemble leaders'] },
  { name: 'Speaking → Workshop', triggerServiceType: 'SPEAKING', recommendedService: 'WORKSHOP', weight: 1.3, priority: 7, pitchPoints: ['Hands-on learning for your team', 'Team building opportunity', 'Practical skills development', 'Interactive follow-up'] },
  { name: 'Masterclass → Individual Coaching', triggerServiceType: 'MASTERCLASS', recommendedService: 'INDIVIDUAL_COACHING', weight: 1.2, priority: 6, pitchPoints: ['Personalized guidance', 'One-on-one attention', 'Tailored to your specific needs', 'Accelerated skill development'] },
  { name: 'Workshop → Group Coaching', triggerServiceType: 'WORKSHOP', recommendedService: 'GROUP_COACHING', weight: 1.2, priority: 7, pitchPoints: ['Ongoing support for your ensemble', 'Regular progress check-ins', 'Long-term skill building', 'Ensemble cohesion'] },
  { name: 'Group Coaching → Speaking', triggerServiceType: 'GROUP_COACHING', recommendedService: 'SPEAKING', weight: 1.1, priority: 5, pitchPoints: ['Inspire your broader community', 'Share success stories', 'Motivational presentation', 'Event centerpiece'] },
  { name: 'Consultation → Workshop', triggerServiceType: 'CONSULTATION', recommendedService: 'WORKSHOP', weight: 1.3, priority: 7, pitchPoints: ['Put consultation insights into action', 'Team implementation support', 'Practical skill-building', 'Natural next step'] },
  { name: 'Speaking → Consultation', triggerServiceType: 'SPEAKING', recommendedService: 'CONSULTATION', weight: 1.0, priority: 5, pitchPoints: ['Strategic planning session', 'Customized roadmap', 'Expert guidance', 'Organizational assessment'] },
  { name: 'Arrangement → Workshop', triggerServiceType: 'ARRANGEMENT', recommendedService: 'WORKSHOP', weight: 1.0, priority: 5, pitchPoints: ['Learn arrangement techniques', 'Bring arrangements to life', 'Performance preparation', 'Vocal skill development'] },
]

const ORG_RULES = [
  { name: 'University/College → Group Coaching', recommendedService: 'GROUP_COACHING', orgTypes: ['UNIVERSITY', 'COLLEGE'], weight: 1.2, priority: 6, pitchPoints: ['Student ensemble development', 'Semester-long support', 'Performance preparation', 'Competition readiness'] },
  { name: 'University/College → Masterclass', recommendedService: 'MASTERCLASS', orgTypes: ['UNIVERSITY', 'COLLEGE'], weight: 1.3, priority: 7, pitchPoints: ['Advanced vocal techniques', 'Student enrichment', 'Guest artist experience', 'Educational excellence'] },
  { name: 'High School → Workshop', recommendedService: 'WORKSHOP', orgTypes: ['HIGH_SCHOOL'], weight: 1.3, priority: 7, pitchPoints: ['Student engagement', 'Curriculum alignment', 'Fun and educational', 'Performance skills'] },
  { name: 'Church → Arrangement', recommendedService: 'ARRANGEMENT', orgTypes: ['CHURCH', 'SYNAGOGUE', 'TEMPLE', 'MOSQUE'], weight: 1.1, priority: 6, pitchPoints: ['Custom sacred music', 'Perfect for your choir', 'Worship enhancement', 'Congregation engagement'] },
  { name: 'Corporate → Speaking', recommendedService: 'SPEAKING', orgTypes: ['CORPORATE'], weight: 1.2, priority: 7, pitchPoints: ['Team inspiration', 'Leadership insights', 'Conference highlight', 'Professional development'] },
  { name: 'Conservatory → Individual Coaching', recommendedService: 'INDIVIDUAL_COACHING', orgTypes: ['CONSERVATORY', 'MUSIC_SCHOOL'], weight: 1.2, priority: 6, pitchPoints: ['Professional development', 'Career guidance', 'Technical mastery', 'Industry insights'] },
  { name: 'Community Group → Workshop', recommendedService: 'WORKSHOP', orgTypes: ['COMMUNITY_CENTER', 'CHOIR', 'NONPROFIT'], weight: 1.0, priority: 5, pitchPoints: ['Community building', 'Accessible learning', 'Group bonding', 'Fun for all levels'] },
  { name: 'Theatre → Speaking', recommendedService: 'SPEAKING', orgTypes: ['THEATRE', 'THEATER', 'PERFORMING_ARTS'], weight: 1.1, priority: 6, pitchPoints: ['Vocal performance insights', 'Industry expertise', 'Artistic inspiration', 'Professional perspective'] },
  { name: 'Festival/Conference → Speaking', recommendedService: 'SPEAKING', orgTypes: ['FESTIVAL', 'CONFERENCE', 'CONVENTION'], weight: 1.3, priority: 8, pitchPoints: ['Keynote presentation', 'Event highlight', 'Attendee engagement', 'Industry thought leadership'] },
  { name: 'Arts Center → Workshop', recommendedService: 'WORKSHOP', orgTypes: ['ARTS_CENTER', 'PERFORMING_ARTS'], weight: 1.1, priority: 6, pitchPoints: ['Community engagement', 'Arts education', 'Public programming', 'Artist development'] },
]

async function seedRules() {
  const allRules = [...SERVICE_RULES, ...ORG_RULES]
  let created = 0
  let skipped = 0

  console.log(`🌱 Seeding ${allRules.length} recommendation rules to ${API_URL}...\n`)

  for (const rule of allRules) {
    try {
      const response = await fetch(`${API_URL}/api/recommendations/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      })

      if (response.ok) {
        console.log(`✅ Created: ${rule.name}`)
        created++
      } else if (response.status === 400) {
        const error = await response.json()
        if (error.error.includes('already exists')) {
          console.log(`⏭️  Skipped: ${rule.name} (already exists)`)
          skipped++
        } else {
          console.log(`❌ Error: ${rule.name} - ${error.error}`)
        }
      } else {
        console.log(`❌ Failed: ${rule.name} (HTTP ${response.status})`)
      }
    } catch (error) {
      console.log(`❌ Error: ${rule.name} - ${error.message}`)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Created: ${created}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${allRules.length}`)
}

seedRules().catch(console.error)
