import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  Music,
  ArrowRight,
  CheckCircle2,
  Heart,
  Sparkles,
  Globe,
  MessageCircle,
} from "lucide-react";
import { FindGroupForm } from "@/components/find-group/find-group-form";

export const metadata = {
  title: "Find a Singing Group | Deke Sharon",
  description:
    "Looking to join a singing group? Submit your preferences and we'll help match you with the perfect a cappella, choir, or vocal ensemble near you.",
};

const benefits = [
  {
    icon: Users,
    title: "Community Connection",
    description:
      "Join a welcoming community of singers who share your passion for harmony and performance.",
  },
  {
    icon: Music,
    title: "Musical Growth",
    description:
      "Develop your vocal skills, learn new techniques, and expand your musical horizons with experienced groups.",
  },
  {
    icon: Heart,
    title: "Lifelong Friendships",
    description:
      "Singing together creates bonds that last. Find your tribe and make meaningful connections.",
  },
  {
    icon: Sparkles,
    title: "Performance Opportunities",
    description:
      "From casual gigs to competitions, discover opportunities to share your voice with the world.",
  },
];

const groupTypes = [
  {
    title: "A Cappella Groups",
    description: "Contemporary vocal groups performing without instruments",
    genres: ["Pop", "Jazz", "Rock", "R&B"],
  },
  {
    title: "Choirs & Choruses",
    description: "Traditional and modern choral ensembles of all sizes",
    genres: ["Classical", "Gospel", "Folk", "World"],
  },
  {
    title: "Barbershop Quartets",
    description: "Close harmony singing in the classic barbershop style",
    genres: ["Barbershop", "Doo-wop", "Standards"],
  },
  {
    title: "Community Groups",
    description: "Casual singing groups for all skill levels",
    genres: ["Mixed", "All genres welcome"],
  },
];

const stats = [
  { number: "1,000+", label: "Groups Worldwide" },
  { number: "50+", label: "Countries" },
  { number: "95%", label: "Match Rate" },
];

export default function FindGroupPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Users className="h-3 w-3 mr-1" />
                Find Your Voice
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                Find Your Perfect Singing Group
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you&apos;re a seasoned performer or just starting your
                vocal journey, we&apos;ll help you find a group that matches
                your style, schedule, and goals.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center px-4">
                    <p className="text-3xl font-bold text-primary">
                      {stat.number}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Form Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Tell Us About Yourself
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FindGroupForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Why Join a Group?
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              More Than Just Singing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Joining a singing group opens doors to experiences that go far
              beyond making music together.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Group Types */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Globe className="h-3 w-3 mr-1" />
              Group Types
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Every Style of Singing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From barbershop quartets to contemporary a cappella, we connect
              singers with groups across all genres and styles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {groupTypes.map((type) => (
              <Card key={type.title}>
                <CardContent className="pt-6">
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {type.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {type.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              How It Works
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Simple Steps to Your New Group
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                Share Your Preferences
              </h3>
              <p className="text-sm text-muted-foreground">
                Tell us about your experience level, musical interests, location,
                and availability.
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                We Find Matches
              </h3>
              <p className="text-sm text-muted-foreground">
                Our network and expertise help identify groups that fit your
                criteria and goals.
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                Connect & Audition
              </h3>
              <p className="text-sm text-muted-foreground">
                We introduce you to compatible groups and help facilitate your
                audition process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              FAQ
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Common Questions
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Do I need experience?</h3>
                <p className="text-sm text-muted-foreground">
                  Not at all! Groups range from beginner-friendly community
                  choirs to advanced competitive ensembles. We match you based on
                  your current skill level.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Is there a fee?</h3>
                <p className="text-sm text-muted-foreground">
                  Our matching service is free. Individual groups may have their
                  own membership dues or audition processes.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How long does matching take?</h3>
                <p className="text-sm text-muted-foreground">
                  Typically 1-2 weeks. We review your preferences and reach out
                  with potential matches as we find them.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">What if I&apos;m in a small town?</h3>
                <p className="text-sm text-muted-foreground">
                  We have connections worldwide and can also suggest starting your
                  own group or joining virtual ensembles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Singing?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of singers who have found their perfect musical home.
            Your next harmony is waiting.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="#top">
              Submit Your Request
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
