import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Music2,
  Award,
  BookOpen,
  Users,
  Tv,
  ArrowRight,
  Calendar,
  Heart,
  Sparkles,
  Star,
  Quote,
} from "lucide-react";

export const metadata = {
  title: "About Deke Sharon",
  description:
    "Learn about Deke Sharon, the father of contemporary a cappella, founder of the Contemporary A Cappella Society, and vocal producer of Pitch Perfect.",
};

const achievements = [
  {
    icon: Tv,
    title: "Pitch Perfect",
    description: "Vocal producer and arranger for the hit film franchise",
    color: "bg-coral-pop",
  },
  {
    icon: Award,
    title: "The Sing-Off",
    description: "Creator, producer, and on-air judge for NBC's a cappella competition",
    color: "bg-purple-energy",
  },
  {
    icon: Users,
    title: "CASA Founder",
    description: "Founded the Contemporary A Cappella Society in 1990",
    color: "bg-electric-blue",
  },
  {
    icon: BookOpen,
    title: "Published Author",
    description: "Author of 'A Cappella Arranging' and 'A Cappella Pop'",
    color: "bg-mint-fresh",
  },
];

const timeline = [
  { year: "1990", event: "Founded Contemporary A Cappella Society (CASA)", color: "bg-electric-blue" },
  { year: "1996", event: "First edition of A Cappella Arranging published", color: "bg-purple-energy" },
  { year: "2003", event: "Produced first season of The Sing-Off", color: "bg-coral-pop" },
  { year: "2012", event: "Vocal producer for Pitch Perfect", color: "bg-mint-fresh" },
  { year: "2015", event: "Pitch Perfect 2 breaks records", color: "bg-sunshine-yellow" },
  { year: "2020", event: "Virtual workshops reach global audience", color: "bg-electric-blue" },
  { year: "Present", event: "Continuing to transform a cappella worldwide", color: "bg-gradient-hero" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-28">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-white">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                About
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                The Father of Contemporary{" "}
                <span className="text-sunshine-yellow">A Cappella</span>
              </h1>
              <p className="text-lg text-white/90 mb-6">
                For over three decades, I've dedicated my life to elevating
                the art of a cappella music. From founding the Contemporary
                A Cappella Society to producing the sounds of Pitch Perfect,
                my mission has always been the same: to show the world what
                the human voice can do.
              </p>
              <p className="text-lg text-white/80 mb-8">
                I believe that everyone has a voice worth sharing, and that
                when voices come together in harmony, something magical
                happens. It's not just about the music—it's about connection,
                community, and the pure joy of creating something beautiful
                together.
              </p>
              <Button variant="sunshine" size="lg" asChild className="group">
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Photo Placeholder */}
            <div className="relative aspect-square rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 overflow-hidden">
              <div className="text-center p-8 text-white">
                <Music2 className="h-24 w-24 mx-auto text-white/30 mb-4" />
                <p className="text-white/70">
                  Photo placeholder
                  <br />
                  <span className="text-sm">Add Deke's portrait here</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="var(--background)"/>
          </svg>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Star className="h-3 w-3 mr-1" />
              Highlights
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Career <span className="text-primary">Achievements</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <Card key={achievement.title} className="border-0 shadow-lg overflow-hidden group">
                <div className={`h-2 ${achievement.color}`} />
                <CardContent className="pt-6 text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${achievement.color} text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <achievement.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              Journey
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              A Life in <span className="text-coral-pop">A Cappella</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {timeline.map((item, index) => (
              <div key={item.year} className="flex gap-4 mb-6 last:mb-0 group">
                <div className="flex flex-col items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform`}>
                    {item.year.slice(-2)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-1 h-full bg-gradient-to-b from-primary/30 to-transparent mt-2 rounded-full" />
                  )}
                </div>
                <div className="pb-6 pt-2">
                  <div className="text-sm font-bold text-primary mb-1">
                    {item.year}
                  </div>
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 md:py-28 bg-gradient-hero text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce-gentle" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-16 w-16 mx-auto mb-6 text-white/30" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              My Philosophy
            </h2>
            <blockquote className="text-xl md:text-2xl text-white/90 italic mb-8 leading-relaxed">
              "The human voice is the most powerful instrument on earth.
              When we sing together, we don't just make music—we create
              connection, build community, and touch something deeply human
              in ourselves and our listeners."
            </blockquote>
            <p className="text-white/80 mb-10 text-lg">
              Every group I work with, every arrangement I create, and every
              workshop I lead is guided by this belief. Whether you're a
              beginner or a seasoned professional, my goal is always the
              same: to help you find your voice and share it with the world.
            </p>
            <Button
              variant="sunshine"
              size="lg"
              asChild
              className="group"
            >
              <Link href="/booking">
                Work With Me
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
