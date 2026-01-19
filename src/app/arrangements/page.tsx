import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileMusic,
  Users,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Custom Arrangements",
  description:
    "Bespoke a cappella arrangements tailored to your group's unique sound, skill level, and performance goals.",
};

const packages = [
  {
    name: "Essential",
    price: "$500",
    description: "Perfect for simple pop songs and straightforward arrangements",
    features: [
      "Up to 4 voice parts",
      "Standard vocal percussion",
      "PDF score + demo recording",
      "2-3 week turnaround",
      "One round of revisions",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$1,500",
    description: "Ideal for competition-ready pieces with complex harmonies",
    features: [
      "Up to 8 voice parts",
      "Advanced vocal percussion",
      "PDF + Finale/Sibelius files",
      "Learning tracks for each part",
      "10-14 day turnaround",
      "Two rounds of revisions",
      "Phone consultation included",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "$3,000+",
    description: "Full production for recording, broadcast, or major performances",
    features: [
      "Unlimited voice parts",
      "Custom VP notation",
      "All file formats",
      "Full learning track suite",
      "7-day rush available",
      "Unlimited revisions",
      "Video call consultation",
      "Performance coaching session",
    ],
    popular: false,
  },
];

const process = [
  {
    step: 1,
    title: "Consultation",
    description:
      "We discuss your group's sound, skill level, and vision for the arrangement.",
  },
  {
    step: 2,
    title: "Song Selection",
    description:
      "I help identify songs that showcase your strengths and challenge you to grow.",
  },
  {
    step: 3,
    title: "Creation",
    description:
      "I craft your custom arrangement, considering every voice in your group.",
  },
  {
    step: 4,
    title: "Delivery & Support",
    description:
      "Receive your arrangement with learning materials and ongoing support.",
  },
];

export default function ArrangementsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              <Music className="h-3 w-3 mr-1" />
              Custom Arrangements
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Arrangements That Capture Your Unique Sound
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Every vocal group has a distinct identity. I create bespoke
              arrangements that highlight your strengths, challenge your
              singers, and leave audiences spellbound.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/booking?service=arrangement">
                  Request an Arrangement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#samples">Listen to Samples</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                10,000+
              </div>
              <div className="text-muted-foreground">Arrangements Created</div>
            </div>
            <div>
              <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                50+
              </div>
              <div className="text-muted-foreground">Countries Served</div>
            </div>
            <div>
              <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                98%
              </div>
              <div className="text-muted-foreground">Client Satisfaction</div>
            </div>
            <div>
              <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                30+
              </div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Pricing
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From simple covers to complex competition pieces, I offer flexible
              options to match your needs and budget.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`relative ${
                  pkg.popular ? "border-primary shadow-lg" : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
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
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/booking?service=arrangement&package=${pkg.name.toLowerCase()}`}>
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              How It Works
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              The Arrangement Process
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {process.map((step) => (
              <div key={step.step} className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Samples */}
      <section id="samples" className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <FileMusic className="h-3 w-3 mr-1" />
              Sample Work
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Hear the Difference
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Listen to examples of arrangements created for groups of all levels
              and styles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Pop/Contemporary</h3>
                    <p className="text-sm text-muted-foreground">Competition winning</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Modern arrangements with complex harmonies and driving vocal percussion.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Jazz Standards</h3>
                    <p className="text-sm text-muted-foreground">Classic reimagined</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rich jazz voicings and sophisticated harmonic progressions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Holiday/Seasonal</h3>
                    <p className="text-sm text-muted-foreground">Audience favorites</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fresh takes on beloved classics perfect for holiday performances.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Audio samples available during consultation
            </p>
            <Button variant="outline" asChild>
              <Link href="/booking?service=arrangement">
                Request a Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Something Special?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Let's discuss your vision and create an arrangement that will
            become your group's signature piece.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/booking?service=arrangement">
              Start Your Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
