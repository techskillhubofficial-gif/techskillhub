"use client";

import Link from "next/link";
import Image from "next/image";

import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
} from "react-icons/fi";

import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa";

import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black pt-20 text-white">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),transparent_40%)]" />

      {/* CTA */}

      <Container className="relative">

      <div className="relative mt-0 rounded-[32px] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-10 py-16 shadow-2xl">

          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">

            <div className="max-w-2xl">

              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold tracking-wide text-blue-50">
                🚀 Admissions Open 2026
              </span>

              <h2 className="mt-6 text-4xl font-black leading-tight lg:text-5xl">
                Start Your AI Career Journey Today
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">
                Learn from industry experts, build real-world projects,
                master AI tools, earn certifications and become
                future-ready with TechSkill Hub.
              </p>

            </div>

            <div className="flex flex-wrap gap-4">

              <Link
                href="/consultation"
                className="rounded-xl bg-white px-8 py-4 font-semibold text-blue-700 transition hover:scale-105"
              >
                Book Free Consultation
              </Link>

              <Link
                href="/programs"
                className="rounded-xl border border-white/40 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Explore Programs
              </Link>

            </div>

          </div>

        </div>

        {/* Main Footer */}

        <div className="grid gap-14 py-20 lg:grid-cols-12">

          {/* Brand */}

          <div className="lg:col-span-5">

          <Image
  src="/logo/Full-logo.png"
  alt="TechSkill Hub"
  width={240}
  height={70}
  priority
  style={{
    width: "220px",
    height: "auto",
  }}
/>
            <p className="mt-8 max-w-md text-[16px] leading-8 text-slate-400">
              TechSkill Hub is India's AI-powered career accelerator
              helping students, graduates, professionals and
              entrepreneurs build future-ready careers through live
              mentorship, practical learning, AI-powered education,
              real-world projects and industry-focused programs.
            </p>

            <div className="mt-10 flex items-center gap-4">

              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 transition hover:bg-blue-600"
              >
                <FaLinkedin size={18} />
              </a>

              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 transition hover:bg-pink-600"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 transition hover:bg-blue-700"
              >
                <FaFacebook size={18} />
              </a>

              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 transition hover:bg-red-600"
              >
                <FaYoutube size={18} />
              </a>

            </div>

          </div>

          {/* Programs */}

          <div className="lg:col-span-2">

            <h3 className="mb-6 text-lg font-bold">
              Programs
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li>
                <Link href="/programs/codeforge" className="hover:text-white">
                  CodeForge™
                </Link>
              </li>

              <li>
                <Link href="/programs/insightiq" className="hover:text-white">
                  InsightIQ™
                </Link>
              </li>

              <li>
                <Link href="/programs/designsphere" className="hover:text-white">
                  DesignSphere™
                </Link>
              </li>

              <li>
                <Link href="/programs/growthx" className="hover:text-white">
                  GrowthX™
                </Link>
              </li>

            </ul>

          </div>

          {/* Company */}

          <div className="lg:col-span-2">

            <h3 className="mb-6 text-lg font-bold">
              Company
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="/programs" className="hover:text-white">
                  Programs
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="/consultation" className="hover:text-white">
                  Book Consultation
                </Link>
              </li>

            </ul>

          </div>
                    {/* Contact */}

                    <div className="lg:col-span-3">

<h3 className="mb-6 text-lg font-bold">
  Contact
</h3>

<div className="space-y-6">

  <div className="flex items-start gap-4">

    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-blue-400">
      <FiMail size={18} />
    </div>

    <div>
      <h4 className="font-semibold text-white">
        Email
      </h4>

      <a
        href="mailto:techskillhubofficial@gmail.com"
        className="text-slate-400 transition hover:text-white"
      >
        techskillhubofficial@gmail.com
      </a>
    </div>

  </div>

  <div className="flex items-start gap-4">

    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-blue-400">
      <FiPhone size={18} />
    </div>

    <div>

      <h4 className="font-semibold text-white">
        Admissions & Enquiries
      </h4>

      <a
        href="tel:+918769951887"
        className="block text-slate-400 transition hover:text-white"
      >
        +91 87699 51887
      </a>

      <a
        href="tel:+919528404249"
        className="block text-slate-400 transition hover:text-white"
      >
        +91 95284 04249
      </a>

    </div>

  </div>

  <div className="flex items-start gap-4">

    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-blue-400">
      <FiMapPin size={18} />
    </div>

    <div>

      <h4 className="font-semibold text-white">
        Availability
      </h4>

      <p className="text-slate-400">
        Live Online Programs
      </p>

      <p className="text-slate-400">
        Serving Students Across India
      </p>

    </div>

  </div>

  <div className="flex items-start gap-4">

    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-blue-400">
      <FiClock size={18} />
    </div>

    <div>

      <h4 className="font-semibold text-white">
        Working Hours
      </h4>

      <p className="text-slate-400">
        Monday – Saturday
      </p>

      <p className="text-slate-400">
        9:00 AM – 7:00 PM (IST)
      </p>

    </div>

  </div>

</div>

</div>

</div>

{/* Bottom Bar */}

<div className="flex flex-col items-center justify-between gap-5 border-t border-slate-800 py-8 text-sm text-slate-500 md:flex-row">

<p>
© 2026 <span className="font-semibold text-white">TechSkill Hub</span>. All Rights Reserved.
</p>

<div className="flex flex-wrap items-center gap-6">

<Link
  href="/privacy-policy"
  className="transition hover:text-white"
>
  Privacy Policy
</Link>

<Link
  href="/terms"
  className="transition hover:text-white"
>
  Terms & Conditions
</Link>

<Link
  href="/refund-policy"
  className="transition hover:text-white"
>
  Refund Policy
</Link>

</div>

</div>

</Container>

</footer>
);
}