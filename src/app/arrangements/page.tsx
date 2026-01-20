"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  CheckCircle2,
  ArrowRight,
  FileMusic,
  Star,
  Headphones,
  Zap,
  Heart,
} from "lucide-react";

const packages = [
  {
    name: "Essential",
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

const sampleCategories = [
  {
    title: "Pop/Contemporary",
    subtitle: "Competition winning",
    description: "Modern arrangements with complex harmonies and driving vocal percussion.",
    icon: Zap,
  },
  {
    title: "Jazz Standards",
    subtitle: "Classic reimagined",
    description: "Rich jazz voicings and sophisticated harmonic progressions.",
    icon: Music,
  },
  {
    title: "Holiday/Seasonal",
    subtitle: "Audience favorites",
    description: "Fresh takes on beloved classics perfect for holiday performances.",
    icon: Heart,
  },
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

export default function ArrangementsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-white"
          >
            <Badge variant="outline" className="mb-4 border-white/20 text-white/80 bg-white/5">
              <Music className="h-3 w-3 mr-1" />
              Custom Arrangements
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              Arrangements That Make{" "}
              <span className="text-gold">Voices Soar</span>
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Every vocal group has a distinct identity. I create bespoke
              arrangements that highlight your strengths, challenge your
              singers, and leave audiences spellbound.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="accent" size="lg" asChild>
                <Link href="/booking?service=arrangement">
                  Request an Arrangement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="#samples">
                  <Headphones className="mr-2 h-4 w-4" />
                  Listen to Samples
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-section-alt">
        <div className="container px-4 md:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "10,000+", label: "Arrangements Created" },
              { value: "50+", label: "Countries Served" },
              { value: "98%", label: "Client Satisfaction" },
              { value: "30+", label: "Years Experience" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                <div className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From simple covers to complex competition pieces, I offer flexible
              options to match your needs and budget.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {packages.map((pkg) => (
              <motion.div key={pkg.name} variants={fadeInUp}>
                <Card
                  className={`relative h-full ${
                    pkg.popular ? "border-accent shadow-elevated" : ""
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="font-heading text-xl">
                      {pkg.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {pkg.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              The Arrangement Process
            </h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-4"
          >
            {process.map((step) => (
              <motion.div key={step.step} variants={fadeInUp} className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Samples */}
      <section id="samples" className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Hear the Difference
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Listen to examples of arrangements created for groups of all levels
              and styles.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto"
          >
            {sampleCategories.map((category) => (
              <motion.div key={category.title} variants={fadeInUp}>
                <Card className="h-full group">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold">{category.title}</h3>
                        <p className="text-xs text-muted-foreground">{category.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

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
      <section className="py-20 md:py-28 bg-gradient-hero text-white">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
              Ready to Create Something <span className="text-gold">Special?</span>
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
              Let's discuss your vision and create an arrangement that will
              become your group's signature piece.
            </p>
            <Button variant="accent" size="xl" asChild>
              <Link href="/booking?service=arrangement">
                Start Your Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
