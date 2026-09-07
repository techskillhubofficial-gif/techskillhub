"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Brain,
  Building2,
  Code2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATS = [
  {
    value: "4",
    label: "Career Programs",
    icon: Users,
  },
  {
    value: "20+",
    label: "Professional Courses",
    icon: Building2,
  },
  {
    value: "100%",
    label: "Project-Based Learning",
    icon: Brain,
  },
];

const TRUST_BADGES = [
  "Live Industry Mentorship",
  "AI-Integrated Learning",
  "Real-World Projects",
  "Portfolio Development",
  "Career Guidance",
  "Internship Support",
  "Placement Assistance",
  "Industry Certifications",
];

const COURSES: {
  slug: string;
  title: string;
  description: string;
  progress: string;
  icon: LucideIcon;
  accent: string;
}[] = [

  {
    slug: "codeforge",
    title: "CodeForge™",
    description: "Software Engineering",
    progress: "React • Next.js • AI",
    icon: Code2,
    accent: "from-sky-500/15 to-indigo-500/10",
  },
  {
    slug: "insightiq",
    title: "InsightIQ™",
    description: "Data Analytics & GenAI",
    progress: "SQL • Power BI • Python",
    icon: BarChart3,
    accent: "from-violet-500/15 to-purple-500/10",
  },
  {
    slug: "designsphere",
    title: "DesignSphere™",
    description: "UI/UX & Creative Design",
    progress: "Figma • Adobe • AI",
    icon: BadgeCheck,
    accent: "from-pink-500/15 to-fuchsia-500/10",
  },
  {
    slug: "growthx",
    title: "GrowthX™",
    description: "Business Growth & Marketing",
    progress: "Digital Marketing • Sales • AI",
    icon: Users,
    accent: "from-green-500/15 to-emerald-500/10",
  },
];


const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

type HeroProps = {
  className?: string;
};

function CourseMockCard({
    slug,
    title,
    description,
    progress,
    icon: Icon,
    accent,
    delay,
    reduceMotion,
}: (typeof COURSES)[number] & { delay: number; reduceMotion: boolean }) {
  return (
    <motion.div variants={fadeUp} className="h-full">
      <motion.div
        className="h-full"
        animate={reduceMotion ? { y: 0 } : { y: [0, -8, 0] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }
        }
      >
        <Card
  size="sm"
  className={cn(
    "group h-full rounded-2xl border border-slate-200/60 bg-gradient-to-br shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-foreground/8",
    accent,
  )}

        >
          <CardHeader className="gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-background/80 shadow-sm ring-1 ring-foreground/10">
              <Icon className="size-4 text-foreground" aria-hidden="true" />
            </div>
            <CardTitle className="text-[0.95rem] leading-snug">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
  {description}
</CardDescription>

<div className="mt-4 flex items-center justify-between">
  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
    {progress}
  </span>

  <Link
    href={`/programs/${slug}`}
    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
>
    Explore →
</Link>
</div>
          </CardHeader>
          
          <CardContent className="flex items-center justify-between pt-4">
  <div className="h-px flex-1 bg-border" />

  <Link
    href={`/programs/${slug}`}
    className="ml-3 text-sm font-semibold text-slate-700 transition hover:text-blue-600"
>
    View Program →
</Link>
</CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function HeroDashboard({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/8 via-transparent to-muted/60 blur-2xl"
      />

<Card className="rounded-3xl bg-card/80 shadow-xl ring-1 ring-slate-200 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b px-5 py-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
          </div>

          <CardTitle className="text-sm font-medium text-muted-foreground">
          TechSkill Hub Platform
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-4">

  {/* Dashboard Summary */}
<div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        India's AI Career Platform
      </p>

      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Explore Our Flagship Career Programs
      </h3>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        Choose from four flagship career programs that combine AI-powered
        learning, live industry mentorship, real-world projects, portfolio
        development and career acceleration into one structured learning
        journey.
      </p>
    </div>

    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      Admissions Open
    </span>
  </div>

  <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
    <p className="text-sm font-medium text-blue-100">
      One Platform. Four Career Programs.
    </p>

    <h3 className="mt-2 text-3xl font-bold tracking-tight">
      Learn. Build. Get Hired.
    </h3>

    <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100">
      Every learner builds real-world projects, learns from industry mentors,
      develops a professional portfolio and graduates with AI-first skills that
      employers value.
    </p>
  </div>

  <div className="mt-4 grid grid-cols-3 gap-3">
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:shadow-md">
      <p className="text-2xl font-bold text-slate-900">4</p>
      <p className="mt-1 text-xs text-slate-500">
        Flagship Programs
      </p>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:shadow-md">
      <p className="text-2xl font-bold text-slate-900">20+</p>
      <p className="mt-1 text-xs text-slate-500">
        Specialized Courses
      </p>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:shadow-md">
      <p className="text-2xl font-bold text-slate-900">AI</p>
      <p className="mt-1 text-xs text-slate-500">
        Integrated Learning
      </p>
    </div>
  </div>
</div>

  {/* Course Cards */}
  <motion.div
    className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
    variants={{
      hidden: {},
      show: {
        transition: {
          staggerChildren: 0.12,
        },
      },
    }}
  >
    {COURSES.map((course, index) => (
      <CourseMockCard
        key={course.title}
        {...course}
        delay={index * 0.35}
        reduceMotion={reduceMotion}
      />
    ))}
  </motion.div>

</CardContent>
</Card>
</motion.div>
  );
}

export function Hero({ className }: HeroProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden border-b border-border",
        className
      )}
    >
     <Container
className="
relative
max-w-7xl
pt-12
pb-20
lg:pt-16
lg:pb-24
"
>
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.12,
                delayChildren: 0.05,
              },
            },
          }}
          className="
          grid
          items-start
          gap-20
          lg:grid-cols-[1fr_0.95fr]
          "
        >
          <div className="flex flex-col">
            <motion.div variants={fadeUp}>
              <Badge
                variant="secondary"
                className="h-8 rounded-full px-3 text-xs font-medium tracking-tight"
              >
                🇮🇳 India's AI-Powered Career Platform
              </Badge>
            </motion.div>

            <motion.h1
  id="hero-heading"
  variants={fadeUp}
  className="
    mt-6
    max-w-3xl
    text-5xl
    font-black
    tracking-[-0.04em]
    leading-[0.95]
    text-slate-900
    sm:text-6xl
    xl:text-7xl
  "
