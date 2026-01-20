"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

const galleryImages = [
  {
    src: "/images/deke/big-img-31.jpg",
    alt: "Deke Sharon with Anna Kendrick on Pitch Perfect set",
    caption: "With Anna Kendrick",
    category: "Pitch Perfect",
  },
  {
    src: "/images/deke/big-img-41.jpg",
    alt: "Deke Sharon conducting at Carnegie Hall",
    caption: "Carnegie Hall",
    category: "Live Performance",
  },
  {
    src: "/images/deke/big-img-21.jpg",
    alt: "Deke Sharon with Rebel Wilson",
    caption: "With Rebel Wilson",
    category: "Pitch Perfect",
  },
  {
    src: "/images/deke/big-img-65.jpg",
    alt: "Deke Sharon with Ben Platt on Broadway",
    caption: "With Ben Platt",
    category: "Broadway",
  },
  {
    src: "/images/deke/big-img-24.jpg",
    alt: "Deke Sharon with Elizabeth Banks",
    caption: "With Elizabeth Banks",
    category: "Pitch Perfect",
  },
  {
    src: "/images/deke/riffoff2.jpg",
    alt: "The iconic Riff-Off scene from Pitch Perfect",
    caption: "The Riff-Off",
    category: "Pitch Perfect",
  },
  {
    src: "/images/deke/big-img-20.jpg",
    alt: "TotalVocal at Carnegie Hall",
    caption: "TotalVocal",
    category: "Carnegie Hall",
  },
  {
    src: "/images/deke/big-img-61.jpg",
    alt: "In Transit Broadway Cast",
    caption: "In Transit Cast",
    category: "Broadway",
  },
  {
    src: "/images/deke/big-img-34.jpg",
    alt: "Deke Sharon on the Today Show",
    caption: "Today Show",
    category: "Media",
  },
  {
    src: "/images/deke/big-img-15.jpg",
    alt: "Performance with Ray Charles",
    caption: "With Ray Charles",
    category: "Performance",
  },
  {
    src: "/images/deke/big-img-35.jpg",
    alt: "Entertainment Weekly Feature",
    caption: "Entertainment Weekly",
    category: "Press",
  },
  {
    src: "/images/deke/2024_ACAPPELLA_SPECTACULAR_AB_0328.jpg",
    alt: "2024 A Cappella Spectacular",
    caption: "A Cappella Spectacular 2024",
    category: "Live Event",
  },
];

export function PhotoGallery() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30 overflow-hidden">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Camera className="h-4 w-4" />
            Gallery
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Behind the Scenes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From Hollywood sets to Carnegie Hall stages — three decades of creating vocal magic
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {galleryImages.map((image, i) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="break-inside-avoid mb-4"
            >
              <div className="relative group rounded-xl overflow-hidden bg-muted">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-xs text-accent font-medium uppercase tracking-wider mb-1">
                    {image.category}
                  </span>
                  <p className="text-white font-semibold">{image.caption}</p>
                </div>
                {/* Always visible caption on mobile */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:hidden">
                  <p className="text-white text-sm font-medium">{image.caption}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
