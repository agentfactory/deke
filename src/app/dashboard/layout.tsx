import Link from "next/link";
import { Calendar, Send, MessageSquare, Users, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";

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
  { href: "/dashboard/bookings", label: "BOOKINGS", icon: Calendar },
  { href: "/dashboard/campaigns", label: "CAMPAIGNS", icon: Send },
  { href: "#", label: "MESSAGING", icon: MessageSquare, disabled: true },
  { href: "/dashboard/groups", label: "CONTACTS", icon: Users, badge: true },
  { href: "/dashboard/analytics", label: "ANALYTICS", icon: TrendingUp },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const newRequestCount = await getNewGroupRequestCount();

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-30 h-screen w-[280px] bg-[#1a1a1a]">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 px-7 py-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#C05A3C]" />
                <span
                  className="text-[18px] font-bold uppercase tracking-[2px] text-[#F5F3EF]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  DEKE OPS
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-5 pt-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isDisabled = item.disabled;

                return isDisabled ? (
                  <span
                    key={item.label}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[#444444] cursor-not-allowed"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="text-[13px] font-medium uppercase tracking-[1px]">
                      {item.label}
                    </span>
                  </span>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[#666666] transition-colors hover:text-[#C05A3C]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="text-[13px] font-medium uppercase tracking-[1px]">
                      {item.label}
                    </span>
                    {item.badge && newRequestCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                        {newRequestCount > 99 ? "99+" : newRequestCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pl-[280px]">
          <div className="container mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
