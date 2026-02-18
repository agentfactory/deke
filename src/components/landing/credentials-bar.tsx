"use client";

import { motion } from "framer-motion";

const trustedLogos = [
  { name: "NBC", width: "w-12" },
  { name: "BBC", width: "w-12" },
  { name: "Disney", width: "w-14" },
  { name: "Universal", width: "w-16" },
  { name: "Amazon", width: "w-16" },
  { name: "Peacock", width: "w-16" },
  { name: "Lifetime", width: "w-16" },
  { name: "Sony", width: "w-12" },
  { name: "Atlantic Records", width: "w-20" },
  { name: "Warner Bros.", width: "w-20" },
  { name: "Hal Leonard", width: "w-20" },
];

export function CredentialsBar() {
  return (
    <section
      className="py-8 md:py-10 bg-white border-y border-border/50 overflow-hidden"
      aria-label="Trusted by leading brands"
    >
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-6"
        >
          Trusted By
        </motion.p>

        {/* Logo Banner - scrolling on mobile, grid on desktop */}
        <div className="relative">
          {/* Desktop: static grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {trustedLogos.map((logo, i) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-center"
              >
                <span className="text-sm font-semibold text-foreground/40 hover:text-foreground/70 transition-colors cursor-default tracking-wide whitespace-nowrap">
                  {logo.name}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile: horizontal scroll */}
          <div className="md:hidden overflow-hidden">
            <motion.div
              animate={{ x: [0, -1200] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
              className="flex items-center gap-8 w-max"
            >
              {[...trustedLogos, ...trustedLogos].map((logo, i) => (
                <span
                  key={`${logo.name}-${i}`}
                  className="text-sm font-semibold text-foreground/40 tracking-wide whitespace-nowrap"
                >
                  {logo.name}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
