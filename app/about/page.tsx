import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  Sparkles,
  BrainCircuit,
  Rocket,
  GraduationCap,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#050816] text-white">

        {/* ===================================================== */}
        {/* HERO */}
        {/* ===================================================== */}

        <section className="relative min-h-screen flex items-center">

          {/* Background */}

          <div className="absolute inset-0">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb30,transparent_35%)]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#06b6d430,transparent_35%)]" />

            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#050816,#0f172a)]" />

          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-20 px-6 lg:grid-cols-2">

            {/* LEFT */}

            <div>

              <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2">

                <Sparkles size={18} className="text-cyan-400" />

                <span className="text-sm font-semibold tracking-wide text-blue-200">
                  ABOUT TECHSKILL HUB
                </span>

              </div>

              <h1 className="mt-10 text-6xl font-black leading-[1.05] lg:text-8xl">

                The Future
                <br />

                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">

                  Doesn't Wait.

                </span>

              </h1>

              <p className="mt-10 max-w-2xl text-xl leading-9 text-slate-300">

                Traditional education wasn't designed for the AI era.

                TechSkill Hub is building India's next-generation learning
                ecosystem where students master technology through practical
                projects, expert mentorship and AI-powered learning.

              </p>

              <div className="mt-14 flex flex-wrap gap-5">

                <Link
                  href="/programs"
                  className="rounded-2xl bg-white px-8 py-5 font-semibold text-slate-900 transition hover:scale-105"
                >
                  Explore Programs
                </Link>

                <Link
                  href="/consultation"
                  className="rounded-2xl border border-white/15 px-8 py-5 font-semibold transition hover:bg-white/10"
                >
                  Book Consultation
                </Link>

              </div>

            </div>

            {/* RIGHT */}

            <div className="relative">

              <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

                <div className="space-y-10">

                  <div className="flex gap-6">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">

                      <BrainCircuit />

                    </div>

                    <div>

                      <h3 className="text-2xl font-bold">

                        AI Integrated Learning

                      </h3>

                      <p className="mt-3 text-slate-300 leading-8">

                        Learn modern AI tools alongside practical technical
                        skills from day one.

                      </p>

                    </div>

                  </div>

                  <div className="flex gap-6">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600">

                      <Rocket />

                    </div>

                    <div>

                      <h3 className="text-2xl font-bold">

                        Career Acceleration

                      </h3>

                      <p className="mt-3 text-slate-300 leading-8">

                        Industry mentors, portfolio development and interview
                        preparation built into every program.

                      </p>

                    </div>

                  </div>

                  <div className="flex gap-6">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500">

                      <GraduationCap />

                    </div>

                    <div>

                      <h3 className="text-2xl font-bold">

                        Practical First

                      </h3>

                      <p className="mt-3 text-slate-300 leading-8">

                        Real projects replace passive learning so you graduate
                        with experience—not just certificates.

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>



        {/* ===================================================== */}
        {/* STORY */}
        {/* ===================================================== */}

        <section className="bg-white py-36 text-slate-900">

          <div className="mx-auto max-w-7xl px-6">

            <div className="grid gap-20 lg:grid-cols-2">

              <div>

                <p className="font-bold tracking-[0.3em] text-blue-600 uppercase">

                  OUR STORY

                </p>

                <h2 className="mt-8 text-6xl font-black leading-tight">

                  Education Was Built
                  <br />

                  For Yesterday.

                </h2>

                <p className="mt-10 text-xl leading-9 text-slate-600">

                  Degrees alone are no longer enough.

                  Companies hire people who can solve problems, build products,
                  collaborate with AI and adapt quickly.

                </p>

                <p className="mt-8 text-xl leading-9 text-slate-600">

                  That's why TechSkill Hub was created—to bridge the gap between
                  education and industry through an ecosystem that combines
                  technology, mentorship and real-world experience.

                </p>

              </div>

              <div className="space-y-8">

                {[
                  "Traditional Learning",
                  "Theory Heavy",
                  "Limited Industry Exposure",
                  "Low Practical Experience",
                  "Career Uncertainty",
                  "TechSkill Hub Transformation",
                ].map((step, index) => (

                  <div
                    key={step}
                    className={`rounded-3xl p-8 ${
                      index === 5
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                        : "border border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">

                      <h3 className="text-2xl font-bold">

                        {step}

                      </h3>

                      <ArrowRight />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>
        {/* ===================================================== */}
{/* THE SHIFT */}
{/* ===================================================== */}

<section className="relative overflow-hidden bg-[#050816] py-40 text-white">

<div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
<div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />

<div className="relative mx-auto max-w-7xl px-6">

  <div className="max-w-4xl">

    <span className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
      THE SHIFT
    </span>

    <h2 className="mt-8 text-6xl font-black leading-[1.05] lg:text-7xl">
      AI Changed
      <br />
      Everything.
    </h2>

    <p className="mt-10 max-w-3xl text-2xl leading-10 text-slate-300">
      The world no longer rewards people who simply know information.
      It rewards people who can think, build, communicate and work
      alongside AI.
    </p>

  </div>

  <div className="mt-24 grid gap-6 lg:grid-cols-12">

    <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur lg:col-span-7">

      <span className="text-blue-400 text-sm font-semibold">
        OLD EDUCATION
      </span>

      <h3 className="mt-5 text-4xl font-black">
        Memorise.
        <br />
        Write Exams.
        <br />
        Forget.
      </h3>

      <p className="mt-8 text-lg leading-9 text-slate-400">
        Traditional education was designed for a completely different era.
        Students often graduate with knowledge but without practical
        experience, industry exposure or confidence.
      </p>

    </div>

    <div className="rounded-[32px] bg-gradient-to-br from-blue-600 to-cyan-500 p-10 lg:col-span-5">

      <span className="text-blue-100 text-sm font-semibold">
        TECHSKILL HUB
      </span>

      <h3 className="mt-5 text-4xl font-black">
        Learn.
        <br />
        Build.
        <br />
        Launch.
      </h3>

      <p className="mt-8 text-lg leading-9 text-blue-100">
        Every learner builds real products, masters AI workflows and
        develops a portfolio that demonstrates capability—not just
        completion.
      </p>

    </div>

  </div>

</div>

</section>

{/* ===================================================== */}
{/* BENTO GRID */}
{/* ===================================================== */}

<section className="bg-white py-40">

<div className="mx-auto max-w-7xl px-6">

  <div className="text-center">

    <span className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold">
      THE TECHSKILL HUB ECOSYSTEM
    </span>

    <h2 className="mt-8 text-6xl font-black text-slate-900">
      Everything Works
      <br />
      Together.
    </h2>

  </div>

  <div className="mt-24 grid auto-rows-[250px] gap-6 lg:grid-cols-4">

    <div className="rounded-[32px] bg-slate-950 p-10 text-white lg:col-span-2">

      <h3 className="text-4xl font-black">
        AI
        <br />
        Integrated.
      </h3>

      <p className="mt-6 text-slate-400 leading-8">
        Learn ChatGPT, Claude, Gemini, automation workflows and practical AI usage.
      </p>

    </div>

    <div className="rounded-[32px] border p-10">

      <h3 className="text-3xl font-bold">
        Live Mentors
      </h3>

      <p className="mt-5 text-slate-600">
        Weekly guidance from industry experts.
      </p>

    </div>

    <div className="rounded-[32px] border p-10">

      <h3 className="text-3xl font-bold">
        Portfolio
      </h3>

      <p className="mt-5 text-slate-600">
        Build projects employers actually want to see.
      </p>

    </div>

    <div className="rounded-[32px] border p-10 lg:col-span-2">

      <h3 className="text-4xl font-black">
        Career
        <br />
        Accelerator
      </h3>

      <p className="mt-6 text-slate-600 leading-8">
        Resume reviews, LinkedIn optimisation, interview preparation,
        freelancing guidance and career mentorship.
      </p>

    </div>

    <div className="rounded-[32px] bg-gradient-to-br from-blue-600 to-cyan-500 p-10 text-white">

      <h3 className="text-3xl font-bold">
        Community
      </h3>

      <p className="mt-5 text-blue-100">
        Learn alongside ambitious students across India.
      </p>

    </div>

    <div className="rounded-[32px] border p-10">

      <h3 className="text-3xl font-bold">
        Projects
      </h3>

      <p className="mt-5 text-slate-600">
        Real-world applications from day one.
      </p>

    </div>

  </div>

</div>

</section>
        {/* ===================================================== */}
        {/* THE JOURNEY */}
        {/* ===================================================== */}

        <section className="relative bg-[#050816] py-40 overflow-hidden text-white">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15),transparent_55%)]" />

          <div className="relative mx-auto max-w-7xl px-6">

            <div className="text-center max-w-4xl mx-auto">

              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">
                THE JOURNEY
              </span>

              <h2 className="mt-8 text-6xl lg:text-7xl font-black leading-tight">
                From
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
                  Curious Learner
                </span>
                To Industry Ready
              </h2>

            </div>

            <div className="mt-24 grid gap-8 lg:grid-cols-5">

              {[
                ["01","Discover","Choose your career path with expert guidance."],
                ["02","Learn","Attend live mentor-led sessions."],
                ["03","Build","Create real-world projects and portfolios."],
                ["04","Launch","Prepare for jobs, freelancing or startups."],
                ["05","Grow","Keep learning with our lifelong community."]
              ].map(([no,title,text])=>(
                <div
                  key={no}
                  className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-blue-500 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="text-6xl font-black text-blue-500/30">
                    {no}
                  </div>

                  <h3 className="mt-6 text-2xl font-bold">
                    {title}
                  </h3>

                  <p className="mt-5 leading-8 text-slate-300">
                    {text}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>



        {/* ===================================================== */}
        {/* FOUNDER MANIFESTO */}
        {/* ===================================================== */}

        <section className="bg-white py-40">

          <div className="mx-auto max-w-5xl px-6 text-center">

            <span className="uppercase tracking-[0.35em] text-blue-600 font-semibold">
              OUR MANIFESTO
            </span>

            <h2 className="mt-10 text-6xl lg:text-7xl font-black leading-tight text-slate-900">

              We Don't Want To Build
              <br />

              Another EdTech Company.

            </h2>

            <div className="mx-auto mt-12 h-1 w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />

            <p className="mx-auto mt-12 max-w-4xl text-2xl leading-10 text-slate-600">

              We're building the place where India's future software
              engineers, AI professionals, designers, analysts,
              marketers and entrepreneurs begin their journey.

            </p>

            <p className="mx-auto mt-10 max-w-3xl text-xl leading-9 text-slate-500">

              Technology will continue to evolve. Our responsibility is to
              help learners evolve with it.

            </p>

          </div>

        </section>



        {/* ===================================================== */}
        {/* FUTURE VISION */}
        {/* ===================================================== */}

        <section className="bg-slate-100 py-36">

          <div className="mx-auto max-w-7xl px-6">

            <div className="text-center">

              <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold shadow">
                OUR FUTURE
              </span>

              <h2 className="mt-8 text-6xl font-black text-slate-900">

                Building For
                <br />
                The Next Decade

              </h2>

            </div>

            <div className="mt-24 grid lg:grid-cols-4 gap-8">

              {[
                ["2026","Launch","Building the foundation."],
                ["2027","Growing","Expanding programs & mentors."],
                ["2028","Community","Connecting learners nationwide."],
                ["2030","Vision","A leading AI-focused career platform."]
              ].map(([year,title,text])=>(
                <div
                  key={year}
                  className="rounded-[32px] bg-white p-10 shadow-lg hover:shadow-2xl transition duration-500"
                >
                  <p className="text-blue-600 font-bold">
                    {year}
                  </p>

                  <h3 className="mt-4 text-3xl font-black text-slate-900">
                    {title}
                  </h3>

                  <p className="mt-5 leading-8 text-slate-600">
                    {text}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>



        {/* ===================================================== */}
        {/* FINAL CTA */}
        {/* ===================================================== */}

        <section className="relative bg-black py-40 overflow-hidden text-white">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.25),transparent_55%)]" />

          <div className="relative mx-auto max-w-5xl px-6 text-center">

            <span className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold">
              READY TO BEGIN?
            </span>

            <h2 className="mt-10 text-6xl lg:text-8xl font-black leading-[0.95]">

              Your Future
              <br />

              Starts Here.

            </h2>

            <p className="mx-auto mt-10 max-w-3xl text-xl leading-9 text-slate-400">

              Join TechSkill Hub and build practical skills, confidence,
              and real-world experience through AI-powered education,
              expert mentorship and industry-focused programs.

            </p>

            <div className="mt-14 flex flex-wrap justify-center gap-6">

              <Link
                href="/consultation"
                className="rounded-2xl bg-white px-10 py-5 text-lg font-bold text-slate-900 transition hover:scale-105"
              >
                Book Free Consultation
              </Link>

              <Link
                href="/programs"
                className="rounded-2xl border border-white/20 px-10 py-5 text-lg font-semibold hover:bg-white/10 transition"
              >
                Explore Programs
              </Link>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}