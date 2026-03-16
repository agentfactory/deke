"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Target,
  Users,
  Mail,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesTab } from "@/components/campaigns/messages-tab";
import { LeadsTableSelectable } from "@/components/campaigns/leads-table-selectable";
import { BulkActionsToolbar } from "@/components/campaigns/bulk-actions-toolbar";
// SourceStats removed - diagnostics simplified
import { DraftsTab } from "@/components/campaigns/drafts-tab";

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
    distance: number | null;
    source: string;
    status: string;
    recommendedServices: string | null;
    recommendationReason: string | null;
    lead: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      organization: string | null;
      status: string;
      score: number;
      emailVerified?: boolean;
      needsEnrichment?: boolean;
      website?: string | null;
    };
    outreachLogs: Array<{
      id: string;
      channel: string;
      status: string;
      sentAt: string | null;
      openedAt: string | null;
      clickedAt: string | null;
      respondedAt: string | null;
      errorMessage: string | null;
    }>;
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Campaign['leads']>([]);

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

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  const handleDiscoverLeads = async () => {
    if (!campaign) return;

    try {
      setIsDiscovering(true);
      setDiscoveryResult(null);
      const response = await fetch(`/api/campaigns/${campaign.id}/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to discover leads");
      }

      const result = await response.json();
      setDiscoveryResult(result);

      if (result.discovered?.total === 0) {
        // Don't use alert — the UI will show diagnostics inline
        console.warn("Discovery returned 0 leads. Diagnostics:", result.diagnostics);
      }

      await fetchCampaign();
    } catch (err) {
      console.error("Error discovering leads:", err);
      setDiscoveryResult({ error: err instanceof Error ? err.message : "Failed to discover leads" });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;

    try {
      setIsDeleting(true);
      setShowDeleteConfirm(false);
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
      READY: "default",
      APPROVED: "outline",
      ACTIVE: "default",
      SENDING: "default",
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
              {campaign.startDate && campaign.endDate && (
                <span>
                  {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' - '}
                  {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' . '}
                </span>
              )}
              {campaign.radius}mi radius . {campaign._count.leads} contacts found
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          {/* Status action buttons with help text */}
          {campaign.status === "DRAFT" && (
            <div className="flex flex-col gap-2">
              <Button onClick={handleDiscoverLeads} disabled={isDiscovering}>
                {isDiscovering ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Discovering...</>
                ) : (
                  <><Target className="h-4 w-4 mr-2" />Discover & Draft</>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Find leads, enrich contacts, and generate email drafts
              </p>
            </div>
          )}
          {(campaign.status === "READY" || campaign.status === "APPROVED") && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowLaunchConfirm(true)}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Send All Emails
              </Button>
              <p className="text-sm text-muted-foreground">
                Review drafts first, then send to {campaign._count?.leads || 0} leads
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
              disabled={campaign.status !== "DRAFT" && campaign.status !== "APPROVED"}
              title={campaign.status !== "DRAFT" && campaign.status !== "APPROVED" ? "Can only edit DRAFT or APPROVED campaigns" : "Edit campaign"}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
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

      {/* Tabs - default to leads where the action is */}
      <Tabs defaultValue={campaign.leads.length > 0 ? "leads" : "drafts"} className="space-y-6">
        <TabsList>
          <TabsTrigger value="leads">Leads ({campaign.leads.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="messages">Messages ({campaign._count.outreachLogs})</TabsTrigger>
        </TabsList>

        {/* Discovery result banner (shown inline above leads) */}
        {discoveryResult && (
          <Card className={discoveryResult.error ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-green-300 bg-green-50 dark:bg-green-950/20'}>
            <CardContent className="py-3 flex items-center justify-between">
              <p className="text-sm">
                {discoveryResult.error
                  ? <span className="text-red-600">{discoveryResult.error}</span>
                  : <span>Discovery complete: {discoveryResult.discovered?.total} leads found{discoveryResult.discovered?.needsResearch > 0 && `, ${discoveryResult.discovered.needsResearch} need research`}</span>
                }
              </p>
              <Button variant="ghost" size="sm" onClick={() => setDiscoveryResult(null)}>
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        <TabsContent value="leads">
          <div className="space-y-4">
            <BulkActionsToolbar
              selectedCount={selectedLeads.length}
              selectedLeadIds={selectedLeads.map(l => l.id)}
              campaignId={campaign.id}
              onActionComplete={() => {
                setSelectedLeads([])
                fetchCampaign()
              }}
            />
            {campaign.leads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No leads discovered yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {discoveryResult?.status === 'no_results'
                      ? 'Discovery ran but found no leads — check the Overview tab for diagnostics'
                      : 'Run discovery to find leads in the target area'}
                  </p>
                  <Button
                    onClick={handleDiscoverLeads}
                    disabled={isDiscovering}
                    className="mt-4"
                    variant="outline"
                  >
                    {isDiscovering ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Discovering...</>
                    ) : (
                      <><Target className="h-4 w-4 mr-2" />{discoveryResult ? 'Re-run Discovery' : 'Run Discovery'}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <LeadsTableSelectable
                    leads={campaign.leads}
                    campaignId={campaign.id}
                    onSelectionChange={setSelectedLeads}
                    onLeadStatusChange={fetchCampaign}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          <DraftsTab
            campaignId={campaign.id}
            campaignLeadIds={campaign.leads.map(l => l.id)}
            onDraftsChange={fetchCampaign}
          />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab
            outreachLogs={campaign.leads.flatMap(cl =>
              cl.outreachLogs.map(ol => ({
                ...ol,
                leadName: `${cl.lead.firstName} ${cl.lead.lastName}`,
                leadEmail: cl.lead.email
              }))
            )}
          />
        </TabsContent>

        {/* Analytics tab removed - placeholder wasn't useful */}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
            <DialogDescription>
              This will permanently delete the campaign, all discovered leads, and outreach logs. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-2 text-amber-600">
              <AlertTriangle className="h-6 w-6 mt-1" />
              <div>
                <p className="font-medium">Permanent deletion</p>
                <p className="text-sm">
                  Campaign "{campaign?.name}" with {campaign?._count?.leads || 0} leads will be removed.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Campaign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
