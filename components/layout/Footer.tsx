"use client";

import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

const PROGRAMS = [
  { name: "GrowthX", href: "/courses" },
  { name: "CodeForge", href: "/courses" },
  { name: "DesignSphere", href: "/courses" },
  { name: "InsightIQ", href: "/courses" },
];

const COMPANY = [
  { name: "About", href: "/about" },
  { name: "Founders", href: "/about#founders" },
  { name: "Projects", href: "/projects" },
  { name: "Curriculum", href: "/curriculum" },
  { name: "Contact", href: "/contact" },
];

const LEGAL = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Refund Policy", href: "/refund-policy" },
];

export function Footer() {
  return (
    <footer className="border-t bg-background">

      {/* CTA */}

      <section className="border-b">
        <Container className="py-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary to-primary/90 px-8 py-16 text-center text-primary-foreground shadow-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground/70">
              Ready To Build Your Future?
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              Learn. Build. Get Hired.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-foreground/80">
              Join TechSkill Hub and build real-world skills through live
              mentorship, AI-powered learning and industry projects.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/contact" />}
                className="bg-white text-primary hover:bg-white/90"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="secondary"
                nativeButton={false}
                render={<Link href="/courses" />}
              >
                Explore Programs
              </Button>

            </div>

          </div>
        </Container>
      </section>

      {/* Main Footer */}

      <Container className="py-20">

        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand */}

          <div>

            <h3 className="text-3xl font-bold">
              TechSkill Hub
            </h3>

            <p className="mt-5 max-w-md leading-7 text-muted-foreground">
              India's AI-powered career accelerator helping students build
              practical skills through mentorship, live learning and real
              industry projects.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="#"
                className="rounded-full border px-4 py-2 text-sm transition hover:bg-primary hover:text-primary-foreground"
              >
                LinkedIn
              </Link>

              <Link
                href="#"
                className="rounded-full border px-4 py-2 text-sm transition hover:bg-primary hover:text-primary-foreground"
              >
                Instagram
              </Link>

              <Link
                href="#"
                className="rounded-full border px-4 py-2 text-sm transition hover:bg-primary hover:text-primary-foreground"
              >
                YouTube
              </Link>

              <Link
                href="#"
                className="rounded-full border px-4 py-2 text-sm transition hover:bg-primary hover:text-primary-foreground"
              >
                GitHub
              </Link>

            </div>

          </div>

          {/* Programs */}

          <div>

            <h4 className="mb-5 font-semibold">
              Programs
            </h4>

            <ul className="space-y-3">

              {PROGRAMS.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Company */}

          <div>

            <h4 className="mb-5 font-semibold">
              Company
            </h4>

            <ul className="space-y-3">

              {COMPANY.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h4 className="mb-5 font-semibold">
              Contact
            </h4>

            <div className="space-y-5 text-muted-foreground">

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span>hello@techskillhub.in</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>+91 XXXXX XXXXX</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <span>India</span>
              </div>

            </div>

          </div>

        </div>

      </Container>

      {/* Bottom */}

      <div className="border-t">

        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-sm text-muted-foreground md:flex-row">

          <p>
            © {new Date().getFullYear()} TechSkill Hub. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-6">

            {LEGAL.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-primary"
              >
                {item.name}
              </Link>
            ))}

          </div>

        </Container>

      </div>

    </footer>
  );
}