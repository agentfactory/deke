import type { ServiceListProps } from '@/../product/sections/service-offerings/types'
import { ServiceCard } from './ServiceCard'
import { Filter, Sparkles, ArrowRight } from 'lucide-react'
import { useState } from 'react'

/**
 * Public-facing service showcase displaying all available offerings
 *
 * Design Tokens Applied:
 * - Primary: violet (for CTAs and featured highlights)
 * - Secondary: cyan (for informational accents)
 * - Neutral: slate (for backgrounds, text, borders)
 * - Typography: DM Sans (heading and body)
 */
export function ServiceList({
  serviceOfferings,
  onViewService,
  onRequestBooking,
  onContactAboutService,
  onFilterByType
}: ServiceListProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'speaking' | 'coaching' | 'workshop' | 'masterclass' | 'arrangements'>('all')

  // Filter services based on active filter
  const filteredServices = activeFilter === 'all'
    ? serviceOfferings
    : serviceOfferings.filter(s => s.type === activeFilter)

  // Featured services
  const featuredServices = serviceOfferings.filter(s => s.featured)

  // Handle filter change
  const handleFilterChange = (type: typeof activeFilter) => {
    setActiveFilter(type)
    onFilterByType?.(type)
  }

  const filters = [
    { value: 'all' as const, label: 'All Services', count: serviceOfferings.length },
    { value: 'speaking' as const, label: 'Speaking', count: serviceOfferings.filter(s => s.type === 'speaking').length },
    { value: 'coaching' as const, label: 'Coaching', count: serviceOfferings.filter(s => s.type === 'coaching').length },
    { value: 'workshop' as const, label: 'Workshops', count: serviceOfferings.filter(s => s.type === 'workshop').length },
    { value: 'masterclass' as const, label: 'Masterclass', count: serviceOfferings.filter(s => s.type === 'masterclass').length },
    { value: 'arrangements' as const, label: 'Arrangements', count: serviceOfferings.filter(s => s.type === 'arrangements').length }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-lime-50/30 to-lime-50/20 dark:from-stone-950 dark:via-lime-950/20 dark:to-lime-950/10">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 via-lime-500/5 to-lime-500/5 dark:from-lime-500/10 dark:via-lime-500/10 dark:to-lime-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-lime-100 to-lime-100 dark:from-lime-900/30 dark:to-lime-900/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-lime-600 dark:text-lime-400" />
              <span className="text-sm font-medium text-lime-700 dark:text-lime-300">
                Professional Services
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-white tracking-tight mb-4">
              Elevate Your{' '}
              <span className="bg-gradient-to-br from-lime-600 to-lime-600 bg-clip-text text-transparent">
                Vocal Artistry
              </span>
            </h1>
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              Expert coaching, workshops, and custom arrangements to help singers and ensembles reach their full potential
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter:</span>
            </div>
            {filters.map(filter => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex-shrink-0
                  ${activeFilter === filter.value
                    ? 'bg-gradient-to-br from-lime-600 to-lime-700 text-white shadow-lg shadow-lime-500/25'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-lime-300 dark:hover:border-lime-700'
                  }
                `}
              >
                {filter.label}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${activeFilter === filter.value
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                  }
                `}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Featured Services (only show when filter is 'all') */}
        {activeFilter === 'all' && featuredServices.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-gradient-to-br from-lime-500 to-lime-500 shadow-lg shadow-lime-500/50 animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                Featured Services
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-lime-200 via-transparent to-transparent dark:from-lime-800" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onView={() => onViewService?.(service.id)}
                  onRequestBooking={() => onRequestBooking?.(service.id)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Services / Filtered Services */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-lime-500 shadow-lg shadow-lime-500/50" />
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
              {activeFilter === 'all' ? 'All Services' : filters.find(f => f.value === activeFilter)?.label}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-lime-200 via-transparent to-transparent dark:from-lime-800" />
            <span className="text-sm font-medium text-stone-500 dark:text-stone-400 bg-lime-100 dark:bg-lime-900/30 px-3 py-1 rounded-full">
              {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                onView={() => onViewService?.(service.id)}
                onRequestBooking={() => onRequestBooking?.(service.id)}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/20 to-lime-500/20 blur-3xl" />
              <div className="relative bg-white dark:bg-stone-800 p-8 sm:p-12 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-lime-100 to-lime-100 dark:from-lime-900/30 dark:to-lime-900/30 rounded-full flex items-center justify-center">
                    <Filter className="w-8 h-8 sm:w-10 sm:h-10 text-lime-600 dark:text-lime-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                    No services found
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                    Try adjusting your filter to see more services
                  </p>
                  <button
                    onClick={() => handleFilterChange('all')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-white rounded-xl shadow-lg shadow-lime-500/25 hover:shadow-xl hover:shadow-lime-500/30 transition-all duration-200 font-medium"
                  >
                    View All Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <section className="relative overflow-hidden bg-gradient-to-br from-lime-600 via-lime-700 to-lime-700 rounded-2xl p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-600/50 via-transparent to-lime-600/50" />
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Have Questions About Our Services?
            </h2>
            <p className="text-base sm:text-lg text-lime-100 mb-6">
              Get in touch to discuss how we can help you achieve your musical goals
            </p>
            <button
              onClick={() => onContactAboutService?.('')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-lime-700 hover:bg-lime-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>

      {/* Custom scrollbar hiding */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
