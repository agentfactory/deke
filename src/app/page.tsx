"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  Film,
  GraduationCap,
  Mic2,
  Star,
  ArrowRight,
  Quote,
  Trophy,
  Users,
  Radio,
  Award,
  PlayCircle,
  Check,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-accent overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="flex flex-col gap-8 text-white">
              <div className="space-y-6">
                <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  The Father of Contemporary A Cappella
                </h1>
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  Vocal Director, Arranger & Producer Behind <span className="font-semibold">Pitch Perfect</span>, <span className="font-semibold">The Sing-Off</span>, Broadway's <span className="font-semibold">In Transit</span>, and 2,000+ Arrangements Worldwide
                </p>
                <p className="text-lg text-white/80">
                  From Grammy-nominated productions to transforming choirs on Carnegie Hall stages—30 years of making vocal harmony legendary.
                </p>
              </div>

              {/* Dual CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto"
                  asChild
                >
                  <Link href="#contact">
                    Request Deke for Your Project
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
                  asChild
                >
                  <Link href="#contact">
                    Book a Discovery Call
                    <Calendar className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-white/20">
                <p className="text-sm text-white/60 mb-4 uppercase tracking-wide">Trusted By</p>
                <div className="flex flex-wrap gap-6 items-center text-white/40 text-sm font-medium">
                  <span>NBC</span>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <span>BBC</span>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <span>Disney</span>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <span>Universal</span>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <span>Broadway</span>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <span>Carnegie Hall</span>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <span>Pentatonix</span>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative aspect-[4/5] rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20">
              <div className="text-center p-8">
                <Music className="h-32 w-32 mx-auto text-white/30 mb-6" />
                <p className="text-white/60 text-lg">
                  Professional photo of Deke conducting
                  <br />
                  <span className="text-sm text-white/40">(Carnegie Hall or Pitch Perfect set)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/60" />
        </div>
      </section>

      {/* ========== CREDENTIALS BAR ========== */}
      <section className="py-12 bg-white border-y">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center justify-items-center">
            <div className="text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-[var(--gold)]" />
              <p className="font-bold text-sm">Grammy Nominated</p>
            </div>
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-[var(--gold)]" />
              <p className="font-bold text-sm">Billboard #1</p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-[var(--gold)]" />
              <p className="font-bold text-sm">30+ Years Pioneer</p>
            </div>
            <div className="text-center">
              <Music className="h-8 w-8 mx-auto mb-2 text-[var(--gold)]" />
              <p className="font-bold text-sm">2,000+ Arrangements</p>
            </div>
            <div className="text-center">
              <Film className="h-8 w-8 mx-auto mb-2 text-[var(--gold)]" />
              <p className="font-bold text-sm">Pitch Perfect Trilogy</p>
            </div>
            <div className="text-center">
              <Radio className="h-8 w-8 mx-auto mb-2 text-[var(--gold)]" />
              <p className="font-bold text-sm">Broadway's First</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-[var(--gold)]" />
              <p className="font-bold text-sm">Carnegie Hall Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHO I WORK WITH ========== */}
      <section className="py-20 md:py-28 bg-secondary/30" id="services">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Who I Work With
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three decades of experience serving the world's top entertainment productions,
              major institutions, and professional artists
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Entertainment Production */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-accent">
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-white mb-4">
                  <Film className="h-8 w-8" />
                </div>
                <CardTitle className="font-heading text-2xl mb-2">
                  For Producers & Networks
                </CardTitle>
                <CardDescription className="text-base">
                  TV/Film production, music direction, on-set coaching, vocal production, creative consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Pitch Perfect trilogy</Badge>
                  <Badge variant="secondary">The Sing-Off (5 seasons)</Badge>
                  <Badge variant="secondary">Disney</Badge>
                  <Badge variant="secondary">Broadway</Badge>
                </div>
                <Button className="w-full group-hover:bg-accent group-hover:text-accent-foreground" asChild>
                  <Link href="#contact">
                    Discuss Your Production
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Events & Institutions - EMPHASIZED */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-4 border-[var(--gold)] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--gold)] text-[var(--gold-foreground)] px-4 py-1 text-xs font-bold uppercase">
                Premium
              </div>
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent text-accent-foreground mb-4">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <CardTitle className="font-heading text-2xl mb-2">
                  For Festivals & Universities
                </CardTitle>
                <CardDescription className="text-base">
                  Headline clinician, multi-day workshops, masterclasses, keynote experiences, custom events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/10 border-2 border-accent rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-accent mb-1">$5,000–$15,000/day</p>
                  <p className="text-sm text-muted-foreground">Multi-day residencies available</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">TotalVocal Carnegie Hall</Badge>
                  <Badge variant="secondary">30+ workshop topics</Badge>
                  <Badge variant="secondary">International tours</Badge>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <Link href="#workshops">
                    View Workshop Topics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional Groups */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-accent">
              <CardHeader>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-white mb-4">
                  <Mic2 className="h-8 w-8" />
                </div>
                <CardTitle className="font-heading text-2xl mb-2">
                  For Artists & Groups
                </CardTitle>
                <CardDescription className="text-base">
                  Custom arrangements, album production, ongoing coaching, competition prep, style development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Pentatonix</Badge>
                  <Badge variant="secondary">Straight No Chaser</Badge>
                  <Badge variant="secondary">Billboard Top 40 albums</Badge>
                  <Badge variant="secondary">ICCA champions</Badge>
                </div>
                <Button className="w-full group-hover:bg-accent group-hover:text-accent-foreground" asChild>
                  <Link href="#contact">
                    Start Your Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ========== VIDEO SECTION ========== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              See Deke in Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Watch highlights from Pitch Perfect, The Sing-Off, and live masterclasses
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden border-2 border-border cursor-pointer hover:border-accent transition-colors group">
              <div className="absolute inset-0 bg-[url('/images/video-thumbnail.jpg')] bg-cover bg-center" />
              <div className="relative z-10 text-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 mb-4 inline-block group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-16 w-16 text-accent" />
                </div>
                <p className="text-white bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                  Click to watch highlight reel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SIGNATURE WORK SHOWCASE ========== */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Signature Work
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From the highest-grossing music comedy series to Grammy-nominated albums and Broadway firsts
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Pitch Perfect Trilogy",
                description: "Music Director for the highest-grossing music comedy series of all time",
                badge: "Film",
                icon: Film,
              },
              {
                title: "The Sing-Off",
                description: "5 seasons across 4 countries as music director",
                badge: "TV",
                icon: Radio,
              },
              {
                title: "In Transit - Broadway",
                description: "Broadway's first a cappella musical—arranger & producer",
                badge: "Broadway",
                icon: Star,
              },
              {
                title: "TotalVocal at Carnegie Hall",
                description: "Annual production directing 400+ singers",
                badge: "Live Event",
                icon: Users,
              },
              {
                title: "DCappella (Disney)",
                description: "Musical director for Disney's all-star a cappella group",
                badge: "Production",
                icon: Music,
              },
              {
                title: "Camp A Cappella",
                description: "World's largest a cappella camp, ages 13-130",
                badge: "Education",
                icon: GraduationCap,
              },
              {
                title: "Pitch Perfect 2 Soundtrack",
                description: "Billboard #1, Grammy nomination, AMA Award",
                badge: "Album",
                icon: Award,
              },
              {
                title: "The House Jacks",
                description: "'The original rock band without instruments' (SF Chronicle)",
                badge: "Founding",
                icon: Trophy,
              },
            ].map((project) => (
              <Card key={project.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <project.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">{project.badge}</Badge>
                  </div>
                  <CardTitle className="font-heading text-lg mb-2">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRESS QUOTES WALL (MASONRY) ========== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              What They're Saying
            </h2>
            <p className="text-lg text-muted-foreground">
              From Entertainment Weekly to Paul McCartney
            </p>
          </div>

          {/* Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              {
                quote: "The Father of Contemporary A Cappella",
                author: "Entertainment Weekly",
                size: "large",
              },
              {
                quote: "A One Man A Cappella Revolution",
                author: "Boston Globe",
                size: "medium",
              },
              {
                quote: "The Genius Behind Pitch Perfect",
                author: "BBC",
                size: "medium",
              },
              {
                quote: "Hollywood's Go-To Choral Whiz",
                author: "Radio New Zealand",
                size: "small",
              },
              {
                quote: "Pioneering Achievement… Gleams with Blended Polyphony",
                author: "New York Times",
                size: "large",
              },
              {
                quote: "Aca-amazing! Godfather of a cappella",
                author: "Rebel Wilson",
                role: "Actress, Pitch Perfect",
                size: "medium",
              },
              {
                quote: "Completely amazing, I forgot there wasn't an orchestra!",
                author: "Sir Paul McCartney",
                size: "large",
              },
              {
                quote: "I've been watching your career, your work is truly amazing!",
                author: "Seal",
                role: "Grammy-winning Artist",
                size: "medium",
              },
              {
                quote: "Magnetic, musical, entertaining, informed, interesting",
                author: "Dr. Janet Galvan",
                role: "Ithaca Children's Choir",
                size: "small",
              },
              {
                quote: "Deke Sharon's vibrant and evocative vocal arrangements deserve star billing",
                author: "Broadway World",
                size: "large",
              },
            ].map((testimonial, i) => (
              <Card
                key={i}
                className={`break-inside-avoid relative overflow-hidden border-2 hover:border-accent transition-colors ${
                  testimonial.size === "large"
                    ? "bg-gradient-to-br from-accent/5 to-primary/5"
                    : testimonial.size === "medium"
                    ? "bg-white"
                    : "bg-secondary/30"
                }`}
              >
                <CardContent className="pt-8 pb-6">
                  <Quote className="h-8 w-8 text-[var(--gold)] mb-4 opacity-50" />
                  <p
                    className={`${
                      testimonial.size === "large"
                        ? "text-xl md:text-2xl font-semibold"
                        : testimonial.size === "medium"
                        ? "text-lg"
                        : "text-base"
                    } mb-4 leading-relaxed`}
                  >
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary text-sm">
                        {testimonial.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      {testimonial.role && (
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SERVICES DEEP-DIVE (TABBED) ========== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              How Deke Can Transform Your Project
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              World-class expertise across arranging, directing, producing, and coaching
            </p>
          </div>

          <Tabs defaultValue="arranging" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/10 backdrop-blur-sm p-2 gap-2 h-auto">
              <TabsTrigger value="arranging" className="data-[state=active]:bg-white data-[state=active]:text-primary text-white py-3">
                Arranging
              </TabsTrigger>
              <TabsTrigger value="directing" className="data-[state=active]:bg-white data-[state=active]:text-primary text-white py-3">
                Directing
              </TabsTrigger>
              <TabsTrigger value="producing" className="data-[state=active]:bg-white data-[state=active]:text-primary text-white py-3">
                Producing
              </TabsTrigger>
              <TabsTrigger value="coaching" className="data-[state=active]:bg-white data-[state=active]:text-primary text-white py-3">
                Coaching & Workshops
              </TabsTrigger>
            </TabsList>

            <TabsContent value="arranging" className="mt-8">
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-3xl flex items-center gap-3">
                    <Music className="h-8 w-8 text-accent" />
                    A Cappella Arranging
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Check className="h-5 w-5 text-[var(--gold)]" />
                        What's Included
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• 2,000+ a cappella arrangements for groups worldwide</li>
                        <li>• Custom arrangements: any song, any style, all levels</li>
                        <li>• TV/Film: Pitch Perfect, The Sing-Off, The Social Network</li>
                        <li>• Broadway: In Transit, Andrew Lloyd Webber's Unmasked</li>
                        <li>• Published catalog available</li>
                      </ul>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-6">
                      <h4 className="font-semibold text-lg mb-3">Timeline</h4>
                      <p className="text-2xl font-bold text-accent mb-2">Within 1 week</p>
                      <p className="text-sm text-muted-foreground">
                        Most arrangements completed within a week. Rush delivery available for additional fee.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="directing" className="mt-8">
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-3xl flex items-center gap-3">
                    <Film className="h-8 w-8 text-accent" />
                    Music Direction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Music direction for TV, film, Broadway, live events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>On-camera and off-camera directing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Large-scale event direction (400+ singers)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Touring show direction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Group founding and development</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="producing" className="mt-8">
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-3xl flex items-center gap-3">
                    <Radio className="h-8 w-8 text-accent" />
                    Vocal Production
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Album production: Billboard Top 40 albums, Grammy-nominated work</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Vocal production for TV/Film</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Event production and conceptualization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                      <span>Recording, editing, mixing, mastering</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coaching" className="mt-8" id="workshops">
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="font-heading text-3xl flex items-center gap-3">
                      <GraduationCap className="h-8 w-8 text-accent" />
                      Workshops & Coaching
                    </CardTitle>
                    <div className="bg-accent text-accent-foreground px-6 py-3 rounded-lg">
                      <p className="text-2xl font-bold">$5,000–$15,000/day</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Masterclasses</h4>
                      <p className="text-sm text-muted-foreground">
                        Live group coaching before audiences
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Pitch Perfect Singalong</h4>
                      <p className="text-sm text-muted-foreground">
                        90-120 min, draws hundreds
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">30+ Seminar Topics</h4>
                      <p className="text-sm text-muted-foreground">
                        View full catalog below
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-lg mb-3">Formats Available:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Single sessions</Badge>
                      <Badge variant="outline">Ongoing coaching</Badge>
                      <Badge variant="outline">In-person</Badge>
                      <Badge variant="outline">Virtual</Badge>
                      <Badge variant="outline">Private</Badge>
                      <Badge variant="outline">Public masterclass</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ========== WORKSHOP TOPICS CATALOG (EXPANDABLE) ========== */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Workshop & Seminar Topics
            </h2>
            <p className="text-lg text-muted-foreground">
              30+ specialized topics, custom-tailored to your group's needs and demographics
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <h3 className="font-heading text-2xl font-bold">Popular Workshops</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Masterclasses (variable length)",
                    "Pitch Perfect Singalong (90-120 min)",
                    "History of A Cappella, 1900-Present",
                    "Contemporary A Cappella Arranging in 10 Steps",
                    "Advanced A Cappella Arranging",
                    "Arranging Mashups",
                    "Singing Instruments & Vocal Percussion",
                    "Stage Presence & Performance Presentation",
                    "Close Harmony Blend / Improving Tuning",
                    "Expert Level Music Director's Toolkit",
                    "Introduction to Choral Pop Techniques",
                    "Inspiring Young Singers through Contemporary A Cappella",
                  ].map((topic) => (
                    <div key={topic} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="font-semibold">
                  {isExpanded ? "Show Less" : "View All 30+ Topics"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  {[
                    "Producing an Album",
                    "A Cappella Business & Management",
                    "Solo Delivery",
                    "Group Dynamics",
                    "Careers in A Cappella",
                    "The Future of A Cappella",
                    "Building Your Repertoire",
                    "Competition Strategies",
                    "Recording Techniques for Vocal Groups",
                    "Social Media for Musicians",
                    "Booking Gigs & Tours",
                    "Vocal Health & Warm-ups",
                    "Leading Rehearsals Effectively",
                    "Sight-Reading for Singers",
                    "Microphone Techniques",
                    "Creating Viral Content",
                    "Monetizing Your Music",
                    "Copyright & Licensing Basics",
                  ].map((topic) => (
                    <div key={topic} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-center">
                  <span className="font-semibold">All workshops are custom-tailored</span> to your group's specific needs, interests, skill level, and demographics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ========== RESULTS & OUTCOMES ========== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              The Deke Difference: Real Transformations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proven track record of taking groups from regional to world-class
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                metric: "Regional → International",
                description: "Groups advancing from local competitions to ICCA championship level",
                icon: Trophy,
              },
              {
                metric: "3x Enrollment Growth",
                description: "University programs tripling enrollment after workshop series",
                icon: Users,
              },
              {
                metric: "Record Deals",
                description: "Professional groups landing major label contracts after album production",
                icon: Award,
              },
              {
                metric: "Carnegie Hall",
                description: "Choirs achieving performances on the world's most prestigious stages",
                icon: Star,
              },
            ].map((result) => (
              <Card key={result.metric} className="text-center hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto mb-4">
                    <result.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-heading text-xl mb-2">
                    {result.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BOOKING PROCESS (3-STEP) ========== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-secondary/30 to-white">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              How to Work With Deke
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple three-step process from vision to creation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (hidden on mobile) */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-accent/20 -z-10" />

            {[
              {
                step: "01",
                title: "Share Your Vision",
                description: "Submit project details via inquiry form or book a 15-minute discovery call",
                items: [
                  "Project type (production, event, workshop, recording, arrangement)",
                  "Dates, location, scope",
                  "Budget range",
                  "Timeline",
                ],
              },
              {
                step: "02",
                title: "Custom Proposal",
                description: "Receive tailored proposal within 48 hours",
                items: [
                  "Service package options",
                  "Timeline and deliverables",
                  "Investment breakdown",
                  "Availability confirmation",
                ],
              },
              {
                step: "03",
                title: "Create Magic",
                description: "Collaborative process from concept to completion",
                items: [
                  "Pre-production planning",
                  "On-site or virtual execution",
                  "Follow-up support as needed",
                ],
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground text-2xl font-bold mb-6 shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  <ul className="text-sm text-muted-foreground text-left space-y-2">
                    {step.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What is your availability for workshops and events?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Deke works globally throughout the year. For best availability, book 3-6 months in
                advance for major events. Rush projects may be accommodated based on schedule.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What's included in a workshop day rate?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Day rates ($5,000-$15,000 depending on scope) include up to 8 hours of instruction,
                travel time prep, custom content tailoring, and follow-up materials. Multi-day
                residencies receive preferred pricing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Can you work with groups of any skill level?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. From beginners to Grammy-winning professionals, Deke tailors every
                engagement to your group's level and goals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg font-semibold">
                How long does a custom arrangement take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Most arrangements are completed within 1 week. Rush delivery available for additional fee.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Do you offer virtual coaching/workshops?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Virtual masterclasses and coaching via Zoom/Skype available worldwide.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What's required to book you for a TV/Film project?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Contact via inquiry form with project overview. Deke works directly with producers,
                music supervisors, and production companies on negotiated contracts.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ========== CONTACT / CTA SECTION ========== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-primary to-accent text-white" id="contact">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Let's Create Something Legendary
            </h2>
            <p className="text-xl text-white/80">
              No question too small, no project too large.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Request Deke for Your Project
                </CardTitle>
                <CardDescription>
                  Most inquiries receive a response within 24 business hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization/Production Company</Label>
                      <Input id="organization" placeholder="Your organization" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-type">Project Type *</Label>
                    <Select>
                      <SelectTrigger id="project-type">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tv-film">TV/Film/Streaming Production</SelectItem>
                        <SelectItem value="workshop">Festival/Conference Workshop</SelectItem>
                        <SelectItem value="university">University/School Program</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="coaching">Professional Group Coaching</SelectItem>
                        <SelectItem value="arrangement">Custom Arrangement(s)</SelectItem>
                        <SelectItem value="production">Album Production</SelectItem>
                        <SelectItem value="other">Other / Not Sure Yet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Event/Project Date (if known)</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range (optional)</Label>
                      <Select>
                        <SelectTrigger id="budget">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-5k">Under $5k</SelectItem>
                          <SelectItem value="5k-15k">$5k-$15k</SelectItem>
                          <SelectItem value="15k-50k">$15k-$50k</SelectItem>
                          <SelectItem value="50k-100k">$50k-$100k</SelectItem>
                          <SelectItem value="100k-plus">$100k+</SelectItem>
                          <SelectItem value="discuss">Prefer to discuss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message / Project Details *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project, goals, timeline, and any specific questions you have..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    Submit Request
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="space-y-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Quick Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Email</p>
                      <a href="mailto:deke@dekesharon.com" className="text-white/80 hover:text-white transition-colors">
                        deke@dekesharon.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Location</p>
                      <p className="text-white/80">San Francisco, CA</p>
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-white/30 text-white hover:bg-white/10 justify-start"
                      asChild
                    >
                      <Link href="#contact">
                        <Calendar className="mr-3 h-5 w-5" />
                        Book a 15-Minute Discovery Call
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-white/30 text-white hover:bg-white/10 justify-start"
                      asChild
                    >
                      <Link href="/workshops">
                        <ExternalLink className="mr-3 h-5 w-5" />
                        Download Workshop Topics PDF
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-white/30 text-white hover:bg-white/10 justify-start"
                      asChild
                    >
                      <Link href="/about">
                        <ExternalLink className="mr-3 h-5 w-5" />
                        View Full Portfolio on IMDb
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <p className="text-sm text-white/80 text-center">
                  <span className="font-semibold text-white">Response Time:</span> Most inquiries
                  receive a response within 24 business hours. For urgent projects, please note in your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
