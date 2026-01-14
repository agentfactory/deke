"use client";

import { useRouter } from "next/navigation";
import { CampaignTable, Campaign } from "./campaign-table";

interface DashboardCampaignTableProps {
  campaigns: Campaign[];
}

export function DashboardCampaignTable({ campaigns }: DashboardCampaignTableProps) {
  const router = useRouter();

  const handleRowClick = (campaign: Campaign) => {
    router.push(`/dashboard/campaigns/${campaign.id}`);
  };

  return <CampaignTable campaigns={campaigns} onRowClick={handleRowClick} />;
}
