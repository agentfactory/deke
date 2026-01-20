import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HarmonyWidget } from "@/components/chat/harmony-widget";

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const fredokaDisplay = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
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
        className={`${nunito.variable} ${fredoka.variable} ${fredokaDisplay.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <HarmonyWidget />
      </body>
    </html>
  );
}
