import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  User,
  Clock,
  CheckCircle2,
  ArrowRight,
  Video,
  Mic2,
  Sparkles,
  Heart,
  Zap,
  Target,
} from "lucide-react";

export const metadata = {
  title: "Vocal Coaching",
  description:
    "Expert coaching for vocal groups and individuals. Transform your ensemble with guidance from the father of contemporary a cappella.",
};

const groupPackages = [
  {
    name: "Group Intensive",
    price: "$2,000",
    duration: "Half-day (4 hours)",
    description: "Focused session on specific challenges or repertoire",
    color: "bg-electric-blue",
    features: [
      "4 hours of hands-on coaching",
      "Blend and balance refinement",
      "Repertoire analysis",
      "Performance techniques",
      "Group dynamics assessment",
      "Follow-up notes & recordings",
    ],
  },
  {
    name: "Full Day Workshop",
    price: "$4,000",
    duration: "Full day (8 hours)",
    description: "Comprehensive transformation for competition-ready groups",
    color: "bg-coral-pop",
    popular: true,
    features: [
      "8 hours of intensive coaching",
      "Multiple repertoire pieces",
      "Vocal health techniques",
      "Arranging fundamentals",
      "Competition preparation",
      "Video recording of session",
      "30-day email support",
    ],
  },
  {
    name: "Season Package",
    price: "$10,000",
    duration: "4 sessions over 3 months",
    description: "Long-term development for serious groups",
    color: "bg-purple-energy",
    features: [
      "Four full-day sessions",
      "Competition strategy planning",
      "Repertoire consultation",
      "Monthly video check-ins",
      "Direct text/email access",
      "Priority arrangement slots",
      "Showcase performance review",
    ],
  },
];

const individualOptions = [
  {
    name: "Single Session",
    price: "$200",
    duration: "1 hour",
    description: "Perfect for specific challenges or quick tune-ups",
    color: "bg-mint-fresh",
  },
  {
    name: "5-Session Pack",
    price: "$900",
    duration: "5 hours total",
    description: "Consistent development with dedicated focus areas",
    color: "bg-electric-blue",
  },
  {
    name: "Monthly Mentorship",
    price: "$500/month",
    duration: "2 sessions + support",
    description: "Ongoing guidance for directors and arrangers",
    color: "bg-purple-energy",
  },
];

const focuses = [
  { icon: Mic2, title: "Blend & Balance", description: "Creating unified sound", color: "bg-electric-blue" },
  { icon: Users, title: "Group Dynamics", description: "Building ensemble chemistry", color: "bg-coral-pop" },
  { icon: Video, title: "Stage Presence", description: "Captivating performances", color: "bg-purple-energy" },
  { icon: Clock, title: "Rehearsal Efficiency", description: "Maximizing practice time", color: "bg-mint-fresh" },
];

export default function CoachingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-electric-blue via-purple-energy to-mint-fresh py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-3xl text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Users className="h-3 w-3 mr-1" />
              Vocal Coaching
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Unlock Your Group's{" "}
              <span className="text-sunshine-yellow">Full Potential</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Whether you're preparing for competition, polishing for a big
              show, or simply want to sound better, I'll help you discover
              the sound you didn't know you had.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="sunshine" size="lg" asChild className="group">
                <Link href="/booking?service=coaching">
                  Book Coaching Session
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/20" asChild>
                <Link href="#individual">
                  <User className="mr-2 h-4 w-4" />
                  Individual Coaching
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="var(--background)"/>
          </svg>
        </div>
      </section>

      {/* Coaching Focuses */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {focuses.map((focus) => (
              <div key={focus.title} className="flex items-center gap-3 group">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${focus.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <focus.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-heading font-bold">{focus.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {focus.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Group Packages */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Group Coaching
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Transform Your <span className="text-primary">Ensemble</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              In-person or virtual sessions tailored to your group's specific
              needs, goals, and current skill level.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {groupPackages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`flex flex-col border-0 shadow-lg overflow-hidden ${
                  pkg.popular ? "ring-2 ring-primary shadow-xl scale-105" : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-3 bg-gradient-hero z-10">
                    <Zap className="h-3 w-3 mr-1" />
                    Best Value
                  </Badge>
                )}
                <div className={`h-2 ${pkg.color}`} />
                <CardHeader className="text-center pb-2 pt-8">
                  <Badge variant="outline" className="w-fit mx-auto mb-2">
                    {pkg.duration}
                  </Badge>
                  <CardTitle className="font-heading text-2xl">
                    {pkg.name}
                  </CardTitle>
                  <div className="text-5xl font-bold text-primary mt-2">
                    {pkg.price}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {pkg.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-6 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-mint-fresh shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/booking?service=coaching&package=${pkg.name.toLowerCase().replace(/ /g, '-')}`}>
                      Book Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Individual Coaching */}
      <section id="individual" className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <User className="h-3 w-3 mr-1" />
              Individual Coaching
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              One-on-One <span className="text-coral-pop">Development</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Personalized coaching for directors, arrangers, and individual
              vocalists looking to elevate their craft.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {individualOptions.map((option) => (
              <Card key={option.name} className="border-0 shadow-lg overflow-hidden group">
                <div className={`h-2 ${option.color}`} />
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    {option.price}
                  </div>
                  <div className="font-heading font-bold text-xl mb-1">
                    {option.name}
                  </div>
                  <Badge variant="outline" className="mb-3">
                    {option.duration}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/booking?service=individual&package=${option.name.toLowerCase().replace(/ /g, '-')}`}>
                      Book Session
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce-gentle" />
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center">
          <Heart className="h-16 w-16 mx-auto mb-6 text-coral-pop" />
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Let's Create Your <span className="text-sunshine-yellow">Breakthrough</span>
          </h2>
          <p className="text-white/90 text-xl max-w-2xl mx-auto mb-10">
            Every great vocal group has a moment when everything clicks.
            Let me help you find yours.
          </p>
          <Button
            variant="sunshine"
            size="xl"
            asChild
            className="group"
          >
            <Link href="/booking?service=coaching">
              Schedule Your Session
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
