import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Trophy,
  Building2,
} from "lucide-react";

export const metadata = {
  title: "Workshops & Clinics",
  description:
    "Intensive a cappella workshops for schools, festivals, and competitions. Transform your program in a single event.",
};

const workshopTypes = [
  {
    icon: GraduationCap,
    title: "School Programs",
    description:
      "Multi-day residencies for high school and college programs looking to establish or elevate their a cappella offerings.",
    features: [
      "Curriculum development",
      "Student workshops",
      "Faculty training",
      "Concert coaching",
      "Program assessment",
    ],
  },
  {
    icon: Trophy,
    title: "Competition Prep",
    description:
      "Intensive preparation for ICCA, ICHSA, Harmony Sweepstakes, and other major competitions.",
    features: [
      "Set design & flow",
      "Arrangement polish",
      "Staging & choreography",
      "Judge perspective insights",
      "Performance simulation",
    ],
  },
  {
    icon: Calendar,
    title: "Festival Clinics",
    description:
      "Multi-group sessions at festivals, conferences, and special events.",
    features: [
      "Keynote presentation",
      "Multiple group coaching",
      "Open workshops",
      "Q&A sessions",
      "Networking facilitation",
    ],
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description:
      "Team-building through music for corporate retreats and conferences.",
    features: [
      "Team harmony building",
      "Communication exercises",
      "Group performance",
      "Leadership through music",
      "Custom content",
    ],
  },
];

const upcomingEvents = [
  {
    title: "ICCA West Quarterfinal Prep",
    location: "Los Angeles, CA",
    date: "February 15, 2025",
    spots: 8,
  },
  {
    title: "A Cappella Summit",
    location: "Boston, MA",
    date: "March 22-24, 2025",
    spots: 50,
  },
  {
    title: "High School Festival",
    location: "Nashville, TN",
    date: "April 10-12, 2025",
    spots: 20,
  },
];

export default function WorkshopsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              Workshops & Clinics
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Transform Your Program in Days
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              From single-day intensives to week-long residencies, I bring
              three decades of experience directly to your ensemble, school,
              or event.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/booking?service=workshop">
                  Request a Workshop
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#upcoming">Upcoming Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Types */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Workshop Types
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Choose Your Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every workshop is customized to your specific needs, goals, and
              participant skill levels.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {workshopTypes.map((workshop) => (
              <Card key={workshop.title}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <workshop.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-heading text-xl">
                    {workshop.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {workshop.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2 mb-4">
                    {workshop.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/booking?service=workshop&type=${workshop.title.toLowerCase().replace(/ /g, '-')}`}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section id="upcoming" className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Events
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Upcoming Workshops
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join an open workshop or festival clinic near you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {upcomingEvents.map((event) => (
              <Card key={event.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {event.spots} spots left
                    </Badge>
                    <Button size="sm" asChild>
                      <Link href={`/booking?event=${event.title.toLowerCase().replace(/ /g, '-')}`}>
                        Register
                      </Link>
                    </Button>
                  </div>
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
            Bring the Workshop to You
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            I travel worldwide to work with groups, schools, and organizations.
            Let's design the perfect experience for your needs.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/booking?service=workshop">
              Request a Custom Workshop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
