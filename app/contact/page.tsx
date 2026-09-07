import {
  Mail,
  Phone,
  Globe,
  Clock,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-24">

        {/* Header */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            CONTACT US
          </span>

          <h1 className="mt-6 text-5xl font-bold text-slate-900 md:text-6xl">
            Let's Build Your Future Together
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Whether you're a student, professional, entrepreneur or business
            owner, our advisors are here to help you choose the right learning
            path and achieve your career goals.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {/* Email */}

          <div className="rounded-3xl border bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-2xl font-semibold">
              Email Us
            </h3>

            <p className="mt-2 text-slate-600">
              For admissions, partnerships and general enquiries.
            </p>

            <a
              href="mailto:techskillhubofficial@gmail.com"
              className="mt-5 block text-lg font-semibold text-primary hover:underline"
            >
              techskillhubofficial@gmail.com
            </a>

          </div>

          {/* Phone */}

          <div className="rounded-3xl border bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Phone className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-2xl font-semibold">
              Admissions & Enquiries
            </h3>

            <p className="mt-2 text-slate-600">
              Speak directly with our advisors.
            </p>

            <a
              href="tel:+918769951887"
              className="mt-5 block text-lg font-semibold text-primary hover:underline"
            >
              +91 87699 51887
            </a>

            <a
              href="tel:+919528404249"
              className="mt-2 block text-lg font-semibold text-primary hover:underline"
            >
              +91 95284 04249
            </a>

          </div>

          {/* Availability */}

          <div className="rounded-3xl border bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Globe className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-2xl font-semibold">
              Availability
            </h3>

            <p className="mt-4 text-lg text-slate-700">
              Live Online Programs
            </p>

            <p className="mt-2 text-slate-600">
              Serving Students Across India
            </p>

          </div>

          {/* Working Hours */}

          <div className="rounded-3xl border bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Clock className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-2xl font-semibold">
              Working Hours
            </h3>

            <p className="mt-4 text-lg text-slate-700">
              Monday – Saturday
            </p>

            <p className="mt-2 text-slate-600">
              9:00 AM – 7:00 PM (IST)
            </p>

          </div>

        </div>

        {/* Instagram */}

        <div className="mt-20 rounded-3xl bg-primary p-10 text-center text-white">

          <h2 className="mt-5 text-3xl font-bold">
            Follow TechSkill Hub
          </h2>

          <p className="mt-4 text-white/80">
            Stay updated with workshops, success stories, AI tips,
            student projects and career opportunities.
          </p>

          <a
            href="https://www.instagram.com/techskillhub.india/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-primary transition hover:scale-105"
          >
            Follow on Instagram
          </a>

        </div>

      </div>
    </main>
  );
}