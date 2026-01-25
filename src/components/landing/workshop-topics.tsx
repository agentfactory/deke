"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, BookOpen, Info, X } from "lucide-react";

interface WorkshopTopic {
  title: string;
  description?: string;
}

const popularTopics: WorkshopTopic[] = [
  {
    title: "Masterclasses (variable length)",
    description: "Comprehensive sessions tailored to your group's level, covering technique, performance, and artistry in a hands-on environment."
  },
  {
    title: "Pitch Perfect Singalong (90-120 min)",
    description: "An interactive audience experience featuring songs from the Pitch Perfect trilogy with behind-the-scenes stories and live participation."
  },
  {
    title: "History of A Cappella, 1900-Present",
    description: "A journey through the evolution of a cappella music from barbershop to doo-wop to contemporary styles, with audio and video examples."
  },
  {
    title: "Contemporary A Cappella Arranging in 10 Steps",
    description: "A systematic approach to creating modern a cappella arrangements, covering song selection, voice parts, syllables, and dynamics."
  },
  {
    title: "Advanced A Cappella Arranging",
    description: "Deep dive into sophisticated arranging techniques including extended harmonies, counterpoint, and creating professional-level charts."
  },
  {
    title: "Arranging Mashups",
    description: "Learn the art of combining multiple songs into cohesive arrangements, including key matching, transitions, and creative combinations."
  },
  {
    title: "Singing Instruments & Vocal Percussion",
    description: "Techniques for creating authentic instrument sounds with your voice, plus modern vocal percussion and beatboxing fundamentals."
  },
  {
    title: "Stage Presence & Performance Presentation",
    description: "Transform your group's live performance with movement, staging, audience engagement, and professional presentation skills."
  },
  {
    title: "Close Harmony Blend / Improving Tuning",
    description: "Ear training and vocal techniques to achieve tight blend and precise intonation in ensemble singing."
  },
  {
    title: "Expert Level Music Director's Toolkit",
    description: "Advanced leadership skills for music directors including rehearsal techniques, group dynamics, and artistic vision."
  },
  {
    title: "Introduction to Choral Pop Techniques",
    description: "Bridge the gap between traditional choral singing and contemporary pop/rock styles with modern vocal techniques."
  },
  {
    title: "Inspiring Young Singers through Contemporary A Cappella",
    description: "Strategies for educators to engage and motivate young singers using contemporary a cappella repertoire and methods."
  },
];

const additionalTopics: WorkshopTopic[] = [
  {
    title: "Producing an Album",
    description: "Complete guide to recording, mixing, and releasing an a cappella album from pre-production to distribution."
  },
  {
    title: "A Cappella Business & Management",
    description: "Run your group like a professional organization: booking, contracts, finances, and marketing strategies."
  },
  {
    title: "Solo Delivery",
    description: "Develop confident, expressive solo singing within an ensemble context with techniques for emotional connection."
  },
  {
    title: "Group Dynamics",
    description: "Build a healthy, productive group culture with conflict resolution, communication, and leadership strategies."
  },
  {
    title: "Careers in A Cappella",
    description: "Explore professional paths in the a cappella world from performing to arranging to teaching and producing."
  },
  {
    title: "The Future of A Cappella",
    description: "Trends, technology, and opportunities shaping the next generation of a cappella music and performance."
  },
  {
    title: "Building Your Repertoire",
    description: "Strategic song selection for your group's voice, audience, and goals with arranging considerations."
  },
  {
    title: "Competition Strategies",
    description: "Maximize your competitive success with set design, judging criteria insights, and performance optimization."
  },
  {
    title: "Recording Techniques for Vocal Groups",
    description: "Studio and home recording best practices for capturing great a cappella sound on any budget."
  },
  {
    title: "Social Media for Musicians",
    description: "Build your online presence with platform-specific strategies, content creation, and audience engagement."
  },
  {
    title: "Booking Gigs & Tours",
    description: "From local shows to national tours: finding opportunities, negotiating, and logistics management."
  },
  {
    title: "Vocal Health & Warm-ups",
    description: "Protect your voice and prepare for performance with proven warm-up routines and healthy singing habits."
  },
  {
    title: "Leading Rehearsals Effectively",
    description: "Maximize rehearsal time with planning, pacing, and techniques for productive, enjoyable sessions."
  },
  {
    title: "Sight-Reading for Singers",
    description: "Develop essential music literacy skills for faster learning and more confident musicianship."
  },
  {
    title: "Microphone Techniques",
    description: "Master live and studio microphone use for optimal sound quality and professional presentation."
  },
  {
    title: "Creating Viral Content",
    description: "Strategies for creating shareable videos and content that can expand your group's reach online."
  },
  {
    title: "Monetizing Your Music",
    description: "Revenue streams for a cappella groups from streaming to merchandise to live performance."
  },
  {
    title: "Copyright & Licensing Basics",
    description: "Navigate music rights, permissions, and legal considerations for covers, recordings, and performances."
  },
];

function TopicItem({ topic, index }: { topic: WorkshopTopic; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.02 }}
    >
      <button
        onClick={() => topic.description && setIsOpen(!isOpen)}
        className={`w-full text-left flex items-start gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors ${
          topic.description ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
        <span className="text-sm flex-1">{topic.title}</span>
        {topic.description && (
          <Info className={`h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 transition-colors ${isOpen ? "text-accent" : ""}`} />
        )}
      </button>
      <AnimatePresence>
        {isOpen && topic.description && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 ml-7">
              <p className="text-sm text-muted-foreground bg-accent/5 border border-accent/10 rounded-lg p-3">
                {topic.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function WorkshopTopicsSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-20 md:py-28 bg-secondary/30" id="workshops">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
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
          <p className="text-sm text-muted-foreground mt-2">
            Click any topic with <Info className="h-3 w-3 inline" /> to learn more
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
                    <TopicItem key={topic.title} topic={topic} index={i} />
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
                        <TopicItem key={topic.title} topic={topic} index={i} />
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
