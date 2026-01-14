import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold">Campaign Details</h1>
          <p className="text-muted-foreground mt-2">Campaign ID: {id}</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The campaign detail page is currently under development. This page will include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Interactive map showing discovered leads in the campaign area</li>
            <li>Detailed lead table with sorting and filtering options</li>
            <li>Lead engagement tracking and status updates</li>
            <li>Campaign performance metrics and analytics</li>
            <li>Personalized outreach templates and email tools</li>
            <li>Lead scoring and prioritization features</li>
          </ul>
          <div className="pt-4">
            <Link href="/dashboard/campaigns">
              <Button>Back to Campaigns</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
