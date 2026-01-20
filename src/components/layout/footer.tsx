import Link from "next/link";
import { Music2, Mail, MapPin, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const footerLinks = {
  services: [
    { label: "Custom Arrangements", href: "/arrangements" },
    { label: "Group Coaching", href: "/coaching" },
    { label: "Workshops & Clinics", href: "/workshops" },
    { label: "Speaking Engagements", href: "/speaking" },
    { label: "Album Production", href: "/masterclass" },
  ],
  resources: [
    { label: "Find a Group", href: "/find-group" },
    { label: "Free Resources", href: "/resources" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ],
  connect: [
    { label: "About Deke", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Press Kit", href: "/press" },
    { label: "Testimonials", href: "/testimonials" },
  ],
};

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com/dekesharon", icon: "𝕏" },
  { label: "Instagram", href: "https://instagram.com/dekesharon", icon: "📸" },
  { label: "YouTube", href: "https://youtube.com/dekesharon", icon: "▶️" },
  { label: "LinkedIn", href: "https://linkedin.com/in/dekesharon", icon: "in" },
];

export function Footer() {
  return (
    <footer className="bg-gradient-hero text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 py-16 md:py-20">
        {/* Top CTA Section */}
        <div className="text-center mb-16 pb-16 border-b border-white/20">
          <h3 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Let's create something amazing together. First consultation is always free!
          </p>
          <Button variant="sunshine" size="lg" asChild className="group">
            <Link href="/booking">
              <Sparkles className="mr-2 h-4 w-4" />
              Book Free Consultation
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Music2 className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold">
                  Deke Sharon
                </span>
                <span className="text-sm text-white/70">
                  The Father of Contemporary A Cappella
                </span>
              </div>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-sm">
              Transforming voices and building harmony for over 30 years.
              Founder of the Contemporary A Cappella Society, vocal producer for
              Pitch Perfect, and creator of The Sing-Off.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 text-lg"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sunshine-yellow"></span>
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral-pop"></span>
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint-fresh"></span>
              Connect
            </h4>
            <ul className="space-y-3">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-3">
              <a
                href="mailto:info@dekesharon.com"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@dekesharon.com
              </a>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-white/20" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} Deke Sharon. Made with{" "}
            <Heart className="h-3 w-3 text-coral-pop fill-coral-pop" /> for a cappella.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
