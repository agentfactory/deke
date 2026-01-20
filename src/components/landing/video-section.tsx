"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle, Video } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function VideoSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Video className="h-4 w-4" />
            Watch
          </span>
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
          <button
            onClick={() => setIsVideoOpen(true)}
            className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border group cursor-pointer hover:border-accent/50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {/* Video Thumbnail - Using Carnegie Hall image */}
            <Image
              src="/images/deke/big-img-41.jpg"
              alt="Deke Sharon at Carnegie Hall"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Pulse rings */}
                <div className="absolute inset-0 -m-4 rounded-full bg-white/20 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-0 -m-2 rounded-full bg-white/10" />

                {/* Main button */}
                <div className="relative bg-white rounded-full p-5 md:p-6 shadow-elevated group-hover:shadow-card-hover group-hover:scale-110 transition-all duration-300">
                  <PlayCircle className="h-12 w-12 md:h-16 md:w-16 text-accent" />
                </div>
              </div>
            </div>

            {/* Overlay Text */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8">
              <p className="text-white font-semibold text-lg md:text-xl mb-1">
                Highlight Reel
              </p>
              <p className="text-white/70 text-sm">
                From Pitch Perfect to Carnegie Hall — 2 minute overview
              </p>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-0">
          <div className="relative aspect-video w-full">
            {isVideoOpen && (
              <iframe
                src="https://www.youtube.com/embed/fRc3KT6d1UI?autoplay=1"
                title="Deke Sharon Highlight Reel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
