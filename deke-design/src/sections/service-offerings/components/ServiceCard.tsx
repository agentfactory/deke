import type { ServiceOffering } from '@/../product/sections/service-offerings/types'
import { Calendar, DollarSign, Star, ArrowRight, Quote } from 'lucide-react'

interface ServiceCardProps {
  service: ServiceOffering
  onView?: () => void
  onRequestBooking?: () => void
  index: number
}

export function ServiceCard({
  service,
  onView,
  onRequestBooking,
  index
}: ServiceCardProps) {
  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5 transition-all duration-300 overflow-hidden"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Featured Badge */}
      {service.featured && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-full text-xs font-medium shadow-lg shadow-violet-500/30">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </span>
        </div>
      )}

      {/* Gradient accent border on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-cyan-500/0 to-violet-500/0 group-hover:from-violet-500/5 group-hover:via-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-300 pointer-events-none" />

      <div className="relative">
        {/* Image Placeholder */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-violet-100 via-cyan-50 to-violet-50 dark:from-violet-950/30 dark:via-cyan-950/20 dark:to-violet-950/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl sm:text-7xl opacity-20 dark:opacity-10">
              {service.type === 'speaking' && '🎤'}
              {service.type === 'coaching' && '🎯'}
              {service.type === 'workshop' && '👥'}
              {service.type === 'masterclass' && '🎓'}
              {service.type === 'arrangements' && '🎵'}
            </div>
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-slate-900/80 dark:via-slate-900/20 dark:to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Service Type Badge */}
          <div className="mb-3">
            <span className="inline-block px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full capitalize">
              {service.type}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              {service.title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {service.tagline}
            </p>
          </div>

          {/* Pricing & Duration */}
          <div className="flex flex-wrap gap-3 mb-5 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <DollarSign className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {service.pricing}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-slate-600 dark:text-slate-400">
                {service.duration}
              </span>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mb-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">
              What's Included
            </p>
            <ul className="space-y-2">
              {service.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {service.features.length > 3 && (
                <li className="text-xs text-slate-500 dark:text-slate-500 pl-3.5">
                  + {service.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>

          {/* Testimonial */}
          {service.testimonial && (
            <div className="mb-5 p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Quote className="w-4 h-4 text-violet-400 mb-2" />
              <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-2 line-clamp-2">
                "{service.testimonial.quote}"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-white">
                  {service.testimonial.author}
                </span>
                , {service.testimonial.role}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onRequestBooking}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-medium text-sm"
            >
              Request Booking
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onView}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-medium text-sm"
            >
              Learn More
            </button>
          </div>
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
