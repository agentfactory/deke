import type { Trip, Booking } from '@/../product/sections/dashboard-and-trip-management/types'
import { Calendar, MapPin, DollarSign, TrendingUp, MoreVertical, Plus, Eye } from 'lucide-react'
import { useState } from 'react'

interface TripCardProps {
  trip: Trip
  bookings: Booking[]
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onAddBooking?: () => void
  onAddExpense?: () => void
  onViewProfitability?: () => void
  index: number
}

export function TripCard({
  trip,
  bookings,
  onView,
  onEdit,
  onDelete,
  onAddBooking,
  onAddExpense,
  onViewProfitability,
  index
}: TripCardProps) {
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
      bg: 'bg-lime-100 dark:bg-lime-900/30',
      text: 'text-lime-700 dark:text-lime-300',
      border: 'border-lime-200 dark:border-lime-800',
      dot: 'bg-lime-500'
    },
    'in-progress': {
      bg: 'bg-lime-100 dark:bg-lime-900/30',
      text: 'text-lime-700 dark:text-lime-300',
      border: 'border-lime-200 dark:border-lime-800',
      dot: 'bg-lime-500 animate-pulse'
    },
    completed: {
      bg: 'bg-stone-100 dark:bg-stone-800',
      text: 'text-stone-700 dark:text-stone-300',
      border: 'border-stone-200 dark:border-stone-700',
      dot: 'bg-stone-400'
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
      className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl hover:shadow-lime-500/10 dark:hover:shadow-lime-500/5 transition-all duration-300 overflow-hidden"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Gradient accent border on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-500/0 via-lime-500/0 to-lime-500/0 group-hover:from-lime-500/5 group-hover:via-lime-500/5 group-hover:to-lime-500/5 transition-all duration-300 pointer-events-none" />

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
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight truncate">
              {trip.name}
            </h3>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Trip actions"
            >
              <MoreVertical className="w-4 h-4 text-stone-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden z-20">
                  <button
                    onClick={() => {
                      onView?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      onEdit?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    Edit Trip
                  </button>
                  <button
                    onClick={() => {
                      onViewProfitability?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    View Profitability
                  </button>
                  <div className="h-px bg-stone-200 dark:bg-stone-700" />
                  <button
                    onClick={() => {
                      onDelete?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete Trip
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-lime-500" />
            <span className="font-medium">{trip.location}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-lime-500" />
            <span>{dateRange}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-br from-stone-50 to-white dark:from-stone-800 dark:to-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              Bookings
            </p>
            <p className="text-xl font-bold text-stone-900 dark:text-white">
              {trip.bookingsCount}
            </p>
          </div>

          <div className="bg-gradient-to-br from-stone-50 to-white dark:from-stone-800 dark:to-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              Margin
            </p>
            <p className="text-xl font-bold bg-gradient-to-br from-lime-600 to-lime-600 bg-clip-text text-transparent">
              {profitMargin}%
            </p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-2 mb-5 pb-5 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600 dark:text-stone-400">Revenue</span>
            <span className="font-semibold text-stone-900 dark:text-white">
              ${trip.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600 dark:text-stone-400">Expenses</span>
            <span className="font-semibold text-stone-900 dark:text-white">
              ${trip.totalExpenses.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-stone-200 dark:border-stone-800">
            <span className="font-medium text-stone-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-lime-500" />
              Net Profit
            </span>
            <span className="text-lg font-bold bg-gradient-to-br from-lime-600 to-lime-600 bg-clip-text text-transparent">
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
                className="px-2 py-0.5 text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-md capitalize"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-white rounded-xl shadow-lg shadow-lime-500/25 hover:shadow-xl hover:shadow-lime-500/30 transition-all duration-200 font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          <button
            onClick={onAddBooking}
            className="px-3 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-colors"
            aria-label="Add booking"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onAddExpense}
            className="px-3 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-colors flex items-center gap-1.5"
            aria-label="Add expense"
          >
            <DollarSign className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
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
