import { prisma } from "@/lib/db";
import { DashboardSidebar } from "./sidebar";

async function getNewGroupRequestCount(): Promise<number> {
  try {
    const count = await prisma.inquiry.count({
      where: {
        OR: [
          { lead: { source: "find-group-form" } },
          { serviceType: "CONSULTATION" },
          { message: { contains: "group", mode: "insensitive" } },
          { message: { contains: "sing", mode: "insensitive" } },
        ],
        status: { in: ["NEW", "PENDING"] },
      },
    });
    return count;
  } catch {
    return 0;
  }
}

const navItems = [
  { href: "/dashboard", label: "COMMAND CENTER", icon: "LayoutDashboard" as const },
  { href: "/dashboard/bookings", label: "BOOKINGS", icon: "Calendar" as const },
  { href: "/dashboard/engagements", label: "ENGAGEMENTS", icon: "Briefcase" as const },
  { href: "/dashboard/expenses", label: "EXPENSES", icon: "DollarSign" as const },
  { href: "/dashboard/contacts", label: "CONTACTS", icon: "Users" as const, badge: true },
  { href: "/dashboard/campaigns", label: "LEAD GEN", icon: "Rocket" as const },
  { href: "/dashboard/calendar", label: "CALENDAR", icon: "CalendarDays" as const },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const newRequestCount = await getNewGroupRequestCount();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Desktop sidebar */}
      <DashboardSidebar navItems={navItems} newRequestCount={newRequestCount} />

      {/* Main content */}
      <main className="lg:pl-[260px] pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
