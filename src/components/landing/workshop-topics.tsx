"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, BookOpen } from "lucide-react";

const popularTopics = [
  "Masterclasses (variable length)",
  "Pitch Perfect Singalong (90-120 min)",
  "History of A Cappella, 1900-Present",
  "Contemporary A Cappella Arranging in 10 Steps",
  "Advanced A Cappella Arranging",
  "Arranging Mashups",
  "Singing Instruments & Vocal Percussion",
  "Stage Presence & Performance Presentation",
  "Close Harmony Blend / Improving Tuning",
  "Expert Level Music Director's Toolkit",
  "Introduction to Choral Pop Techniques",
  "Inspiring Young Singers through Contemporary A Cappella",
];

const additionalTopics = [
  "Producing an Album",
  "A Cappella Business & Management",
  "Solo Delivery",
  "Group Dynamics",
  "Careers in A Cappella",
  "The Future of A Cappella",
  "Building Your Repertoire",
  "Competition Strategies",
  "Recording Techniques for Vocal Groups",
  "Social Media for Musicians",
  "Booking Gigs & Tours",
  "Vocal Health & Warm-ups",
  "Leading Rehearsals Effectively",
  "Sight-Reading for Singers",
  "Microphone Techniques",
  "Creating Viral Content",
  "Monetizing Your Music",
  "Copyright & Licensing Basics",
];

export function WorkshopTopicsSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4 md:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Workshop Catalog
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Workshop & Seminar Topics
          </h2>
          <p className="text-lg text-muted-foreground">
            30+ specialized topics, custom-tailored to your group&apos;s needs and demographics
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-elevated">
            <CardContent className="pt-6 md:pt-8">
              <div className="space-y-4 mb-6">
                <h3 className="font-heading text-xl md:text-2xl font-bold">
                  Popular Workshops
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {popularTopics.map((topic, i) => (
                    <motion.div
                      key={topic}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{topic}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-300 group"
              >
                <span className="font-semibold">
                  {isExpanded ? "Show Less" : "View All 30+ Topics"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid sm:grid-cols-2 gap-3 mt-6 pt-6 border-t">
                      {additionalTopics.map((topic, i) => (
                        <motion.div
                          key={topic}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{topic}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                <p className="text-sm text-center">
                  <span className="font-semibold">All workshops are custom-tailored</span>{" "}
                  to your group&apos;s specific needs, interests, skill level, and demographics.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
