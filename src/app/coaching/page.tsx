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
  },
  {
    name: "5-Session Pack",
    price: "$900",
    duration: "5 hours total",
    description: "Consistent development with dedicated focus areas",
  },
  {
    name: "Monthly Mentorship",
    price: "$500/month",
    duration: "2 sessions + support",
    description: "Ongoing guidance for directors and arrangers",
  },
];

const focuses = [
  { icon: Mic2, title: "Blend & Balance", description: "Creating unified sound" },
  { icon: Users, title: "Group Dynamics", description: "Building ensemble chemistry" },
  { icon: Video, title: "Stage Presence", description: "Captivating performances" },
  { icon: Clock, title: "Rehearsal Efficiency", description: "Maximizing practice time" },
];

export default function CoachingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3 w-3 mr-1" />
              Vocal Coaching
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Unlock Your Group's Full Potential
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're preparing for competition, polishing for a big
              show, or simply want to sound better, I'll help you discover
              the sound you didn't know you had.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/booking?service=coaching">
                  Book Coaching Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#individual">Individual Coaching</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Coaching Focuses */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {focuses.map((focus) => (
              <div key={focus.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <focus.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{focus.title}</div>
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
              Group Coaching
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Transform Your Ensemble
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              In-person or virtual sessions tailored to your group's specific
              needs, goals, and current skill level.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {groupPackages.map((pkg) => (
              <Card key={pkg.name} className="flex flex-col">
                <CardHeader className="text-center pb-2">
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">
                    {pkg.duration}
                  </Badge>
                  <CardTitle className="font-heading text-2xl">
                    {pkg.name}
                  </CardTitle>
                  <div className="text-4xl font-bold text-primary mt-2">
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
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              One-on-One Development
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Personalized coaching for directors, arrangers, and individual
              vocalists looking to elevate their craft.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {individualOptions.map((option) => (
              <Card key={option.name}>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {option.price}
                  </div>
                  <div className="font-heading font-semibold text-lg mb-1">
                    {option.name}
                  </div>
                  <Badge variant="secondary" className="mb-3">
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
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Let's Create Your Breakthrough
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Every great vocal group has a moment when everything clicks.
            Let me help you find yours.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/booking?service=coaching">
              Schedule Your Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
