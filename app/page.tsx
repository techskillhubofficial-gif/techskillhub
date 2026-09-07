import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { Hero } from "@/components/home/Hero";
import { CareerPaths } from "@/components/home/CareerPaths";
import { WhyTechSkillHub } from "@/components/home/WhyTechSkillHub";
import { LearningProcess } from "@/components/home/LearningProcess";
import { Projects } from "@/components/home/Projects";
import { Curriculum } from "@/components/home/Curriculum";
import { WhyDifferent } from "@/components/home/WhyDifferent";
import { FounderMission } from "@/components/home/FounderMission";
import { Founder } from "@/components/home/Founder";
import { Consultation } from "@/components/home/Consultation";
import { FAQ } from "@/components/home/FAQ";

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex min-h-screen flex-col overflow-x-hidden bg-white">

        {/* Hero Section */}
        <Hero />

        {/* Career Programs */}
        <CareerPaths />

        {/* Why Choose TechSkill Hub */}
        <WhyTechSkillHub />

        {/* Learning Journey */}
        <LearningProcess />

        {/* Real Projects */}
        <Projects />

        {/* Curriculum */}
        <Curriculum />

        {/* Why We're Different */}
        <WhyDifferent />

        {/* Founder's Vision */}
        <FounderMission />

        {/* Meet the Founder */}
        <Founder />

        {/* Final Call To Action */}
        <Consultation />

        {/* Frequently Asked Questions */}
        <FAQ />

      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}