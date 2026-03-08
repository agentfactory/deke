"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Users, LinkIcon, Rocket } from "lucide-react";
import type { Campaign } from "@/components/campaigns/campaign-table";

interface CampaignsClientProps {
  initialCampaigns: Campaign[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-700 border-stone-200",
  APPROVED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PAUSED: "bg-amber-100 text-amber-800 border-amber-200",
  COMPLETED: "bg-sky-100 text-sky-800 border-sky-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CampaignsClient({ initialCampaigns }: CampaignsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredCampaigns = initialCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Inline filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-xl border border-slate-200 p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-0 shadow-none focus-visible:ring-0 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 border-slate-200">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign count */}
      <p className="text-sm text-[#888]">
        {filteredCampaigns.length}{" "}
        {filteredCampaigns.length === 1 ? "campaign" : "campaigns"}
      </p>

      {/* Campaign cards */}
      {filteredCampaigns.length > 0 ? (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/dashboard/campaigns/${campaign.id}`);
                }
              }}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Left: name + booking link */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1a1a1a] truncate">
                      {campaign.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium shrink-0 ${
                        STATUS_STYLES[campaign.status] || ""
                      }`}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-[#999]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {campaign.location}
                    </span>
                    <span>{campaign.radiusMiles} mi</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {campaign.leadCount}{" "}
                      {campaign.leadCount === 1 ? "lead" : "leads"}
                    </span>
                  </div>
                  {campaign.booking && (
                    <div className="mt-1.5">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal gap-1 border-[#E8E4DD]"
                      >
                        <LinkIcon className="h-3 w-3" />
                        {campaign.booking.clientName} -{" "}
                        {campaign.booking.serviceType.replace("_", " ")}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Right: date */}
                <div className="shrink-0 text-right text-xs text-[#BBB]">
                  {formatDate(campaign.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <Rocket className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">
            No campaigns found
          </h3>
          <p className="text-sm text-[#888] max-w-sm">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your filters."
              : "Create your first campaign to start discovering leads."}
          </p>
        </div>
      )}
    </div>
  );
}
