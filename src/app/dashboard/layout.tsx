import Link from "next/link";
import { LayoutDashboard, Target, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-heading text-xl font-bold text-primary">
                  Deke Sharon
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/campaigns">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                >
                  <Target className="h-5 w-5" />
                  Campaigns
                </Button>
              </Link>
              <Link href="/dashboard/bookings">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                >
                  <Calendar className="h-5 w-5" />
                  Bookings
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                >
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </Button>
              </Link>
            </nav>

            <Separator />

            {/* User Info */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    DS
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Deke Sharon</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Admin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pl-64">
          <div className="container mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
