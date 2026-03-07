"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CampaignForm, CampaignFormValues } from "@/components/campaigns/campaign-form";

interface CampaignData {
  id: string;
  name: string;
  baseLocation: string;
  radius: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

export default function CampaignEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${id}`);
        if (!response.ok) throw new Error("Failed to fetch campaign");
        const data = await response.json();
        setCampaign(data);
      } catch (err) {
        setError("Failed to load campaign");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleSubmit = async (values: CampaignFormValues) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          baseLocation: values.location,
          radius: values.radiusMiles,
          startDate: values.startDate,
          endDate: values.endDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update campaign");
      }

      router.push(`/dashboard/campaigns/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{error || "Campaign not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only allow editing DRAFT and APPROVED campaigns
  if (campaign.status !== "DRAFT" && campaign.status !== "APPROVED") {
    return (
      <div className="space-y-6">
        <Link href={`/dashboard/campaigns/${id}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Cannot edit a campaign with status "{campaign.status}". Only DRAFT and APPROVED campaigns can be edited.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initialValues: Partial<CampaignFormValues> = {
    name: campaign.name,
    location: campaign.baseLocation,
    radiusMiles: campaign.radius,
    startDate: campaign.startDate
      ? new Date(campaign.startDate).toISOString().split("T")[0]
      : "",
    endDate: campaign.endDate
      ? new Date(campaign.endDate).toISOString().split("T")[0]
      : "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/campaigns/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold">Edit Campaign</h1>
          <p className="text-muted-foreground mt-1">{campaign.name}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignForm
            onSubmit={(values, _isDraft) => handleSubmit(values)}
            initialValues={initialValues}
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
