"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  BookOpen,
  Users,
  Tv,
  ArrowRight,
  Quote,
} from "lucide-react";

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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <Badge variant="outline" className="mb-4 border-white/20 text-white/80 bg-white/5">
                About
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
                The Father of Contemporary{" "}
                <span className="text-gold">A Cappella</span>
              </h1>
              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                For over three decades, I've dedicated my life to elevating
                the art of a cappella music. From founding the Contemporary
                A Cappella Society to producing the sounds of Pitch Perfect,
                my mission has always been the same: to show the world what
                the human voice can do.
              </p>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                I believe that everyone has a voice worth sharing, and that
                when voices come together in harmony, something magical
                happens. It's not just about the music—it's about connection,
                community, and the pure joy of creating something beautiful
                together.
              </p>
              <Button variant="accent" size="lg" asChild>
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Deke Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/deke/deke2-photographer-Nikki-Davis-Jones.jpg"
                alt="Deke Sharon - The Father of Contemporary A Cappella"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Career Achievements
            </h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {achievements.map((achievement) => (
              <motion.div key={achievement.title} variants={fadeInUp}>
                <Card className="h-full group">
                  <CardContent className="pt-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-foreground mx-auto mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <achievement.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              A Life in A Cappella
            </h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-2xl mx-auto"
          >
            {timeline.map((item, index) => (
              <motion.div key={item.year} variants={fadeInUp} className="flex gap-4 mb-6 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {item.year === "Present" ? "Now" : item.year.slice(-2)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-6 pt-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {item.year}
                  </div>
                  <div className="text-foreground">
                    {item.event}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 md:py-28 bg-gradient-hero text-white">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Quote className="h-12 w-12 mx-auto mb-6 text-white/20" />
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-6">
              My Philosophy
            </h2>
            <blockquote className="text-xl md:text-2xl text-white/80 italic mb-8 leading-relaxed">
              "The human voice is the most powerful instrument on earth.
              When we sing together, we don't just make music—we create
              connection, build community, and touch something deeply human
              in ourselves and our listeners."
            </blockquote>
            <p className="text-white/60 mb-10 leading-relaxed">
              Every group I work with, every arrangement I create, and every
              workshop I lead is guided by this belief. Whether you're a
              beginner or a seasoned professional, my goal is always the
              same: to help you find your voice and share it with the world.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link href="/booking">
                Work With Me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
