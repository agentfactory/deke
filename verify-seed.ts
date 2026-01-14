import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('\n📊 Database Verification:');
  console.log('=======================\n');

  const totalLeads = await prisma.lead.count();
  const pastClients = await prisma.lead.count({ where: { status: 'WON' } });
  const dormant = await prisma.lead.count({ where: { status: 'DORMANT' } });
  const newLeads = await prisma.lead.count({ where: { status: 'NEW' } });

  const totalBookings = await prisma.booking.count();
  const confirmed = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
  const completed = await prisma.booking.count({ where: { status: 'COMPLETED' } });

  const templates = await prisma.messageTemplate.count();
  const campaigns = await prisma.campaign.count();
  const geoPrefs = await prisma.geoPreference.count();

  console.log('✅ Total Leads:', totalLeads);
  console.log('   - Past Clients (WON):', pastClients);
  console.log('   - Dormant:', dormant);
  console.log('   - New:', newLeads);
  console.log('');
  console.log('✅ Total Bookings:', totalBookings);
  console.log('   - Confirmed (Future):', confirmed);
  console.log('   - Completed (Past):', completed);
  console.log('');
  console.log('✅ Message Templates:', templates);
  console.log('✅ Campaigns:', campaigns);
  console.log('✅ Geo Preferences:', geoPrefs);

  // Sample leads with proper coordinates
  console.log('\n📍 Sample Leads with Geocoding:\n');

  const sampleLeads = await prisma.lead.findMany({
    take: 5,
    select: {
      firstName: true,
      lastName: true,
      organization: true,
      status: true,
      latitude: true,
      longitude: true,
    },
  });

  sampleLeads.forEach(lead => {
    console.log(`${lead.firstName} ${lead.lastName} - ${lead.organization}`);
    console.log(`  Status: ${lead.status}, Coords: (${lead.latitude}, ${lead.longitude})\n`);
  });

  // Sample future bookings
  console.log('📅 Future Confirmed Bookings:\n');

  const futureBookings = await prisma.booking.findMany({
    where: { status: 'CONFIRMED' },
    include: { lead: true },
  });

  futureBookings.forEach(booking => {
    console.log(`${booking.serviceType} - ${booking.lead.organization}`);
    console.log(`  Date: ${booking.startDate?.toLocaleDateString()}, Amount: $${booking.amount}`);
    console.log(`  Location: ${booking.location}\n`);
  });

  await prisma.$disconnect();
  console.log('✅ Verification complete!\n');
}

verify().catch((e) => {
  console.error('❌ Verification failed:', e);
  process.exit(1);
});
