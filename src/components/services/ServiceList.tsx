'use client'

import type { ServiceOffering } from '@/types/service-offerings'
import { ServiceCard } from './ServiceCard'
import { Filter, Sparkles, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface ServiceListProps {
  serviceOfferings: ServiceOffering[]
}

export function ServiceList({ serviceOfferings }: ServiceListProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'speaking' | 'coaching' | 'workshop' | 'masterclass' | 'arrangements'>('all')

  // Filter services based on active filter
  const filteredServices = activeFilter === 'all'
    ? serviceOfferings
    : serviceOfferings.filter(s => s.type === activeFilter)

  // Featured services
  const featuredServices = serviceOfferings.filter(s => s.featured)

  const filters = [
    { value: 'all' as const, label: 'All Services', count: serviceOfferings.length },
    { value: 'speaking' as const, label: 'Speaking', count: serviceOfferings.filter(s => s.type === 'speaking').length },
    { value: 'coaching' as const, label: 'Coaching', count: serviceOfferings.filter(s => s.type === 'coaching').length },
    { value: 'workshop' as const, label: 'Workshops', count: serviceOfferings.filter(s => s.type === 'workshop').length },
    { value: 'masterclass' as const, label: 'Masterclass', count: serviceOfferings.filter(s => s.type === 'masterclass').length },
    { value: 'arrangements' as const, label: 'Arrangements', count: serviceOfferings.filter(s => s.type === 'arrangements').length }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-cyan-950/10">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-violet-500/5 dark:from-violet-500/10 dark:via-cyan-500/10 dark:to-violet-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                Professional Services
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              Elevate Your{' '}
              <span className="bg-gradient-to-br from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                Vocal Artistry
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Expert coaching, workshops, and custom arrangements to help singers and ensembles reach their full potential
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter:</span>
            </div>
            {filters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex-shrink-0
                  ${activeFilter === filter.value
                    ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'
                  }
                `}
              >
                {filter.label}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${activeFilter === filter.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
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
              <div className="h-1 w-1 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/50 animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Featured Services
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-200 via-transparent to-transparent dark:from-violet-800" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onView={() => window.location.href = `/${service.slug}`}
                  onRequestBooking={() => window.location.href = `/booking?service=${service.slug}`}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Services / Filtered Services */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {activeFilter === 'all' ? 'All Services' : filters.find(f => f.value === activeFilter)?.label}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-violet-200 via-transparent to-transparent dark:from-violet-800" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full">
              {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                onView={() => window.location.href = `/${service.slug}`}
                onRequestBooking={() => window.location.href = `/booking?service=${service.slug}`}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-3xl" />
              <div className="relative bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                    <Filter className="w-8 h-8 sm:w-10 sm:h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    No services found
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Try adjusting your filter to see more services
                  </p>
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium"
                  >
                    View All Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-cyan-700 rounded-2xl p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/50 via-transparent to-cyan-600/50" />
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Have Questions About Our Services?
            </h2>
            <p className="text-base sm:text-lg text-violet-100 mb-6">
              Get in touch to discuss how we can help you achieve your musical goals
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-700 hover:bg-violet-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Custom scrollbar hiding */}
      <style jsx>{`
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
