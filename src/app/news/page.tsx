"use client";

import { Cormorant_Garamond } from "next/font/google";
import { useState } from "react";
import { motion } from "framer-motion";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const pillars = [
  {
    num: "01",
    title: "The Story",
    body: "Behind-the-scenes moments from Pitch Perfect sets, Carnegie Hall stages, and rehearsal rooms around the world. The kind of stories Deke only tells in person… until now.",
  },
  {
    num: "02",
    title: "The Craft",
    body: "Arranging techniques, rehearsal strategies, and performance insights from 35 years of coaching groups from college basements to Broadway. Specific enough to use at your next rehearsal.",
  },
  {
    num: "03",
    title: "The Community",
    body: "Group spotlights, arrangement breakdowns, reader questions, and what Deke's listening to right now. A cappella doesn't happen alone.",
  },
];

const credentials = [
  { title: "Music Director", sub: "Pitch Perfect 1, 2, 3 & Bumper in Berlin" },
  { title: "Vocal Producer", sub: "NBC's The Sing-Off — 5 seasons" },
  { title: "Author", sub: "7 books on a cappella" },
  { title: "Arranger", sub: "2,500+ arrangements performed worldwide" },
  { title: "Founder", sub: "CASA · ICCA · BOCA · CARAs" },
  {
    title: "Stage",
    sub: "Carnegie Hall · Broadway · Ray Charles · Pavarotti · James Brown",
  },
];

const previews = [
  {
    issue: "Issue #1",
    subject: "Why I'm Writing This After 35 Years",
    teaser:
      "The question I keep getting asked backstage, and the answer I've been working up to.",
  },
  {
    issue: "Issue #3",
    subject: "The Night Ray Charles Heard Us Sing",
    teaser:
      "A story about what happens when a legend stops to listen — and what he said afterward.",
  },
  {
    issue: "Issue #5",
    subject: "What I Learned Producing The Sing-Off Across 4 Countries",
    teaser:
      "Four countries, different cultures, same human impulse to sing together. Here's what that taught me.",
  },
];

function SignupForm({ size = "md" }: { size?: "md" | "lg" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to mailing list API
    setStatus("success");
  };

  if (status === "success") {
    return (
      <p className="text-[#C9943A] font-medium text-sm tracking-wide">
        ✓ You&apos;re on the list. First issue coming soon.
      </p>
    );
  }

  const inputClass =
    size === "lg"
      ? "h-14 px-6 text-base w-72 sm:w-80"
      : "h-12 px-5 text-sm w-64 sm:w-72";

  const btnClass =
    size === "lg" ? "h-14 px-8 text-base" : "h-12 px-6 text-sm";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex">
        <input
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} bg-[#141C26] text-white placeholder:text-[#3A4A5A] outline-none focus:ring-1 focus:ring-[#C9943A]/40`}
        />
        <button
          type="submit"
          className={`${btnClass} bg-[#C9943A] text-[#0D1117] font-semibold whitespace-nowrap hover:bg-[#D4A84A] transition-colors`}
        >
          Join the Arrangement
        </button>
      </div>
      <p className="text-xs text-[#4A5A6A] leading-relaxed max-w-md">
        Join 3,400+ singers, directors, and arrangers. One email per month.
        Unsubscribe anytime.
      </p>
    </form>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-px bg-[#C9943A]" />
      <span className="text-[11px] font-medium tracking-[0.15em] text-[#C9943A] uppercase">
        {text}
      </span>
    </div>
  );
}

