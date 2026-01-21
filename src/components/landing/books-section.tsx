"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  authors: string;
  year: string;
  format: string;
  description: string;
  purchaseUrl: string;
  coverImage: string;
  badge?: string;
  featured?: boolean;
}

const books: Book[] = [
  {
    id: "arranging-2",
    title: "A Cappella Arranging 2.0",
    authors: "Dylan Bell & Deke Sharon",
    year: "2024",
    format: "Hardback/Paperback",
    description:
      "An advanced sequel providing even more tools and insights to help musicians master the craft of a cappella arranging. Covers creative principles, theoretical techniques, vocal ranges, counterpoint, polyphony, and harmonic concepts.",
    purchaseUrl:
      "https://www.amazon.com/Expert-Strategies-Cappella-Arranging-Techniques/dp/1538172666/",
    coverImage: "/images/books/arranging-2.jpg",
    badge: "New Release",
    featured: true,
  },
  {
    id: "teaching-music",
    title: "Teaching Music through Performance in Contemporary A Cappella",
    authors: "J.D. Frizzell, Erin Hackel, Deke Sharon, Marc Silverberg, Ben Spalding",
    year: "2023",
    format: "Hardback",
    description:
      "A comprehensive pedagogical resource featuring 82 works across genres: Barbershop, Contemporary A cappella, Doo-wop, Folk/Classical, Vocal Jazz. Includes difficulty scales, composition history, and educational extensions.",
    purchaseUrl:
      "https://www.giamusic.com/store/resource/teaching-music-through-performance-in-contemporary-a-cappella-book-g10098",
    coverImage: "/images/books/teaching-music.jpg",
    badge: "Educational",
  },
  {
    id: "arranging-1",
    title: "A Cappella Arranging",
    authors: "Dylan Bell & Deke Sharon",
    year: "2012",
    format: "Paperback",
    description:
      "The foundational text covering arrangement techniques for vocal groups. Now available in Chinese and Korean translations. The essential guide for aspiring arrangers.",
    purchaseUrl: "https://www.amazon.com/gp/product/1458416577",
    coverImage: "/images/books/arranging-1.jpg",
    badge: "Bestseller",
  },
  {
    id: "a-cappella",
    title: "A Cappella",
    authors: "Deke Sharon, Ben Spalding, Brody McDonald",
    year: "2015",
    format: "Paperback (404 pages)",
    description:
      "The comprehensive guide addressing group formation, arranging, rehearsal preparation, technology, and professional development. Features foreword by Ben Folds and contributions from Peter Hollens.",
    purchaseUrl: "https://www.amazon.com/Cappella-Deke-Sharon/dp/147061667X/",
    coverImage: "/images/books/a-cappella.jpg",
    badge: "Essential",
    featured: true,
  },
  {
    id: "heart-of-harmony",
    title: "The Heart of Vocal Harmony",
    authors: "Deke Sharon",
    year: "2016",
    format: "Paperback",
    description:
      "Focuses on honest unified expression and the process of delivering an emotionally compelling performance. Features interviews with Eric Whitacre, Pentatonix, and Manhattan Transfer.",
    purchaseUrl:
      "https://www.amazon.com/Heart-Vocal-Harmony-Emotional-Expression/dp/1495057836/",
    coverImage: "/images/books/heart-of-harmony.jpg",
    badge: "Music Pro Guide",
  },
  {
    id: "so-you-want-to-sing",
    title: "So You Want to Sing A Cappella",
    authors: "Deke Sharon",
    year: "2019",
    format: "Paperback",
    description:
      "Part of the NATS series. Combines historical context with guidance on vocal techniques, rehearsal practices, and audio support. Includes chapters on voice science and vocal health.",
    purchaseUrl:
      "https://www.amazon.com/You-Want-Sing-Cappella-Performers/dp/153810587X/",
    coverImage: "/images/books/so-you-want-to-sing.jpg",
    badge: "NATS Series",
  },
  {
    id: "warm-ups",
    title: "A Cappella Warm-Ups",
    authors: "Deke Sharon & J.D. Frizzell",
    year: "2017",
    format: "Paperback",
    description:
      "Features over 39 creative exercises covering rhythm, syllables, tone, intervals, dynamics, intonation, blend, balance, pitch, improvisation, and vocal percussion. For pop and jazz choirs.",
    purchaseUrl:
      "https://www.amazon.com/Cappella-Warm-Ups-Pop-Jazz-Choirs/dp/1495077411",
    coverImage: "/images/books/warm-ups.jpg",
    badge: "Practical",
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30 overflow-hidden">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Publications
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Books by Deke Sharon
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The definitive collection of a cappella knowledge — from arranging techniques to
            vocal harmony mastery
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-background/95 backdrop-blur-sm shadow-elevated border-border hover:bg-accent hover:text-accent-foreground transition-all"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous</span>
            </Button>
          </div>

          <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-background/95 backdrop-blur-sm shadow-elevated border-border hover:bg-accent hover:text-accent-foreground transition-all"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex-none w-[280px] md:w-[320px] lg:w-[340px]"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary/30 hover:bg-primary/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.dekesharon.com/books/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-accent font-medium transition-colors"
          >
            View all publications
            <ExternalLink className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function BookCard({ book }: { book: Book }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group h-full">
      <div className="relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-500 h-full flex flex-col border border-transparent hover:border-accent/20">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
          {book.featured && (
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </div>
            </div>
          )}
          {book.badge && (
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant="secondary"
                className="bg-background/90 backdrop-blur-sm text-xs"
              >
                {book.badge}
              </Badge>
            </div>
          )}

          {/* Book Cover Image or Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            {imageError ? (
              <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
                <BookOpen className="h-16 w-16 text-primary/30 mb-4" />
                <span className="font-heading text-sm font-bold text-foreground/70 line-clamp-3">
                  {book.title}
                </span>
              </div>
            ) : (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <a
              href={book.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get This Book
              </Button>
            </a>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-heading text-base font-bold leading-tight line-clamp-2 group-hover:text-accent transition-colors">
              {book.title}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {book.authors}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">{book.year}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{book.format}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {book.description}
          </p>

          {/* Purchase Link - Mobile */}
          <a
            href={book.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 md:hidden"
          >
            <Button
              variant="outline"
              className="w-full text-sm hover:bg-accent hover:text-accent-foreground hover:border-accent"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Amazon
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
