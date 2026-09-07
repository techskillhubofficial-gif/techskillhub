"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  Briefcase,
  Clock3,
  FolderCode,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/Container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Live Industry Mentorship",
    description:
      "Learn directly from experienced professionals working in top technology companies through live, interactive classes focused on real-world skills.",
    icon: GraduationCap,
  },
  {
    title: "Real Client Projects",
    description:
      "Build production-ready applications, solve real business challenges, and create an impressive portfolio that demonstrates your practical expertise.",
    icon: FolderCode,
  },
  {
    title: "Career Acceleration",
    description:
      "Receive personalized career guidance, resume reviews, mock interviews, internship opportunities, and dedicated placement assistance to help you secure your dream job.",
    icon: Briefcase,
  },
  {
    title: "AI-Powered Learning Experience",
    description:
      "Accelerate your learning with our AI Mentor, personalized study recommendations, coding assistance, and intelligent career guidance available whenever you need it.",
    icon: Sparkles,
  },
  {
    title: "Flexible Learning",
    description:
      "Attend live weekend or evening batches, revisit recorded sessions anytime, and learn at your own pace without compromising your education or career.",
    icon: Clock3,
  },
  {
    title: "Industry Certifications",
    description:
      "Graduate with recognized certifications, completed industry projects, and a professional portfolio that showcases your skills to recruiters and employers.",
    icon: Award,
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

type WhyTechSkillHubProps = {
  className?: string;
};

export function WhyTechSkillHub({ className }: WhyTechSkillHubProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      aria-labelledby="why-heading"
      className={cn(
        "relative overflow-hidden border-b border-slate-200 bg-slate-50 py-20 md:py-28",
        className
      )}
    >
      {/* Background Glow */}
<div className="pointer-events-none absolute inset-0">
  <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
  <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-100/30 blur-3xl" />
</div>

      <Container>
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.08, delayChildren: 0.04 },
            },
          }}
        >
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <h2
              id="why-heading"
              className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            >
              Why Students & Institutes Choose TechSkill Hub
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            TechSkillHub combines live expert-led training, AI-powered learning, real-world projects, mentorship, internships, career guidance, and industry-recognized certifications into one comprehensive platform helping students and professionals become confident, skilled, and job-ready.TechSkill Hub combines live industry mentorship, AI-powered learning,
real-world projects, internships, career guidance, placement support,
and recognized certifications to help learners become truly job-ready.
            </p>
          </motion.div>

          <motion.ul
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6"
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.li
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={reduceMotion ? undefined : { y: -6 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="h-full"
                >
<Card className="group h-full rounded-3xl border border-slate-200 bg-white py-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl">                    <CardHeader className="gap-4">
<div className="flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-7 text-slate-600">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.li>
              );
            })}
          </motion.ul>
        </motion.div>
      </Container>
    </section>
  );
}
