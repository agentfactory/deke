'use client'

import Link from 'next/link'
import { GitBranch, MessageSquare, Calendar, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type PipelineItem = {
  id: string
  name: string
  serviceType?: string
  orderNumber?: string
  status: string
  amount: number | null
  date: string
}

type PipelineData = {
  inquiries: Record<string, number>
  bookings: Record<string, number>
  orders: Record<string, number>
  recentInquiries: PipelineItem[]
  recentBookings: PipelineItem[]
  recentOrders: PipelineItem[]
}

const STAGE_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  QUOTED: 'bg-blue-500',
  ACCEPTED: 'bg-green-500',
  DECLINED: 'bg-red-400',
  EXPIRED: 'bg-gray-400',
  CONFIRMED: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
  REVIEW: 'bg-purple-500',
  DELIVERED: 'bg-emerald-600',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function formatServiceType(s: string): string {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export default function PipelineClient({ data }: { data: PipelineData }) {
  const totalInquiries = Object.values(data.inquiries).reduce((a, b) => a + b, 0)
  const totalBookings = Object.values(data.bookings).reduce((a, b) => a + b, 0)
  const totalOrders = Object.values(data.orders).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-3">
            <GitBranch className="h-7 w-7 text-stone-400" />
            Pipeline
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Visual overview of all active deals across inquiries, bookings, and orders
          </p>
        </div>

        {/* Pipeline Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inquiries Column */}
          <PipelineColumn
            title="Inquiries"
            icon={<MessageSquare className="h-5 w-5" />}
            total={totalInquiries}
            stages={data.inquiries}
            items={data.recentInquiries}
            linkBase="/dashboard/inquiries"
            color="blue"
          />

          {/* Bookings Column */}
          <PipelineColumn
            title="Bookings"
            icon={<Calendar className="h-5 w-5" />}
            total={totalBookings}
            stages={data.bookings}
            items={data.recentBookings}
            linkBase="/dashboard/bookings"
            color="green"
          />

          {/* Orders Column */}
          <PipelineColumn
            title="Orders"
            icon={<Package className="h-5 w-5" />}
            total={totalOrders}
            stages={data.orders}
            items={data.recentOrders}
            linkBase="/dashboard/orders"
            color="purple"
          />
        </div>
      </div>
    </div>
  )
}

function PipelineColumn({
  title, icon, total, stages, items, linkBase, color,
}: {
  title: string
  icon: React.ReactNode
  total: number
  stages: Record<string, number>
  items: PipelineItem[]
  linkBase: string
  color: string
}) {
  const headerColor = color === 'blue'
    ? 'border-t-blue-500'
    : color === 'green'
      ? 'border-t-green-500'
      : 'border-t-purple-500'

  return (
    <div className={`rounded-lg border border-stone-200 dark:border-stone-800 border-t-4 ${headerColor}`}>
      {/* Column Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-semibold text-stone-900 dark:text-white">{title}</h2>
          </div>
          <span className="text-sm text-stone-500">{total} total</span>
        </div>

        {/* Stage bars */}
        <div className="mt-3 space-y-1.5">
          {Object.entries(stages).map(([stage, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={stage} className="flex items-center gap-2 text-xs">
                <span className="w-24 text-stone-500 truncate">{formatServiceType(stage)}</span>
                <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STAGE_COLORS[stage] || 'bg-stone-400'}`}
                    style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="w-6 text-right font-medium text-stone-700 dark:text-stone-300">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Items */}
      <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-4">No active items</p>
        ) : (
          items.map(item => (
            <Link key={item.id} href={linkBase}>
              <div className="p-3 rounded-md hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {item.serviceType ? formatServiceType(item.serviceType) : item.orderNumber}
                    </p>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {item.status}
                    </Badge>
                    {item.amount != null && (
                      <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mt-0.5">
                        {formatCurrency(item.amount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* View All Link */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800">
        <Link href={linkBase} className="text-xs text-blue-600 hover:underline font-medium">
          View all {title.toLowerCase()} &rarr;
        </Link>
      </div>
    </div>
  )
}
