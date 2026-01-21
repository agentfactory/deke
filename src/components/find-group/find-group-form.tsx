"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const experienceLevels = [
  { value: "beginner", label: "Beginner - New to singing in groups" },
  { value: "intermediate", label: "Intermediate - Some group experience" },
  { value: "advanced", label: "Advanced - Experienced performer" },
  { value: "professional", label: "Professional - Career vocalist" },
];

const genres = [
  "Pop",
  "Jazz",
  "Classical",
  "Gospel",
  "R&B",
  "Rock",
  "Barbershop",
  "Folk",
  "World Music",
  "Musical Theatre",
];

const commitmentLevels = [
  { value: "casual", label: "Casual - Once a month or less" },
  { value: "regular", label: "Regular - Weekly rehearsals" },
  { value: "intensive", label: "Intensive - Multiple times per week" },
  { value: "flexible", label: "Flexible - Open to any commitment level" },
];

export function FindGroupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    age: "",
    experience: "",
    commitment: "",
    performanceInterest: false,
    message: "",
  });

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse name into first and last name
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "(Not Provided)";

      // Step 1: Create or update lead
      const leadResponse = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          organization: formData.location, // Store location in organization field
          source: "find-group-form",
        }),
      });

      if (!leadResponse.ok) {
        throw new Error("Failed to create lead");
      }

      const lead = await leadResponse.json();

      // Step 2: Create inquiry with all form details
      const details = JSON.stringify({
        age: formData.age || null,
        experience: formData.experience,
        commitment: formData.commitment,
        genres: selectedGenres,
        performanceInterest: formData.performanceInterest,
        location: formData.location,
      });

      const inquiryResponse = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          serviceType: "CONSULTATION",
          message: formData.message || `Looking for a singing group in ${formData.location}. Experience: ${formData.experience}, Commitment: ${formData.commitment}, Genres: ${selectedGenres.join(", ")}`,
          details,
        }),
      });

      if (!inquiryResponse.ok) {
        throw new Error("Failed to create inquiry");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-heading text-xl font-semibold mb-2">
          Request Submitted!
        </h3>
        <p className="text-muted-foreground mb-4">
          Thank you for reaching out. We&apos;ll review your preferences and get
          back to you within 1-2 weeks with potential matches.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              location: "",
              age: "",
              experience: "",
              commitment: "",
              performanceInterest: false,
              message: "",
            });
            setSelectedGenres([]);
          }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="City, State/Country"
            required
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="Optional"
            min="10"
            max="100"
            value={formData.age}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, age: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience Level *</Label>
        <Select
          required
          value={formData.experience}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, experience: value }))
          }
        >
          <SelectTrigger id="experience">
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            {experienceLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="commitment">Time Commitment *</Label>
        <Select
          required
          value={formData.commitment}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, commitment: value }))
          }
        >
          <SelectTrigger id="commitment">
            <SelectValue placeholder="How often can you rehearse?" />
          </SelectTrigger>
          <SelectContent>
            {commitmentLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Preferred Genres (select all that apply)</Label>
        <div className="flex flex-wrap gap-2 pt-1">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreToggle(genre)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selectedGenres.includes(genre)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-input"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="performance"
          checked={formData.performanceInterest}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              performanceInterest: checked === true,
            }))
          }
        />
        <Label htmlFor="performance" className="text-sm font-normal">
          I&apos;m interested in performing publicly
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Tell Us More</Label>
        <Textarea
          id="message"
          placeholder="Share any additional details about what you're looking for, your vocal range, previous experience, etc."
          rows={4}
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Find My Group
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to be contacted about singing group
        opportunities. We respect your privacy and never share your information.
      </p>
    </form>
  );
}
