"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Radio,
  Star,
  Users,
  Music,
  GraduationCap,
  Award,
  Trophy,
  Zap,
} from "lucide-react";

const projects = [
  {
    title: "Pitch Perfect Trilogy",
    description: "Music Director for the highest-grossing music comedy series of all time",
    badge: "Film",
    icon: Film,
  },
  {
    title: "The Sing-Off",
    description: "5 seasons across 4 countries as music director",
    badge: "TV",
    icon: Radio,
  },
  {
    title: "In Transit - Broadway",
    description: "Broadway's first a cappella musical—arranger & producer",
    badge: "Broadway",
    icon: Star,
  },
  {
    title: "TotalVocal at Carnegie Hall",
    description: "Annual production directing 400+ singers",
    badge: "Live Event",
    icon: Users,
  },
  {
    title: "DCappella (Disney)",
    description: "Musical director for Disney's all-star a cappella group",
    badge: "Production",
    icon: Music,
  },
  {
    title: "Camp A Cappella",
    description: "World's largest a cappella camp, ages 13-130",
    badge: "Education",
    icon: GraduationCap,
  },
  {
    title: "Pitch Perfect 2 Soundtrack",
    description: "Billboard #1, Grammy nomination, AMA Award",
    badge: "Album",
    icon: Award,
  },
  {
    title: "The House Jacks",
    description: "'The original rock band without instruments' (SF Chronicle)",
    badge: "Founding",
    icon: Trophy,
  },
];

export function SignatureWorkSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Portfolio
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Signature Work
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From the highest-grossing music comedy series to Grammy-nominated albums and Broadway firsts
          </p>
        </motion.div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="group h-full hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-transparent hover:border-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                      <project.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs group-hover:border-accent group-hover:text-accent transition-colors"
                    >
                      {project.badge}
                    </Badge>
                  </div>
                  <CardTitle className="font-heading text-base md:text-lg leading-tight">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
