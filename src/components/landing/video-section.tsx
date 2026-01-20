"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export function VideoSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            See Deke in Action
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch highlights from Pitch Perfect, The Sing-Off, and live masterclasses
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden border border-border group cursor-pointer hover:border-accent/50 transition-all duration-300">
            {/* Video Thumbnail Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Pulse rings */}
                <div className="absolute inset-0 -m-4 rounded-full bg-accent/20 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-0 -m-2 rounded-full bg-accent/10" />

                {/* Main button */}
                <div className="relative bg-white rounded-full p-5 md:p-6 shadow-elevated group-hover:shadow-card-hover group-hover:scale-105 transition-all duration-300">
                  <PlayCircle className="h-12 w-12 md:h-16 md:w-16 text-accent" />
                </div>
              </div>
            </div>

            {/* Overlay Text */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-8">
              <p className="text-white font-medium text-lg md:text-xl mb-1">
                Highlight Reel
              </p>
              <p className="text-white/70 text-sm">
                From Pitch Perfect to Carnegie Hall — 2 minute overview
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
