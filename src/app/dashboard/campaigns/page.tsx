"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignTable, Campaign } from "@/components/campaigns/campaign-table";
import { Plus, Search } from "lucide-react";

// Mock data - replace with actual API call
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Spring 2025 Workshop Tour",
    location: "San Francisco, CA",
    radiusMiles: 100,
    status: "ACTIVE",
    leadCount: 45,
    createdAt: new Date("2025-01-10").toISOString(),
  },
  {
    id: "2",
    name: "Summer Masterclass Series",
    location: "New York, NY",
    radiusMiles: 150,
    status: "APPROVED",
    leadCount: 32,
    createdAt: new Date("2025-01-08").toISOString(),
  },
  {
    id: "3",
    name: "Fall Coaching Program",
    location: "Los Angeles, CA",
    radiusMiles: 120,
    status: "DRAFT",
    leadCount: 0,
    createdAt: new Date("2025-01-05").toISOString(),
  },
  {
    id: "4",
    name: "Winter Speaking Tour",
    location: "Chicago, IL",
    radiusMiles: 80,
    status: "COMPLETED",
    leadCount: 67,
    createdAt: new Date("2024-12-15").toISOString(),
  },
  {
    id: "5",
    name: "Holiday Arrangements Special",
    location: "Boston, MA",
    radiusMiles: 90,
    status: "CANCELLED",
    leadCount: 12,
    createdAt: new Date("2024-12-01").toISOString(),
  },
  {
    id: "6",
    name: "East Coast Tour",
    location: "Philadelphia, PA",
    radiusMiles: 110,
    status: "ACTIVE",
    leadCount: 38,
    createdAt: new Date("2025-01-12").toISOString(),
  },
  {
    id: "7",
    name: "Midwest Workshop Series",
    location: "Minneapolis, MN",
    radiusMiles: 130,
    status: "ACTIVE",
    leadCount: 29,
    createdAt: new Date("2025-01-11").toISOString(),
  },
  {
    id: "8",
    name: "West Coast Masterclass",
    location: "Seattle, WA",
    radiusMiles: 95,
    status: "APPROVED",
    leadCount: 22,
    createdAt: new Date("2025-01-09").toISOString(),
  },
];

export default function CampaignsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter campaigns based on search and status
  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (campaign: Campaign) => {
    router.push(`/dashboard/campaigns/${campaign.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Manage your outreach campaigns and discover new leads
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Campaigns
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredCampaigns.length} {filteredCampaigns.length === 1 ? "campaign" : "campaigns"})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignTable
            campaigns={filteredCampaigns}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}
