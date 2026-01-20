"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is your availability for workshops and events?",
    answer:
      "Deke works globally throughout the year. For best availability, book 3-6 months in advance for major events. Rush projects may be accommodated based on schedule.",
  },
  {
    question: "What's included in a workshop day?",
    answer:
      "Workshop days include up to 8 hours of instruction, travel time prep, custom content tailoring, and follow-up materials. Multi-day residencies are available. Contact us for a custom quote.",
  },
  {
    question: "Can you work with groups of any skill level?",
    answer:
      "Absolutely. From beginners to Grammy-winning professionals, Deke tailors every engagement to your group's level and goals.",
  },
  {
    question: "How long does a custom arrangement take?",
    answer:
      "Most arrangements are completed within 1 week. Rush delivery available for additional fee.",
  },
  {
    question: "Do you offer virtual coaching/workshops?",
    answer:
      "Yes! Virtual masterclasses and coaching via Zoom/Skype available worldwide.",
  },
  {
    question: "What's required to book you for a TV/Film project?",
    answer:
      "Contact via inquiry form with project overview. Deke works directly with producers, music supervisors, and production companies on negotiated contracts.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border/50 rounded-xl px-4 md:px-6 data-[state=open]:border-accent/30 data-[state=open]:shadow-soft transition-all"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline py-4 md:py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 md:pb-5 text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
