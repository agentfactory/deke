import type { RequestListProps } from '@/../product/sections/find-a-singing-group/types'
import { RequestCard } from './RequestCard'
import { Search, Filter } from 'lucide-react'
import { useState } from 'react'

export function RequestList({
  groupRequests,
  venues,
  onViewRequest,
  onMarkInProgress,
  onMarkMatched,
  onMarkResponded,
  onRespond,
  onViewSuggestedVenues,
  onArchive
}: RequestListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter requests
  const filteredRequests = groupRequests.filter(request => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.preferences.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const newCount = groupRequests.filter(r => r.status === 'new').length
  const inProgressCount = groupRequests.filter(r => r.status === 'in-progress').length
  const matchedCount = groupRequests.filter(r => r.status === 'matched').length
  const respondedCount = groupRequests.filter(r => r.status === 'responded').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Find a Singing Group
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Help people discover their perfect singing community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              New Requests
            </p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {newCount}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              In Progress
            </p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {inProgressCount}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Matched
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {matchedCount}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Responded
            </p>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              {respondedCount}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, location, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-shadow"
            />
          </div>

          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-shadow appearance-none cursor-pointer"
            >
              <option value="all">All Requests</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="matched">Matched</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </div>

        {/* Request Cards */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery || statusFilter !== 'all'
                ? 'No requests match your filters'
                : 'No group requests yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request, index) => (
              <RequestCard
                key={request.id}
                request={request}
                venues={venues}
                index={index}
                onView={() => onViewRequest?.(request.id)}
                onMarkInProgress={() => onMarkInProgress?.(request.id)}
                onMarkMatched={() => onMarkMatched?.(request.id)}
                onMarkResponded={() => onMarkResponded?.(request.id)}
                onRespond={() => onRespond?.(request.id)}
                onViewSuggestedVenues={() => onViewSuggestedVenues?.(request.id)}
                onArchive={() => onArchive?.(request.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
