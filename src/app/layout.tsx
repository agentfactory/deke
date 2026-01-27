import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HarmonyWidget } from "@/components/chat/harmony-widget";

export const metadata: Metadata = {
  title: {
    default: "Deke Sharon | The Father of Contemporary A Cappella",
    template: "%s | Deke Sharon",
  },
  description:
    "World-renowned vocal coach, arranger, and the father of contemporary a cappella. Custom arrangements, coaching, workshops, and masterclasses for vocal groups worldwide.",
  keywords: [
    "a cappella",
    "vocal coach",
    "music arranger",
    "Deke Sharon",
    "vocal group",
    "singing",
    "Pitch Perfect",
    "The Sing-Off",
  ],
  authors: [{ name: "Deke Sharon" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Deke Sharon",
    title: "Deke Sharon | The Father of Contemporary A Cappella",
    description:
      "World-renowned vocal coach, arranger, and the father of contemporary a cappella.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deke Sharon | The Father of Contemporary A Cappella",
    description:
      "World-renowned vocal coach, arranger, and the father of contemporary a cappella.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Inter and DM Sans from Google Fonts CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
        <Footer />
        <HarmonyWidget />
      </body>
    </html>
  );
}
