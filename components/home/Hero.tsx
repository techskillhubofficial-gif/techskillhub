"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Brain,
  Building2,
  Cloud,
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
    label: "Flagship Programs",
    icon: Users,
  },
  {
    value: "9 Months",
    label: "Live Learning Journey",
    icon: BadgeCheck,
  },
  {
    value: "100%",
    label: "Project Based",
    icon: Building2,
  },
];

const COURSES: {
  title: string;
  description: string;
  progress: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    title: "Full Stack Development",
    description: "Building E-Commerce Website",
    progress: "Week 5 / 36",
    icon: Code2,
    accent: "from-sky-500/15 to-indigo-500/10",
  },
  {
    title: "Data Analytics",
    description: "SQL & Power BI Live Class",
    progress: "Live Today",
    icon: BarChart3,
    accent: "from-emerald-500/15 to-teal-500/10",
  },
  {
    title: "Cloud Computing",
    description: "Deploy Portfolio Project",
    progress: "New Assignment",
    icon: Cloud,
    accent: "from-violet-500/15 to-fuchsia-500/10",
  },
  {
    title: "AI & Machine Learning",
    description: "AI Career Portfolio",
    progress: "Portfolio Ready",
    icon: Brain,
    accent: "from-amber-500/15 to-orange-500/10",
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
            "h-full rounded-2xl border-0 bg-gradient-to-br shadow-lg ring-foreground/8",
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

  <span className="text-[10px] font-medium text-muted-foreground">
    Active
  </span>
</div>
          </CardHeader>
          
          <CardContent className="pt-4">
  <div className="h-px w-full bg-border" />
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
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/8 via-transparent to-muted/60 blur-2xl"
      />

      <Card className="rounded-3xl bg-card/80 py-0 shadow-2xl ring-foreground/10 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b px-5 py-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
          </div>

          <CardTitle className="text-sm font-medium text-muted-foreground">
            Learning Dashboard
          </CardTitle>
        </CardHeader>

  <CardContent className="space-y-5 p-5">

  {/* Dashboard Summary */}
  <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Today's Progress
        </p>

        <h3 className="mt-1 text-xl font-bold">
          CodeForge • Week 5
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Continue building your E-Commerce project.
        </p>
      </div>

      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
        ● LIVE
      </span>
    </div>

    <div className="mt-6">
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-muted-foreground">
          Overall Progress
        </span>

        <span className="font-semibold">
          38%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[38%] rounded-full bg-primary transition-all duration-500" />
      </div>
    </div>

    <div className="mt-6 grid grid-cols-3 gap-3">
      <div className="rounded-xl border bg-background p-3 text-center">
        <p className="text-lg font-bold">18</p>
        <p className="text-xs text-muted-foreground">
          Lessons
        </p>
      </div>

      <div className="rounded-xl border bg-background p-3 text-center">
        <p className="text-lg font-bold">5</p>
        <p className="text-xs text-muted-foreground">
          Projects
        </p>
      </div>

      <div className="rounded-xl border bg-background p-3 text-center">
        <p className="text-lg font-bold">3</p>
        <p className="text-xs text-muted-foreground">
          Certificates
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
      <Container className="flex min-h-[calc(100dvh-5rem)] max-w-[1280px] flex-col justify-center py-16 md:py-20">
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
          className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20"
        >
          <div className="flex flex-col">
            <motion.div variants={fadeUp}>
              <Badge
                variant="secondary"
                className="h-8 rounded-full px-3 text-xs font-medium tracking-tight"
              >
                🚀 AI Powered Learning Platform
              </Badge>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={fadeUp}
              className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
            >
              Launch Your Career With Industry-Led, AI-Powered Learning
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Master in-demand skills through live classes, real business projects,
              1:1 mentorship, AI-powered workflows, and a portfolio that gets you hired.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                className="h-11 px-5"
                nativeButton={false}
                render={<Link href="/Book FREE Career Consultation" />}
              >
                Get Started
                <ArrowRight data-icon="inline-end" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-11 px-5"
                nativeButton={false}
                render={<Link href="/courses" />}
              >
                View Career Programs
              </Button>
            </motion.div>

            <motion.dl
              variants={fadeUp}
              className="mt-10 grid grid-cols-1 gap-6 border-t border-border/80 pt-8 sm:grid-cols-3"
            >
              {STATS.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div key={stat.label} className="min-w-0">
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Icon className="size-4" />
                      {stat.label}
                    </dt>

                    <dd className="mt-2 text-2xl font-bold text-foreground">
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