>
Build Future-Ready

<span className="block bg-gradient-to-r from-blue-700 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
AI Careers for India's Next Generation
</span>

</motion.h1>

<motion.p
  variants={fadeUp}
  className="
    mt-6
   max-w-2xl
    text-lg
    leading-8
    text-slate-600
  "
>
India's modern career platform for students, graduates and professionals. Learn through live mentorship, AI-powered learning, real-world projects, industry certifications and career support designed for tomorrow's workforce.
</motion.p>
<motion.div
  variants={fadeUp}
  className="mt-8 flex flex-wrap gap-4"
>

<Button
size="lg"
className="h-14 rounded-2xl bg-blue-600 px-8 text-white shadow-lg hover:bg-blue-700 transition-all"
    nativeButton={false}
    render={<Link href="/programs" />}
  >
    Explore Programs
    <ArrowRight className="ml-2 h-5 w-5" />
  </Button>

  <Button
    variant="outline"
    size="lg"
    className="h-14 rounded-xl px-8"
    nativeButton={false}
    render={<Link href="/contact" />}
  >
    Schedule Free Consultation
  </Button>
</motion.div>

<motion.div
  variants={fadeUp}
  className="mt-8 flex flex-wrap gap-3"
>
  {TRUST_BADGES.map((badge) => (
    <div
      key={badge}
      className="
        flex
        items-start
        rounded-full
        border
        border-slate-200
        bg-white
        px-4
        py-2
        text-sm
        font-medium
        text-slate-700
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-md
      "
    >
      <span className="mr-2 text-green-600">✓</span>
      {badge}
    </div>
  ))}
</motion.div>

<motion.dl
  variants={fadeUp}
  className="
    mt-12
    grid
    grid-cols-1
    gap-5
    sm:grid-cols-3
  "
>
  {STATS.map((stat) => {
    const Icon = stat.icon;

    return (
      <div
  key={stat.label}
  className="
    rounded-3xl
    border
    border-slate-200
    bg-white
    p-6
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-xl
  "
>
        <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
          <Icon className="h-4 w-4 text-blue-600" />
          {stat.label}
        </dt>

        <dd className="mt-3 text-3xl font-bold text-slate-900">
          {stat.value}
        </dd>
      </div>
    );
  })}
</motion.dl>
        </div>

        <HeroDashboard reduceMotion={reduceMotion} />
      </motion.div>
    </Container>
  </section>
);
}