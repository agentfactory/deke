import { Campaign as PrismaCampaign } from '@prisma/client';
import { Campaign as ComponentCampaign } from '@/components/campaigns/campaign-table';

type CampaignWithCount = PrismaCampaign & {
  _count: {
    leads: number;
  };
};

export function mapCampaignToComponent(
  campaign: CampaignWithCount
): ComponentCampaign {
  return {
    id: campaign.id,
    name: campaign.name,
    location: campaign.baseLocation,
    radiusMiles: campaign.radius,
    status: campaign.status as ComponentCampaign['status'],
    leadCount: campaign._count.leads,
    createdAt: campaign.createdAt.toISOString(),
  };
}

export function mapCampaignsToComponent(
  campaigns: CampaignWithCount[]
): ComponentCampaign[] {
  return campaigns.map(mapCampaignToComponent);
}
