import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HarmonyWidget } from "@/components/chat/harmony-widget";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

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
      <body
        className={`${playfair.variable} ${sourceSans.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <HarmonyWidget />
      </body>
    </html>
  );
}
