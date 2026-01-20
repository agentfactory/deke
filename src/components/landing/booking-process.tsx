"use client";

import { motion } from "framer-motion";
import { Check, Lightbulb } from "lucide-react";

const steps = [
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
];

export function BookingProcessSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-white">
      <div className="container px-4 md:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Lightbulb className="h-4 w-4" />
            Process
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How to Work With Deke
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple three-step process from vision to creation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-accent via-accent/50 to-accent" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-accent text-accent-foreground text-xl md:text-2xl font-bold shadow-lg z-10 relative">
                    {step.step}
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-accent/30 blur-xl" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-xl md:text-2xl font-bold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  {step.description}
                </p>

                {/* Items */}
                <ul className="text-sm text-muted-foreground text-left space-y-2 w-full max-w-xs">
                  {step.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
