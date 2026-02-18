"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  BookOpen,
  Users,
  Trophy,
  Music,
  Mic,
  ArrowRight,
  Quote,
} from "lucide-react";

const highlights = [
  {
    icon: Film,
    title: "Film & Television",
    description:
      "Pitch Perfect 1, 2, 3, & Bumper in Berlin. The Sing-Off (NBC, Netherlands, China, South Africa). Pitch Slapped (Lifetime). Pitch Battle (BBC One).",
  },
  {
    icon: Music,
    title: "Broadway",
    description:
      "Created the first a cappella musical on Broadway: In Transit.",
  },
  {
    icon: BookOpen,
    title: "7 Published Books",
    description:
      "Author of thousands of a cappella arrangements and 7 books on the art and craft of vocal music.",
  },
  {
    icon: Users,
    title: "Community Builder",
    description:
      "Founded CASA, ICCA, CARAs, BOCA, Contemporary A Cappella Publishing, and Camp A Cappella.",
  },
  {
    icon: Trophy,
    title: "Awards & Recognition",
    description:
      "PT Barnum Award, two lifetime achievement awards (A Cappella Music Awards & CASA). Gold & Platinum albums, Billboard #1, AMA, MTV, OFTA wins, Grammy & Dove nominations.",
  },
  {
    icon: Mic,
    title: "Performing Since Age 8",
    description:
      "Annual concerts at Carnegie Hall. Shared the stage with Ray Charles, James Brown, Pavarotti, Crosby Stills & Nash, Run DMC, The Temptations, LL Cool J, and more.",
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
      staggerChildren: 0.1,
    },
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <Badge
                variant="outline"
                className="mb-4 border-white/20 text-white/80 bg-white/5"
              >
                About
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
                The Father of Contemporary{" "}
                <span className="text-gold">A Cappella</span>
              </h1>
              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                Heralded as &ldquo;The father of contemporary a cappella&rdquo;{" "}
                <span className="text-white/50">(Entertainment Weekly)</span>{" "}
                and &ldquo;A one man a cappella revolution&rdquo;{" "}
                <span className="text-white/50">(Boston Globe)</span>, Deke
                Sharon is responsible for many movies and television shows behind
                the scenes, on camera, and the first a cappella musical on
                Broadway.
              </p>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                He has been performing professionally since the age of 8, has
                written 7 books and thousands of arrangements, and has produced
                Gold &amp; Platinum albums that topped Billboard charts.
              </p>
              <Button variant="accent" size="lg" asChild>
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Deke Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/deke/deke2-photographer-Nikki-Davis-Jones.jpg"
                alt="Deke Sharon - The Father of Contemporary A Cappella"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Bio */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-8 text-center">
              About Deke
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Heralded as &ldquo;The father of contemporary a cappella&rdquo;
                (Entertainment Weekly) and &ldquo;A one man a cappella
                revolution&rdquo; (Boston Globe), Deke Sharon is responsible for
                many movies and television shows behind the scenes (Pitch
                Perfect 1, 2, 3, &amp; Bumper in Berlin, The Sing-Off on NBC,
                Netherlands, China, South Africa), on camera (Pitch Slapped on
                Lifetime, Pitch Battle on BBC One), and the first a cappella
                musical on Broadway (In Transit).
              </p>

              <p className="text-lg">
                He has written 7 books, thousands of a cappella arrangements,
                and founded many organizations including The Contemporary A
                Cappella Society of America, The International Championship of
                College A Cappella, The Contemporary A Cappella Recording
                Awards, BOCA: Best of College A Cappella, Contemporary A
                Cappella Publishing, and Camp A Cappella.
              </p>

              <p className="text-lg">
                He has won the PT Barnum Award for excellence in entertainment
                and two lifetime achievement awards (A Cappella Music Awards
                &amp; CASA). He has produced Gold &amp; Platinum albums that
                have topped Billboard charts and won many awards (American Music
                Awards, MTV, OFTA) and nominations (Grammys, Dove Awards).
              </p>

              <p className="text-lg">
                He has been performing professionally since the age of 8. He has
                an annual concert at Carnegie Hall, and has shared the stage with
                many legends, including Ray Charles, James Brown, Pavarotti,
                Crosby Stills &amp; Nash, Run DMC, The Temptations, LL Cool J,
                and the Monday Night Football Theme with Hank Williams Jr. for
                the 2011 NFL season.
              </p>

              <blockquote className="border-l-4 border-accent pl-6 py-2 my-8 text-xl italic text-foreground/80">
                &ldquo;Deke Sharon makes a cappella cool again.&rdquo;
                <footer className="text-sm text-muted-foreground mt-2 not-italic">
                  &mdash; NPR
                </footer>
              </blockquote>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Career Highlights
            </h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {highlights.map((item) => (
              <motion.div key={item.title} variants={fadeInUp}>
                <Card className="h-full group">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-foreground mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Philosophy / Quote */}
      <section className="py-20 md:py-28 bg-gradient-hero text-white">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Quote className="h-12 w-12 mx-auto mb-6 text-white/20" />
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-6">
              My Philosophy
            </h2>
            <blockquote className="text-xl md:text-2xl text-white/80 italic mb-8 leading-relaxed">
              &ldquo;The human voice is the most powerful instrument on earth.
              When we sing together, we don&apos;t just make music&mdash;we
              create connection, build community, and touch something deeply
              human in ourselves and our listeners.&rdquo;
            </blockquote>
            <p className="text-white/60 mb-10 leading-relaxed">
              Every group I work with, every arrangement I create, and every
              workshop I lead is guided by this belief. Whether you&apos;re a
              beginner or a seasoned professional, my goal is always the same: to
              help you find your voice and share it with the world.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link href="/booking">
                Work With Me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
