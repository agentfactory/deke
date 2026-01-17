import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Music, Users, Mic, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'

const services = [
  {
    id: 'arrangements',
    title: 'Arrangements',
    description: 'Custom vocal arrangements for any song',
    icon: Music,
    href: '/arrangements',
    color: 'from-violet-600 to-violet-700'
  },
  {
    id: 'coaching',
    title: 'Group Coaching',
    description: 'Transform your ensemble with expert coaching',
    icon: Users,
    href: '/coaching',
    color: 'from-cyan-600 to-cyan-700'
  },
  {
    id: 'workshops',
    title: 'Workshops',
    description: 'Interactive learning experiences',
    icon: BookOpen,
    href: '/workshops',
    color: 'from-violet-600 to-cyan-600'
  },
  {
    id: 'speaking',
    title: 'Speaking',
    description: 'Keynotes and presentations',
    icon: Mic,
    href: '/speaking',
    color: 'from-cyan-600 to-violet-600'
  },
  {
    id: 'masterclass',
    title: 'Masterclass',
    description: 'Deep-dive learning sessions',
    icon: GraduationCap,
    href: '/masterclass',
    color: 'from-violet-700 to-violet-800'
  }
]

export default async function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-cyan-950/10">
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-violet-500/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Service Offerings
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Explore professional coaching and music services
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.id}
                className="group relative overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {service.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <Link href={service.href}>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-950/20 dark:to-cyan-950/20 border-violet-200 dark:border-violet-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Whether you need an arrangement, coaching, or want to book a workshop,
              I'm here to help your ensemble reach new heights.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
              >
                Get in Touch
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
