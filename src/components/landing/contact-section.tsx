"use client";

import { useState } from "react";
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
  Loader2,
  CheckCircle,
  AlertCircle,
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

interface FormState {
  name: string;
  email: string;
  organization: string;
  phone: string;
  projectType: string;
  eventDate: string;
  budget: string;
  message: string;
}

const initialFormState: FormState = {
  name: "",
  email: "",
  organization: "",
  phone: "",
  projectType: "",
  eventDate: "",
  budget: "",
  message: "",
};

interface FormState {
  name: string;
  email: string;
  organization: string;
  phone: string;
  projectType: string;
  eventDate: string;
  budget: string;
  message: string;
}

const initialFormState: FormState = {
  name: "",
  email: "",
  organization: "",
  phone: "",
  projectType: "",
  eventDate: "",
  budget: "",
  message: "",
};

export function ContactSection() {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear any previous error when user starts typing
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/booking-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Something went wrong. Please try again.");
      }

      setSubmitStatus("success");
      setFormData(initialFormState);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="py-20 md:py-28 bg-gradient-hero text-white"
      id="contact"
    >
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
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
                {submitStatus === "success" ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
                    <p className="text-muted-foreground mb-4">
                      Thank you for your booking request. We&apos;ll be in touch within 24 business hours.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitStatus("idle")}
                    >
                      Submit Another Request
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {submitStatus === "error" && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          placeholder="Your organization"
                          value={formData.organization}
                          onChange={(e) => handleInputChange("organization", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-type">Project Type *</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) => handleInputChange("projectType", value)}
                        disabled={isSubmitting}
                        required
                      >
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
                        <Input
                          id="date"
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => handleInputChange("eventDate", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget Range</Label>
                        <Select
                          value={formData.budget}
                          onValueChange={(value) => handleInputChange("budget", value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="budget">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message / Project Details *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project, goals, timeline, and any specific questions you have..."
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base"
                      disabled={isSubmitting || !formData.projectType}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Request
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
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
