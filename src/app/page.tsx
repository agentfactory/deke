import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  Users,
  Mic2,
  BookOpen,
  Calendar,
  Star,
  Play,
  ArrowRight,
  Quote,
  Sparkles,
  GraduationCap,
  Disc3,
  Heart,
  Search,
} from "lucide-react";

const services = [
  {
    title: "Arrangements",
    description:
      "Custom arrangements, re-voicing, and expert critiques to make your group shine.",
    icon: Music,
    href: "/arrangements",
    color: "bg-purple-energy",
    badge: "Most Popular",
  },
  {
    title: "Coaching & Workshops",
    description:
      "One-day events and intensive workshops that transform how your group performs.",
    icon: Users,
    href: "/coaching",
    color: "bg-electric-blue",
    badge: null,
  },
  {
    title: "University Events",
    description:
      "Attract top talent with a cappella recruitment events that high school students love.",
    icon: GraduationCap,
    href: "/workshops",
    color: "bg-coral-pop",
    badge: "For Admissions",
  },
  {
    title: "Album Production",
    description:
      "From concept to completion, create a recording that captures your group's magic.",
    icon: Disc3,
    href: "/masterclass",
    color: "bg-mint-fresh",
    badge: null,
  },
];

const credentials = [
  { label: "Pitch Perfect", sublabel: "Vocal Producer", icon: Star },
  { label: "The Sing-Off", sublabel: "Creator & Judge", icon: Mic2 },
  { label: "30+ Years", sublabel: "Of Joy & Harmony", icon: Heart },
  { label: "10,000+", sublabel: "Arrangements", icon: Music },
];

const testimonials = [
  {
    quote:
      "Deke transformed our group from good to Grammy-nominated. His ear for harmony is unmatched.",
    author: "Ben Folds",
    role: "Grammy-winning Artist",
    color: "border-l-purple-energy",
  },
  {
    quote:
      "The arrangements we received captured our essence perfectly. Working with Deke was a masterclass in itself.",
    author: "Sarah Chen",
    role: "Director, UCLA Scattertones",
    color: "border-l-coral-pop",
  },
  {
    quote:
      "His workshop changed how we approach a cappella. We went from regional competitors to ICCA finalists.",
    author: "Mike Torres",
    role: "Director, Boston Accidentals",
    color: "border-l-mint-fresh",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section - Glee-Inspired */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[90vh] flex items-center">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              The Father of Contemporary A Cappella
            </Badge>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Let's Make Your Group{" "}
              <span className="text-sunshine-yellow block md:inline">Unforgettable</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              For over three decades, I've helped thousands of vocal groups
              discover the joy of perfect harmony. Ready to find yours?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="xl" variant="sunshine" asChild className="group">
                <Link href="/booking">
                  Let's Create Something Amazing
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/20 hover:text-white" asChild>
                <Link href="/masterclass">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Free Lesson
                </Link>
              </Button>
            </div>

            {/* Credentials - Playful Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {credentials.map((cred) => (
                <div
                  key={cred.label}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <cred.icon className="h-6 w-6 mx-auto mb-2 text-sunshine-yellow" />
                  <div className="font-heading font-bold text-lg md:text-xl">
                    {cred.label}
                  </div>
                  <div className="text-sm text-white/70">
                    {cred.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="var(--background)"/>
          </svg>
        </div>
      </section>

      {/* Services Section - Colorful Cards */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Services
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              How Can I Help <span className="text-primary">Your Group?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you're a high school ensemble just starting out or a
              professional group seeking that extra edge, let's find the perfect fit.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Link key={service.title} href={service.href} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className={`h-2 ${service.color}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${service.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className="h-7 w-7" />
                      </div>
                      {service.badge && (
                        <Badge variant="outline" className="text-xs">
                          {service.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-heading text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{service.description}</p>
                    <div className="mt-4 flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resource Banner */}
      <section className="py-16 bg-gradient-to-r from-mint-fresh to-electric-blue">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Search className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold">Looking to Join a Group?</h3>
                <p className="text-white/80">Free service to help you find your perfect a cappella family</p>
              </div>
            </div>
            <Button variant="sunshine" size="lg" asChild>
              <Link href="/find-group">
                Find a Group Near You
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              <Heart className="h-3 w-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Hear It From <span className="text-coral-pop">The Choir</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <Card
                key={i}
                className={`relative border-l-4 ${testimonial.color} hover:shadow-2xl`}
              >
                <CardContent className="pt-8">
                  <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10" />
                  <p className="text-lg text-muted-foreground mb-6 relative z-10 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-hero flex items-center justify-center">
                      <span className="font-heading font-bold text-xl text-white">
                        {testimonial.author[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-heading font-bold text-lg">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Vibrant */}
      <section className="py-20 md:py-28 bg-gradient-hero text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce-gentle" />
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Find <span className="text-sunshine-yellow">Your Sound?</span>
          </h2>
          <p className="text-white/90 text-xl max-w-2xl mx-auto mb-10">
            Let's discuss your goals and create a personalized plan to take
            your vocal group to the next level. First consultations are always free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              variant="sunshine"
              asChild
              className="group"
            >
              <Link href="/booking">
                Schedule Free Consultation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/contact">Send a Message</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
