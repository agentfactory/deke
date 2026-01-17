import type { Campaign, Lead } from '@/../product/sections/campaign-and-lead-discovery/types'
import { MapPin, Target, TrendingUp, MoreVertical, Eye, Search } from 'lucide-react'
import { useState } from 'react'

interface CampaignCardProps {
  campaign: Campaign
  leads: Lead[]
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onViewLeads?: () => void
  index: number
}

export function CampaignCard({
  campaign,
  leads,
  onView,
  onEdit,
  onDelete,
  onViewLeads,
  index
}: CampaignCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format dates
  const createdDate = new Date(campaign.createdDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Calculate conversion rate (qualified leads / total leads)
  const conversionRate = campaign.totalLeads > 0
    ? ((campaign.highScoreLeads / campaign.totalLeads) * 100).toFixed(0)
    : 0

  // Status styling
  const statusConfig = {
    pending: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400'
    },
    'in-progress': {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-800',
      dot: 'bg-cyan-500 animate-pulse'
    },
    completed: {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-violet-200 dark:border-violet-800',
      dot: 'bg-violet-500'
    },
    cancelled: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500'
    }
  }

  const status = statusConfig[campaign.status]

  // Source badges
  const sourceBadges = {
    choralnet: { label: 'ChoralNet', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
    casa: { label: 'CASA', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
    facebook: { label: 'Facebook', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    instagram: { label: 'Instagram', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
    google: { label: 'Google', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
  }

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
                {campaign.status.replace('-', ' ')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {campaign.name}
            </h3>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Campaign actions"
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
                      onViewLeads?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    View Leads
                  </button>
                  <button
                    onClick={() => {
                      onEdit?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Edit Campaign
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={() => {
                      onDelete?.()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete Campaign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Campaign Details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-500" />
            <span className="font-medium">{campaign.location}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>{campaign.radius}mi radius</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Target className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-500" />
            <span>Created {createdDate}</span>
          </div>
        </div>

        {/* Source Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          {campaign.sources.map(source => (
            <span
              key={source}
              className={`px-2 py-0.5 text-xs font-medium rounded-md ${sourceBadges[source].color}`}
            >
              {sourceBadges[source].label}
            </span>
          ))}
        </div>

        {/* Lead Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Total
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {campaign.totalLeads}
            </p>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/20 dark:to-slate-900 p-3 rounded-xl border border-violet-200 dark:border-violet-800">
            <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">
              High Score
            </p>
            <p className="text-xl font-bold bg-gradient-to-br from-violet-600 to-violet-700 bg-clip-text text-transparent">
              {campaign.highScoreLeads}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Rate
            </p>
            <p className="text-xl font-bold bg-gradient-to-br from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
              {conversionRate}%
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500" />
              <span className="text-slate-600 dark:text-slate-400">High (80-100)</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {campaign.highScoreLeads}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <span className="text-slate-600 dark:text-slate-400">Medium (60-79)</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {campaign.mediumScoreLeads}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">Low (0-59)</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {campaign.lowScoreLeads}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onViewLeads}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium text-sm"
          >
            <Search className="w-4 h-4" />
            View Leads
          </button>

          <button
            onClick={onView}
            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            aria-label="View details"
          >
            <Eye className="w-4 h-4" />
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
