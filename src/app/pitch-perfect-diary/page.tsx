"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Film, ArrowLeft } from "lucide-react";

const diaryEntries = [
  {
    date: "Day 1",
    title: "Arrival in Baton Rouge",
    text: "Landed in Louisiana to begin pre-production on Pitch Perfect 2. The energy is already incredible — bigger budget, bigger expectations, and an even more ambitious vision for the music. Met with the music team to start mapping out the vocal arrangements.",
  },
  {
    date: "Day 3",
    title: "First Rehearsals",
    text: "Started working with the cast on their vocal parts. Anna Kendrick, Rebel Wilson, and the entire Bellas cast are back and more committed than ever. The new songs are going to blow people away.",
  },
  {
    date: "Day 7",
    title: "The Riff-Off Returns",
    text: "Spent the day choreographing and arranging the new Riff-Off sequence. This one is even more epic than the original — more groups, more styles, more energy. The challenge is making it feel spontaneous when every note is meticulously planned.",
  },
  {
    date: "Day 12",
    title: "World Championship Prep",
    text: "The World Championship finale sequence is taking shape. Working with the arrangers and music team to create something that gives you chills. The harmonies in this one are next level.",
  },
  {
    date: "Day 18",
    title: "Recording Sessions",
    text: "Long days in the recording studio getting all the vocal tracks laid down. The cast has been incredible — the blend and energy they bring to every take is inspiring. Some of these arrangements are the most complex I've ever created for film.",
  },
  {
    date: "Day 25",
    title: "On Set",
    text: "Watching the performances come to life on camera is always the most rewarding part. The cast lip-syncs to our pre-recorded tracks, but the emotion is 100% real. Rebel Wilson continues to make everyone laugh between takes.",
  },
  {
    date: "Day 30",
    title: "Das Sound Machine",
    text: "The rival German group brings an intensity that pushes the Bellas to new heights. Working with the actors playing DSM to make their performances feel authentically powerful. The contrast between the two groups' styles is electric.",
  },
  {
    date: "Day 40",
    title: "Final Mix",
    text: "Wrapping up the final mixes and making sure every harmony, every beat, every breath is perfect. This soundtrack is going to be something special. Can't wait for the world to hear it.",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function PitchPerfectDiaryPage() {
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
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-white/60 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/media">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Media
              </Link>
            </Button>
            <Badge
              variant="outline"
              className="mb-4 border-white/20 text-white/80 bg-white/5"
            >
              <Film className="h-3 w-3 mr-1" />
              Behind the Scenes
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              The Pitch Perfect 2{" "}
              <span className="text-gold">Diary</span>
            </h1>
            <p className="text-xl text-white/70 mb-4 leading-relaxed">
              A behind-the-scenes look at the making of Pitch Perfect 2, told
              through photos and stories from the set. Follow along as the music
              comes to life.
            </p>
            <p className="text-sm text-white/50">
              By Deke Sharon, Vocal Producer — Pitch Perfect Trilogy
            </p>
          </motion.div>
        </div>
      </section>

      {/* Diary Entries */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            {diaryEntries.map((entry, index) => (
              <motion.div key={entry.date} variants={fadeInUp}>
                <Card className="overflow-hidden transition-shadow hover:shadow-elevated">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        {index < diaryEntries.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2 hidden md:block" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {entry.date}
                          </span>
                        </div>
                        <h3 className="font-heading font-semibold text-xl mb-3">
                          {entry.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {entry.text}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">
              More diary entries will be added as the archive is digitized.
            </p>
            <Button variant="outline" asChild>
              <Link href="/media">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Media
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
