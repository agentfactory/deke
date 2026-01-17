import type { GroupRequest, Venue } from '@/../product/sections/find-a-singing-group/types'
import { MapPin, Calendar, Award, MoreVertical, Eye, Mail, Check } from 'lucide-react'
import { useState } from 'react'

interface RequestCardProps {
  request: GroupRequest
  venues: Venue[]
  onView?: () => void
  onMarkInProgress?: () => void
  onMarkMatched?: () => void
  onMarkResponded?: () => void
  onRespond?: () => void
  onViewSuggestedVenues?: () => void
  onArchive?: () => void
  index: number
}

export function RequestCard({
  request,
  venues,
  onView,
  onMarkInProgress,
  onMarkMatched,
  onMarkResponded: _onMarkResponded,
  onRespond,
  onViewSuggestedVenues,
  onArchive,
  index
}: RequestCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format date
  const submittedDate = new Date(request.submittedDate)
  const formattedDate = submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Status styling
  const statusConfig = {
    new: {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-violet-200 dark:border-violet-800',
      dot: 'bg-violet-500 animate-pulse'
    },
    'in-progress': {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-800',
      dot: 'bg-cyan-500'
    },
    matched: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500'
    },
    responded: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400'
    }
  }

  const status = statusConfig[request.status]

  // Match score styling
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-600 to-cyan-600'
    if (score >= 80) return 'from-cyan-600 to-violet-600'
    if (score >= 70) return 'from-violet-600 to-slate-600'
    return 'from-slate-600 to-slate-700'
  }

  // Get venue names for suggested matches
  const suggestedVenueNames = request.suggestedVenues
    .map(venueId => venues.find(v => v.id === venueId)?.name)
    .filter(Boolean)
    .slice(0, 2)

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
                {request.status.replace('-', ' ')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {request.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Age {request.age}
            </p>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Request actions"
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
                  <button
                    onClick={() => {
                      onView?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      onMarkInProgress?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => {
                      onMarkMatched?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Mark Matched
                  </button>
                  <button
                    onClick={() => {
                      onViewSuggestedVenues?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    View Suggested Venues
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={() => {
                      onArchive?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Archive Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-500" />
            <span className="font-medium">{request.location}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-500" />
            <span>Submitted {formattedDate}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Award className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-500" />
            <span className="capitalize">{request.preferences.experience} singer</span>
          </div>
        </div>

        {/* Match Score & Commitment */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Match Score
            </p>
            <p className={`text-xl font-bold bg-gradient-to-br ${getMatchScoreColor(request.matchScore)} bg-clip-text text-transparent`}>
              {request.matchScore}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Commitment
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white capitalize leading-tight">
              {request.preferences.commitment.replace('-', ' ')}
            </p>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {request.preferences.genres.slice(0, 3).map(genre => (
            <span
              key={genre}
              className="px-2 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-md"
            >
              {genre}
            </span>
          ))}
          {request.preferences.performanceInterest && (
            <span className="px-2 py-0.5 text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-md">
              Wants to perform
            </span>
          )}
        </div>

        {/* Suggested Venues */}
        {suggestedVenueNames.length > 0 && (
          <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Suggested Matches
            </p>
            <div className="space-y-1">
              {suggestedVenueNames.map((name, i) => (
                <p key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500" />
                  {name}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Message Preview */}
        <div className="mb-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {request.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            View Full Request
          </button>

          <button
            onClick={onRespond}
            className="px-3 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/25"
            aria-label="Respond to request"
          >
            <Mail className="w-4 h-4" />
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
