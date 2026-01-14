import { prisma } from '@/lib/db';
import { CampaignsClient } from './campaigns-client';
import { mapCampaignsToComponent } from '@/lib/mappers/campaign';
import type { Campaign } from '@/components/campaigns/campaign-table';

export default async function CampaignsPage() {
  let campaigns: Campaign[] = [];

  try {
    const campaignsData = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { leads: true } }
      }
    });

    // Transform to component format
    campaigns = mapCampaignsToComponent(campaignsData);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    // campaigns remains empty array
  }

  return <CampaignsClient initialCampaigns={campaigns} />;
}
