import Link from "next/link"
import { prisma } from "@/lib/db"
import {
  Calendar,
  Rocket,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"
export const revalidate = 0

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatShortDate(date: Date | null): string {
  if (!date) return "No date"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatServiceType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "DRAFT":
      return "bg-stone-100 text-stone-700 border-stone-200"
    case "PAUSED":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "COMPLETED":
      return "bg-sky-100 text-sky-800 border-sky-200"
    case "APPROVED":
      return "bg-indigo-100 text-indigo-800 border-indigo-200"
    default:
      return "bg-stone-100 text-stone-600 border-stone-200"
  }
}

async function getDashboardData() {
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  try {
    const [
      activeBookings,
      upcomingBookings,
      activeCampaigns,
      totalContacts,
      bookingsNeedingCampaigns,
      recentCampaigns,
      recentContacts,
    ] = await Promise.all([
      // Active Bookings count
      prisma.booking.count({
        where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
      }),

      // Upcoming This Month
      prisma.booking.count({
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
          startDate: { gte: now, lte: thirtyDaysFromNow },
        },
      }),

      // Active Campaigns
      prisma.campaign.count({
        where: { status: "ACTIVE" },
      }),

      // Total Contacts
      prisma.lead.count(),

      // Bookings needing campaigns
      prisma.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          startDate: { gte: now },
          campaigns: { none: {} },
        },
        include: {
          lead: {
            select: {
              firstName: true,
              lastName: true,
              organization: true,
            },
          },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),

      // Recent campaigns
      prisma.campaign.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { leads: true } } },
      }),

      // Recent contacts
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          organization: true,
          source: true,
          createdAt: true,
        },
      }),
    ])

    return {
      activeBookings,
      upcomingBookings,
      activeCampaigns,
      totalContacts,
      bookingsNeedingCampaigns,
      recentCampaigns,
      recentContacts,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      activeBookings: 0,
      upcomingBookings: 0,
      activeCampaigns: 0,
      totalContacts: 0,
      bookingsNeedingCampaigns: [],
      recentCampaigns: [],
      recentContacts: [],
    }
  }
}

export default async function DashboardPage() {
  const {
    activeBookings,
    upcomingBookings,
    activeCampaigns,
    totalContacts,
    bookingsNeedingCampaigns,
    recentCampaigns,
    recentContacts,
  } = await getDashboardData()

  const stats = [
    {
      label: "Active Bookings",
      value: activeBookings,
      icon: Calendar,
      href: "/dashboard/bookings",
    },
    {
      label: "Upcoming (30 days)",
      value: upcomingBookings,
      icon: Clock,
      href: "/dashboard/bookings",
    },
    {
      label: "Active Campaigns",
      value: activeCampaigns,
      icon: TrendingUp,
      href: "/dashboard/campaigns",
    },
    {
      label: "Contacts",
      value: totalContacts,
      icon: Users,
      href: "/dashboard/contacts",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="pt-2">
        <h1
          className="text-2xl font-bold text-[#1a1a1a]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {getGreeting()}, Deke
        </h1>
        <p className="mt-1 text-sm text-[#666666]">{formatDate(new Date())}</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-[#E8E4DD] bg-white transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C05A3C]/10">
                    <Icon className="h-5 w-5 text-[#C05A3C]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-[#1a1a1a]">
                      {stat.value}
                    </p>
                    <p className="truncate text-xs font-medium text-[#888888]">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Bookings Needing Campaigns */}
      <Card className="border-[#E8E4DD] bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-[#C05A3C]" />
              <CardTitle
                className="text-lg font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Opportunities to Discover
              </CardTitle>
            </div>
            <Link href="/dashboard/bookings">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#888888] hover:text-[#C05A3C]"
              >
                View All Bookings
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {bookingsNeedingCampaigns.length > 0 ? (
            <div className="space-y-3">
              {bookingsNeedingCampaigns.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-[#E8E4DD] px-4 py-3 transition-colors hover:bg-[#FAFAF8]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1a1a1a]">
                          {formatServiceType(booking.serviceType)}
                        </span>
                        <span className="text-sm text-[#999999]">--</span>
                        <span className="truncate text-sm text-[#666666]">
                          {booking.lead.firstName} {booking.lead.lastName}
                          {booking.lead.organization
                            ? ` (${booking.lead.organization})`
                            : ""}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#999999]">
                        {booking.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatShortDate(booking.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/bookings/${booking.id}`}>
                    <Button
                      size="sm"
                      className="ml-4 shrink-0 bg-[#C05A3C] text-white hover:bg-[#A84B30]"
                    >
                      Find Nearby Leads
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#D4D0C8] px-4 py-6">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="text-sm text-[#666666]">
                All bookings have campaigns running. Nice work.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Two Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Campaigns */}
        <Card className="border-[#E8E4DD] bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-base font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Recent Campaigns
              </CardTitle>
              <Link href="/dashboard/campaigns">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#888888] hover:text-[#C05A3C]"
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-2">
                {recentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-[#FAFAF8]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1a1a1a]">
                          {campaign.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#999999]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {campaign.baseLocation}
                          </span>
                          <span>
                            {campaign._count.leads}{" "}
                            {campaign._count.leads === 1 ? "lead" : "leads"}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-3 shrink-0 text-[10px] font-medium ${getStatusColor(campaign.status)}`}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-[#999999]">
                No campaigns yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card className="border-[#E8E4DD] bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-base font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Recent Contacts
              </CardTitle>
              <Link href="/dashboard/contacts">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#888888] hover:text-[#C05A3C]"
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentContacts.length > 0 ? (
              <div className="space-y-2">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-[#FAFAF8]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1a1a1a]">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[#999999]">
                        <span className="truncate">{contact.email}</span>
                        {contact.organization && (
                          <>
                            <span className="shrink-0">--</span>
                            <span className="truncate">
                              {contact.organization}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      {contact.source && (
                        <Badge
                          variant="outline"
                          className="border-[#E8E4DD] text-[10px] font-normal text-[#999999]"
                        >
                          {contact.source}
                        </Badge>
                      )}
                      <p className="mt-0.5 text-[10px] text-[#BBBBBB]">
                        {formatShortDate(contact.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-[#999999]">
                No contacts yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
