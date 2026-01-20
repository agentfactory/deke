"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Send,
} from "lucide-react";

const projectTypes = [
  { value: "tv-film", label: "TV/Film/Streaming Production" },
  { value: "workshop", label: "Festival/Conference Workshop" },
  { value: "university", label: "University/School Program" },
  { value: "corporate", label: "Corporate Event" },
  { value: "coaching", label: "Professional Group Coaching" },
  { value: "arrangement", label: "Custom Arrangement(s)" },
  { value: "production", label: "Album Production" },
  { value: "other", label: "Other / Not Sure Yet" },
];


export function ContactSection() {
  return (
    <section
      className="py-20 md:py-28 bg-gradient-hero text-white"
      id="contact"
    >
      <div className="container px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-4 backdrop-blur-sm">
            <Send className="h-4 w-4" />
            Contact
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Let&apos;s Create Something Legendary
          </h2>
          <p className="text-lg md:text-xl text-white/70">
            No question too small, no project too large.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elevated">
              <CardHeader>
                <CardTitle className="font-heading text-xl md:text-2xl">
                  Request Deke for Your Project
                </CardTitle>
                <CardDescription>
                  Most inquiries receive a response within 24 business hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input id="organization" placeholder="Your organization" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-type">Project Type *</Label>
                    <Select>
                      <SelectTrigger id="project-type">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Event/Project Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Target Budget</Label>
                      <Input id="budget" placeholder="Your budget" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message / Project Details *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project, goals, timeline, and any specific questions you have..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base"
                  >
                    Submit Request
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Connect */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="font-heading text-xl md:text-2xl">
                  Quick Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <a
                      href="mailto:deke@dekesharon.com"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      deke@dekesharon.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Location</p>
                    <p className="text-white/70">San Francisco, CA</p>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 justify-start h-12"
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
                    className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 justify-start h-12"
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
                    className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 justify-start h-12"
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

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 md:p-6">
              <p className="text-sm text-white/70 text-center">
                <span className="font-semibold text-white">Response Time:</span>{" "}
                Most inquiries receive a response within 24 business hours. For
                urgent projects, please note in your message.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
