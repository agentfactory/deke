"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu, Music2, Sparkles, ArrowRight } from "lucide-react";

const navItems = [
  { label: "Arrangements", href: "/arrangements" },
  { label: "Coaching", href: "/coaching" },
  { label: "Workshops", href: "/workshops" },
  { label: "Speaking", href: "/speaking" },
  { label: "About", href: "/about" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-18 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
            <Music2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Deke Sharon
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              A Cappella Magic
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-1">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/contact">Contact</Link>
          </Button>
          <Button asChild className="group">
            <Link href="/booking">
              <Sparkles className="mr-2 h-4 w-4" />
              Book Now
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-0">
            <div className="flex flex-col gap-8 py-6">
              {/* Mobile Logo */}
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-md">
                    <Music2 className="h-6 w-6" />
                  </div>
                  <span className="font-heading text-2xl font-bold">
                    Deke Sharon
                  </span>
                </Link>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-4 rounded-xl hover:bg-primary/5"
                    onClick={() => setIsOpen(false)}
                  >
                    <ArrowRight className="h-4 w-4 text-primary/50" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile CTAs */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button variant="outline" asChild className="w-full justify-center">
                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                </Button>
                <Button asChild className="w-full justify-center">
                  <Link href="/booking" onClick={() => setIsOpen(false)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Book Now
                  </Link>
                </Button>
              </div>

              {/* Fun tagline */}
              <div className="mt-auto pt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Let's make harmony together
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
