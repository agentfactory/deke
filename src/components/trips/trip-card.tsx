'use client'

import type { Trip, TripBooking } from '@/types/trips'
import { Calendar, MapPin, DollarSign, TrendingUp, MoreVertical, Plus, Eye } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface TripCardProps {
  trip: Trip
  bookings: TripBooking[]
  index: number
}

export function TripCard({ trip, bookings, index }: TripCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format dates
  const startDate = new Date(trip.startDate)
  const endDate = new Date(trip.endDate)
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  // Calculate profit percentage
  const profitMargin = trip.totalRevenue > 0
    ? ((trip.netProfit / trip.totalRevenue) * 100).toFixed(0)
    : 0

  // Status styling
  const statusConfig = {
    upcoming: {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-violet-200 dark:border-violet-800',
      dot: 'bg-violet-500'
    },
    'in-progress': {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-800',
      dot: 'bg-cyan-500 animate-pulse'
    },
    completed: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400'
    },
    cancelled: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500'
    }
  }

  const status = statusConfig[trip.status]

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5 transition-all duration-300 overflow-hidden"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Gradient accent border on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-cyan-500/0 to-violet-500/0 group-hover:from-violet-500/5 group-hover:via-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-300 pointer-events-none" />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} ${status.border} border`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {trip.status.replace('-', ' ')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {trip.name}
            </h3>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Trip actions"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
                  <Link
                    href={`/dashboard/trips/${trip.id}`}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-500" />
            <span className="font-medium">{trip.location}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-500" />
            <span>{dateRange}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Bookings
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {trip.bookingsCount}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Margin
            </p>
            <p className="text-xl font-bold bg-gradient-to-br from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              {profitMargin}%
            </p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-2 mb-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Revenue</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              ${trip.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Expenses</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              ${trip.totalExpenses.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              Net Profit
            </span>
            <span className="text-lg font-bold bg-gradient-to-br from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              ${trip.netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Booking Type Pills */}
        {bookings.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {Array.from(new Set(bookings.map(b => b.type))).map(type => (
              <span
                key={type}
                className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md capitalize"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/trips/${trip.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Link>

          <Link
            href={`/dashboard/bookings/new?tripId=${trip.id}`}
            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            aria-label="Add booking"
          >
            <Plus className="w-4 h-4" />
          </Link>

          <button
            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            aria-label="Add expense"
          >
            <DollarSign className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
