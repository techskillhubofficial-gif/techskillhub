"use client";

import Image from "next/image";
import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/logo/logo-full.png"
              alt="TechSkill Hub"
              width={220}
              height={60}
              priority
            />

            <p className="mt-6 max-w-md leading-7 text-slate-400">
              Building India's Future Workforce through AI-powered learning,
              live mentorship, real-world projects, and industry-focused career
              programs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-slate-400">
              <li>Home</li>
              <li>Courses</li>
              <li>Corporate Training</li>
              <li>About</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="space-y-3 text-slate-400">
              <p>📍 Ahmedabad, Gujarat</p>
              <p>📞 +91 XXXXX XXXXX</p>
              <p>✉️ hello@techskillhub.in</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          © 2026 TechSkill Hub. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
}