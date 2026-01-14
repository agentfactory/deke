import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  Award,
  BookOpen,
  Users,
  Tv,
  ArrowRight,
  Calendar,
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
  },
  {
    icon: Award,
    title: "The Sing-Off",
    description: "Creator, producer, and on-air judge for NBC's a cappella competition",
  },
  {
    icon: Users,
    title: "CASA Founder",
    description: "Founded the Contemporary A Cappella Society in 1990",
  },
  {
    icon: BookOpen,
    title: "Published Author",
    description: "Author of 'A Cappella Arranging' and 'A Cappella Pop'",
  },
];

const timeline = [
  { year: "1990", event: "Founded Contemporary A Cappella Society (CASA)" },
  { year: "1996", event: "First edition of A Cappella Arranging published" },
  { year: "2003", event: "Produced first season of The Sing-Off" },
  { year: "2012", event: "Vocal producer for Pitch Perfect" },
  { year: "2015", event: "Pitch Perfect 2 breaks records" },
  { year: "2020", event: "Virtual workshops reach global audience" },
  { year: "Present", event: "Continuing to transform a cappella worldwide" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                About
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                The Father of Contemporary A Cappella
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                For over three decades, I've dedicated my life to elevating
                the art of a cappella music. From founding the Contemporary
                A Cappella Society to producing the sounds of Pitch Perfect,
                my mission has always been the same: to show the world what
                the human voice can do.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                I believe that everyone has a voice worth sharing, and that
                when voices come together in harmony, something magical
                happens. It's not just about the music—it's about connection,
                community, and the pure joy of creating something beautiful
                together.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Photo Placeholder */}
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center p-8">
                <Music className="h-24 w-24 mx-auto text-primary/30 mb-4" />
                <p className="text-muted-foreground">
                  Photo placeholder
                  <br />
                  <span className="text-sm">Add Deke's portrait here</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Highlights
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Career Achievements
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <Card key={achievement.title}>
                <CardContent className="pt-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <achievement.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
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
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              Journey
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              A Life in A Cappella
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {timeline.map((item, index) => (
              <div key={item.year} className="flex gap-4 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {item.year.slice(-2)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="text-sm font-semibold text-primary">
                    {item.year}
                  </div>
                  <div className="text-muted-foreground">{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              My Philosophy
            </h2>
            <blockquote className="text-xl md:text-2xl text-primary-foreground/90 italic mb-8">
              "The human voice is the most powerful instrument on earth.
              When we sing together, we don't just make music—we create
              connection, build community, and touch something deeply human
              in ourselves and our listeners."
            </blockquote>
            <p className="text-primary-foreground/80 mb-8">
              Every group I work with, every arrangement I create, and every
              workshop I lead is guided by this belief. Whether you're a
              beginner or a seasoned professional, my goal is always the
              same: to help you find your voice and share it with the world.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/booking">
                Work With Me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
