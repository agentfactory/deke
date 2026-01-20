"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  Users,
  Mic2,
  BookOpen,
  Star,
  Play,
  ArrowRight,
  Quote,
  GraduationCap,
  Disc3,
  Award,
  Calendar,
} from "lucide-react";

const services = [
  {
    title: "Arrangements",
    description:
      "Custom arrangements, re-voicing, and expert critiques to elevate your group's sound.",
    icon: Music,
    href: "/arrangements",
    badge: "Most Popular",
  },
  {
    title: "Coaching & Workshops",
    description:
      "Intensive workshops and coaching sessions that transform how your group performs.",
    icon: Users,
    href: "/coaching",
    badge: null,
  },
  {
    title: "University Events",
    description:
      "Attract top talent with a cappella recruitment events that high school students love.",
    icon: GraduationCap,
    href: "/workshops",
    badge: "For Admissions",
  },
  {
    title: "Album Production",
    description:
      "From concept to completion, create a recording that captures your group's essence.",
    icon: Disc3,
    href: "/masterclass",
    badge: null,
  },
];

const credentials = [
  { number: "30+", label: "Years of Experience", icon: Calendar },
  { number: "10,000+", label: "Arrangements Created", icon: Music },
  { number: "50+", label: "Countries Reached", icon: Award },
  { number: "100+", label: "Groups Coached Annually", icon: Users },
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

// Animation variants
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

export default function HomePage() {
  return (
    <>
      {/* Hero Section - Professional Dark */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[90vh] flex items-center">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white"
            >
              <Badge variant="outline" className="mb-6 border-white/20 text-white/80 bg-white/5">
                The Father of Contemporary A Cappella
              </Badge>

              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]">
                Elevate Your Vocal Group to{" "}
                <span className="text-gold">World-Class</span>
              </h1>

              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                For over three decades, I've helped thousands of vocal groups
                discover their unique sound and achieve their full potential.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="xl" variant="accent" asChild>
                    <Link href="/booking">
                      Schedule a Consultation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/masterclass">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Free Lesson
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Credentials as text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-16 pt-8 border-t border-white/10"
            >
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-white/50">
                <span>Vocal Producer for <span className="text-white/80">Pitch Perfect</span></span>
                <span className="hidden sm:inline">•</span>
                <span>Creator of <span className="text-white/80">The Sing-Off</span></span>
                <span className="hidden sm:inline">•</span>
                <span>Founder of <span className="text-white/80">CASA</span></span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-section-alt">
        <div className="container px-4 md:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
            {credentials.map((cred, index) => (
              <motion.div
                key={cred.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-2">
                  {cred.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cred.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              How I Can Help Your Group
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you're a high school ensemble just starting out or a
              professional group seeking that extra edge, there's a path forward.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {services.map((service, index) => (
              <motion.div key={service.title} variants={fadeInUp}>
                <Link href={service.href} className="group block h-full">
                  <Card className="h-full border-t-2 border-t-transparent hover:border-t-accent transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                          <service.icon className="h-5 w-5" />
                        </div>
                        {service.badge && (
                          <Badge variant="muted" className="text-xs">
                            {service.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-accent transition-colors">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {service.description}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                        Learn more
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              What People Are Saying
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hear from artists and directors who have worked with me over the years.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-background">
                  <CardContent className="pt-8">
                    <Quote className="h-8 w-8 text-accent/20 mb-4" />
                    <p className="text-foreground leading-relaxed mb-6">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="font-heading font-semibold text-sm text-foreground">
                          {testimonial.author[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{testimonial.author}</div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-hero text-white">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
              Ready to Transform Your Sound?
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
              Let's discuss your goals and create a personalized plan to take
              your vocal group to the next level. First consultations are always free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="xl" variant="accent" asChild>
                  <Link href="/booking">
                    Schedule Free Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/contact">Send a Message</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
