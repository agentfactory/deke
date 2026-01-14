"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Music,
  Users,
  Mic2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Loader2,
} from "lucide-react";

const services = [
  {
    id: "arrangement",
    icon: Music,
    title: "Custom Arrangement",
    description: "Get a bespoke a cappella arrangement for your group",
    price: "From $500",
  },
  {
    id: "coaching",
    icon: Users,
    title: "Group Coaching",
    description: "Transform your ensemble with expert guidance",
    price: "From $2,000",
  },
  {
    id: "individual",
    icon: User,
    title: "Individual Coaching",
    description: "One-on-one sessions for directors and vocalists",
    price: "From $200/hr",
  },
  {
    id: "workshop",
    icon: Calendar,
    title: "Workshop/Clinic",
    description: "Intensive sessions for schools and events",
    price: "From $5,000",
  },
  {
    id: "speaking",
    icon: Mic2,
    title: "Speaking Engagement",
    description: "Inspiring keynotes and presentations",
    price: "From $15,000",
  },
  {
    id: "consultation",
    icon: Clock,
    title: "Free Consultation",
    description: "15-minute call to discuss your needs",
    price: "Free",
  },
];

type Step = "service" | "details" | "contact" | "confirm";

function BookingContent() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "";

  const [step, setStep] = useState<Step>(initialService ? "details" : "service");
  const [selectedService, setSelectedService] = useState(initialService);
  const [formData, setFormData] = useState({
    // Contact Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    // Service Details
    songTitle: "",
    voiceParts: "",
    timeline: "",
    groupSize: "",
    eventDate: "",
    eventLocation: "",
    eventType: "",
    message: "",
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep("details");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API / TEMPO agent for onboarding
    setStep("confirm");
  };

  const renderServiceFields = () => {
    switch (selectedService) {
      case "arrangement":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="songTitle">Song Title & Artist</Label>
              <Input
                id="songTitle"
                name="songTitle"
                placeholder="e.g., 'Bohemian Rhapsody' by Queen"
                value={formData.songTitle}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="voiceParts">Number of Voice Parts</Label>
                <Input
                  id="voiceParts"
                  name="voiceParts"
                  placeholder="e.g., 4, 6, 8"
                  value={formData.voiceParts}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Desired Timeline</Label>
                <Input
                  id="timeline"
                  name="timeline"
                  placeholder="e.g., 3 weeks"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </>
        );
      case "coaching":
      case "individual":
        return (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="groupSize">Group Size</Label>
                <Input
                  id="groupSize"
                  name="groupSize"
                  placeholder="Number of singers"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Preferred Date(s)</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventLocation">Location (or Virtual)</Label>
              <Input
                id="eventLocation"
                name="eventLocation"
                placeholder="City, State or 'Virtual'"
                value={formData.eventLocation}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      case "workshop":
      case "speaking":
        return (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  name="eventType"
                  placeholder="e.g., Conference, Festival, School"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventLocation">Location</Label>
                <Input
                  id="eventLocation"
                  name="eventLocation"
                  placeholder="City, State/Country"
                  value={formData.eventLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupSize">Expected Attendance</Label>
                <Input
                  id="groupSize"
                  name="groupSize"
                  placeholder="Number of attendees"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
      <div className="container px-4 md:px-6 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {(["service", "details", "contact", "confirm"] as Step[]).map(
            (s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : i <
                        ["service", "details", "contact", "confirm"].indexOf(
                          step
                        )
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i <
                  ["service", "details", "contact", "confirm"].indexOf(step) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 md:w-24 h-0.5 ml-2 ${
                      i <
                      ["service", "details", "contact", "confirm"].indexOf(step)
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>

        {/* Step 1: Service Selection */}
        {step === "service" && (
          <div>
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                Step 1 of 4
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                What Can I Help You With?
              </h1>
              <p className="text-muted-foreground">
                Select the service you're interested in
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    selectedService === service.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{service.title}</h3>
                        <Badge variant="secondary">{service.price}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {step === "details" && (
          <div>
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                Step 2 of 4
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Tell Me More
              </h1>
              <p className="text-muted-foreground">
                Share the details about your project
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                {renderServiceFields()}
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Details</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell me more about your group, goals, or any special requirements..."
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("service")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep("contact")}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step === "contact" && (
          <div>
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                Step 3 of 4
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Your Information
              </h1>
              <p className="text-muted-foreground">
                How can I reach you?
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization/Group</Label>
                      <Input
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("details")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      Submit Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === "confirm" && (
          <div className="text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Request Submitted!
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Thank you for your interest! I'll review your request and get
              back to you within 24-48 hours. In the meantime, feel free to
              explore more of my work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/masterclass">Explore Masterclass</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-4">Loading booking form...</p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingFallback />}>
      <BookingContent />
    </Suspense>
  );
}
