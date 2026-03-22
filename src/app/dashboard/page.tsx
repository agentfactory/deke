import Link from "next/link"
import { prisma } from "@/lib/db"
import {
  MessageSquare,
  Briefcase,
  DollarSign,
  Rocket,
  ArrowRight,
  Calendar,
  MapPin,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"
export const revalidate = 0

// ─── Formatting helpers ───────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatServiceType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatShortDate(date: Date | null): string {
  if (!date) return "TBD"
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  })
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

// ─── Data fetching ────────────────────────────────────────────────

async function getTodayData() {
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  try {
    const [
      pendingInquiries,
      needsPrepBookings,
      paymentDueBookings,
      noCampaignBookings,
      upcomingBookingsCount,
      revenuePipelineResult,
      activeLeadsCount,
      nextUpBookings,
    ] = await Promise.all([
      // RESPOND: Pending inquiries
      prisma.inquiry.findMany({
        where: { status: "PENDING" },
        include: {
          lead: {
            select: {
              firstName: true,
              lastName: true,
              organization: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // PREP: Bookings needing preparation (next 30 days)
      prisma.booking.findMany({
        where: {
          startDate: { gte: now, lte: thirtyDaysFromNow },
          status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
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

      // COLLECT: Unpaid/overdue bookings
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

      // GROW: Confirmed bookings with no campaign
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

      // KPI: Upcoming bookings count
      prisma.booking.count({
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
          startDate: { gte: now },
        },
      }),

      // KPI: Revenue pipeline
      prisma.booking.aggregate({
        _sum: { amount: true },
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        },
      }),

      // KPI: Active leads
      prisma.lead.count({
        where: {
          status: {
            in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATING"],
          },
        },
      }),

      // UPCOMING: Next 5 bookings
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
    ])

    return {
      pendingInquiries,
      needsPrepBookings,
      paymentDueBookings,
      noCampaignBookings,
      upcomingBookingsCount,
      revenuePipeline: revenuePipelineResult._sum.amount ?? 0,
      activeLeadsCount,
      nextUpBookings,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      pendingInquiries: [],
      needsPrepBookings: [],
      paymentDueBookings: [],
      noCampaignBookings: [],
      upcomingBookingsCount: 0,
      revenuePipeline: 0,
      activeLeadsCount: 0,
      nextUpBookings: [],
    }
  }
}

// ─── Page ─────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const {
    pendingInquiries,
    needsPrepBookings,
    paymentDueBookings,
    noCampaignBookings,
    upcomingBookingsCount,
    revenuePipeline,
    activeLeadsCount,
    nextUpBookings,
  } = await getTodayData()

  const hasActions =
    pendingInquiries.length > 0 ||
    needsPrepBookings.length > 0 ||
    paymentDueBookings.length > 0 ||
    noCampaignBookings.length > 0

  return (
    <div className="space-y-6">
      {/* Header: Today + date */}
      <div className="flex items-baseline justify-between pt-1">
        <h1
          className="text-2xl font-bold text-[#1a1a1a]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Today
        </h1>
        <span className="text-sm text-[#999999]">{formatTodayDate()}</span>
      </div>

      {/* KPI Strip */}
      <div className="flex items-center gap-6 text-sm text-[#999999]">
        <Link
          href="/dashboard/bookings"
          className="transition-colors hover:text-[#C05A3C]"
        >
          {formatCurrency(revenuePipeline)} pipeline
        </Link>
        <span className="text-[#E8E4DD]">|</span>
        <Link
          href="/dashboard/bookings"
          className="transition-colors hover:text-[#C05A3C]"
        >
          {upcomingBookingsCount} booking{upcomingBookingsCount !== 1 ? "s" : ""}
        </Link>
        <span className="text-[#E8E4DD]">|</span>
        <Link
          href="/dashboard/contacts"
          className="transition-colors hover:text-[#C05A3C]"
        >
          {activeLeadsCount} lead{activeLeadsCount !== 1 ? "s" : ""}
        </Link>
      </div>

      {/* Action Queue */}
      {hasActions ? (
        <Card className="border-[#E8E4DD] bg-white">
          <CardContent className="p-0">
            {/* Card header */}
            <div className="flex items-center gap-2 border-b border-[#E8E4DD] px-5 py-3">
              <Zap className="h-4 w-4 text-[#C05A3C]" />
              <span
                className="text-sm font-bold tracking-wide text-[#1a1a1a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ACTION QUEUE
              </span>
            </div>

            <div className="divide-y divide-[#F0EDE8]">
              {/* RESPOND section */}
              {pendingInquiries.length > 0 && (
                <ActionSection label="RESPOND">
                  {pendingInquiries.map((inquiry) => (
                    <ActionRow
                      key={inquiry.id}
                      icon={<MessageSquare className="h-4 w-4 text-[#999999]" />}
                      description={
                        <>
                          {formatServiceType(inquiry.serviceType)} inquiry
                          {" \u2014 "}
                          {inquiry.lead.organization ||
                            `${inquiry.lead.firstName} ${inquiry.lead.lastName}`}
                        </>
                      }
                      href="/dashboard/inquiries"
                      cta="Respond"
                    />
                  ))}
                </ActionSection>
              )}

              {/* PREP section */}
              {needsPrepBookings.length > 0 && (
                <ActionSection label="PREP">
                  {needsPrepBookings.map((booking) => (
                    <ActionRow
                      key={booking.id}
                      icon={<Briefcase className="h-4 w-4 text-[#999999]" />}
                      description={
                        <>
                          {formatServiceType(booking.serviceType)}{" "}
                          {formatShortDate(booking.startDate)}
                          {" \u2014 "}
                          {booking.lead.firstName} {booking.lead.lastName}
                        </>
                      }
                      href={`/dashboard/bookings/${booking.id}`}
                      cta="Start Prep"
                    />
                  ))}
                </ActionSection>
              )}

              {/* COLLECT section */}
              {paymentDueBookings.length > 0 && (
                <ActionSection label="COLLECT">
                  {paymentDueBookings.map((booking) => (
                    <ActionRow
                      key={booking.id}
                      icon={<DollarSign className="h-4 w-4 text-[#999999]" />}
                      description={
                        <>
                          {booking.lead.firstName} {booking.lead.lastName}
                          {" \u2014 "}
                          {formatCurrency(booking.balanceDue ?? booking.amount ?? 0)}{" "}
                          outstanding
                        </>
                      }
                      href={`/dashboard/bookings/${booking.id}`}
                      cta="Send Invoice"
                    />
                  ))}
                </ActionSection>
              )}

              {/* GROW section */}
              {noCampaignBookings.length > 0 && (
                <ActionSection label="GROW">
                  {noCampaignBookings.map((booking) => (
                    <ActionRow
                      key={booking.id}
                      icon={<Rocket className="h-4 w-4 text-[#999999]" />}
                      description={
                        <>
                          {formatServiceType(booking.serviceType)}{" "}
                          {formatShortDate(booking.startDate)}
                          {" \u2014 "}
                          {booking.lead.firstName} {booking.lead.lastName}
                          {booking.location ? ` (${booking.location})` : ""}
                        </>
                      }
                      href={`/dashboard/bookings/${booking.id}`}
                      cta="Find Leads"
                    />
                  ))}
                </ActionSection>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-[#999999]">
            Nothing to do.{" "}
            <Link
              href="/dashboard/contacts"
              className="text-[#C05A3C] underline underline-offset-2 hover:text-[#A84B30]"
            >
              Go find some gigs.
            </Link>
          </p>
        </div>
      )}

      {/* Upcoming */}
      {nextUpBookings.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-wider text-[#999999]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Upcoming
            </span>
            <Link href="/dashboard/bookings">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-[#999999] hover:text-[#C05A3C]"
              >
                All Bookings
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <Card className="border-[#E8E4DD] bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-[#F0EDE8]">
                {nextUpBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-[#FAFAF8]"
                  >
                    <span className="w-16 shrink-0 text-[#999999]">
                      {formatShortDate(booking.startDate)}
                    </span>
                    <span className="w-28 shrink-0 font-medium text-[#1a1a1a]">
                      {formatServiceType(booking.serviceType)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[#666666]">
                      {booking.lead.firstName} {booking.lead.lastName}
                    </span>
                    {booking.location && (
                      <span className="hidden items-center gap-1 text-xs text-[#999999] sm:flex">
                        <MapPin className="h-3 w-3" />
                        <span className="max-w-[140px] truncate">
                          {booking.location}
                        </span>
                      </span>
                    )}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <StatusDot
                        color={
                          booking.paymentStatus === "PAID_IN_FULL"
                            ? "emerald"
                            : booking.paymentStatus === "OVERDUE"
                              ? "red"
                              : "amber"
                        }
                        label={booking.paymentStatus.replace(/_/g, " ")}
                      />
                      {booking.engagementStatus && (
                        <StatusDot
                          color={
                            booking.engagementStatus === "READY"
                              ? "emerald"
                              : booking.engagementStatus === "DELIVERED"
                                ? "sky"
                                : "blue"
                          }
                          label={booking.engagementStatus.replace(/_/g, " ")}
                        />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function ActionSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="px-5 py-3">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#999999]">
        {label}
      </span>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function ActionRow({
  icon,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode
  description: React.ReactNode
  href: string
  cta: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md py-1.5">
      <div className="shrink-0">{icon}</div>
      <span className="min-w-0 flex-1 truncate text-sm text-[#666666]">
        {description}
      </span>
      <Link href={href} className="shrink-0">
        <Button
          size="sm"
          className="h-7 bg-[#C05A3C] px-3 text-xs text-white hover:bg-[#A84B30]"
        >
          {cta}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </Link>
    </div>
  )
}

function StatusDot({
  color,
  label,
}: {
  color: "emerald" | "red" | "amber" | "blue" | "sky"
  label: string
}) {
  const colorMap = {
    emerald: "bg-emerald-400",
    red: "bg-red-400",
    amber: "bg-amber-400",
    blue: "bg-blue-400",
    sky: "bg-sky-400",
  }

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colorMap[color]}`}
      title={label}
      aria-label={label}
    />
  )
}
