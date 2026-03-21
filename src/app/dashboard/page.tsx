import Link from "next/link"
import { prisma } from "@/lib/db"
import {
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  CalendarDays,
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "UNPAID":
      return "bg-red-50 text-red-700 border-red-200"
    case "DEPOSIT_PAID":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "PAID_IN_FULL":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "OVERDUE":
      return "bg-red-100 text-red-800 border-red-300"
    case "REFUNDED":
      return "bg-stone-100 text-stone-600 border-stone-200"
    default:
      return "bg-stone-100 text-stone-600 border-stone-200"
  }
}

function getEngagementStatusBadge(status: string) {
  switch (status) {
    case "PREP":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "READY":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "DELIVERED":
      return "bg-sky-50 text-sky-700 border-sky-200"
    case "FOLLOW_UP":
      return "bg-amber-50 text-amber-700 border-amber-200"
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
      upcomingBookingsCount,
      revenuePipelineResult,
      outstandingBalanceResult,
      activeLeadsCount,
      nextUpBookings,
      needsPrepBookings,
      paymentDueBookings,
      noCampaignBookings,
      recentContacts,
    ] = await Promise.all([
      // KPI 1: Upcoming Bookings (next 30 days)
      prisma.booking.count({
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
          startDate: { gte: now, lte: thirtyDaysFromNow },
        },
      }),

      // KPI 2: Revenue Pipeline — sum of amount for confirmed/in-progress
      prisma.booking.aggregate({
        _sum: { amount: true },
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        },
      }),

      // KPI 3: Outstanding Balance
      prisma.booking.aggregate({
        _sum: { balanceDue: true },
        where: {
          paymentStatus: { notIn: ["PAID_IN_FULL", "REFUNDED"] },
          balanceDue: { gt: 0 },
        },
      }),

      // KPI 4: Active Leads
      prisma.lead.count({
        where: {
          status: {
            in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATING"],
          },
        },
      }),

      // Next Up: next 5 upcoming bookings
      prisma.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
          startDate: { gte: now },
        },
        include: {
          lead: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),

      // Action Items: Needs Prep
      prisma.booking.findMany({
        where: {
          startDate: { gte: now, lte: thirtyDaysFromNow },
          OR: [
            { engagementStatus: null },
            { engagementStatus: "PREP" },
          ],
        },
        include: {
          lead: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { startDate: "asc" },
      }),

      // Action Items: Payment Due
      prisma.booking.findMany({
        where: {
          paymentStatus: { in: ["UNPAID", "OVERDUE"] },
          amount: { gt: 0 },
        },
        include: {
          lead: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { startDate: "asc" },
      }),

      // Action Items: No Campaign
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
      }),

      // Recent Contacts
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
      upcomingBookingsCount,
      revenuePipeline: revenuePipelineResult._sum.amount ?? 0,
      outstandingBalance: outstandingBalanceResult._sum.balanceDue ?? 0,
      activeLeadsCount,
      nextUpBookings,
      needsPrepBookings,
      paymentDueBookings,
      noCampaignBookings,
      recentContacts,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      upcomingBookingsCount: 0,
      revenuePipeline: 0,
      outstandingBalance: 0,
      activeLeadsCount: 0,
      nextUpBookings: [],
      needsPrepBookings: [],
      paymentDueBookings: [],
      noCampaignBookings: [],
      recentContacts: [],
    }
  }
}

