"use client";

import { motion } from "framer-motion";
import { Award, Trophy, Star, Music, Film, Radio, Users } from "lucide-react";

const credentials = [
  { icon: Award, label: "Grammy Nominated" },
  { icon: Trophy, label: "Billboard #1" },
  { icon: Star, label: "35+ Years Pioneer" },
  { icon: Music, label: "2,500+ Arrangements" },
  { icon: Film, label: "Pitch Perfect Trilogy" },
  { icon: Radio, label: "Broadway's First" },
  { icon: Users, label: "Carnegie Hall Director" },
];

export function CredentialsBar() {
  return (
    <section className="py-10 md:py-14 bg-white border-y border-border/50" aria-label="Credentials and achievements">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8 items-center justify-items-center"
        >
          {credentials.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center group cursor-default"
            >
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-accent/10 text-accent mx-auto mb-2 md:mb-3 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <item.icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
              </div>
              <p className="font-semibold text-xs md:text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
