"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Mic,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Film,
} from "lucide-react";

const performanceVideos = [
  {
    title: "Deke Sharon Promo Reel",
    description:
      "A highlight reel showcasing performances, workshops, and collaborations spanning three decades of a cappella leadership.",
    youtubeId: "piLs3_iPc6U",
  },
  {
    title: "The Sing-Off Highlights",
    description:
      "Memorable moments from NBC's a cappella competition series, created and produced by Deke Sharon.",
    youtubeId: null,
    placeholder: true,
  },
  {
    title: "Pitch Perfect Behind the Scenes",
    description:
      "A look behind the scenes of the vocal production process for the hit film franchise.",
    youtubeId: null,
    placeholder: true,
  },
];

const interviewVideos = [
  {
    title: "The Art of A Cappella",
    description:
      "Deke discusses the evolution of contemporary a cappella and what makes it resonate with audiences worldwide.",
    youtubeId: null,
    placeholder: true,
  },
  {
    title: "From Pitch Perfect to Broadway",
    description:
      "An in-depth conversation about the journey from film vocal production to creating Broadway's first a cappella musical.",
    youtubeId: null,
    placeholder: true,
  },
  {
    title: "The Future of Vocal Music",
    description:
      "Deke shares his vision for where a cappella and vocal music are headed in the modern era.",
    youtubeId: null,
    placeholder: true,
  },
];

const tooManyNotesEntries = [
  {
    title: "Too Many Notes",
    description:
      "Deke's ongoing series exploring the art, craft, and culture of a cappella music. New episodes and articles added regularly covering everything from arranging tips to industry insights.",
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

function VideoCard({
  title,
  description,
  youtubeId,
  placeholder,
}: {
  title: string;
  description: string;
  youtubeId?: string | null;
  placeholder?: boolean;
}) {
  return (
    <Card className="h-full transition-shadow hover:shadow-elevated overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
            <div className="text-center">
              <Play className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground/50">
                Video coming soon
              </p>
            </div>
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <h3 className="font-heading font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function MediaPage() {
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
            <Badge
              variant="outline"
              className="mb-4 border-white/20 text-white/80 bg-white/5"
            >
              <Film className="h-3 w-3 mr-1" />
              Media
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              Performances, Interviews &{" "}
              <span className="text-gold">More</span>
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Watch performances, behind-the-scenes content, interviews, and
              explore the world of a cappella through Deke&apos;s eyes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Performance Videos */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Play className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
                Performance Videos
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Highlights from concerts, workshops, and productions spanning
              three decades.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {performanceVideos.map((video) => (
              <motion.div key={video.title} variants={fadeInUp}>
                <VideoCard
                  title={video.title}
                  description={video.description}
                  youtubeId={video.youtubeId}
                  placeholder={video.placeholder}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interview Videos */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mic className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
                Interview Videos
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Conversations about a cappella, music production, and the creative
              process.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {interviewVideos.map((video) => (
              <motion.div key={video.title} variants={fadeInUp}>
                <VideoCard
                  title={video.title}
                  description={video.description}
                  youtubeId={video.youtubeId}
                  placeholder={video.placeholder}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Too Many Notes */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
                Too Many Notes
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Deke&apos;s ongoing series exploring the art, craft, and culture
              of a cappella music. New entries added regularly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-primary/30 mb-4" />
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Too Many Notes Archive
                </h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                  This section is being populated with Deke&apos;s collection of
                  articles, observations, and insights about the a cappella
                  world. Check back soon for the full archive.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    Get Notified When Updated
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-hero text-white">
        <div className="container px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Want Deke at Your Event?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
              From workshops to keynotes to full productions, bring the energy
              and expertise to your group or organization.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link href="/booking">
                Book a Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
