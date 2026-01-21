"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  authors: string;
  year: string;
  purchaseUrl: string;
  coverImage: string;
}

const books: Book[] = [
  {
    id: "arranging-2",
    title: "A Cappella Arranging 2.0",
    authors: "Dylan Bell & Deke Sharon",
    year: "2024",
    purchaseUrl: "https://www.amazon.com/Expert-Strategies-Cappella-Arranging-Techniques/dp/1538172666/",
    coverImage: "https://www.dekesharon.com/wp-content/uploads/2024/12/book-cover-sized.jpg",
  },
  {
    id: "teaching-music",
    title: "Teaching Music through Performance",
    authors: "Frizzell, Hackel, Sharon & more",
    year: "2023",
    purchaseUrl: "https://www.giamusic.com/store/resource/teaching-music-through-performance-in-contemporary-a-cappella-book-g10098",
    coverImage: "https://www.dekesharon.com/wp-content/uploads/2020/10/teachingacappella.jpg",
  },
  {
    id: "arranging-1",
    title: "A Cappella Arranging",
    authors: "Dylan Bell & Deke Sharon",
    year: "2012",
    purchaseUrl: "https://www.amazon.com/gp/product/1458416577",
    coverImage: "https://www.dekesharon.com/wp-content/uploads/2018/01/acappellaarranging.jpg",
  },
  {
    id: "a-cappella",
    title: "A Cappella",
    authors: "Sharon, Spalding & McDonald",
    year: "2015",
    purchaseUrl: "https://www.amazon.com/Cappella-Deke-Sharon/dp/147061667X/",
    coverImage: "https://www.dekesharon.com/wp-content/uploads/2018/01/acappella.jpg",
  },
  {
    id: "heart-of-harmony",
    title: "The Heart of Vocal Harmony",
    authors: "Deke Sharon",
    year: "2016",
    purchaseUrl: "https://www.amazon.com/Heart-Vocal-Harmony-Emotional-Expression/dp/1495057836/",
    coverImage: "https://www.dekesharon.com/wp-content/uploads/2018/01/vocalharmony.jpg",
  },
  {
    id: "so-you-want-to-sing",
    title: "So You Want to Sing A Cappella",
    authors: "Deke Sharon",
    year: "2019",
    purchaseUrl: "https://www.amazon.com/You-Want-Sing-Cappella-Performers/dp/153810587X/",
    coverImage: "https://www.dekesharon.com/wp-content/uploads/2018/01/wanttosing.jpg",
  },
  {
    id: "warm-ups",
    title: "A Cappella Warm-Ups",
    authors: "Deke Sharon & J.D. Frizzell",
    year: "2017",
    purchaseUrl: "https://www.amazon.com/Cappella-Warm-Ups-Pop-Jazz-Choirs/dp/1495077411",
    coverImage: "https://www.dekesharon.com/wp-content/uploads/2018/01/acappellawarmups.jpg",
  },
];

export function BooksSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            <BookOpen className="h-4 w-4" />
            Publications
          </span>
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            Books by Deke Sharon
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            The definitive collection of a cappella knowledge
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative px-8 md:px-12">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border hover:bg-accent"
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border hover:bg-accent"
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3 md:gap-4">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="flex-none w-[120px] md:w-[140px] lg:w-[160px]"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center mt-6"
        >
          <a
            href="https://www.dekesharon.com/books/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-accent font-medium transition-colors"
          >
            View all publications
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function BookCard({ book }: { book: Book }) {
  const [imageError, setImageError] = useState(false);

  return (
    <a
      href={book.purchaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-accent/30">
        {/* Book Cover - Compact aspect ratio */}
        <div className="relative aspect-[2/3] bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
          {imageError ? (
            <div className="flex flex-col items-center justify-center h-full w-full p-3 text-center bg-muted/50">
              <BookOpen className="h-8 w-8 text-primary/40 mb-2" />
              <span className="font-heading text-[10px] font-semibold text-foreground/60 line-clamp-2">
                {book.title}
              </span>
            </div>
          ) : (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          )}

          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Minimal Book Info */}
        <div className="p-2">
          <h3 className="font-heading text-[11px] md:text-xs font-semibold leading-tight line-clamp-2 group-hover:text-accent transition-colors mb-0.5">
            {book.title}
          </h3>
          <p className="text-[10px] text-muted-foreground line-clamp-1">
            {book.year}
          </p>
        </div>
      </div>
    </a>
  );
}
