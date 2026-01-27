"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar, ChevronDown } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const trustLogos = [
  "NBC",
  "BBC",
  "Disney",
  "Universal",
  "Amazon",
  "Peacock",
  "Lifetime",
  "Broadway",
  "Carnegie Hall",
];

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/deke/facebook.jpg"
          alt="Deke Sharon"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/50" />
      </div>

      {/* Subtle Gradient Orbs - decorative */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-subtle" aria-hidden="true" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse-subtle" aria-hidden="true" style={{ animationDelay: "1s" }} />

      <div className="container relative z-10 px-4 md:px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
        >
          {/* Hero Content */}
          <div className="flex flex-col gap-6 md:gap-8 text-white">

            {/* Main Headline */}
            <motion.div variants={fadeIn} className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Pitch Perfect Harmony,
                <span className="block text-accent">One Note at a Time</span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl"
            >
              Music director, arranger, and vocal producer behind{" "}
              <span className="text-white font-medium">Pitch Perfect</span>,{" "}
              <span className="text-white font-medium">NBC&apos;s The Sing-Off</span>,{" "}
              and Broadway&apos;s{" "}
              <span className="text-white font-medium">In Transit</span>.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap gap-6 md:gap-8 py-4 border-y border-white/10"
            >
              {[
                { value: "35+", label: "Years Experience" },
                { value: "2,500+", label: "Arrangements" },
                { value: "#1", label: "Billboard Album" },
              ].map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-2xl md:text-3xl font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-6 md:px-8 py-5 md:py-6 h-auto shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="#contact">
                  Request Deke for Your Project
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white bg-white/5 hover:bg-white/10 text-base px-6 md:px-8 py-5 md:py-6 h-auto backdrop-blur-sm"
                asChild
              >
                <Link href="#contact">
                  <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                  Book Discovery Call
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={fadeIn} className="pt-4 md:pt-6">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-3">
                Trusted By
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-6">
                {trustLogos.map((logo, i) => (
                  <span
                    key={logo}
                    className="text-white/40 text-sm font-medium hover:text-white/60 transition-colors cursor-default"
                  >
                    {logo}
                    {i < trustLogos.length - 1 && (
                      <Separator
                        orientation="vertical"
                        className="hidden md:inline-block ml-4 md:ml-6 h-4 bg-white/20"
                      />
                    )}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Hero Visual - Portrait Photo */}
          <motion.div
            variants={fadeIn}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden hidden lg:block shadow-2xl"
          >
            <Image
              src="/images/deke/deke2-photographer-Nikki-Davis-Jones.jpg"
              alt="Deke Sharon - Professional Portrait"
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

            {/* Floating Stats Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm text-white/60">Grammy Nominated</p>
                  <p className="font-semibold">Pitch Perfect 2 Soundtrack</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">#1</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-white/40" aria-hidden="true">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