export default function NewsPage() {
  return (
    <div
      className={`${cormorant.variable} bg-[#0D1117] text-white min-h-screen`}
    >
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Text */}
          <motion.div
            className="flex-1 max-w-xl"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <div className="inline-flex items-center gap-2.5 bg-[#C9943A]/10 px-3.5 py-1.5 rounded-sm">
                <span className="w-5 h-px bg-[#C9943A]" />
                <span className="text-[11px] font-medium tracking-[0.15em] text-[#C9943A] uppercase">
                  A Monthly Letter from Deke Sharon
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-[family-name:var(--font-cormorant)] text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.08] text-white mb-6"
            >
              One voice started it all. This newsletter continues the
              conversation.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-[#9BA8B8] text-lg leading-relaxed mb-8 max-w-lg"
            >
              The Arrangement — a monthly letter from Deke Sharon on the craft,
              stories, and future of a cappella.
            </motion.p>

            <motion.div variants={fadeUp}>
              <SignupForm size="md" />
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            className="flex-shrink-0 w-full lg:w-[480px] xl:w-[520px] h-[420px] lg:h-[600px] relative overflow-hidden rounded-sm"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/deke/deke2-photographer-Nikki-Davis-Jones.jpg"
              alt="Deke Sharon"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/images/deke/deke_hi.jpg";
              }}
            />
            {/* Bottom fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ── WHAT YOU'LL GET ──────────────────────────────────── */}
      <section className="bg-[#080C12] py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel text="What you'll receive" />
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl lg:text-5xl font-semibold leading-[1.1] text-white mt-4">
              Every month, straight to your inbox:
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1E2A38]/40">
            {pillars.map((p, i) => (
              <motion.div
                key={p.num}
                className="bg-[#0F151E] p-10 flex flex-col gap-5 border-t-2 border-[#C9943A]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium tracking-[0.15em] text-[#C9943A]">
                    {p.num}
                  </span>
                  <span className="w-8 h-px bg-[#C9943A]/20" />
                </div>
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-white leading-tight">
                  {p.title}
                </h3>
                <p className="text-[#7A8A9A] text-[15px] leading-[1.75]">
                  {p.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREDIBILITY ──────────────────────────────────────── */}
      <section className="bg-[#0D1117] py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 flex flex-col lg:flex-row gap-16 lg:gap-20 items-start">
          {/* Left */}
          <motion.div
            className="flex-1 max-w-lg"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel text="About Deke Sharon" />
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl lg:text-5xl font-semibold leading-[1.1] text-white mt-4 mb-10">
              From the person behind the music you already know.
            </h2>

            <blockquote className="bg-[#141C26] border border-[#C9943A]/20 p-7 mb-6">
              <p className="font-[family-name:var(--font-cormorant)] text-xl text-white leading-snug mb-3">
                &ldquo;Deke Sharon makes a cappella cool again.&rdquo;
              </p>
              <cite className="text-[#C9943A] text-xs font-medium tracking-wider not-italic">
                — NPR
              </cite>
            </blockquote>

            <blockquote className="pl-4 border-l border-[#C9943A]/30">
              <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#7A8A9A] leading-snug mb-2">
                &ldquo;The father of contemporary a cappella.&rdquo;
              </p>
              <cite className="text-[#4A5A6A] text-xs font-medium tracking-wider not-italic">
                — Entertainment Weekly
              </cite>
            </blockquote>
          </motion.div>

          {/* Right — credentials */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {credentials.map((c, i) => (
              <div
                key={c.title}
                className="flex items-center gap-5 py-5 border-b border-[#1E2A38]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9943A] flex-shrink-0" />
                <div>
                  <p className="text-white text-[13px] font-semibold leading-tight">
                    {c.title}
                  </p>
                  <p className="text-[#5A6878] text-[12px] mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PREVIEW ──────────────────────────────────────────── */}
      <section className="bg-[#080C12] py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel text="Inside the newsletter" />
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl lg:text-5xl font-semibold leading-[1.1] text-white mt-4">
              Here&apos;s what an issue looks like:
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1E2A38]/30">
            {previews.map((p, i) => (
              <motion.div
                key={p.issue}
                className="bg-[#0D1117] p-7 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="text-[10px] font-medium tracking-[0.15em] text-[#C9943A] uppercase">
                  {p.issue}
                </span>
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-white leading-snug">
                  {p.subject}
                </h3>
                <p className="text-[#5A6878] text-[13px] leading-relaxed">
                  {p.teaser}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="bg-[#0A0E15] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 flex flex-col items-center text-center">
          <motion.div
            className="flex items-center gap-4 mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="w-20 h-px bg-[#C9943A]/30" />
            <span className="text-[#C9943A]/60 text-lg">♪</span>
            <span className="w-20 h-px bg-[#C9943A]/30" />
          </motion.div>

          <motion.h2
            className="font-[family-name:var(--font-cormorant)] text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-[1.08] mb-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to hear the note?
          </motion.h2>

          <motion.p
            className="text-[#7A8A9A] text-lg mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Free. Monthly. No spam. Just Deke.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SignupForm size="lg" />
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER BAR ───────────────────────────────────────── */}
      <div className="bg-[#070A0F] border-t border-[#1E2A38] py-6">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-[family-name:var(--font-cormorant)] text-base font-semibold text-white">
              The Arrangement
            </span>
            <span className="text-[#3A4A5A] text-sm ml-2">by Deke Sharon</span>
          </div>
          <div className="flex items-center gap-8 text-xs text-[#3A4A5A]">
            <a href="/privacy" className="hover:text-[#7A8A9A] transition-colors">
              Privacy
            </a>
            <span>Unsubscribe anytime</span>
            <a
              href="/"
              className="text-[#C9943A] hover:text-[#D4A84A] transition-colors"
            >
              dekesharon.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
