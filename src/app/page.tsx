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
} from "lucide-react";

const services = [
  {
    title: "Custom Arrangements",
    description:
      "Bespoke a cappella arrangements tailored to your group's unique sound and skill level.",
    icon: Music,
    href: "/arrangements",
    price: "From $500",
  },
  {
    title: "Group Coaching",
    description:
      "Transform your ensemble with expert guidance on blend, dynamics, and performance.",
    icon: Users,
    href: "/coaching",
    price: "From $2,000",
  },
  {
    title: "Workshops & Clinics",
    description:
      "Intensive sessions for schools, festivals, and competitions worldwide.",
    icon: Calendar,
    href: "/workshops",
    price: "From $5,000",
  },
  {
    title: "Speaking Engagements",
    description:
      "Inspiring keynotes on creativity, collaboration, and the power of the human voice.",
    icon: Mic2,
    href: "/speaking",
    price: "From $10,000",
  },
  {
    title: "Masterclass",
    description:
      "Self-paced online courses to elevate your vocal arranging and directing skills.",
    icon: BookOpen,
    href: "/masterclass",
    price: "From $99",
  },
];

const credentials = [
  { label: "Pitch Perfect", sublabel: "Vocal Producer" },
  { label: "The Sing-Off", sublabel: "Creator & Judge" },
  { label: "30+ Years", sublabel: "Industry Experience" },
  { label: "10,000+", sublabel: "Arrangements Created" },
];

const testimonials = [
  {
    quote:
      "Deke transformed our group from good to Grammy-nominated. His ear for harmony is unmatched.",
    author: "Ben Folds",
    role: "Grammy-winning Artist",
  },
  {
    quote:
      "The arrangements we received captured our essence perfectly. Working with Deke was a masterclass in itself.",
    author: "Sarah Chen",
    role: "Director, UCLA Scattertones",
  },
  {
    quote:
      "His workshop changed how we approach a cappella. We went from regional competitors to ICCA finalists.",
    author: "Mike Torres",
    role: "Director, Boston Accidentals",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <Badge variant="secondary" className="w-fit">
                <Star className="h-3 w-3 mr-1" />
                The Father of Contemporary A Cappella
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Transform Your Voice Into{" "}
                <span className="text-primary">Pure Harmony</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                For over three decades, I've helped thousands of vocal groups
                discover their unique sound. From custom arrangements to
                hands-on coaching, let's create something extraordinary
                together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/booking">
                    Book a Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/masterclass">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Free Lesson
                  </Link>
                </Button>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t mt-4">
                {credentials.map((cred) => (
                  <div key={cred.label} className="text-center md:text-left">
                    <div className="font-heading font-bold text-lg">
                      {cred.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cred.sublabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
              <div className="text-center p-8">
                <Music className="h-24 w-24 mx-auto text-primary/30 mb-4" />
                <p className="text-muted-foreground">
                  Hero image placeholder
                  <br />
                  <span className="text-sm">Add Deke's photo here</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              Services
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              How Can I Help Your Group?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're a high school ensemble just starting out or a
              professional group seeking that extra edge, I offer tailored
              solutions for every stage of your journey.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.title}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary">{service.price}</Badge>
                  </div>
                  <CardTitle className="font-heading">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{service.description}</p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href={service.href}>
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              What People Are Saying
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="relative">
                <CardContent className="pt-8">
                  <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/20" />
                  <p className="text-muted-foreground mb-6 relative z-10">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-heading font-bold text-primary">
                        {testimonial.author[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
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

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Elevate Your Sound?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Let's discuss your goals and create a personalized plan to take
            your vocal group to the next level. First consultations are always
            free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/booking">
                Schedule Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
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
