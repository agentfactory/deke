'use client'

import { BarChart3, Users, Calendar, Package, MessageSquare, DollarSign, TrendingUp, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type AnalyticsData = {
  totals: { leads: number; bookings: number; orders: number; inquiries: number }
  totalRevenue: number
  conversionRate: number
  leadWinRate: number
  revenueByMonth: Record<string, number>
  byServiceType: Record<string, number>
  campaigns: Array<{
    id: string
    name: string
    status: string
    leads: number
  }>
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function formatServiceType(s: string): string {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function formatMonth(key: string): string {
  const [year, month] = key.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1)
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d)
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const maxRevenue = Math.max(...Object.values(data.revenueByMonth), 1)
  const maxServiceCount = Math.max(...Object.values(data.byServiceType), 1)

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-stone-400" />
            Analytics
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Performance metrics and business insights
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<DollarSign className="h-5 w-5 text-green-500" />} label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-blue-500" />} label="Conversion Rate" value={`${data.conversionRate}%`} sub="Inquiries to Accepted" />
          <StatCard icon={<Target className="h-5 w-5 text-purple-500" />} label="Lead Win Rate" value={`${data.leadWinRate}%`} sub="Leads to Won" />
          <StatCard icon={<Users className="h-5 w-5 text-stone-500" />} label="Total Leads" value={data.totals.leads.toString()} />
        </div>

        {/* Entity Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MiniStat icon={<MessageSquare className="h-4 w-4" />} label="Inquiries" value={data.totals.inquiries} href="/dashboard/inquiries" />
          <MiniStat icon={<Calendar className="h-4 w-4" />} label="Bookings" value={data.totals.bookings} href="/dashboard/bookings" />
          <MiniStat icon={<Package className="h-4 w-4" />} label="Orders" value={data.totals.orders} href="/dashboard/orders" />
          <MiniStat icon={<Users className="h-4 w-4" />} label="Leads" value={data.totals.leads} href="/dashboard/contacts" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Month */}
          <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-4">Revenue by Month</h2>
            <div className="space-y-3">
              {Object.entries(data.revenueByMonth).map(([month, amount]) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="w-10 text-xs text-stone-500 font-medium">{formatMonth(month)}</span>
                  <div className="flex-1 h-6 bg-stone-100 dark:bg-stone-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((amount / maxRevenue) * 100, amount > 0 ? 8 : 0)}%` }}
                    >
                      {amount > 0 && (
                        <span className="text-[10px] font-semibold text-white">{formatCurrency(amount)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings by Service Type */}
          <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-4">Bookings by Service Type</h2>
            {Object.keys(data.byServiceType).length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-8">No bookings data yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(data.byServiceType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="w-28 text-xs text-stone-500 font-medium truncate">{formatServiceType(type)}</span>
                      <div className="flex-1 h-6 bg-stone-100 dark:bg-stone-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded flex items-center justify-end pr-2"
                          style={{ width: `${(count / maxServiceCount) * 100}%` }}
                        >
                          <span className="text-[10px] font-semibold text-white">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Campaign Performance */}
        {data.campaigns.length > 0 && (
          <div className="mt-6 rounded-lg border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-4">Campaign Performance</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.campaigns.map(campaign => (
                <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
                  <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-stone-900 dark:text-white truncate">{campaign.name}</h3>
                      <Badge variant="outline" className="text-[10px] shrink-0">{campaign.status}</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-stone-500">
                      <span>{campaign.leads} leads</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</span></div>
      <p className="text-2xl font-bold text-stone-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function MiniStat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs text-stone-500">{label}</span>
          <span className="ml-auto text-lg font-bold text-stone-900 dark:text-white">{value}</span>
        </div>
      </div>
    </Link>
  )
}
