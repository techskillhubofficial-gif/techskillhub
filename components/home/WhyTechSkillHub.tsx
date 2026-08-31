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
    title: "Industry Mentors",
    description:
      "Learn directly from experienced software engineers and industry experts.",
    icon: GraduationCap,
  },
  {
    title: "Real Projects",
    description:
      "Build portfolio-worthy applications instead of only watching videos.",
    icon: FolderCode,
  },
  {
    title: "Placement Assistance",
    description: "Resume reviews, mock interviews and hiring support.",
    icon: Briefcase,
  },
  {
    title: "AI Powered Learning",
    description:
      "Receive personalized guidance and learning recommendations.",
    icon: Sparkles,
  },
  {
    title: "Flexible Learning",
    description: "Weekend, evening and self-paced learning options.",
    icon: Clock3,
  },
  {
    title: "Certification",
    description: "Earn certificates after completing practical assessments.",
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
      className={cn("border-b border-border py-16 md:py-24", className)}
    >
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
              Why Choose TechSkill Hub?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Everything you need to become industry-ready in one learning
              platform.
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
                  <Card className="h-full rounded-2xl bg-card py-6 shadow-md ring-foreground/8 transition-shadow duration-300 hover:shadow-xl">
                    <CardHeader className="gap-4">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground shadow-sm ring-1 ring-foreground/8">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription className="text-[0.95rem] leading-relaxed">
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
