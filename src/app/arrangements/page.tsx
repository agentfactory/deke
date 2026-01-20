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
  Sparkles,
  Headphones,
  Zap,
  Heart,
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
    color: "mint",
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
    color: "primary",
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
    color: "purple",
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
    color: "bg-electric-blue",
  },
  {
    step: 2,
    title: "Song Selection",
    description:
      "I help identify songs that showcase your strengths and challenge you to grow.",
    color: "bg-coral-pop",
  },
  {
    step: 3,
    title: "Creation",
    description:
      "I craft your custom arrangement, considering every voice in your group.",
    color: "bg-purple-energy",
  },
  {
    step: 4,
    title: "Delivery & Support",
    description:
      "Receive your arrangement with learning materials and ongoing support.",
    color: "bg-mint-fresh",
  },
];

const sampleCategories = [
  {
    title: "Pop/Contemporary",
    subtitle: "Competition winning",
    description: "Modern arrangements with complex harmonies and driving vocal percussion.",
    color: "bg-coral-pop",
    icon: Zap,
  },
  {
    title: "Jazz Standards",
    subtitle: "Classic reimagined",
    description: "Rich jazz voicings and sophisticated harmonic progressions.",
    color: "bg-purple-energy",
    icon: Music,
  },
  {
    title: "Holiday/Seasonal",
    subtitle: "Audience favorites",
    description: "Fresh takes on beloved classics perfect for holiday performances.",
    color: "bg-mint-fresh",
    icon: Heart,
  },
];

export default function ArrangementsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-energy via-electric-blue to-coral-pop py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-3xl text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Music className="h-3 w-3 mr-1" />
              Custom Arrangements
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Arrangements That Make{" "}
              <span className="text-sunshine-yellow">Voices Soar</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Every vocal group has a distinct identity. I create bespoke
              arrangements that highlight your strengths, challenge your
              singers, and leave audiences spellbound.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="sunshine" size="lg" asChild className="group">
                <Link href="/booking?service=arrangement">
                  Request an Arrangement
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/20" asChild>
                <Link href="#samples">
                  <Headphones className="mr-2 h-4 w-4" />
                  Listen to Samples
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

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Arrangements Created", color: "text-electric-blue" },
              { value: "50+", label: "Countries Served", color: "text-coral-pop" },
              { value: "98%", label: "Client Satisfaction", color: "text-purple-energy" },
              { value: "30+", label: "Years Experience", color: "text-mint-fresh" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className={`font-heading text-4xl md:text-5xl font-bold ${stat.color} group-hover:scale-110 transition-transform`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Pricing
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-primary">Package</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From simple covers to complex competition pieces, I offer flexible
              options to match your needs and budget.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`relative border-0 shadow-lg overflow-hidden ${
                  pkg.popular ? "ring-2 ring-primary shadow-xl scale-105" : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-3 bg-gradient-hero">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <div className={`h-2 ${pkg.color === 'mint' ? 'bg-mint-fresh' : pkg.color === 'purple' ? 'bg-purple-energy' : 'bg-primary'}`} />
                <CardHeader className="text-center pb-2 pt-8">
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
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
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
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              The Arrangement <span className="text-coral-pop">Process</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {process.map((step) => (
              <div key={step.step} className="text-center group">
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${step.color} text-white text-3xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.step}
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">
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
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Hear the <span className="text-purple-energy">Difference</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Listen to examples of arrangements created for groups of all levels
              and styles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {sampleCategories.map((category) => (
              <Card key={category.title} className="border-0 shadow-lg overflow-hidden group">
                <div className={`h-2 ${category.color}`} />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${category.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
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
      <section className="py-20 md:py-28 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce-gentle" />
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Something <span className="text-sunshine-yellow">Special?</span>
          </h2>
          <p className="text-white/90 text-xl max-w-2xl mx-auto mb-10">
            Let's discuss your vision and create an arrangement that will
            become your group's signature piece.
          </p>
          <Button
            variant="sunshine"
            size="xl"
            asChild
            className="group"
          >
            <Link href="/booking?service=arrangement">
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
