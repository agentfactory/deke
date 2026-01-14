import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CampaignStatus = "DRAFT" | "APPROVED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

interface StatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

const statusConfig: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
