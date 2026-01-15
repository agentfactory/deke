"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Target,
  Users,
  Mail,
  TrendingUp,
  Play,
  Pause,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Campaign {
  id: string;
  name: string;
  baseLocation: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    serviceType: string;
    startDate: string | null;
    location: string;
  };
  leads: Array<{
    id: string;
    score: number;
    status: string;
    lead: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      organization: string | null;
      status: string;
      score: number;
    };
  }>;
  _count: {
    leads: number;
    outreachLogs: number;
  };
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params); // Unwrap the Promise
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false);

  const fetchCampaign = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/campaigns/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch campaign");
      }

      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign) return;

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update campaign status");
      }

      await fetchCampaign();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update campaign status");
    }
  };

  const handleLaunch = async () => {
    if (!campaign) return;

    try {
      setShowLaunchConfirm(false);

      const response = await fetch(`/api/campaigns/${campaign.id}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "EMAIL" // Default to email; could make this configurable
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to launch campaign");
      }

      const result = await response.json();

      // Show success message with details
      alert(`Campaign launched! Sent: ${result.sent}, Failed: ${result.failed}`);

      // Refresh campaign data to show new status and outreach logs
      await fetchCampaign();
    } catch (err) {
      console.error("Error launching campaign:", err);
      alert(err instanceof Error ? err.message : "Failed to launch campaign");
    }
  };

  const handleDiscoverLeads = async () => {
    if (!campaign) return;

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("Failed to discover leads");
      }

      const result = await response.json();
      alert(`Discovered ${result.newLeadsCount} new leads!`);
      await fetchCampaign(); // Refresh to show new leads
    } catch (err) {
      console.error("Error discovering leads:", err);
      alert("Failed to discover leads");
    }
  };

  const handleSendOutreach = () => {
    // For now, show the launch confirmation dialog
    // TODO: In Phase 2, this will open lead selection dialog for targeted outreach
    if (campaign?.status === "APPROVED") {
      setShowLaunchConfirm(true);
    } else if (campaign?.status === "ACTIVE") {
      alert("Campaign already launched. Use lead selection (coming in Phase 2) for targeted follow-ups.");
    } else {
      alert("Campaign must be approved before launching outreach.");
    }
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics page (when implemented)
    // For now, show a placeholder message
    alert("Analytics dashboard coming soon! Will show open rates, click rates, and conversion metrics.");
  };

  const handleDelete = async () => {
    if (!campaign) return;

    if (
      !confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete campaign");
      }

      router.push("/dashboard/campaigns");
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete campaign. Make sure it's not active."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "secondary",
      APPROVED: "outline",
      ACTIVE: "default",
      PAUSED: "secondary",
      COMPLETED: "outline",
      CANCELLED: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-heading text-3xl font-bold">Campaign Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {error || "The campaign you're looking for doesn't exist."}
            </p>
            <div className="mt-4">
              <Link href="/dashboard/campaigns">
                <Button>Back to Campaigns</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold">{campaign.name}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-muted-foreground mt-2">
              Created {new Date(campaign.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          {/* Status action buttons with help text */}
          {campaign.status === "DRAFT" && (
            <div className="flex flex-col gap-2">
              <Button onClick={() => handleStatusChange("APPROVED")}>
                <Play className="h-4 w-4 mr-2" />
                Approve Campaign
              </Button>
              <p className="text-sm text-muted-foreground">
                Review leads and campaign details before launching outreach
              </p>
            </div>
          )}
          {campaign.status === "APPROVED" && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowLaunchConfirm(true)}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Launch Outreach
              </Button>
              <p className="text-sm text-muted-foreground">
                ⚠️ This will send messages to {campaign._count?.leads || 0} leads. Cannot be undone.
              </p>
            </div>
          )}

          {/* Action buttons row */}
          <div className="flex items-center gap-2">
            {campaign.status === "ACTIVE" && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange("PAUSED")}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {campaign.status === "PAUSED" && (
              <Button onClick={() => handleStatusChange("ACTIVE")}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            <Button variant="outline" size="icon" disabled>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting || campaign.status === "ACTIVE"}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign._count.leads}</div>
            <p className="text-xs text-muted-foreground">
              Discovered in campaign area
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.leads.filter((l) => l.status === "CONTACTED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaign._count.outreachLogs} total outreach attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engaged</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                campaign.leads.filter(
                  (l) => l.status === "RESPONDED" || l.status === "INTERESTED"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Responded or expressed interest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.leads.length > 0
                ? Math.round(
                    campaign.leads.reduce((sum, l) => sum + l.score, 0) /
                      campaign.leads.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Lead quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location & Radius</p>
                <p className="text-sm text-muted-foreground">
                  {campaign.baseLocation}
                </p>
                <p className="text-sm text-muted-foreground">
                  {campaign.radius} miles radius
                </p>
              </div>
            </div>

            {(campaign.startDate || campaign.endDate) && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Campaign Period</p>
                  <p className="text-sm text-muted-foreground">
                    {campaign.startDate
                      ? new Date(campaign.startDate).toLocaleDateString()
                      : "Not set"}{" "}
                    -{" "}
                    {campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
              </div>
            )}

            {campaign.booking && (
              <div className="pt-2 border-t">
                <p className="font-medium text-sm mb-2">Linked Booking</p>
                <Link href={`/dashboard/bookings`}>
                  <Button variant="outline" size="sm">
                    View Booking Details
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleSendOutreach}
              disabled={!campaign || campaign.status === "DRAFT"}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Outreach Emails
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleDiscoverLeads}
              disabled={!campaign}
            >
              <Target className="h-4 w-4 mr-2" />
              Discover More Leads
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleViewAnalytics}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discovered Leads ({campaign.leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No leads discovered yet</p>
              <p className="text-sm mt-2">
                Activate this campaign to start discovering leads in the target area
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaign.leads.slice(0, 10).map((campaignLead) => (
                <div
                  key={campaignLead.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">
                        {campaignLead.lead.firstName}{" "}
                        {campaignLead.lead.lastName}
                      </p>
                      <Badge variant="outline">{campaignLead.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {campaignLead.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{campaignLead.lead.email}</span>
                      {campaignLead.lead.phone && (
                        <span>{campaignLead.lead.phone}</span>
                      )}
                      {campaignLead.lead.organization && (
                        <span>{campaignLead.lead.organization}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" disabled>
                    Contact
                  </Button>
                </div>
              ))}
              {campaign.leads.length > 10 && (
                <p className="text-center text-sm text-muted-foreground pt-4">
                  Showing 10 of {campaign.leads.length} leads
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Launch Confirmation Dialog */}
      <Dialog open={showLaunchConfirm} onOpenChange={setShowLaunchConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch Campaign Outreach?</DialogTitle>
            <DialogDescription>
              This will start sending messages to leads. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-start gap-2">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-medium">Approve campaign for launch</p>
                <p className="text-sm text-muted-foreground">Campaign has been reviewed and is ready</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="font-medium">Send outreach to {campaign?._count?.leads || 0} pending leads</p>
                <p className="text-sm text-muted-foreground">Messages will be sent via configured channels</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-amber-600">
              <AlertTriangle className="h-6 w-6 mt-1" />
              <div>
                <p className="font-medium">This action cannot be undone</p>
                <p className="text-sm">Once launched, the campaign will actively send messages</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLaunchConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLaunch}
            >
              Confirm Launch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
