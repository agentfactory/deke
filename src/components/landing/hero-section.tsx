"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar, ChevronDown, Play } from "lucide-react";

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
  "Broadway",
  "Carnegie Hall",
  "Pentatonix",
];

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Subtle Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-subtle" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse-subtle" style={{ animationDelay: "1s" }} />

      <div className="container relative z-10 px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
        >
          {/* Hero Content */}
          <div className="flex flex-col gap-6 md:gap-8 text-white">
            {/* Eyebrow */}
            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Available for 2025 Bookings
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={fadeIn} className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                The Father of
                <span className="block text-accent">Contemporary A Cappella</span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl"
            >
              Vocal Director, Arranger & Producer behind{" "}
              <span className="text-white font-medium">Pitch Perfect</span>,{" "}
              <span className="text-white font-medium">The Sing-Off</span>, and
              Broadway&apos;s first a cappella musical.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap gap-6 md:gap-8 py-4 border-y border-white/10"
            >
              {[
                { value: "30+", label: "Years Experience" },
                { value: "2,000+", label: "Arrangements" },
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
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white bg-white/5 hover:bg-white/10 text-base px-6 md:px-8 py-5 md:py-6 h-auto backdrop-blur-sm"
                asChild
              >
                <Link href="#contact">
                  <Calendar className="mr-2 h-5 w-5" />
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

          {/* Hero Visual */}
          <motion.div
            variants={fadeIn}
            className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden hidden lg:block"
          >
            {/* Placeholder for actual image */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="h-10 w-10 text-white/60" />
                </div>
                <p className="text-white/60 text-lg font-medium mb-2">
                  Watch the Reel
                </p>
                <p className="text-white/40 text-sm">
                  2 min highlight video
                </p>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hidden xl:block">
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
        <div className="flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