export default async function DashboardPage() {
  const {
    upcomingBookingsCount,
    revenuePipeline,
    outstandingBalance,
    activeLeadsCount,
    nextUpBookings,
    needsPrepBookings,
    paymentDueBookings,
    noCampaignBookings,
    recentContacts,
  } = await getDashboardData()

  const stats = [
    {
      label: "Upcoming Bookings",
      value: upcomingBookingsCount.toString(),
      icon: Calendar,
      href: "/dashboard/bookings",
    },
    {
      label: "Revenue Pipeline",
      value: formatCurrency(revenuePipeline),
      icon: TrendingUp,
      href: "/dashboard/bookings",
    },
    {
      label: "Outstanding Balance",
      value: formatCurrency(outstandingBalance),
      icon: DollarSign,
      href: "/dashboard/expenses",
    },
    {
      label: "Active Leads",
      value: activeLeadsCount.toString(),
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

      {/* Row 1: KPI Cards */}
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

      {/* Row 2: Next Up */}
      <Card className="border-[#E8E4DD] bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#C05A3C]" />
              <CardTitle
                className="text-lg font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Next Up
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
          {nextUpBookings.length > 0 ? (
            <div className="space-y-3">
              {nextUpBookings.map((booking) => (
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
                        <span className="text-sm text-[#999999]">&mdash;</span>
                        <span className="truncate text-sm text-[#666666]">
                          {booking.lead.firstName} {booking.lead.lastName}
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
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${getPaymentStatusBadge(booking.paymentStatus)}`}
                    >
                      {booking.paymentStatus.replace(/_/g, " ")}
                    </Badge>
                    {booking.engagementStatus && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${getEngagementStatusBadge(booking.engagementStatus)}`}
                      >
                        {booking.engagementStatus.replace(/_/g, " ")}
                      </Badge>
                    )}
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#888888] hover:text-[#C05A3C]"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#D4D0C8] px-4 py-6">
              <Calendar className="h-5 w-5 text-[#999999]" />
              <p className="text-sm text-[#666666]">No upcoming bookings.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 3: Action Items + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Action Items */}
        <Card className="border-[#E8E4DD] bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#C05A3C]" />
              <CardTitle
                className="text-base font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Action Items
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Needs Prep */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-[#1a1a1a]">
                  Needs Prep
                </span>
                <Badge
                  variant="outline"
                  className="border-[#E8E4DD] text-[10px] font-medium text-[#666666]"
                >
                  {needsPrepBookings.length}
                </Badge>
              </div>
              {needsPrepBookings.length > 0 ? (
                <div className="space-y-1.5">
                  {needsPrepBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#FAFAF8]"
                    >
                      <span className="text-[#666666]">
                        <span className="font-medium text-[#1a1a1a]">
                          {formatServiceType(booking.serviceType)}
                        </span>
                        {" — "}
                        {booking.lead.firstName} {booking.lead.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-[#999999]">All prepped</span>
                </div>
              )}
            </div>

            {/* Payment Due */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-[#1a1a1a]">
                  Payment Due
                </span>
                <Badge
                  variant="outline"
                  className="border-[#E8E4DD] text-[10px] font-medium text-[#666666]"
                >
                  {paymentDueBookings.length}
                </Badge>
              </div>
              {paymentDueBookings.length > 0 ? (
                <div className="space-y-1.5">
                  {paymentDueBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#FAFAF8]"
                    >
                      <span className="text-[#666666]">
                        {booking.lead.firstName} {booking.lead.lastName}
                      </span>
                      <span className="font-medium text-[#1a1a1a]">
                        {formatCurrency(booking.amount ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-[#999999]">All paid up</span>
                </div>
              )}
            </div>

            {/* No Campaign */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-[#1a1a1a]">
                  No Campaign
                </span>
                <Badge
                  variant="outline"
                  className="border-[#E8E4DD] text-[10px] font-medium text-[#666666]"
                >
                  {noCampaignBookings.length}
                </Badge>
              </div>
              {noCampaignBookings.length > 0 ? (
                <div className="space-y-1.5">
                  {noCampaignBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#FAFAF8]"
                    >
                      <span className="text-[#666666]">
                        <span className="font-medium text-[#1a1a1a]">
                          {formatServiceType(booking.serviceType)}
                        </span>
                        {" — "}
                        {booking.lead.firstName} {booking.lead.lastName}
                      </span>
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <Button
                          size="sm"
                          className="h-7 bg-[#C05A3C] text-xs text-white hover:bg-[#A84B30]"
                        >
                          Find Nearby Leads
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-[#999999]">
                    All bookings have campaigns
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-[#E8E4DD] bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#C05A3C]" />
                <CardTitle
                  className="text-base font-bold text-[#1a1a1a]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Recent Activity
                </CardTitle>
              </div>
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
                      {contact.organization && (
                        <p className="mt-0.5 truncate text-xs text-[#999999]">
                          {contact.organization}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      {contact.source && (
                        <Badge
                          variant="outline"
                          className="border-[#E8E4DD] text-[10px] font-normal text-[#999999]"
                        >
                          {contact.source}
                        </Badge>
                      )}
                      <span className="text-[10px] text-[#BBBBBB]">
                        {formatShortDate(contact.createdAt)}
                      </span>
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
