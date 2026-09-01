import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { Hero } from "@/components/home/Hero";
import { WhyTechSkillHub } from "@/components/home/WhyTechSkillHub";
import { CareerPaths } from "@/components/home/CareerPaths";
import { LearningProcess } from "@/components/home/LearningProcess";

import { FounderMission } from "@/components/home/FounderMission";
import { Founder } from "@/components/home/Founder";

import { WhyDifferent } from "@/components/home/WhyDifferent";
import { Projects } from "@/components/home/Projects";
import { Curriculum } from "@/components/home/Curriculum";

import { FAQ } from "@/components/home/FAQ";
import { Consultation } from "@/components/home/Consultation";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">

        {/* Hero */}
        <Hero />

        {/* Why TechSkill Hub */}
        <WhyTechSkillHub />

        {/* Career Programs */}
        <CareerPaths />

        {/* Learning Journey */}
        <LearningProcess />

        {/* Founder's Vision */}
        <FounderMission />

        {/* Meet The Founders */}
        <Founder />

        {/* Why We're Different */}
        <WhyDifferent />

        {/* Portfolio Projects */}
        <Projects />

        {/* Curriculum */}
        <Curriculum />

        {/* Frequently Asked Questions */}
        <FAQ />

        {/* Final CTA */}
        <Consultation />

      </main>

      <Footer />
    </>
  );
}