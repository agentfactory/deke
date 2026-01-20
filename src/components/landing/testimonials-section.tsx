"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, MessageSquare } from "lucide-react";

const testimonials = [
  {
    quote: "The Father of Contemporary A Cappella",
    author: "Entertainment Weekly",
    size: "large" as const,
  },
  {
    quote: "A One Man A Cappella Revolution",
    author: "Boston Globe",
    size: "medium" as const,
  },
  {
    quote: "The Genius Behind Pitch Perfect",
    author: "BBC",
    size: "medium" as const,
  },
  {
    quote: "Hollywood's Go-To Choral Whiz",
    author: "Radio New Zealand",
    size: "small" as const,
  },
  {
    quote: "Pioneering Achievement… Gleams with Blended Polyphony",
    author: "New York Times",
    size: "large" as const,
  },
  {
    quote: "Aca-amazing! Godfather of a cappella",
    author: "Rebel Wilson",
    role: "Actress, Pitch Perfect",
    size: "medium" as const,
  },
  {
    quote: "Completely amazing, I forgot there wasn't an orchestra!",
    author: "Sir Paul McCartney",
    size: "large" as const,
  },
  {
    quote: "I've been watching your career, your work is truly amazing!",
    author: "Seal",
    role: "Grammy-winning Artist",
    size: "medium" as const,
  },
  {
    quote: "Magnetic, musical, entertaining, informed, interesting",
    author: "Dr. Janet Galvan",
    role: "Ithaca Children's Choir",
    size: "small" as const,
  },
  {
    quote: "Deke Sharon's vibrant and evocative vocal arrangements deserve star billing",
    author: "Broadway World",
    size: "large" as const,
  },
];

const sizeStyles = {
  large: {
    card: "bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20",
    text: "text-xl md:text-2xl font-semibold",
  },
  medium: {
    card: "bg-white border-border/50",
    text: "text-lg",
  },
  small: {
    card: "bg-secondary/50 border-transparent",
    text: "text-base",
  },
};

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <MessageSquare className="h-4 w-4" />
            Testimonials
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What They&apos;re Saying
          </h2>
          <p className="text-lg text-muted-foreground">
            From Entertainment Weekly to Paul McCartney
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              className="break-inside-avoid"
            >
              <Card
                className={`relative overflow-hidden border hover:shadow-elevated transition-all duration-300 ${
                  sizeStyles[testimonial.size].card
                }`}
              >
                <CardContent className="pt-6 pb-5 md:pt-8 md:pb-6">
                  <Quote className="h-7 w-7 md:h-8 md:w-8 text-accent/30 mb-3 md:mb-4" />
                  <p
                    className={`${sizeStyles[testimonial.size].text} mb-4 leading-relaxed text-foreground`}
                  >
                    {`"${testimonial.quote}"`}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary text-sm">
                        {testimonial.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      {testimonial.role && (
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
