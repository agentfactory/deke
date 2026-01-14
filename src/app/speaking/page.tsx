import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic2,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Quote,
  Presentation,
  Lightbulb,
  Heart,
} from "lucide-react";

export const metadata = {
  title: "Speaking Engagements",
  description:
    "Inspiring keynotes and presentations on creativity, collaboration, and the transformative power of the human voice.",
};

const topics = [
  {
    icon: Users,
    title: "The Harmony of Teams",
    description:
      "How the principles of a cappella translate to exceptional teamwork and organizational culture.",
    audiences: ["Corporate", "Leadership", "HR"],
  },
  {
    icon: Lightbulb,
    title: "Finding Your Voice",
    description:
      "Discovering authentic expression and building confidence through the power of vocal music.",
    audiences: ["Education", "Youth", "Personal Development"],
  },
  {
    icon: Presentation,
    title: "The Business of Creativity",
    description:
      "Lessons from 30 years of building businesses around passion and artistry.",
    audiences: ["Entrepreneurs", "Creatives", "Startups"],
  },
  {
    icon: Heart,
    title: "Connection Without Words",
    description:
      "How music builds bridges across cultures, generations, and perspectives.",
    audiences: ["Nonprofits", "Community", "Cultural Events"],
  },
];

const formats = [
  {
    name: "Keynote Address",
    duration: "45-60 minutes",
    price: "From $15,000",
    description: "Inspiring main-stage presentation with interactive elements",
  },
  {
    name: "Workshop Session",
    duration: "2-3 hours",
    price: "From $10,000",
    description: "Hands-on learning experience with practical takeaways",
  },
  {
    name: "Full-Day Intensive",
    duration: "6-8 hours",
    price: "From $25,000",
    description: "Deep dive combining keynote, workshops, and coaching",
  },
  {
    name: "Conference Package",
    duration: "Multi-day",
    price: "From $40,000",
    description: "Multiple sessions, panels, and private consultations",
  },
];

const testimonials = [
  {
    quote:
      "Deke's keynote was the highlight of our conference. He had 2,000 executives singing in four-part harmony within minutes.",
    author: "Jennifer Walsh",
    role: "VP Events, Fortune 500 Company",
  },
  {
    quote:
      "The principles he teaches about teamwork through music transformed how our leadership team communicates.",
    author: "Marcus Chen",
    role: "CEO, Tech Startup",
  },
];

export default function SpeakingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              <Mic2 className="h-3 w-3 mr-1" />
              Speaking Engagements
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Inspire Through the Power of Voice
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Engaging keynotes that blend music, storytelling, and practical
              wisdom to create unforgettable experiences for audiences of all
              backgrounds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/booking?service=speaking">
                  Book Deke to Speak
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#topics">View Topics</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Presentation Topics
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Tailored to Your Audience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every presentation is customized to your event's theme, audience,
              and objectives.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {topics.map((topic) => (
              <Card key={topic.title}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <topic.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-heading text-xl">
                    {topic.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {topic.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {topic.audiences.map((audience) => (
                      <Badge key={audience} variant="secondary">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formats & Pricing */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Engagement Formats
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Choose Your Format
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {formats.map((format) => (
              <Card key={format.name} className="text-center">
                <CardContent className="pt-6">
                  <Badge variant="secondary" className="mb-3">
                    <Clock className="h-3 w-3 mr-1" />
                    {format.duration}
                  </Badge>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {format.name}
                  </h3>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {format.price}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              What Event Planners Say
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="relative">
                <CardContent className="pt-8">
                  <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/20" />
                  <p className="text-muted-foreground mb-6 relative z-10">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
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
            Make Your Event Unforgettable
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Let's discuss how I can create a memorable experience for your
            audience.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/booking?service=speaking">
              Inquire About Availability
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
