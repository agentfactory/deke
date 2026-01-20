"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, GraduationCap, Mic2, ArrowRight, Sparkles } from "lucide-react";

const services = [
  {
    icon: Film,
    title: "For Producers & Networks",
    description: "TV/Film production, music direction, on-set coaching, vocal production, creative consultation",
    badges: ["Pitch Perfect trilogy", "The Sing-Off (5 seasons)", "Disney", "Broadway"],
    cta: "Discuss Your Production",
    href: "#contact",
    featured: false,
  },
  {
    icon: GraduationCap,
    title: "For Festivals & Universities",
    description: "Headline clinician, multi-day workshops, masterclasses, keynote experiences, custom events",
    badges: ["TotalVocal Carnegie Hall", "30+ workshop topics", "International tours"],
    pricing: "$5,000–$15,000/day",
    pricingNote: "Multi-day residencies available",
    cta: "View Workshop Topics",
    href: "#workshops",
    featured: true,
  },
  {
    icon: Mic2,
    title: "For Artists & Groups",
    description: "Custom arrangements, album production, ongoing coaching, competition prep, style development",
    badges: ["Pentatonix", "Straight No Chaser", "Billboard Top 40 albums", "ICCA champions"],
    cta: "Start Your Project",
    href: "#contact",
    featured: false,
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30" id="services">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Services
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Who I Work With
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three decades of experience serving the world&apos;s top entertainment productions,
            major institutions, and professional artists
          </p>
        </motion.div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card
                className={`group h-full hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 ${
                  service.featured
                    ? "border-2 border-accent relative overflow-hidden"
                    : "border-2 border-transparent hover:border-accent/30"
                }`}
              >
                {service.featured && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-xs font-bold uppercase rounded-bl-lg">
                    Premium
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div
                    className={`flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl mb-4 transition-all duration-300 ${
                      service.featured
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary text-white group-hover:bg-accent group-hover:text-accent-foreground"
                    }`}
                  >
                    <service.icon className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <CardTitle className="font-heading text-xl md:text-2xl mb-2">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.pricing && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                      <p className="text-xl md:text-2xl font-bold text-accent mb-1">
                        {service.pricing}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {service.pricingNote}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {service.badges.map((badge) => (
                      <Badge
                        key={badge}
                        variant="secondary"
                        className="text-xs"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className={`w-full transition-all ${
                      service.featured
                        ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                        : "group-hover:bg-accent group-hover:text-accent-foreground"
                    }`}
                    asChild
                  >
                    <Link href={service.href}>
                      {service.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
