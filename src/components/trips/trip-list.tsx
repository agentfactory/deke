'use client'

import type { Trip, TripBooking } from '@/types/trips'
import { TripCard } from './trip-card'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface TripListProps {
  trips: Trip[]
  bookings: TripBooking[]
}

export function TripList({ trips, bookings }: TripListProps) {
  // Calculate summary metrics
  const totalRevenue = trips.reduce((sum, trip) => sum + trip.totalRevenue, 0)
  const totalExpenses = trips.reduce((sum, trip) => sum + trip.totalExpenses, 0)
  const totalProfit = totalRevenue - totalExpenses

  // Group trips by status
  const upcomingTrips = trips.filter(t => t.status === 'upcoming')
  const inProgressTrips = trips.filter(t => t.status === 'in-progress')
  const completedTrips = trips.filter(t => t.status === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-cyan-950/10">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-violet-500/5 dark:from-violet-500/10 dark:via-cyan-500/10 dark:to-violet-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Trip Dashboard
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Manage your coaching engagements and track profitability
              </p>
            </div>

            <Link
              href="/dashboard/trips/new"
              className="group flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90 duration-200" />
              <span className="hidden sm:inline">Create Trip</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Revenue
                </p>
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Total Expenses
                </p>
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Net Profit
                </p>
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-500 via-cyan-500 to-violet-600 shadow-lg shadow-violet-500/50 animate-pulse" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-violet-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                ${totalProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Upcoming Trips
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-200 via-transparent to-transparent dark:from-violet-800" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full">
                {upcomingTrips.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {upcomingTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  bookings={bookings.filter(b => b.tripId === trip.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* In Progress Trips */}
        {inProgressTrips.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                In Progress
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-200 via-transparent to-transparent dark:from-cyan-800" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 rounded-full">
                {inProgressTrips.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {inProgressTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  bookings={bookings.filter(b => b.tripId === trip.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Trips */}
        {completedTrips.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Completed
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 via-transparent to-transparent dark:from-slate-800" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {completedTrips.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {completedTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  bookings={bookings.filter(b => b.tripId === trip.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-3xl" />
              <div className="relative bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    No trips yet
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Create your first trip to start tracking bookings, expenses, and profitability
                  </p>
                  <Link
                    href="/dashboard/trips/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Trip
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
