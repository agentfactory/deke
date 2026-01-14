import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your campaign performance and engagement metrics
        </p>
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
            The analytics dashboard is currently under development. This page will include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Campaign performance charts and graphs</li>
            <li>Lead conversion funnel visualization</li>
            <li>Geographic distribution of leads</li>
            <li>Time-series analysis of engagement metrics</li>
            <li>Comparison of different campaign strategies</li>
            <li>Export functionality for reports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
