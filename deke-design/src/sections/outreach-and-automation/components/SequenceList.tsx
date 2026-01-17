import type { OutreachProps } from '@/../product/sections/outreach-and-automation/types'
import { SequenceCard } from './SequenceCard'
import { Plus } from 'lucide-react'

/**
 * Mobile-optimized outreach dashboard showing all sequences with engagement metrics
 *
 * Design Tokens Applied:
 * - Primary: violet (for CTAs and status accents)
 * - Secondary: cyan (for informational highlights)
 * - Neutral: slate (for backgrounds, text, borders)
 * - Typography: DM Sans (heading and body)
 */
export function SequenceList({
  emailSequences,
  messages: _messages,
  templates,
  contacts: _contacts,
  leads: _leads,
  onViewSequence,
  onCreateSequence,
  onEditSequence,
  onDeleteSequence,
  onToggleSequence,
  onViewTemplate: _onViewTemplate,
  onCreateTemplate: _onCreateTemplate,
  onEditTemplate: _onEditTemplate,
  onDeleteTemplate: _onDeleteTemplate,
  onViewMessage: _onViewMessage,
  onViewAnalytics
}: OutreachProps) {
  // Calculate summary metrics
  const totalSent = emailSequences.reduce((sum, seq) => sum + seq.sentCount, 0)
  const totalOpened = emailSequences.reduce((sum, seq) => sum + seq.openedCount, 0)
  const totalReplied = emailSequences.reduce((sum, seq) => sum + seq.repliedCount, 0)
  const totalConverted = emailSequences.reduce((sum, seq) => sum + seq.convertedCount, 0)

  const overallOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0
  const overallReplyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : 0
  const overallConversionRate = totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : 0

  // Group sequences by status
  const activeSequences = emailSequences.filter(s => s.status === 'active')
  const pausedSequences = emailSequences.filter(s => s.status === 'paused')
  const draftSequences = emailSequences.filter(s => s.status === 'draft')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-cyan-950/10">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-violet-500/5 dark:from-violet-500/10 dark:via-cyan-500/10 dark:to-violet-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Outreach & Automation
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Manage email sequences and track conversion metrics
              </p>
            </div>

            <button
              onClick={onCreateSequence}
              className="group flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90 duration-200" />
              <span className="hidden sm:inline">Create Sequence</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Open Rate
                </p>
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {overallOpenRate}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Reply Rate
                </p>
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {overallReplyRate}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Conversion
                </p>
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-500 via-cyan-500 to-violet-600 shadow-lg shadow-violet-500/50 animate-pulse" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-violet-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                {overallConversionRate}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Templates
                </p>
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-500/50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {templates.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Active Sequences */}
        {activeSequences.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Active Sequences
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-200 via-transparent to-transparent dark:from-violet-800" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full">
                {activeSequences.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {activeSequences.map((sequence, index) => (
                <SequenceCard
                  key={sequence.id}
                  sequence={sequence}
                  onView={() => onViewSequence?.(sequence.id)}
                  onEdit={() => onEditSequence?.(sequence.id)}
                  onDelete={() => onDeleteSequence?.(sequence.id)}
                  onToggle={() => onToggleSequence?.(sequence.id)}
                  onViewAnalytics={() => onViewAnalytics?.(sequence.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Paused Sequences */}
        {pausedSequences.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Paused Sequences
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-200 via-transparent to-transparent dark:from-cyan-800" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 rounded-full">
                {pausedSequences.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {pausedSequences.map((sequence, index) => (
                <SequenceCard
                  key={sequence.id}
                  sequence={sequence}
                  onView={() => onViewSequence?.(sequence.id)}
                  onEdit={() => onEditSequence?.(sequence.id)}
                  onDelete={() => onDeleteSequence?.(sequence.id)}
                  onToggle={() => onToggleSequence?.(sequence.id)}
                  onViewAnalytics={() => onViewAnalytics?.(sequence.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Draft Sequences */}
        {draftSequences.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Drafts
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 via-transparent to-transparent dark:from-slate-800" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {draftSequences.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {draftSequences.map((sequence, index) => (
                <SequenceCard
                  key={sequence.id}
                  sequence={sequence}
                  onView={() => onViewSequence?.(sequence.id)}
                  onEdit={() => onEditSequence?.(sequence.id)}
                  onDelete={() => onDeleteSequence?.(sequence.id)}
                  onToggle={() => onToggleSequence?.(sequence.id)}
                  onViewAnalytics={() => onViewAnalytics?.(sequence.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {emailSequences.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-3xl" />
              <div className="relative bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    No sequences yet
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Create your first email sequence to start automating your outreach and converting leads
                  </p>
                  <button
                    onClick={onCreateSequence}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Sequence
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
