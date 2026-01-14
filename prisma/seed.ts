import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed GeoPreference data with default radii
  console.log('📍 Seeding GeoPreference data...')

  const geoPreferences = [
    { country: 'USA', defaultRadius: 100, unit: 'miles' },      // Per user request
    { country: 'Japan', defaultRadius: 50, unit: 'km' },
    { country: 'UK', defaultRadius: 80, unit: 'km' },
    { country: 'Canada', defaultRadius: 100, unit: 'km' },
    { country: 'Australia', defaultRadius: 100, unit: 'km' },
    { country: 'Germany', defaultRadius: 80, unit: 'km' },
    { country: 'France', defaultRadius: 80, unit: 'km' },
    { country: 'Italy', defaultRadius: 80, unit: 'km' },
    { country: 'Spain', defaultRadius: 80, unit: 'km' },
    { country: 'Netherlands', defaultRadius: 60, unit: 'km' },
  ]

  for (const geo of geoPreferences) {
    await prisma.geoPreference.upsert({
      where: { country: geo.country },
      update: {
        defaultRadius: geo.defaultRadius,
        unit: geo.unit,
        enabled: true
      },
      create: geo,
    })
    console.log(`  ✅ ${geo.country}: ${geo.defaultRadius} ${geo.unit}`)
  }

  console.log(`\n✅ Seeded ${geoPreferences.length} GeoPreference records`)
  console.log('\n🎉 Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
