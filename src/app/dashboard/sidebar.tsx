"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Rocket,
  Users,
  CalendarDays,
} from "lucide-react";

const iconMap = {
  LayoutDashboard,
  Calendar,
  Rocket,
  Users,
  CalendarDays,
} as const;

type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof iconMap;
  badge?: boolean;
};

export function DashboardSidebar({
  navItems,
  newRequestCount,
}: {
  navItems: NavItem[];
  newRequestCount: number;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] bg-[#111113] lg:flex lg:flex-col">
        {/* Logo area */}
        <div className="px-7 pt-8 pb-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex flex-col items-start">
              <span
                className="text-[20px] font-bold tracking-[3px] text-[#F5F3EF]"
                style={{ fontFamily: "var(--font-heading, 'Space Grotesk'), sans-serif" }}
              >
                DEKE
              </span>
              <div className="mt-1.5 h-[3px] w-8 rounded-full bg-[#C05A3C] transition-all duration-300 group-hover:w-12" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      relative flex items-center gap-3 rounded-md px-3 py-2.5
                      transition-all duration-200 ease-out
                      ${
                        active
                          ? "bg-[#1c1c1f] text-[#F5F3EF]"
                          : "text-[#777779] hover:bg-[#1a1a1c] hover:text-[#CCCCCC]"
                      }
                    `}
                    style={{ fontFamily: "var(--font-heading, 'Space Grotesk'), sans-serif" }}
                  >
                    {/* Active left border accent */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#C05A3C]" />
                    )}

                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 ${
                        active ? "text-[#C05A3C]" : ""
                      }`}
                      strokeWidth={active ? 2.2 : 1.8}
                    />

                    <span className="text-[12px] font-medium tracking-[1.5px]">
                      {item.label}
                    </span>

                    {item.badge && newRequestCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C05A3C] px-1.5 text-[10px] font-semibold text-white">
                        {newRequestCount > 99 ? "99+" : newRequestCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer version */}
        <div className="px-7 py-5">
          <span
            className="text-[11px] tracking-[1px] text-[#444446]"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk'), sans-serif" }}
          >
            v2.0
          </span>
        </div>
      </aside>

      {/* Mobile bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#222224] bg-[#111113] lg:hidden">
        <ul className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    relative flex flex-col items-center gap-1 rounded-lg px-3 py-1.5
                    transition-colors duration-200
                    ${
                      active
                        ? "text-[#C05A3C]"
                        : "text-[#666668] hover:text-[#999]"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                  <span
                    className="text-[9px] font-medium tracking-[0.5px]"
                    style={{ fontFamily: "var(--font-heading, 'Space Grotesk'), sans-serif" }}
                  >
                    {item.label.length > 10
                      ? item.label.slice(0, 7) + "..."
                      : item.label}
                  </span>

                  {/* Active dot indicator for mobile */}
                  {active && (
                    <span className="absolute -top-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-[#C05A3C]" />
                  )}

                  {item.badge && newRequestCount > 0 && (
                    <span className="absolute -right-0.5 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C05A3C] px-1 text-[9px] font-semibold text-white">
                      {newRequestCount > 99 ? "99+" : newRequestCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
