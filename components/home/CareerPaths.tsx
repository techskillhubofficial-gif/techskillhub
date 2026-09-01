"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Code2,
  Palette,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const programs = [
  {
    title: "GrowthX",
    subtitle: "Become a Business Growth & Digital Marketing Professional",
    icon: Rocket,
    color: "from-emerald-500 to-green-600",
    duration: "9 Months",
    mode: "100% Live Online",

    perfectFor: [
      "Students",
      "Freelancers",
      "Business Owners",
      "Future Entrepreneurs",
    ],

    skills: [
      "Business Communication",
      "Entrepreneurship",
      "Sales Psychology",
      "Digital Marketing",
      "Meta Ads",
      "Google Ads",
      "SEO",
      "Content Strategy",
      "AI Marketing",
      "Automation",
      "Personal Branding",
    ],

    projects: [
      "Launch Marketing Campaigns",
      "Lead Generation Systems",
      "Sales Funnels",
      "Brand Strategies",
      "Client Projects",
    ],

    careers: [
      "Growth Marketer",
      "Performance Marketer",
      "Business Development",
      "Freelancer",
      "Entrepreneur",
    ],
  },

  {
    title: "CodeForge",
    subtitle: "Become an AI Powered Full Stack Engineer",
    icon: Code2,
    color: "from-blue-500 to-indigo-600",
    duration: "9 Months",
    mode: "100% Live Online",

    perfectFor: [
      "Students",
      "Career Switchers",
      "Aspiring Developers",
    ],

    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "MongoDB",
      "Git",
      "GitHub",
      "REST APIs",
      "AI Coding Tools",
    ],

    projects: [
      "Business Website",
      "Portfolio Website",
      "CRM Dashboard",
      "AI Applications",
      "Full Stack Projects",
    ],

    careers: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
    ],
  },

  {
    title: "DesignSphere",
    subtitle: "Become a UI/UX & Brand Designer",
    icon: Palette,
    color: "from-pink-500 to-purple-600",
    duration: "9 Months",
    mode: "100% Live Online",

    perfectFor: [
      "Creative Students",
      "Freelancers",
      "Design Enthusiasts",
    ],

    skills: [
      "UI Design",
      "UX Research",
      "Graphic Design",
      "Brand Identity",
      "Figma",
      "Adobe Photoshop",
      "Illustrator",
      "AI Design Tools",
    ],

    projects: [
      "Website Design",
      "Mobile App Design",
      "Brand Systems",
      "Social Media Creatives",
    ],

    careers: [
      "UI Designer",
      "UX Designer",
      "Graphic Designer",
      "Brand Designer",
    ],
  },

  {
    title: "InsightIQ",
    subtitle: "Become a Data & AI Analyst",
    icon: BarChart3,
    color: "from-orange-500 to-red-500",
    duration: "9 Months",
    mode: "100% Live Online",

    perfectFor: [
      "Students",
      "Working Professionals",
      "Career Switchers",
    ],

    skills: [
      "Excel",
      "SQL",
      "Power BI",
      "Python",
      "Business Intelligence",
      "Generative AI",
    ],

    projects: [
      "Business Dashboards",
      "Automation Reports",
      "Analytics Portfolio",
    ],

    careers: [
      "Data Analyst",
      "Business Analyst",
      "BI Analyst",
    ],
  },
];
export function CareerPaths() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-20 max-w-4xl text-center"
        >
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            🚀 Our Flagship Programs
          </span>

          <h2 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
            Choose The Career You Want To Build
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Industry-focused, AI-powered programs designed to transform beginners
            into confident professionals through live classes, real-world
            projects, mentorship and placement assistance.
          </p>
        </motion.div>

        {/* Program Cards */}

        <div className="grid gap-10 lg:grid-cols-2">
          {programs.map((program, index) => {
            const Icon = program.icon;

            return (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="overflow-hidden rounded-3xl border-0 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                  {/* Header */}

                  <div
                    className={`bg-gradient-to-r ${program.color} p-8 text-white`}
                  >
                    <div className="flex items-center gap-4">

                      <div className="rounded-2xl bg-white/20 p-4">
                        <Icon size={34} />
                      </div>

                      <div>
                        <h3 className="text-3xl font-bold">
                          {program.title}
                        </h3>

                        <p className="mt-2 text-white/90">
                          {program.subtitle}
                        </p>
                      </div>

                    </div>
                  </div>

                  <CardContent className="space-y-8 p-8">

                    {/* Perfect For */}

                    <div>
                      <h4 className="mb-3 text-lg font-semibold">
                        Perfect For
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {program.perfectFor.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-slate-100 px-3 py-2 text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}

                    <div>
                      <h4 className="mb-4 text-lg font-semibold">
                        Skills You'll Master
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        {program.skills.map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2
                              size={18}
                              className="text-green-600"
                            />

                            <span className="text-sm text-slate-700">
                              {skill}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Projects */}

                    <div>
                      <h4 className="mb-4 text-lg font-semibold">
                        Build Real Projects
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {program.projects.map((project) => (
                          <span
                            key={project}
                            className="rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-700"
                          >
                            {project}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Careers */}

                    <div>
                      <h4 className="mb-4 text-lg font-semibold">
                        Career Outcomes
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {program.careers.map((career) => (
                          <span
                            key={career}
                            className="rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                          >
                            {career}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}

                    <div className="flex flex-wrap gap-3 border-t pt-6">

                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
                        ⏱ {program.duration}
                      </span>

                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
                        💻 {program.mode}
                      </span>

                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
                        🎯 Placement Assistance
                      </span>

                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
                        🤖 AI Powered
                      </span>

                    </div>

                    {/* CTA */}

                    <Button
                      size="lg"
                      className="mt-4 w-full rounded-xl"
                    >
                      Book FREE Career Consultation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 rounded-3xl bg-slate-900 px-10 py-16 text-center text-white"
        >
          <h3 className="text-4xl font-bold">
            Not Sure Which Program Is Right For You?
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Speak with one of our career mentors and receive a personalized
            roadmap based on your goals, background, and interests.
          </p>

          <Button
            size="lg"
            className="mt-8 bg-white text-slate-900 hover:bg-slate-200"
          >
            Book FREE Career Consultation
          </Button>
        </motion.div>

      </div>
    </section>
  );
}