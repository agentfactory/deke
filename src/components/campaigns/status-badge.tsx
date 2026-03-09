import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CampaignStatus = "DRAFT" | "READY" | "APPROVED" | "ACTIVE" | "SENDING" | "COMPLETED" | "CANCELLED";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300",
  },
  READY: {
    label: "Ready",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
  },
  SENDING: {
    label: "Sending",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300",
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
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
