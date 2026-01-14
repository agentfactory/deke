import Link from "next/link";
import { Music, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  services: [
    { label: "Custom Arrangements", href: "/arrangements" },
    { label: "Group Coaching", href: "/coaching" },
    { label: "Workshops & Clinics", href: "/workshops" },
    { label: "Speaking Engagements", href: "/speaking" },
    { label: "Masterclass", href: "/masterclass" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "Sheet Music", href: "/sheet-music" },
    { label: "Video Tutorials", href: "/tutorials" },
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
  { label: "Instagram", href: "https://instagram.com/dekesharon", icon: "📷" },
  { label: "YouTube", href: "https://youtube.com/dekesharon", icon: "▶️" },
  { label: "LinkedIn", href: "https://linkedin.com/in/dekesharon", icon: "in" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground text-primary">
                <Music className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold">
                  Deke Sharon
                </span>
                <span className="text-sm text-primary-foreground/70">
                  The Father of Contemporary A Cappella
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6 max-w-sm">
              Transforming voices and building harmony for over 30 years.
              Founder of the Contemporary A Cappella Society, vocal producer for
              Pitch Perfect, and creator of The Sing-Off.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-sm"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Connect</h3>
            <ul className="space-y-3">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <a
                href="mailto:info@dekesharon.com"
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@dekesharon.com
              </a>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Deke Sharon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-primary-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
